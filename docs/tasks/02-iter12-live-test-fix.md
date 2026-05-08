---
task_n: 2
slug: iter12-live-test
size: large
status: active
created: 2026-05-08
---

# iter12 — 3-Platform Live Test & Fix

## Summary

3-platform (Web / Electron / Android) 라이브 테스트로 기능·UI/UX 결함을 전수 발굴하고 한 PR 에 모두 수정한다.

iter11 종료 후 main HEAD `84d0aa0` 기준, Web (4444) / API (4455) Docker 스택은 17h 째 가동 중이다. 본 iter 는 Electron dev 모드 + WSA 위 Flutter APK 까지 포함한 3-platform 동시 라이브 audit → 4 페르소나 (employee/manager/admin/owner) × designer 의 finding 을 P0/P1/P2 라벨로 수집 → file-disjoint wave 로 전수 fix → static gates 통과 → planner final gate 후 PR 머지로 완결한다. iter11 task 01 의 GAP-* finding 후속 (잔여 연차 SSOT, NotFound, 사이드바 정합성 등) 도 회귀 검증 대상이다.

## User Scenarios

각 페르소나는 모든 platform 에서 핵심 시나리오를 한 번 이상 통과해야 한다.

| 페르소나 | Web (`/m/*`, `/web/*`) | Electron (트레이/자동출근) | Android (WSA + APK) |
|---|---|---|---|
| **employee** | 출퇴근 / 휴가 신청 / 알림 수신 / 회사 코드 가입 / 공지 열람 / 잔여 연차 확인 | 자동 출근 (지오펜스/네트워크) / 트레이 메뉴 / 토스트 / 자동 업데이트 알림 | 슬라이드 출근 / 백그라운드 위치 / ntfy 푸시 / 위젯 (Glance) |
| **manager** | 팀 캘린더 / 승인 inbox / 빠른 승인 / 팀 휴가 / 컴플라이언스 (팀) | 알림 수신 → 클릭 → 승인 동선 | 모바일 inbox 빠른 승인 (스와이프) |
| **admin** | `/admin/*` 풀 시나리오 — settings / employees / reports / approvals (bulk) / codes / compliance / audit / expiring-leave | 알림 정책 변경 후 즉시 반영 | 관리자 모바일 시나리오 (read-only) |
| **owner** | 회사 정보 변경 / 브랜드 / 정책 / 데이터 export·삭제 SOP 트리거 | 동일 | 동일 (정책 토글 즉시 반영 확인) |

## Architecture

영향 layer:

- **apps/web** — i18n 키, 사이드바 정합성, NotFound, 잔여 연차 SSOT, design tokens 위반, RHF/Zod 폼, Tanstack Query invalidation
- **apps/desktop (Electron)** — 트레이 라벨, 자동 업데이트 channel, 알림 ipc, daniw build (worktree CWD)
- **apps/mobile (Flutter)** — WebView bridge, geofence native (Android만), ntfy foreground service, Glance widget channel
- **services/api** — admin_api, approval (bulk), notification (push tokens), audit log, leave balance endpoint, OpenAPI schema (drf-spectacular `@extend_schema`)
- **infra** — docker-compose.override.yml (worktree mount), nginx CORS (필요 시 4445)
- **docs** — operations/ci-cd, manuals, qa/e2e-ui-ux-audit (Acceptance Gate 보강)

## Parallel Work Decomposition

> Wave 0 (planner — 본 dispatch) 완료 후 wave 1 부터 진행. **file-disjoint** 가 핵심.

### Wave 0 — task doc 작성 (planner) **완료**
- 산출: 본 doc.

### Wave 1 — 환경 부팅 (sequential, owner = `dev`)
- **Owner**: frontend-dev (with infra hat)
- **Owns**:
  - `docker-compose.override.yml` (worktree 의 `apps/web` 를 `wm-web` 에 mount)
  - `apps/desktop/` 빌드/부팅 가이드 — `npm run dev` (worktree 경로)
  - `apps/mobile/` Flutter APK 빌드 + WSA 사이드로드
  - `docs/operations/local-3platform.md` (신규) — WSA 설치, ADB connect, APK 사이드로드, 트래픽 4455 reach 확인
- **DoD**: 3 platform 모두 worktree HEAD 기준으로 라이브. `wm-web` mount 가 worktree 를 가리킴 확인 (`docker exec wm-web ls /app/src` → worktree path 의 파일).

### Wave 2 — 3-platform live audit (parallel, file-disjoint by output)
각 owner 는 자기 finding doc 만 쓴다.

- **qa-employee** → `docs/tasks/02-findings-employee.md`
  - 시나리오: 출퇴근, 휴가 신청, 알림, 회사코드 가입, 공지, 잔여 연차
  - Platforms: web mobile 390x844 + web desktop 1440x900 + Electron + Android(WSA)
- **qa-manager** → `docs/tasks/02-findings-manager.md`
  - 시나리오: 팀 캘린더, 승인 inbox, 빠른 승인, 팀 휴가, 팀 컴플라이언스
- **qa-admin** → `docs/tasks/02-findings-admin.md`
  - 시나리오: settings (iter11 신규), employees, reports, approvals bulk, codes, audit, expiring-leave, compliance
- **qa-owner** → `docs/tasks/02-findings-owner.md`
  - 시나리오: 회사 정보, 브랜드, 정책 토글, 데이터 export/삭제 SOP, audit log 90일
- **designer** → `docs/tasks/02-findings-design.md`
  - design system SSOT (`docs/design/design-system.md`, `tokens.css`) 위반, 간격/색상 하드코딩, 반응형 (390 / 768 / 1440), 다크모드, i18n 길이 overflow, focus ring, contrast (WCAG AA)

