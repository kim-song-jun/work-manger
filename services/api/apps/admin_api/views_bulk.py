"""Admin endpoints — bulk CSV import + monthly report export.

Split out of `views.py` to keep that file under the 200-line cap.
- POST /v1/admin/employees/bulk     (multipart upload, idempotent)
- GET  /v1/admin/reports/export     (csv | pdf)

All errors flow through `core.errors.DomainError` subclasses (Unprocessable
returns the standard `{ error: { code, message } }` envelope per
docs/api/api-spec.md §0.2 / §11).
"""
from __future__ import annotations

from django.http import HttpResponse
from django.utils import timezone as django_tz
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.services import record as audit_record
from core.errors import Unprocessable
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
