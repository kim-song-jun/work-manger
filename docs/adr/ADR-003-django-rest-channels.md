# ADR-003 · Django REST Framework + Channels 채택 (백엔드)

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @tech-lead, @backend-lead

## Context

근무 관리 시스템의 백엔드는 다음을 담당해야 한다.

- REST API (`/v1/*`) — 인증, 출퇴근, 연차, 결재, 알림, 관리자
- WebSocket (`/ws/*`) — 팀 보드 실시간 상태, 결재함 실시간, 관리자 모니터링 실시간
- 비동기 / 배치 — 연차 자동 부여 / 만료, 자동 출퇴근, 52시간 컴플라이언스 모니터링, 알림 발송 outbox
- OAuth (Google, Kakao), 2FA(TOTP), 감사 로그(Audit Log)
- OpenAPI 자동 생성 → 프론트 타입 동기화 (drf-spectacular → openapi-typescript)
- Multi-tenant: `company_id` 컬럼 기반 row-level scoping (ADR-004 참조)

추가 조건:

- 팀: 백엔드 풀타임 1.5명 (MVP). 새 도메인 추가 비용을 낮게 유지해야 함.
- 한국 시장(국내 SaaS 경쟁): 한국어 문서 / 커뮤니티 / 채용시장이 풍부한 스택이 유리.
- HR 도메인은 정합성(트랜잭션)이 1순위, 처리량은 2순위.

## Decision

**Django 5 + Django REST Framework (DRF) + Channels (daphne) 를 채택한다.** 비동기는 Celery + Redis broker, 배치는 Celery Beat, OpenAPI 는 drf-spectacular.

근거:

- **ORM 성숙도**: Django ORM 은 1.x ~ 5.x 까지 관계 / 마이그레이션 / 트랜잭션 처리가 검증돼 있다. HR 처럼 정합성이 중요한 도메인에 핏.
- **DRF + drf-spectacular**: serializer 가 곧 스키마. OpenAPI 3.1 자동 생성 → CI 에서 `apps/web/src/lib/api/types.ts` 동기화 검증. 프론트 타입 안전.
- **Channels (daphne) ASGI**: WS 와 HTTP 가 같은 settings/ORM/auth 미들웨어를 공유. 별도 Node WS 서버 운영 부담 없음. `services/api/work_manager/asgi.py` 가 `ProtocolTypeRouter` 로 HTTP/WS 라우팅 + `JWTAuthMiddleware` 로 첫 메시지/쿼리스트링 인증.
- **Celery 생태계**: 큐(우선순위 분리: `notification.high`, `notification.bulk`) + Beat 스케줄러 + retry/backoff 가 표준화. 배치(연차 부여 / 자동 출퇴근 / 52시간 체크) 모두 동일 모델로 처리.
- **한국 생태계**: 채용시장 / 한국어 자료 / Stack Overflow 답변이 두텁다.

## Alternatives Considered

### 1) FastAPI + websockets + Pydantic

- **장점**:
  - async/await 네이티브 → I/O bound 워크로드에 throughput 우위.
  - 가벼움. 스키마 (Pydantic) 가 모던하고 타입 친화적.
  - WebSocket 도 일급.
- **단점**:
  - **ORM 부재**: SQLAlchemy / Tortoise / piccolo / Django ORM 직접 wiring 등 선택지가 분산. HR 도메인의 마이그레이션 / 트랜잭션 / multi-table joins 가 많은데 직접 wiring 하면 비용 큼.
  - **batteries 없음**: 인증, 권한, admin, signal, OAuth, password hash, 메일링 등 우리가 쓸 도구를 직접 조립해야 함. 풀타임 1.5명 팀에 비효율.
  - drf-spectacular 같은 "serializer = schema" 자동 생성은 FastAPI 의 Pydantic 으로 동치 가능하지만, 우리 도메인에서 schema-first 보다 ORM-first 선호.
  - 실시간을 별도 ASGI 앱으로 운영하는 비용은 비슷하지만 Django 처럼 settings/auth 공유는 어색.
- **결론**: throughput 이 1순위였다면 채택했을 것. 우리 케이스(HR 도메인, 팀 1.5명, 정합성 우선) 는 Django.

### 2) Node.js (NestJS / Express + TypeORM/Prisma + Socket.IO)

- **장점**:
  - 프론트 와 같은 언어/도구 — 풀스택 1명이 양쪽 다 다룰 수 있음.
  - Socket.IO 가 WS 채널 패턴(subscribe/publish/room) 을 내장.
- **단점**:
  - ORM (TypeORM, Prisma) 의 마이그레이션/트랜잭션 안정성이 Django ORM 대비 떨어짐(특히 복잡한 join/subquery).
  - 한국 SaaS 채용시장에서 Django/Python 풀이 더 두텁다.
  - 배치(Bull queue) 는 가능하지만 Celery 만큼 성숙하지 않음(특히 priority queue + delayed retry + monitoring).
  - 회계/연차 같은 정합성-크리티컬 도메인에서 Decimal / Money 처리 라이브러리 선택의 분산.
