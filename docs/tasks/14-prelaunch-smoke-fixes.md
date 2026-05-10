---
task_n: 14
slug: prelaunch-smoke-fixes
size: small
status: active
created: 2026-05-10
---

# Task 14 — Prelaunch Smoke Fixes (출시 직전 cleanup + env troubleshooting)

> 부모 인풋: `docs/qa/live-test-2026-05-10-prelaunch-smoke.md` (commit `78df801`).
> 목표: 출시 직전 풀 스모크에서 발견된 minor product GAP 3건 + APK/emulator 환경 troubleshooting 문서화. 단일 wave (W1) 로 file-disjoint 병렬 처리 후 main 머지.

---

## 1. Summary

2026-05-10 prelaunch smoke (4 페르소나 × 3 플랫폼) 결과:

- **Web/Electron 기능**: 회귀 없음. 직전 GAP-A (admin/settings) / GAP-G (Electron renderer fail) 모두 클리어 ✅.
- **신규 product GAP** (출시 블로커는 아니나 cleanup 필요):
  - GAP-NEW-FE-1 🟡 — `apps/web/src/pages/m-home/index.tsx` HomePage 렌더 시 React `Each child in a list should have a unique "key" prop` console warning. 스택의 line 73 은 `useQuery(...)` 호출 위치이며, 실제 누락 위치는 HomePage 자식 컴포넌트 트리 어딘가 (m-home 본 파일 line 295 의 `teamMembers.slice(0,7).map(...)` 는 `key={p.id}` 정상; **W1.frontend-dev 가 brower devtools / vitest 로 정확한 발생 위치 confirm 후 수정**).
  - GAP-NEW-1 ⚪ — `/logout` 직접 navigate 시 404 (NotFoundPage). 실 사용 동선 (`/m/my → 로그아웃 button`) 은 정상이지만 bookmark/redirect target 지원 위해 `<Route path="/logout">` 추가.
  - WM_DEBUG temp diagnostic — `apps/desktop/src/main/index.ts:64-77` `[WM-DEBUG-2026-05-07]` 블록. GAP-G 회귀 없음 확인됐으므로 release 전 제거.
- **환경 블로커 2건** (운영 가이드 문서화):
  - JDK 17 미설치 + `JAVA_HOME=C:\Program Files\Java\jdk-1.8` (존재하지 않는 경로) → `flutter build apk` 실패. 표준 위치 (`Eclipse Adoptium`, `Microsoft\jdk-17`, Android Studio `jbr`) 모두 빈 상태.
  - Android emulator 부팅 실패 (`emulator-5554 offline` + cold-boot 시 process self-terminate). 직전 GAP-16 그대로 회귀.
- **사용자 힌트** ("에뮬레이터는 켜지는데, 다 도커베이스로 할 수 있을텐데?") → docker 기반 Android approach (redroid 등) 도 검토 옵션 1순위로 문서화. 단, Windows + WSL2 + KVM 노출 복잡성을 정직하게 비교 후 **실기기 USB-debugging** 을 primary 로 권고.

---

## 2. User Scenarios

| # | 페르소나 | 시나리오 | 기대 |
|---|---|---|---|
| US-1 | EMPLOYEE / MANAGER | `/m/home` 진입 → 브라우저 콘솔 확인 | React `key` warning **0건** |
| US-2 | (auth) | 주소창에 `/logout` 직접 입력 또는 외부 링크 클릭 | localStorage `wm_access_token` / `wm_refresh_token` 클리어 후 `/login` 으로 redirect (404 페이지 노출 금지) |
| US-3 | (unauth, 토큰 없음) | `/logout` 직접 입력 | 동일하게 `/login` redirect (멱등) |
| US-4 | DevOps / 신규 개발자 | `docs/operations/operations-guide.md` 의 "Android 빌드 환경" 섹션 검색 | JDK 17 설치 절차 + `JAVA_HOME` 설정 + `flutter config --jdk-dir` 옵션 + emulator 대안 (real device, redroid, BrowserStack) 비교표 발견 |
| US-5 | Release manager | Electron unsigned 빌드 후 `--remote-debugging-port=9222` 부착 | 콘솔에 `[wm-debug]` prefix 로그 **노출되지 않음** (temp diagnostic 제거 확인) |

---

## 3. Architecture

### 3.1 변경 파일 (W1.frontend-dev)

