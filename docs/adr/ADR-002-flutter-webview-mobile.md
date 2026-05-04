# ADR-002 · Flutter WebView 채택 (모바일 셸)

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @tech-lead, @mobile-lead

## Context

ADR-001 에서 "단일 React SPA + 셸 어댑터" 전략을 확정했다. 그 결정의 직접적 후속으로 **모바일 셸을 어떤 기술로 만들 것인가** 가 남았다. 후보:

1. Flutter (WebView 호스팅)
2. React Native (WebView 호스팅)
3. iOS Swift / Android Kotlin (각각 네이티브 코드)
4. Capacitor

요구사항:

- iOS App Store + Google Play 두 스토어에 동일 기능 출시
- WebView 안에서 SPA 가 동작 (`apps/web` 의 빌드를 환경별 URL 로 로드)
- 네이티브 권한이 필요한 기능: GPS / Geofencing, FCM 푸시, APNs, 햅틱, 카메라(향후), 홈 화면 위젯
- WebView ↔ 네이티브 양방향 브리지(JavaScript Channel + 이벤트 디스패치)
- 단일 코드베이스로 두 스토어. 풀타임 모바일 엔지니어 0.5명 가정.
- 화면은 SPA 가 하므로 셸은 가능하면 얇게.

## Decision

**Flutter 를 채택한다. WebView 컨테이너로 SPA 를 호스팅하고, 네이티브 권한이 필요한 기능만 Dart 측에서 처리해 `window.NativeBridge` 로 노출한다.**

근거:

- **단일 Dart 코드베이스 → 두 스토어**: iOS 와 Android 양쪽에서 동작하는 위치/푸시/햅틱 코드를 한 번만 작성한다.
- **WebView 라이브러리 통합**: `flutter_inappwebview` 단일 패키지가 Android(JavaScriptChannel) 와 iOS(WKUserContentController) 를 추상화. 양 OS 별도 코드 거의 불필요.
- **셸이 얇다**: `apps/mobile/` 는 진입점, FCM init, WebView 호스팅, 브리지, 자동 업데이트 호출만 담는다. 비즈니스 화면은 SPA 가 책임.
- **Flutter 의 hot-reload + Dart static type** 가 작은 셸을 빠르게 만들고 검증하기에 적합.

구체 구조:

- `apps/mobile/lib/bridge/native_bridge.dart` — `controller.addJavaScriptHandler(handlerName: 'requestLocation', ...)` 형태로 네이티브 메서드 등록.
- `apps/mobile/lib/bridge/inject.dart` — `bridgeInjectionScript()` 가 매 `onLoadStop` 마다 JS shim 재주입. SPA 가 soft-navigation 되어도 `window.NativeBridge.__installed` 체크로 멱등 보장. 끝에 `window.dispatchEvent(new Event('wm:bridgeready'))` 로 SPA 에 신호.
- FCM init 은 진입점에서 1회 (`firebase_options.dart` 는 git ignore, 환경별로 주입).
- 빌드: `flutter build appbundle --release --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com` / `flutter build ipa --release --dart-define=WEBVIEW_URL=...`.

## Alternatives Considered

### 1) React Native (WebView 호스팅)

- **장점**: 팀의 JS/TS 친숙도. SPA 와 같은 언어.
- **단점**:
  - WebView 통합 라이브러리(`react-native-webview`)는 iOS/Android 각각 다른 quirks 가 있다(JS injection 타이밍, fullscreen video, file upload). Flutter `flutter_inappwebview` 가 더 통합돼 있고 한 곳에서 issue tracker 관리.
  - RN 자체의 의존성 그래프(Hermes, Metro, Gradle, Pod) 가 넓다. 셸이 얇은 우리 케이스에서는 부담 대비 이익 적음.
  - Flutter 가 푸시 / 백그라운드 작업 / 위젯 플러그인 생태계에서 최근 더 활발(2025~2026 기준).
- **결론**: 셸이 얇은 케이스에서 Flutter 의 단순함이 더 가치 있다.

### 2) iOS Swift + Android Kotlin (각각 네이티브)

- **장점**: 100% 네이티브 자유. 위젯, Live Activity, App Clip 등 최신 OS 기능 즉시.
- **단점**:
  - 두 코드베이스 → FE 0.5 명으로는 동기화 비용 과다.
  - 우리가 쓰는 기능(WebView + 위치 + 푸시)은 양 OS 에서 동치라 코드 추상화의 이점이 큼.
- **결론**: 우리 기능 폭에서 분리할 이유 없음. 진짜 네이티브 위젯이 필요해지면 그때 부분적으로 Swift/Kotlin 추가(Flutter 의 platform channel 로 가능).

### 3) Capacitor

