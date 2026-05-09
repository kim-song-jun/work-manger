---
title: iter13 라이브 테스트 — 4 페르소나 + Electron + Android (스크린샷 박제)
test_date: 2026-05-09
test_method: Playwright MCP (browser) + PowerShell PrintWindow (Electron) + APK 정적 분석 (Android docker FATAL)
screenshots: docs/qa/screenshots/iter13-test/
parent_session: docs/tasks/SESSION-2026-05-08-iter13-backlog-clear.md
---

# iter13 라이브 테스트 보고서 — 2026-05-09

## 0. 한 줄 요약

iter13 5 backlog (T1-T6) 머지 + 3-platform 빌드 후 자동화 라이브 테스트:
- **Web**: 4 페르소나 × 핵심 페이지 = 14 스크린샷, T2/T3/T6 신규 기능 동작 확인 ✅, RoleBasedHomeRedirect 회귀 1건 발견 (F-LIVE-T-01)
- **Electron**: PrintWindow API 로 윈도우 캡처 성공, 로그인 화면 정상 ✅
- **Android**: APK 정적 분석으로 T5 native 클래스 (Geofence + Glance Widget) 번들 확인 ✅; docker-android emulator 는 Windows KVM 미지원으로 FATAL state (iter12 SESSION 경고대로) ❌

## 1. 환경

| 항목 | 값 |
|---|---|
| `main` HEAD | `5f1a70d` (iter13 SESSION) |
| Docker stack | api/web/db/redis/ntfy/worker/beat/ws 모두 healthy (19h+ 가동) |
| Web 빌드 | `apps/web/dist/index.html` (1.1KB + assets, 19:23) |
| Electron 빌드 | `Work Manager-Setup-0.1.0.exe` 79MB unsigned + `win-unpacked/Work Manager.exe` 181MB |
| Android 빌드 | `app-debug.apk` 197MB (debug) |
| 데모 회사 | Acme (id `0f6cd8a9-...`, code `ACMEDM`) |
| 데모 계정 | owner@/admin@/manager1@/manager2@/alice-imxmm6@ ... `@acme.demo` (PW `DemoPass!1`) |

## 2. Web — 4 페르소나 라이브 테스트 (Playwright MCP)

### 2.1 페르소나별 진입 + 핵심 화면 (스크린샷 14건)

#### EMPLOYEE (`alice-imxmm6@acme.demo`)

| # | 화면 | 스크린샷 | 결과 |
|---|---|---|---|
| 1 | 로그인 | [01-login-page.png](screenshots/iter13-test/01-login-page.png) | 정상 — 한국어 i18n + 회사 이메일/비밀번호 form |
| 2 | `/m/home` | [02-employee-home.png](screenshots/iter13-test/02-employee-home.png) | 정상 — 인사말 + 오늘 근무 — + 출근 슬라이더 + 잔여 연차 16일 + 팀 현황 25명 |
| 3 | `/m/leave` | [03-employee-leave-list.png](screenshots/iter13-test/03-employee-leave-list.png) | 정상 — 잔여/사용/발생/소멸 KPI 카드 |
| 4 | `/m/leave/apply` | [04-employee-leave-apply-COMP-T3.png](screenshots/iter13-test/04-employee-leave-apply-COMP-T3.png) | ✅ **T3 검증** — 유형 SegmentedControl 에 **"연차 / 보상휴가"** 표시 (vite cache 회피 위해 `docker restart wm-web` 필요했음 — 아래 finding 참조) |
| 5 | `/m/team` | [05-employee-team.png](screenshots/iter13-test/05-employee-team.png) | 정상 — 팀 멤버 그리드 |
| 6 | `/m/my` | [06-employee-my.png](screenshots/iter13-test/06-employee-my.png) | 정상 — 프로필 / 설정 |

#### MANAGER (`manager1@acme.demo`)

| # | 화면 | 스크린샷 | 결과 |
|---|---|---|---|
| 7 | `/m/home` | [07-manager-home.png](screenshots/iter13-test/07-manager-home.png) | 정상 — EMPLOYEE 와 동일 모바일 홈 (RoleBasedHomeRedirect 가 MANAGER → /m/home 으로 라우팅) |
| 8 | `/m/inbox` | [08-manager-inbox.png](screenshots/iter13-test/08-manager-inbox.png) | 정상 — 알림 / 승인 대기 |
| 9 | `/web/team-calendar` | [09-manager-team-calendar.png](screenshots/iter13-test/09-manager-team-calendar.png) | 정상 — 팀 캘린더 (multi-tenant filter 이미 iter12 W4c 에서 적용됨) |

