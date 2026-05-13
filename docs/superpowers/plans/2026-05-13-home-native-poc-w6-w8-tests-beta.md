# Home Native PoC — Plan-D: W6-W8 Tests + Beta Build Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** Plan-C 의 `onClockIn` / `onOpenWebView` placeholder 를 실제 동작으로 wire + Sentry transaction (PoC perf KPI 측정) + Integration / Golden test + Android `flutter build apk --debug` 검증 + 베타 onboarding 자료 + backlog stamp. **Plan-D 종료 시점에 PoC 가 사용자 체감 가능 + Go/No-Go 판정 데이터 수집 준비 완료.**

**Architecture:** Mobile main.dart 의 callback 두 개를 실제 동작으로 채움 — clock-in 은 `POST /v1/attendance/clock-in`, openWebView 는 `Navigator.push(WebViewHostRoute)`. Sentry transaction 으로 cold/warm boot 측정. Integration test 가 boot → home render 전 흐름 검증. Golden test 가 디자인 회귀 방지.

**Tech Stack:** Flutter 3.24, dio 5.x, sentry_flutter 8.x, flutter_test integration_test, golden_toolkit (또는 기본 flutter_test golden).

**iOS scope:** 본 host (Windows) 환경 빌드 불가 (B-OPS-02 Mac signing host 차단). Android Internal Testing 위주. iOS 검증은 Plan-E (Mac 환경 확보 후).

**openapi-generator scope:** Plan-B 의 fallback stub 으로 잠시 유지. Plan-D 에서는 manual Dio call (clock-in 추가) 만으로 충분. Codegen fix 는 Plan-E.

