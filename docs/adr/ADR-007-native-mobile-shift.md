# ADR-007 · WebView 셸 → 풀 네이티브 모바일 (Flutter native UI 전환)

- **Status**: Proposed
- **Date**: 2026-05-13
- **Authors**: @sungjun, product feedback (Flex/시프티 격차 분석)
- **Supersedes**: 없음 (ADR-002 의 단계적 진화)

## Context

[ADR-002](ADR-002-flutter-webview-mobile.md) 에서 우리는 **Flutter WebView 호스트 + 단일 React SPA** 를 채택했다. 이유:
- 단일 코드베이스 → 유지보수 비용 1/3
- 기능 deploy 즉시 모바일 반영
- POC 단계의 빠른 검증

iter12~14 라이브 테스트 (2026-05-08~10) 와 본 세션 (2026-05-13) Chrome MCP sweep + 경쟁사 분석 ([docs/specs/competitor-analysis-2026-05.md](../specs/competitor-analysis-2026-05.md)) 결과 다음 한계가 드러났다:

1. **Perceived performance 격차** — WebView 의 스크롤 / 키보드 반응 / 페이지 전환 애니메이션이 네이티브 대비 명백히 느림. 매니저 페르소나 라이브 테스트에서 "iOS Safari WebView 가 Flex 앱보다 무겁게 느껴진다" 피드백.
2. **OS-native 컨트롤** — slide-to-clock-in gesture, haptic feedback, segmented control 등 OS native widget 대비 WebView 의 web component 는 디테일에서 차이.
3. **백그라운드 작업 신뢰성** — geofence + ntfy WS + Workmanager 가 WebView 컨텍스트 외부에서 동작해야 함 (이미 native Kotlin/Swift 로 구현). WebView ↔ native 다중 컨텍스트 경계가 디버깅 / 모니터링 복잡도 증가.
4. **앱 스토어 리뷰 기준** — Apple Review §4.2 "Minimum Functionality" — WebView wrapper 만으로 구성된 앱은 거절 위험. Flex/Shiftee 모두 풀 네이티브.
5. **경쟁 격차** — Flex/Shiftee 풀 네이티브. 한국 SaaS 시장에서 native 앱 부재는 도입 결정 negative.
6. **위젯 + Push** — iOS WidgetKit / Android Glance 는 이미 native. WebView 가 갖는 가치는 React SPA 의 페이지 로딩 영역 한정.

## Decision

**Flutter Native UI 로 모바일 셸 재작성** (React Native 가 아닌 Flutter).

핵심 원칙:
- React SPA 는 **Web + Desktop(Electron)** 만 호스팅 — Flutter WebView 호스트 제거.
- Flutter 모바일은 **풀 네이티브 위젯** 으로 페이지 재구현. 단, BE (Django REST + WS + Channels) 는 동일 — `/v1/*` API 그대로 소비.
- 디자인 시스템 (CSS tokens) 은 [Material 3 + Flutter ColorScheme 어댑터](../design/design-system.md) 로 다리.
- 기존 native code (geofence / ntfy / WidgetKit / Glance) 는 그대로 — Dart 호출 채널만 정리.

전환 phase:
1. **Phase A (4주)**: 가장 트래픽 큰 5 페이지 — Home / Inbox / LeaveApply / LeaveBalance / Settings — Flutter native 로 구현. WebView 와 공존 (페이지별 native/webview 토글).
2. **Phase B (4주)**: 나머지 직원 페이지 (Team / Notice / Compliance / Trip / Help) Flutter native 화. WebView 셸 onboarding/admin 만 남김.
3. **Phase C (3주)**: 관리자/오너 페이지 — 사용 빈도 낮으므로 마지막. Phase B 종료 후 결정 (full native OR WebView 유지).
4. **Phase D**: WebView 호스트 제거 — Flutter 단일 셸.

## Alternatives Considered

### A. React Native (Expo) 전체 재작성
- **장점**: TypeScript 공유, FE 팀 React 경험 활용
- **단점**:
  - 현재 native code 가 Kotlin (Android Glance/Workmanager) + Swift (WidgetKit/APNs) 로 작성됨 — RN bridge 재작성 필요
  - Expo 의 OTA update / native module 호환성이 워크매니저(15분 cadence)/foreground service 와 충돌
  - 한국 RN dev 인력 풀 < Flutter (취업 시장 시그널, 2026)
  - 패키지 크기 + 시작 속도 → Flutter < RN
- **결론**: 채택 안 함

### B. SwiftUI + Jetpack Compose 각 OS 별 풀 네이티브 분리
- **장점**: OS 별 최고 품질, 최신 API 즉시 활용
- **단점**:
  - 인력 2배 (iOS dev + Android dev 분리)
  - 코드 공유 0 → 기능 출시 속도 1/2
  - 우리 회사 규모 (~3 mobile devs) 에 비대
- **결론**: 채택 안 함

### C. WebView 셸 유지 + 페이지별 perceived perf 튜닝
- **장점**: 코드 변경 최소
- **단점**:
  - Apple Review 리스크 미해소
  - 경쟁 격차 (Flex/Shiftee) 미해소
  - WebView 자체 한계 (스크롤/키보드) 는 튜닝으로 해결 불가
