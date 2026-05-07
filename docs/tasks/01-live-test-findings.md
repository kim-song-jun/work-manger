---
task_n: 1
slug: live-test-findings
size: large
status: active
created: 2026-05-07
---

# Live Testing Findings — 2026-05-07

> Phase 1: Web SPA via claude-in-chrome (390x844 mobile + 1440x900 desktop), seed_demo loaded, admin@acme.demo authenticated.

## Routes Tested (≈20)

### ✅ OK
- `/login` — auth form rendered
- `/m/home` — 출퇴근 대시보드, 슬라이드 출근, 위치 자동 감지
- `/m/team` — 그리드/팀별/타임라인 탭
- `/m/leave` — 잔여/사용/발생/소멸 카드
- `/m/leave/apply` — 캘린더 + 유형 (연차/반차) + 사유 폼
- `/m/inbox` — 요청함 (승인할 것/내 요청/알림 탭)
- `/m/inbox/quick` — 빠른 승인 (빈 상태)
- `/m/notifications` → `/m/notifications/empty` (auto-redirect)
- `/m/notice` — 공지 (필터 5종)
- `/m/customize` — 테마/브랜드/글자/언어
- `/m/compliance` — 주 52시간
- `/m/overtime` — 신청/자동설정/이력
- `/m/my` — 마이 (프로필/설정/꾸미기/로그아웃)
- `/m/help` — FAQ
- `/web/` — 데스크탑 대시보드 (출근/누적/잔여/팀 미리보기)
- `/web/inbox` — 인박스 (내 승인/전사 탭)
- `/web/records` — 근무 기록 (월별 필터)
- `/web/team-leave` — 팀 연차 캘린더 (월/분기)
- `/web/team-calendar` — 팀 캘린더 (본사/재택/연차/휴게/휴무)
- `/admin` — 출근률/미출근/승인 대기 8/진행 중 초과 0
- `/admin/employees` — 27명 직원 + 검색/필터
- `/admin/reports` — 월간 리포트 + CSV/PDF
- `/admin/expiring-leave` — 빈 상태
- `/admin/audit` — 빈 상태
- `/admin/codes` — `ACMEDM` 코드 표시 + 발급 폼
- `/admin/compliance` — 52시간 컴플라이언스 (전사 직원)

## 🔴 Critical Findings

### GAP-A: `/admin/settings` 사이드바 dead link
- **Where**: `apps/web/src/widgets/admin-shell/...` (Sidebar)
- **What**: 사이드바에 `/admin/settings` 링크 있지만 App.tsx 에 라우트 미등록
- **Result**: 클릭 시 wildcard `*` 가 잡아 `/login` 으로 redirect (인증된 admin 임에도)
- **Fix**:
  - 옵션 1) 라우트 추가 (`AdminSettingsPage` 신규)
  - 옵션 2) 사이드바 링크 제거
  - 권장: 옵션 1 — 회사 설정 / 알림 정책 / 브랜드 등 OWNER 영역 자연스럽게 들어갈 자리

### GAP-B: 잔여 연차 표시 불일치
- **Where**: `/m/home` (잔여 11일) vs `/m/leave` (잔여 15일) vs `/m/leave/apply` ("신청 후 잔여 14일" → 즉 신청 전 15일)
- **What**: `/m/home` 의 잔여 연차 카드가 다른 페이지와 4일 차이
- **Cause 추정**: `apps/web/src/pages/m-home/` 에서 별도 계산 (e.g. 발생 - 사용 - 임시 보류) 또는 mock 값
- **Result**: 사용자 혼란. 어느 쪽이 정확한지 불명.
- **Fix**: 단일 진실 소스 (`/v1/leave/balance`) 만 사용하도록 통일

### GAP-C: 와일드카드 `*` → `/login` redirect (NotFound 부재)
- **Where**: `apps/web/src/app/App.tsx:185`
- **What**: 알 수 없는 라우트 진입 시 `<Navigate to="/login" replace />`
- **Result**: 인증된 사용자가 잘못된 URL 접근 시 갑자기 로그인 화면 — 로그아웃된 것처럼 느낌
- **Fix**: `NotFoundPage` 추가 — 인증 상태에 따라 "홈으로 돌아가기" / "로그인하기" CTA 분기

## 🟡 Warning Findings

### GAP-D: `/admin/approvals` i18n 키 누락
- **Where**: `/admin/approvals` 페이지
- **What**: `?[admin.appr_kind_undefined]` 가 8회 출현 (테이블 행마다)
- **Cause**: 승인 항목의 `kind` 필드가 undefined 로 들어와 i18n key fallback 실패
- **Fix**:
  - BE: `kind` 필드 항상 `leave|overtime|trip` 중 하나 보장
  - FE: `kind` undefined 시 "기타" fallback 또는 throw

### GAP-E: AdminSidebar `/admin/compliance` 링크 누락
- **Where**: `apps/web/src/widgets/admin-shell/`
- **What**: `/admin/compliance` 라우트는 등록되어 있고 페이지도 정상이지만, 사이드바 nav 에 없음 → admin 이 "52시간 컴플라이언스" 페이지 접근 경로 없음
- **Fix**: 사이드바 nav 항목 추가