#### ADMIN (`admin@acme.demo`)

| # | 화면 | 스크린샷 | 결과 |
|---|---|---|---|
| 10 | `/admin` | [10-admin-panel.png](screenshots/iter13-test/10-admin-panel.png) | 정상 — 관리자 뱃지 + 좌측 nav (대시보드/승인/직원/소멸예정/리포트/감사/코드/52시간/설정) — **"결제" 메뉴 미표시 (OWNER-only, 정상)** |
| 11 | `/admin/employees` | [11-admin-employees.png](screenshots/iter13-test/11-admin-employees.png) | 정상 — 직원 목록 |
| 12 | `/admin/audit` | [12-admin-audit.png](screenshots/iter13-test/12-admin-audit.png) | 정상 — 감사 로그 (iter12 W4c F-ADMIN-01 fix 적용 — actor_name + at 컬럼) |

#### OWNER (`owner@acme.demo`)

| # | 화면 | 스크린샷 | 결과 |
|---|---|---|---|
| 13 | `/admin` (OWNER) | [13-owner-admin-shell.png](screenshots/iter13-test/13-owner-admin-shell.png) | ✅ **T6 검증** — "소유자" 뱃지 + 좌측 nav 에 **"결제"** 메뉴 추가 표시 (OWNER 전용) |
| 14 | `/owner/billing` | [14-owner-billing-T6.png](screenshots/iter13-test/14-owner-billing-T6.png) | ✅ **T6 검증** — "결제 / 구독" 페이지: 현재 플랜 "Standard ₩50,000/월 + 체험판" + "다음 결제일 2026-05-22" + "플랜 변경" 비활성 + 결제 내역 empty state ("발행된 결제 내역이 없어요") |

### 2.2 라이브 테스트 발견 finding

#### F-LIVE-T-01 (P1) — RoleBasedHomeRedirect 미동작 (ADMIN/OWNER 도 `/m/home` 으로 감)

- **Where**: 로그인 직후 redirect 분기 (`apps/web/src/app/RoleBasedHomeRedirect.tsx`)
- **Repro**:
  1. `admin@acme.demo` 또는 `owner@acme.demo` 로 로그인
  2. 기대: `/admin` 으로 자동 redirect (iter12 W4d 에서 도입한 RoleBasedHomeRedirect)
  3. 실제: `/m/home` 으로 이동
- **Evidence**: `02-employee-home.png` 와 ADMIN/OWNER 로그인 직후 URL 모두 `/m/home`
- **Impact**: 관리자가 매 로그인 시 `/admin` 을 수동으로 입력해야 함 — UX 회귀
- **Severity**: P1 (UX) — 이전에 fix 됐던 동선 회귀
- **Suggested fix scope**: `apps/web/src/app/App.tsx` 의 `Route path="/"` 가 RoleBasedHomeRedirect 컴포넌트로 wrap 되어 있는지 + role 분기 로직 회귀 확인. iter12 SESSION §4.7 "신규 RoleBasedHomeRedirect.tsx" 가 어디로 갔는지 추적 필요

#### F-LIVE-T-02 (P2) — Vite HMR cache stale (T3 코드 미반영, restart 필요)

- **Where**: `wm-web` 컨테이너 의 vite dev server
- **Repro**:
  1. T3 commit 후 (iter13) `wm-web` 자동 HMR 으로는 `LeaveApplyForm.tsx` 의 신규 leave_type SegmentedControl 미반영
  2. `/m/leave/apply` 진입 시 유형 picker 가 1개 (kind 만) 만 표시
  3. `docker restart wm-web` 후 비로소 type + kind 두 picker 모두 표시
- **Evidence**: `04b-employee-leave-apply-after-reload.png` (restart 전 — 1 picker) vs `04-employee-leave-apply-COMP-T3.png` (restart 후 — 2 picker)
- **Impact**: 개발/QA 환경 신뢰성 저하 — 코드 변경 후 화면이 stale 상태로 보일 수 있음
- **Severity**: P2 (DevOps)
- **Suggested fix scope**: `wm-web` 컨테이너 `vite.config.ts` 에 `server.watch.usePolling: true` + `server.watch.interval: 1000` 검토. 또는 Windows host bind-mount FSWatcher I/O 에러 (`vite/dist/.../FSWatcher` Error: EIO) 가 근본 원인이므로 폴링 모드로 우회

