# Home Native PoC — Plan-C: W4-W5 Flutter Home Native Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** PoC 의 사용자 가시 가치 — `WMHomeScreen` (Flutter native) + 4 widgets + `HomeController` (Dio + WS) + `main.dart` 분기 + Sentry mobile + NativeBridge handler. `use_native_home=true` 베타 사용자가 native Hero/KPI/team count 를 본다.

**Architecture:** main.dart 가 부팅 시 `GET /v1/me/settings` 호출 → `use_native_home` 으로 `WMHomeScreen()` 또는 `WebViewHost()` 분기. WMHomeScreen 은 `HomeController` (ChangeNotifier) 가 `GET /v1/me/dashboard` + `WS /ws/clock-in` 구독. WS event → partial rebuild. 디자인은 Plan-B 의 `WMTheme.light()` 적용.

**Tech Stack:** Flutter 3.24, Dart 3.5+, dio 5.x, web_socket_channel 3.x, sentry_flutter 8.x, flutter_inappwebview 6.x (기존), provider 또는 단순 ChangeNotifier pattern.

**Plan-B Task 4 fallback note:** openapi-generator-cli 가 Windows 환경 NestJS bundler crash → `apps/mobile/lib/api/openapi/` 는 stub 상태. Plan-C 는 generated client 우회 — 직접 `dio.get('/v1/me/dashboard')` 등 manual call. Plan-D 가 codegen fix 우선순위.