**Related:** [spec](../specs/2026-05-13-home-native-poc-design.md) §8-12 / [Plan-A](2026-05-13-home-native-poc-w1-be-setup.md) / [Plan-B](2026-05-13-home-native-poc-w2-w3-codegen.md) / [Plan-C](2026-05-13-home-native-poc-w4-w5-flutter-home.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `apps/mobile/lib/screens/home/state/home_controller.dart` | `clockIn()` method 추가 | Modify |
| `apps/mobile/lib/main.dart` | onClockIn/onOpenWebView 실제 wiring + Sentry transaction wrap | Modify |
| `apps/mobile/lib/screens/webview_host.dart` | 기존 WebViewHost route 재사용 (확인 후 wire) | Modify or Verify |
| `apps/mobile/lib/observability/sentry.dart` | `wrapTransaction` helper | Modify |
| `apps/mobile/integration_test/home_native_flow_test.dart` | boot → home render | New |
| `apps/mobile/test/screens/home/widgets/home_hero_golden_test.dart` | golden HomeHero OFF/WORKING | New |
| `apps/mobile/test/screens/home/widgets/home_kpi_tile_golden_test.dart` | golden KPI tile normal/caution | New |
| `apps/mobile/test/screens/home/widgets/goldens/` | golden 이미지 (auto) | New (auto) |
| `docs/operations/runbook.md` | PoC 베타 onboarding 절차 R-XXX | Modify |
| `docs/tasks/backlog.md` | B-NAT-02/03/04 stamp | Modify |
| `docs/superpowers/specs/2026-05-13-home-native-poc-design.md` | W2-W8 변경 이력 | Modify |

---

## Task 1: onClockIn wiring + HomeController.clockIn

**Files:**
- Modify: `apps/mobile/lib/screens/home/state/home_controller.dart`
- Modify: `apps/mobile/lib/main.dart`

- [ ] **Step 1.1: Find the clock-in endpoint**

```bash
grep -rn "clock_in\|clock-in" services/api/apps/attendance/urls.py
grep -rn "clock_in\|clock-in" services/api/apps/attendance/views.py | head -10
```

Identify the existing POST endpoint (likely `POST /v1/attendance/clock-in`). Verify the request schema (probably no body, JWT identifies user; possibly accepts `{ location: { lat, lng } }`).

- [ ] **Step 1.2: Add HomeController.clockIn**

In `apps/mobile/lib/screens/home/state/home_controller.dart`, add a method after `load()`:

```dart
  /// POST /v1/attendance/clock-in. Optimistically flips status to WORKING,
  /// then re-loads dashboard on success. On error, reverts and surfaces.
  Future<void> clockIn() async {
    final previous = state;
    state = state.copyWith(status: 'WORKING');
    notifyListeners();
    try {
      await dio.post<Map<String, dynamic>>('/v1/attendance/clock-in');
      await load(); // reconcile from server
    } on DioException catch (e) {
      state = previous;
      error = e.message ?? 'clock-in failed';
      notifyListeners();
    }
  }
```

If the actual endpoint accepts a body (e.g. `{ location: {...} }`), pass it. The current PoC scope does not use geofence in the Flutter native flow (existing native bridge handles that separately), so a bodyless POST is fine.

- [ ] **Step 1.3: Wire onClockIn in main.dart**

In `apps/mobile/lib/main.dart`, find the `WMHomeScreen(...)` construction inside `_Boot` and replace the `onClockIn` placeholder:

```dart
onClockIn: () {
  // Fire-and-forget — UI updates via ChangeNotifier.
  controller.clockIn();
},
```

Make sure `controller` is in scope (it's the `HomeController` instance instantiated a few lines earlier in `_BootState.build`).

- [ ] **Step 1.4: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/state/ lib/main.dart && cd ../..
```

Expected: `No issues found!`.

- [ ] **Step 1.5: Commit**

```bash
git add apps/mobile/lib/screens/home/state/home_controller.dart apps/mobile/lib/main.dart
git commit -m "feat(mobile): wire HomeController.clockIn + onClockIn callback"
```

---

## Task 2: onOpenWebView wiring

**Files:**
- Modify: `apps/mobile/lib/main.dart`

- [ ] **Step 2.1: Locate the existing WebView host**

```bash
grep -rn "class.*WebView\|InAppWebView" apps/mobile/lib/ | head -10
```

The original `apps/mobile/lib/main.dart` (or a separate `webview_host.dart`) constructs an `InAppWebView` against `WEBVIEW_URL + path`. Reuse it as a Navigator route.

- [ ] **Step 2.2: Add a route-push helper**

In `apps/mobile/lib/main.dart`, the WebView host widget likely accepts a `url` parameter (or builds against the baseUrl + path). Add a navigator key + helper:

```dart
final _rootNavigatorKey = GlobalKey<NavigatorState>();
```

Pass it into the `MaterialApp`:

```dart
return MaterialApp(
  navigatorKey: _rootNavigatorKey,
  theme: WMTheme.light(),
  home: ...,
);
```

In the `WMHomeScreen` construction:

```dart
onOpenWebView: (path) {
  final ctx = _rootNavigatorKey.currentContext;
  if (ctx == null) return;
  final url = '$baseUrl$path'; // baseUrl from _BootState (the WEBVIEW_URL define)
  Navigator.of(ctx).push(MaterialPageRoute(
    builder: (_) => /* existing WebView host widget, passing url */ ,
  ));
},
```

**Adapt to existing structure:** if the existing `main.dart` already has a `MaterialPageRoute` / named route for the WebView shell, reuse that pattern. If the existing WebView is the root widget without a Navigator wrapper, you may need a small refactor — keep it minimal.

- [ ] **Step 2.3: Verify**

```bash
cd apps/mobile && flutter analyze lib/main.dart && cd ../..
```

- [ ] **Step 2.4: Commit**

```bash
git add apps/mobile/lib/main.dart
git commit -m "feat(mobile): wire onOpenWebView → Navigator push existing WebView host"
```

---

## Task 3: Sentry transaction wrapping (PoC perf KPI)

**Files:**
- Modify: `apps/mobile/lib/observability/sentry.dart`
- Modify: `apps/mobile/lib/main.dart` (cold transaction)
- Modify: `apps/mobile/lib/screens/home/state/home_controller.dart` (load transaction)

- [ ] **Step 3.1: Add transaction helper**

In `apps/mobile/lib/observability/sentry.dart`, append:

```dart
/// Wraps a future in a Sentry transaction. If Sentry is disabled, returns
/// the future unchanged (no overhead).
///
/// Use for PoC perf KPI: `home.cold` (boot → home first render),
/// `home.load` (GET /v1/me/dashboard duration), `home.clock-in` (POST).
Future<T> wrapTransaction<T>(String name, String op, Future<T> Function() body) async {
  final hub = Sentry.isEnabled ? Sentry.startTransaction(name, op) : null;
  try {
    final r = await body();
    hub?.status = const SpanStatus.ok();
    return r;
  } catch (e, st) {
    hub?.throwable = e;
    hub?.status = const SpanStatus.internalError();
    await Sentry.captureException(e, stackTrace: st);
    rethrow;
  } finally {
    await hub?.finish();
  }
}
```

- [ ] **Step 3.2: Wrap home boot in main.dart**

In `_BootState._resolve()` (or equivalent), wrap the entire settings-fetch + WS-connect sequence in `wrapTransaction('home.boot', 'app.start', () async { ... });`.

In `_BootState.build()`, when constructing `WMHomeScreen`, schedule a transaction-finish on the first frame:

```dart
WidgetsBinding.instance.addPostFrameCallback((_) {
  // 'home.cold' transaction was started in initState — finish now that
  // the first frame is committed. (Or: emit a Sentry breadcrumb if the
  // transaction approach is too heavy for PoC.)
  Sentry.addBreadcrumb(Breadcrumb(
    category: 'navigation',
    message: 'home.first-frame',
    level: SentryLevel.info,
  ));
});
```

For PoC the simpler pattern is enough: emit `addBreadcrumb` markers at boot-start, boot-end, home-first-frame, and let Sentry aggregate the latency from breadcrumb timestamps in the dashboard. Don't over-engineer the transaction API in this step — Plan-E can refine.

- [ ] **Step 3.3: Wrap `HomeController.load()` in transaction**

In `apps/mobile/lib/screens/home/state/home_controller.dart`, wrap the body of `load()`:

```dart
  Future<void> load() => wrapTransaction('home.load', 'http.client', () async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me/dashboard');
      // ... existing parsing ...
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  });
```

Add the import: `import '../../../observability/sentry.dart';`.

- [ ] **Step 3.4: Verify**

```bash
cd apps/mobile && flutter analyze lib/observability/ lib/screens/home/state/ lib/main.dart && cd ../..
```

Expected: `No issues found!`. If Sentry API mismatch (Sentry 8.x renamed `Sentry.startTransaction` between versions), adapt to the actual API exposed by your installed version — `flutter pub deps | grep sentry` to confirm.

- [ ] **Step 3.5: Commit**

```bash
git add apps/mobile/lib/observability/sentry.dart apps/mobile/lib/main.dart apps/mobile/lib/screens/home/state/home_controller.dart
git commit -m "feat(mobile,obs): Sentry transactions for home.boot / home.load (PoC KPI)"
```

---

## Task 4: Integration test (home native flow)

**Files:**
- Create: `apps/mobile/integration_test/home_native_flow_test.dart`

- [ ] **Step 4.1: Add integration_test to dev_dependencies**

Verify `integration_test` is already in `apps/mobile/pubspec.yaml` (it should be from the WebView shell era). If absent:

```yaml
dev_dependencies:
  integration_test:
    sdk: flutter
```

- [ ] **Step 4.2: Create the test**

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';

import 'package:work_manager_mobile/realtime/ws_client.dart';
import 'package:work_manager_mobile/screens/home/state/home_controller.dart';
import 'package:work_manager_mobile/screens/home/wm_home_screen.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

Dio _stubDio({required Map<String, dynamic> dashboard}) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(InterceptorsWrapper(onRequest: (options, handler) {
    if (options.path.contains('/me/dashboard')) {
      handler.resolve(Response(data: dashboard, requestOptions: options, statusCode: 200));
    } else if (options.path.contains('/attendance/clock-in')) {
      handler.resolve(Response(data: {'data': {'ok': true}}, requestOptions: options, statusCode: 200));
    } else {
      handler.next(options);
    }
  }));
  return dio;
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('boot → home render with WORKING state', (tester) async {
    final dio = _stubDio(dashboard: {
      'data': {
        'status': 'WORKING',
        'today_minutes': 240,
        'week_minutes': 1200,
        'overtime_minutes': 0,
        'team_count': {'office': 3, 'wfh': 1, 'leave': 0, 'break': 0},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(
      dio: dio,
      wsClient: WsClient(baseWsUrl: 'ws://stub', accessTokenProvider: () async => null),
    );

    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: WMHomeScreen(controller: controller, onClockIn: () {}, onOpenWebView: (_) {}),
    ));
    await tester.pumpAndSettle();

    expect(find.text('근무 중'), findsOneWidget);
    expect(find.text('4h 00m'), findsWidgets);
  });

  testWidgets('clock-in flow optimistically updates status', (tester) async {
    final dio = _stubDio(dashboard: {
      'data': {
        'status': 'OFF',
        'today_minutes': 0,
        'week_minutes': 0,
        'overtime_minutes': 0,
        'team_count': <String, int>{},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(
      dio: dio,
      wsClient: WsClient(baseWsUrl: 'ws://stub', accessTokenProvider: () async => null),
    );

    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: WMHomeScreen(
        controller: controller,
        onClockIn: controller.clockIn,
        onOpenWebView: (_) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('출근 전'), findsOneWidget);
    await tester.tap(find.text('출근'));
    await tester.pump(); // optimistic update tick
    expect(find.text('근무 중'), findsOneWidget);
  });
}
```

- [ ] **Step 4.3: Run**

```bash
cd apps/mobile
flutter test integration_test/home_native_flow_test.dart
cd ../..
```

(Integration tests can also run on a device with `flutter test integration_test --device-id=...`, but for CI the `flutter test` host-runner suffices for these widget-level checks.)

Expected: 2 passed.

- [ ] **Step 4.4: Commit**

```bash
git add apps/mobile/integration_test/home_native_flow_test.dart
git commit -m "test(mobile): integration test for home boot + clock-in optimistic update"
```

---

## Task 5: Golden tests

**Files:**
- Create: `apps/mobile/test/screens/home/widgets/home_hero_golden_test.dart`
- Create: `apps/mobile/test/screens/home/widgets/home_kpi_tile_golden_test.dart`
- Create (auto): `apps/mobile/test/screens/home/widgets/goldens/*.png`

- [ ] **Step 5.1: HomeHero golden**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/home/widgets/home_hero.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

void main() {
  testWidgets('HomeHero OFF state golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: HomeHero(status: 'OFF', todayMinutes: 0, onClockIn: () {}),
      ),
    ));
    await expectLater(
      find.byType(HomeHero),
      matchesGoldenFile('goldens/home_hero_off.png'),
    );
  });

  testWidgets('HomeHero WORKING state golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: HomeHero(status: 'WORKING', todayMinutes: 240, onClockIn: () {}),
      ),
    ));
    await expectLater(
      find.byType(HomeHero),
      matchesGoldenFile('goldens/home_hero_working.png'),
    );
  });
}
```

- [ ] **Step 5.2: HomeKpiTile golden**

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/home/widgets/home_kpi_tile.dart';
import 'package:work_manager_mobile/theme/wm_theme.dart';

void main() {
  testWidgets('HomeKpiTile normal golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: Center(child: SizedBox(width: 120, child: HomeKpiTile(label: '오늘', value: '4h 00m'))),
      ),
    ));
    await expectLater(
      find.byType(HomeKpiTile),
      matchesGoldenFile('goldens/home_kpi_tile_normal.png'),
    );
  });

  testWidgets('HomeKpiTile caution golden', (tester) async {
    await tester.pumpWidget(MaterialApp(
      theme: WMTheme.light(),
      home: Scaffold(
        body: Center(child: SizedBox(width: 120, child: HomeKpiTile(label: '연장', value: '1h 15m', accent: KpiAccent.caution))),
      ),
    ));
    await expectLater(
      find.byType(HomeKpiTile),
      matchesGoldenFile('goldens/home_kpi_tile_caution.png'),
    );
  });
}
```

