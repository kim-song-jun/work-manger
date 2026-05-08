---
persona: admin
task: 02-iter12-live-test-fix
date: 2026-05-08
author: qa-admin
---

# ADMIN 페르소나 Finding 보고서

> 코드 리뷰 + 시나리오 워크스루 기반 static audit (iter11 HEAD `84d0aa0`)
> 검증 대상: AdminSettingsPage / 승인 bulk / expiring-leave / 회사 코드 / 컴플라이언스 / 감사 로그 / 권한 경계 / OpenAPI drift

---

## Finding 목록

### F-ADMIN-01: 감사 로그 API 응답 필드 불일치 — 타임스탬프·수행자 컬럼 전부 공백

- Severity: P0
- Where: `services/api/apps/audit/views.py:74-80` (응답 직렬화) / `apps/web/src/entities/audit/model/types.ts:6,9` (FE 타입) / `apps/web/src/entities/audit/api/fetchAudit.ts:26-28` (pass-through, 변환 없음)
- Repro:
  1. ADMIN 계정으로 `/admin/audit` 접속
  2. 임의 필터 없이 감사 로그 조회
  3. 타임스탬프 컬럼(시각), 수행자(수행자) 컬럼이 모두 공백으로 출력됨
- Expected: 각 행에 ISO timestamp(`at`) + 수행자 이름(`actor_name`) 표시
- Actual: BE는 `created_at` 키 + `actor_id` 키를 반환. FE `AuditEntry` 타입은 `at` + `actor_name` 필드를 기대. `fetchAudit` 에 매핑 변환이 없으므로 `row.at === undefined`, `row.actor_name === undefined` → 두 컬럼 모두 공백 렌더링
- Suggested fix: `backend-dev` — `services/api/apps/audit/views.py` 응답에 `"at": r.created_at.isoformat()` 추가, `"actor_name": r.actor.name if r.actor_id else None` 추가 (actor는 이미 `select_related("actor")` 로드됨). 또는 `frontend-dev` — `fetchAudit.ts` 에서 `r.data.items` 를 `{ ...item, at: item.created_at, actor: item.actor_id ?? "", actor_name: item.actor_name ?? null }` 로 변환. BE 수정 쪽이 SSOT 유지에 적합.

---

### F-ADMIN-02: OpenAPI types drift — iter11 신규 5개 엔드포인트 미등록

- Severity: P1
- Where: `apps/web/src/shared/api/openapi-types.ts` (1행: AUTO-GENERATED) / `services/api/apps/admin_api/views_bulk.py` (4개 뷰함수) / `services/api/apps/admin_api/urls.py:18-19`
- Repro:
  1. `npm run types:gen` 실행 (현재 생성 기준 스키마 조회)
  2. `openapi-types.ts` 에서 다음 경로 검색: `GET /v1/admin/settings`, `PATCH /v1/admin/settings/update`, `POST /v1/admin/approvals/bulk`, `PATCH /v1/admin/approvals/{task_id}`, `GET /v1/admin/leave/expiring`
  3. 모두 미등록 (no match)
- Expected: 5개 신규 엔드포인트가 `paths` + `operations` 인터페이스에 포함됨
- Actual: `openapi-types.ts` 의 `paths` 에 `/v1/admin/settings`, `/v1/admin/approvals/bulk`, `/v1/admin/approvals/{task_id}` (PATCH), `/v1/admin/leave/expiring` 없음. `views_bulk.py` 에 `@extend_schema` 어노테이션 0건 — drf-spectacular 스키마 자동 감지에 실패한 것으로 보임 (FBV + `@api_view` 조합은 추가 어노테이션이 필요한 경우 있음)
- Suggested fix: `backend-dev` — `views_bulk.py` 의 4개 `@api_view` 함수에 `@extend_schema(...)` 추가 후 `npm run types:gen` 재실행 → git diff clean 확인. `ExportReportView` CBV는 이미 등록됨 (참고).

---

### F-ADMIN-03: decide_approval(single) ALREADY_DECIDED — 문서상 409 vs 실제 422 불일치

- Severity: P1
- Where: `services/api/apps/admin_api/views_bulk.py:145,154` / `services/api/core/errors.py:79-82`
- Repro:
  1. ADMIN이 이미 승인된(APPROVED) 건에 대해 `PATCH /v1/admin/approvals/<uuid>` 요청
  2. 응답 HTTP 상태 확인