**Related:** [spec](../specs/2026-05-13-home-native-poc-design.md) §4-6 / [Plan-A](2026-05-13-home-native-poc-w1-be-setup.md) / [Plan-B](2026-05-13-home-native-poc-w2-w3-codegen.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `apps/mobile/lib/observability/sentry.dart` | Sentry init + scoped helpers | New |
| `apps/mobile/lib/realtime/ws_client.dart` | Channels `/ws/clock-in` Dart client | New |
| `apps/mobile/lib/screens/home/state/home_controller.dart` | ChangeNotifier (dashboard + WS) | New |
| `apps/mobile/lib/screens/home/widgets/home_hero.dart` | Hero card (status badge + clock-in CTA + progress) | New |
| `apps/mobile/lib/screens/home/widgets/home_kpi_tile.dart` | KPI tile (reusable) | New |
| `apps/mobile/lib/screens/home/widgets/home_team_count.dart` | Team status dot row | New |
| `apps/mobile/lib/screens/home/widgets/home_avatar_stack.dart` | Avatar stack | New |
| `apps/mobile/lib/screens/home/wm_home_screen.dart` | Scaffold + AppBar + body | New |
| `apps/mobile/lib/main.dart` | settings 분기 + Sentry wrap | Modify |
| `apps/mobile/lib/bridge/native_bridge.dart` | notifySettingsChanged handler | Modify |
| `apps/mobile/test/screens/home/wm_home_screen_test.dart` | widget test | New |
| `apps/mobile/test/screens/home/state/home_controller_test.dart` | controller test | New |

---

## Task 1: Sentry init wrapper

**Files:**
- Create: `apps/mobile/lib/observability/sentry.dart`

- [ ] **Step 1.1: Create the wrapper**

Create `apps/mobile/lib/observability/sentry.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

/// Initialize Sentry mobile (PoC).
///
/// Reads DSN from `--dart-define=SENTRY_DSN=...`. If empty, Sentry is
/// disabled (PoC stays silent on dev machines without a key).
Future<void> initSentry(Future<void> Function() runApp) async {
  const dsn = String.fromEnvironment('SENTRY_DSN');
  if (dsn.isEmpty) {
    await runApp();
    return;
  }
  await SentryFlutter.init(
    (o) {
      o.dsn = dsn;
      o.tracesSampleRate = kReleaseMode ? 0.1 : 1.0;
      o.environment = const String.fromEnvironment('SENTRY_ENV', defaultValue: 'dev');
      o.release = const String.fromEnvironment('APP_VERSION', defaultValue: 'unknown');
    },
    appRunner: runApp,
  );
}
```

- [ ] **Step 1.2: Verify**

```bash
cd apps/mobile
flutter analyze lib/observability/
cd ../..
```

Expected: `No issues found!`.

- [ ] **Step 1.3: Commit**

```bash
git add apps/mobile/lib/observability/sentry.dart
git commit -m "feat(mobile): Sentry init wrapper (--dart-define SENTRY_DSN)"
```

---

## Task 2: WsClient (Channels)

**Files:**
- Create: `apps/mobile/lib/realtime/ws_client.dart`

- [ ] **Step 2.1: Create the client**

Create `apps/mobile/lib/realtime/ws_client.dart`:

```dart
import 'dart:async';
import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

/// Dart client for the Channels WS endpoint `/ws/clock-in`.
///
/// Backoff: 1s → 2s → 5s → 30s (cap). Reconnects automatically.
class WsClient {
  WsClient({required this.baseWsUrl, required this.accessTokenProvider});

  final String baseWsUrl; // e.g. ws://localhost:4455
  final Future<String?> Function() accessTokenProvider;

  WebSocketChannel? _ch;
  final _events = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get events => _events.stream;
  Duration _backoff = const Duration(seconds: 1);
  bool _closed = false;

  Future<void> connect() async {
    _closed = false;
    while (!_closed) {
      try {
        final token = await accessTokenProvider();
        final uri = Uri.parse('$baseWsUrl/ws/clock-in${token != null ? '?token=$token' : ''}');
        _ch = WebSocketChannel.connect(uri);
        await _ch!.ready;
        _backoff = const Duration(seconds: 1);
        _ch!.stream.listen(
          (raw) {
            try {
              final m = jsonDecode(raw as String) as Map<String, dynamic>;
              _events.add(m);
            } catch (_) {
              // ignore malformed payload
            }
          },
          onDone: () {},
          onError: (_) {},
          cancelOnError: true,
        );
        await _ch!.sink.done;
      } catch (_) {
        // swallow — fall through to backoff
      }
      if (_closed) break;
      await Future.delayed(_backoff);
      _backoff = _backoff * 2;
      if (_backoff > const Duration(seconds: 30)) {
        _backoff = const Duration(seconds: 30);
      }
    }
  }

  Future<void> dispose() async {
    _closed = true;
    await _ch?.sink.close();
    await _events.close();
  }
}
```

- [ ] **Step 2.2: Verify**

```bash
cd apps/mobile && flutter analyze lib/realtime/ && cd ../..
```

Expected: `No issues found!`. (Note: `web_socket_channel` is already in pubspec.yaml from the original WebView shell era — verify with `grep web_socket_channel apps/mobile/pubspec.yaml`. If absent, add it.)

- [ ] **Step 2.3: Commit**

```bash
git add apps/mobile/lib/realtime/ws_client.dart
git commit -m "feat(mobile): WsClient with exponential backoff for /ws/clock-in"
```

---

## Task 3: HomeController (ChangeNotifier)

**Files:**
- Create: `apps/mobile/lib/screens/home/state/home_controller.dart`

- [ ] **Step 3.1: Create the controller**

Create `apps/mobile/lib/screens/home/state/home_controller.dart`:

```dart
import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../realtime/ws_client.dart';

class HomeState {
  HomeState({
    required this.status,
    required this.todayMinutes,
    required this.weekMinutes,
    required this.overtimeMinutes,
    required this.teamCount,
    required this.avatars,
  });

  /// 'OFF' | 'WORKING' | 'BREAK' | 'WFH' | 'LEAVE'
  final String status;
  final int todayMinutes;
  final int weekMinutes;
  final int overtimeMinutes;

  /// {office: N, wfh: N, leave: N, break: N}
  final Map<String, int> teamCount;

  /// Avatar URLs of currently-online teammates.
  final List<String> avatars;

  HomeState copyWith({
    String? status,
    int? todayMinutes,
    int? weekMinutes,
    int? overtimeMinutes,
    Map<String, int>? teamCount,
    List<String>? avatars,
  }) {
    return HomeState(
      status: status ?? this.status,
      todayMinutes: todayMinutes ?? this.todayMinutes,
      weekMinutes: weekMinutes ?? this.weekMinutes,
      overtimeMinutes: overtimeMinutes ?? this.overtimeMinutes,
      teamCount: teamCount ?? this.teamCount,
      avatars: avatars ?? this.avatars,
    );
  }

  static HomeState empty() => HomeState(
        status: 'OFF',
        todayMinutes: 0,
        weekMinutes: 0,
        overtimeMinutes: 0,
        teamCount: const {'office': 0, 'wfh': 0, 'leave': 0, 'break': 0},
        avatars: const [],
      );
}

class HomeController extends ChangeNotifier {
  HomeController({required this.dio, required this.wsClient}) {
    _wsSub = wsClient.events.listen(_onWsEvent);
  }

  final Dio dio;
  final WsClient wsClient;
  StreamSubscription<Map<String, dynamic>>? _wsSub;

  HomeState state = HomeState.empty();
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me/dashboard');
      final data = r.data?['data'] as Map<String, dynamic>? ?? {};
      state = HomeState(
        status: (data['status'] as String?) ?? 'OFF',
        todayMinutes: (data['today_minutes'] as int?) ?? 0,
        weekMinutes: (data['week_minutes'] as int?) ?? 0,
        overtimeMinutes: (data['overtime_minutes'] as int?) ?? 0,
        teamCount: Map<String, int>.from((data['team_count'] as Map?) ?? {}),
        avatars: List<String>.from((data['avatars'] as List?) ?? []),
      );
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  void _onWsEvent(Map<String, dynamic> e) {
    if (e['event'] != 'clock-in.updated') return;
    final newStatus = e['status'] as String?;
    final newToday = e['today_minutes'] as int?;
    if (newStatus == null && newToday == null) return;
    state = state.copyWith(status: newStatus, todayMinutes: newToday);
    notifyListeners();
  }

  @override
  void dispose() {
    _wsSub?.cancel();
    super.dispose();
  }
}
```

- [ ] **Step 3.2: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/state/ && cd ../..
```

Expected: `No issues found!`.

- [ ] **Step 3.3: Commit**

```bash
git add apps/mobile/lib/screens/home/state/home_controller.dart
git commit -m "feat(mobile): HomeController ChangeNotifier (Dio + WS partial rebuild)"
```

---

## Task 4: HomeHero widget

**Files:**
- Create: `apps/mobile/lib/screens/home/widgets/home_hero.dart`

- [ ] **Step 4.1: Create the widget**

Create `apps/mobile/lib/screens/home/widgets/home_hero.dart`:

```dart
import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeHero extends StatelessWidget {
  const HomeHero({
    super.key,
    required this.status,
    required this.todayMinutes,
    required this.onClockIn,
  });

  final String status; // OFF | WORKING | BREAK | WFH | LEAVE
  final int todayMinutes;
  final VoidCallback onClockIn;

  static const _regularMinutes = 8 * 60;

  @override
  Widget build(BuildContext context) {
    final isActive = status == 'WORKING' || status == 'WFH';
    final progress = (todayMinutes / _regularMinutes).clamp(0.0, 1.0);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: isActive
            ? LinearGradient(
                colors: [WMTokens.blue500, WMTokens.blue500.withOpacity(0.8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              )
            : null,
        color: isActive ? null : WMTokens.white,
        borderRadius: BorderRadius.circular(WMTokens.rLg),
        boxShadow: isActive
            ? [BoxShadow(color: WMTokens.blue500.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))]
            : [BoxShadow(color: WMTokens.grey900.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (isActive) ...[
                _pulseDot(),
                const SizedBox(width: 8),
              ],
              Text(
                _statusLabel(status),
                style: TextStyle(
                  color: isActive ? WMTokens.white : WMTokens.grey900,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _formatHM(todayMinutes),
            style: TextStyle(
              color: isActive ? WMTokens.white : WMTokens.grey900,
              fontSize: 36,
              fontWeight: FontWeight.w700,
              letterSpacing: -1.0,
            ),
          ),
          const SizedBox(height: 16),
          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 3,
              backgroundColor: (isActive ? WMTokens.white : WMTokens.grey200).withOpacity(0.3),
              valueColor: AlwaysStoppedAnimation(isActive ? WMTokens.white : WMTokens.blue500),
            ),
          ),
          if (!isActive) ...[
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: onClockIn,
                child: const Text('출근'),
              ),
            ),
          ],
        ],
      ),
    );
  }

  static String _statusLabel(String s) {
    switch (s) {
      case 'WORKING':
        return '근무 중';
      case 'BREAK':
        return '휴식';
      case 'WFH':
        return '재택';
      case 'LEAVE':
        return '휴가';
      default:
        return '출근 전';
    }
  }

  static String _formatHM(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }

  Widget _pulseDot() {
    return Container(
      width: 8,
      height: 8,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}
```

**Token availability:** uses `WMTokens.blue500`, `WMTokens.white`, `WMTokens.grey900`, `WMTokens.grey200`, `WMTokens.rLg`. If any are missing in `tokens.g.dart`, substitute with nearest available (`grep "static const" apps/mobile/lib/theme/tokens.g.dart`).

- [ ] **Step 4.2: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/widgets/home_hero.dart && cd ../..
```

- [ ] **Step 4.3: Commit**

```bash
git add apps/mobile/lib/screens/home/widgets/home_hero.dart
git commit -m "feat(mobile): HomeHero widget (status badge + progress + CTA)"
```

---

## Task 5: HomeKpiTile widget

**Files:**
- Create: `apps/mobile/lib/screens/home/widgets/home_kpi_tile.dart`

- [ ] **Step 5.1: Create the widget**

```dart
import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

enum KpiAccent { none, caution }

class HomeKpiTile extends StatelessWidget {
  const HomeKpiTile({
    super.key,
    required this.label,
    required this.value,
    this.accent = KpiAccent.none,
  });

  final String label;
  final String value;
  final KpiAccent accent;

  @override
  Widget build(BuildContext context) {
    final bg = accent == KpiAccent.caution ? WMTokens.orange50 : WMTokens.white;
    final valueColor = accent == KpiAccent.caution ? WMTokens.orange700 : WMTokens.grey900;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOut,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(WMTokens.rMd),
        boxShadow: [BoxShadow(color: WMTokens.grey900.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(color: WMTokens.grey600, fontSize: 12, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(color: valueColor, fontSize: 20, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
```

**Token availability:** `orange50`, `orange700`, `grey600` — if absent in tokens.g.dart, fall back to ones that exist. Could also drop `KpiAccent.caution` styling (use the same color) if no orange tokens are present.

- [ ] **Step 5.2: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/widgets/home_kpi_tile.dart && cd ../..
```

- [ ] **Step 5.3: Commit**

```bash
git add apps/mobile/lib/screens/home/widgets/home_kpi_tile.dart
git commit -m "feat(mobile): HomeKpiTile (reusable, caution accent for overtime)"
```

---

## Task 6: HomeTeamCount + HomeAvatarStack

**Files:**
- Create: `apps/mobile/lib/screens/home/widgets/home_team_count.dart`
- Create: `apps/mobile/lib/screens/home/widgets/home_avatar_stack.dart`

- [ ] **Step 6.1: HomeTeamCount**

Create `apps/mobile/lib/screens/home/widgets/home_team_count.dart`:

```dart
import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeTeamCount extends StatelessWidget {
  const HomeTeamCount({super.key, required this.count});

  /// {office: N, wfh: N, leave: N, break: N}
  final Map<String, int> count;

  @override
  Widget build(BuildContext context) {
    final segments = [
      ('office', '출근', WMTokens.blue500, count['office'] ?? 0),
      ('wfh', '재택', WMTokens.green500, count['wfh'] ?? 0),
      ('leave', '휴가', WMTokens.orange500, count['leave'] ?? 0),
      ('break', '휴식', WMTokens.grey500, count['break'] ?? 0),
    ].where((s) => s.$4 > 0).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      child: Wrap(
        spacing: 12,
        runSpacing: 4,
        children: [
          for (final s in segments)
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(width: 6, height: 6, decoration: BoxDecoration(color: s.$3, shape: BoxShape.circle)),
                const SizedBox(width: 4),
                Text('${s.$4}명 ${s.$2}', style: TextStyle(color: WMTokens.grey700, fontSize: 13)),
              ],
            ),
        ],
      ),
    );
  }
}
```

**Tokens:** `blue500`, `green500`, `orange500`, `grey500`, `grey700`. Substitute if any missing.

- [ ] **Step 6.2: HomeAvatarStack**

Create `apps/mobile/lib/screens/home/widgets/home_avatar_stack.dart`:

```dart
import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';