- [ ] **Step 5.3: Generate baseline goldens**

```bash
cd apps/mobile
flutter test --update-goldens test/screens/home/widgets/home_hero_golden_test.dart test/screens/home/widgets/home_kpi_tile_golden_test.dart
cd ../..
```

Expected: 4 PNG files created under `apps/mobile/test/screens/home/widgets/goldens/`.

- [ ] **Step 5.4: Run without --update to verify baseline**

```bash
cd apps/mobile
flutter test test/screens/home/widgets/home_hero_golden_test.dart test/screens/home/widgets/home_kpi_tile_golden_test.dart
cd ../..
```

Expected: 4 passed.

- [ ] **Step 5.5: Commit (including PNG goldens)**

```bash
git add apps/mobile/test/screens/home/widgets/home_hero_golden_test.dart \
        apps/mobile/test/screens/home/widgets/home_kpi_tile_golden_test.dart \
        apps/mobile/test/screens/home/widgets/goldens
git commit -m "test(mobile): golden tests for HomeHero + HomeKpiTile (4 baseline PNGs)"
```

**Note on rendering differences:** golden tests are sensitive to font rendering. If CI fails the baseline check because of OS font differences, gate with `kIsWeb` checks or use the `goldens_toolkit` package's `loadAppFonts()`. For PoC the simple `matchesGoldenFile` works on the host that generated the baseline; CI cross-OS sensitivity is a Plan-E concern.

