"""Leave accrual strategies — Strategy pattern.

Companies can plug in alternative accrual rules without touching the service
layer. The default is :class:`KoreanLaborLawStrategy` (포팅 of the original
``apply_grant_rules`` logic). :class:`FlatAccrualStrategy` is a simple
"give N days per year, expire after M months" rule for companies that don't
need the labor-law tiering.

Selection happens via ``LeavePolicy.rules_json["strategy"]``; default is
``"korean_labor_law"``. Unknown strategy names fall back to the default with
no error so a malformed policy never blocks the daily batches.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Callable

from apps.identity.models import Membership

from .models import LeaveBalance, LeavePolicy

ZERO = Decimal("0")
ONE_DAY = Decimal("1")


@dataclass
class BalanceCreate:
    """Mirror of services.BalanceCreate to avoid import cycles.

    Strategies emit these; the service layer materialises them as DB rows.
    """

    membership: Membership
    days: Decimal
    granted_at: date
    expires_at: date | None
    note: str = ""


def _add_months(d: date, months: int) -> date:
    """Add *months* to *d* clamping to the last day of the resulting month."""
    y = d.year + (d.month - 1 + months) // 12
    m = (d.month - 1 + months) % 12 + 1
    if m == 12:
        next_first = date(y + 1, 1, 1)
    else:
        next_first = date(y, m + 1, 1)
    last_day = (next_first - timedelta(days=1)).day
    return date(y, m, min(d.day, last_day))


# ---------------------------------------------------------------------------
# Abstract base
# ---------------------------------------------------------------------------


class LeaveAccrualStrategy(ABC):
    """Pluggable rule set for ``apply_grant_rules``.

    Implementations are pure: no DB writes, only reads. The service layer
    enforces idempotency by checking for prior grant rows with the same
    ``note`` key before persisting.
    """

    @abstractmethod
    def accrue(
        self, membership: Membership, as_of: date, policy: LeavePolicy
    ) -> list[BalanceCreate]:
        ...


# ---------------------------------------------------------------------------
# Strategy: Korean labor law (default)
# ---------------------------------------------------------------------------


KOREAN_LABOR_LAW_DEFAULTS = {
    "month_until_year": 11,
    "annual_base": 15,
    "annual_step_years": 2,
    "annual_max": 25,
    "fiscal_basis": "FISCAL",
}


class KoreanLaborLawStrategy(LeaveAccrualStrategy):
    """근로기준법 §60 baseline.

    - 입사 1년 미만: 매월 만근 시 1일 (최대 ``month_until_year`` 일)
    - 입사 1년 이상: 매년 ``annual_base`` 일 + 2년마다 1일 가산 (최대 ``annual_max`` 일)
    """

    def accrue(
        self, membership: Membership, as_of: date, policy: LeavePolicy
    ) -> list[BalanceCreate]:
        rules = dict(KOREAN_LABOR_LAW_DEFAULTS)
        rules.update(policy.rules_json or {})

        hired = membership.hired_at
        if hired is None or as_of < hired:
            return []

        expiry_months = int(policy.expiry_months or 12)
        expires_at = _add_months(as_of, expiry_months)

        # tenure in whole months (clamped at the day-of-month boundary)
        tenure_months = (as_of.year - hired.year) * 12 + (as_of.month - hired.month)
        if as_of.day < hired.day:
            tenure_months -= 1

        grants: list[BalanceCreate] = []

        if tenure_months < 12:
            if tenure_months >= 1:
                cap = int(rules["month_until_year"])
                already = LeaveBalance.objects.filter(
                    membership=membership,
                    kind=LeaveBalance.Kind.GRANTED,
                    note__startswith="monthly:",
                ).count()
                if already < cap:
                    grants.append(
                        BalanceCreate(
                            membership=membership,
                            days=ONE_DAY,
                            granted_at=as_of,
                            expires_at=expires_at,
                            note=f"monthly:{as_of.isoformat()}",
                        )
                    )
        else:
            years_completed = tenure_months // 12
            base = int(rules["annual_base"])
            step_years = int(rules["annual_step_years"])
            max_days = int(rules["annual_max"])

            extra = 0
            if years_completed >= 3:
                extra = (years_completed - 1) // step_years
            days = min(base + extra, max_days)
            grants.append(
                BalanceCreate(
                    membership=membership,
                    days=Decimal(days),
                    granted_at=as_of,
                    expires_at=expires_at,
                    note=f"annual:{as_of.year}",
                )
            )
        return grants


# ---------------------------------------------------------------------------
# Strategy: Flat
# ---------------------------------------------------------------------------


class FlatAccrualStrategy(LeaveAccrualStrategy):
    """Simple "N days per year, expire after M months" rule.

    Useful for companies with custom (non-statutory) leave policies.
    Configurable via constructor or via ``policy.rules_json``:

        rules_json = {
          "strategy": "flat",
          "annual_days": 12,
          "expiry_months": 6,
        }

    The grant fires once per calendar year (annual block). The note key is
    ``"flat:<year>"`` which the caller uses to enforce idempotency.
    """

    def __init__(self, annual_days: int = 12, expiry_months: int | None = None) -> None:
        self.annual_days = int(annual_days)
        self.expiry_months = expiry_months

    def accrue(
        self, membership: Membership, as_of: date, policy: LeavePolicy
    ) -> list[BalanceCreate]:
        rules = dict(policy.rules_json or {})
        annual_days = int(rules.get("annual_days", self.annual_days))
        expiry_months = int(
            rules.get("expiry_months", self.expiry_months or policy.expiry_months or 12)
        )

        hired = membership.hired_at
        if hired is None or as_of < hired:
            return []

        return [
            BalanceCreate(
                membership=membership,
                days=Decimal(annual_days),
                granted_at=as_of,
                expires_at=_add_months(as_of, expiry_months),
                note=f"flat:{as_of.year}",
            )
        ]


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------


_REGISTRY: dict[str, Callable[[], LeaveAccrualStrategy]] = {
    "korean_labor_law": KoreanLaborLawStrategy,
    "flat": FlatAccrualStrategy,
}


def get_strategy(policy: LeavePolicy) -> LeaveAccrualStrategy:
    """Resolve a strategy from ``policy.rules_json["strategy"]``.

    Unknown strategy names silently fall back to ``korean_labor_law`` so a
    malformed policy never blocks the daily batches.
    """
    name = "korean_labor_law"
    if isinstance(policy.rules_json, dict):
        candidate = policy.rules_json.get("strategy")
        if isinstance(candidate, str) and candidate in _REGISTRY:
            name = candidate
    return _REGISTRY[name]()


def register_strategy(name: str, factory: Callable[[], LeaveAccrualStrategy]) -> None:
    """Hook for plugins / tests to add custom strategies."""
    _REGISTRY[name] = factory


__all__ = [
    "BalanceCreate",
    "LeaveAccrualStrategy",
    "KoreanLaborLawStrategy",
    "FlatAccrualStrategy",
    "get_strategy",
    "register_strategy",
]
