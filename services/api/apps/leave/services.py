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
from django.db.models import Sum
from django.utils import timezone as django_tz

from apps.approval.models import ApprovalTask
from apps.identity.models import Membership

from .models import LeaveBalance, LeavePolicy, LeavePromotionLog, LeaveRequest

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
    Heavy aggregation logic lives in :class:`apps.leave.repositories.BalanceRepository`.
    """
    from .repositories import BalanceRepository  # local import → avoid cycle

    snap = BalanceRepository.compute_for(membership, as_of=as_of)
    return {
        "granted_total": snap.granted_total,
        "used": snap.used,
        "remaining": snap.remaining,
        "expiring_soon": snap.expiring_soon,
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

    Delegates to a :class:`apps.leave.strategies.LeaveAccrualStrategy` selected
    by ``policy.rules_json["strategy"]`` (default: ``korean_labor_law``). Pure
    function — does not write to the database. Idempotency is enforced by
    callers checking for an existing grant on the same calendar period.

    The return type is the legacy :class:`BalanceCreate` so existing callers
    (``tasks.grant_monthly``, ``tasks.grant_annual``) need no changes.
    """
    from .strategies import get_strategy  # local import → avoid cycle

    strategy = get_strategy(policy)
    raw = strategy.accrue(membership, as_of, policy)
    # Adapt strategy's BalanceCreate (same shape) to this module's dataclass so
    # downstream type-checks see a single canonical type.
    return [
        BalanceCreate(
            membership=g.membership,
            days=g.days,
            granted_at=g.granted_at,
            expires_at=g.expires_at,
            note=g.note,
        )
        for g in raw
    ]


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
    leave_type: str = LeaveRequest.LeaveType.ANNUAL,
) -> LeaveRequest:
    from core.errors import Unprocessable  # local to avoid app-loading order issues

    if kind not in LeaveRequest.Kind.values:
        raise Unprocessable("INVALID_KIND", "유효하지 않은 휴가 종류입니다.")

    if leave_type not in LeaveRequest.LeaveType.values:
        raise Unprocessable("INVALID_LEAVE_TYPE", "유효하지 않은 휴가 유형입니다.")

    try:
        days = _days_for_request(start_date, end_date, kind)
    except ValueError as exc:
        raise Unprocessable("INVALID_RANGE", str(exc))

    if days <= ZERO:
        raise Unprocessable(
            "NO_BUSINESS_DAYS",
            "선택한 기간에 영업일이 없습니다.",
        )

    # iter13 T3: COMP/SICK/PERSONAL share the ANNUAL balance bucket for now
    # — comp-time accrual will get a dedicated bucket in a follow-up task.
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
        leave_type=leave_type,
        days=days,
        reason=reason,
    )

    # F-MANAGER-01/F-MANAGER-10: prevent self-approve — escalate to ADMIN/OWNER
    approver = membership.manager if (
        membership.manager_id and membership.manager and membership.manager.is_active
        and membership.manager_id != membership.id
    ) else None
    if approver is None:
        approver = (
            membership.company.memberships.filter(
                is_active=True,
                role__in=[Membership.Role.ADMIN, Membership.Role.OWNER],
            )
            .exclude(id=membership.id)
            .first()
        )
    if approver is None:
        # Last resort: MANAGER in the same company (still not self)
        approver = (
            membership.company.memberships.filter(
                is_active=True,
                role=Membership.Role.MANAGER,
            )
            .exclude(id=membership.id)
            .first()
        )
    if approver is None or approver.id == membership.id:
        raise Unprocessable(
            "NO_APPROVER",
            "승인자를 찾을 수 없습니다. 관리자에게 문의하세요.",
        )
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


# ---------------------------------------------------------------------------
# 사용 촉진 (근로기준법 §61)
# ---------------------------------------------------------------------------


# Reminder schedule (days before fiscal_end_date) — see spec §5.2.
PROMOTION_FIRST_OFFSET_DAYS = 183   # ~6 months before fiscal year-end
PROMOTION_SECOND_OFFSET_DAYS = 61   # ~2 months before fiscal year-end


