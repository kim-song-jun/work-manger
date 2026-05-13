# Home Native PoC — Flutter 풀 네이티브 전환 1단계 설계

- **Status**: Draft (사용자 승인 2026-05-13)
- **Date**: 2026-05-13
- **Authors**: @sungjun, Claude Opus 4.7
- **Related ADR**: [ADR-007 WebView 셸 → 풀 네이티브 모바일](../../adr/ADR-007-native-mobile-shift.md) (Proposed)
- **Related ADR (재검토 대상)**: [ADR-002 Flutter WebView 채택](../../adr/ADR-002-flutter-webview-mobile.md) (Accepted, ADR-007 supersede 안 함 — 공존)
- **Implementation plan**: TBD (본 spec 승인 후 writing-plans skill 로 생성)

## 1. 목적 (Why)

iter12~14 라이브 테스트와 경쟁사 분석 ([docs/specs/competitor-analysis-2026-05.md](../../specs/competitor-analysis-2026-05.md)) 에서 다음 한계 확인:

1. WebView 의 perceived performance 격차 (스크롤 / 키보드 / 페이지 전환) — Flex/Shiftee 대비 무거움
2. Apple Review §4.2 "Minimum Functionality" — WebView wrapper 거절 위험
3. OS native widget (segmented control / haptic / live activity) 디테일 부재
4. 한국 SaaS 시장 진입 장벽 — 경쟁사 풀 네이티브

ADR-007 은 13주 (2026-08 ~ 2026-12) Flutter native 전환을 제안한다. 본 spec 은 **그 전 PoC 단계** — Home 1 페이지를 Flutter native 로 구현해 다음을 검증한다:

- **기술 가능성**: CSS tokens → Flutter ThemeData codegen, OpenAPI → Dart client codegen, native ↔ WebView 토글 패턴
- **사용성 가치**: perceived perf 개선이 사용자 NPS 에 반영되는가
- **유지보수 비용**: Phase A 12 페이지 학습 곡선이 ADR-007 의 11주 일정에 부합하는가

PoC 결과로 ADR-007 Phase A 확장 Go/No-Go 를 결정한다.

## 2. 의사결정 요약 (Brainstorming 2026-05-13)

| 결정 영역 | 선택 | 대안 (기각) |
|---|---|---|
| 전환 방향 | **ADR-007 그대로 채택** (Flutter native) | RN 재검토 / 더 가볍게 PoC / WebView polish |
| 시작 시점 | **PoC 1 페이지 먼저** (2026-05~07 PoC, GA 후 Phase A) | 지금부터 사전작업 (일정 압축) / ADR-007 일정 준수 / iOS 차단 해소 먼저 |
| PoC 페이지 | **Home (/m/home)** | Inbox / LeaveApply / Settings |
| 성공 기준 | **종합 KPI (perf + UX + maint)** 6~8주 | WebView 동등만 / 기술 PoC만 / ADR-007 KPI 그대로 |
| 실행 방식 | **안 A — 페이지별 토글** (`use_native_home`) | flavor 빌드 분리 / WebView polish |

## 3. 범위 (Scope)

### In scope

- `apps/mobile/lib/main.dart` — settings 기반 라우터 분기 (native Home vs WebView Home)
- `apps/mobile/lib/screens/home/` — Flutter native Home 화면 + 위젯 4종
- `apps/mobile/lib/theme/tokens.g.dart` — CSS tokens 자동 변환 출력 (B-NAT-01)
- `apps/mobile/lib/api/openapi/*.dart` — OpenAPI Dart client 자동 생성 (B-NAT-02)
- `apps/mobile/lib/l10n/app_*.arb` — i18next ko/en → ARB 자동 변환
- `apps/mobile/lib/realtime/ws_client.dart` — Channels WS 구독 (Dart)
- `scripts/codegen/flutter-tokens.cjs` + `scripts/codegen/flutter-api.cjs` — codegen 도구
- `services/api/apps/identity/models.py` — `User.use_native_home: BooleanField(default=False)` 단일 컬럼 추가 (PoC 범위 한정, YAGNI — JSON `settings` 또는 별도 `UserSettings` OneToOne 은 다음 setting 추가 시점에 도입)
- `services/api/apps/identity/views.py` + `urls.py` — 신규 `GET /v1/me/settings` + `PATCH /v1/me/settings` endpoint (현재 `me/settings` endpoint 부재 확인됨)
- `services/api/apps/identity/management/commands/set_user_setting.py` — 운영자가 `--user-id` 또는 `--bulk` 로 토글 일괄 조작 (PoC rollout / rollback 용)
- 베타 5인 라이브 테스트 + KPI 측정 + Go/No-Go 보고서