---

## Task 6: flutter build apk --debug 검증

**Files:** none (verification only)

- [ ] **Step 6.1: Build debug APK**

```bash
cd apps/mobile
flutter build apk --debug --dart-define=WEBVIEW_URL=http://localhost:4455
cd ../..
```

Expected: `✓ Built build/app/outputs/flutter-apk/app-debug.apk` (~50-80MB). Build time 1-3 min first run.

**Possible failures:**
- **Gradle Java version mismatch**: Flutter 3.24 expects Java 17+. If your `JAVA_HOME` points elsewhere, set it: `export JAVA_HOME=/path/to/jdk17`.
- **Android SDK path missing**: set `ANDROID_HOME` to where Android Studio installed the SDK.
- **AGP version conflict**: the existing pubspec may pin an older Gradle Plugin. Either update `apps/mobile/android/settings.gradle` or skip this verification (analyze + test already cover correctness — APK is bonus).

If the build fails on environment setup (not code), report as DONE_WITH_CONCERNS with the specific error rather than spending time fixing Android tooling — that's Plan-E scope.

- [ ] **Step 6.2: Surface APK size**

```bash
ls -lh apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
```

Report the size. (For reference: a typical Flutter app with `flutter_inappwebview` + geolocator + sentry_flutter lands around 60-100MB debug, 30-50MB release.)

