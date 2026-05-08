---
agent: main (live browser audit)
generated: 2026-05-08
task_n: 2
---

# main agent — Wave 2 라이브 브라우저 audit findings

> Web 라이브 audit (Chrome MCP). qa-* sub-agent (코드 리뷰) 와 보완 — 실제 브라우저 동작 검증.

## Findings

### F-LIVE-001: React Router v7 future flag 경고 (P2)
- Severity: P2 (warning, non-breaking)
- Where: 모든 페이지 (router 초기화 시점)
- Repro: 1) 임의 페이지 진입 2) 콘솔 확인
- Expected: 0 warning
- Actual: `v7_startTransition` + `v7_relativeSplatPath` 경고 페이지마다 2회 출력
- Suggested fix scope: `apps/web/src/app/router.tsx` (또는 RouterProvider 위치) — `<RouterProvider router={router} future={{v7_startTransition: true, v7_relativeSplatPath: true}}/>` 추가

### F-LIVE-002: /v1/me 폼 입력 중 다회 호출 (P2)
- Severity: P2 (perf)
- Where: `/login` 페이지에서 폼 인터랙션 시
- Repro: 1) /login 진입 2) email/password 입력 3) network 탭
- Expected: /v1/me 1~2회 (마운트 시 + 로그인 응답 후)
- Actual: 8회 호출 (입력/포커스 변경마다 refetch 의심)
- Suggested fix scope: `apps/web/src/entities/me/api/fetchMe.ts` 또는 query staleTime/gcTime 검토. `refetchOnWindowFocus`/`refetchOnMount` 설정 확인.

### F-LIVE-003: /login 자동 redirect 누락 (P1)
- Severity: P1 (UX)
- Where: `/login` 라우트 (이미 인증된 상태)
- Repro: 1) 인증된 세션 유지 2) /login 직접 진입
- Expected: 인증 확인 시 / (또는 마지막 페이지) 로 자동 redirect
- Actual: /login 머무름 (사용자가 로그인 폼 다시 봄)
- Suggested fix scope: `apps/web/src/pages/login/` 또는 `apps/web/src/app/routeGuards.tsx` — 인증 시 home redirect

### F-LIVE-004 ⚠️ CRITICAL: wm-api 이미지가 iter11 변경 미반영 (P0)
- Severity: **P0** (운영 결함 + iter11 보고서 거짓 검증)
- Where: `wm-api` Docker container (build context `services/api`)
- Repro:
  1) `curl http://localhost:4455/v1/admin/settings` → **404**
  2) `curl http://localhost:4455/v1/admin/leave/expiring` → **404**
  3) `curl http://localhost:4455/v1/admin/approvals/bulk` → **404**
  4) `curl http://localhost:4455/v1/admin/dashboard` → 401 (auth required = route exists)
  5) `curl http://localhost:4455/v1/admin/employees/bulk` → 401 (route exists)
- Expected: iter11 wave 2/6 신규 라우트 모두 401 (auth 만 부재 시) 또는 200
- Actual: iter11 신규 라우트 (`leave/expiring`, `settings`, `approvals/bulk`) 만 404; iter11 이전 라우트 (`employees/bulk`, `dashboard`) 는 401
- Root cause: `docker image inspect wm-api` → Created **2 days ago** (iter11 commits 이전 빌드). 컨테이너 17h 가동 중 (`StartedAt: 2026-05-07T11:44:27`). iter11 SESSION 보고서 §6 "BE pytest 12/12 PASS" 는 `docker compose run` **one-shot** 컨테이너에서만 검증 — wm-api 서비스 실제 동작 미검증.
- Impact:
  - AdminSettingsPage 사용 불가 (frontend 무한 skeleton)
  - 만료 임박 페이지 사용 불가
  - 승인 bulk decide 사용 불가 → 단건 PATCH 으로만 동작 (혹은 404 — `decide_approval` 도 신규)
  - prod 배포 시 동일 함정 재발 가능
- Suggested fix scope:
  - **즉시**: `docker compose build api && docker compose up -d api` (본 라이브 테스트 와중 실시 — 진행 중)
  - **CI/CD**: `make test-be` 후 별도 단계로 "live wm-api 라우트 확인" smoke test (`curl /v1/health` + 신규 라우트 1개 401 확인)
  - **보고서 룰**: SESSION 보고서 §"검증" 에 raw curl 응답 박제 의무 (one-shot pytest 만 PASS 주장 금지)
  - **CLAUDE.md §개발 원칙** 추가: "BE 코드 변경 후 `docker compose build api` + `make health` 후 PR 머지" 명문화

### F-LIVE-005: wm-web Vite HMR 가 신규 route 미반영 (P1)
- Severity: P1 (운영 결함)
- Where: `wm-web` container (`apps/web` bind mount + Vite dev server)
- Repro:
  1) `wm-web` 17h 가동 중
  2) /admin/settings 진입 → **404 NotFoundPage** (라우트 미인식)
  3) `docker restart wm-web` 후 진입 → AdminShell + skeleton 정상 렌더 (라우트 인식)