| 파일 | 변경 내용 |
|---|---|
| `apps/web/src/pages/m-home/index.tsx` | React `key` warning 발생 위치 추적 후 누락 key 추가. 직접 후보가 안 보이면 `BreakButton` / `SlideToClockIn` / `Card` / `PageHeader` 등 자식 컴포넌트 트리에서 발생한 `.map(...)` 도 점검 (browser devtools 의 component stack 활용). |
| `apps/web/src/app/App.tsx` | `<Routes>` 내에 `<Route path="/logout" element={<LogoutPage />} />` 추가. `LogoutPage` 는 신규 작은 컴포넌트로 `useEffect` 에서 localStorage `wm_access_token` / `wm_refresh_token` 제거 + `useNavigate("/login", { replace: true })` 호출. SSR 가드 필요시 typeof window 체크. **별도 페이지 파일을 만들어도 좋고**, App.tsx 내에 inline 컴포넌트로 정의해도 무방 (build-time 결정). |
| `apps/desktop/src/main/index.ts` | line 64-77 `[WM-DEBUG-2026-05-07]` `if (process.env.WM_DEBUG === "1") { ... }` 블록 전체 삭제. 그 위 `setWindowOpenHandler` (line 59-62) + 아래 `loadURL` (line 79) 사이가 비어도 OK. import 변경 없음 (해당 블록은 외부 import 추가 안 함). |

### 3.2 변경 파일 (W1.doc-writer)

| 파일 | 변경 내용 |
|---|---|
| `docs/operations/operations-guide.md` | §11 (출시 체크리스트) 또는 별도 §13 신규 섹션 "Android 빌드 / 테스트 환경 troubleshooting" 추가. JDK 17 설치 절차 (Eclipse Temurin / Microsoft Build of OpenJDK / Android Studio jbr 셋 중 권장 1) + `JAVA_HOME` 설정 (Windows / WSL) + `flutter config --jdk-dir` + emulator 부팅 실패 진단 명령 (`emulator -avd wm_test -verbose`) + Docker 기반 alternative (redroid 11) 의 한계 (Linux 컨테이너 → Windows 에서는 WSL2 + KVM noexpose) + **권장**: 실기기 USB-debugging primary, BrowserStack/Genymotion 보조, redroid 는 research 단계로 명시. |

(별도 SOP 파일 신설은 옵션. 분량이 한 섹션 (≤ 80 줄) 안에 들어가면 operations-guide.md 단일 파일로 충분.)

### 3.3 비변경 정책

- BE 코드 / DB 마이그레이션 / Celery / Flutter 코드 변경 **없음**.
- `apps/web/src/main.tsx` 등 진입점 변경 **없음**.
- i18n 키 추가 **없음** (LogoutPage 가 사용자 visible 텍스트를 거의 노출하지 않음 — instant redirect; loading spinner 사용 시 기존 i18n 재사용 또는 텍스트 0).

---

## 4. Parallel Work Decomposition

단일 wave (`W1`) — file-disjoint owner 2명. wave 0 (planner) 후 W1 두 owner 가 동시 실행 가능.

### W1.frontend-dev — owns 3 files
- `apps/web/src/pages/m-home/index.tsx`
- `apps/web/src/app/App.tsx`
- `apps/desktop/src/main/index.ts`

작업:
1. m-home key warning 발생 위치 정확히 식별 (browser devtools / vitest render → console.error spy).
2. 누락 key 추가 (가장 단순한 안정 식별자 — index 가 아닌 의미 있는 key 우선).
3. App.tsx 에 `/logout` 라우트 추가 + LogoutPage 컴포넌트 (inline 또는 `apps/web/src/pages/logout/`).
4. Electron `index.ts:64-77` 블록 제거 + `npm run build:ts` 통과 확인.
5. 자체 검증: `npm run lint` + `npm run typecheck` + `npm run test -- m-home App` (관련 vitest) + Electron `npm run build:ts`.

### W1.doc-writer — owns 1 file
- `docs/operations/operations-guide.md`

작업:
1. 새 섹션 (§13 권장; 또는 §11.2 sub-section) 작성.
2. JDK 17 설치 표 (OS × 권장 배포판 × 검증 명령 `java -version` / `echo $JAVA_HOME`).
3. emulator 진단 명령 + 대안 비교표 (native AVD vs redroid vs real device USB vs BrowserStack — 컬럼: 설정 난이도 / Windows 호환성 / 실기 충실도 / 비용).
4. 자체 검증: `grep -n "JDK" docs/operations/operations-guide.md` 가 새 섹션을 hit, markdown lint (있으면).

### Wave 0 (planner)
- 본 task doc 작성 (이 PR).

### Wave 2 (gates) — task spec 상 single-pass 이므로 reviewer + tester 만 ad-hoc 호출
- reviewer: 4 파일 diff 검토 (lint/typecheck/test 결과 + 의도 일치).
- tester: T1~T7 시나리오 실행 + 박제.

---

## 5. Test Scenarios