class HomeAvatarStack extends StatelessWidget {
  const HomeAvatarStack({super.key, required this.urls, this.maxVisible = 5});

  final List<String> urls;
  final int maxVisible;

  @override
  Widget build(BuildContext context) {
    if (urls.isEmpty) return const SizedBox.shrink();
    final visible = urls.take(maxVisible).toList();
    final extra = urls.length - visible.length;
    return SizedBox(
      height: 32,
      child: Stack(
        children: [
          for (var i = 0; i < visible.length; i++)
            Positioned(
              left: i * 22.0,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: WMTokens.grey200,
                  shape: BoxShape.circle,
                  border: Border.all(color: WMTokens.white, width: 2),
                ),
                clipBehavior: Clip.hardEdge,
                child: Image.network(
                  visible[i],
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Icon(Icons.person, size: 18, color: WMTokens.grey500),
                ),
              ),
            ),
          if (extra > 0)
            Positioned(
              left: visible.length * 22.0,
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: WMTokens.grey100,
                  shape: BoxShape.circle,
                  border: Border.all(color: WMTokens.white, width: 2),
                ),
                alignment: Alignment.center,
                child: Text('+$extra', style: TextStyle(color: WMTokens.grey700, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ),
        ],
      ),
    );
  }
}
```

- [ ] **Step 6.3: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/widgets/ && cd ../..
```