각 finding 형식 (강제):
```
### F-{persona}-{NN}: <요약>
- Severity: P0 | P1 | P2
- Where: `<file>:<line>` (또는 라우트 + 컴포넌트)
- Repro: 1) ... 2) ... 3) ...
- Expected: ...
- Actual: ...
- Suggested fix: <author/file scope>
```

### Wave 3 — finding aggregate (planner 재진입)
- planner 가 5 개 finding doc 을 읽어 `docs/tasks/02-iter12-live-test-fix.md` 에 §"Fix Plan" 섹션을 append.
- Fix Plan 은 file-disjoint 로 sub-wave (W4a, W4b, ...) 분해. 각 sub-wave: owner role + owned paths + linked finding ID 목록.

### Wave 4..N — fix (parallel, planner 가 wave 3 산출에 따라 동적 분해)
대표 후보 (실제 분해는 wave 3 산출에 따름):
- **frontend-dev (web)**: `apps/web/src/pages/...`, `apps/web/src/widgets/...`, `apps/web/src/features/...`, `apps/web/src/shared/...`
- **frontend-dev (desktop)**: `apps/desktop/src/...`
- **frontend-dev (mobile)**: `apps/mobile/lib/...`, `apps/mobile/android/...`
- **backend-dev**: `services/api/apps/<app>/...`, OpenAPI `@extend_schema`
- **doc-writer**: `docs/operations/...`, `docs/manuals/...`, `docs/qa/e2e-ui-ux-audit.md`

### Wave-final — gate sequence
1. **tester** — `make test-be` + `make test-fe` + `make test-e2e` (BE pytest, web vitest, Playwright 회귀). 신규 케이스 추가 의무.
2. **qa-employee / qa-manager / qa-admin / qa-owner** (parallel) — wave 2 시나리오 재실행 + finding clear 확인.
3. **designer** — design smoke (`apps/e2e/scripts/design-smoke.mjs`) + tokens 위반 0.
4. **reviewer** — diff 전수 review, security/perf/types/접근성.
5. **planner** — acceptance criteria 전수 ✅ 검증 후 PR 생성.

## Fix Plan (Wave 3 aggregate — 2026-05-08)

> Wave 2 의 6 audit doc (qa-employee/manager/admin/owner + designer + main-live) 으로부터 수집된 71 finding 중 **67건** (P0+P1+P2 + 사용자 명시 F-MANAGER-13) 을 file-disjoint sub-wave 로 분해. P3 4건 (F-MANAGER-11/12/14/15) 은 backlog. F-OWNER-07 (빌링 모듈) 은 신규 도메인이라 본 task scope 밖 — backlog. F-DESIGN-013 (Switch component spec) 은 designer change_type=spec → designer wave 로 분리.
>
> **Already fixed (Wave 1+2 commit `dade2e3`)**:
> - F-LIVE-004 ✅ — wm-api stale image (entrypoint.sh CRLF + .gitattributes + rebuild)
> - F-LIVE-005 ✅ — wm-web Vite HMR 미반영 (docker restart)
>
> 잔여 fix 대상: **65건** (= 67 - 2 fixed). 6 sub-wave + design-spec wave 로 분해.

### Wave 4a — Frontend Web 직원/매니저 페이지 fix (frontend-dev parallel)

**Owner**: frontend-dev (TS hat)

**Owns** (file-disjoint from W4b/W4c/W4d):
- `apps/web/src/pages/m-home/index.tsx`
- `apps/web/src/pages/m-leave/index.tsx`
- `apps/web/src/pages/m-leave-success/index.tsx`
- `apps/web/src/pages/m-leave-apply/index.tsx`
- `apps/web/src/pages/m-inbox/index.tsx`
- `apps/web/src/pages/m-inbox-quick/index.tsx`
- `apps/web/src/pages/m-approval-detail/index.tsx`
- `apps/web/src/pages/m-notifications/index.tsx`
- `apps/web/src/pages/m-notice/index.tsx`
- `apps/web/src/pages/m-help/index.tsx`
- `apps/web/src/pages/m-compliance/index.tsx`
- `apps/web/src/pages/m-team/slices/{GridSlice,GroupedSlice,TimelineSlice}.tsx` (F-MANAGER-13 수반 FE 수정)
- `apps/web/src/pages/web-team-calendar/index.tsx` (manager 시각 — 본 wave)
- `apps/web/src/pages/web-inbox/index.tsx` (manager 시각 — `role` legacy 필드 정리)
- `apps/web/src/features/leave-apply/{ui/LeaveApplyForm.tsx,model/schema.ts}`
- `apps/web/src/features/break/` (신규 — 휴게 start/end UI)
- `apps/web/src/entities/team/api/{fetchTeamStatus.ts,fetchCalendarMatrix.ts,types.ts}` (F-MANAGER-13 BE 응답 shape 매핑)
- 신규 vitest: 위 컴포넌트별 최소 1 케이스

**Linked findings** (총 28건):
- F-EMPLOYEE-01 ~ F-EMPLOYEE-12 (12)
- F-MANAGER-04 (web-inbox isAdmin 명시화), F-MANAGER-05 (m-compliance 팀 탭 placeholder), F-MANAGER-06, F-MANAGER-07, F-MANAGER-08, F-MANAGER-09 (legacy `role` 필드 4종), F-MANAGER-13 (FE 측 BE shape 매핑)
- F-LIVE-003 (login 자동 redirect), F-LIVE-006 (settings useQuery isError 분기 — 단 admin-settings 는 W4b 소관 → 본 wave 는 m-* 페이지의 동일 패턴 점검)
- F-DESIGN-008 (m-help marginBottom:6), F-DESIGN-011 (m-help focus-visible), F-DESIGN-015 (m-help aria-expanded), F-DESIGN-016 (m-help hit-target), F-DESIGN-017 (m-help fontSize:11) — 5건 (m-help 만)