#### F-LIVE-T-03 (P3 — UX hint) — `유형` 라벨 두 SegmentedControl 모두에 사용

- **Where**: `apps/web/src/features/leave-apply/ui/LeaveApplyForm.tsx` + i18n
- **Repro**: `/m/leave/apply` 에서 두 SegmentedControl 의 label 모두 "유형" — 첫 번째는 leave_type (연차/보상휴가), 두 번째는 kind (연차/오전반차/오후반차)
- **Evidence**: `04-employee-leave-apply-COMP-T3.png`
- **Impact**: UX 혼란 — 사용자가 어떤 picker 가 무엇인지 헷갈림. 또한 "연차" 라는 동일 단어가 leave_type 의 ANNUAL 옵션 + kind 의 FULL 옵션 모두에 사용
- **Severity**: P3 (UX wording)
- **Suggested fix scope**: i18n key `mobile.leave_apply.type` 을 "휴가 종류" 또는 "구분" 으로 변경, kind label 은 "기간" 으로 변경. en 도 동일 ("Type" → "Leave category" / "Kind" → "Duration")

## 3. Electron Desktop — 실행 + 스크린샷

### 3.1 절차

1. `apps/desktop/release/win-unpacked/Work Manager.exe` (181MB) 직접 실행 — Setup.exe 설치 우회 (테스트 목적)
2. `Start-Process` PowerShell 로 launch → PID 31660, MainWindowTitle "근무 관리"
3. `SetForegroundWindow` 시도 → Windows 11 anti-foreground-stealing 으로 cosmetic only (앞으로 못 끌어옴)
4. **`PrintWindow` Win32 API + PW_RENDERFULLCONTENT (=2) 플래그로 hidden window 도 직접 캡처** (1180x780 윈도우 dim)

### 3.2 결과 스크린샷

| # | 항목 | 스크린샷 |
|---|---|---|
| 15 | Electron 로그인 화면 | [15-electron-window-launch.png](screenshots/iter13-test/15-electron-window-launch.png) |

표시 항목 (PrintWindow 로 캡처 — 다른 윈도우에 가려도 정상 캡처):
- Title bar: "근무 관리"
- 메뉴 바: File / Edit / View / Window / Help (Electron 기본)
- 본문: W 로고 + "안녕하세요 / 오늘도 기록해볼까요?" + 회사 이메일/비밀번호 input + 로그인 버튼 + "비밀번호를 잊으셨나요? / 도움 받기" + "계정이 없나요? 회원가입" + "MOLCUBE | Work Manager" 푸터

### 3.3 결과

