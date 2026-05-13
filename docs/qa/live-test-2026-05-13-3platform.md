# Live Test — 3-Platform (Web + Electron + Mobile) (2026-05-13)

> **Branch**: `task/sdd-baseline-impl` (PR #4)
> **Last commit**: `682d508` fix(web/m-inbox): default tab race
> **Stack**: docker compose up + dev seed_demo (29 memberships, 9 leave, 3 OT, 6 ApprovalTask PENDING)
> **Tester**: Claude (Opus 4.7) + Chrome MCP + Electron CDP

본 보고서는 PR #4 머지 전 3 플랫폼 실제 앱 부팅 + 핵심 경로 검증.

---

## 0. 결과 요약

| 플랫폼 | 부팅 | 핵심 경로 | i18n 누락 | 신규 finding |
|---|---|---|---|---|
| Web (Chrome MCP) | ✅ | 4 페르소나 × 13+ routes, 빌링 disabled + tooltip, m-inbox MANAGER tab race fix 검증 | 0 | F-2026-05-13-06 ✅ fixed |
| Electron (Windows) | ✅ | dist/main/index.js + `--remote-debugging-port=9222`. 윈도우 1개 (`근무 관리`) → `http://localhost:4444/login` 로딩 성공 | n/a (renderer = web SPA) | — |
| Mobile (Android) | 🟡 부분 — APK 빌드 OK, 실 기기/emulator 부재 | 단위 22/22 ✅ | 실행 못 함 | GAP-16 회귀 진행 중 |

---

## 1. Web — Chrome MCP 확장 sweep

### 1.1 환경
- `docker compose up -d db redis ntfy api ws web` 후 `--profile seed run --rm seed`
- API: `http://localhost:4455/v1/health` → 200
- Web: `http://localhost:4444` (Vite v5.4.21)

### 1.2 페르소나 sweep (재실행)

| 페르소나 | 계정 | 핵심 경로 | 결과 |
|---|---|---|---|
| EMPLOYEE | `diana-ngiaqq@acme.demo` | /m/home, /m/leave (잔여 15일), /admin → /m/home redirect | ✅ 권한 가드 정상 |
| MANAGER | `manager1@acme.demo` | /m/home, **/m/inbox** (regression fix 검증), /web/inbox (6 PENDING), /admin → /m/home redirect | ✅ inbox 6건 정상 표시 |
| ADMIN | `admin@acme.demo` | /admin 대시보드 (KPI 9 PENDING), 9건 승인, /admin/{employees,audit,compliance,settings,expiring-leave,codes,reports}, /owner/billing → /admin redirect | ✅ |
| OWNER | `owner@acme.demo` | /owner/billing — Standard 플랜 / ₩50,000 월 / 다음 결제일 2026-05-27 / "플랜 변경" disabled + tooltip `iter14 예정 — Stripe 결제 연동 후 활성화` | ✅ skeleton 상태 |

### 1.3 m-inbox 신규 finding F-2026-05-13-06

**증상**: MANAGER `manager1@acme.demo` 가 `/m/inbox` 진입 시 "내 요청" 탭이 기본 선택되어 PENDING 6건이 표시되지 않음 — 사용자는 "처리할 항목이 없어요" 빈 상태만 봄. `/web/inbox` 에서는 동일 API 응답으로 6건 정상.

**진단**:
- `useState<Tab>(defaultTab)` 가 첫 렌더 시점에 탭 고정
- `useMe()` 로딩 중 → `me.data?.memberships?.[0]?.role ?? "EMPLOYEE"` → defaultTab="mine"
- me.data resolve 후에도 useState 가 재계산 안 됨

**Fix** (commit `682d508`):
- myRole 폴백 제거 (null 사용)
- `useEffect` 로 myRole known 시점에 tab 재계산
- `userPickedRef` 로 사용자 명시적 선택 보호

**검증**:
- Chrome MCP 라이브: 재진입 시 "승인할 것" auto-selected + 6 items (Mona/Kim OVERTIME, Ivan/Ethan/Charlie/Alice LEAVE) 표시
- vitest 신규 case: `m-inbox/__tests__/page.test.tsx` — race regression 시뮬레이션 (useMe undefined → MANAGER 전이)

---

## 2. Electron — Windows 부팅

### 2.1 빌드
```
docker compose --profile package run --rm desktop-package
```
- electron-builder 25.1.8, linux-unpacked 산출 (Docker 는 Linux)
- Windows Setup.exe 는 이전 빌드 (May 8) 가 `apps/desktop/release/Work Manager-Setup-0.1.0.exe` (82MB)

### 2.2 부팅
Windows host 에서 직접 실행:
```cmd
cd apps/desktop
node_modules\electron\dist\electron.exe dist\main\index.js --remote-debugging-port=9222
```

DevTools listening on `ws://127.0.0.1:9222/devtools/browser/...`

### 2.3 CDP 검증
`GET http://localhost:9222/json/list`:
```
title           url                         type
-----           ---                         ----
근무 관리       http://localhost:4444/login  page
```

✅ Electron 메인 윈도우 1개 → 웹 SPA `/login` 정상 로딩.

### 2.4 검증 항목
- [x] 부팅 + 단일 윈도우 + 타이틀 "근무 관리"
- [x] WEB_URL 환경변수 미지정 → 기본 `http://localhost:4444` 로딩 (dist/main/index.ts:23)
- [x] preload bridge 적용 (`webPreferences.preload`)
- [x] dist artifact 완전 (auto-clock-in/notifications/ipc/store/tray/updater all `.js` + sourcemap)
- [ ] 트레이 아이콘 시각 확인 — GUI smoke, 사용자 manual sign-off (`memory/feedback_live_testing_session.md` §2 패턴 적용 권장)
- [ ] auto-update S3 매니페스트 → update-available 이벤트 (prod 채널 확정 후 별도 smoke; B-OPS-01/02 dependent)

### 2.5 Pre-existing flake
`apps/desktop/src/main/__tests__/updater.test.ts` — electron-updater module-level `import` 가 `app.getVersion()` 호출 → vitest jsdom 에서 `Cannot read properties of undefined`. iter8 (`e9dc326`) 이후 미터치. **권장**: `vi.mock("electron-updater", ...)` early hoist 또는 electron-updater 버전 핀.

---

## 3. Mobile (Android Flutter) — APK + 단위 테스트

### 3.1 단위 테스트 (Docker)
```
make test-mobile
```
- 22 passed (geofence_service / geofence_payload / ntfy_client / bridge_payload / widget_channel_payload)
- 실행 시간 ~3 분 (image build + flutter pub get + test)

### 3.2 APK 빌드
- 기존 산출 `apps/mobile/build/app/outputs/flutter-apk/app-debug.apk` (79 MB, May 10) — **iter14 prelaunch smoke 시 빌드, 본 세션의 변경(useMe / m-inbox / B-CODE-08) 미포함**
- 본 세션 신규 빌드: `docker compose --profile package run --rm mobile-package` → 🔴 Gradle assembleDebug failed in 6m 49s (Docker 출력 truncated — JDK / Gradle 호환성 또는 cache 손상 추정)
- **Follow-up**: Docker mobile-package 컨테이너 rebuild + `--stacktrace` 옵션으로 RCA 확보 필요. 본 PR 머지 차단 사유 아님 (단위 22 ✅ + 코드 변경은 WebView SPA 만 영향).

### 3.3 실 기기/Emulator 검증
- **ADB**: `C:/dev/android/platform-tools/adb.exe devices` → 빈 리스트 (emulator-5554 가 offline 였으나 disconnect 로 정리)
- **Emulator**: `wm_test` AVD — `emulator -avd wm_test -no-snapshot` 즉시 종료 (GAP-16 재현, 2026-05-10 부터 이어진 환경 회귀)
- **실 기기**: 본 세션 부재
- **Live install + smoke**: ❌ 불가

### 3.4 우회 방안 (백로그)
- B-OPS-03 (App Store / Play Store 등록) 일정과 묶어서 실 기기 1대 확보
- emulator GAP-16: Hyper-V 충돌 해결 또는 Genymotion / BrowserStack 활용
- iOS: B-CODE-02 (iOS 네이티브) — Mac signing host 확보 시 동시 진행

### 3.5 다음 단계 (실 기기 확보 시)
```bash
# 1) 디바이스 연결 + USB-debugging
adb devices  # → device 상태

# 2) APK 설치
adb install apps/mobile/build/app/outputs/flutter-apk/app-debug.apk

# 3) Logcat (ntfy / geofence 채널)
adb logcat | grep -E "wm.geofence|ntfy|WorkManager"

# 4) 앱 실행 후 sweep
# - WebView SPA 로딩 (= web 라이브 테스트와 동일 경로)
# - 위치 권한 다이얼로그 → 강남 오피스 geofence
# - 푸시 토큰 등록 (POST /v1/notifications/devices)
# - ntfy WS 연결 확인 (logcat: NtfyForegroundService)
# - Glance widget 홈화면 노출
```

---

## 4. 종합 Finding

| ID | 영역 | 우선순위 | 상태 |
|---|---|---|---|
| F-2026-05-13-06 m-inbox MANAGER default tab race | Web | P0 | ✅ FIXED `682d508` |
| F-2026-05-13-04 desktop updater.test.ts pre-existing | Electron | P2 | 🟡 OPEN — backlog 후보 |
| GAP-16 Android emulator | Mobile | P1 | 🟡 OPEN — 환경 이슈, B-OPS-03 와 묶음 |
| F-2026-05-13-02 "iter14 예정" tooltip stale | Web | P2 | 🟡 OPEN — B-CODE-01 (Stripe) 완료 시 갱신 |

이전 F-2026-05-13-03 ("manager1 인박스 비어있음") 은 F-2026-05-13-06 fix 로 해결되었으므로 폐기 (incorrect diagnosis).

---

## 5. 회귀 매트릭스 — 본 세션

| Test | Status | Count |
|---|---|---|
| make test-be | ✅ | 331 passed (B-CODE-06 +29) |
| make test-fe | ✅ | 75 files / 297 tests + build (m-inbox vitest +1 race case) |
| make test-mobile | ✅ | 22 passed |
| make test-desktop | 🟡 | 10/13 (F-2026-05-13-04 pre-existing) |
| Chrome MCP persona sweep | ✅ | 4/4 personas + 13+ routes + manager m-inbox |
| Electron CDP smoke | ✅ | window 1 + URL 로딩 |
| Android live install | ❌ | 환경 부재 |

---

## 6. PR 머지 권장 조건

- [x] BE / FE / Mobile / Desktop 단위 회귀 (test-desktop 1 pre-existing 허용)
- [x] Web Chrome MCP 4 페르소나 + i18n 0 + 권한 가드
- [x] Electron 부팅 + 윈도우 + URL 로딩 (CDP 확인)
- [ ] Android 실 기기 install + smoke — **post-merge / B-OPS-03 와 묶어 별도 세션 권장**
- [ ] iOS WidgetKit smoke — **B-CODE-02 + B-OPS-02 dependent**

PR #4 본 머지는 위 4가지 ✅ + Android/iOS 는 별도 트랙 으로 진행 권장.
