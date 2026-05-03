"""Specification pattern — composable predicate objects.

    spec = IsActive() & HasRole("ADMIN")
    if spec.is_satisfied_by(membership): ...
"""
from __future__ import annotations

from typing import Any, Callable


class Specification:
    def is_satisfied_by(self, candidate: Any) -> bool:  # pragma: no cover - abstract
        raise NotImplementedError

    def __and__(self, other: "Specification") -> "Specification":
        return _And(self, other)

    def __or__(self, other: "Specification") -> "Specification":
        return _Or(self, other)

    def __invert__(self) -> "Specification":
        return _Not(self)


class _And(Specification):
    def __init__(self, a: Specification, b: Specification) -> None:
        self.a, self.b = a, b

    def is_satisfied_by(self, candidate: Any) -> bool:
        return self.a.is_satisfied_by(candidate) and self.b.is_satisfied_by(candidate)


class _Or(Specification):
    def __init__(self, a: Specification, b: Specification) -> None:
        self.a, self.b = a, b

    def is_satisfied_by(self, candidate: Any) -> bool:
        return self.a.is_satisfied_by(candidate) or self.b.is_satisfied_by(candidate)


class _Not(Specification):
    def __init__(self, a: Specification) -> None:
        self.a = a

    def is_satisfied_by(self, candidate: Any) -> bool:
        return not self.a.is_satisfied_by(candidate)


class Predicate(Specification):
    """Adapt a callable into a Specification."""

    def __init__(self, fn: Callable[[Any], bool], name: str = "predicate") -> None:
        self.fn = fn
        self.name = name

    def is_satisfied_by(self, candidate: Any) -> bool:
        return self.fn(candidate)

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Predicate {self.name}>"