- [ ] **Step 6.4: Commit**

```bash
git add apps/mobile/lib/screens/home/widgets/home_team_count.dart apps/mobile/lib/screens/home/widgets/home_avatar_stack.dart
git commit -m "feat(mobile): HomeTeamCount + HomeAvatarStack widgets"
```

---

## Task 7: WMHomeScreen Scaffold

**Files:**
- Create: `apps/mobile/lib/screens/home/wm_home_screen.dart`

- [ ] **Step 7.1: Create the screen**

Create `apps/mobile/lib/screens/home/wm_home_screen.dart`:

```dart
import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/home_controller.dart';
import 'widgets/home_avatar_stack.dart';
import 'widgets/home_hero.dart';
import 'widgets/home_kpi_tile.dart';
import 'widgets/home_team_count.dart';

class WMHomeScreen extends StatefulWidget {
  const WMHomeScreen({super.key, required this.controller, required this.onClockIn, required this.onOpenWebView});

  final HomeController controller;
  final VoidCallback onClockIn;
  final void Function(String path) onOpenWebView;

  @override
  State<WMHomeScreen> createState() => _WMHomeScreenState();
}

class _WMHomeScreenState extends State<WMHomeScreen> {
  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onChange);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onChange);
    super.dispose();
  }

  void _onChange() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.controller.state;
    final loading = widget.controller.loading;
    final err = widget.controller.error;

    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        backgroundColor: WMTokens.white,
        elevation: 0,
        title: const Text('근무 관리', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => widget.onOpenWebView('/m/inbox'),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: widget.controller.load,
        child: ListView(
          children: [
            if (err != null)
              Container(
                margin: const EdgeInsets.all(12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: WMTokens.red50,
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error_outline, color: WMTokens.red700, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text('최신 데이터를 불러올 수 없습니다.', style: TextStyle(color: WMTokens.red700, fontSize: 13))),
                    TextButton(onPressed: widget.controller.load, child: const Text('재시도')),
                  ],
                ),
              ),
            if (loading && s.todayMinutes == 0 && err == null) const LinearProgressIndicator(minHeight: 2),
            HomeHero(
              status: s.status,
              todayMinutes: s.todayMinutes,
              onClockIn: widget.onClockIn,
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(child: HomeKpiTile(label: '오늘', value: _h(s.todayMinutes))),
                  const SizedBox(width: 8),
                  Expanded(child: HomeKpiTile(label: '이번주', value: _h(s.weekMinutes))),
                  const SizedBox(width: 8),
                  Expanded(
                    child: HomeKpiTile(
                      label: '연장',
                      value: _h(s.overtimeMinutes),
                      accent: s.overtimeMinutes >= 30 ? KpiAccent.caution : KpiAccent.none,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            HomeTeamCount(count: s.teamCount),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: HomeAvatarStack(urls: s.avatars),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  static String _h(int minutes) {
    final h = minutes ~/ 60;
    final m = minutes % 60;
    return '${h}h ${m.toString().padLeft(2, '0')}m';
  }
}
```

