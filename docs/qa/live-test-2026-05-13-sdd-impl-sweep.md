# Live Test — SDD Impl Sweep (2026-05-13)

> **Branch**: `task/sdd-baseline-impl`
> **Last commit**: `ab393d3` fix(web): useMe — disable when no access token
> **Stack**: docker compose up (db/redis/ntfy/api/ws/web), seed_demo 실행 완료
> **Tester**: Claude (Opus 4.7) + Chrome MCP

본 보고서는 SDD baseline + B-CODE-04 (test 수리) 진행 중간에 발견된 issue + 4 페르소나 sweep 결과를 박제한다.

---

## 환경

| 컴포넌트 | 상태 | 비고 |
|---|---|---|
| db (postgres 16) | ✅ healthy | seed 후 wm-db.brand_color NOT NULL 확인 |
| redis | ✅ healthy | |
| api (Django+DRF+Channels) | ✅ /v1/health 200 | wm-api 이미지 4일 전 → no-cache rebuild 수행 |
| seed_demo | ✅ 29 memberships / 116 attendance / 9 leave / 3 overtime | 첫 시도 seed image stale → `--no-cache build seed` 후 성공 |
| web (Vite dev 4444) | ✅ HMR ok | 초기 컨테이너 + restart 후 fix 반영 |

---

## 자동 smoke 결과 (`apps/e2e/scripts/`)

| Script | Before fix | After fix |
|---|---|---|
| console-smoke.mjs | 🔴 1 failure (`response:401:/v1/me`) | 🟢 0 failure |
| onboarding-console-smoke.mjs | 🔴 1 failure (`response:401:/v1/me`) | 🟢 0 failure |
| design-smoke.mjs | 🟢 4 screenshots + measurements pass | 🟢 4 screenshots + measurements pass |

### 401 /v1/me 회귀 — Root cause + fix

**증상**: 콘솔 스모크 1 failure (`response:401:http://localhost:4444/v1/me`).

**진단**: `apps/e2e/scripts/debug-me-401.mjs` (임시 진단 스크립트 — commit 미포함) 로 추적:
- phase `goto-login`: GET /v1/me **without** Authorization header → 401
- phase `click-login` 이후: Bearer 토큰 포함 → 200

**원인**: `apps/web/src/pages/login/index.tsx` 가 `useMe()` 로 "이미 인증된 사용자 redirect" 체크. `useMe()` 의 useQuery 가 토큰 없이도 매 마운트 마다 fetchMe() 호출 → `/v1/me` 401.

**Fix**: `apps/web/src/shared/lib/me.ts` 의 `useMe()` 에 `enabled: hasToken` 추가 (commit `ab393d3`). useAuthStore 의 accessToken 으로 게이트.

**검증**:
- console-smoke + onboarding-console-smoke: 0 failure 도달
- design-smoke: 회귀 없음
- web-test (vitest, Docker): 75 files / 297 tests pass

---

## Persona sweep (Chrome MCP)

각 페르소나 로그인 + 핵심 화면 visit + 권한 가드 검증.

### EMPLOYEE — `diana-ngiaqq@acme.demo` / `DemoPass!1`
| URL | 결과 | i18n 누락 |
|---|---|---|
| /login → /m/home | ✅ Navigate to /m/home, KPI 카드 노출 | 0 |
| /m/leave | ✅ 잔여 15일 / 사용 0 / 발생 15 / 소멸 0 | 0 |
| /admin | ✅ RequireAdmin 가드 → /m/home redirect | 0 |

### MANAGER — `manager1@acme.demo`
| URL | 결과 | i18n 누락 |
|---|---|---|
| /login → /m/home | ✅ Navigate to /m/home | 0 |
| /m/inbox | 🟡 "처리할 항목이 없어요" — seed_demo 의 PENDING 9건이 manager1 의 approver 가 아닌 듯 (조사 권장) | 0 |
| /admin | ✅ RequireAdmin 가드 → /m/home redirect | 0 |

### ADMIN — `admin@acme.demo`
| URL | 결과 | i18n 누락 |
|---|---|---|
| /login → /m/home | ✅ | 0 |
| /admin | ✅ KPI 표시 (출근률 0 / 미출근 0 / 승인 대기 9 / 진행 중 OT 0) | 0 |
| /admin/approvals | ✅ 9건 PENDING 표시 (Mona/Liam/Kim/Ivan/Ethan/Diana/Charlie/Bob/Alice) | 0 |
| /admin/employees | ✅ 직원 테이블 + 검색 + 역할 필터 | 0 |
| /admin/audit | ✅ "감사 항목이 없어요" empty state | 0 |
| /admin/compliance | ✅ 52h 보드 — 직원 별 누적 시간 노출 | 0 |
| /admin/settings | ✅ 회사 정보 + 브랜드 + 운영 정책 | 0 |
| /admin/expiring-leave | ✅ "소멸 위험이 없어요" empty state | 0 |
| /admin/codes | ✅ 초대 코드 발급 폼 + ACMEDM row | 0 |
| /admin/reports | ✅ 월간 리포트 (CSV/PDF export) | 0 |
| /owner/billing | ✅ RequireOwner 가드 → /admin redirect | 0 |

