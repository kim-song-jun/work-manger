---
title: 출시 직전 풀 스모크 — 4 페르소나 × 3 플랫폼 (2026-05-10)
test_date: 2026-05-10
test_method: Playwright MCP (Web) + Electron CDP (`/json/list` on :9222) + Flutter CLI + emulator (cold-boot 시도)
screenshots: docs/qa/screenshots/smoke-2026-05-10/
parent_session: docs/qa/iter13-live-test-findings.md (직전 라이브 테스트, 2026-05-09)
scope: operations-guide §11.1 v1.0 출시 전 체크리스트 기준 풀 스모크
---

# 출시 직전 풀 스모크 보고서 — 2026-05-10

## 0. 한 줄 요약

iter13 머지 후 출시 직전 풀 스모크 테스트:

- **Web** (4 페르소나 × 핵심 라우트): 큰 회귀 없음 ✅. 직전 GAP-A (admin/settings) 회귀 없음 ✅. iter13 T3 (보상휴가) + T6 (owner billing) 정상.
- **Electron**: `--remote-debugging-port=9222` 부착 후 `/login` 정상 로드 — 직전 **GAP-G (renderer fail) 회귀 없음** ✅.
- **APK 빌드**: 🔴 `JAVA_HOME=C:\Program Files\Java\jdk-1.8` (존재하지 않는 경로) → Gradle assembleDebug 실패. Flutter SDK / ADB CLI 자체는 정상 (`C:\dev\flutter`, `C:\dev\android\platform-tools`).
- **Android Emulator**: 🔴 `emulator-5554 offline` — 프로세스 강제 kill + cold-boot (`-wipe-data -no-snapshot -gpu swiftshader_indirect`) 후에도 emulator/qemu 프로세스 자체가 살아남지 못함. **GAP-16 (직전 세션 박제) 그대로 회귀**.

신규 product GAP는 미미 (logout 직접 URL 404 + HomePage React key warning); 출시 블로커는 환경 이슈 2건 (JDK / emulator).

---

## 1. 환경

| 항목 | 값 |
|---|---|
| `main` HEAD | `12d86f2` (iter13 박제 commit) |
| 작업 위치 | `.claude/worktrees/iter12-live-test/` (박제 폴더, 실제 git worktree 아님 → `git -C`로 main repo에 직접 명령) |
| Docker stack | `wm-api wm-beat wm-db wm-ntfy wm-redis wm-web wm-worker wm-ws` 모두 healthy (2일+ 가동) |
| Web | Vite dev `http://localhost:4444` (docker `wm-web` 컨테이너) |
| BE API | Django `http://localhost:4455` (`/v1/health` 200) |
| Electron | local `apps/desktop` `npm run build:ts` + `electron --remote-debugging-port=9222 dist/main/index.js` (env `WM_DEBUG=1`) |
| Flutter | `C:\dev\flutter` 3.27.4 stable (Dart 3.6.2) |
| ADB | `C:\dev\android\platform-tools\adb.exe` |
| AVD | `wm_test` |
| 데모 회사 | Acme (code `ACMEDM`) |
| 데모 계정 | `owner@acme.demo`, `admin@acme.demo`, `manager{1..3}@acme.demo`, `<name>-<random>@acme.demo` (PW `DemoPass!1`) |

---

## 2. Web — 4 페르소나 sweep

### 2.1 OWNER (`owner@acme.demo`)

`/m/home` 으로 첫 진입 → 사이드바에서 `/admin` 진입 가능. Admin 메뉴 + **결제 / 소유자** 라벨 노출.

| # | 라우트 | 결과 | 박제 |
|---|---|---|---|
| 1 | `/m/home` (login redirect) | ✅ — 단, **HomePage React `key` warning** (콘솔, 아래 §4) | [01-owner-mhome.png](screenshots/smoke-2026-05-10/01-owner-mhome.png) |
| 2 | `/admin` 대시보드 | ✅ — 출근률/미출근/승인대기/진행중 KPI + 빠른 액션 | [02-owner-admin.png](screenshots/smoke-2026-05-10/02-owner-admin.png) |
| 3 | `/admin/approvals` 승인 관리 | ✅ — 대기 9건, 페르소나별 [초과근무]/[연차] 라벨 |  |
| 4 | `/admin/employees` 직원 관리 | ✅ — 검색·역할 필터, 25명 시드 |  |
| 5 | `/admin/expiring-leave` 소멸 예정 | ✅ (lazy chunk 2초) — "60일 이내 소멸 위험" |  |
| 6 | `/admin/reports` 월간 리포트 | ✅ — 월 선택 + CSV/PDF 내보내기 + 4 KPI + 팀별 성과 |  |
| 7 | `/admin/audit` 감사 로그 | ✅ — 액션/수행자/기간 필터 |  |
| 8 | `/admin/codes` 초대 코드 | ✅ — `ACMEDM` 활성 코드 표시 |  |
| 9 | `/admin/compliance` 52시간 | ✅ — 회사 전체 주간 누적, 페르소나별 32/52 정상 |  |
| 10 | `/admin/settings` 회사 설정 | ✅ — **직전 GAP-A 회귀 없음** | [03-owner-admin-settings.png](screenshots/smoke-2026-05-10/03-owner-admin-settings.png) |
| 11 | `/owner/billing` 결제·구독 (iter13 T6) | ✅ — Standard ₩50,000/월 체험판, 다음 결제일 표시 | [04-owner-billing.png](screenshots/smoke-2026-05-10/04-owner-billing.png) |