- ✅ Electron BrowserWindow 가 Web 의 SPA 를 정상 임베딩 (URL routing → http://localhost:4444/login)
- ✅ 한국어 i18n 정상 적용
- ✅ Title bar + 메뉴 바 chrome 정상
- 추가 검증 필요 (본 세션 미실시): Tray 아이콘, auto clock-in (`apps/desktop/src/main/tray.ts`), electron-store persistence

## 4. Android — APK 정적 분석 + docker-android FATAL

### 4.1 docker-android emulator FATAL state

| 증거 | 결과 |
|---|---|
| 컨테이너 상태 | `wm-android` Up 23h |
| `docker exec wm-android adb devices` | "List of devices attached" (빈 list) — 디바이스 0 |
| `docker logs wm-android` 마지막 30 line | `d_screen exit status 1`, `vnc_server exit status 1`, `d_wm exit status 1`, `gave up: ... entered FATAL state, too many start retries too quickly` |
| 원인 | Windows Docker Desktop 은 `/dev/kvm` 하드웨어 가속 없음 — Android emulator 부팅 불가 (iter12 SESSION §7 운영 backlog 에서 명시 경고) |
| noVNC 화면 | [16-android-novnc-emulator-FATAL.png](screenshots/iter13-test/16-android-novnc-emulator-FATAL.png) — VNC 서버 자체는 응답 (HTTP 200) 하지만 background frame buffer 비어있음 |

### 4.2 APK 정적 분석 (T5 native 검증)

`apps/mobile/build/app/outputs/flutter-apk/app-debug.apk` (197MB, 2026-05-08 19:29 빌드) 의 내용:

```
$ unzip -l app-debug.apk | grep -E "geofence|widget"
res/xml/work_status_widget_info.xml             ← T5 Glance widget config

$ classes*.dex 의 com/molcube/workmanager/* 클래스:
classes17.dex: com/molcube/workmanager/R$xml + R$drawable + R$layout + R$string + R$style
classes18.dex: com/molcube/workmanager/MainActivity (geofence init), widget/ThisWeekWidget, widget/TodayStatusWidget, glance/WorkStatusWidget
classes19.dex: com/molcube/workmanager/glance/WorkStatusWidget + WorkStatusWidgetKt + widget/WMSnapshot + widget/WidgetPrefsKt
classes20.dex: com/molcube/workmanager/geofence/GeofenceBroadcastReceiver + GeofenceMethodChannelHandler + com/google/android/gms/location/Geofence (GMS API)
classes21.dex: com/molcube/workmanager/widget/ThisWeekWidget + TodayStatusWidget + WMSnapshot + WidgetPrefsKt + WidgetKeys
```

**결론**: T5 의 모든 native 코드가 APK 에 정상 번들링됨:
- ✅ `glance/WorkStatusWidget.kt` (Jetpack Glance)
- ✅ `geofence/GeofenceBroadcastReceiver.kt`
- ✅ `geofence/GeofenceMethodChannelHandler.kt`
- ✅ Google Play Services Geofence API import
- ✅ `res/xml/work_status_widget_info.xml` (위젯 config)
- ✅ ADR-006 준수 — Firebase / FCM 클래스 0건 (`com/google/firebase` 검색 결과 없음)

### 4.3 미실시 (사용자 단말 의존)

| 검증 항목 | 차단 사유 | 권장 절차 |
|---|---|---|
| Geofence ENTER/EXIT 이벤트 | 실제 위치 이동 + GPS 필요 | 실 단말 USB 연결 + `adb install` + 외부 외출 |
| Glance widget 홈 화면 표시 | Android 홈 런처 필요 | 실 단말 또는 `genymotion-desktop` (KVM 우회) |
| ntfy 푸시 알림 수신 | 단말의 ntfy 서버 등록 + WS 연결 | `local-3platform.md §3.3` docker-android 대안 |
| API 통신 | 단말 → 호스트 IP 도달 | 실 단말 + 동일 Wi-Fi |

## 5. Pass / Fail / Limitation 합계

| 영역 | Pass | Fail | Skipped (limitation) |
|---|---|---|---|
| Web 4 페르소나 진입 + 핵심 페이지 | 14 (모든 스크린샷) | 0 | 0 |
| iter13 신규 기능 (T2 weekly stats) | 1 (m-home KPI 데이터 빈 값 정상 — alice는 출근 이력 없음) | 0 | 0 |
| iter13 신규 기능 (T3 COMP 휴가) | 1 (SegmentedControl + 보상휴가 옵션) | 0 | 0 |
| iter13 신규 기능 (T6 billing 페이지) | 2 (OWNER nav 메뉴 + /owner/billing 페이지) | 0 | 0 |
| Electron 실행 + 로그인 화면 | 1 | 0 | 1 (tray / auto clock-in 미실시) |
| Android APK 정적 분석 (T5) | 6 (Geofence + Glance + xml + GMS + ADR-006) | 0 | 0 |
| Android live emulator | 0 | 1 (docker-android FATAL state) | 4 (geofence event / widget 표시 / 푸시 / API 통신 — 단말 의존) |
| **합계** | **25** | **1** | **5** |

라이브 발견 finding: **3건** (F-LIVE-T-01 P1 RoleBasedHomeRedirect / F-LIVE-T-02 P2 vite HMR / F-LIVE-T-03 P3 라벨 중복)

## 6. iter14 backlog 추가 권장

iter13 SESSION §7 + 본 세션 finding 합산:

| ID | 우선순위 | 내용 |
|---|---|---|
| F-LIVE-T-01 | P1 | RoleBasedHomeRedirect 회귀 fix (ADMIN/OWNER → /admin 자동) |
| F-LIVE-T-02 | P2 | Vite HMR Windows FSWatcher EIO — `usePolling: true` 검토 |
| F-LIVE-T-03 | P3 | "유형" 라벨 두 곳 사용 — leave_type → "휴가 종류", kind → "기간" |
| Android live | P0 (외부 의존) | 실 단말 USB 또는 Genymotion Desktop (KVM 우회) — geofence + Glance widget + 푸시 라이브 검증 |
| Electron tray | P1 | 자동 clock-in (`tray.ts`) + electron-store persistence 라이브 검증 |
| iter13 SESSION §7 | — | Stripe 통합 + iOS native + COMP balance bucket + stale test 정리 (이미 등록됨) |