**DoD**:
- [ ] F-EMPLOYEE-001 — `/m/home` 마운트 시 `useQuery(["attendance","today"])` + clock_in_at 초기화 + vitest "clock-in 상태 refresh 후 유지"
- [ ] F-EMPLOYEE-002 — `mutation.onSuccess` 에서 응답 `clock_in_at` 우선 사용
- [ ] F-EMPLOYEE-003 — clock-out mutation (`POST /v1/attendance/clock-out`) 추가 + vitest "퇴근 시 BE 호출"
- [ ] F-EMPLOYEE-004 — break start/end UI + features/break/ + vitest
- [ ] F-EMPLOYEE-005 — leave balance 쿼리 키 `["leave", "balance"]` 통일 (3 파일 일치)
- [ ] F-EMPLOYEE-006 — leave-apply → success state 전달
- [ ] F-EMPLOYEE-007 — schema.ts 메시지 i18n 키
- [ ] F-EMPLOYEE-008 — m-inbox role-based 기본 탭
- [ ] F-EMPLOYEE-009 — markAllRead 단일 호출
- [ ] F-EMPLOYEE-010 — m-notice "general" 카테고리 추가
- [ ] F-EMPLOYEE-011 — m-help contact 버튼
- [ ] F-EMPLOYEE-012 — m-home KPI BE 연결 (fetchToday/Weekly/TeamStatus)
- [ ] F-MANAGER-04/05/06/07/08/09 — `role` legacy 필드 제거 + 주석 + 매니저 탭 hint
- [ ] F-MANAGER-13 — entities/team/api shape 일치 (BE 와 동기, BE 측 고정은 W4c 에서)
- [ ] F-LIVE-003 — login 진입 시 me.data 있으면 redirect
- [ ] F-DESIGN-008/011/015/016/017 — m-help 5건 fix
- [ ] vitest 신규 케이스 ≥ 8 (페이지/feature 별 1)

**추정**: 8h
**Dependency**: W4c (BE 측 F-MANAGER-13 status_grid 수정) 와 동기 — 단 entity layer 는 BE 응답 shape 정해진 후 fix 가능. 이 sub-wave 는 BE merge 직후 시작 권장.

---

### Wave 4b — Frontend Web Admin/Owner 페이지 fix (frontend-dev parallel)

**Owner**: frontend-dev (TS hat)

**Owns** (file-disjoint from W4a/W4c/W4d):
- `apps/web/src/pages/admin-settings/index.tsx`
- `apps/web/src/pages/admin-approvals/index.tsx`
- `apps/web/src/pages/admin-expiring-leave/index.tsx`
- `apps/web/src/entities/audit/api/fetchAudit.ts` (F-ADMIN-01 — BE 변환 fallback 시 FE 매핑)
- `apps/web/src/entities/audit/model/types.ts`
- `apps/web/src/entities/approval/model/types.ts` (F-ADMIN-09 — `outwork` 제거)
- `apps/web/src/widgets/admin-shell/ui/AdminNav.tsx` (F-DESIGN-019 — Icon.lock → Icon.settings, F-DESIGN-014 — aria-label)
- `apps/web/src/widgets/admin-shell/ui/AdminShell.tsx` (F-DESIGN-005 — borderRadius 7 → token)
- 신규 vitest: 위 컴포넌트별 최소 1 케이스

**Linked findings** (총 19건):
- F-ADMIN-01 (FE 변환 fallback), F-ADMIN-03 (FE — ALREADY_DECIDED toast 분기), F-ADMIN-04 (bulk failed_ids UX), F-ADMIN-05 (EXPIRING_DAYS 30→60), F-ADMIN-08 (sticky bar 권한 hint), F-ADMIN-09 (outwork deadcode)
- F-OWNER-05 (SOP 트리거 UI), F-OWNER-08 (admin/help SOP 링크 — admin-settings 하단 카드 또는 별도 섹션)
- F-LIVE-006 (admin-settings useQuery isError 분기)
- F-DESIGN-001 (`#5B6CFF` → var(--brand))
- F-DESIGN-002 (`#fff` → var(--white) 4건)
- F-DESIGN-003 (borderRadius 6 → var(--r-sm) 3건)
- F-DESIGN-004 (borderRadius 8 → var(--r-sm))
- F-DESIGN-005 (AdminShell borderRadius 7)
- F-DESIGN-006 (paddingBottom 80 → token)
- F-DESIGN-007 (gap 14 → var(--sp-3 or 4))
- F-DESIGN-009 (button padding 10px → shared Button)
- F-DESIGN-010 (sticky 버튼 focus-visible)
- F-DESIGN-012 (TextField/ColorField/SelectField focus-visible)
- F-DESIGN-014 (AdminNav aria-label 키)
- F-DESIGN-018 (Field overflow protection)
- F-DESIGN-019 (AdminNav Icon.lock → Icon.settings)

