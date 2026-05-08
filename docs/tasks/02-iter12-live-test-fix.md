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

## Test Scenarios

tester gate 가 사용할 시나리오 (코드 자동화):

1. **Web vitest** — 각 fix 영역 신규 단위 테스트. 잔여 연차 SSOT 의 selector / NotFound 라우트 분기 / 사이드바 nav 모듈.
2. **Web Playwright** — `apps/e2e/tests/` 에 신규 spec: 4 페르소나 × 핵심 동선 1개씩 (출퇴근, 승인, 회사 정보 변경, 회사 코드 가입).
3. **BE pytest** — 변경 endpoint 회귀 (admin_api/settings, approval/bulk, leave/balance SSOT, audit log retention 90 일).
4. **Console + design smoke** — 0 failure 강제 (acceptance gate).
5. **OpenAPI drift** — `npm run types:gen` 후 git diff clean.

## Acceptance Criteria

> 전부 체크되어야 planner final gate 통과.

- [ ] worktree CWD 에서 `docker-compose.override.yml` 작성 → `wm-web` 가 worktree `apps/web` 를 mount (검증: `docker exec wm-web cat /app/package.json | head -3` ↔ worktree 파일)
- [ ] Electron dev mode 부팅 (worktree `apps/desktop`) — 트레이 아이콘 / 자동 출근 토글 / 자동 업데이트 channel = dev
- [ ] WSA 설치 + ADB connect (`adb connect 127.0.0.1:58526`) + 개발자 모드 활성화 + `adb devices` 에 표시
- [ ] Flutter APK 빌드 (`apps/mobile`, `flutter build apk --debug`) + WSA 사이드로드 (`adb install`) + 부팅 후 로그인 화면 도달
- [ ] Wave 2: qa-employee finding doc 작성 (≥ 5 finding 또는 "0 finding 보장 근거" 명시)
- [ ] Wave 2: qa-manager finding doc 작성
- [ ] Wave 2: qa-admin finding doc 작성
- [ ] Wave 2: qa-owner finding doc 작성
- [ ] Wave 2: designer finding doc 작성
- [ ] Wave 3: planner aggregate Fix Plan append 됨
- [ ] qa-employee finding 모두 fixed (P0/P1/P2)
- [ ] qa-manager finding 모두 fixed (P0/P1/P2)
- [ ] qa-admin finding 모두 fixed (P0/P1/P2)
- [ ] qa-owner finding 모두 fixed (P0/P1/P2)
- [ ] designer finding 모두 fixed (P0/P1/P2)
- [ ] static gates ALL PASS — `make test-be` ✅ / `make test-fe` ✅ (tsc + eslint --max-warnings=0 + vitest + build) / `make test-e2e` ✅
- [ ] BE pytest 신규 추가 — 변경 endpoint 별 최소 1 케이스
- [ ] vitest 신규 추가 — 변경 컴포넌트 별 최소 1 케이스
- [ ] OpenAPI types regen 무 drift (`npm run types:gen` → git diff clean)
- [ ] Playwright 신규 spec — 4 페르소나 핵심 동선
- [ ] Console smoke 0 failure / design smoke 0 위반
- [ ] tester gate ✅
- [ ] qa-employee gate ✅
- [ ] qa-manager gate ✅
- [ ] qa-admin gate ✅
- [ ] qa-owner gate ✅
- [ ] designer gate ✅
- [ ] reviewer gate ✅
- [ ] planner final gate ✅
- [ ] PR 생성 + 사용자 승인 + main 머지
- [ ] `docs/tasks/index.md` Active → 최근 완료 이동, SESSION 보고서 작성

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
- Wave 1 (env boot) — ⏳
- Wave 2 (audit ×5) — ⏳
- Wave 3 (aggregate) — ⏳
- Wave 4..N (fix) — ⏳
- Wave-final (gates) — ⏳

## Constraints (인프라 충돌 주의)

- 같은 Docker Compose project name `work-manager` → main repo 와 worktree 가 같은 컨테이너 셋을 공유한다.
- `wm-web` 는 main repo 의 `apps/web` 를 bind mount 중 — Wave 1 의 `docker-compose.override.yml` 로 worktree path 로 재mount 필요.
- `wm-api` 는 build 기반 — 코드 변경 시 `docker compose build api && docker compose up -d api`.
- 대안: worktree 에서 `npm run dev -- --port 4445` 로 직접 dev 서버 + `services/api/core/settings.py` CORS 임시 추가 (단, gitleaks/eslint clean 유지).
- audit phase (wave 2) 는 base SHA 동일하므로 기존 컨테이너 그대로 사용 가능.
- fix phase (wave 4+) 부터는 반드시 worktree 코드가 살아 있어야 함.
