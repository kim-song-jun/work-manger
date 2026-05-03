"""Standardized error response per docs/api/api-spec.md §0.2 / §11."""
from __future__ import annotations

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler


class DomainError(APIException):
    status_code = 400
    default_code = "VALIDATION_ERROR"
    default_message = "요청이 올바르지 않습니다."

    def __init__(
        self,
        code: str | None = None,
        message: str | None = None,
        status_code: int | None = None,
        details: dict | None = None,
    ) -> None:
        self.code = code or self.default_code
        self.message = message or self.default_message
        self.status_code = status_code or self.status_code
        self.details = details or {}
        super().__init__(detail=self.message, code=self.code)


def err(code: str, message: str, http: int = 400, details: dict | None = None) -> Response:
    body: dict = {"error": {"code": code, "message": message}}
    if details:
        body["error"]["details"] = details
    return Response(body, status=http)


def exception_handler(exc, context):
    if isinstance(exc, DomainError):
        body = {"error": {"code": exc.code, "message": exc.message}}
        if exc.details:
            body["error"]["details"] = exc.details
        return Response(body, status=exc.status_code)

    response = drf_default_handler(exc, context)
    if response is None:
        return response

    if isinstance(response.data, dict) and "error" not in response.data:
        # Wrap DRF's default into the standard envelope
        message = response.data.get("detail") or "요청 처리 중 오류가 발생했습니다."
        response.data = {
            "error": {
                "code": getattr(exc, "default_code", "VALIDATION_ERROR"),
                "message": str(message),
                "details": {k: v for k, v in response.data.items() if k != "detail"},
            }
        }
    return response


# convenience exception subclasses for common cases
class NotFound(DomainError):
    status_code = status.HTTP_404_NOT_FOUND
    default_code = "RESOURCE_NOT_FOUND"
    default_message = "리소스를 찾을 수 없습니다."


class Forbidden(DomainError):
    status_code = status.HTTP_403_FORBIDDEN
    default_code = "FORBIDDEN"
    default_message = "권한이 없습니다."


class Conflict(DomainError):
    status_code = status.HTTP_409_CONFLICT
    default_code = "CONFLICT"
    default_message = "중복된 요청입니다."


class Unprocessable(DomainError):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    default_code = "VALIDATION_ERROR"
    default_message = "요청을 처리할 수 없습니다."