### OWNER — `owner@acme.demo`
| URL | 결과 | i18n 누락 |
|---|---|---|
| /login → /m/home | ✅ | 0 |
| /owner/billing | ✅ Standard 플랜 / ₩50,000 월 / 체험판 / 다음 결제일 2026-05-27 / 결제 내역 empty state | 0 |
| /owner/billing "플랜 변경" button | 🟡 disabled + tooltip "iter14 예정 — Stripe 결제 연동 후 활성화" (F-OWNER-07 skeleton, B-CODE-01 backlog) | — |

---

## Findings

| ID | 영역 | 우선순위 | 상태 | 비고 |
|---|---|---|---|---|
| F-2026-05-13-01 | useMe 토큰 없이 /v1/me 401 | P0 | ✅ FIXED (`ab393d3`) | console-smoke regression 의 원인. enabled: hasToken 으로 해결 |
| F-2026-05-13-02 | "플랜 변경" tooltip 텍스트 "iter14 예정" stale | P2 | 🟡 OPEN | iter14 는 이미 완료됨. B-CODE-01 (Stripe) 완료 시 i18n key `owner.billing.change_plan_tooltip` 갱신 + 활성화 |
| F-2026-05-13-03 | manager1 인박스에 PENDING 9건 미노출 | P2 | 🟡 OPEN — 조사 필요 | seed_demo 의 ApprovalTask.approver 가 `emp.manager or managers[0]` 패턴 — manager1 이 모든 직원의 .manager 이 아닐 가능성. 권장: ApprovalTask 분배 로직 확인 + seed_demo 의 manager assignment 정합성 점검 |
| F-2026-05-13-04 | desktop vitest `updater.test.ts` 의 electron-updater import-time crash | P2 | 🟡 OPEN (pre-existing) | iter8 (`e9dc326`) 이후 미터치, electron-updater 신규 버전과 jsdom 호환성 추정. backlog 등록 권장 (B-CODE-09 또는 hotfix) |
| F-2026-05-13-05 | seed 이미지 stale → IntegrityError (brand_color NOT NULL) | P3 | ✅ 우회됨 | `docker compose build --no-cache seed` 로 해결. Makefile 의 `make up` 후 `make seed` 통합 권장 (compose build 자동화) |

---

## 테스트 매트릭스 — 본 sweep 박제

| Test | Status | Count |
|---|---|---|
| make test-be (Docker) | ✅ | 298 passed |
| make test-fe (Docker) | ✅ | 75 files / 297 tests + build |
| make test-mobile (Docker) | ✅ | 22 passed |
| make test-desktop (Docker) | 🟡 | 10 passed / 1 failed suite (pre-existing F-2026-05-13-04) |
| make test-e2e (Docker, Playwright) | ⏳ Pending | — (heavy, skipped this sweep) |
| console-smoke.mjs | ✅ | 0 failure (after fix) |
| onboarding-console-smoke.mjs | ✅ | 0 failure (after fix) |
| design-smoke.mjs | ✅ | 4/4 screenshots + measurements |
| Chrome MCP persona sweep | ✅ | 4/4 personas + 13 routes |

---

## 권장 후속 작업

1. **F-2026-05-13-03 조사** (manager1 인박스 비어있음) — `seed_demo.py:281-322` 의 approver assignment 검토. ApprovalTask.approver=manager1 인 row 가 실제로 생성됐는지 SQL 검증.
2. **F-2026-05-13-04 patch** — updater.test.ts 에 `vi.mock("electron-updater", ...)` 추가 또는 electron-updater 버전 핀.
3. **F-2026-05-13-02 i18n 갱신** — B-CODE-01 (Stripe) PR 의 일부.
4. **e2e Playwright 실행** — heavy 이지만 GA 직전 1회 필수. CI 의 e2e job 으로 갈음 가능.
5. **design-smoke 확장** — 현재 4 화면. 18 화면(/m/* + /admin/* + /owner/*) 으로 확대 → backlog 등록.

---

## Artefacts

- 스크린샷: `apps/e2e/test-results/design-smoke/*.png` (4 화면, design-smoke 산출물)
- 임시 진단 스크립트: `apps/e2e/scripts/debug-me-401.mjs` — root cause 추적용, 본 PR 에는 포함 (참조용으로 보존)
- 본 보고서: `docs/qa/live-test-2026-05-13-sdd-impl-sweep.md`