- [ ] **Step 7.2: Verify**

```bash
cd apps/mobile && flutter analyze lib/screens/home/ && cd ../..
```

- [ ] **Step 7.3: Commit**

```bash
git add apps/mobile/lib/screens/home/wm_home_screen.dart
git commit -m "feat(mobile): WMHomeScreen Scaffold (AppBar + Hero + KPI + team + avatars)"
```

---

## Task 8: main.dart 분기 + NativeBridge handler

**Files:**
- Modify: `apps/mobile/lib/main.dart`
- Modify: `apps/mobile/lib/bridge/native_bridge.dart`

- [ ] **Step 8.1: Inspect existing main.dart**

```bash
head -50 apps/mobile/lib/main.dart
```

Look at the existing entry point. Plan-C's modification: add the settings-based branch before the existing WebView host code.

- [ ] **Step 8.2: Add settings branch**

In `apps/mobile/lib/main.dart`, after the existing imports add:

```dart
import 'api/dio_client.dart';
import 'api/jwt_store.dart';
import 'observability/sentry.dart';
import 'realtime/ws_client.dart';
import 'screens/home/state/home_controller.dart';
import 'screens/home/wm_home_screen.dart';
import 'theme/wm_theme.dart';
```

The existing `main()` function should be wrapped in `initSentry(() async { ... runApp(...); })`. Inside `runApp`, the top-level widget chooses between `WMHomeScreen(...)` and the existing WebView host based on `GET /v1/me/settings`.

