"""OWNER-only gate for billing endpoints.

Re-uses ``core.permissions.HasRole.at_least`` so the rank logic stays in
one place; this thin wrapper exists to give the spectacular schema a
stable name and future hook for billing-specific checks (e.g. block
viewing while a Stripe migration is in flight).
"""
from __future__ import annotations

from core.permissions import HasRole

# OWNER is the only role that should see billing/subscription/invoice
# data — billing decisions belong to the company owner.
IsOwner = HasRole.at_least("OWNER")
