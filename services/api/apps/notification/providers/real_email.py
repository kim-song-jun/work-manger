"""Real email provider — AWS SES (default) with optional Django SMTP fallback.

Selected by ``settings.NOTIFICATION_PROVIDER_MODE == "real"`` via the dispatcher
in :mod:`apps.notification.providers`. Keeps the same ``send`` signature as the
stub so the outbox worker is provider-agnostic.

Failure taxonomy (drives the outbox retry / DEAD decision):

* **Transient** (retryable): SES ``ThrottlingException``, HTTP 5xx, network
  timeouts, generic ``ClientError`` without a known terminal code.
  Returned as ``ProviderResult(success=False, error=...)``; the outbox
  re-schedules with backoff.
* **Terminal** (do not retry): SES ``MessageRejected`` / ``MailFromDomainNot
  VerifiedException`` / ``ConfigurationSetDoesNotExistException``. Returned
  as ``ProviderResult(success=False, error="terminal: ...")`` — the outbox
  caller (``process_one``) inspects the ``error`` prefix and forces DEAD on
  the next attempt instead of retrying. This avoids burning quota on a
  permanently bad recipient/template.

Recognised payload keys: ``subject``, ``text``, ``html``, ``_to_email``.
"""
from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

from django.conf import settings

if TYPE_CHECKING:
    from apps.identity.models import Membership

    from . import ProviderResult

logger = logging.getLogger(__name__)

# SES error codes that should NOT be retried (terminal — outbox will DEAD).
TERMINAL_SES_CODES = frozenset(
    {
        "MessageRejected",
        "MailFromDomainNotVerifiedException",
        "ConfigurationSetDoesNotExistException",
        "AccountSendingPausedException",
    }
)
TERMINAL_PREFIX = "terminal:"


def _terminal(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=f"{TERMINAL_PREFIX} {reason}")


def _transient(reason: str) -> "ProviderResult":
    from . import ProviderResult

    return ProviderResult(success=False, error=reason)


def _resolve_recipient(payload: dict[str, Any], membership: "Membership | None") -> str | None:
    if isinstance(payload, dict):
        explicit = payload.get("_to_email")
        if explicit:
            return str(explicit)
    if membership is not None and getattr(membership, "user", None) is not None:
        return getattr(membership.user, "email", None)
    return None


def _send_via_ses(
    *, to_email: str, subject: str, text: str, html: str
) -> "ProviderResult":
    from . import ProviderResult

    # Lazy import — boto3 is optional at install time and absent under stub mode.
    import boto3
    from botocore.exceptions import BotoCoreError, ClientError

    body: dict[str, Any] = {"Text": {"Data": text or "", "Charset": "UTF-8"}}
    if html:
        body["Html"] = {"Data": html, "Charset": "UTF-8"}

    try:
        client = boto3.client("ses", region_name=getattr(settings, "AWS_REGION", "us-east-1"))
        resp = client.send_email(
            Source=getattr(settings, "EMAIL_FROM", "no-reply@example.com"),
            Destination={"ToAddresses": [to_email]},
            Message={
                "Subject": {"Data": subject or "", "Charset": "UTF-8"},
                "Body": body,
            },
        )
    except ClientError as exc:
        code = (exc.response or {}).get("Error", {}).get("Code", "ClientError")
        if code in TERMINAL_SES_CODES:
            logger.warning("ses.terminal code=%s to=%s", code, to_email)
            return _terminal(code)
        logger.info("ses.transient code=%s to=%s", code, to_email)
        return _transient(f"ses-transient: {code}")
    except BotoCoreError as exc:  # network / signature etc — transient
        return _transient(f"ses-botocore: {type(exc).__name__}")

    msg_id = resp.get("MessageId") if isinstance(resp, dict) else None
    return ProviderResult(success=True, provider_message_id=msg_id)


def _send_via_smtp(
    *, to_email: str, subject: str, text: str, html: str
) -> "ProviderResult":
    from django.core.mail import send_mail

    from . import ProviderResult

    try:
        sent = send_mail(
            subject=subject or "",
            message=text or "",
            from_email=getattr(settings, "EMAIL_FROM", "no-reply@example.com"),
            recipient_list=[to_email],
            html_message=html or None,
            fail_silently=False,
        )
    except Exception as exc:  # noqa: BLE001 — Django can raise SMTP/connection errors
        return _transient(f"smtp: {type(exc).__name__}")

    if not sent:
        return _transient("smtp: 0 messages accepted")
    # Django's send_mail does not return a provider message id.
    return ProviderResult(success=True, provider_message_id=None)


def send(*, payload: dict[str, Any], membership: "Membership | None") -> "ProviderResult":
    to_email = _resolve_recipient(payload or {}, membership)
    if not to_email:
        return _terminal("missing recipient")

    subject = (payload or {}).get("subject", "") if isinstance(payload, dict) else ""
    text = (payload or {}).get("text", "") if isinstance(payload, dict) else ""
    html = (payload or {}).get("html", "") if isinstance(payload, dict) else ""

    provider = getattr(settings, "EMAIL_PROVIDER", "ses").lower()
    if provider == "smtp":
        return _send_via_smtp(to_email=to_email, subject=subject, text=text, html=html)
    return _send_via_ses(to_email=to_email, subject=subject, text=text, html=html)


__all__ = ["send", "TERMINAL_PREFIX", "TERMINAL_SES_CODES"]
