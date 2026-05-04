"""OAuth HTTP views.

Two endpoints:

* ``GET /v1/auth/oauth/{provider}/start`` — content-negotiated. JSON callers
  receive ``{"url": ..., "state": ...}`` so SPA clients can open the popup
  themselves; everything else gets a 302 redirect.

* ``GET /v1/auth/oauth/{provider}/callback`` — completes the dance and returns
  the same payload as ``POST /v1/auth/login`` (access/refresh + user). When
  the user has 2FA enabled, returns ``{"two_fa_required": true,
  "two_fa_token": "..."}`` instead — same contract as the password login.
"""
from __future__ import annotations

import json

from django.http import HttpResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from apps.audit.services import record as audit_record
from apps.identity import services as identity_services
from apps.identity.serializers import UserMeSerializer, issue_tokens
from core.errors import DomainError

from . import services as oauth_services


def _wants_json(request) -> bool:
    accept = (request.META.get("HTTP_ACCEPT") or "").lower()
    return "application/json" in accept


def _err_response(exc: DomainError) -> HttpResponse:
    body = {"error": {"code": exc.code, "message": exc.message}}
    if exc.details:
        body["error"]["details"] = exc.details
    return HttpResponse(
        json.dumps(body), status=exc.status_code, content_type="application/json"
    )


@csrf_exempt
@require_GET
def start(request, provider: str):
    """Issue PKCE state + return (or redirect to) the provider's auth URL.

    Bypasses DRF content negotiation so a plain ``Accept: text/html`` browser
    request gets a 302 redirect (instead of DRF's 406 "Not Acceptable").
    """
    redirect_uri = request.GET.get("redirect_uri") or ""
    if not redirect_uri:
        return HttpResponse(
            json.dumps({"error": {"code": "VALIDATION_ERROR", "message": "redirect_uri required"}}),
            status=400,
            content_type="application/json",
        )
    try:
        result = oauth_services.start(provider=provider, redirect_uri=redirect_uri)
    except DomainError as exc:
        return _err_response(exc)
    if _wants_json(request):
        return HttpResponse(
            json.dumps({"data": result}), status=200, content_type="application/json"
        )
    return HttpResponseRedirect(result["url"])


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def callback(request, provider: str):
    """Complete OAuth and respond with login tokens (or a 2FA challenge)."""
    code = request.GET.get("code") or ""
    state = request.GET.get("state") or ""
    if not code or not state:
        return Response(
            {"error": {"code": "VALIDATION_ERROR", "message": "code/state required"}},
            status=400,
        )
    result = oauth_services.complete(provider=provider, code=code, state=state)
    user = result["user"]

    if result["two_fa_required"]:
        token = identity_services.issue_2fa_challenge(user)
        audit_record(
            user,
            "auth.oauth.2fa_required",
            request=request,
            payload={"provider": provider},
        )
        return Response({"data": {"two_fa_required": True, "two_fa_token": token}})

    tokens = issue_tokens(user)
    audit_record(
        user,
        "auth.oauth.login",
        request=request,
        payload={"provider": provider, "created": result["created"]},
    )
    return Response(
        {
            "data": {
                **tokens,
                "user": UserMeSerializer(user).data,
                "created": result["created"],
            }
        }
    )
