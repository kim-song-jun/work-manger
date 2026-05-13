import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

import 'api/jwt_store.dart';
import 'realtime/ws_client.dart';
import 'screens/admin_approvals/admin_approvals_screen.dart';
import 'screens/admin_dashboard/admin_dashboard_screen.dart';
import 'screens/admin_dashboard/state/admin_dashboard_controller.dart';
import 'screens/admin_employees/admin_employees_screen.dart';
import 'screens/admin_employees/state/admin_employees_controller.dart';
import 'screens/admin_settings/admin_settings_screen.dart';
import 'screens/admin_settings/state/admin_settings_controller.dart';
import 'screens/compliance/compliance_screen.dart';
import 'screens/compliance/state/compliance_controller.dart';
import 'screens/help/help_screen.dart';
import 'screens/home/state/home_controller.dart';
import 'screens/home/wm_home_screen.dart';
import 'screens/inbox/inbox_screen.dart';
import 'screens/inbox/state/inbox_controller.dart';
import 'screens/leave_apply/leave_apply_screen.dart';
import 'screens/leave_apply/state/leave_apply_controller.dart';
import 'screens/leave_balance/leave_balance_screen.dart';
import 'screens/leave_balance/state/leave_balance_controller.dart';
import 'screens/my/my_screen.dart';
import 'screens/my/state/my_controller.dart';
import 'screens/notice/notice_screen.dart';
import 'screens/notice/state/notice_controller.dart';
import 'screens/notifications/notifications_screen.dart';
import 'screens/notifications/state/notifications_controller.dart';
import 'screens/owner_billing/owner_billing_screen.dart';
import 'screens/owner_billing/state/owner_billing_controller.dart';
import 'screens/settings/settings_screen.dart';
import 'screens/settings/state/settings_controller.dart';
import 'screens/team/state/team_controller.dart';
import 'screens/team/team_screen.dart';
import 'screens/trip/state/trip_controller.dart';
import 'screens/trip/trip_screen.dart';
import 'theme/tokens.g.dart';

