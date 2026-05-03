"""
Test: leave · LeaveAccrualStrategy implementations
Type: Integration (real Postgres for monthly cap query)
Why:  연차 부여 룰은 회사마다 달라질 수 있어 Strategy 로 격리. 룰이 깨지면
      월차/연차 부여가 전사적으로 잘못 입력되어 분쟁 + 환불 이슈가 된다.
      신규 채용 후 1년 미만 / 1년 이상 / 3년 이상 케이스 분기 회귀 보호.
Covers:
  - KoreanLaborLawStrategy.accrue() — 입사 1년 미만 월차 부여 + 캡(11일)
  - 1년 이상: 연 15일 + 3년차부터 가산 + 최대 25일
  - 채용 전 시점은 빈 리스트 반환
  - FlatAccrualStrategy.accrue() — 단순 N일 / M개월 만료 룰
  - get_strategy(policy) 가 rules_json["strategy"] 로 선택; 잘못된 값은 default
Out of scope:
  - tasks.grant_monthly() persistence (test_leave.py 가 다룸)
Coverage target: ≥ 90% for apps/leave/strategies.py
"""
from __future__ import annotations

from datetime import date
from decimal import Decimal

import pytest

from apps.leave import services as leave_services
from apps.leave.models import LeaveBalance, LeavePolicy
from apps.leave.strategies import (
    FlatAccrualStrategy,
    KoreanLaborLawStrategy,
    get_strategy,
)
from tests.factories import CompanyFactory, MembershipFactory

pytestmark = pytest.mark.django_db


# ----------------------------------------------------------------------
# KoreanLaborLawStrategy
# ----------------------------------------------------------------------


def _policy(company) -> LeavePolicy:
    return leave_services.get_or_create_default_policy(company)


def test_korean_strategy_under_one_year_grants_one_day():
    # Arrange — hired 3 months ago
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2026, 2, 1))
    pol = _policy(company)
    strat = KoreanLaborLawStrategy()
    # Act
    grants = strat.accrue(m, date(2026, 5, 1), pol)
    # Assert
    assert len(grants) == 1
    assert grants[0].days == Decimal("1")
    assert grants[0].note.startswith("monthly:")


def test_korean_strategy_caps_monthly_at_eleven():
    # Arrange — already 11 monthly grants on file
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2025, 6, 1))
    pol = _policy(company)
    for i in range(11):
        LeaveBalance.objects.create(
            company=company, membership=m,
            kind=LeaveBalance.Kind.GRANTED, days=Decimal("1"),
            granted_at=date(2025, 6, 1), expires_at=date(2026, 6, 1),
            note=f"monthly:slot-{i}",
        )
    strat = KoreanLaborLawStrategy()
    # Act
    grants = strat.accrue(m, date(2026, 4, 1), pol)
    # Assert — cap reached, no further monthly grant.
    assert grants == []


def test_korean_strategy_one_year_grants_fifteen():
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2024, 1, 1))
    pol = _policy(company)
    grants = KoreanLaborLawStrategy().accrue(m, date(2026, 1, 1), pol)
    assert len(grants) == 1
    assert grants[0].days == Decimal("15")


def test_korean_strategy_three_years_adds_one_extra_day():
    # Arrange — hired ~3 years ago
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2023, 1, 1))
    pol = _policy(company)
    # Act
    grants = KoreanLaborLawStrategy().accrue(m, date(2026, 1, 1), pol)
    # Assert
    # tenure_months = 36 → years_completed = 3 → extra = (3-1)//2 = 1 → 15+1=16
    assert grants[0].days == Decimal("16")


def test_korean_strategy_caps_at_max_days():
    # Arrange — hired ≥ 25 years ago, big tenure
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(1990, 1, 1))
    pol = _policy(company)
    # Act
    grants = KoreanLaborLawStrategy().accrue(m, date(2026, 1, 1), pol)
    # Assert
    assert grants[0].days == Decimal("25")


def test_korean_strategy_before_hire_returns_empty():
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2030, 1, 1))
    pol = _policy(company)
    grants = KoreanLaborLawStrategy().accrue(m, date(2026, 5, 1), pol)
    assert grants == []


# ----------------------------------------------------------------------
# FlatAccrualStrategy
# ----------------------------------------------------------------------


def test_flat_strategy_grants_constructor_value():
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2024, 1, 1))
    pol = _policy(company)
    grants = FlatAccrualStrategy(annual_days=12, expiry_months=6).accrue(
        m, date(2026, 1, 1), pol
    )
    assert len(grants) == 1
    assert grants[0].days == Decimal("12")
    assert grants[0].note == "flat:2026"


def test_flat_strategy_overrides_via_rules_json():
    # Arrange — policy.rules_json overrides constructor defaults.
    company = CompanyFactory()
    m = MembershipFactory(company=company, hired_at=date(2024, 1, 1))
    pol = LeavePolicy.objects.create(
        company=company, effective_from=date(2024, 1, 1),
        rules_json={"strategy": "flat", "annual_days": 7, "expiry_months": 3},
        expiry_months=12, notify_days_before=[7],
    )
    # Act
    grants = FlatAccrualStrategy().accrue(m, date(2026, 1, 1), pol)
    # Assert — rules_json wins over constructor default of 12.
    assert grants[0].days == Decimal("7")


# ----------------------------------------------------------------------
# Registry
# ----------------------------------------------------------------------


def test_registry_default_is_korean_labor_law():
    company = CompanyFactory()
    pol = _policy(company)  # rules_json doesn't set "strategy"
    assert isinstance(get_strategy(pol), KoreanLaborLawStrategy)


def test_registry_picks_flat_when_named():
    company = CompanyFactory()
    pol = LeavePolicy.objects.create(
        company=company, effective_from=date(2024, 1, 1),
        rules_json={"strategy": "flat"}, expiry_months=12,
        notify_days_before=[7],
    )
    assert isinstance(get_strategy(pol), FlatAccrualStrategy)


def test_registry_unknown_strategy_falls_back_to_default():
    company = CompanyFactory()
    pol = LeavePolicy.objects.create(
        company=company, effective_from=date(2024, 1, 1),
        rules_json={"strategy": "doesnt_exist"}, expiry_months=12,
        notify_days_before=[7],
    )
    assert isinstance(get_strategy(pol), KoreanLaborLawStrategy)
