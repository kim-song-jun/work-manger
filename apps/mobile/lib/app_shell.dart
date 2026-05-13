import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import 'api/jwt_store.dart';
import 'realtime/ws_client.dart';
import 'screens/home/state/home_controller.dart';
import 'screens/home/wm_home_screen.dart';
import 'screens/inbox/inbox_screen.dart';
import 'screens/inbox/state/inbox_controller.dart';
import 'screens/leave_apply/leave_apply_screen.dart';
import 'screens/leave_apply/state/leave_apply_controller.dart';
import 'screens/leave_balance/leave_balance_screen.dart';
import 'screens/leave_balance/state/leave_balance_controller.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/settings/state/settings_controller.dart';
import 'theme/tokens.g.dart';

/// 4-tab shell: Home / Inbox / LeaveBalance / Settings.
///
/// Owns all 4 controllers + WsClient lifecycle so [_BootState]
/// need not manage them. [onOpenWebView] is forwarded from Boot.
class AppShell extends StatefulWidget {
  const AppShell({
    super.key,
    required this.dio,
    required this.baseWsUrl,
    required this.role,
    required this.onOpenWebView,
  });

  final Dio dio;

  /// WebSocket base URL, e.g. `ws://localhost:4455`.
  final String baseWsUrl;

  /// User role string: EMPLOYEE | MANAGER | ADMIN | OWNER.
  final String role;

  /// Called when any native screen needs to deep-link into the WebView.
  final void Function(String path) onOpenWebView;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _tab = 0;
  late final WsClient _ws;
  late final HomeController _home;
  late final InboxController _inbox;
  late final LeaveBalanceController _balance;
  late final SettingsController _settings;

  @override
  void initState() {
    super.initState();
    _ws = WsClient(
      baseWsUrl: widget.baseWsUrl,
      accessTokenProvider: () => JwtStore().readAccess(),
    );
    unawaited(_ws.connect());
    _home = HomeController(dio: widget.dio, wsClient: _ws);
    _inbox = InboxController(dio: widget.dio, role: widget.role);
    _balance = LeaveBalanceController(dio: widget.dio);
    _settings = SettingsController(dio: widget.dio);
  }

  @override
  void dispose() {
    _home.dispose();
    _inbox.dispose();
    _balance.dispose();
    _settings.dispose();
    _ws.dispose();
    super.dispose();
  }

  void _openLeaveApply() {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) {
          final c = LeaveApplyController(dio: widget.dio);
          return LeaveApplyScreen(
            controller: c,
            onDone: () {
              Navigator.of(context).pop();
              _balance.load();
            },
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      WMHomeScreen(
        controller: _home,
        onClockIn: () => _home.clockIn(),
        onOpenWebView: widget.onOpenWebView,
      ),
      InboxScreen(
        controller: _inbox,
        onOpenItem: (item) =>
            widget.onOpenWebView('/m/approval-detail?id=${item.id}'),
      ),
      LeaveBalanceScreen(
        controller: _balance,
        onApply: _openLeaveApply,
      ),
      SettingsScreen(
        controller: _settings,
        onOpenWebView: widget.onOpenWebView,
      ),
    ];

    return Scaffold(
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        backgroundColor: WMTokens.white,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: '홈',
          ),
          NavigationDestination(
            icon: Icon(Icons.inbox_outlined),
            selectedIcon: Icon(Icons.inbox),
            label: '받은함',
          ),
          NavigationDestination(
            icon: Icon(Icons.beach_access_outlined),
            selectedIcon: Icon(Icons.beach_access),
            label: '휴가',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: '설정',
          ),
        ],
      ),
    );
  }
}
