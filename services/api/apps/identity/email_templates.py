"""Email body renderers for identity flows (verify + password reset).

Plain-text + HTML produced inline (no Django templates) so the notification
provider can pass-through to SES without DB I/O. Korean / English depending on
the user's ``locale`` ("ko" default).

The verification + reset URLs are built off ``settings.WM_FRONTEND_BASE_URL``.
"""
from __future__ import annotations

from typing import TypedDict

from django.conf import settings


class RenderedEmail(TypedDict):
    subject: str
    text: str
    html: str


# ─────────────────────────── helpers ───────────────────────────
def _frontend_base() -> str:
    return getattr(settings, "WM_FRONTEND_BASE_URL", "http://localhost:4444").rstrip(
        "/"
    )


def _verify_url(token: str) -> str:
    return f"{_frontend_base()}/verify-email?token={token}"


def _reset_url(token: str) -> str:
    return f"{_frontend_base()}/reset-password?token={token}"


# ─────────────────────────── verify-email ───────────────────────────
def render_verify_email(*, name: str, token: str, locale: str = "ko") -> RenderedEmail:
    """Render the email-verification message in the user's locale."""
    url = _verify_url(token)
    if locale.startswith("en"):
        subject = "Verify your Work Manager email"
        text = (
            f"Hi {name or 'there'},\n\n"
            "Confirm your email so we can finish setting up your account:\n"
            f"{url}\n\n"
            "This link expires in 24 hours.\n"
            "If you did not request this, ignore this email.\n"
        )
        html = (
            f"<p>Hi {name or 'there'},</p>"
            "<p>Please confirm your email to finish setting up your account.</p>"
            f'<p><a href="{url}">Verify email</a></p>'
            "<p>This link expires in 24 hours. If you did not request this, ignore this email.</p>"
        )
    else:
        subject = "[Work Manager] 이메일 인증을 완료해 주세요"
        text = (
            f"{name or '회원'}님, 안녕하세요.\n\n"
            "아래 링크에서 이메일 인증을 완료해 주세요.\n"
            f"{url}\n\n"
            "이 링크는 24시간 동안 유효합니다.\n"
            "본인이 요청한 적이 없다면 이 메일은 무시하셔도 됩니다.\n"
        )
        html = (
            f"<p>{name or '회원'}님, 안녕하세요.</p>"
            "<p>아래 버튼을 눌러 이메일 인증을 완료해 주세요.</p>"
            f'<p><a href="{url}">이메일 인증하기</a></p>'
            "<p>이 링크는 24시간 동안 유효합니다. 본인이 요청한 적이 없다면 이 메일은 무시해 주세요.</p>"
        )
    return RenderedEmail(subject=subject, text=text, html=html)


# ─────────────────────────── password reset ───────────────────────────
def render_password_reset(
    *, name: str, token: str, locale: str = "ko"
) -> RenderedEmail:
    """Render the password-reset message in the user's locale."""
    url = _reset_url(token)
    if locale.startswith("en"):
        subject = "Reset your Work Manager password"
        text = (
            f"Hi {name or 'there'},\n\n"
            "Use the link below to reset your password:\n"
            f"{url}\n\n"
            "This link expires in 15 minutes.\n"
            "If you did not request a password reset, ignore this email.\n"
        )
        html = (
            f"<p>Hi {name or 'there'},</p>"
            "<p>Use the link below to reset your password.</p>"
            f'<p><a href="{url}">Reset password</a></p>'
            "<p>This link expires in 15 minutes. If you did not request a password reset, ignore this email.</p>"
        )
    else:
        subject = "[Work Manager] 비밀번호 재설정 안내"
        text = (
            f"{name or '회원'}님, 안녕하세요.\n\n"
            "아래 링크에서 비밀번호를 재설정해 주세요.\n"
            f"{url}\n\n"
            "이 링크는 15분 동안 유효합니다.\n"
            "본인이 요청한 적이 없다면 이 메일은 무시하셔도 됩니다.\n"
        )
        html = (
            f"<p>{name or '회원'}님, 안녕하세요.</p>"
            "<p>아래 버튼을 눌러 비밀번호를 재설정해 주세요.</p>"
            f'<p><a href="{url}">비밀번호 재설정</a></p>'
            "<p>이 링크는 15분 동안 유효합니다. 본인이 요청한 적이 없다면 이 메일은 무시해 주세요.</p>"
        )
    return RenderedEmail(subject=subject, text=text, html=html)


__all__ = ["RenderedEmail", "render_verify_email", "render_password_reset"]
