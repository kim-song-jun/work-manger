# ADR-001 · React SPA 단일 코드베이스 + 셸 어댑터 (Shell Adapter)

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @tech-lead, @frontend-lead

## Context

근무 관리 시스템은 세 가지 표면(surface)을 동시에 지원해야 한다.

1. **웹 (Web)** — 브라우저에서 바로 접속하는 데스크톱/모바일 웹 (관리자 페이지 포함)
2. **모바일 (Mobile)** — iOS / Android 네이티브 셸로 배포되는 앱 스토어 빌드. 위치 기반 출퇴근(GPS Geofencing), 푸시 알림(FCM/APNs), 홈 화면 위젯이 필요
3. **데스크톱 (Desktop)** — Windows / macOS / Linux 트레이 앱. 자동 출퇴근 트리거, OS 알림, 메뉴바 상시 표시

세 표면 모두 **동일한 비즈니스 화면**(출퇴근, 연차, 팀 보드, 결재함, 관리자)을 노출한다. 차이는 "어떤 시스템 권한이 필요한가" + "OS 통합 깊이가 어디까지인가" 뿐이다.

추가 제약:

- 팀 규모: FE 풀타임 1.5명 (MVP). 세 코드베이스(웹/RN/Electron) 병렬 유지 불가능.
- 출시 속도: 화면 변경(예: 출근 슬라이더 인터랙션 수정)은 가능하면 **앱 스토어 심사 없이** 즉시 반영하고 싶다.
- 디자인 시스템: Toss 스타일의 정밀한 토큰 시스템(`apps/web/src/shared/styles/tokens.css`, 약 110줄)을 갖췄다. 웹 표준(CSS 변수, Tailwind)과 맞물려 있다.

## Decision

**단일 React SPA(Single-Page Application) 하나를 만들고, 세 가지 셸(Web 브라우저 / Flutter WebView / Electron BrowserWindow)에서 같은 번들을 호스팅한다.** 각 셸은 시스템 권한이 필요한 기능만 어댑터(adapter) API 로 노출하고, 렌더러(Renderer)는 capability 검출 후 호출한다.

구체적으로:

- 비즈니스 UI · 라우팅 · 상태 관리 · API 호출 · 디자인 시스템은 100% `apps/web/src/` 안에 있다.
- 셸별 추가 기능은 SPA 가 `window.NativeBridge` (모바일) 또는 `window.ElectronBridge` (데스크톱)를 capability-detect 하고, 어댑터 모듈을 통해 호출한다.
  - `apps/web/src/shared/lib/native.ts` — Flutter WebView 어댑터(typed wrapper). `requestLocation` / `registerDeviceToken` / `haptic` / `appInfo`. 브리지 부재 시 `BRIDGE_UNAVAILABLE` 또는 안전한 기본값을 반환한다.
  - `apps/web/src/shared/lib/desktop.ts` — Electron 어댑터. `getAppVersion` / `setStatus` / `notify` / `scheduleAutoClockIn` / `cancelAutoClockIn` / `openExternal`. 브리지 없으면 모든 메서드가 no-op 또는 in-app Toast 로 graceful degradation.
- 셸 측은 브리지 표면만 책임진다.
  - 모바일: `apps/mobile/lib/bridge/inject.dart` — 매 `onLoadStop` 마다 JS shim 재주입. SPA soft-navigation 후에도 브리지가 유지됨. `apps/mobile/lib/bridge/native_bridge.dart` 가 `flutter_inappwebview` JavaScriptHandler 등록.
  - 데스크톱: `apps/desktop/src/preload/bridge.ts` — `contextBridge.exposeInMainWorld("ElectronBridge", ...)`. contextIsolation ON, 채널은 `apps/desktop/src/shared/ipc-contracts.ts` 의 `IPC_INVOKE` / `IPC_EVENT` enum 으로 한정.

## Alternatives Considered

### 1) React Native (RN) — 모바일을 풀 네이티브로

- **장점**: 네이티브 위젯(Native Widget) 깊이 있는 통합. iOS Live Activity / Android App Widget 빌딩이 직관적.
- **단점**:
  - 웹/데스크톱 코드가 별개여야 한다 → 코드 중복 2~3배. FE 풀타임 1.5명으로는 유지 불가.
  - "디자인 변경 → 앱 스토어 심사" 사이클을 피할 수 없음. CodePush 같은 OTA(Over-the-Air) 우회는 정책상 불안정.
  - Toss 스타일 디자인 토큰을 RN 의 StyleSheet 으로 옮기는 비용이 크다(웹의 CSS 변수 / Tailwind 가 그대로 안 됨).
- **결론**: 비즈니스 화면을 RN 으로 다시 짤 만큼의 OS 통합 우위가 없다.

### 2) Tauri (Rust) — 데스크톱을 Electron 대신 Tauri 로

- **장점**: 번들 크기 ↓, 메모리 ↓.
- **단점**:
  - 팀에 Rust 경험 없음. OS 알림 / 트레이 / 자동 업데이트 같은 우리가 실제 쓰는 API 의 Tauri 플러그인 생태계가 Electron 대비 얇다.
  - Electron 을 이미 알고 있고, `electron-builder` 의 macOS notarization / Windows code signing 파이프라인이 검증돼 있다.
  - 번들 크기 차이는 **1년에 한 번 받는 데스크톱 앱**에서 결정적이지 않다(자동 업데이트 차분 패치만 내려옴).