def _company_fiscal_end_for(company, today: date) -> date:
    """Return the *next* fiscal year-end date for *company* on ``today``.

    The company's ``fiscal_year_start`` defines the cycle. If today is on or
    after this year's start, the cycle ends the day before next year's start.
    Otherwise the cycle ends the day before this year's start.
    """
    fy_start = company.fiscal_year_start
    candidate_start = date(today.year, fy_start.month, fy_start.day)
    if today >= candidate_start:
        next_start = date(today.year + 1, fy_start.month, fy_start.day)
    else:
        next_start = candidate_start
    return next_start - timedelta(days=1)


@dataclass(frozen=True)
class PromotionTarget:
    membership: Membership
    days_remaining: Decimal
    fiscal_end_date: date
    kind: str  # "FIRST" | "SECOND"


def pending_promotion_targets(company, today: date) -> list[PromotionTarget]:
    """Compute outstanding 사용 촉진 reminders for *company* on *today*.

    Spec §5.2 + 근로기준법 §61:
      - First reminder: when ``today`` is exactly 6개월 (183 days) before
        ``fiscal_year_end`` AND the membership has > 0 remaining days.
      - Second reminder: when ``today`` is exactly 2개월 (61 days) before
        ``fiscal_year_end``, the FIRST reminder was already issued, AND
        the balance is still > 0.

    Read-only and idempotent — skips memberships whose log row for the same
    ``(membership, fiscal_end_date, kind)`` already exists.
    """
    fiscal_end = _company_fiscal_end_for(company, today)
    delta_days = (fiscal_end - today).days

    if delta_days == PROMOTION_FIRST_OFFSET_DAYS:
        kind = LeavePromotionLog.Kind.FIRST
    elif delta_days == PROMOTION_SECOND_OFFSET_DAYS:
        kind = LeavePromotionLog.Kind.SECOND
    else:
        return []

    targets: list[PromotionTarget] = []
    memberships = Membership.objects.filter(company=company, is_active=True)
    for membership in memberships:
        if LeavePromotionLog.objects.filter(
            membership=membership, fiscal_end_date=fiscal_end, kind=kind
        ).exists():
            continue
        if kind == LeavePromotionLog.Kind.SECOND:
            first_issued = LeavePromotionLog.objects.filter(
                membership=membership,
                fiscal_end_date=fiscal_end,
                kind=LeavePromotionLog.Kind.FIRST,
            ).exists()
            if not first_issued:
                continue
        snapshot = compute_balance(membership, as_of=today)
        remaining = Decimal(snapshot["remaining"])
        if remaining <= ZERO:
            continue
        targets.append(
            PromotionTarget(
                membership=membership,
                days_remaining=remaining,
                fiscal_end_date=fiscal_end,
                kind=kind,
            )
        )
    return targets


def record_promotion(
    membership: Membership,
    *,
    kind: str,
    days_remaining: Decimal,
    fiscal_end_date: date,
) -> LeavePromotionLog | None:
    """Persist one :class:`LeavePromotionLog` row + dispatch the notification.

    Returns the new log row, or ``None`` if a duplicate existed (idempotent).
    Channels: ``EMAIL`` + ``INAPP`` per spec §8 알림 트리거 표.
    """
    from django.db import IntegrityError
    from apps.notification import services as notif_svc

    try:
        with transaction.atomic():
            log = LeavePromotionLog.objects.create(
                company=membership.company,
                membership=membership,
                fiscal_end_date=fiscal_end_date,
                kind=kind,
                days_remaining=Decimal(days_remaining),
            )
    except IntegrityError:
        return None

    event_kind = (
        "LEAVE_PROMOTION_FIRST"
        if kind == LeavePromotionLog.Kind.FIRST
        else "LEAVE_PROMOTION_SECOND"
    )
    notif_svc.dispatch(
        membership,
        event_kind=event_kind,
        payload={
            "kind": kind,
            "days_remaining": str(days_remaining),
            "fiscal_end_date": fiscal_end_date.isoformat(),
        },
        channels=["EMAIL", "INAPP"],
    )
    return log


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
