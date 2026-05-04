"""CSV bulk employee registration — pure functions used by /v1/admin/employees/bulk.

Per docs/api/api-spec.md §8 + docs/specs/feature-spec.md §7.3.

Two-phase design:
  - parse_csv(stream)   : decode + validate columns/rows
  - apply_rows(...)     : idempotent persist (per-row tx); supports dry_run

Idempotent: existing Membership(company, user=email) -> SKIP (ALREADY_MEMBER).
New users created with set_unusable_password() -> forces password reset on
first login (no plain-text passwords ever crossing this code path).
"""
from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Iterable, TypedDict

from django.contrib.auth import get_user_model
from django.db import transaction

from apps.identity.models import Department, Membership

User = get_user_model()

REQUIRED_COLUMNS = ("email", "name", "role", "hired_at")
ALLOWED_ROLES = {"EMPLOYEE", "MANAGER", "ADMIN", "OWNER"}


class BulkRow(TypedDict, total=False):
    email: str
    name: str
    role: str
    department_name: str
    employee_no: str
    position: str
    hired_at: date
    locale: str
    _row_index: int  # 1-based; matches CSV body line


@dataclass
class BulkResult:
    created: list[str] = field(default_factory=list)
    skipped: list[dict] = field(default_factory=list)  # {email, reason}
    errors: list[dict] = field(default_factory=list)  # {row_index, email, message}

    def summary(self) -> dict:
        return {
            "count_created": len(self.created),
            "count_skipped": len(self.skipped),
            "count_errors": len(self.errors),
        }

    def to_dict(self) -> dict:
        return {
            "created": list(self.created),
            "skipped": list(self.skipped),
            "errors": list(self.errors),
            **self.summary(),
        }


class CsvParseError(Exception):
    """Raised when the CSV header is missing required columns or unreadable."""


def _read_text(stream) -> str:
    """Best-effort decode bytes -> str (UTF-8 with BOM tolerance)."""
    data = stream.read()
    if isinstance(data, bytes):
        # Strip UTF-8 BOM if present so DictReader header matches.
        if data.startswith(b"\xef\xbb\xbf"):
            data = data[3:]
        return data.decode("utf-8")
    return data


def parse_csv(stream) -> list[BulkRow]:
    """Decode + validate. Does NOT persist.

    Each returned row carries `_row_index` (1-based body row, header excluded)
    so apply_rows can attach errors to the correct CSV line.
    Rows where required-column parsing fails are still returned with a
    placeholder so apply_rows reports them in `errors[]` (not silently dropped).
    """
    text = _read_text(stream)
    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        raise CsvParseError("CSV header is missing")
    headers = {h.strip().lower() for h in reader.fieldnames if h}
    missing = [c for c in REQUIRED_COLUMNS if c not in headers]
    if missing:
        raise CsvParseError(f"missing required columns: {','.join(missing)}")

    out: list[BulkRow] = []
    for idx, raw in enumerate(reader, start=1):
        row: BulkRow = {
            "_row_index": idx,
            "email": (raw.get("email") or "").strip().lower(),
            "name": (raw.get("name") or "").strip(),
            "role": (raw.get("role") or "EMPLOYEE").strip().upper(),
            "department_name": (raw.get("department_name") or "").strip(),
            "employee_no": (raw.get("employee_no") or "").strip(),
            "position": (raw.get("position") or "").strip(),
            "locale": (raw.get("locale") or "ko").strip() or "ko",
        }
        hired_raw = (raw.get("hired_at") or "").strip()
        try:
            row["hired_at"] = datetime.strptime(hired_raw, "%Y-%m-%d").date() if hired_raw else None  # type: ignore[typeddict-item]
        except ValueError:
            row["hired_at"] = None  # type: ignore[typeddict-item]
        out.append(row)
    return out


def _validate(row: BulkRow) -> str | None:
    """Return error message (str) if row is invalid, else None."""
    if not row.get("email") or "@" not in row["email"]:
        return "INVALID_EMAIL"
    if not row.get("name"):
        return "MISSING_NAME"
    if row.get("role") not in ALLOWED_ROLES:
        return "INVALID_ROLE"
    if not row.get("hired_at"):
        return "INVALID_HIRED_AT"
    return None


def apply_rows(
    company,
    rows: Iterable[BulkRow],
    *,
    dry_run: bool = False,
) -> BulkResult:
    """Idempotently apply parsed rows. Per-row atomic — bad rows don't poison rest.

    dry_run=True: validation + duplicate detection executed; nothing committed.
    """
    result = BulkResult()
    for row in rows:
        idx = row.get("_row_index", 0)
        email = row.get("email", "")
        err = _validate(row)
        if err:
            result.errors.append({"row_index": idx, "email": email, "message": err})
            continue
        try:
            with transaction.atomic():
                user = User.objects.filter(email__iexact=email).first()
                if Membership.objects.filter(
                    company=company, user__email__iexact=email
                ).exists():
                    result.skipped.append({"email": email, "reason": "ALREADY_MEMBER"})
                    if dry_run:
                        transaction.set_rollback(True)
                    continue
                if user is None:
                    user = User(email=email, name=row["name"], locale=row.get("locale") or "ko")
                    user.set_unusable_password()
                    user.save()
                dept = None
                dname = row.get("department_name")
                if dname:
                    dept, _ = Department.objects.get_or_create(
                        company=company, name=dname, defaults={"path": f"/{dname}"}
                    )
                Membership.objects.create(
                    company=company,
                    user=user,
                    department=dept,
                    role=row["role"],
                    position=row.get("position", ""),
                    employee_no=row.get("employee_no", ""),
                    hired_at=row["hired_at"],
                    is_active=True,
                )
                result.created.append(email)
                if dry_run:
                    transaction.set_rollback(True)
        except Exception as exc:  # noqa: BLE001 — collect, don't poison
            result.errors.append(
                {"row_index": idx, "email": email, "message": str(exc)[:200]}
            )
    return result