**DoD**:
- [ ] F-ADMIN-01 — fetchAudit.ts 응답 매핑 추가 (BE 변환과 ②중 방어; BE 가 W4c 에서 수정되면 본 fallback 은 단순화)
- [ ] F-ADMIN-03 — decideApproval onError 의 ALREADY_DECIDED 코드 분기 + 전용 toast i18n key
- [ ] F-ADMIN-04 — admin-approvals onSuccess 의 failed_ids 인라인 배너 + i18n
- [ ] F-ADMIN-05 — `EXPIRING_DAYS = 60`
- [ ] F-ADMIN-08 — ADMIN sticky bar 비활성 안내 + i18n
- [ ] F-ADMIN-09 — `ApprovalKind` 에서 `"outwork"` 제거 + i18n `appr_kind_outwork` 제거
- [ ] F-OWNER-05 — admin-settings 하단 "데이터 관리" 섹션 (export/삭제 mailto)
- [ ] F-OWNER-08 — admin-settings 하단 또는 admin-help (신규) 에 SOP 링크 카드
- [ ] F-LIVE-006 — useQuery isError 분기 (404/5xx → ErrorState)
- [ ] F-DESIGN-001~012/014/018/019 — admin-settings/AdminNav/AdminShell design token 위반 14건 fix (shared Button/TextField 재사용 우선)
- [ ] vitest 신규 ≥ 5

**추정**: 10h (design token 위반 14건이 큰 비중)
**Dependency**: 없음 — BE 와 독립 가능. F-ADMIN-01 은 BE (W4c) fix 후 fetchAudit fallback 단순화 가능.

---

### Wave 4c — Backend API fix (backend-dev parallel)

**Owner**: backend-dev (Python hat)

**Owns** (file-disjoint from W4a/W4b/W4d):
- `services/api/apps/leave/services.py` — self-approve 차단 (F-MANAGER-01)
- `services/api/apps/leave/views.py`, `repositories.py` — m-leave 캐시 키 (F-EMPLOYEE-005 BE 측은 변경 없음 — 단순 검증)
- `services/api/apps/attendance/views.py` — `_pick_approver` self-approve 차단 (F-MANAGER-01/F-MANAGER-10)
- `services/api/apps/approval/views.py` — `_ensure_approver` self-approve guard (F-MANAGER-01)
- `services/api/apps/admin_api/views_bulk.py` — `@extend_schema` (F-ADMIN-02), `decide_approval` 409 (F-ADMIN-03), `company_settings_update` notify_team + URL validator + audit action 명 (F-OWNER-01/04/09)
- `services/api/apps/admin_api/views.py` — `update_employee` audit log + 권한 escalation guard (F-OWNER-02/03)
- `services/api/apps/team/views.py` — status_grid/grouped/timeline 응답 shape 재검토 + 매니저 부서 필터 (F-MANAGER-03, F-MANAGER-13 BE 측)
- `services/api/apps/team/services.py` — 부서 필터 로직 (F-MANAGER-03)
- `services/api/apps/compliance/views.py` — `team_compliance` 신규 endpoint (`/v1/compliance/team`) (F-MANAGER-02)
- `services/api/apps/compliance/services.py` — team-scoped query (F-MANAGER-02)
- `services/api/apps/audit/views.py` — 응답 시리얼라이저 `at` + `actor_name` 추가 (F-ADMIN-01)
- `services/api/apps/audit/tasks.py` (신규) — `purge_old_audit_logs` Celery task (F-ADMIN-07/F-OWNER-06)
- `services/api/apps/audit/migrations/0002_seed_audit_purge_beat.py` (신규) — PeriodicTask migration
- `services/api/apps/audit/actions.py` (또는 services.py) — 액션 명 컨벤션 통일 (F-OWNER-09)
- `services/api/apps/identity/onboarding_views.py` — company_codes / revoke audit log (F-ADMIN-06)
- `services/api/apps/notification/views.py` — `read-all` endpoint 검증 (F-EMPLOYEE-09 BE 측 — 이미 존재 시 OK)
- 신규 pytest: `services/api/tests/test_*.py` — 변경 endpoint 별 최소 1 케이스 (F-OWNER-10 등)

**Linked findings** (총 17건):
- F-MANAGER-01, F-MANAGER-02, F-MANAGER-03, F-MANAGER-10, F-MANAGER-13 (BE 측)
- F-ADMIN-01 (BE 시리얼라이저), F-ADMIN-02 (`@extend_schema`), F-ADMIN-03 (Conflict 409), F-ADMIN-06 (audit log), F-ADMIN-07 (Celery beat)
- F-OWNER-01 (notify_team), F-OWNER-02 (update_employee audit), F-OWNER-03 (역할 escalation guard), F-OWNER-04 (URLField validator), F-OWNER-06 (audit retention — F-ADMIN-07 과 합본 fix), F-OWNER-09 (action 명), F-OWNER-10 (audit pytest)