A minimal patch (adapt to the existing structure — pseudocode):

```dart
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initSentry(() async {
    runApp(const _Boot());
  });
}

class _Boot extends StatefulWidget {
  const _Boot();
  @override
  State<_Boot> createState() => _BootState();
}

class _BootState extends State<_Boot> {
  bool? _useNativeHome;
  Dio? _dio;
  WsClient? _ws;

  @override
  void initState() {
    super.initState();
    _resolve();
  }

  Future<void> _resolve() async {
    final baseUrl = const String.fromEnvironment('WEBVIEW_URL', defaultValue: 'http://localhost:4455');
    _dio = await createWMDio(baseUrl: baseUrl);
    try {
      final r = await _dio!.get<Map<String, dynamic>>('/v1/me/settings');
      _useNativeHome = (r.data?['data']?['use_native_home'] as bool?) ?? false;
    } catch (_) {
      _useNativeHome = false;
    }
    if (_useNativeHome == true) {
      _ws = WsClient(
        baseWsUrl: baseUrl.replaceFirst('http', 'ws'),
        accessTokenProvider: () => JwtStore().readAccess(),
      );
      unawaited(_ws!.connect());
    }
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_useNativeHome == null) {
      return MaterialApp(
        theme: WMTheme.light(),
        home: const Scaffold(body: Center(child: CircularProgressIndicator())),
      );
    }
    if (_useNativeHome!) {
      final controller = HomeController(dio: _dio!, wsClient: _ws!);
      return MaterialApp(
        theme: WMTheme.light(),
        home: WMHomeScreen(
          controller: controller,
          onClockIn: () { /* TODO Plan-D: trigger /v1/attendance/clock-in */ },
          onOpenWebView: (path) { /* TODO Plan-D: navigate to WebView host */ },
        ),
      );
    }
    // Fallback: existing WebView host
    return /* existing WebView app */;
  }
}
```

