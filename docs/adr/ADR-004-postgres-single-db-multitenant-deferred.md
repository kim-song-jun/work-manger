# ADR-004 · PostgreSQL 단일 DB + `company_id` 행 단위 멀티 테넌트, v2 분리 연기

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @tech-lead, @backend-lead

## Context

근무 관리 시스템은 멀티 테넌트(Multi-tenant) SaaS 다. 회사(`Company`) 단위로 데이터가 격리되어야 하고, 한 사용자가 v1 에서는 한 회사에만 속한다(`docs/specs/feature-spec.md` §2.3). v2 에서 다중 법인 / SSO 가 도입될 가능성이 있다.

후보:

1. **단일 DB, 단일 schema, 모든 도메인 테이블에 `company_id` 컬럼** (Row-level multi-tenancy)
2. **단일 DB, schema-per-tenant** (Postgres schemas)
3. **DB-per-tenant** (회사마다 독립 RDS / 독립 connection)

현재 상태:

- AWS RDS (PostgreSQL 16) Multi-AZ 1대.
- 모든 도메인 테이블(`AttendanceRecord`, `LeaveRequest`, `LeaveBalance`, `OvertimeRequest`, `ApprovalTask`, `Membership`, `Department`, `Location`, `WorkSchedule`, `DeviceToken`, `NotificationLog`, `AuditLog`, ...) 에 `company` FK 가 있다(`docs/architecture/data-model.md` §2 참조).
- 인덱스: `(company_id, ...)` 로 시작하는 복합 인덱스 사용.
- 권한 미들웨어(`core/permissions.py`) 가 모든 요청에 `active_membership(request.user)` 로 회사 컨텍스트를 강제 주입.
- 회사 수: pilot 1~5, MVP ~30, growth ~200 (architecture §13).

## Decision

**단일 PostgreSQL DB + 단일 schema + 모든 도메인 테이블에 `company_id` 컬럼을 두고 row-level 로 격리한다.** v2 의 SSO / 다중 법인 / 분리 호스팅 요건이 명확해질 때까지 schema-per-tenant 또는 DB-per-tenant 분리는 연기.

격리 메커니즘:

1. **모델 레벨**: 모든 도메인 모델에 `company = models.ForeignKey(Company, on_delete=models.CASCADE)`. 인덱스는 `(company_id, ...)` 시작.
2. **쿼리 레벨**: `apps/<domain>/repositories.py` / `services.py` 의 모든 queryset 은 `filter(company_id=...)` 시작. queryset 헬퍼(`for_company(company_id)`) 로 강제.
3. **권한 레벨**: DRF 의 `IsActiveMember` permission 이 view 진입 시점에 `active_membership(request.user)` → `company` 를 결정. view/service 가 받는 `company` 는 항상 인증된 사용자의 회사.
4. **WS 레벨**: 채널 그룹명에 `company_id` 포함 (`team:{company_id}`, `inbox:{membership_id}`, `admin:{company_id}`). 다른 회사의 WS 메시지가 절대 섞이지 않음.
5. **Audit log**: `apps/audit/models.py` 의 `AuditLog.company = ForeignKey(Company, null=True, on_delete=SET_NULL)`. 회사 삭제 시에도 audit 보존.
6. **Factory / 테스트**: pytest factory 가 `company` 를 강제 인자로 요구. 누락 시 build 단계에서 실패.

## Alternatives Considered

### 1) Schema-per-tenant (Postgres schemas)

- **장점**:
  - 강한 논리 격리. 한 회사의 백업/복원이 schema 단위로 가능.
  - `search_path` 으로 ORM 쿼리에 `company_id` 강제 안 해도 됨.
  - 컴플라이언스가 빡빡한 회사에 "당사 데이터는 별도 schema" 마케팅 가능.
- **단점**:
  - **마이그레이션 복잡도 폭증**: schema 가 N 개면 `ALTER TABLE` 도 N 번. Django 의 `migrate` 가 schema 인지 안 함. `django-tenants` 같은 서드파티 의존.
  - schema 간 join 불가능 → 분석/리포트(예: 모든 회사 합계 DAU) 가 어려워짐.
  - connection pool 효율 ↓ (schema 별 search_path 전환 비용).
  - `pg_class` / `pg_attribute` 의 row 수 폭증 → catalog 부하.
  - **회사 200개 이상에서 운영 부담 큼**. 우리 capacity plan(growth ~200) 의 상한.
- **결론**: 회사가 수천 개 단위로 가지 않는 한 ROI 없음.

### 2) DB-per-tenant (회사마다 독립 RDS)

- **장점**:
  - 최강 격리. 컴플라이언스 / on-prem / 데이터 주권 요구 회사에 매력.
  - 한 회사가 무거운 워크로드를 일으켜도 다른 회사에 영향 0.
  - 회사 단위 PITR 정확.