### Out of scope (Phase A 이후)

- Inbox / LeaveApply / LeaveBalance / Settings 페이지 native (B-NAT-03/04, ADR-007 Phase A)
- 직원 페이지 잔여 (Team / Notice / Compliance / Trip / Help, B-NAT-05)
- Admin / Owner 페이지 (B-NAT-06)
- WebView 셸 제거 (B-NAT-07, Phase D)
- iOS 빌드 (B-OPS-02 Mac signing host 차단 — Android Internal Testing 로 PoC)

## 4. 아키텍처

```
[Flutter 셸 main.dart]
   ├─ 부팅: AuthGate (JWT 확인)
   ├─ GET /v1/me/settings (Dio + auto-gen client)
   │     └─ use_native_home == true?
   │            ├─ true  → Navigator.pushReplacement(WMHomeScreen())
   │            └─ false → Navigator.pushReplacement(WebViewHost(url=APP_URL+'/m/home'))
   └─ 그 외 라우트 (deep link, navigation 이벤트) → WebViewHost (기존 동일)

[WMHomeScreen]
   ├─ AppBar (logo + notification icon — WebView 로 이동)
   ├─ Body
   │     ├─ HomeHero  (status badge + clock-in CTA + progress bar)
   │     ├─ HomeKpiTile × 3 (today / week / overtime)
   │     ├─ HomeTeamCount (출근/재택/휴가/휴식 dot row)
   │     └─ HomeAvatarStack
   ├─ BottomNavigationBar — 다른 탭 클릭 시 WebView (Inbox 등) push
   └─ StreamSubscription (WS clock-in.updated → partial rebuild)

[Bridge — 기존 유지]
   ├─ lib/bridge/native_bridge.dart (geofence, ntfy, haptic, deviceToken)
   ├─ lib/geofence/geofence_service.dart
   └─ lib/notif/ntfy_client.dart
```

핵심: **셸 진입점만 분기**. 다른 라우트는 WebViewHost 로 그대로 fallback. 즉 Home 만 native, 그 외는 SPA — 동일 사용자 동일 빌드.

## 5. 컴포넌트

| 파일 | 역할 | 신규/수정 | 코드 라인 추정 |
|---|---|---|---|
| `apps/mobile/lib/main.dart` | 진입점, settings 분기 | 수정 | +40 |
| `apps/mobile/lib/screens/home/wm_home_screen.dart` | Home Scaffold + state | 신규 | ~200 |
| `apps/mobile/lib/screens/home/widgets/home_hero.dart` | Hero card + progress | 신규 | ~150 |
| `apps/mobile/lib/screens/home/widgets/home_kpi_tile.dart` | KPI tile (reusable) | 신규 | ~100 |
| `apps/mobile/lib/screens/home/widgets/home_team_count.dart` | 팀 status dot row | 신규 | ~80 |
| `apps/mobile/lib/screens/home/widgets/home_avatar_stack.dart` | 아바타 stack | 신규 | ~60 |
| `apps/mobile/lib/screens/home/state/home_controller.dart` | ChangeNotifier (dashboard + WS) | 신규 | ~120 |
| `apps/mobile/lib/theme/tokens.g.dart` | CSS → ThemeData (auto) | 신규 | auto |
| `apps/mobile/lib/theme/wm_theme.dart` | ThemeData factory | 신규 | ~60 |
| `apps/mobile/lib/api/openapi/*.dart` | OpenAPI Dart client (auto) | 신규 | auto |
| `apps/mobile/lib/l10n/app_ko.arb`, `app_en.arb` | i18n (auto from web) | 신규 | auto |
| `apps/mobile/lib/realtime/ws_client.dart` | Channels WS Dart client | 신규 | ~120 |
| `scripts/codegen/flutter-tokens.cjs` | tokens.css → tokens.g.dart | 신규 | ~150 |
| `scripts/codegen/flutter-api.cjs` | openapi-generator-cli 래퍼 | 신규 | ~80 |
| `scripts/codegen/flutter-i18n.cjs` | i18next json → ARB | 신규 | ~60 |
| `services/api/apps/identity/migrations/{auto-numbered}_user_settings_use_native_home.py` | DB 마이그레이션 (Django auto-numbering, `makemigrations` 시점 결정) | 신규 | auto |
| `services/api/apps/identity/management/commands/set_user_setting.py` | 운영 일괄 토글 명령어 | 신규 | ~80 |
| `services/api/apps/identity/serializers.py` | settings serializer 확장 | 수정 | +5 |
| `services/api/apps/identity/views.py` | PATCH /v1/me/settings 확장 | 수정 | +5 |
| `apps/mobile/test/screens/home/wm_home_screen_test.dart` | widget test | 신규 | ~150 |
| `apps/mobile/integration_test/home_native_flow_test.dart` | integration | 신규 | ~100 |
| `apps/mobile/test/screens/home/goldens/` | golden 이미지 (ko/en × light/dark) | 신규 | auto |
| `docs/operations/runbook.md` | PoC rollout / 토글 운영 절차 | 수정 | +20 |