**Critical:** the existing `apps/mobile/lib/main.dart` likely already constructs a WebView host as the top-level widget. PRESERVE that as the fallback path (the `Fallback` branch above). Don't delete the existing app structure — only ADD the native branch on top.

If the existing main.dart structure makes this awkward (e.g., the WebView host is wired with platform channels deep inside), do the minimum: wrap the existing top-level widget call with a `FutureBuilder<bool>` that resolves `use_native_home` and returns either `WMHomeScreen` or the existing widget.

- [ ] **Step 8.3: Add notifySettingsChanged handler**

In `apps/mobile/lib/bridge/native_bridge.dart`, after the existing handler registrations (look for `addJavaScriptHandler` calls), add:

```dart
controller.addJavaScriptHandler(
  handlerName: 'notifySettingsChanged',
  callback: (args) {
    // Trigger app rebuild — settings change should re-evaluate use_native_home
    // For PoC: simplest is to restart the app shell
    // Production: ChangeNotifier on a top-level SettingsModel
    // TODO Plan-D: wire to top-level state
    return {'ok': true};
  },
);
```

- [ ] **Step 8.4: Verify**

```bash
cd apps/mobile && flutter analyze lib/main.dart lib/bridge/ && cd ../..
```

Expected: `No issues found!`. Real-device testing comes in Plan-D.

- [ ] **Step 8.5: Commit**

```bash
git add apps/mobile/lib/main.dart apps/mobile/lib/bridge/native_bridge.dart
git commit -m "feat(mobile): main.dart settings branch + native_bridge notifySettingsChanged"
```

---

## Task 9: Widget tests (smoke)

**Files:**
- Create: `apps/mobile/test/screens/home/wm_home_screen_test.dart`

- [ ] **Step 9.1: Create the test**

Create `apps/mobile/test/screens/home/wm_home_screen_test.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/realtime/ws_client.dart';
import 'package:work_manager_mobile/screens/home/state/home_controller.dart';
import 'package:work_manager_mobile/screens/home/wm_home_screen.dart';

class _StubDio extends DioForNative {
  _StubDio(this._payload) : super(BaseOptions(baseUrl: 'http://localhost'));
  final Map<String, dynamic> _payload;
  @override
  Future<Response<T>> get<T>(String path, {Object? data, Map<String, dynamic>? queryParameters, Options? options, CancelToken? cancelToken, ProgressCallback? onReceiveProgress}) async {
    return Response<T>(
      data: _payload as T,
      requestOptions: RequestOptions(path: path),
      statusCode: 200,
    );
  }
}

class _StubWs implements WsClient {
  @override Future<void> connect() async {}
  @override Future<void> dispose() async {}
  @override Stream<Map<String, dynamic>> get events => const Stream.empty();
  @override Future<String?> Function() get accessTokenProvider => () async => null;
  @override String get baseWsUrl => 'ws://localhost';
}

void main() {
  testWidgets('WMHomeScreen renders hero in OFF state with no data', (tester) async {
    final dio = _StubDio({
      'data': {
        'status': 'OFF',
        'today_minutes': 0,
        'week_minutes': 0,
        'overtime_minutes': 0,
        'team_count': {'office': 0, 'wfh': 0, 'leave': 0, 'break': 0},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(dio: dio, wsClient: _StubWs());

    await tester.pumpWidget(MaterialApp(
      home: WMHomeScreen(
        controller: controller,
        onClockIn: () {},
        onOpenWebView: (_) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('출근 전'), findsOneWidget);
    expect(find.text('출근'), findsOneWidget);
  });

  testWidgets('WMHomeScreen renders hero in WORKING state', (tester) async {
    final dio = _StubDio({
      'data': {
        'status': 'WORKING',
        'today_minutes': 240,
        'week_minutes': 1200,
        'overtime_minutes': 0,
        'team_count': {'office': 3, 'wfh': 2, 'leave': 0, 'break': 1},
        'avatars': <String>[],
      }
    });
    final controller = HomeController(dio: dio, wsClient: _StubWs());

    await tester.pumpWidget(MaterialApp(
      home: WMHomeScreen(
        controller: controller,
        onClockIn: () {},
        onOpenWebView: (_) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('근무 중'), findsOneWidget);
    expect(find.text('4h 00m'), findsOneWidget);
    expect(find.textContaining('출근'), findsWidgets); // team count "3명 출근"
  });
}
```

