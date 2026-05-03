"""
Test: core · Builder + Specification base patterns
Type: Unit (pure Python, no DB / no I/O — sub-millisecond)
Why:  엔지니어링 가이드라인 §3 에서 Builder 와 Specification 을 도메인 전반에 사용.
      베이스 자체가 깨지면 attendance.builders / leave.strategies 등 파생 코드가 모두 무너진다.
      회귀 비용이 가장 높은 1차 의존성이라 최우선 보호 대상.
Covers:
  - core.builders.Builder — 빌드 호출 흐름, 검증 단계, 체이닝 self 반환
  - core.specifications.Specification — AND / OR / NOT 결합, Predicate 어댑터
Out of scope:
  - 도메인 빌더 (attendance.builders 는 test_attendance_builder.py)
Coverage target: 100% for core/builders.py + core/specifications.py
"""
from __future__ import annotations

import pytest

from core.builders import Builder
from core.specifications import Predicate


class _Toy:
    def __init__(self, n: int, label: str) -> None:
        self.n, self.label = n, label


class _ToyBuilder(Builder[_Toy]):
    def __init__(self) -> None:
        self._n = None
        self._label = "default"

    def with_n(self, n: int) -> "_ToyBuilder":
        self._n = n
        return self

    def with_label(self, label: str) -> "_ToyBuilder":
        self._label = label
        return self

    def _validate(self) -> None:
        if self._n is None:
            raise ValueError("n required")
        if self._n < 0:
            raise ValueError("n must be >= 0")

    def _build(self) -> _Toy:
        return _Toy(self._n, self._label)


def test_builder_happy_path():
    t = _ToyBuilder().with_n(7).with_label("seven").build()
    assert (t.n, t.label) == (7, "seven")


def test_builder_validates_required():
    with pytest.raises(ValueError, match="n required"):
        _ToyBuilder().build()


def test_builder_validates_constraint():
    with pytest.raises(ValueError, match="n must be >= 0"):
        _ToyBuilder().with_n(-1).build()


def test_builder_chain_returns_self():
    b = _ToyBuilder()
    assert b.with_n(1) is b
    assert b.with_label("x") is b


def test_specification_and_or_not():
    is_pos = Predicate(lambda x: x > 0, "pos")
    is_even = Predicate(lambda x: x % 2 == 0, "even")
    pos_and_even = is_pos & is_even
    pos_or_even = is_pos | is_even
    not_pos = ~is_pos

    assert pos_and_even.is_satisfied_by(2)
    assert not pos_and_even.is_satisfied_by(-2)
    assert pos_or_even.is_satisfied_by(-2)
    assert not pos_or_even.is_satisfied_by(-3)
    assert not_pos.is_satisfied_by(-1)
    assert not not_pos.is_satisfied_by(1)
