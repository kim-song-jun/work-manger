"""
Test: leave · BalanceRepository
Type: Integration (real Postgres aggregations)
Why:  잔여 / 만료 임박 계산이 흩어져 있으면 Service 와 Task 가 동일 룰을
      따로 구현하다가 어긋난다. Repository 가 단일 진실원이 되도록 회귀 보호.
      특히 expires_at 경계(=today, today+30 등)는 off-by-one 위험 영역.
Covers:
  - compute_for() — granted/used/expired/adjusted 합산 + remaining 식
  - 만료된 GRANTED 는 granted_total 에서 제외
  - expiring_soon — today + delta 정확히 일치하는 행 반환
  - 경계: before_days=0 → 오늘 만료, before_days=7 → 7일 후 만료
  - 다른 membership 행은 누설되지 않음
Out of scope:
  - notify_expiring 알림 발송 (test_notification.py / test_leave.py 가 다룸)
Coverage target: ≥ 95% for apps/leave/repositories.py
"""
from __future__ import annotations

from datetime import date, timedelta
from decimal import Decimal

import pytest

from apps.leave.models import LeaveBalance
from apps.leave.repositories import BalanceRepository
from tests.factories import CompanyFactory, MembershipFactory

pytestmark = pytest.mark.django_db


def _grant(company, m, days, expires_at, note=""):
    return LeaveBalance.objects.create(
        company=company, membership=m,
        kind=LeaveBalance.Kind.GRANTED,
        days=Decimal(str(days)), granted_at=date(2026, 1, 1),
        expires_at=expires_at, note=note,
    )


def _used(company, m, days):
    return LeaveBalance.objects.create(
        company=company, membership=m,
        kind=LeaveBalance.Kind.USED, days=Decimal(str(days)),
        granted_at=date(2026, 3, 1),
    )


def _adjusted(company, m, days):
    return LeaveBalance.objects.create(
        company=company, membership=m,
        kind=LeaveBalance.Kind.ADJUSTED, days=Decimal(str(days)),
        granted_at=date(2026, 3, 1),
    )


# ----------------------------------------------------------------------
# compute_for
# ----------------------------------------------------------------------


def test_compute_for_aggregates_each_kind():
    # Arrange
    company = CompanyFactory()
    m = MembershipFactory(company=company)
    today = date(2026, 5, 4)
    _grant(company, m, "15", date(2026, 12, 31))
    _grant(company, m, "3", date(2025, 12, 31))  # past expiry → excluded
    _used(company, m, "4")
    _adjusted(company, m, "1")

    # Act
    snap = BalanceRepository.compute_for(m, as_of=today)

    # Assert
    assert snap.granted_total == Decimal("15")
    assert snap.used == Decimal("4")
    assert snap.remaining == Decimal("12")  # 15 - 4 + 1
    assert snap.adjusted == Decimal("1")


def test_compute_for_includes_only_window_in_expiring_soon():
    # Arrange — one row inside 60d window, one outside
    company = CompanyFactory()
    m = MembershipFactory(company=company)
    today = date(2026, 5, 4)
    _grant(company, m, "5", today + timedelta(days=30))   # in window
    _grant(company, m, "7", today + timedelta(days=120))  # outside window

    # Act
    snap = BalanceRepository.compute_for(m, as_of=today)

    # Assert — only the 30d-out row appears.
    assert len(snap.expiring_soon) == 1
    assert snap.expiring_soon[0]["days"] == Decimal("5")


def test_compute_for_filters_by_membership():
    # Arrange — two memberships, only one has data
    company = CompanyFactory()
    m1 = MembershipFactory(company=company)
    m2 = MembershipFactory(company=company)
    _grant(company, m1, "10", date(2026, 12, 31))

    # Act
    snap1 = BalanceRepository.compute_for(m1, as_of=date(2026, 5, 4))
    snap2 = BalanceRepository.compute_for(m2, as_of=date(2026, 5, 4))

    # Assert
    assert snap1.granted_total == Decimal("10")
    assert snap2.granted_total == Decimal("0")
    assert snap2.remaining == Decimal("0")


# ----------------------------------------------------------------------
# expiring_soon
# ----------------------------------------------------------------------


def test_expiring_soon_matches_exact_offset_day():
    # Arrange — three rows, only the +7 day one should match before_days=7.
    company = CompanyFactory()
    m = MembershipFactory(company=company)
    today = date(2026, 5, 4)
    _grant(company, m, "1", today + timedelta(days=7))
    _grant(company, m, "2", today + timedelta(days=8))
    _grant(company, m, "3", today + timedelta(days=14))

    # Act
    rows = BalanceRepository.expiring_soon(m, before_days=7, as_of=today)

    # Assert
    assert len(rows) == 1
    assert rows[0].days == Decimal("1")


def test_expiring_soon_today_edge_case():
    # Arrange — row expiring exactly today; before_days=0 must still match.
    company = CompanyFactory()
    m = MembershipFactory(company=company)
    today = date(2026, 5, 4)
    _grant(company, m, "2", today)

    # Act
    rows = BalanceRepository.expiring_soon(m, before_days=0, as_of=today)

    # Assert
    assert len(rows) == 1
    assert rows[0].expires_at == today


def test_expiring_soon_isolates_other_memberships():
    # Arrange
    company = CompanyFactory()
    m1 = MembershipFactory(company=company)
    m2 = MembershipFactory(company=company)
    today = date(2026, 5, 4)
    _grant(company, m1, "1", today + timedelta(days=14))
    _grant(company, m2, "9", today + timedelta(days=14))

    # Act
    rows = BalanceRepository.expiring_soon(m1, before_days=14, as_of=today)

    # Assert
    assert len(rows) == 1
    assert rows[0].days == Decimal("1")