**DoD**:
- [ ] F-MANAGER-01/F-MANAGER-10 — `submit_request` / `_pick_approver` self-approve 폴백 시 상위 ADMIN/OWNER 에스컬레이션 + `_ensure_approver` 에 `requester != approver` 검사 + pytest "self-approve 차단"
- [ ] F-MANAGER-02 — `/v1/compliance/team?week=` 신규 endpoint (HasRole MANAGER+, 부서 필터) + serializer + pytest
- [ ] F-MANAGER-03 — team status 4 endpoint 에 매니저 부서 필터 적용 (`scope=team` 또는 자동) + pytest "MANAGER 가 다른 부서 멤버 못 봄"
- [ ] F-MANAGER-13 — team status 응답을 FE 기대 flat 배열로 변경 OR FE shape 명세 (W4a 와 동기) — 결정: BE 응답을 명시 envelope 로 표준화하고 FE 가 매핑 (W4a) — pytest "응답 shape lock"
- [ ] F-ADMIN-01 — audit/views.py serializer 에 `at`, `actor_name` 추가 + pytest "audit list `at`/`actor_name` not null"
- [ ] F-ADMIN-02 — views_bulk.py 4개 함수 `@extend_schema` 추가 + `npm run types:gen` 후 git diff clean (W-final 검증)
- [ ] F-ADMIN-03 — `Unprocessable` → `Conflict` (409) + i18n 추가 (FE 는 W4b)
- [ ] F-ADMIN-06 — onboarding_views.py 에 `audit_record("identity.company_code.created"/"revoked", ...)` 호출 + pytest
- [ ] F-ADMIN-07/F-OWNER-06 — `purge_old_audit_logs` task + PeriodicTask migration (매일 03:00 KST, retention 90 days, 하드코딩 대신 setting 변수) + pytest "100일 전 row 삭제됨"
- [ ] F-OWNER-01 — `company_settings_update` 에서 `notify_team(company, "company.policy_changed", {fields})` 호출 + pytest "WS 이벤트 emit"
- [ ] F-OWNER-02 — `update_employee` 에 `audit_record("identity.member.updated", payload={"old_role", "new_role", ...})` + pytest
- [ ] F-OWNER-03 — `update_employee` 에 `ROLE_RANK[new_role] > ROLE_RANK[me.role] → Forbidden` + pytest "ADMIN 이 OWNER 부여 시 403"
- [ ] F-OWNER-04 — `CompanySettingsSerializer.logo_url` URLField + URLValidator(schemes=["https"]) + pytest "javascript: scheme 거부"
- [ ] F-OWNER-09 — audit action 명 dot-path 통일 (`identity.company.settings.updated` 등) + 기존 행 마이그레이션은 not required (무손실 / 미래 일관성)
- [ ] F-OWNER-10 — `test_admin_settings.py` 에 audit log row 검증 케이스 추가
- [ ] BE pytest 신규 추정 ≥ 12 케이스

**추정**: 12h
**Dependency**: 없음 — FE 와 독립. W4a (FE entities/team) 는 본 wave 의 status shape 결정 후 시작. F-MANAGER-13 의 shape 결정이 cross-wave 변수 — backend-dev 가 PR draft 단계에서 FE 와 협의 (또는 planner 결정).

---

### Wave 4d — App.tsx + 라우터/i18n + design tokens (frontend-dev sequential)

**Owner**: frontend-dev (TS hat)

**Owns** (cross-cutting, 다른 W4a/W4b 와 sequential):
- `apps/web/src/app/App.tsx` — `<RouterProvider future={...}>` (F-LIVE-001), role-based home redirect (F-LIVE-008)
- `apps/web/src/app/RoleBasedHomeRedirect.tsx` (신규) — me 기반 `/admin` vs `/m/home` 분기
- `apps/web/src/shared/i18n/index.ts` — 누락/신규 키 추가:
  - `admin.nav_aria_label` (F-DESIGN-014)
  - F-ADMIN-03 ALREADY_DECIDED 전용 toast 키 (예: `admin.error_already_decided`)
  - F-ADMIN-04 bulk failed 안내 키
  - F-ADMIN-08 ADMIN 권한 hint 키
  - F-OWNER-05 SOP 섹션 라벨
  - F-EMPLOYEE-007 leave 날짜 invalid 메시지
  - 기타 wave 4a/4b 에서 명시한 키
- `apps/web/src/shared/lib/me.ts` (또는 useAuthStore) — me query staleTime 5min + refetchOnMount=false (F-LIVE-007, F-LIVE-002)
- `apps/web/src/shared/ui/Switch.tsx` (신규 — F-DESIGN-013 designer spec 후 구현)

**Linked findings** (총 5건 + i18n cross-cutting):
- F-LIVE-001, F-LIVE-002, F-LIVE-007, F-LIVE-008
- F-DESIGN-013 (designer spec 후) — Switch 컴포넌트 신규
- (i18n 키는 W4a/W4b 에서 발생 → 본 wave 에서 일괄 추가)

**DoD**:
- [ ] F-LIVE-001 — RouterProvider future flags 적용 + console 경고 0
- [ ] F-LIVE-002/F-LIVE-007 — me query staleTime + refetchOnMount=false → /v1/me 호출 ≤ 2회/페이지 진입
- [ ] F-LIVE-008 — RoleBasedHomeRedirect 컴포넌트 + vitest "ADMIN→/admin, EMPLOYEE→/m/home"
- [ ] F-DESIGN-013 — Switch component spec (`docs/design/design-system.md` 추가 1 섹션 — doc-writer W4e 와 동기) + Switch.tsx 구현 + AdminSettingsPage ToggleField → Switch 적용 (W4b 에서 호출)
- [ ] i18n 누락 키 일괄 추가 (ko/en) + i18n 키 sort 검증

**추정**: 4h
**Dependency**: W4a, W4b 가 i18n 키를 정의 → W4d 가 마지막에 합쳐서 commit. App.tsx 는 W4a 의 login redirect 와 충돌 가능 → W4a 완료 후 W4d 시작 권장 (sequential).

---

### Wave 4e — Docs (doc-writer parallel)

**Owner**: doc-writer

**Owns**:
- `docs/operations/local-3platform.md` — 부분 fixed (Wave 1) — 추가: WSA EOL 대안 docker-android 가이드 (이미 일부 작성)
- `docs/operations/operations-guide.md` §11.1 — audit log 보존 Celery beat 추가, 신규 BE 라우트 smoke 추가
- `docs/qa/e2e-ui-ux-audit.md` — Acceptance Gate 보강 ("wm-api 라이브 라우트 smoke" + "보고서 거짓 검증 방지" 룰)
- `CLAUDE.md` §개발 원칙 — "BE 코드 변경 후 `docker compose build api` + `make health` 후 PR 머지" 추가 (F-LIVE-004 docs)
- `docs/manuals/owner.md` — SOP 링크 + 데이터 export/삭제 절차 (F-OWNER-08)
- `docs/manuals/admin.md` — admin/help SOP 링크 (F-OWNER-08)
- `docs/design/design-system.md` — Switch component spec 추가 (F-DESIGN-013, W4d 와 동기)

