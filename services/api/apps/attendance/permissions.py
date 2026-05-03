from __future__ import annotations

from rest_framework.permissions import BasePermission


class IsActiveMember(BasePermission):
    """
    Requires the request user to have at least one active Membership.
    Attaches `request.membership` (single-tenant v1 assumption: first active membership).
    """

    message = "활성 멤버십이 없습니다."

    def has_permission(self, request, view) -> bool:
        user = getattr(request, "user", None)
        if user is None or not user.is_authenticated:
            return False
        membership = (
            user.memberships.select_related("company")
            .filter(is_active=True, deleted_at__isnull=True)
            .first()
        )
        if membership is None:
            return False
        request.membership = membership
        request.company = membership.company
        return True