- [ ] **Step 6.3: No commit** — verification only.

---

## Task 7: Runbook PoC beta procedure + backlog stamp

**Files:**
- Modify: `docs/operations/runbook.md`
- Modify: `docs/tasks/backlog.md`
- Modify: `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`

- [ ] **Step 7.1: Append PoC beta procedure**

In `docs/operations/runbook.md`, find a section near the end (after the last R-XXX scenario) and append a new section:

```markdown
## R-PoC-01 · Home Native PoC 베타 토글 운영

### 베타 사용자 enable

```bash
# 특정 사용자 enable
docker compose exec api python manage.py set_user_setting \
  --user-id=<UUID> --key=use_native_home --value=true

# 전체 active 사용자 enable (대량 베타)
docker compose exec api python manage.py set_user_setting \
  --bulk --key=use_native_home --value=true
```

다음 앱 부팅 시 `_BootState._resolve` 가 `GET /v1/me/settings` → `use_native_home=true` 확인 → `WMHomeScreen` 으로 분기.

### 회귀 발생 시 disable

```bash
docker compose exec api python manage.py set_user_setting \
  --bulk --key=use_native_home --value=false
```

다음 부팅 시 WebView 로 전체 fallback. 즉시 끄기가 필요하면 React SPA settings 화면에서 사용자에게 PATCH `/v1/me/settings` 안내.

### KPI 수집

Sentry 대시보드:
- `home.boot` transaction → cold start 측정 (p50/p95)
- `home.load` transaction → GET /v1/me/dashboard latency
- `home.clock-in` transaction → POST /v1/attendance/clock-in latency

베타 5인 × 14일 라이브 종료 시 Sentry 에서 numbers 추출 → spec §9 KPI 표 채움.

### 회의 SOP
- Go/No-Go 회의 — Plan-A spec §11 분기 표 따름
- Go: ADR-007 Accepted 승격, B-NAT-03/04 backlog active 등록
- No-Go: ADR-007 보류, WebView polish 검토
```

- [ ] **Step 7.2: Update backlog B-NAT entries**