- **단점**:
  - **운영 비용 폭증**: RDS 1대 최소 USD ~50/월 × N. MVP 단계에 비현실적.
  - 마이그레이션 / 백업 / 모니터링 / 시크릿 로테이션이 모두 N 배.
  - 코드 레벨에서 connection routing 미들웨어 필요 — 실수 한 번에 다른 회사 DB 에 쓰기 위험.
  - 회사 합계 분석은 사실상 데이터 웨어하우스 별도 구축 필요.
- **결론**: Enterprise / 정부 계약 단계(v3+) 가 와야 의미 있음.

### 3) 단일 DB + Postgres Row-Level Security (RLS)

- **장점**:
  - 격리가 DB 레벨. 코드 실수가 있어도 RLS 가 막음.
  - GDPR / 개인정보 컴플라이언스 감사 시 명확한 방어선.
- **단점**:
  - Django ORM 과의 통합이 거칠다(connection 마다 `SET app.current_tenant = ...` 강제 필요).
  - 디버깅 시 "왜 row 가 안 보이지" 가 RLS 정책 때문일 수 있어 학습 비용.
  - 우리는 이미 view/service 레이어에서 `company_id` 강제 중 — RLS 는 **2nd layer defense** 로 추가 가능. 채택 자체를 배제하지는 않지만 v1 단계의 우선순위 아님.
- **결론**: 현재 결정에 보완으로 v1.x 중반 검토. RLS 추가 자체는 schema 변경 없이 가능.

### 4) 멀티 테넌트 라이브러리 (`django-tenants`)

- 채택하면 schema-per-tenant 강제. 단점은 위 (1) 과 동일.

## Consequences

### 긍정적

- **개발 / 운영 단순**: 마이그레이션 1번, 백업 1개, 모니터링 1셋. MVP ~ growth 단계에 적합.
- **분석 / 리포트가 자연스럽다**: `GROUP BY company_id` 로 모든 회사 통합 통계 즉시.
- **트랜잭션 일관성**: 한 트랜잭션 안에서 여러 도메인 테이블 동시 수정 가능(예: 결재 승인 → 연차 잔여 차감 → 알림 outbox 삽입).
- **테스트 편의**: factory 가 `company` 만 만들면 격리된 픽스처. test DB 1개로 모든 테스트 공유.
- **회사 단위 복원**: PITR 으로 시점 복원 후 해당 `company_id` 만 export → 새 회사로 import 가능.
- **비용 효율**: RDS 1대로 ~30 ~ ~200 회사 커버.

### 부정적

- **격리는 코드 신뢰에 의존**: view/service 에서 `company_id` 누락 시 잠재적 데이터 누출. 완화책:
  - factory/queryset 헬퍼 강제 인자
  - DRF permission 강제 진입점
  - 코드 리뷰 체크리스트 (`docs/guidelines/engineering-guidelines.md`)
  - CI 정적 분석 — `objects.all()` / `.objects.filter()` 에 `company_id` 가 없으면 경고 룰 (개선 항목).
  - 추후 RLS 2nd layer 옵션.
- **노이즈 이웃(noisy neighbor)**: 한 큰 회사가 IO 집중 → 다른 회사 영향. 완화: read replica 활용, slow query 알림, 회사별 rate limit.
- **회사 데이터 완전 삭제 비용**: `Company.delete()` 가 거대한 cascade 트리거. 비동기 / 배치로 처리 권장 (SOP-data-deletion-request 참조).
- **회사 단위 PITR 곤란**: 시점 복원이 DB 전체 단위. 한 회사만 되돌리려면 export/import 또는 selective restore 필요.
- **컴플라이언스 마케팅 한계**: "고객사 데이터는 물리적으로 분리" 라는 약속을 못 함. v2 Enterprise tier 에서 옵션 가능하게.

### v2 / 후속 전략 (SSO, 다중 법인 pivot)

다음 트리거가 발생하면 **schema-per-tenant 또는 DB-per-tenant** 로 점진 마이그레이션을 검토한다.

- 회사 수가 ~500 을 넘고, 그 중 10%+ 가 자체 컴플라이언스 감사 요구
- 한 사용자가 여러 회사(법인) 에 동시 소속 — 다대다(M:N) 멤버십 패턴이 구축됨
- SSO (SAML / OIDC) 도입 시 IdP 단위 격리 요구
- 한국 대기업 그룹사 — 모회사/계열사 단위 데이터 주권 요구

마이그레이션 경로:

1. 단일 DB 유지 + RLS 추가 (1차 방어선 강화). 코드 변경 최소.
2. 큰 고객만 별도 schema/DB 로 분리 (hybrid). connection routing 미들웨어 추가.
3. 자동 provisioning — 회사 생성 시 schema/DB 자동 생성 + secrets manager 등록.

이 ADR 의 결정은 v2 시점에 명시적으로 supersede 가능. 현재 단계에서 도입할 비용은 정당화되지 않는다.
