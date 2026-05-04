# Architecture Decision Records (ADR)

설계 의사결정을 기록한다. 한 번 결정된 사항을 왜 그렇게 결정했는지 추적 가능하게 한다.

## 형식

파일명: `ADR-NNN-짧은-제목.md`

```markdown
# ADR-NNN · 제목

- **Status**: Proposed / Accepted / Superseded by ADR-XXX / Deprecated
- **Date**: YYYY-MM-DD
- **Authors**: @handle1, @handle2

## Context
어떤 상황 / 제약 / 문제가 있었는가?

## Decision
어떤 결정을 했는가?

## Alternatives Considered
검토했지만 채택하지 않은 대안과 이유.

## Consequences
긍정적 / 부정적 결과.
```

## 인덱스

| ID | 제목 | 상태 | 날짜 |
|---|---|---|---|
| [ADR-001](ADR-001-react-spa-shell-adapter.md) | React SPA 단일 코드베이스 + 셸 어댑터 | Accepted | 2026-05-04 |
| [ADR-002](ADR-002-flutter-webview-mobile.md) | Flutter WebView 채택 (모바일 셸) | Accepted | 2026-05-04 |
| [ADR-003](ADR-003-django-rest-channels.md) | Django REST + Channels 채택 (백엔드) | Accepted | 2026-05-04 |
| [ADR-004](ADR-004-postgres-single-db-multitenant-deferred.md) | PostgreSQL 단일 DB / 멀티 테넌트 v2 연기 | Accepted | 2026-05-04 |
| [ADR-005](ADR-005-design-tokens-css-vars-tailwind.md) | 디자인 토큰 = CSS 변수 + Tailwind 참조 | Accepted | 2026-05-04 |
