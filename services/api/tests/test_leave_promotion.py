"""
Test: 연차 사용 촉진 (근로기준법 §61 자동화)
Type: Integration (real Postgres, Celery eager via test settings, freezegun)
Why:  feature-spec §5.2 — 회사가 사용 촉진 제도를 켜면 회계연도 종료
      6개월/2개월 전에 잔여 연차가 있는 직원에게 정식 안내가 발송돼야
      한다. 미발송 시 회사는 미사용 연차에 대한 임금 지급 의무가
      유지되므로 (근로기준법 §61) 컴플라이언스 회귀 보호 핵심.
Covers:
  - Company.leave_promotion_enabled=False → 0 row, 0 notification
  - 6개월 전 (FIRST) + 잔여>0 → LeavePromotionLog FIRST 1행 + LEAVE_PROMOTION_FIRST 알림
  - 2개월 전 (SECOND) + FIRST 발송 이력 + 잔여>0 → SECOND 1행
  - SECOND 시점에 FIRST 이력 없으면 발송 안함
  - 잔여 = 0 이면 발송 안함
  - 동일 일자 task 재실행 → UNIQUE 제약으로 0건 추가 (멱등성)
Out of scope:
  - 알림 채널 별 실제 발송 (test_notification_providers.py 가 다룸)
  - LeaveBalance 부여/소멸 룰 (test_leave.py 가 다룸)
Coverage target: ≥ 90% lines for promote_unused_leave + pending_promotion_targets + record_promotion
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

import pytest
from freezegun import freeze_time

from apps.leave import services as leave_services
from apps.leave import tasks as leave_tasks
from apps.leave.models import LeaveBalance, LeavePromotionLog
from apps.notification.models import NotificationLog

from tests.factories import CompanyFactory, MembershipFactory, UserFactory

pytestmark = pytest.mark.django_db


# Helper — fiscal_year_start matches CompanyFactory default (2026-01-01) so
# fiscal_year_end == 2026-12-31. The FIRST reminder fires 183 days before
# (2026-07-01) and SECOND fires 61 days before (2026-10-31).
FIRST_REMINDER_DATE = "2026-07-01"
SECOND_REMINDER_DATE = "2026-10-31"
FISCAL_END = date(2026, 12, 31)


def _grant_remaining(membership, days: Decimal) -> LeaveBalance:
    """Create a single GRANTED row that gives ``membership`` ``days`` remaining."""
    return LeaveBalance.objects.create(
        company=membership.company,
        membership=membership,
        kind=LeaveBalance.Kind.GRANTED,
        days=days,
        granted_at=date(2026, 1, 1),
        expires_at=FISCAL_END,
        note="seed:annual",
    )


@pytest.fixture
def opted_in_company():
    return CompanyFactory(
        fiscal_year_start=date(2026, 1, 1),
        leave_promotion_enabled=True,
    )


@pytest.fixture
def opted_out_company():
    return CompanyFactory(
        fiscal_year_start=date(2026, 1, 1),
        leave_promotion_enabled=False,
    )


@pytest.fixture
def employee_with_balance(opted_in_company):
    user = UserFactory()
    m = MembershipFactory(company=opted_in_company, user=user)
    _grant_remaining(m, Decimal("10.00"))
    return m


# ---------- Opt-in gating ----------

def test_disabled_company_produces_no_promotions(opted_out_company):
    """opt-in OFF 인 회사는 사용 촉진 발송이 발생하지 않는다.

    이유: 사용 촉진 제도는 회사 정책 선택사항. 켜지 않은 회사에 강제
    발송하면 사용자에게 혼란이 된다.
    """
    # Arrange
    user = UserFactory()
    member = MembershipFactory(company=opted_out_company, user=user)
    _grant_remaining(member, Decimal("5.00"))

    # Act
    with freeze_time(FIRST_REMINDER_DATE):
        created = leave_tasks.promote_unused_leave()

    # Assert
    assert created == 0
    assert LeavePromotionLog.objects.count() == 0
    assert not NotificationLog.objects.filter(
        event_kind__startswith="LEAVE_PROMOTION_"
    ).exists()


# ---------- FIRST reminder ----------

def test_first_reminder_at_six_months_before_fiscal_end(employee_with_balance):
    """6개월 전 + 잔여 > 0 → FIRST 로그 1행 + LEAVE_PROMOTION_FIRST 알림."""
    # Act
    with freeze_time(FIRST_REMINDER_DATE):
        created = leave_tasks.promote_unused_leave()

    # Assert
    assert created == 1
    log = LeavePromotionLog.objects.get(membership=employee_with_balance)
    assert log.kind == LeavePromotionLog.Kind.FIRST
    assert log.fiscal_end_date == FISCAL_END
    assert log.days_remaining == Decimal("10.00")

    notif = NotificationLog.objects.filter(
        membership=employee_with_balance, event_kind="LEAVE_PROMOTION_FIRST"
    ).first()
    assert notif is not None


# ---------- SECOND reminder ----------

def test_second_reminder_requires_first_and_remaining_balance(employee_with_balance):
    """2개월 전 + FIRST 발송 이력 + 잔여 > 0 → SECOND 1행 추가."""
    # Arrange — pre-seed the FIRST log row to simulate prior reminder.
    LeavePromotionLog.objects.create(
        company=employee_with_balance.company,
        membership=employee_with_balance,
        fiscal_end_date=FISCAL_END,
        kind=LeavePromotionLog.Kind.FIRST,
        days_remaining=Decimal("10.00"),
    )

    # Act
    with freeze_time(SECOND_REMINDER_DATE):
        created = leave_tasks.promote_unused_leave()

    # Assert
    assert created == 1
    second = LeavePromotionLog.objects.get(
        membership=employee_with_balance,
        kind=LeavePromotionLog.Kind.SECOND,
    )
    assert second.fiscal_end_date == FISCAL_END
    notif = NotificationLog.objects.filter(
        membership=employee_with_balance, event_kind="LEAVE_PROMOTION_SECOND"
    ).first()
    assert notif is not None


def test_second_skipped_when_first_was_never_issued(employee_with_balance):
    """FIRST 이력이 없으면 SECOND 도 발송되지 않는다.

    이유: 근로기준법 §61 절차상 1차 안내 후 2차 안내 순서를 지켜야 한다.
    """
    # Act — only run on SECOND date, no FIRST log row in DB.
    with freeze_time(SECOND_REMINDER_DATE):
        created = leave_tasks.promote_unused_leave()

    # Assert
    assert created == 0
    assert LeavePromotionLog.objects.count() == 0


# ---------- Zero balance ----------

def test_zero_balance_produces_no_reminder(opted_in_company):
    """잔여 연차 = 0 이면 사용 촉진 안내가 발송되지 않는다."""
    # Arrange — granted = used so remaining is 0.
    user = UserFactory()
    member = MembershipFactory(company=opted_in_company, user=user)
    _grant_remaining(member, Decimal("3.00"))
    LeaveBalance.objects.create(
        company=opted_in_company,
        membership=member,
        kind=LeaveBalance.Kind.USED,
        days=Decimal("3.00"),
        granted_at=date(2026, 6, 1),
    )

    # Act
    with freeze_time(FIRST_REMINDER_DATE):
        created = leave_tasks.promote_unused_leave()

    # Assert
    assert created == 0
    assert LeavePromotionLog.objects.count() == 0


# ---------- Idempotency ----------

def test_rerun_same_day_produces_no_duplicate_rows(employee_with_balance):
    """동일 날 task 재실행 → UNIQUE 제약으로 0건 추가.

    이유: Celery beat 가 일시적 장애 후 재시도하거나 운영자가 수동
    실행해도 동일 (membership, fiscal_end_date, kind) 에 두 행이
    생기면 사용자에게 동일 알림이 두 번 가게 된다.
    """
    # Arrange — first run creates the FIRST log + notification.
    with freeze_time(FIRST_REMINDER_DATE):
        first_run = leave_tasks.promote_unused_leave()
    assert first_run == 1
    notif_count_after_first = NotificationLog.objects.filter(
        membership=employee_with_balance, event_kind="LEAVE_PROMOTION_FIRST"
    ).count()

    # Act — second run on the SAME logical date.
    with freeze_time(FIRST_REMINDER_DATE):
        second_run = leave_tasks.promote_unused_leave()

    # Assert
    assert second_run == 0
    assert (
        LeavePromotionLog.objects.filter(membership=employee_with_balance).count()
        == 1
    )
    assert (
        NotificationLog.objects.filter(
            membership=employee_with_balance,
            event_kind="LEAVE_PROMOTION_FIRST",
        ).count()
        == notif_count_after_first
    )


# ---------- Service-layer pure helper ----------

def test_pending_targets_returns_empty_outside_window(opted_in_company):
    """6개월/2개월 전이 아닌 임의 날짜에는 pending 대상 0건."""
    user = UserFactory()
    member = MembershipFactory(company=opted_in_company, user=user)
    _grant_remaining(member, Decimal("4.00"))
    targets = leave_services.pending_promotion_targets(
        opted_in_company, date(2026, 8, 15)
    )
    assert targets == []
