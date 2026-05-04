"""Notice domain services — pure functions used by views/tests."""
from __future__ import annotations

from typing import Iterable

from django.db.models import Q
from django.utils import timezone as django_tz

from apps.identity.models import Membership
from core.errors import Forbidden, NotFound, Unprocessable

from .models import Notice

_ADMIN_ROLES = {"ADMIN", "OWNER"}


def list_for(
    membership: Membership,
    *,
    pinned_only: bool = False,
    category: str | None = None,
    q: str | None = None,
    include_archived: bool = False,
    limit: int = 100,
) -> list[Notice]:
    """Return notices visible to *membership* — own company only."""
    qs = Notice.objects.filter(company=membership.company)
    if not include_archived:
        qs = qs.filter(archived_at__isnull=True)
    if pinned_only:
        qs = qs.filter(pinned=True)
    if category:
        qs = qs.filter(category=category)
    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(body__icontains=q))
    return list(qs.order_by("-pinned", "-priority", "-published_at")[:limit])


def _ensure_admin(author: Membership) -> None:
    if author is None or author.role not in _ADMIN_ROLES:
        raise Forbidden(message="공지 작성은 관리자만 가능합니다.")


def create(author: Membership, payload: dict) -> Notice:
    _ensure_admin(author)
    title = (payload.get("title") or "").strip()
    if not title:
        raise Unprocessable("TITLE_REQUIRED", "제목을 입력해 주세요.")
    return Notice.objects.create(
        company=author.company,
        author=author,
        title=title,
        body=payload.get("body") or "",
        pinned=bool(payload.get("pinned", False)),
        priority=int(payload.get("priority", 0)),
        category=payload.get("category") or Notice.Category.GENERAL,
        published_at=payload.get("published_at") or django_tz.now(),
    )


def update(actor: Membership, notice_id, payload: dict) -> Notice:
    _ensure_admin(actor)
    try:
        notice = Notice.objects.get(id=notice_id, company=actor.company)
    except Notice.DoesNotExist as exc:
        raise NotFound("NOTICE_NOT_FOUND", "공지를 찾을 수 없습니다.") from exc

    update_fields: list[str] = []
    for key in ("title", "body", "category"):
        if key in payload and payload[key] is not None:
            setattr(notice, key, payload[key])
            update_fields.append(key)
    for key in ("pinned",):
        if key in payload and payload[key] is not None:
            setattr(notice, key, bool(payload[key]))
            update_fields.append(key)
    for key in ("priority",):
        if key in payload and payload[key] is not None:
            setattr(notice, key, int(payload[key]))
            update_fields.append(key)
    if "published_at" in payload and payload["published_at"]:
        notice.published_at = payload["published_at"]
        update_fields.append("published_at")
    if update_fields:
        update_fields.append("updated_at")
        notice.save(update_fields=update_fields)
    return notice


def archive(actor: Membership, notice_id) -> Notice:
    _ensure_admin(actor)
    try:
        notice = Notice.objects.get(id=notice_id, company=actor.company)
    except Notice.DoesNotExist as exc:
        raise NotFound("NOTICE_NOT_FOUND", "공지를 찾을 수 없습니다.") from exc
    if notice.archived_at is None:
        notice.archived_at = django_tz.now()
        notice.save(update_fields=["archived_at", "updated_at"])
    return notice