- **결론**: 단기 hotfix 수준에서 검토하나 v1.x 후 전환 권장

### D. Tauri 기반 cross-platform native (Rust 호스트)
- **장점**: 가벼움
- **단점**: 모바일 지원 미성숙 (Tauri 2.0 모바일은 alpha 단계, 2026-05 기준)
- **결론**: 채택 안 함

## Consequences

### 긍정
- **Perceived performance 동급** Flex/Shiftee 수준 — 한국 SaaS 시장 진입 장벽 해소
- **App Store 통과 안전성** — Apple Review §4.2 위험 해소
- **OS 최신 기능 접근** — Live Activities (iOS 16+), Glance (Android 12+), 진동 패턴, 동적 위젯 등
- **현재 native 코드 보존** — geofence/ntfy/widget 재사용 (Kotlin/Swift 코드 그대로)
- **모니터링 단일화** — WebView ↔ native 경계 사라짐, Sentry mobile SDK 통합 용이

### 부정
- **유지보수 비용 증가** — React SPA + Flutter 코드 양쪽 유지. 같은 폼 변경 시 2곳 수정.
- **출시 일정 11주 추가** (Phase A~D)
- **재작성 회귀 위험** — 14 iter 동안 안정화된 SPA 흐름 (i18n parity, MSW, FSD) 을 Flutter 에 다시 구축
- **디자인 토큰 동기화** — CSS variables 와 Flutter ThemeData 동시 유지 필요 (자동 codegen 가능)
- **i18n 재구축** — i18next ↔ Flutter ARB / .json 양쪽 관리

### 위험 완화
- **점진적 전환 (Phase A/B/C/D)** — 한 번에 다 안 함. 페이지 단위 토글로 회귀 격리.
- **자동화 토큰 codegen** — CSS variables → Dart ThemeData 변환 스크립트 작성 (1주 work).
- **OpenAPI types → Dart 모델 codegen** — `openapi-generator-cli` 로 BE 스키마 단일 SSOT 유지.
- **데스크탑/웹은 React SPA 유지** — Electron + Web 은 변경 없음. 80% 유저 인터페이스 보호.

## 실행 계획

### 의존성
- `B-OPS-02` macOS Apple Notarization (iOS 빌드 차단 해소)
- `B-OPS-03` App Store / Play Store 등록
- `B-CODE-02` iOS 네이티브 (이미 backlog — geofence + WidgetKit, 본 ADR 의 사전 단계)

### 일정 (목표)
| Phase | 기간 | 종료 기준 |
|---|---|---|
| 사전 | 2주 (2026-08) | 토큰 codegen + OpenAPI Dart codegen + Phase A 페이지 사양 확정 |
| Phase A | 4주 (2026-09) | Home / Inbox / LeaveApply / LeaveBalance / Settings 5 페이지 native, TestFlight 베타 |
| Phase B | 4주 (2026-10) | 직원 모드 100% native, Play Internal Testing |
| Phase C | 3주 (2026-11) | Admin/Owner — 풀 native vs WebView 유지 결정 |
| Phase D | 2주 (2026-12) | WebView 셸 제거, Flutter 단일 |

### 새 backlog 항목 (`docs/tasks/backlog.md` 후속 등록)
- **B-NAT-01** Material 3 + Flutter ColorScheme 어댑터 (CSS tokens → Flutter codegen)
- **B-NAT-02** OpenAPI Dart codegen (BE 스키마 단일 SSOT)
- **B-NAT-03** Phase A: Home + Inbox native 구현
- **B-NAT-04** Phase A: LeaveApply + LeaveBalance + Settings native 구현
- **B-NAT-05** Phase B: 잔여 직원 페이지 native (Team / Notice / Compliance / Trip / Help)
- **B-NAT-06** Phase C: 관리자 결정 + 구현 (잠정 admin 4-5 페이지만 native)
- **B-NAT-07** Phase D: WebView 호스트 제거 + e2e Playwright 셸 mobile-scope 정리

### 위험 검토 체크포인트
- **Phase A 종료 시점**: TestFlight 베타 5인 이상 + 핵심 KPI 측정 (앱 시작 ≤ 2s, 클락인 latency ≤ 200ms)
- **Phase B 종료 시점**: WebView 잔여 페이지 회귀 0 + 디자인 일관성 검토
- **Phase C 결정 분기**: 관리자 페이지 native 화 ROI 측정 — 사용 빈도 < 10% 이면 WebView 유지 결정 가능

## 변경된 ADR

- [ADR-002](ADR-002-flutter-webview-mobile.md) — Flutter WebView 채택. 본 ADR 이 supersede 는 아님 — Phase A~D 동안 WebView 와 native 가 공존하며 점진 마이그레이션.

## References

- [docs/specs/competitor-analysis-2026-05.md](../specs/competitor-analysis-2026-05.md) — Flex/Shiftee 격차 분석
- Apple Review Guidelines §4.2 — Minimum Functionality
- Flutter Material 3 — https://m3.material.io/
- OpenAPI Generator Dart — https://openapi-generator.tech/docs/generators/dart-dio