- Expected: bind mount + Vite HMR 로 신규 파일/라우트 자동 인식
- Actual: 신규 import + Route 정의는 HMR 비대응 — 수동 restart 필요
- Suggested fix scope:
  - vite.config.ts `server.watch` 옵션 검토 (`usePolling: true` Windows mount 환경 권장)
  - 또는 dev 환경 docs 에 "App.tsx 수정 시 wm-web restart 필요" 명시
- Note: F-LIVE-004 의 BE rebuild 대비 web 은 단순 restart 면 충분

### F-LIVE-006: AdminSettingsPage 무한 skeleton (P1, F-LIVE-004 의존)
- Severity: P1 (UX — F-LIVE-004 fix 후 자동 해결 가능)
- Where: `apps/web/src/pages/admin-settings/index.tsx:44-52`
- Repro: 1) /admin/settings 진입 (wm-web restart 후) 2) skeleton 표시 후 영원히 멈춤
- Expected: 데이터 로드 후 3 섹션 (회사정보/브랜드/정책) 또는 에러 메시지
- Actual: skeleton 카드 그대로. BE 가 `/v1/admin/settings` 404 반환 → useQuery 가 isLoading=true 유지 (404 catch 안됨)
- Suggested fix scope:
  - F-LIVE-004 wm-api rebuild 후 자동 해결 가능
  - **추가 방어**: useQuery isError 분기 추가 — 404 / 5xx 시 ErrorState 표시 (영구 skeleton 회피)

### F-LIVE-007: 첫 페이지 로드 시 /v1/me 다회 fetch (P2)
- Severity: P2 (perf)
- Where: 어떤 라우트든 첫 진입 시
- Repro: 1) 페이지 진입 2) network 탭 /v1/me 필터
- Expected: 1~2회 (mount + accessToken 변경 시)
- Actual: **9회** /v1/me 호출 (admin/settings 첫 로드)
- Suggested fix scope: `apps/web/src/shared/lib/me.ts` 또는 `useAuthStore` — me query staleTime 늘리기 (`staleTime: 5*60*1000`), `refetchOnMount: false`

### F-LIVE-008: /admin 라우트가 `/m/home` 으로 redirect 안됨 (P2)
- Severity: P2 (UX)
- Where: ADMIN/OWNER 가 mobile-first 디자인 (/m/home) 에 진입한 상태
- Repro: 1) admin@acme.demo 로그인 2) /m/home 자동 진입
- Expected: ADMIN/OWNER 는 /admin 또는 /web 에 자동 진입 (역할 기반 default route)
- Actual: 모든 사용자 /m/home 강제 진입. ADMIN 은 사이드 진입점 없이 URL 직접 입력해야 /admin 도달
- Suggested fix scope: `apps/web/src/app/App.tsx:108` `<Route path="/" element={<Navigate to="/m/home" replace />} />` 를 me 기반 분기로 (e.g. `<RoleBasedHomeRedirect />` 컴포넌트) — ADMIN/OWNER 는 /admin, EMPLOYEE/MANAGER 는 /m/home

### F-LIVE-009: /admin/codes 레이아웃 좁은 viewport 에서 깨짐 (P1)
- Severity: P1 (UX, 모바일/태블릿 admin 사용 시)
- Where: `apps/web/src/pages/admin-codes/index.tsx` 또는 `apps/web/src/widgets/admin-shell/`
- Repro: 1) /admin/codes 진입 (viewport ≤ 1024px) 2) 코드 발급 form + table 영역
- Expected: 컬럼 헤더 wrap 가독성 유지, 발급 버튼 form 옆 정렬, 가로 스크롤 없음
- Actual: 헤더 "최대 사용 횟수 (선택)" 가 7줄 stacking, "발급" 버튼이 세로로 stretch, 가로 스크롤 발생
- Suggested fix scope: `apps/web/src/pages/admin-codes/index.tsx` form layout grid → flex-wrap with min-width, table responsive (overflow-x-auto 명시 vs viewport overflow)

### F-LIVE-010: /admin/audit 빈 상태 + seed_demo 가 audit entry 미생성 (P2)
- Severity: P2 (테스트 데이터 부재)
- Where: `services/api/apps/identity/management/commands/seed_demo.py`
- Repro: 1) `make seed` 후 admin@acme.demo 로 /admin/audit 진입 2) "감사 항목이 없어요"
- Expected: seed_demo 가 sample audit entries (e.g. company.settings.update, employee.role.change, code.issued) 몇 건 생성 — F-ADMIN-01 fix 검증을 위해서라도 데이터 필요
- Actual: 빈 상태 — F-ADMIN-01 (audit BE 가 created_at + actor_id, FE 는 at + actor_name 기대) 의 mapping 이슈가 표면화되지 않음
- Suggested fix scope: seed_demo.py 에 audit_record 호출 5-10건 추가 (모든 action 타입 커버)