- Expected: 함수 docstring(145행)은 "returns 409 ALREADY_DECIDED" 명시 → HTTP 409
- Actual: `raise Unprocessable(code="ALREADY_DECIDED", ...)` → `Unprocessable.status_code = 422`. FE `batchDecide.ts` 는 bulk 경로를 사용하지만, 개별 `decideApproval` (`fetchApprovals.ts:58-65`) 경로에서 ALREADY_DECIDED를 받으면 `onError: () => toast.show(t("admin.common_error"))` 만 처리 — 사용자에게 "이미 처리된 건" 이라는 구체적 안내 없음
- Suggested fix: `backend-dev` — `raise Unprocessable` → `raise Conflict(code="ALREADY_DECIDED", message="이미 처리된 항목입니다.")` 로 변경 (HTTP 409). 또는 docstring을 422로 정정. `frontend-dev` — `decideApproval` 호출부에서 `ALREADY_DECIDED` 코드 파싱 후 전용 메시지 toast 표시.

---

### F-ADMIN-04: 승인 bulk 결정 — 부분 실패(failed_ids) 시 사용자 안내 없음

- Severity: P1
- Where: `apps/web/src/pages/admin-approvals/index.tsx:29` (`onSuccess` handler)
- Repro:
  1. 10건 중 3건이 ALREADY_DECIDED 상태인 상황에서 전체 선택 후 "일괄 승인" 클릭
  2. API 응답: `{ total:10, succeeded:7, failed:3, failed_ids:[...] }`
  3. toast 메시지 확인
- Expected: "7/10 처리됨. 3건 실패 (이미 처리된 건)" 또는 별도 failed_ids 상세 안내
- Actual: `toast.show(\`${out.succeeded}/${out.total}\`)` 만 출력 — 실패 여부/이유 미표시. `out.failed > 0` 조건 분기 없음
- Suggested fix: `frontend-dev` — `apps/web/src/pages/admin-approvals/index.tsx` `onSuccess` 내에서 `out.failed > 0` 일 때 별도 경고 toast 또는 인라인 배너 표시. `out.failedIds` 목록도 접근 가능하므로 구체적 ID 안내 추가 가능.

---

### F-ADMIN-05: expiring-leave 페이지 기준일 설명 오표시 (30일 vs BE 60일)

- Severity: P2
- Where: `apps/web/src/pages/admin-expiring-leave/index.tsx:7` (`const EXPIRING_DAYS = 30`) / `services/api/apps/leave/repositories.py:20` (`DEFAULT_EXPIRING_WINDOW_DAYS = 60`)
- Repro:
  1. `/admin/expiring-leave` 페이지 접속
  2. 부제목 확인: "30일 이내 소멸 위험" (ko) 표시
  3. 실제 BE는 `today + 60일` 이내 만료되는 연차를 집계하여 반환
- Expected: FE 부제목 기준일 == BE 집계 기준일 (60일)
- Actual: FE `EXPIRING_DAYS = 30` vs BE `DEFAULT_EXPIRING_WINDOW_DAYS = 60` → 사용자에게 잘못된 정보("30일") 표시
- Suggested fix: `frontend-dev` — `EXPIRING_DAYS = 60` 으로 수정. 또는 `backend-dev` — API 응답에 `window_days` 필드를 포함해 FE가 동적으로 읽도록 수정 (SSOT 강화). 단순 수정은 FE 상수값 변경으로 충분.

---

### F-ADMIN-06: 회사 가입 코드 생성/취소 — audit log 미기록

- Severity: P1
- Where: `services/api/apps/identity/onboarding_views.py:255-292` (`company_codes` POST / `revoke_company_code` DELETE)
- Repro:
  1. ADMIN으로 `/admin/codes` 에서 신규 코드 발급
  2. `/admin/audit` 에서 action 필터 `company_code.*` 로 조회
  3. 발급/취소 이벤트 없음
- Expected: 코드 발급 시 `company_code.created`, 취소 시 `company_code.revoked` audit log 기록 (docs/manuals/admin-company-codes.md 요구사항)
- Actual: `onboarding_views.py` 에 `from apps.audit.services import record` import 없음, `audit_record(...)` 호출 없음
- Suggested fix: `backend-dev` — `onboarding_views.py` 에 `from apps.audit.services import record as audit_record` 추가. `company_codes` POST 성공 후 `audit_record(request.user, "company_code.created", company=membership.company, request=request, payload={"code": obj.code, "max_uses": obj.max_uses})`. `revoke_company_code` 성공 후 `audit_record(request.user, "company_code.revoked", company=membership.company, request=request, payload={"code_id": str(code_id)})`.

---

### F-ADMIN-07: audit log 90일 보존 — 자동 만료/정리 배치 없음

- Severity: P1
- Where: `services/api/apps/audit/` (services.py, models.py) — 파일 전체에 90일 만료 로직 없음
- Repro:
  1. `services/api/apps/audit/` 전체 검색: `retention`, `purge`, `90`, `timedelta`
  2. Django Celery Beat 스케줄 마이그레이션 파일 없음 (`ls migrations/` → `0001_initial.py` 만 존재)
