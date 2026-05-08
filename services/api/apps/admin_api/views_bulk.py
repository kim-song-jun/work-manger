"""Admin endpoints — bulk CSV import + monthly report export + bulk decide + expiring leave.

Split out of `views.py` to keep that file under the 200-line cap.
- POST  /v1/admin/employees/bulk      (multipart upload, idempotent)
- GET   /v1/admin/reports/export      (csv | pdf)
- PATCH /v1/admin/approvals/<uuid>    (admin override single decide)
- POST  /v1/admin/approvals/bulk      (admin batch decide)
- GET   /v1/admin/leave/expiring      (aggregate expiring leave for admin view)

All errors flow through `core.errors.DomainError` subclasses (Unprocessable
returns the standard `{ error: { code, message } }` envelope per
docs/api/api-spec.md §0.2 / §11).
"""
from __future__ import annotations

from decimal import Decimal

from django.db import transaction
from django.http import HttpResponse
from django.utils import timezone as django_tz
from rest_framework import serializers
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.approval.models import ApprovalTask
from apps.approval.views import _apply_decision, _broadcast_decided
from apps.audit.services import record as audit_record
from apps.identity.models import Membership
from apps.leave import services as leave_services
from core.errors import NotFound, Unprocessable
from core.permissions import HasRole, active_membership

from .exporters.csv_writer import monthly_report_csv
from .exporters.pdf import monthly_report_pdf
from .services_bulk import CsvParseError, apply_rows, parse_csv


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([HasRole.at_least("ADMIN")])
def bulk_employees(request):
    """CSV bulk-register employees. Multipart `file` + optional `dry_run=true`."""
    me = active_membership(request.user)
    upload = request.FILES.get("file") or request.data.get("file")
    if upload is None or not hasattr(upload, "read"):
        raise Unprocessable(
            code="FILE_REQUIRED", message="multipart 'file' 필드가 필요합니다."
        )
    dry_raw = (request.data.get("dry_run") or "").lower()
    dry_run = dry_raw in ("1", "true", "yes", "on")
    try:
        rows = parse_csv(upload)
    except CsvParseError as exc:
        raise Unprocessable(code="INVALID_CSV", message=str(exc))
    result = apply_rows(me.company, rows, dry_run=dry_run)
    if not dry_run:
        audit_record(
            request.user,
            "identity.bulk_imported",
            company=me.company,
            request=request,
            payload={
                "count_created": len(result.created),
                "count_skipped": len(result.skipped),
                "count_errors": len(result.errors),
            },
        )
    return Response({"data": {**result.to_dict(), "dry_run": dry_run}})


class ExportReportView(APIView):
    """CBV so we can swap content negotiation. Spec mandates `?format=csv|pdf`,
    but DRF's default content-negotiator inspects that same query key and 404s
    when it doesn't match a registered renderer. We override to always return
    the JSON renderer (used only for the 422 error path); the success path
    writes raw HttpResponse and bypasses the renderer entirely.
    """

    permission_classes = [HasRole.at_least("ADMIN")]

    def perform_content_negotiation(self, request, force=False):
        # Skip DRF's format-suffix negotiation; pick the first JSON-style
        # renderer so error responses still serialize.
        renderer = self.get_renderers()[0]
        return (renderer, renderer.media_type)

    def get(self, request):
        me = active_membership(request.user)
        fmt = (request.query_params.get("format") or "csv").lower()
        ym = request.query_params.get("ym") or django_tz.localdate().strftime("%Y-%m")
        if fmt == "csv":
            body = monthly_report_csv(me.company, ym)
            resp = HttpResponse(body, content_type="text/csv; charset=utf-8")
            resp["Content-Disposition"] = f'attachment; filename="monthly-{ym}.csv"'
            return resp
        if fmt == "pdf":
            pdf_bytes = monthly_report_pdf(me.company, ym)
            resp = HttpResponse(pdf_bytes, content_type="application/pdf")
            resp["Content-Disposition"] = f'attachment; filename="monthly-{ym}.pdf"'
            return resp
        raise Unprocessable(
            code="INVALID_FORMAT",
            message="format 파라미터는 csv 또는 pdf 여야 합니다.",
        )


export_report = ExportReportView.as_view()


# ─── Admin approval decide (single + bulk) ────────────────────
class AdminDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=("approve", "reject"))
    reason = serializers.CharField(required=False, allow_blank=True, default="")


class BulkDecisionSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.UUIDField(), min_length=1, max_length=200
    )
    decision = serializers.ChoiceField(choices=("approve", "reject"))
    reason = serializers.CharField(required=False, allow_blank=True, default="")


def _admin_decide_one(task: ApprovalTask, decision_upper: str, reason: str) -> None:
    """Apply admin override decision to a single task. Caller wraps in atomic."""
    target_status = (
        ApprovalTask.Status.APPROVED
        if decision_upper == "APPROVE"
        else ApprovalTask.Status.REJECTED
    )
    task.status = target_status
    task.decided_at = django_tz.now()
    task.save(update_fields=["status", "decided_at"])
    _apply_decision(task, decision_upper, reason)


@api_view(["PATCH"])
@permission_classes([HasRole.at_least("ADMIN")])
def decide_approval(request, task_id):
    """Admin override: PATCH /v1/admin/approvals/<uuid>.

    Bypasses :class:`IsApprover` (admin acts on behalf). Idempotency: returns
    409 ALREADY_DECIDED if task is not PENDING.
    """
    me = active_membership(request.user)
    task = ApprovalTask.objects.filter(id=task_id, company=me.company).first()
    if task is None:
        raise NotFound()
    s = AdminDecisionSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    if task.status != ApprovalTask.Status.PENDING:
        raise Unprocessable(code="ALREADY_DECIDED", message="이미 처리된 항목입니다.")
    decision_upper = s.validated_data["decision"].upper()
    reason = s.validated_data["reason"]
    with transaction.atomic():
        _admin_decide_one(task, decision_upper, reason)
    _broadcast_decided(task, decision_upper, reason)
    return Response({"data": {"id": str(task.id), "status": task.status}})


@api_view(["POST"])
@permission_classes([HasRole.at_least("ADMIN")])
def bulk_decide_approvals(request):
    """Admin bulk decide: POST /v1/admin/approvals/bulk.

    Per-id atomic — bad rows don't poison the rest. Out-of-company / non-PENDING
    / unknown ids are reported in ``failed_ids[]`` (not raised).
    """
    me = active_membership(request.user)
    s = BulkDecisionSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    ids = [str(u) for u in s.validated_data["ids"]]
    decision_upper = s.validated_data["decision"].upper()
    reason = s.validated_data["reason"]

    succeeded = 0
    failed_ids: list[str] = []
    for tid in ids:
        try:
            task = ApprovalTask.objects.filter(id=tid, company=me.company).first()
            if task is None or task.status != ApprovalTask.Status.PENDING:
                failed_ids.append(tid)
                continue
            with transaction.atomic():
                _admin_decide_one(task, decision_upper, reason)
            _broadcast_decided(task, decision_upper, reason)
            succeeded += 1
        except Exception:  # noqa: BLE001 — per-row tolerance
            failed_ids.append(tid)
    return Response(
        {
            "data": {
                "total": len(ids),
                "succeeded": succeeded,
                "failed": len(failed_ids),
                "failed_ids": failed_ids,
            }
        }
    )


# ─── Admin expiring leave aggregate ───────────────────────────
@api_view(["GET"])
@permission_classes([HasRole.at_least("ADMIN")])
def admin_expiring_leave(request):
    """GET /v1/admin/leave/expiring — aggregate expiring leave for all active members.

    Replaces FE per-employee fan-out. Returns rows sorted by expiring desc,
    omitting members with 0 expiring days.
    """
    me = active_membership(request.user)
    members = (
        Membership.objects.filter(company=me.company, is_active=True)
        .select_related("user", "department")
        .order_by("user__name")
    )
    rows: list[dict] = []
    for m in members:
        b = leave_services.compute_balance(m)
        expiring_total = sum(
            (Decimal(str(row["days"])) for row in (b.get("expiring_soon") or [])),
            Decimal("0"),
        )
        if expiring_total <= 0:
            continue
        rows.append(
            {
                "membership_id": str(m.id),
                "name": m.user.name,
                "department": m.department.name if m.department else None,
                "remaining": str(b.get("remaining") or 0),
                "used": str(b.get("used") or 0),
                "accrued": str(b.get("granted_total") or 0),
                "expiring": str(expiring_total),
            }
        )
    rows.sort(key=lambda r: Decimal(r["expiring"]), reverse=True)
    return Response({"data": rows})