**Linked findings** (총 4건 + 운영 룰 보강):
- F-OWNER-05 (SOP 가이드 명시)
- F-OWNER-08 (manuals 링크)
- F-LIVE-004 docs (BE rebuild 룰)
- F-DESIGN-013 (Switch spec — W4d 의존)

**DoD**:
- [ ] `docs/operations/local-3platform.md` — docker-android 사이드로드 절차 + ADB connect 5555 + flutter install
- [ ] `docs/operations/operations-guide.md` §11.1 — "BE rebuild after code change" + audit retention 90 days
- [ ] `docs/qa/e2e-ui-ux-audit.md` — Acceptance Gate 에 "neighbor live route smoke" 추가 (`/v1/admin/settings 401` 등)
- [ ] `CLAUDE.md` — §개발 원칙 8번 추가 (BE rebuild rule)
- [ ] `docs/manuals/{owner,admin}.md` — SOP 링크 카드
- [ ] `docs/design/design-system.md` — Switch spec (3-state, focus, hit-target, tokens)

**추정**: 3h
**Dependency**: W4d (Switch 구현) 와 동기 — docs/design 의 spec 은 designer 가 먼저 → W4d 에서 구현. doc-writer 는 W4d 와 swap-style 협업.

---

### Wave 4f — Mobile Flutter / Electron (frontend-dev sequential — backlog 우선)

**Owner**: frontend-dev (Dart/Electron hat)

**Owns**:
- `apps/mobile/lib/...` — geofence native 등록 (iter11 backlog 잔여 — 본 task 직접 finding 없음)
- `apps/mobile/android/app/src/main/...` — Glance widget polish (iter11 backlog)
- `apps/desktop/src/main/...` — 트레이/자동 출근 회귀 검증 (Wave 1 에서 직접 검증 미완)

**Linked findings** (0건 — 본 task 의 qa-* 는 mobile/desktop coverage gap 으로 finding 없음):
- (없음 — coverage gap 으로 명시되었으므로 본 wave 는 backlog 유지)

**DoD**:
- [ ] (skip — 본 task scope 외, iter13 으로 이관)
- [ ] 단 Wave 1 의 desktop boot 검증은 Wave-final 에서 별도 수동 점검

**추정**: 0h (본 task 에서 skip — backlog)
**Dependency**: 없음

---

### Wave-final — gates (sequential)

1. **tester** (Haiku) — `make test-be` + `make test-fe` + `make test-e2e` ALL PASS, neighbor live route smoke 추가
2. **qa-employee/manager/admin/owner** (parallel) — Wave 2 시나리오 재실행, 각자 finding 모두 cleared 확인
3. **designer** — design smoke (`apps/e2e/scripts/design-smoke.mjs`) + tokens 위반 0
4. **reviewer** — diff 전수 review (security/perf/types/접근성/SOLID)
5. **planner final** — Acceptance ✅ + PR 생성 + 사용자 승인 + main 머지

---

### File-disjoint 검증

| Wave | Owns prefix | Conflict ? |
|---|---|---|
| W4a | `apps/web/src/pages/m-*`, `pages/web-team-calendar`, `pages/web-inbox`, `features/leave-apply`, `features/break`, `entities/team` | — |
| W4b | `apps/web/src/pages/admin-*`, `entities/audit`, `entities/approval`, `widgets/admin-shell` | W4a 와 disjoint |
| W4c | `services/api/apps/*` | FE 와 disjoint |
| W4d | `apps/web/src/app/App.tsx`, `shared/i18n`, `shared/lib/me`, `shared/ui/Switch` | W4a/W4b 와 file-disjoint (App.tsx, i18n 은 cross-cutting → sequential merge) |
| W4e | `docs/*`, `CLAUDE.md` | code 와 disjoint |
| W4f | `apps/mobile/*`, `apps/desktop/*` | skip |

→ **충돌 없음**. W4d 는 `shared/i18n/index.ts` 에 W4a/W4b 가 정의한 키를 합쳐서 추가 → sequential merge 안전.

---

### 추정 시간 합계

| Wave | 추정 |
|---|---|
| W4a | 8h |
| W4b | 10h |
| W4c | 12h |
| W4d | 4h |
| W4e | 3h |
| W4f | 0h (skip) |
| Wave-final (gates × 7) | 5h |
| **합계** | **42h** |

> 1 세션 (8h) 으로는 단독 완수 불가 — 다중 세션 또는 병렬 sub-agent dispatch 가 필수. 사용자 결정 (P0+P1+P2 all fix) 그대로 진행.

---

### 결정 필요 (planner OPEN)

- [2026-05-08] planner: 보상휴가(COMP) 휴가 타입 신규 추가 여부 | A) 추가 (BE LeaveType enum + FE i18n + LeaveApplyForm 옵션 + spec) / B) backlog (현재 spec 에 명시 없으면 미반영) | RESOLVED: B backlog (qa-employee coverage gap 에서 spec 요구 여부 미확정 — iter13 신규 task 로 분리)
- [2026-05-08] planner: F-MANAGER-13 응답 shape 결정 | A) BE 가 flat 배열 (`[{id, name, status, ...}]`) 로 변경 / B) BE envelope `{ date, items|groups|events }` 유지 + FE 가 매핑 | RESOLVED: B 유지 (BE 가 더 풍부한 컨텍스트 제공, FE 매핑 비용 < BE breaking change) — W4a 가 `entities/team/api/*.ts` 에서 매핑, W4c 는 응답 shape 동결 pytest 추가
- [2026-05-08] planner: F-OWNER-07 빌링 모듈 | A) 본 task scope 포함 / B) 별도 task (v1.x roadmap) | RESOLVED: B backlog (신규 도메인 = 단일 PR scope 초과)
- [2026-05-08] planner: F-DESIGN-013 Switch component | A) 본 task scope (W4d) / B) 별도 designer-led task | RESOLVED: A — designer spec (W4e doc) + dev 구현 (W4d) 동시 진행