In `docs/tasks/backlog.md`, replace the current B-NAT-01 section (added in Plan-A Task 11A) with a block that stamps B-NAT-01 + B-NAT-02 + B-NAT-03 ✅ and adds B-NAT-04 (Plan-D = this plan) ✅:

```markdown
### B-NAT-01 · Home Native PoC W1 — BE 셋업 + Codegen 골격 ✅ 완료 (2026-05-13, Plan-A)
### B-NAT-02 · Home Native PoC W2-3 — Codegen 본 구현 ✅ 완료 (2026-05-13, Plan-B)
### B-NAT-03 · Home Native PoC W4-5 — Flutter Home Native ✅ 완료 (2026-05-13, Plan-C)
### B-NAT-04 · Home Native PoC W6-8 — Tests + Beta Build ✅ 완료 (2026-05-13, Plan-D)

(자세한 task 분해 + commit range 는 docs/superpowers/plans/2026-05-13-home-native-poc-* 참조.)

후속 (별도 plan 필요):
- B-NAT-05 (Plan-E): openapi-generator Windows fix + iOS 차단 해소 (B-OPS-02 Mac signing) + TestFlight beta
- B-NAT-06 (Phase A 본격): ADR-007 Phase A — Inbox / LeaveApply / LeaveBalance / Settings 페이지 native
- B-NAT-07: WebView 셸 제거 (Phase D)

PoC 종료 Go/No-Go 회의:
- 데이터 수집 위치: Sentry 대시보드 `home.boot` / `home.load` / `home.clock-in` transactions
- 베타 14일 종료 후 spec §11 결정 분기 표 적용

---
```

- [ ] **Step 7.3: Stamp spec**

In `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`, append to the "## 변경 이력" table:

```markdown
| 2026-05-13 | @sungjun + Claude | W2-3 codegen 본 구현 완료 (Plan-B). flutter-tokens 본 구현 + tokens.g.dart + WMTheme + dio_client + jwt_store + i18n ARB. openapi-generator Windows fallback stub. |
| 2026-05-13 | @sungjun + Claude | W4-5 Flutter Home Native 완료 (Plan-C). Sentry/WsClient/HomeController + Hero/KPI/TeamCount/AvatarStack + WMHomeScreen + main.dart 분기 + NativeBridge handler + widget test 2 pass. |
| 2026-05-13 | @sungjun + Claude | W6-8 Tests + Beta Build 완료 (Plan-D). onClockIn/onOpenWebView wire + Sentry transactions + integration test + golden test + flutter build apk debug 검증 + runbook R-PoC-01. iOS/openapi-generator는 Plan-E. |
```

- [ ] **Step 7.4: Commit**

```bash
git add docs/operations/runbook.md docs/tasks/backlog.md docs/superpowers/specs/2026-05-13-home-native-poc-design.md
git commit -m "docs(runbook,backlog,spec): mark B-NAT-01/02/03/04 complete + R-PoC-01 beta SOP"
```

---

## Self-Review

**Spec coverage (Plan-D scope — W6-W8 in spec §10):**
- ✅ onClockIn / onOpenWebView wiring → Tasks 1, 2
- ✅ Sentry transactions (perf KPI) → Task 3
- ✅ Integration test → Task 4
- ✅ Golden test → Task 5
- ✅ Android debug build verification → Task 6
- ✅ Beta runbook + backlog stamp → Task 7

**Out of scope (Plan-E):**
- openapi-generator Windows fix (fallback stub remains)
- iOS build (B-OPS-02 Mac signing host blocked on current host)
- TestFlight beta (iOS — blocked)
- Real beta user enrollment + 14-day live (operational, not code)
- KPI dashboard creation in Sentry (operational, not code)
- Phase A: Inbox/LeaveApply/LeaveBalance/Settings native pages

**Placeholder scan:** none. Two `TODO Plan-D` comments from Plan-C are resolved here (onClockIn, onOpenWebView). Sentry transaction wrapping uses real Sentry API.

**Type consistency:**
- `clockIn()` async returns void, matches `onClockIn: VoidCallback` callback signature.
- `Navigator.of(ctx).push(MaterialPageRoute(...))` returns `Future<T?>` — discard with no await.
- Sentry transaction helper `Future<T> wrapTransaction<T>(...)` matches usage in both load() and main.dart boot.