## 6. 데이터 흐름

### 6.1 진입

```
1. 부팅 → SplashScreen
2. JWT 존재 검증 (lib/auth/) → 없으면 LoginRoute (WebView /login)
3. GET /v1/me/settings → JSON { use_native_home: bool, ... }
4. 분기:
   - true  → WMHomeScreen 으로 pushReplacement
   - false → WebViewHost (APP_URL + '/m/home') 으로 pushReplacement
5. WMHomeScreen.initState → HomeController.load()
6. HomeController.load() → GET /v1/me/dashboard → state notify
7. 동시: WsClient.connect(`/ws/clock-in`) → 이벤트 stream → state partial 갱신
```

### 6.2 WS 이벤트

- 서버: `apps/realtime/consumers.py` 의 `ClockInConsumer.group_send` (기존)
- 클라이언트: 동일 페이로드 (`{event: 'clock-in.updated', user_id, status, ...}`) → HomeController.applyEvent
- 갱신 범위: HomeHero (status badge + progress) + HomeKpiTile today 만 partial rebuild

### 6.3 토글 변경

- Settings 화면은 WebView — 사용자가 `/m/settings` 에서 "네이티브 홈 사용" 스위치 변경
- React SPA → `PATCH /v1/me/settings { use_native_home: true|false }` (200 OK 확인)
- 변경 직후 React SPA → `window.NativeBridge.notifySettingsChanged({ use_native_home })` (JS → Dart 방향, 기존 bridge 패턴 확장)
- Dart 측 핸들러 `settingsChanged` 가 `Navigator.pushAndRemoveUntil(... → home)` 재실행 → 새 분기 적용
- 운영 일괄: `manage.py set_user_setting --bulk --key=use_native_home --value=false` 실행 시 다음 셸 진입에서 분기 갱신 (즉시 push 는 아님 — PoC 범위 외)

## 7. 에러 처리

| 시나리오 | 대응 |
|---|---|
| `GET /v1/me/settings` 실패 | WebViewHost fallback (use_native_home=false 가정) + Sentry transaction |
| `GET /v1/me/dashboard` 실패 | 상단 banner ("최신 데이터 불러오기 실패 · 재시도") + Sentry + manual fallback ("WebView 로 보기" CTA) |
| 토큰 만료 (401) | Dio interceptor → silent refresh 시도 → 실패 시 LoginRoute (WebView) |
| WS 끊김 | exponential backoff (1s → 2s → 5s → 30s cap) + 끊김 표시 dot (기존 `notif/ntfy_client.dart` 패턴 참조) |
| Codegen drift (PR 시) | CI fail (`scripts/codegen-check.sh` diff non-zero) |
| native widget 렌더 에러 | Flutter `ErrorWidget.builder` 가 Sentry 보고 + "WebView 로 보기" CTA |
| design tokens 누락 | Build time 에러 (tokens.g.dart 가 모든 키 export — 빠지면 compile fail) |