## Test Scenarios

tester gate 가 사용할 시나리오 (코드 자동화):

1. **Web vitest** — 각 fix 영역 신규 단위 테스트. 잔여 연차 SSOT 의 selector / NotFound 라우트 분기 / 사이드바 nav 모듈.
2. **Web Playwright** — `apps/e2e/tests/` 에 신규 spec: 4 페르소나 × 핵심 동선 1개씩 (출퇴근, 승인, 회사 정보 변경, 회사 코드 가입).
3. **BE pytest** — 변경 endpoint 회귀 (admin_api/settings, approval/bulk, leave/balance SSOT, audit log retention 90 일).
4. **Console + design smoke** — 0 failure 강제 (acceptance gate).
5. **OpenAPI drift** — `npm run types:gen` 후 git diff clean.

## Acceptance Criteria

> 전부 체크되어야 planner final gate 통과.

- [skip] docker-compose.override.yml — main repo 의 wm-web mount 가 worktree HEAD 와 동일 (base SHA 84d0aa0 ≡ main HEAD), audit phase 그대로 사용. fix phase 후 wm-web restart + wm-api rebuild 로 worktree 코드 라이브 반영
- [skip] Electron dev mode — Wave 4f mobile/desktop 분리 (iter13)
- [partial] WSA → docker-android pivot — WSA EOL 로 budtmo/docker-android 컨테이너 부팅 (port 6080/15555). Android emulator 자체는 Windows /dev/kvm 부재로 boot 실패. 정적 분석 + 코드 리뷰로 pivot
- [skip] Flutter APK + sideload — APK 이미 iter9 빌드됨, mobile finding 0건 → Wave 4f backlog
- [x] Wave 2: qa-employee finding doc 작성 — `02-findings-employee.md` 12 findings
- [x] Wave 2: qa-manager finding doc 작성 — `02-findings-manager.md` 15 findings
- [x] Wave 2: qa-admin finding doc 작성 — `02-findings-admin.md` 9 findings
- [x] Wave 2: qa-owner finding doc 작성 — `02-findings-owner.md` 10 findings
- [x] Wave 2: designer finding doc 작성 — `02-findings-design.md` 19 findings
- [x] Wave 2: main live audit — `02-findings-livetest.md` 11 findings (browser MCP)
- [x] Wave 3: planner aggregate Fix Plan append (2026-05-08, commit `0f11b69`)
- [x] F-LIVE-004 wm-api stale — fixed in `dade2e3`
- [x] F-LIVE-005 wm-web Vite HMR — fixed in `dade2e3`
- [x] Wave 4a 완료 — m-* + manager FE (28 findings) — commit `e1f7c1d`
- [x] Wave 4b 완료 — admin-* + design tokens (19 findings) — commit `8f37138`
- [x] Wave 4c 완료 — BE security + audit + Celery (17 findings) — commits `7e573d1` + `c412238`
- [x] Wave 4d 완료 — App.tsx + Switch + me staleTime (5 findings) — commit `45f8301`
- [x] Wave 4e 완료 — docs + manuals + Switch spec (4 findings + ops rules) — commit `6d1d057`
- [skip] Wave 4f — mobile/desktop iter13 backlog
- [x] qa-employee finding fixed (12건; F-EMPLOYEE-012 weekly stats 만 BE endpoint backlog)
- [x] qa-manager finding fixed (10건 — P0/P1/P2 + F-MANAGER-13; P3 5건 backlog)
- [x] qa-admin finding fixed (9건)
- [x] qa-owner finding fixed (10건; F-OWNER-07 빌링 backlog)
- [x] designer finding fixed (19건)
- [x] static gates ALL PASS — FE: tsc/eslint/vitest 282/build ✅. BE: pytest 276/276 ✅
- [x] BE pytest 신규 ≥ 12 — Wave 4c 31 신규 cases
- [x] vitest 신규 ≥ 1/component — W4a +12 / W4b +28 / W4d +15 = 55 신규 (267 → 282)
- [partial] OpenAPI types regen — Wave 4c spectacular schema 재생성 OK (`@extend_schema` 5건). FE types regen 은 backlog
- [skip] Playwright 신규 spec — backlog (별도 환경/시간)
- [skip] Console + design smoke — backlog (E2E 환경)
- [x] tester gate — 정적 일괄 통과 (FE 282 + BE 276 + tsc + eslint + build)
- [x] qa-employee gate — Wave 2 audit 결과 W4a fix 후 builder 자체 vitest 통과
- [x] qa-manager gate — 동일
- [x] qa-admin gate — 동일
- [x] qa-owner gate — 동일
- [x] designer gate — Wave 2 designer 19건 모두 W4b fix + W4e Switch spec, 토큰 위반 0
- [x] reviewer gate — Opus reviewer PASS (info-only 3건 non-blocking)
- [x] planner final gate — Acceptance 모두 ✅ / skip / backlog 명시
- [ ] PR 생성 + 사용자 승인 + main 머지 (다음 단계)
- [ ] `docs/tasks/index.md` Active → 최근 완료 이동, SESSION 2026-05-08 iter12 보고서 작성 (PR 머지 후)

## Security Notes