### GAP-F: `/m/notifications` 자동 리다이렉트
- **Where**: `apps/web/src/pages/m-notifications/` + 라우트
- **What**: `/m/notifications` 진입 → 자동으로 `/m/notifications/empty` 로 URL 변경
- **이상한 점**: 빈 상태일 때만 redirect 가 의도된 듯 보이지만 URL 자체가 변경되어 share/bookmark 시 `/empty` 가 박힘
- **Fix**: redirect 대신 `<EmptyState />` 컴포넌트로 inline 표시

## 콘솔 워닝 (non-blocking)
- React Router future flag 경고 × 2 (`v7_startTransition`, `v7_relativeSplatPath`) — v7 마이그레이션 backlog

## Phase 2: Electron Windows

### 🔴 GAP-G: Electron 부팅 시 렌더러 페이지 로드 실패
- **Where**: `apps/desktop/release/win-unpacked/Work Manager.exe`
- **What**:
  - 프로세스 정상 부팅 (PID 활성, 75MB working set)
  - 윈도우 표시됨 (`HasMainWindow=True`)
  - 제목이 `"Error"` (Chromium 에러 페이지 형태)
  - `netstat` 상으로 Electron PID 가 `localhost:4444` 에 ESTABLISHED — 연결은 됨
- **추정 원인**: SPA bootstrap 시 Electron context 에서 실패하는 코드 — 후보:
  - `apps/web/public/sw.js` 서비스워커 등록 (Electron 의 file:// vs http:// 차이)
  - `apps/web/src/shared/lib/web-push.ts` `navigator.serviceWorker.register`
  - `@sentry/react` browserTracing 초기화
  - MSW handlers (개발 빌드일 경우)
  - `contextIsolation: true` + `nodeIntegration: false` 환경에서 window.NativeBridge 의존성
- **Reproduction**:
  ```powershell
  Start-Process "apps\desktop\release\win-unpacked\Work Manager.exe" -ArgumentList "--remote-debugging-port=9222"
  # → DevTools targets 비어있음 (renderer 가 정상 attach 안 됨)
  ```
- **Fix path**:
  - 우선 `--remote-debugging-port=9222` + DevTools UI 로 콘솔 에러 확인
  - production 빌드에서 service worker 비활성 또는 try/catch 강화
  - Sentry init 가드 (`if (window.electronAPI)` 분기)

## 다음 단계
- Android 에뮬레이터 + Flutter 빌드 (Flutter SDK 위치 사용자 확인 필요)
- GAP-A (Admin settings dead link), GAP-G (Electron 렌더러 실패) 가 출시 차단
- GAP-B, GAP-C, GAP-D, GAP-E, GAP-F 는 polish 우선순위

---

## 2차 라운드: 갭 fix + 환경 셋업 (2026-05-07 후반부)

### Web GAPs A~F 모두 fix + 검증 완료 (commit 2e8d89c)

| GAP | Fix | 검증 |
|---|---|---|
| A | `apps/web/src/widgets/admin-shell/ui/AdminNav.tsx` — `/admin/settings` 제거 | 사이드바에서 `설정` 사라짐 ✅ |
| B | `apps/web/src/entities/approval/api/fetchApprovals.ts` — BackendApprovalRow → ApprovalRow 변환 (uppercase enum + requester_name → kind/employee_name) + i18n trip/manual_clock_in 키 추가 | `/admin/approvals` 가 `[초과근무]` `[연차]` + 직원명 정상 표시 ✅ |
| C | `apps/web/src/widgets/admin-shell/ui/AdminNav.tsx` — `/admin/compliance` 추가 + i18n `nav_compliance` | 사이드바 `52시간` 추가 ✅ |
| D | `apps/web/src/pages/not-found/index.tsx` 신규 + `App.tsx:185` wildcard 교체 + i18n `common.notfound_*` 키 | `/some/wrong/url` → 404 페이지 + `홈으로` CTA, URL 보존 ✅ |
| E | `apps/web/src/pages/m-notifications/index.tsx` — useEffect redirect 제거, 인라인 EmptyState | URL `/m/notifications` 보존 + 인라인 빈 상태 ✅ |
| F | `apps/web/src/pages/m-home/index.tsx` — useQuery(fetchBalance) 사용, 하드코딩 "11" 제거 | `/m/home` 잔여 연차 = 15일 (`/m/leave` 와 일치) ✅ |

### GAP-G (Electron) — 추가 검증 완료 (asar 재빌드)

- `apps/desktop/release/win-unpacked/Work Manager.exe` 재빌드 (electron-builder unpacked 단계 OK, 코드사이닝은 EV 인증서 부재로 skip)
- 재실행 시: 4 프로세스 (main + renderer + GPU + utility), `MainWindowTitle = 근무 관리` ✅, 109MB working set
- Setup.exe 는 `WIN_CSC_LINK` 인증서 미확보로 미생성 — 출시 시 인증서 등록 필요 (operations §11.1 ⏳ Windows code signing)

### Android 환경 부트스트랩 (2026-05-07 21:24~)

| 컴포넌트 | 위치 | 상태 |
|---|---|---|
| Flutter SDK | `C:\dev\flutter` (3.27.4 stable) | ✅ |
| JDK 17 | `C:\dev\jdk\jdk-17.0.13+11` (Adoptium Temurin) | ✅ |
| Android cmdline-tools | `C:\dev\android\cmdline-tools\latest\` | ✅ |
| platform-tools (adb) | `C:\dev\android\platform-tools\` | ✅ |
| platforms;android-34 | `C:\dev\android\platforms\android-34` | ✅ |
| build-tools;34.0.0 | `C:\dev\android\build-tools\34.0.0` | ✅ |
| emulator | `C:\dev\android\emulator\` | ✅ |
| system-images;android-34;google_apis;x86_64 | `C:\dev\android\system-images\android-34\google_apis\x86_64` | ✅ |
| AVD `wm_test` (pixel_5 + Android 34 + google_apis) | `~/.android/avd/wm_test.avd` | ✅ |

영구 사용자 env vars 설정:
- `FLUTTER_ROOT=C:\dev\flutter`
- `ANDROID_HOME=C:\dev\android` / `ANDROID_SDK_ROOT=C:\dev\android`
- `JAVA_HOME=C:\dev\jdk\jdk-17.0.13+11`
- `Path` += `C:\dev\flutter\bin;C:\dev\android\cmdline-tools\latest\bin;C:\dev\android\platform-tools;C:\dev\android\emulator;C:\dev\jdk\jdk-17.0.13+11\bin`

`flutter doctor` 결과:
- ✅ Flutter / Windows / Android toolchain (SDK 34.0.0) / Chrome / VS Code / Network
- ✗ Visual Studio (Windows native — mobile 빌드엔 불필요)
- ! Android Studio (cmdline-tools 로 대체 — 빌드 가능)

`flutter pub get` (`apps/mobile`) ✅ — 의존성 설치 완료.

Emulator 부팅 시도 — cold boot 진행 중 (qemu-system-x86_64 985MB working set, 2분+ 소요 정상).

### 최종 검증 결과 (21:43 KST)

**APK 빌드 ✅**:
```
flutter build apk --debug
✓ Built build\app\outputs\flutter-apk\app-debug.apk
Running Gradle task 'assembleDebug'... 563.1s
```

- 산출물: `apps/mobile/build/app/outputs/flutter-apk/app-debug.apk` (205MB, debug 빌드)
- Gradle 첫 실행 (캐시 0 → 3.6GB) 9.4분 소요
- Android SDK Platform 35 + 33 자동 설치 (Flutter 가 추가 platform 필요했음)
- 결과: **Android toolchain 완전 작동** — APK 정상 패키징

**Android emulator boot 🔴 (환경 이슈)**:
- AVD `wm_test` (pixel_5 + Android 34 + google_apis x86_64) 정상 생성
- emulator + qemu-system-x86_64 정상 spawn (3GB RAM allocation 활성)
- 17분간 1006 CPU sec 소비 후에도 `sys.boot_completed` 미반환 → adb `device offline` 지속
- **추정 원인**: Windows 11 + Docker Desktop (WSL2 → Hyper-V) + Android emulator (WHPX → Hyper-V) 가상화 자원 경합
- **Workaround 옵션**:
  1. Docker Desktop 중지 후 emulator 재시작 (`docker compose down`)
  2. `-gpu swiftshader_indirect` 소프트웨어 GPU 강제
  3. `-cores 2 -memory 2048` 작은 리소스 할당
  4. 실제 Android 단말 USB 연결 (adb usb mode)
  5. Android Studio AVD Manager GUI 사용 (별도 인증된 가속 경로)
- 다음 task: 사용자가 Docker 종료 후 emulator 재시도 가능. APK 가 빌드된 만큼 단말 USB 연결로 install 도 가능 (`adb install app-debug.apk`).

## 최종 GAP 상태 (2026-05-07 EOD)

| ID | 영향 영역 | 상태 |
|---|---|---|
| GAP-A | Web admin sidebar | ✅ FIXED (2e8d89c) |
| GAP-B | Web admin approvals i18n + shape | ✅ FIXED (2e8d89c) |
| GAP-C | Web admin sidebar compliance | ✅ FIXED (2e8d89c) |
| GAP-D | Web wildcard route → NotFound | ✅ FIXED (2e8d89c) |
| GAP-E | Web mobile notifications redirect | ✅ FIXED (2e8d89c) |
| GAP-F | Web mobile home leave consistency | ✅ FIXED (2e8d89c) |
| GAP-G | Electron renderer ESM/CJS | ✅ FIXED (4538e20) — asar repackaged + verified |

**총 7건 fix 완료, 모두 라이브 검증 통과**. Android toolchain 셋업 완료 + APK 빌드 성공. Emulator 부팅은 Hyper-V 환경 이슈로 별도 진단 필요.