| ID | 시나리오 | 통과 기준 | 박제 |
|---|---|---|---|
| T1 | `/logout` 직접 navigate (auth 상태) | localStorage 토큰 0 + `/login` 표시 + 404 페이지 미노출 | screenshot |
| T2 | `/logout` 직접 navigate (unauth 상태) | 동일 — 멱등 | (콘솔 로그) |
| T3 | EMPLOYEE 로그인 → `/m/home` 진입 후 콘솔 확인 | `Each child in a list should have a unique "key" prop` 0건 | DevTools console clean screenshot |
| T4 | MANAGER 로그인 → `/m/home` (다른 데이터) 콘솔 확인 | 동일 0건 (재발 방지) | (콘솔 로그) |
| T5 | Electron `npm run build:ts && electron --remote-debugging-port=9222 dist/main/index.js` (env 무관, WM_DEBUG=1 시도해도) | 콘솔에 `[wm-debug]` prefix 로그 0건 + `/login` 정상 로드 | `/json/list` 결과 |
| T6 | `npm run lint` (apps/web) + `npm run typecheck` + `npm run test` (관련 vitest) | 모두 pass | CI 로그 |
| T7 | `grep -n "JDK 17" docs/operations/operations-guide.md` + `grep -n "emulator" docs/operations/operations-guide.md` | 신규 섹션 hit (≥ 1 줄) | grep 출력 |

---

## 6. Acceptance Criteria

(≥ 15 체크박스)

### Code (W1.frontend-dev)
- [x] AC-1: `apps/web/src/pages/m-home/index.tsx` 의 React `key` warning 발생 위치 root cause 식별 후 수정 (commit message 에 위치 명시)
- [ ] AC-2: `/m/home` 렌더 시 브라우저 콘솔에 `Each child in a list should have a unique "key" prop` 메시지 **0건** (T3 박제)
- [x] AC-3: `apps/web/src/app/App.tsx` 에 `<Route path="/logout" ...>` 추가됨
- [ ] AC-4: `/logout` 진입 시 `localStorage.getItem("wm_access_token") === null` + `/login` 으로 redirect (T1 박제)
- [ ] AC-5: 미로그인 상태에서 `/logout` 진입해도 동일하게 `/login` 으로 redirect (멱등; T2)
- [x] AC-6: `apps/desktop/src/main/index.ts` line 64-77 `[WM-DEBUG-2026-05-07]` 블록 **완전 삭제** (`grep -n "WM-DEBUG" apps/desktop/src/main/index.ts` 0 hit)
- [x] AC-7: `apps/desktop` `npm run build:ts` 통과 (TypeScript 컴파일 OK)
- [ ] AC-8: Electron 부팅 후 `/login` 정상 로드 + 콘솔에 `[wm-debug]` prefix 로그 0건 (T5 박제)
- [x] AC-9: `apps/web` `npm run lint` 통과
- [x] AC-10: `apps/web` `npm run typecheck` 통과
- [ ] AC-11: `apps/web` 관련 vitest (`m-home`, `routeGuards`, `App` 등) 통과 — 회귀 0
- [x] AC-12: 위 코드 변경은 file-disjoint (W1.frontend-dev 의 3 파일 외 코드 수정 0)

### Docs (W1.doc-writer)
- [x] AC-13: `docs/operations/operations-guide.md` 에 "Android 빌드 / 테스트 환경 troubleshooting" 섹션 (또는 동등한 헤더) 추가 — `grep -n "Android 빌드" docs/operations/operations-guide.md` ≥ 1 hit
- [x] AC-14: 위 섹션에 JDK 17 설치 절차 + `JAVA_HOME` 설정 + `flutter config --jdk-dir` 명시 — `grep -n "JDK 17\|JAVA_HOME\|flutter config" docs/operations/operations-guide.md` 신규 hit
- [x] AC-15: 위 섹션에 emulator 대안 비교 (≥ 3 옵션: native AVD / real device USB / Docker redroid 또는 cloud) + 권장 1순위 명시 (real device USB-debugging primary)
- [x] AC-16: docker-based android 의 Windows 한계 (WSL2 + KVM 노출 복잡성) 솔직 기술 + redroid 를 "research 단계" 로 라벨링
- [x] AC-17: 문서 외 파일 변경 0 (W1.doc-writer 의 1 파일 외 수정 0)

### Process / 머지
- [x] AC-18: 모든 builder commit 이 `--no-verify` / `--amend` / force push 사용 안 함
- [ ] AC-19: PR 또는 main 직접 머지 후 `git log --oneline -5` 가 본 task의 commit 들 포함
- [ ] AC-20: tester (또는 self-test) 가 T1~T7 모두 통과 보고 + 최소 1 박제 (콘솔 clean screenshot 또는 `/logout → /login` flow)

