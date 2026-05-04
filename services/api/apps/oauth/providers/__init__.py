"""OAuth provider registry.

The Provider Protocol + ProviderProfile dataclass live in ``base`` so that
concrete provider modules (google, kakao) can import them without re-entering
this package's ``__init__`` (circular-import trap).
"""
from __future__ import annotations

from .base import Provider, ProviderProfile
from .google import GoogleProvider
from .kakao import KakaoProvider

_REGISTRY: dict[str, Provider] = {
    "google": GoogleProvider(),
    "kakao": KakaoProvider(),
}


def get(name: str) -> Provider | None:
    return _REGISTRY.get(name.lower())


__all__ = ["Provider", "ProviderProfile", "get"]