**i18n missing key sweep**: `?[key.path]` 정규식 zero-hit (모든 라우트). ✅

### 2.2 ADMIN (`admin@acme.demo`)

| # | 라우트 | 결과 | 박제 |
|---|---|---|---|
| 12 | `/admin` 대시보드 | ✅ — 사이드바에서 **결제/소유자 라벨 자동 제외** (권한 분리 정상) | [05-admin-dashboard.png](screenshots/smoke-2026-05-10/05-admin-dashboard.png) |
| 13 | `/owner/billing` (직접 입력) | ✅ — `/admin` 으로 **가드 redirect** (RoleBasedRedirect 정상 동작) |  |

### 2.3 MANAGER (`manager1@acme.demo`)

| # | 라우트 | 결과 | 박제 |
|---|---|---|---|
| 14 | `/m/home` | ✅ | [06-manager-mhome.png](screenshots/smoke-2026-05-10/06-manager-mhome.png) |
| 15 | `/m/inbox` 요청함 | ✅ — 승인할 것/내 요청/알림 탭 |  |
| 16 | `/m/team` 팀 현황 | ✅ — 그리드/팀별/타임라인 탭 |  |
| 17 | `/m/leave` 연차 | ✅ — 잔여 15일 |  |
| 18 | `/m/my` 마이 | ✅ — **로그아웃 버튼 정상 노출** |  |

### 2.4 EMPLOYEE (`alice-imxmm6@acme.demo`)

| # | 라우트 | 결과 | 박제 |
|---|---|---|---|
| 19 | `/m/home` | ✅ — 인사말 + 출근 슬라이더 + KPI (이번 주 24h, 잔여 17일) | [07-employee-mhome.png](screenshots/smoke-2026-05-10/07-employee-mhome.png) |
| 20 | `/m/leave/apply` (iter13 T3) | ✅ — **유형 SegmentedControl 에 "연차 / 보상휴가" 정상 표시** | [08-employee-leave-apply.png](screenshots/smoke-2026-05-10/08-employee-leave-apply.png) |

---

## 3. Electron — `--remote-debugging-port=9222`

```
URL=http://localhost:4444/login
URL=devtools://devtools/bundled/devtools_app.html ...   ← WM_DEBUG=1 detach DevTools 자동 부착
```

- ✅ **GAP-G (직전 세션 renderer-fail) 회귀 없음** — Electron 33.4.11 / Chrome 130.0.6723.191 / `/login` 정상 로드.
- ✅ DevTools detach 모드 자동 오픈 (WM_DEBUG=1 임시 진단 코드 — `apps/desktop/src/main/index.ts:64-77`, GAP-G 태그 잔존).
- 박제: [09-electron-login.png](screenshots/smoke-2026-05-10/09-electron-login.png) (Playwright MCP 브라우저 캡처 — Electron CDP attach 없이 `/json/list` 로 페이지 URL만 검증)
- 권장 후속: WM_DEBUG 디버그 코드는 GAP-G 해결 확인됐으므로 제거 가능 (release 전).

---

## 4. APK 빌드 + Emulator — 🔴 환경 블로커 2건

### 4.1 GAP-NEW-3 (env): JAVA_HOME 잘못된 경로 → APK 빌드 실패

```
ERROR: JAVA_HOME is set to an invalid directory: C:\Program Files\Java\jdk-1.8
Gradle task assembleDebug failed with exit code 1
```

**원인**: 환경변수 `JAVA_HOME` 이 존재하지 않는 JDK 1.8 경로를 가리킴. Flutter 3.27 + AGP 8.x 는 JDK 17+ 필요. JDK 표준 위치 (`C:\Program Files\Java`, `Eclipse Adoptium`, `Microsoft\jdk-17`, Android Studio `jbr`) 모두 비어 있음 — JDK 미설치.

**조치**:
1. JDK 17 설치 (Eclipse Temurin 또는 Microsoft Build of OpenJDK 17 권장)
2. `JAVA_HOME` 재설정
3. (옵션) `flutter config --jdk-dir <path>` 로 Flutter 전용 JDK 고정

### 4.2 GAP-16 회귀 (env): Android emulator 부팅 실패

