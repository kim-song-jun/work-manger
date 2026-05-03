"""Generic builder base.

Usage:
    class FooBuilder(Builder[Foo]):
        def with_x(self, x): self._x = x; return self
        def _build(self) -> Foo: ...

    foo = FooBuilder().with_x(1).build()
"""
from __future__ import annotations

from typing import Generic, TypeVar

T = TypeVar("T")


class Builder(Generic[T]):
    def build(self) -> T:
        self._validate()
        return self._build()

    # Subclasses override:
    def _validate(self) -> None:
        return None

    def _build(self) -> T:  # pragma: no cover - abstract
        raise NotImplementedError