/// 5-tab shell: Home / Inbox / LeaveBalance / Settings / 더보기.
///
/// Owns all controllers + WsClient lifecycle so [_BootState]
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

  // Core
  late final WsClient _ws;
  late final HomeController _home;
  late final InboxController _inbox;
  late final LeaveBalanceController _balance;
  late final SettingsController _settings;

  // More-tab screens (employee / OWNER)
  late final TeamController _team;
  late final NoticeController _notice;
  late final ComplianceController _compliance;
  late final TripController _trip;
  late final NotificationsController _notifications;
  late final MyController _my;

  // ADMIN-only controllers (null for non-admin)
  AdminDashboardController? _adminDash;
  InboxController? _adminInbox;
  AdminEmployeesController? _adminEmps;
  AdminSettingsController? _adminSettings;

  // OWNER-only controllers (null for non-owner)
  OwnerBillingController? _ownerBilling;

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
    _team = TeamController(dio: widget.dio);
    _notice = NoticeController(dio: widget.dio);
    _compliance = ComplianceController(dio: widget.dio);
    _trip = TripController(dio: widget.dio);
    _notifications = NotificationsController(dio: widget.dio);
    _my = MyController(dio: widget.dio);

    if (widget.role == 'ADMIN') {
      _adminDash = AdminDashboardController(dio: widget.dio);
      _adminInbox = InboxController(dio: widget.dio, role: 'ADMIN');
      _adminEmps = AdminEmployeesController(dio: widget.dio);
      _adminSettings = AdminSettingsController(dio: widget.dio);
    }

    if (widget.role == 'OWNER') {
      _ownerBilling = OwnerBillingController(dio: widget.dio);
    }
  }

  @override
  void dispose() {
    _home.dispose();
    _inbox.dispose();
    _balance.dispose();
    _settings.dispose();
    _team.dispose();
    _notice.dispose();
    _compliance.dispose();
    _trip.dispose();
    _notifications.dispose();
    _my.dispose();
    _adminDash?.dispose();
    _adminInbox?.dispose();
    _adminEmps?.dispose();
    _adminSettings?.dispose();
    _ownerBilling?.dispose();
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

  List<({IconData icon, String label, VoidCallback onTap})> _moreTiles() {
    final tiles = <({IconData icon, String label, VoidCallback onTap})>[
      (
        icon: Icons.group_outlined,
        label: '팀',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => TeamScreen(controller: _team),
          ),
        ),
      ),
      (
        icon: Icons.campaign_outlined,
        label: '공지',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => NoticeScreen(
              controller: _notice,
              onOpenWebView: widget.onOpenWebView,
            ),
          ),
        ),
      ),
      (
        icon: Icons.access_time_outlined,
        label: '52시간',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => ComplianceScreen(controller: _compliance),
          ),
        ),
      ),
      (
        icon: Icons.luggage_outlined,
        label: '출장',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => TripScreen(controller: _trip),
          ),
        ),
      ),
      (
        icon: Icons.help_outline,
        label: '도움말',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => HelpScreen(onOpenWebView: widget.onOpenWebView),
          ),
        ),
      ),
      (
        icon: Icons.notifications_outlined,
        label: '알림',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => NotificationsScreen(controller: _notifications),
          ),
        ),
      ),
      (
        icon: Icons.person_outlined,
        label: '내 정보',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => MyScreen(
              controller: _my,
              onOpenWebView: widget.onOpenWebView,
              onLogout: () async {
                await JwtStore().clear();
                if (mounted) {
                  await Navigator.of(context).pushAndRemoveUntil<void>(
                    MaterialPageRoute<void>(
                      builder: (_) => const _LoggedOutSplash(),
                    ),
                    (_) => false,
                  );
                }
              },
            ),
          ),
        ),
      ),
    ];

    // OWNER: append Billing tile
    if (widget.role == 'OWNER' && _ownerBilling != null) {
      tiles.add((
        icon: Icons.credit_card_outlined,
        label: '결제',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => OwnerBillingScreen(
              controller: _ownerBilling!,
              onOpenWebView: widget.onOpenWebView,
            ),
          ),
        ),
      ),);
    }

    return tiles;
  }

  @override
  Widget build(BuildContext context) {
    if (widget.role == 'ADMIN') return _adminShell();
    return _employeeShell();
  }

  // ---------------------------------------------------------------------------
  // Employee / MANAGER / OWNER shell — 5 tabs (홈/받은함/휴가/설정/더보기)
  // ---------------------------------------------------------------------------

  Widget _employeeShell() {
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
      _MoreScreen(tiles: _moreTiles()),
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
          NavigationDestination(
            icon: Icon(Icons.apps_outlined),
            selectedIcon: Icon(Icons.apps),
            label: '더보기',
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // ADMIN shell — 5 tabs: 대시보드 / 결재 / 직원 / 설정 / 더보기
  // ---------------------------------------------------------------------------

  Widget _adminShell() {
    final adminMoreTiles = <({IconData icon, String label, VoidCallback onTap})>[
      (
        icon: Icons.help_outline,
        label: '도움말',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => HelpScreen(onOpenWebView: widget.onOpenWebView),
          ),
        ),
      ),
      (
        icon: Icons.notifications_outlined,
        label: '알림',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => NotificationsScreen(controller: _notifications),
          ),
        ),
      ),
      (
        icon: Icons.person_outlined,
        label: '내 정보',
        onTap: () => Navigator.of(context).push<void>(
          MaterialPageRoute<void>(
            builder: (_) => MyScreen(
              controller: _my,
              onOpenWebView: widget.onOpenWebView,
              onLogout: () async {
                await JwtStore().clear();
                if (mounted) {
                  await Navigator.of(context).pushAndRemoveUntil<void>(
                    MaterialPageRoute<void>(
                      builder: (_) => const _LoggedOutSplash(),
                    ),
                    (_) => false,
                  );
                }
              },
            ),
          ),
        ),
      ),
    ];

    final pages = <Widget>[
      AdminDashboardScreen(controller: _adminDash!),
      AdminApprovalsScreen(
        controller: _adminInbox!,
        onOpenItem: (item) =>
            widget.onOpenWebView('/admin/approval-detail?id=${item.id}'),
      ),
      AdminEmployeesScreen(
        controller: _adminEmps!,
        onOpenWebView: widget.onOpenWebView,
      ),
      AdminSettingsScreen(
        controller: _adminSettings!,
        onOpenWebView: widget.onOpenWebView,
      ),
      _MoreScreen(tiles: adminMoreTiles),
    ];

    return Scaffold(
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        backgroundColor: WMTokens.white,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: '대시보드',
          ),
          NavigationDestination(
            icon: Icon(Icons.pending_actions_outlined),
            selectedIcon: Icon(Icons.pending_actions),
            label: '결재',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outline),
            selectedIcon: Icon(Icons.people),
            label: '직원',
          ),
          NavigationDestination(
            icon: Icon(Icons.business_outlined),
            selectedIcon: Icon(Icons.business),
            label: '설정',
          ),
          NavigationDestination(
            icon: Icon(Icons.apps_outlined),
            selectedIcon: Icon(Icons.apps),
            label: '더보기',
          ),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// MoreScreen — 3-column grid of 7 destination cards
// ---------------------------------------------------------------------------

class _MoreScreen extends StatelessWidget {
  const _MoreScreen({required this.tiles});

  final List<({IconData icon, String label, VoidCallback onTap})> tiles;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text(
          '더보기',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: GridView.count(
        crossAxisCount: 3,
        padding: const EdgeInsets.all(12),
        children: tiles
            .map(
              (t) => InkWell(
                onTap: t.onTap,
                borderRadius: BorderRadius.circular(WMTokens.rMd),
                child: Container(
                  margin: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: WMTokens.white,
                    borderRadius: BorderRadius.circular(WMTokens.rMd),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(t.icon, size: 32, color: WMTokens.blue500),
                      const SizedBox(height: 8),
                      Text(
                        t.label,
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// LoggedOutSplash — minimal placeholder shown after logout
// ---------------------------------------------------------------------------

class _LoggedOutSplash extends StatelessWidget {
  const _LoggedOutSplash();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.check_circle_outline,
              size: 64,
              color: WMTokens.blue500,
            ),
            const SizedBox(height: 16),
            const Text(
              '로그아웃되었습니다',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: WMTokens.grey900,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                backgroundColor: WMTokens.blue500,
                foregroundColor: WMTokens.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(WMTokens.rMd),
                ),
              ),
              child: const Text(
                '앱 재시작',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