- Expected: operations-guide §11 "audit log 90일 보존" 정책 구현 — 91일 이전 행 자동 삭제 배치 (Celery Beat PeriodicTask) 또는 DB 파티셔닝/TTL 정책
- Actual: `AuditLog` 모델에 `created_at` 인덱스만 있음. 자동 정리 배치 없음. 시간이 지나면 무제한 누적.
- Suggested fix: `backend-dev` — `apps/audit/tasks.py` 에 `purge_old_audit_logs()` Celery task 추가 (매일 새벽 3시 실행, 90일 이전 삭제). `apps/audit/migrations/0002_seed_audit_purge_beat.py` 로 PeriodicTask 등록.

---

### F-ADMIN-08: AdminSettingsPage — 저장 바 ADMIN 로그인 시 완전히 숨김 (ADMIN 상태 확인 불가)

- Severity: P2
- Where: `apps/web/src/pages/admin-settings/index.tsx:146` (`{isOwner && ( ... sticky save bar ... )}`)
- Repro:
  1. ADMIN 역할 계정으로 `/admin/settings` 접속
  2. 설정 필드들이 모두 `disabled` (올바름)
  3. 저장/취소 버튼 자체가 DOM에 없음
- Expected: ADMIN은 수정 불가임이 명확하나, 비활성 상태의 저장 버튼 또는 "소유주 권한 필요" 인라인 힌트가 있어야 혼란 방지
- Actual: `{isOwner && ...}` 조건이 ADMIN에서 save bar DOM을 완전히 제거. 사용자가 disabled 이유를 UI에서 파악하기 어려움. 부제목(`settings_sub_admin`)에 안내가 있지만 sticky 영역이 아예 없어서 스크롤 후 저장 시도 자체 불가 여부를 알 수 없음.
- Suggested fix: `frontend-dev` — ADMIN 시 `{!isOwner && dirty && <div style={{ ... color: "var(--grey-500)", ... }}>소유주만 저장할 수 있어요</div>}` 또는 저장 버튼을 `disabled + title="소유주 권한 필요"` 로 유지. P2 수준 UX 개선.

---

### F-ADMIN-09: ApprovalKind `"outwork"` 타입 — BE TargetType 미존재, deadcode

- Severity: P2
- Where: `apps/web/src/entities/approval/model/types.ts:2` / `apps/web/src/shared/i18n/index.ts:419` / `services/api/apps/approval/models.py:11-14`
- Repro:
  1. `apps/approval/models.py` `TargetType` 확인 → `OVERTIME | LEAVE | MANUAL_CLOCK_IN | TRIP` 만 존재
  2. FE `ApprovalKind` 에는 `"outwork"` 포함
  3. i18n에 `appr_kind_outwork` 키 존재
- Expected: FE 타입/i18n이 BE enum과 정확히 일치
- Actual: BE에 `OUTWORK` 없음 → `"outwork"` 종류 데이터는 실제 존재 불가. `appr_kind_outwork` i18n key 및 `ApprovalKind` 타입에서 deadcode.
- Suggested fix: `frontend-dev` — `ApprovalKind` 에서 `"outwork"` 제거, `apps/web/src/shared/i18n/index.ts` 에서 `appr_kind_outwork` 제거. 또는 `backend-dev` — `OUTWORK = "OUTWORK"` 을 BE TargetType에 추가 (비즈니스 요구가 있는 경우). 현재 요구사항 근거 없으면 FE 쪽 제거.

---

## 요약

| ID | Severity | 영역 | 내용 |
|---|---|---|---|
| F-ADMIN-01 | P0 | BE/FE | 감사 로그 API 응답 필드 불일치 (`created_at`→`at`, `actor_id`→`actor_name`) — 타임스탬프·수행자 전부 공백 렌더링 |
| F-ADMIN-02 | P1 | BE | OpenAPI drift — 5개 iter11 신규 엔드포인트 `openapi-types.ts` 미등록 |
| F-ADMIN-03 | P1 | BE/FE | `ALREADY_DECIDED` HTTP 422 반환 vs docstring 409 명세 불일치 + FE 전용 메시지 없음 |
| F-ADMIN-04 | P1 | FE | bulk 승인 부분 실패(`failed_ids`) UX 미처리 — toast가 성공/총수만 표시 |
| F-ADMIN-05 | P2 | FE | expiring-leave 기준일 30일 vs BE 60일 오표시 |
| F-ADMIN-06 | P1 | BE | 회사 가입 코드 발급/취소 audit log 미기록 |
| F-ADMIN-07 | P1 | BE | audit log 90일 보존 Celery 배치 없음 |
| F-ADMIN-08 | P2 | FE | AdminSettingsPage ADMIN 접속 시 저장 바 완전 숨김 — 권한 힌트 부재 |
| F-ADMIN-09 | P2 | FE/BE | `ApprovalKind "outwork"` BE TargetType 미존재 deadcode |

P0: 1건 / P1: 5건 / P2: 3건