## 8. 테스트

### 8.1 Widget test (apps/mobile/test/screens/home/wm_home_screen_test.dart)

| Case | 검증 |
|---|---|
| renders hero in OFF state | Hero card status='OFF', clock-in CTA visible |
| renders hero in WORKING state with progress | progress bar > 0, pulse dot animated |
| KPI tile overtime emphasis | overtime ≥ 30분 → caution-soft 배경 |
| team count row in ko | "5명 출근 · 2명 재택" 한국어 출력 |
| team count row in en | "5 in office · 2 WFH" 영어 출력 |
| WS event partial rebuild | mock WS emit → Hero badge 만 갱신, KPI tile 변경 없음 |

### 8.2 Integration test (apps/mobile/integration_test/home_native_flow_test.dart)

| Case | 검증 |
|---|---|
| login → settings.use_native_home=true → home render | SplashScreen → AuthGate → settings 호출 → WMHomeScreen 표시까지 e2e |
| toggle off via bridge → reroute to WebView | NativeBridge.notifySettingsChanged({use_native_home:false}) emit → Navigator 가 WebViewHost 로 전환 |
| WS clock-in.updated event flow | 로그인 → home → mock WS event emit → Hero badge 갱신 확인 |

### 8.3 Golden test (apps/mobile/test/screens/home/goldens/)

- Hero card × 4 (ko/en × OFF/WORKING)
- KPI tile × 4 (ko/en × normal/overtime)
- Team count × 2 (ko/en)
- CI 에서 자동 비교, diff 0

### 8.4 Codegen drift test

- `scripts/codegen-check.sh` — `flutter-tokens.cjs` / `flutter-api.cjs` / `flutter-i18n.cjs` 실행 후 git diff 검사. non-zero → fail
- `.github/workflows/ci.yml` 에 추가

### 8.5 사용자 라이브 (W7~8)

- TestFlight 막힘 (B-OPS-02 미해소) → Play Console Internal Testing 으로 진행 (Android only PoC)
- 베타 5인 모집 (직원 / 매니저 mix)
- 2주 사용 후 NPS 설문 + heuristic eval
- Sentry 이벤트 수집 (perf transaction + 에러)

## 9. KPI / 통과 기준

| 영역 | 측정 도구 | 통과 기준 |
|---|---|---|
| Perf cold | Sentry mobile transaction `home.cold` | p50 ≤ 800ms |
| Perf warm | `home.warm` | p50 ≤ 200ms |
| Scroll fps | Flutter DevTools timeline (5 사용자 × 30 초 sample) | 평균 ≥ 58fps, p99 ≥ 50fps |
| Parity 기능 | 매트릭스 (Hero/KPI/team/i18n/anim) | 100% (WebView 동등) |
| Parity i18n | ko/en arb 파일 누락 키 수 | 0 |
| UX NPS | 베타 5인 설문 | 평균 ≥ WebView 기준선 (사전 WebView NPS 수집 필요) |
| Maint codegen | tokens + openapi + i18n 자동 비율 | ≥ 80% 자동 (manual diff < 20%) |
| Maint 학습 | PoC 실 작업 시간 vs Phase A 11주 환산 | 환산 후 ADR-007 Phase A 일정 ± 20% 이내 |

## 10. 일정 (6~8주)

