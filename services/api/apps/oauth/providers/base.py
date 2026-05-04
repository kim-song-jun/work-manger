"""Provider Protocol + ProviderProfile dataclass.

Split out of ``__init__.py`` to avoid the circular-import deadlock that arises
when concrete providers (google.py / kakao.py) try to import the dataclass
from the package they're being imported into.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass(frozen=True)
class ProviderProfile:
    provider_subject: str
    email: str
    name: str
    email_verified: bool


class Provider(Protocol):
    name: str

    def start_url(
        self, *, state: str, code_challenge: str, redirect_uri: str
    ) -> str: ...

    def exchange(
        self,
        *,
        code: str,
        code_verifier: str,
        redirect_uri: str,
        _test_responses: dict[str, Any] | None = None,
    ) -> ProviderProfile: ...