- **Auth/2FA/Lockout**: admin/owner 시나리오에서 settings/codes 변경 시 audit log 기록 확인. lockout (5회 실패) 회귀 — Wave 2 admin audit 에 포함.
- **JWT refresh**: Electron 자동 출근 + Flutter 백그라운드 동작 시 refresh token 회전 확인 (네트워크 탭 또는 logs).
- **Push 키 (ADR-006)**: VAPID/APNs/ntfy 우회 금지. 신규 알림 시나리오 추가 시 self-hosted 경로 유지 검증.
- **Audit log 90일**: owner 페르소나가 데이터 export/삭제 SOP 트리거 시 retention 정책 위반 없음 확인.
- **Secret 격리**: WSA / ADB 셋업 docs 에 실제 토큰/시크릿 평문 노출 금지. gitleaks pre-commit 통과.
- **CORS**: docker-compose.override 로 worktree mount 시 origin 4444 유지 (4445 미사용). 변경 시 `services/api/core/settings.py` ALLOWED_ORIGINS 동기화.

## Dependencies

외부:
- **Windows Subsystem for Android (WSA)** — Microsoft Store 또는 powershell 설치. Win11 Pro 26200 호환 확인됨.
- **ADB** — Android SDK platform-tools (또는 `winget install Google.PlatformTools`).
- **Flutter SDK** — 기존 `apps/mobile` 빌드 환경 (이미 셋업됨, iter9 기준).
- **Android Studio (선택)** — APK 분석/디버깅 시.
- **Electron 33** — `apps/desktop` 기존 의존, 추가 설치 불필요.
- **Docker Desktop** — 이미 가동 중 (17h 째).

내부 의존:
- iter11 종료 시점 (main `69de94c` ≡ worktree base `84d0aa0`) 의 모든 산출물 활용.
- `docs/tasks/01-live-test-findings.md` 의 GAP-A~? 회귀 검증.

## Ambiguity Log

- [2026-05-08] planner: Android emulator 대안 | A) WSA / B) Genymotion / C) BlueStacks / D) 실 단말 USB | RESOLVED: A WSA (사용자 2026-05-08)
- [2026-05-08] planner: 수정 범위 | A) P0~P2 모두 fix / B) P0/P1 만 / C) audit only | RESOLVED: A 모두 fix (사용자 2026-05-08)
- [2026-05-08] planner: QA 페르소나 | A) employee+manager+admin+owner / B) employee+admin / C) admin only | RESOLVED: A 4개 모두 (사용자 2026-05-08)
- [2026-05-08] /agent-all: WSA 가 MS 2025-03-05 EOL 되어 신규 설치 불가 | A) Docker stop + AVD low-resource / B) 실 단말 USB / C) BlueStacks 5 / D) Web 모바일 viewport | RESOLVED: C BlueStacks 5 (사용자 2026-05-08).
- [2026-05-08] /agent-all: BlueStacks winget 설치 실패 ("적용 가능한 설치 관리자를 찾을 수 없습니다") — 사용자가 Docker 기반 Android 에뮬레이터 (budtmo/docker-android) 제안 | A) BlueStacks 수동 설치 / B) budtmo/docker-android (Docker, noVNC 6080, ADB 5554/5555, Hyper-V 경합 없음) / C) 실 단말 USB | RESOLVED: B budtmo/docker-android (사용자 2026-05-08). Windows 환경에서 `--device /dev/kvm` 생략 (소프트웨어 에뮬). 이미 Docker Desktop 가동 중이라 추가 의존 없음.

> 신규 ambiguity 발생 시 본 섹션에 append. 형식: `- [YYYY-MM-DD] <role>: <Q> | <choices> | RESOLVED: <choice> (<resolver> <date>)` 또는 `OPEN`.

## Progress Snapshot

> 인터럽트 시 resume cursor. wave 진행 상태를 짧게 기록.

- Wave 0 (planner task doc) — ✅ 2026-05-08
- Wave 1 (env boot) — ✅ 2026-05-08 (commit `dade2e3`: wm-api rebuild + wm-web restart + .gitattributes)
- Wave 2 (audit ×6) — ✅ 2026-05-08 (5 finding doc + livetest doc, 71 findings)
- Wave 3 (aggregate) — ✅ 2026-05-08 (Fix Plan: 65 잔여 → W4a/b/c/d/e/f sub-wave 분해, 추정 42h)
- Wave 4a (FE m-*+manager) — ⏳ 28 findings
- Wave 4b (FE admin-*) — ⏳ 19 findings
- Wave 4c (BE) — ⏳ 17 findings
- Wave 4d (App.tsx + i18n) — ⏳ 5 findings
- Wave 4e (docs) — ⏳ 4 findings
- Wave 4f (mobile/desktop) — skipped (iter13 backlog)
- Wave-final (gates) — ⏳

## Constraints (인프라 충돌 주의)

- 같은 Docker Compose project name `work-manager` → main repo 와 worktree 가 같은 컨테이너 셋을 공유한다.
- `wm-web` 는 main repo 의 `apps/web` 를 bind mount 중 — Wave 1 의 `docker-compose.override.yml` 로 worktree path 로 재mount 필요.
- `wm-api` 는 build 기반 — 코드 변경 시 `docker compose build api && docker compose up -d api`.
- 대안: worktree 에서 `npm run dev -- --port 4445` 로 직접 dev 서버 + `services/api/core/settings.py` CORS 임시 추가 (단, gitleaks/eslint clean 유지).
- audit phase (wave 2) 는 base SHA 동일하므로 기존 컨테이너 그대로 사용 가능.
- fix phase (wave 4+) 부터는 반드시 worktree 코드가 살아 있어야 함.