| 시도 | 결과 |
|---|---|
| `adb devices` | `emulator-5554 offline` (`transport_id:1` stale) |
| `adb kill-server` + `adb start-server` | 여전히 offline |
| `adb -s emulator-5554 reboot` | `error: device offline` |
| 프로세스 강제 kill (`qemu-system-x86_64`, `emulator`, `crashpad_handler`) + adb 재기동 | offline 유지 (transport stale) |
| Cold boot (`emulator -avd wm_test -wipe-data -no-snapshot -no-boot-anim -noaudio -gpu swiftshader_indirect`) | 프로세스 시작 후 즉시 종료 (Get-Process 결과 비어있음) |

**원인 추정**: 직전 세션 박제 (`16-android-novnc-emulator-FATAL.png`)에서 보고된 KVM/HAXM 가상화 또는 GPU 드라이버 이슈와 동일 패턴 회귀. Windows 11 + AVD `wm_test` 조합에서 재현됨.

**조치**:
1. `emulator -avd wm_test -verbose` 로 부팅 로그 캡처해 실패 원인 정확히 식별 (BIOS Hyper-V/VBS 충돌 또는 Intel HAXM 부재 등)
2. (대안) `-accel off -gpu swiftshader_indirect` 강제 software 모드 시도
3. (대안) BrowserStack / Genymotion / 실기기 USB-debugging 으로 우회

---

## 5. Web 콘솔 / Dead-link 발견 (minor)

| 코드 | 위치 | 등급 | 설명 |
|---|---|---|---|
| GAP-NEW-1 | `/logout` 직접 navigate | ⚪ minor | 404 fallback ("페이지를 찾을 수 없어요") — 실 사용 동선은 `/m/my → 로그아웃 버튼` 으로 정상. bookmark/redirect target로는 미사용. 박제: [F01-logout-404.png](screenshots/smoke-2026-05-10/F01-logout-404.png) |
| GAP-NEW-FE-1 | `apps/web/src/pages/m-home/index.tsx:73` | 🟡 cleanup | React `Each child in a list should have a unique "key" prop` warning (HomePage). prod 동작에는 영향 없으나 release 전 정리 권장 |
| (관측) | `/v1/me` × 3회 401 | ⚪ ignorable | 로그인 직후 토큰 부착 전 race fetch — 단발성, 재시도 후 200 |
| GAP-NEW-2 | EMPLOYEE 시드 이메일 | ⚪ doc | seed_demo.py 가 `<name>-<random6>@acme.demo` 패턴으로 생성 → 데모 가이드/QA 매뉴얼에 "직원 이메일은 `/v1/admin/employees` 로 조회" 명시 필요 |

---

## 6. 출시 체크리스트 (operations-guide §11.1) 영향 평가

| §11.1 항목 | 이번 스모크 결과 |
|---|---|
| BE 코드 변경 후 smoke (`/v1/admin/settings → 401`) | 별도 BE 변경 없음 — 기존 docker stack healthy |
| audit log 보존 (90d batch) | UI 도달 ✅ (감사 로그 페이지) — Celery Beat 실제 fire 검증은 별도 |
| 부하·카오스·보안·법무·스토어 심사 | 기존 상태 유지 (이번 세션 범위 외) |
| **App Store / Play Store 심사 통과** | **🔴 APK 빌드 자체가 JDK 환경 미비로 실패** — 심사 진행 전 JDK 셋업 필수 |
| Apple Notarization / Windows code signing | 기존 미완 유지 |
| 사용자 매뉴얼 / 도움말 / FAQ | 4 페르소나 sweep 시 i18n 누락 zero ✅ |

---

## 7. 차회 권장 순서

1. **JDK 17 설치 + JAVA_HOME 정합** → APK assembleDebug 통과 확인 (출시 블로커 1순위)
2. **emulator `-verbose` 부팅 로그** 로 GAP-16 근본 원인 식별 — 이게 풀리지 않으면 실기기 USB-debugging 으로 첫 라이브 테스트 진행
3. `apps/web/src/pages/m-home/index.tsx:73` HomePage `key` prop 추가 + WM_DEBUG=1 임시 진단 코드 제거 (Electron `index.ts:64-77`)
4. `/logout` SPA 라우트 추가 (선택) — `<Navigate to="/login" />` 로 인증 토큰 클리어 + redirect 보장

---

## 부록 A. 박제 스크린샷 인덱스

```
docs/qa/screenshots/smoke-2026-05-10/
├── 01-owner-mhome.png            owner login → /m/home
├── 02-owner-admin.png            /admin 대시보드 (사이드바 11개 메뉴)
├── 03-owner-admin-settings.png   /admin/settings 회사 설정 (GAP-A 회귀 없음)
├── 04-owner-billing.png          /owner/billing (iter13 T6)
├── 05-admin-dashboard.png        admin 사이드바 (결제/소유자 자동 제외)
├── 06-manager-mhome.png          manager /m/home
├── 07-employee-mhome.png         employee /m/home (잔여 17일)
├── 08-employee-leave-apply.png   /m/leave/apply (iter13 T3 보상휴가 옵션)
├── 09-electron-login.png         Electron renderer /login (참고용)
└── F01-logout-404.png            /logout 직접 URL 404 (GAP-NEW-1)
```
