"""Common permissions / membership resolution."""
from __future__ import annotations

from rest_framework.permissions import BasePermission

from apps.identity.models import Membership

ROLE_RANK = {
    "EMPLOYEE": 1,
    "MANAGER": 2,
    "ADMIN": 3,
    "OWNER": 4,
}


def active_membership(user) -> Membership | None:
    if user is None or user.is_anonymous:
        return None
    return user.memberships.filter(is_active=True).select_related("company", "department").first()


def attach_membership(request) -> Membership | None:
    if not hasattr(request, "_membership"):
        request._membership = active_membership(request.user)
    return request._membership


class IsActiveMember(BasePermission):
    message = "활성 멤버십이 필요합니다."

    def has_permission(self, request, view) -> bool:
        if not request.user or request.user.is_anonymous:
            return False
        return attach_membership(request) is not None


class HasRole(BasePermission):
    """Use as: `permission_classes = [HasRole.at_least('MANAGER')]`."""

    required: str = "EMPLOYEE"

    @classmethod
    def at_least(cls, role: str) -> type:
        return type(f"HasRole_{role}", (cls,), {"required": role})

    def has_permission(self, request, view) -> bool:
        m = attach_membership(request)
        if m is None:
            return False
        return ROLE_RANK.get(m.role, 0) >= ROLE_RANK[self.required]
