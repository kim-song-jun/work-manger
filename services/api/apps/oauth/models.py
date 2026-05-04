"""OAuth state + identity persistence.

``OAuthState`` is a short-lived row remembering the PKCE ``code_verifier`` so
the callback can complete the token exchange. Lifetime: 10 minutes; lookup
filters by ``created_at > now - 10min`` to defeat replays.

``OAuthIdentity`` is the long-lived link between a User and a third-party
account (``provider`` + ``provider_subject`` is unique).
"""
from __future__ import annotations

import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone as django_tz


class OAuthState(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=32)
    state = models.CharField(max_length=128, unique=True)
    code_verifier = models.CharField(max_length=128)
    redirect_uri = models.CharField(max_length=512)
    created_at = models.DateTimeField(default=django_tz.now, editable=False)
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "oauth_state"
        indexes = [
            models.Index(fields=["state"], name="idx_oauth_state_state"),
        ]


class OAuthIdentity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="oauth_identities",
    )
    provider = models.CharField(max_length=32)
    provider_subject = models.CharField(max_length=128)
    email = models.EmailField()
    created_at = models.DateTimeField(default=django_tz.now, editable=False)

    class Meta:
        db_table = "oauth_identity"
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_subject"],
                name="uniq_oauth_provider_subject",
            )
        ]
        indexes = [
            models.Index(fields=["user"], name="idx_oauth_identity_user"),
        ]