| Week | 내용 | 산출물 |
|---|---|---|
| W1 (05-13~19) | BE `User.use_native_home` + PATCH + 마이그레이션 + serializer + 테스트. scripts/codegen 3종 골격 | BE PR + codegen 스크립트 PR |
| W2 (05-20~26) | B-NAT-01 tokens.g.dart 생성 + ThemeData 적용 + drift CI gate | tokens.g.dart, wm_theme.dart, CI gate PR |
| W3 (05-27~06-02) | B-NAT-02 OpenAPI Dart client + Dio interceptor (JWT refresh) | api/openapi/*, dio_client.dart PR |
| W4 (06-03~09) | WMHomeScreen 골격 + HomeHero + HomeKpiTile + i18n ARB 생성 | screens/home/* PR (1차) |
| W5 (06-10~16) | HomeTeamCount + HomeAvatarStack + animation + WsClient + Sentry mobile + 토글 라우터 | screens/home/* PR (2차), realtime PR |
| W6 (06-17~23) | widget/integration/golden test + 코드젠 drift CI 통합 + Play Console Internal Testing 빌드 | test PR + .aab 업로드 |
| W7 (06-24~30) | 베타 5인 모집 + 라이브 시작 + Sentry 대시보드 셋업 | 베타 onboarding 문서 |
| W8 (07-01~07) | 라이브 종료 + KPI 측정 + NPS 수집 + 보고서 + Go/No-Go 결정 | PoC 보고서 (이 spec 의 §11 갱신) |

## 11. Phase A 확장 결정 분기

PoC 종료 시점 (2026-07-07) 의 결정:

- **Go** (KPI 8개 모두 통과): ADR-007 status → Accepted 승격. backlog 에 B-NAT-03 (Inbox + LeaveApply native) + B-NAT-04 (LeaveBalance + Settings native) active 등록. 2026-08 부터 Phase A 본격 시작.
- **부분 Go** (Perf / Parity / NPS 통과, Maint 미달): codegen 자동화 비율이 < 80% 면 W9~10 추가로 codegen 보강 + Phase A 일정 + 2주 재산정. ADR-007 status 는 Accepted, 일정만 +2주.
- **No-Go** (Perf 또는 Parity 미달): ADR-007 status Rejected. WebView polish 대안 (CSS view transitions, gesture polish, splash skeleton 등) 으로 사용성 개선 재시도. competitor-analysis 의 다른 격차 항목 (시차 근무 / 정책 시뮬레이터) 우선순위 상향.

## 12. 위험 / 완화

| 위험 | 완화 |
|---|---|
| iOS 빌드 차단 (B-OPS-02 Mac signing host 미확보) | Android Internal Testing 으로 PoC 진행 → iOS 차단 해소 후 별도 검증 |
| 디자인 토큰 양방향 동기 (CSS ↔ Dart) | 단방향 codegen (CSS → Dart). 역방향 변경은 manual sync — CI drift gate 로 차단 |
| WS 클라이언트 Dart 재구현 비용 | 기존 `apps/web/src/shared/realtime/` 의 protocol 만 차용. Channels 서버는 변경 없음 |
| native widget 회귀 → 베타 사용자 영향 | `use_native_home` 즉시 false toggle 가능 (서버측 PATCH). 사용자 수동 / 운영 일괄 둘 다 가능 |
| Maint KPI 측정 주관성 | PoC 실제 작업 시간 (W1~6) 을 timesheet 로 기록 → 12 페이지 환산 산식 사전 합의 |
| ARB i18n 키 drift | `flutter-i18n.cjs` 가 누락 키 출력 시 CI fail. 모든 키는 web i18next 가 SSOT |
| Codegen 출력 churn (PR 시 noise) | codegen 출력 디렉토리 (`lib/theme/tokens.g.dart`, `lib/api/openapi/`, `lib/l10n/app_*.arb`) 는 git 추적하되 PR 라벨 `codegen` 으로 표시 |

## 13. 의존성 / 차단

- **B-NAT-01** tokens codegen — 본 spec 의 W2 산출물 (no external dep)
- **B-NAT-02** OpenAPI Dart codegen — 본 spec 의 W3 산출물 (no external dep)
- **B-OPS-02** Mac signing host — iOS PoC 차단. **본 spec 은 Android only 로 PoC** (회피)
- **B-OPS-03** Play Console 등록 — Internal Testing 트랙 위해 필요. 출시 등록은 아니므로 GA 전 가능
- **OpenAPI spec 안정성** — drf-spectacular 가 정확한 스키마 출력 (현재 검증됨, drift check 있음)

## 14. 운영 / 롤백

- `use_native_home: false` 가 기본값 — 어떤 사용자도 자동 영향 없음
- 베타 5인만 명시적 true (운영 일괄: `manage.py set_user_setting --user-id=... --key=use_native_home --value=true`)
- 회귀 발생 시: 운영자가 `manage.py set_user_setting --bulk --key=use_native_home --value=false` 로 일괄 false
- runbook.md 에 PoC 운영 절차 추가 (R-XXX 신규 시나리오)

## 15. 출시 후 컨텍스트

이 PoC 는 **v1.0 GA 출시 (2026-08-17 목표)** 전에 종료 (W8 종료 2026-07-07). 즉 PoC 가 GA 출시 블로커가 되지 않는다. PoC 결과는 GA 후 ADR-007 Phase A (2026-08~) 의 사양 정밀화에만 영향을 준다.

`use_native_home` 플래그 자체는 GA 빌드에 포함되지만 default false 라 GA 사용자에게 영향 없음. PoC 베타 사용자는 GA 후에도 native Home 유지 (또는 일괄 false 처리하여 GA 시 균질화 — 운영 결정).

## 16. References

- [ADR-002 Flutter WebView 채택](../../adr/ADR-002-flutter-webview-mobile.md) — WebView 호스트 채택의 원래 근거
- [ADR-007 WebView 셸 → 풀 네이티브 모바일](../../adr/ADR-007-native-mobile-shift.md) — 본 PoC 의 상위 결정
- [competitor-analysis-2026-05](../../specs/competitor-analysis-2026-05.md) — Flex/Shiftee 격차
- [backlog B-NAT-01~07](../../tasks/backlog.md) — Phase A~D backlog 자리 (현재 ADR-007 안에만 명시, 미active)
- Apple Review Guidelines §4.2 — Minimum Functionality
- Flutter Material 3 — https://m3.material.io/
- OpenAPI Generator Dart Dio — https://openapi-generator.tech/docs/generators/dart-dio
- Flutter i18n / ARB — https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization

---

## 변경 이력

| Date | Author | 변경 |
|---|---|---|
| 2026-05-13 | @sungjun + Claude | 초안 (brainstorming 결과 정리) |
| 2026-05-13 | @sungjun + Claude | W1 BE 셋업 + Codegen 골격 완료 (Plan-A, commits 3d05c40..c8517d2 — 11 pytest + curl smoke pass) |
| 2026-05-13 | @sungjun + Claude | W2-3 codegen 본 구현 완료 (Plan-B). flutter-tokens 본 구현 + tokens.g.dart + WMTheme + dio_client + jwt_store + i18n ARB. openapi-generator Windows fallback stub. |
| 2026-05-13 | @sungjun + Claude | W4-5 Flutter Home Native 완료 (Plan-C). Sentry/WsClient/HomeController + Hero/KPI/TeamCount/AvatarStack + WMHomeScreen + main.dart 분기 + NativeBridge handler + widget test 2 pass. |
| 2026-05-13 | @sungjun + Claude | W6-8 Tests + Beta Build 완료 (Plan-D). onClockIn/onOpenWebView wire + Sentry transactions + integration test + golden test + flutter build apk debug 검증 + runbook R-PoC-01. iOS/openapi-generator는 Plan-E. |
| 2026-05-14 | @sungjun + Claude | Plan-E openapi-generator Windows fix 완료. npx 대신 Java JAR 직접 호출. dart-dio output 진짜 출력 (73 files). iOS 는 Plan-F 로 이관. |
| 2026-05-14 | @sungjun + Claude | Plan-F/G 완료. Phase A 잔여 4 페이지 (Inbox/LeaveApply/LeaveBalance/Settings) + Phase B 직원 7 페이지 (Team/Notice/Compliance/Trip/Help/Notifications/My) + Phase C 어드민 4 페이지 + Phase D 오너 1 페이지 = 총 16 페이지 native. AppShell 5-tab + role branch. 잔여 19 페이지 (detail/edit form) Plan-H 이관. |
| 2026-05-14 | @sungjun + Claude | Plan-H 완료. 잔여 19 페이지 native (list/detail/form/static/chart). m-loc-picker WebView fallback. AppShell More grid 확장 + caller updates (Inbox→ApprovalDetail, AdminEmployees→AdminEmployeeDetail, LeaveApply→LeaveSuccess). 총 35 페이지 native. |
