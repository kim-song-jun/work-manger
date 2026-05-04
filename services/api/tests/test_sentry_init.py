"""
Test: observability · Sentry init guard
Type: Unit (settings 모듈 import 동작 검증, 외부 호출 mock)
Why:  Sentry DSN 미설정 환경 (로컬/CI) 에서 sentry_sdk.init() 이 호출되면
      사일런트 네트워크 시도 또는 PII 누출 가능. base.py 의 if SENTRY_DSN
      가드가 빈 문자열 / 미설정에 대해 init 을 건너뛰는지 회귀 보호.
Covers:
  - work_manager.settings.base — SENTRY_DSN 빈 문자열일 때 sentry_sdk.init() 미호출
  - work_manager.settings.base — SENTRY_DSN 설정 시 init() 호출 + send_default_pii=False
Out of scope:
  - 실제 Sentry 서버 통신 (smoke test 별도)
  - FE Sentry init (apps/web/src/test/__tests__/sentry-init.test.ts)
Coverage target: 100% branches for sentry init guard
"""
from __future__ import annotations

import importlib
from unittest import mock

import pytest


@pytest.fixture
def reset_settings_module():
    """settings.base 를 리로드해 SENTRY_DSN 분기를 재실행."""
    yield
    # 다른 테스트의 settings 캐시 깨지 않도록 다시 import.
    importlib.import_module("work_manager.settings.base")


def test_sentry_init_skipped_when_dsn_blank(monkeypatch, reset_settings_module):
    """SENTRY_DSN 비어 있으면 sentry_sdk.init() 호출되지 않아야 한다."""
    monkeypatch.setenv("SENTRY_DSN", "")
    with mock.patch("sentry_sdk.init") as mock_init:
        # base.py 를 강제 리로드 → 모듈 최상단의 if SENTRY_DSN 분기 재실행.
        import work_manager.settings.base as base

        importlib.reload(base)
        assert mock_init.call_count == 0


def test_sentry_init_called_when_dsn_set(monkeypatch, reset_settings_module):
    """SENTRY_DSN 설정 시 sentry_sdk.init() 가 PII 비활성으로 호출."""
    monkeypatch.setenv("SENTRY_DSN", "https://public@sentry.invalid/1")
    monkeypatch.setenv("DJANGO_ENV", "test")
    with mock.patch("sentry_sdk.init") as mock_init:
        import work_manager.settings.base as base

        importlib.reload(base)

        assert mock_init.call_count == 1
        kwargs = mock_init.call_args.kwargs
        assert kwargs["dsn"] == "https://public@sentry.invalid/1"
        assert kwargs["send_default_pii"] is False
        assert kwargs["environment"] == "test"
        # 3 integrations: Django, Celery, Redis
        assert len(kwargs["integrations"]) == 3