**Note:** The package name `work_manager_mobile` comes from `apps/mobile/pubspec.yaml` `name:` field. Verify with `grep "^name:" apps/mobile/pubspec.yaml`. If different, use the actual name.

The `_StubDio` shortcut may fail if `DioForNative` isn't the right base class — Dio 5.x uses `DioForNative` for VM and `DioForBrowser` for web. If analyzer errors out, switch to `dio_mock` package or implement `Dio` by extending with a mock interceptor.

- [ ] **Step 9.2: Run tests**

```bash
cd apps/mobile
flutter test test/screens/home/wm_home_screen_test.dart
cd ../..
```

Expected: 2 passed.

If `DioForNative` issue arises, use a simpler stub: provide a real Dio with a mock adapter:

```dart
import 'package:dio/dio.dart';
import 'package:dio/io.dart';

Dio _stubDio(Map<String, dynamic> payload) {
  final dio = Dio();
  dio.httpClientAdapter = _MockAdapter(payload);
  return dio;
}
```

Plan-D will introduce `mocktail` or `dio_test`; for PoC, the test just needs to verify widget rendering, not full HTTP simulation.

- [ ] **Step 9.3: Commit**

```bash
git add apps/mobile/test/screens/home/wm_home_screen_test.dart
git commit -m "test(mobile): WMHomeScreen widget smoke (OFF + WORKING states)"
```

---

## Self-Review

**Spec coverage (Plan-C scope — W4-W5 in spec §10):**
- ✅ Sentry init → Task 1
- ✅ WsClient → Task 2
- ✅ HomeController → Task 3
- ✅ HomeHero / HomeKpiTile / HomeTeamCount / HomeAvatarStack → Tasks 4, 5, 6
- ✅ WMHomeScreen → Task 7
- ✅ main.dart settings 분기 + NativeBridge → Task 8
- ✅ Widget tests → Task 9

**Out of scope (Plan-D):**
- Integration tests (`integration_test/home_native_flow_test.dart`)
- Golden tests
- Play Console Internal Testing build (`flutter build appbundle`)
- KPI measurement (Sentry transaction dashboards, perf overlay)
- TestFlight beta (iOS — blocked by B-OPS-02)
- Real clock-in API call wiring (`onClockIn` callback currently empty)
- `onOpenWebView` navigation wiring (Plan-D)
- Codegen drift fix for `flutter-api.cjs` (currently fallback stub)

**Placeholder scan:** Two `TODO Plan-D` comments in Task 8 for `onClockIn` and `onOpenWebView` wiring. These are intentional out-of-scope markers, NOT placeholders for missing implementation in this plan. The widget interface accepts them as `VoidCallback` / function — the wiring just calls them with no-ops in PoC.

**Type consistency:**
- `HomeState.status` is `String` across controller / hero widget.
- `HomeController({required this.dio, required this.wsClient})` matches usage in WMHomeScreen.
- `WsClient.events` stream type `Map<String, dynamic>` matches `HomeController._onWsEvent`.

**Token name divergence note:** Plan-B Task 2 reported that CSS uses Toss primitives (`blue500`, `grey50`, `white`, `grey900`, `rMd`) instead of semantic aliases. Plan-C widgets reference these primitives directly. If tokens.g.dart adds semantic aliases later, the widgets can switch.
