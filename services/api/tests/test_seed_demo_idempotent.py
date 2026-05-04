"""
Test: identity · seed_demo idempotency (regression)
Type: Integration (real Postgres; runs the actual management command)
Why:  seed_demo 가 두 번째 실행 시 NOT NULL 제약(compliance_block_when_over)
      에 막혀 IntegrityError 를 던지던 회귀를 잡는다. 데모/QA 환경에서 매번
      seed 가 실패하면 영업/QA 흐름이 끊긴다.
Covers:
  - call_command("seed_demo") 두 번 — 예외 없이 모두 성공
  - 두 번째 실행 후에도 회사 1건만 존재 (멱등 — wipe + 재시드)
Out of scope:
  - 정확한 분포 / 카운트 (test_seed_demo.py 가 다룸)
Coverage target: 회귀 회피만 — count assertion 만 수행
"""
from __future__ import annotations

import pytest
from django.core.management import call_command

from apps.identity.models import Company

pytestmark = pytest.mark.django_db


DEMO_CODE = "ACMEDM"


def test_seed_demo_runs_twice_without_exception():
    """seed_demo 를 두 번 실행해도 IntegrityError/AssertionError 없이 통과해야 한다.

    이유: 두 번째 실행에서 compliance_block_when_over NOT NULL 제약 위반
    회귀가 발생했었다.
    """
    # Arrange — clean DB
    assert Company.objects.filter(code=DEMO_CODE).count() == 0

    # Act — seed twice
    call_command("seed_demo")
    call_command("seed_demo")

    # Assert — single demo company, no exception bubbled up.
    assert Company.objects.filter(code=DEMO_CODE).count() == 1
