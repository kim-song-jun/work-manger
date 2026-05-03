"""Pure-function business logic for the Leave domain.

All date arithmetic uses :mod:`datetime` types; quantities use :class:`decimal.Decimal`.
Side effects are limited to small, well-named persistence helpers used by views/tasks.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable

from django.db import transaction
from django.db.models import Q, Sum
from django.utils import timezone as django_tz

from apps.approval.models import ApprovalTask
from apps.identity.models import Membership

from .models import LeaveBalance, LeavePolicy, LeaveRequest

ZERO = Decimal("0")
ONE_DAY = Decimal("1")
HALF_DAY = Decimal("0.5")

DEFAULT_RULES = {
    "month_until_year": 11,
    "annual_base": 15,
    "annual_step_years": 2,
    "annual_max": 25,
    "fiscal_basis": "FISCAL",
}
DEFAULT_NOTIFY_DAYS = [30, 14, 7, 1]


# ---------------------------------------------------------------------------
# Policy
# ---------------------------------------------------------------------------


def get_or_create_default_policy(company) -> LeavePolicy:
    """Idempotently return the active leave policy for *company*.

    If none exists, a policy is created using the spec defaults
    (Korean labor law ``근로기준법 §60``).
    """
    policy = (
        LeavePolicy.objects.filter(company=company)
        .order_by("-effective_from", "-created_at")
        .first()
    )
    if policy is not None:
        return policy
    return LeavePolicy.objects.create(
        company=company,
        effective_from=date(1970, 1, 1),
        rules_json=dict(DEFAULT_RULES),
        expiry_months=12,
        notify_days_before=list(DEFAULT_NOTIFY_DAYS),
    )


def _rules(policy: LeavePolicy) -> dict:
    rules = dict(DEFAULT_RULES)
    rules.update(policy.rules_json or {})
    return rules


# ---------------------------------------------------------------------------
# Balance computation
# ---------------------------------------------------------------------------


@dataclass
class ExpiringSoon:
    days: Decimal
    expires_at: date


def _decimal_sum(qs) -> Decimal:
    val = qs.aggregate(s=Sum("days"))["s"]
    return Decimal(val) if val is not None else ZERO


def compute_balance(membership: Membership, as_of: date | None = None) -> dict:
    """Return ``{granted_total, used, remaining, expiring_soon[]}`` for membership.

    ``granted_total`` excludes rows already past their ``expires_at``.
    """
    today = as_of or django_tz.localdate()
    qs = LeaveBalance.objects.filter(membership=membership)

    granted_active_q = Q(kind=LeaveBalance.Kind.GRANTED) & (
        Q(expires_at__isnull=True) | Q(expires_at__gte=today)
    )
    granted_total = _decimal_sum(qs.filter(granted_active_q))
    used = _decimal_sum(qs.filter(kind=LeaveBalance.Kind.USED))
    expired = _decimal_sum(qs.filter(kind=LeaveBalance.Kind.EXPIRED))
    adjusted = _decimal_sum(qs.filter(kind=LeaveBalance.Kind.ADJUSTED))

    remaining = granted_total - used - expired + adjusted

    soon_window = today + timedelta(days=60)
    soon_rows = (
        qs.filter(
            kind=LeaveBalance.Kind.GRANTED,
            expires_at__isnull=False,
            expires_at__gte=today,
            expires_at__lte=soon_window,
        )
        .order_by("expires_at")
        .values("days", "expires_at")
    )
    expiring_soon = [
        {"days": Decimal(r["days"]), "expires_at": r["expires_at"]}
        for r in soon_rows
    ]

    return {
        "granted_total": granted_total,
        "used": used,
        "remaining": remaining,
        "expiring_soon": expiring_soon,
    }


# ---------------------------------------------------------------------------
# Grant rules
# ---------------------------------------------------------------------------


@dataclass
class BalanceCreate:
    membership: Membership
    days: Decimal
    granted_at: date
    expires_at: date | None
    note: str = ""


def _add_months(d: date, months: int) -> date:
    """Add *months* to *d* clamping to the last day of the resulting month."""
    y = d.year + (d.month - 1 + months) // 12
    m = (d.month - 1 + months) % 12 + 1
    # Determine last day of (y, m)
    if m == 12:
        next_first = date(y + 1, 1, 1)
    else:
        next_first = date(y, m + 1, 1)
    last_day = (next_first - timedelta(days=1)).day
    return date(y, m, min(d.day, last_day))


def apply_grant_rules(
    membership: Membership, as_of: date, policy: LeavePolicy
) -> list[BalanceCreate]:
    """Compute grants for *membership* on *as_of* under *policy*.

    Returns a list (possibly empty) of :class:`BalanceCreate` records describing
    what should be inserted as ``GRANTED`` :class:`LeaveBalance` rows.
    Pure function — does not write to the database. Idempotency is enforced
    by callers checking for an existing grant on the same calendar period.
    """
    rules = _rules(policy)
    hired = membership.hired_at
    if hired is None or as_of < hired:
        return []

    expiry_months = int(policy.expiry_months or 12)
    expires_at = _add_months(as_of, expiry_months)

    # Tenure in whole months from hired_at to as_of
    tenure_months = (as_of.year - hired.year) * 12 + (as_of.month - hired.month)
    if as_of.day < hired.day:
        tenure_months -= 1

    grants: list[BalanceCreate] = []

    if tenure_months < 12:
        # Monthly accrual under 1년 미만 (max month_until_year days).
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
        # Annual block — base + step.
        years_completed = tenure_months // 12
        base = int(rules["annual_base"])
        step_years = int(rules["annual_step_years"])
        max_days = int(rules["annual_max"])

        extra = 0
        if years_completed >= 3:
            extra = ((years_completed - 1) // step_years)
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
# Request submission / decision
# ---------------------------------------------------------------------------


def business_days_between(start: date, end: date) -> Decimal:
    """Return number of business days inclusive between *start* and *end*."""
    if end < start:
        raise ValueError("end_date precedes start_date")
    days = ZERO
    cur = start
    while cur <= end:
        if cur.weekday() < 5:  # Mon..Fri
            days += ONE_DAY
        cur += timedelta(days=1)
    return days


def _days_for_request(start: date, end: date, kind: str) -> Decimal:
    base = business_days_between(start, end)
    if kind in (LeaveRequest.Kind.AM_HALF, LeaveRequest.Kind.PM_HALF):
        if start != end:
            raise ValueError("Half-day requests must cover a single date")
        return HALF_DAY
    return base


@transaction.atomic
def submit_request(
    membership: Membership,
    start_date: date,
    end_date: date,
    kind: str,
    reason: str = "",
) -> LeaveRequest:
    from core.errors import Unprocessable  # local to avoid app-loading order issues

    if kind not in LeaveRequest.Kind.values:
        raise Unprocessable("INVALID_KIND", "유효하지 않은 휴가 종류입니다.")

    try:
        days = _days_for_request(start_date, end_date, kind)
    except ValueError as exc:
        raise Unprocessable("INVALID_RANGE", str(exc))

    if days <= ZERO:
        raise Unprocessable(
            "NO_BUSINESS_DAYS",
            "선택한 기간에 영업일이 없습니다.",
        )

    balance = compute_balance(membership, as_of=start_date)
    if balance["remaining"] < days:
        raise Unprocessable(
            "INSUFFICIENT_BALANCE",
            "잔여 연차가 부족합니다.",
            details={
                "remaining": str(balance["remaining"]),
                "requested": str(days),
            },
        )

    leave_request = LeaveRequest.objects.create(
        company=membership.company,
        membership=membership,
        start_date=start_date,
        end_date=end_date,
        kind=kind,
        days=days,
        reason=reason,
    )

    approver = membership.manager or membership
    ApprovalTask.objects.create(
        company=membership.company,
        target_type=ApprovalTask.TargetType.LEAVE,
        target_id=leave_request.id,
        requester=membership,
        approver=approver,
    )
    return leave_request


@transaction.atomic
def decide_request(
    approval_task: ApprovalTask,
    decision: str,
    decider: Membership,
) -> LeaveRequest:
    from core.errors import Unprocessable

    if approval_task.status != ApprovalTask.Status.PENDING:
        raise Unprocessable("ALREADY_DECIDED", "이미 처리된 결재입니다.")
    if decision not in (ApprovalTask.Status.APPROVED, ApprovalTask.Status.REJECTED):
        raise Unprocessable("INVALID_DECISION", "결재 값이 올바르지 않습니다.")

    try:
        leave_request = LeaveRequest.objects.select_for_update().get(
            id=approval_task.target_id,
            company=approval_task.company,
        )
    except LeaveRequest.DoesNotExist as exc:  # pragma: no cover - data integrity
        raise Unprocessable("REQUEST_MISSING", "신청 데이터를 찾을 수 없습니다.") from exc

    now = django_tz.now()
    approval_task.status = decision
    approval_task.decided_at = now
    approval_task.save(update_fields=["status", "decided_at"])

    leave_request.decided_by = decider
    leave_request.decided_at = now
    leave_request.status = (
        LeaveRequest.Status.APPROVED
        if decision == ApprovalTask.Status.APPROVED
        else LeaveRequest.Status.REJECTED
    )
    leave_request.save(update_fields=["decided_by", "decided_at", "status", "updated_at"])

    if leave_request.status == LeaveRequest.Status.APPROVED:
        LeaveBalance.objects.create(
            company=leave_request.company,
            membership=leave_request.membership,
            kind=LeaveBalance.Kind.USED,
            days=leave_request.days,
            granted_at=leave_request.start_date,
            related_request_id=leave_request.id,
            note=f"used:{leave_request.id}",
        )
    return leave_request


# ---------------------------------------------------------------------------
# Expiry
# ---------------------------------------------------------------------------


@transaction.atomic
def expire_balances(as_of: date) -> int:
    """Move past-expiry GRANTED rows into EXPIRED transactions.

    Returns the number of EXPIRED rows created.
    """
    granted_qs = LeaveBalance.objects.filter(
        kind=LeaveBalance.Kind.GRANTED,
        expires_at__isnull=False,
        expires_at__lt=as_of,
    )

    # Group by (membership, expires_at) to determine remaining usable days per cohort.
    created_count = 0
    seen_keys: set[tuple] = set()
    for row in granted_qs.select_related("membership"):
        key = (row.membership_id, row.expires_at)
        if key in seen_keys:
            continue
        seen_keys.add(key)

        # Sum granted in cohort.
        cohort_granted = LeaveBalance.objects.filter(
            membership_id=row.membership_id,
            kind=LeaveBalance.Kind.GRANTED,
            expires_at=row.expires_at,
        ).aggregate(s=Sum("days"))["s"] or ZERO
        cohort_granted = Decimal(cohort_granted)

        # Already expired for this cohort
        already_expired = LeaveBalance.objects.filter(
            membership_id=row.membership_id,
            kind=LeaveBalance.Kind.EXPIRED,
            note=f"expire:{row.expires_at.isoformat()}",
        ).aggregate(s=Sum("days"))["s"] or ZERO
        already_expired = Decimal(already_expired)
        if already_expired >= cohort_granted:
            continue

        # Used since granted_at floor of this cohort.
        # Conservative: count USED rows after the earliest granted_at of this cohort
        # whose related grants would fall into this cohort. For MVP, attribute USED
        # globally — but cap so we never expire days the user already used.
        used_total = LeaveBalance.objects.filter(
            membership_id=row.membership_id,
            kind=LeaveBalance.Kind.USED,
        ).aggregate(s=Sum("days"))["s"] or ZERO
        used_total = Decimal(used_total)

        # Other granted (still active) — used should drain those first conceptually,
        # but for MVP we expire whatever is left from this cohort after subtracting used
        # (clamped to non-negative).
        unused_in_cohort = max(cohort_granted - used_total - already_expired, ZERO)
        if unused_in_cohort <= ZERO:
            continue

        LeaveBalance.objects.create(
            company=row.company,
            membership=row.membership,
            kind=LeaveBalance.Kind.EXPIRED,
            days=unused_in_cohort,
            granted_at=as_of,
            expires_at=row.expires_at,
            note=f"expire:{row.expires_at.isoformat()}",
        )
        created_count += 1
    return created_count


# ---------------------------------------------------------------------------
# Helpers used by views
# ---------------------------------------------------------------------------


def list_team_calendar(
    company,
    start: date,
    end: date,
    department=None,
) -> Iterable[LeaveRequest]:
    qs = LeaveRequest.objects.filter(
        company=company,
        status=LeaveRequest.Status.APPROVED,
        start_date__lte=end,
        end_date__gte=start,
    ).select_related("membership", "membership__user", "membership__department")
    if department is not None:
        qs = qs.filter(membership__department=department)
    return qs.order_by("start_date")