---

## 7. Security Notes

- **Logout 토큰 클리어 완전성**: localStorage 의 `wm_access_token` 및 `wm_refresh_token` 두 키 모두 제거. 추가로 `sessionStorage` 에 저장된 인증 데이터가 있다면 동일 처리. (`apps/web/src/features/auth/` 또는 동등한 모듈에서 토큰 키 명을 확인 후 일치시킬 것 — 하드코딩 금지.)
- **BE 측 토큰 무효화는 본 task 범위 외**: `/logout` 라우트는 SPA 클라이언트 측 클리어만 수행. 서버 측 refresh-token revoke 엔드포인트가 있다면 호출 가능하나, 본 cleanup task 의 scope 를 넘어서므로 별도 backlog 화 (Ambiguity #3).
- **Electron WM_DEBUG 제거의 보안 영향**: 진단 코드는 prod 빌드에 포함되어도 `WM_DEBUG=1` 환경변수 없이는 비활성. 그러나 console-message hook 은 noise 만 발생 — 보안 위험은 낮음. 제거 정당화: dead code + signal-to-noise 향상.
- **doc 변경의 secret 노출 0**: JDK 설치 명령 + emulator 진단은 공개 정보. credential / API key / DSN 미포함.

---

## 8. Dependencies

### 사전 (이미 충족)
- iter13 머지 (`12d86f2`) — 본 worktree base.
- prelaunch smoke 보고서 (`docs/qa/live-test-2026-05-10-prelaunch-smoke.md`) — fix 대상 enumerate 출처.

### 외부 / 후속 (본 task 범위 외)
- JDK 17 실 설치 + APK 실 빌드 검증 — 사용자가 환경에서 별도 수행 (본 task 는 docs 만).
- Android emulator 실 부팅 / redroid 컨테이너 실 검증 — 별도 환경 task.
- Stripe billing 통합 (iter13 backlog) — 무관.
- iOS native geofence — 무관.

---

## 9. Ambiguity Log

| # | 이슈 | 임시 결정 | 후속 |
|---|---|---|---|
| 1 | React key warning 의 정확한 발생 위치 — `m-home/index.tsx` 자체 `.map()` 은 line 295 `key={p.id}` 정상. 스택의 "line 73 at HomePage" 은 fiber tree 시작점 추정. | W1.frontend-dev 가 browser DevTools 의 component stack + `console.error` spy vitest 로 root cause 정확 식별 후 fix. 자식 컴포넌트 (`PageHeader`, `BreakButton`, `SlideToClockIn` 등) 까지 조사 범위 확장 가능. | fix commit message 에 정확한 line/component 명시 |
| 2 | LogoutPage 컴포넌트의 i18n — instant redirect 라 visible 텍스트 거의 없음. loading spinner 표기 시 i18n 키 신설 vs 기존 키 재사용. | 기존 키 재사용 (예: `common.loading`) 또는 텍스트 자체 0 (즉시 redirect). 신설 금지. | n/a |
| 3 | BE 측 refresh-token revoke API 호출 여부 — `/logout` 시 서버에 invalidation 신호를 보낼지. | 본 task 는 클라이언트 측 클리어만. BE 호출은 별도 backlog. | iter14 또는 별도 security-hardening task 로 이관 |
| 4 | `redroid` Docker 기반 Android 실현 가능성 — Windows 11 + WSL2 + KVM 노출은 비공식 경로 (Hyper-V 와 충돌 가능). | docs 에 "research 단계" 로 라벨링 + Linux 호스트 한정 권장 + Windows 에서는 real device USB primary. 실제 PoC 는 별도 환경 task. | 환경 backlog 화 |
| 5 | Smoke 보고서 line 73 reference vs 실제 코드 (line 73 = `useQuery`) 의 불일치 — 보고서가 오기 했을 가능성. | 본 task 는 보고서를 신뢰 (W1.frontend-dev 가 fix 시 정확한 위치를 commit 에 박제). 보고서 수정 PR 은 별도. | smoke 보고서 정정 (선택) |

---

## 10. References

- `docs/qa/live-test-2026-05-10-prelaunch-smoke.md` — fix 대상 출처 (commit `78df801`)
- `docs/operations/operations-guide.md` — doc-writer 변경 대상
- `apps/web/src/pages/m-home/index.tsx` — frontend-dev 변경 대상 #1
- `apps/web/src/app/App.tsx` — frontend-dev 변경 대상 #2
- `apps/desktop/src/main/index.ts` — frontend-dev 변경 대상 #3
- `.claude/agents/planner.md`, `.claude/agents/frontend-dev.md`, `.claude/agents/doc-writer.md`, `.claude/agents/_common-prompt-rules.md` — agent rules