- **결론**: 풀스택 효율 vs HR 도메인 안정성 trade-off. HR 안정성 선택.

### 3) Django + DRF만 (Channels 제외) + 별도 Node WS

- **장점**: Django 의 단순함 유지.
- **단점**: WS 만 따로 운영하면 인증 동기화 / Redis 브로커 / 배포 토폴로지가 두 배. Channels 가 같은 ORM/auth/settings 를 공유하는 이점 큼.

### 4) FastAPI + Django ORM (혼합)

- 흥미로운 옵션이지만 운영/디버깅 불일치. 둘 중 하나로 통일이 맞다.

### 인자별 비교 (Backend Stack)

| 인자 | Django 5 + DRF + Channels | FastAPI + websockets | NestJS + Socket.IO |
|---|---|---|---|
| ORM 성숙도 | ★★★★★ Django ORM | ★★★ SQLAlchemy 별도 wiring | ★★★ Prisma/TypeORM |
| 마이그레이션 도구 | ★★★★★ Django migrations | ★★ Alembic 별도 | ★★★ Prisma migrate |
| OpenAPI 자동화 | ★★★★ drf-spectacular | ★★★★★ Pydantic 내장 | ★★★ swagger 데코레이터 |
| WS 통합 | ★★★★ Channels (같은 settings) | ★★★ websockets (별도) | ★★★★ Socket.IO |
| 배치 / 큐 | ★★★★★ Celery + Beat | ★★★★ Celery 호환 | ★★★ Bull/Agenda |
| 인증/권한 batteries | ★★★★★ allauth + DRF perm | ★★ 직접 조립 | ★★★ Passport |
| 한국 채용시장 | ★★★★★ | ★★★ | ★★★★ |
| async I/O throughput | ★★★ ASGI 부분적 | ★★★★★ 네이티브 async | ★★★★ Node 이벤트 루프 |
| HR 도메인 트랜잭션 | ★★★★★ | ★★★★ | ★★★★ |

총점: Django 가 우리 케이스에서 가장 균형.

## Consequences

### 긍정적

- **HR 도메인 정합성**: `transaction.atomic()` + `select_for_update()` 가 자연스럽다. 동시 출근 시도(`UNIQUE` 제약) / 연차 잔여 계산 / 결재 상태 전이 모두 익숙한 패턴으로 처리.
- **OpenAPI ↔ FE 타입 일치**: serializer 변경이 자동으로 OpenAPI 에 반영, CI 가 `types.ts` stale 시 실패.
- **Celery Beat 단일 책임**: `tasks/` 아래에 모든 배치(연차 grant_monthly / expire / notify_expiring, attendance.auto_clock_out, compliance.check_52h, notification.dispatch) 가 모임. 운영 가시성 높음.
- **Channels 통합**: WS 인증이 HTTP 와 동일한 SimpleJWT 토큰 사용. 디버깅 단순.
- **migrations 가 git 친화적**: schema 변경의 history 가 코드와 함께 리뷰됨.
- **drf-spectacular 의 contract test**: API 스펙이 stale 한 채 머지되는 사고 방지.
- **한국 / 글로벌 자료 풍부**: 새 백엔드 합류 시 학습 곡선 짧음.

### 부정적

- **async I/O throughput 한계**: gunicorn + sync worker 가 기본. 외부 API 호출이 많은 핫패스(예: FCM 발송)는 Celery 큐로 분리해야 함(이미 그렇게 설계). 동기 핫패스에서 외부 의존성 추가 금지.
- **ASGI/WSGI 이중 운영**: HTTP 는 gunicorn(WSGI), WS 는 daphne(ASGI). 배포 토폴로지가 약간 복잡(`apps/desktop/architecture.md` §4 참조). 헬스체크 / 인스턴스 수 별도 관리.
- **ORM 추상화 비용**: 매우 복잡한 분석 쿼리가 필요해질 때 `RawSQL` / `Subquery` 가 어색할 수 있음. 분석/리포트는 read replica + raw SQL 으로 분리 권장.
- **Django admin** 의 단점: 빠르지만 prod 운영자 도구로는 미흡(권한 세분화, 감사 로그 통합 부족). `apps/admin_api/` 의 별도 endpoint 로 우회 중.
- **Channels-Redis 단일 점**: WS pub/sub 이 Redis 죽으면 영향. `runbook.md` R-005 참조.

### 후속 / 운영 영향

- 트래픽 증가로 throughput 한계가 보이면: gunicorn worker class 를 `gthread` → `uvicorn worker` 로 전환 고려. 그래도 부족하면 일부 핫엔드포인트만 FastAPI 마이크로서비스로 분리(점진적 strangler fig).
- 모든 배치는 멱등(idempotent) 작성 강제. 재실행 안전.
- DB 마이그레이션은 forward-compatible 원칙 (operations-guide §2.3).
- 새 도메인은 `services/api/apps/<domain>/` 로 추가, `models / serializers / views / services / urls / tests` 5분할 컨벤션 유지.