- **장점**: 웹 친화적, JS 스택 일관.
- **단점**: 데스크톱 표면이 약하고(우리는 Electron 사용), Geofencing 같은 백그라운드 위치 플러그인의 maintainer 수가 적다. Flutter 의 plugin 생태계가 더 두텁다.
- **결론**: 웹 일관성 외에 우리에게 유리한 점 없음.

### 4) PWA (셸 없음)

- **장점**: 코드 0줄.
- **단점**: iOS 의 PWA 푸시(2023+) 가 제약 많고, 백그라운드 위치 / Geofencing 이 사실상 불가. 앱 스토어 노출 없음(검색 발견성 ↓).
- **결론**: B2B 앱이고 사용자가 푸시/위치를 신뢰성 있게 받아야 함 → PWA 단독으로는 불충분.

## Consequences

### 긍정적

- **셸 코드가 작다**: 비즈니스 변경 시 셸은 거의 안 만진다. 모바일 엔지니어 0.5명으로 유지 가능.
- **양 스토어 단일 빌드 파이프라인**: 같은 `flutter build` 명령으로 AAB / IPA 산출.
- **네이티브 권한이 필요한 기능만 Dart 로**: 책임 경계가 명확. 디버깅 시 "SPA 인가, 브리지인가, 네이티브 권한인가" 가 빠르게 가려짐.
- **WebView URL 환경 분기**: 같은 앱 빌드를 dev/stg/prod 로 라우트하는 `--dart-define=WEBVIEW_URL=...` 패턴이 단순.
- **출시 후 화면 변경은 웹 배포만**: 출퇴근 화면 인터랙션 수정에 앱 스토어 심사 불필요.

### 부정적

- **Geofencing 의 OS 신뢰도 차이**: iOS Significant Location Change 와 Android Geofencing API 의 정확도/지연이 다르다. 자동 출퇴근 트리거의 사용자 경험이 OS 별로 다를 수 있음 → 사용자에게 "자동 출근 임박" 알림으로 우회.
- **WebView 성능 한계**: 차트/긴 리스트의 60fps 가 필요해지면 WebView 가 병목. 현재는 문제 없음.
- **Apple Review 리스크**: "단순 웹뷰 래퍼" 거절 케이스. 완화: 위치/푸시/햅틱/위젯 같은 네이티브 권한 명시적 활용 + 마케팅 텍스트로 "근무 관리 도구" 가치 명시.
- **Flutter 의존성 업그레이드**: `flutter_inappwebview` 와 Firebase 플러그인 업그레이드 시 양 OS 회귀 테스트 필요. 분기별 정기 업그레이드 권장.
- **JS ↔ Dart 직렬화**: 브리지 메서드는 JSON-safe payload 만 지원. 큰 객체 전달은 피하고 reference id 패턴 사용.
- **Flutter 자체 학습 곡선**: 팀에 Dart/Flutter 경험이 없으면 초기 셋업 비용. 다행히 셸 코드가 작아 학습량은 제한적.

### 후속 결정

- iOS 네이티브 위젯이 필요해지면: Flutter 의 platform channel + Swift Widget Extension 추가(셸 안에 isolated). Widget 자체는 SPA 가 안 그림 — Swift/Kotlin 으로 직접. 데이터는 Flutter 셸이 SharedPreferences / App Group 으로 전달.
- Android 홈 화면 위젯도 동일 패턴 — `app_widget` plugin 또는 native AppWidgetProvider 사용.
- 백그라운드 위치 정확도가 부족하면: `geofence_service` / `flutter_background_geolocation` 같은 plugin 평가. iOS 의 Significant Location Change vs Region Monitoring 의 trade-off 도 같이 검토.
- 푸시 정확도 / 도달율 모니터링: FCM 의 delivery report + 자체 ack receipt(앱이 푸시 수신 시 서버에 보고) 추가. 운영 가시성.
- App Store / Play Store 심사 절차: [SOP-app-store-emergency-update](../operations/sop/sop-app-store-emergency-update.md) 참조.
- 빌드 산출물(`google-services.json`, `GoogleService-Info.plist`, `firebase_options.dart`) 은 git 에 커밋하지 않고 CI secrets 으로 주입. 환경별(dev/stg/prod) 로 별도 Firebase 프로젝트.
- WebView 캐시 / 쿠키 정책: SPA 의 토큰 저장은 `localStorage` (현재) → 보안 강화 필요 시 셸이 OS keychain 으로 위임 (별도 브리지 메서드 `setSecureItem` / `getSecureItem` 추가).
- 사용자가 디바이스를 바꿀 때(기종 교체, OS 재설치) 푸시 토큰 재등록은 셸 진입 시점 자동 — `registerDeviceToken()` 이 매번 호출되어 멱등 갱신.