- **결론**: 데스크톱 트레이 앱은 Electron 으로 충분.

### 3) Flutter Full UI — 모바일을 WebView 없이 풀 Flutter 로

- **장점**: 60fps 보장, 네이티브 위젯 자유.
- **단점**: (1) RN 단점과 동일한 코드 중복. (2) 현재 `apps/mobile/` 은 약 200줄(브리지 + 진입점 + FCM init)밖에 안 됨. 풀 UI 로 가면 수만 줄.
- **결론**: WebView 컨테이너 + 네이티브 권한 위임이 현재 단계에 맞다.

### 4) Capacitor — Cordova 후속

- **장점**: 한 코드베이스로 웹/iOS/Android.
- **단점**: 데스크톱 표면이 약하고, 우리가 쓰려는 위젯/Geofencing 플러그인이 1~2 maintainer 의존. Flutter + WKWebView/WebView2 조합이 더 안정적.

## Consequences

### 긍정적

- **번들이 한 벌**: 비즈니스 변경(출퇴근 슬라이더 인터랙션, 결재 화면 추가)은 **웹 배포만 하면 모든 셸에 즉시 반영**된다. 앱 스토어 심사 사이클 우회.
- **셸별 코드는 작다**: `apps/mobile/` ~ 200줄, `apps/desktop/` 의 main 프로세스 ~ 1500줄. 어떤 셸도 비즈니스 로직을 알 필요 없음.
- **graceful degradation 이 자연스럽다**: 브라우저에서 똑같은 SPA 를 띄우면 "모바일 푸시는 안 되지만 화면은 다 동작" 하는 상태가 공짜로 나온다. QA 가 브라우저에서 90% 시나리오 검증 가능.
- **디자인 토큰이 단일 소스**: 웹 / 모바일 / 데스크톱 모두 같은 `tokens.css` 를 본다(ADR-005 참조).
- **타입 안전**: 어댑터(`native.ts`, `desktop.ts`)가 capability-detect 와 타입 변환을 한 곳에 격리. feature 코드는 환경 분기 없이 호출.

### 부정적

- **세 가지 릴리스 케이던스(release cadence)**가 공존한다.
  - 웹: 화·목 정기 + 핫픽스 (분 단위)
  - 모바일: 앱 스토어 심사(평균 1~3일) + WebView URL 은 환경별 빌드 인자
  - 데스크톱: electron-updater 로 사용자가 받을 때까지 며칠
  - **결과**: 셸 브리지 계약(`NativeBridge` / `ElectronBridge`)이 깨지는 변경은 backward-compatible 해야 한다. 새 메서드는 추가만, 기존 메서드 시그니처 변경 금지.
- **WebView 성능 한계**: 60fps 가 필요한 화면(예: 차트 인터랙션, 고급 애니메이션)은 한계가 있다. v1 MVP 범위에서는 문제 없음. 만약 필요해지면 해당 화면만 풀 Flutter 로 대체 검토.
- **iOS WebView 정책 리스크**: Apple 이 "단순 웹뷰 래퍼" 앱을 거절할 가능성. 완화책: 네이티브 권한 사용(GPS, 푸시, 위젯), 오프라인 큐, 햅틱 — 모두 우리가 이미 사용 중.
- **디버깅 분기**: "버그가 SPA 에 있나, Flutter 브리지에 있나, Electron preload 에 있나"를 가르는 비용. 완화책: 어댑터 레이어에 ENV 태그된 구조화 로그.
- **자동 출퇴근 같은 "백그라운드 동작"의 분산**: 모바일은 Geofencing(OS), 데스크톱은 메인 프로세스 타이머(`apps/desktop/src/main/auto-clock-in.ts`), 웹은 불가능. 사용자가 디바이스를 바꿀 때 동작 차이를 명확히 안내해야 한다.

### 후속

- 셸 브리지 계약은 별도 문서화 필요(현재 `architecture.md` §5.2 / §6.2 에만 있음). 추후 `docs/architecture/shell-bridges.md` 로 분리해서 IPC 계약 / 버전 / 호환성 매트릭스를 한 곳에 모은다.
- 새 권한이 필요해지면(예: 카메라) 어댑터에 메서드 추가 → 셸별 구현(Flutter `addJavaScriptHandler` + Electron `ipcMain.handle`) → 양 스토어 빌드 푸시 + 데스크톱 자동 업데이트 순서로 진행. SPA 측은 capability-detect (`hasNativeBridge()`) 후 호출.
- v2 에서 SSO / 다중 법인을 도입할 때 SPA 라우팅 변경만으로 가능하도록 라우팅 레이어를 회사-aware 하게 유지(현재 멤버십 컨텍스트 기준). 셸 코드는 회사 식별을 모르도록 — URL/토큰만 받음.
- 셸 어댑터의 단위 테스트는 SPA 코드베이스 안에서 mock `window.NativeBridge` / `window.ElectronBridge` 를 주입해 진행. 셸 측 통합 테스트는 각 `apps/mobile/test/`, `apps/desktop/src/main/__tests__/` 에서 별도.
- 새 셸이 추가될 가능성(예: VS Code extension, browser extension) 도 어댑터 패턴으로 흡수 가능. 어댑터 레이어가 capability 매트릭스의 핵심.
