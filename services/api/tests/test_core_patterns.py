"""Tests for shared base patterns (Builder, Specification)."""
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
