# Phase A 잔여 + Navigator Implementation Plan (Plan-F)

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** ADR-007 Phase A 5 페이지 중 Home (Plan-C 완료) 외 잔여 4 페이지 (Inbox / LeaveApply / LeaveBalance / Settings) Flutter native 구현 + 5 페이지 통합 Navigator (Bottom Nav + 페이지 간 push) + 각 페이지 진입점 라우팅. Phase B/C/D 는 별도 plan (Plan-G 등).

**Architecture:** 4 페이지 = 4 신규 `lib/screens/<page>/` 디렉토리. 각 페이지: state (ChangeNotifier) + screen (Scaffold) + widgets (필요 시 단일 partial). `main.dart` `_Boot` 가 native 분기 시 `MaterialApp(routes:{...})` 또는 `Navigator` push 패턴 사용. Bottom Nav 5 탭 (Home/Inbox/Leave/Settings/More) — Home, Inbox, Leave, Settings 네이티브, "More" 는 WebView fallback (Notice/Trip/Compliance/...).

**Tech Stack:** Flutter 3.24, dio 5.x, sentry_flutter 8.x, 생성된 dart-dio openapi/* (Plan-E). State 는 ChangeNotifier 일관.

**Related:** ADR-007 / [spec](../specs/2026-05-13-home-native-poc-design.md) / [Plan-C Home](2026-05-13-home-native-poc-w4-w5-flutter-home.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `apps/mobile/lib/screens/inbox/state/inbox_controller.dart` | ChangeNotifier + GET /v1/inbox?role=... | New |
| `apps/mobile/lib/screens/inbox/inbox_screen.dart` | Scaffold + tab (manager 4 tabs / employee 1 tab) + list | New |
| `apps/mobile/lib/screens/inbox/widgets/inbox_item_tile.dart` | reusable list tile | New |
| `apps/mobile/lib/screens/leave_apply/state/leave_apply_controller.dart` | form state + POST /v1/leave/requests | New |
| `apps/mobile/lib/screens/leave_apply/leave_apply_screen.dart` | form: type / dates / reason / submit | New |
| `apps/mobile/lib/screens/leave_balance/state/leave_balance_controller.dart` | GET /v1/leave/balance | New |
| `apps/mobile/lib/screens/leave_balance/leave_balance_screen.dart` | ANNUAL / COMP buckets + recent requests | New |
| `apps/mobile/lib/screens/settings/state/settings_controller.dart` | GET/PATCH /v1/me/settings (extends Plan-A) | New |
| `apps/mobile/lib/screens/settings/settings_screen.dart` | use_native_home toggle + locale + 2FA link (WebView) | New |
| `apps/mobile/lib/app_shell.dart` | BottomNavigationBar 5-tab shell (Home/Inbox/Leave/Settings/More) | New |
| `apps/mobile/lib/main.dart` | use AppShell instead of bare WMHomeScreen on native branch | Modify |
| `apps/mobile/test/screens/inbox/inbox_screen_test.dart` | smoke | New |
| `apps/mobile/test/screens/leave_apply/leave_apply_screen_test.dart` | smoke | New |
| `apps/mobile/test/screens/leave_balance/leave_balance_screen_test.dart` | smoke | New |
| `apps/mobile/test/screens/settings/settings_screen_test.dart` | smoke | New |

---

## Task 1: Inbox screen (manager + employee)

**Files:**
- New: `apps/mobile/lib/screens/inbox/state/inbox_controller.dart`
- New: `apps/mobile/lib/screens/inbox/inbox_screen.dart`
- New: `apps/mobile/lib/screens/inbox/widgets/inbox_item_tile.dart`
- New: `apps/mobile/test/screens/inbox/inbox_screen_test.dart`

### Step 1.1: Verify endpoint

```bash
grep -rn "inbox\|approvals\|pending" services/api/apps/approval/views.py services/api/apps/approval/urls.py | head -10
```

Identify the manager inbox endpoint (likely `GET /v1/approvals?status=PENDING` or `/v1/inbox?role=manager`). Use it.

### Step 1.2: Controller

Create `inbox_controller.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../../observability/sentry.dart';

class InboxItem {
  InboxItem({required this.id, required this.kind, required this.title, required this.subtitle, required this.status, required this.requestedAt});
  final String id;
  final String kind; // LEAVE | OVERTIME | TRIP | NOTICE
  final String title;
  final String subtitle;
  final String status; // PENDING | APPROVED | REJECTED
  final DateTime requestedAt;

  static InboxItem fromJson(Map<String, dynamic> m) => InboxItem(
    id: m['id'] as String,
    kind: (m['kind'] as String?) ?? 'NOTICE',
    title: (m['title'] as String?) ?? '',
    subtitle: (m['subtitle'] as String?) ?? '',
    status: (m['status'] as String?) ?? 'PENDING',
    requestedAt: DateTime.tryParse((m['requested_at'] as String?) ?? '') ?? DateTime.now(),
  );
}

class InboxController extends ChangeNotifier {
  InboxController({required this.dio, required this.role});

  final Dio dio;
  final String role; // 'EMPLOYEE' | 'MANAGER' | 'ADMIN' | 'OWNER'
  List<InboxItem> items = [];
  String? error;
  bool loading = false;
  String tabKind = 'ALL'; // ALL | LEAVE | OVERTIME | TRIP

  Future<void> load() => wrapTransaction('inbox.load', 'http.client', () async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/approvals', queryParameters: {
        if (tabKind != 'ALL') 'kind': tabKind,
      });
      final raw = (r.data?['data'] as List?) ?? const [];
      items = raw.map((e) => InboxItem.fromJson(e as Map<String, dynamic>)).toList();
    } on DioException catch (e) {
      error = e.message ?? 'inbox load failed';
    } finally {
      loading = false;
      notifyListeners();
    }
  });

  void setTab(String kind) {
    tabKind = kind;
    load();
  }
}
```

### Step 1.3: Item tile

Create `widgets/inbox_item_tile.dart`:

```dart
import 'package:flutter/material.dart';

import '../../../theme/tokens.g.dart';
import '../state/inbox_controller.dart';

class InboxItemTile extends StatelessWidget {
  const InboxItemTile({super.key, required this.item, required this.onTap});

  final InboxItem item;
  final VoidCallback onTap;

  static const _kindLabels = {
    'LEAVE': '휴가',
    'OVERTIME': '연장',
    'TRIP': '출장',
    'NOTICE': '공지',
  };

  @override
  Widget build(BuildContext context) {
    final kindLabel = _kindLabels[item.kind] ?? item.kind;
    final statusColor = item.status == 'APPROVED'
        ? WMTokens.success
        : item.status == 'REJECTED'
            ? WMTokens.danger
            : WMTokens.blue500;

    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: WMTokens.grey200, width: 0.5)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: WMTokens.grey100,
                borderRadius: BorderRadius.circular(WMTokens.rSm),
              ),
              child: Text(kindLabel, style: TextStyle(fontSize: 11, color: WMTokens.grey700)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(item.title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: WMTokens.grey900)),
                  const SizedBox(height: 2),
                  Text(item.subtitle, style: TextStyle(fontSize: 12, color: WMTokens.grey600), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Container(width: 6, height: 6, decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle)),
          ],
        ),
      ),
    );
  }
}
```

### Step 1.4: Screen

Create `inbox_screen.dart`:

```dart
import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/inbox_controller.dart';
import 'widgets/inbox_item_tile.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key, required this.controller, required this.onOpenItem});
  final InboxController controller;
  final void Function(InboxItem) onOpenItem;

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  static const _tabs = [
    ('ALL', '전체'),
    ('LEAVE', '휴가'),
    ('OVERTIME', '연장'),
    ('TRIP', '출장'),
  ];

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    widget.controller.load();
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    super.dispose();
  }

  void _on() => mounted ? setState(() {}) : null;

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('받은 함', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          if (c.role == 'MANAGER' || c.role == 'ADMIN' || c.role == 'OWNER') _tabBar(),
          if (c.loading && c.items.isEmpty) const LinearProgressIndicator(minHeight: 2),
          if (c.error != null) _errorBanner(c.error!),
          Expanded(
            child: RefreshIndicator(
              onRefresh: c.load,
              child: c.items.isEmpty && !c.loading
                  ? _empty()
                  : ListView.builder(
                      itemCount: c.items.length,
                      itemBuilder: (_, i) => InboxItemTile(item: c.items[i], onTap: () => widget.onOpenItem(c.items[i])),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabBar() {
    return Container(
      height: 44,
      color: WMTokens.white,
      child: Row(
        children: _tabs.map((t) {
          final selected = widget.controller.tabKind == t.$1;
          return Expanded(
            child: InkWell(
              onTap: () => widget.controller.setTab(t.$1),
              child: Center(
                child: Text(
                  t.$2,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w400,
                    color: selected ? WMTokens.blue500 : WMTokens.grey600,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _errorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: WMTokens.dangerSoft, borderRadius: BorderRadius.circular(WMTokens.rMd)),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: WMTokens.danger, size: 18),
          const SizedBox(width: 8),
          Expanded(child: Text(msg, style: TextStyle(color: WMTokens.danger, fontSize: 13))),
        ],
      ),
    );
  }

  Widget _empty() {
    return ListView(
      children: [
        const SizedBox(height: 80),
        Icon(Icons.inbox_outlined, size: 64, color: WMTokens.grey400),
        const SizedBox(height: 12),
        Center(child: Text('받은 함이 비어있습니다.', style: TextStyle(color: WMTokens.grey600, fontSize: 14))),
      ],
    );
  }
}
```

### Step 1.5: Widget test (smoke)

Create `apps/mobile/test/screens/inbox/inbox_screen_test.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/inbox/inbox_screen.dart';
import 'package:work_manager_mobile/screens/inbox/state/inbox_controller.dart';

Dio _stub({required List<Map<String, dynamic>> items}) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
    h.resolve(Response(data: {'data': items}, requestOptions: o, statusCode: 200));
  }));
  return dio;
}

void main() {
  testWidgets('Inbox renders empty state', (tester) async {
    final c = InboxController(dio: _stub(items: []), role: 'EMPLOYEE');
    await tester.pumpWidget(MaterialApp(home: InboxScreen(controller: c, onOpenItem: (_) {})));
    await tester.pumpAndSettle();
    expect(find.text('받은 함이 비어있습니다.'), findsOneWidget);
  });

  testWidgets('Inbox renders 2 items for MANAGER with tabs', (tester) async {
    final c = InboxController(
      dio: _stub(items: [
        {'id': '1', 'kind': 'LEAVE', 'title': '연차 신청', 'subtitle': '김민수 · 2025-12-24', 'status': 'PENDING'},
        {'id': '2', 'kind': 'OVERTIME', 'title': '연장 신청', 'subtitle': '이지은 · 2025-12-23', 'status': 'PENDING'},
      ]),
      role: 'MANAGER',
    );
    await tester.pumpWidget(MaterialApp(home: InboxScreen(controller: c, onOpenItem: (_) {})));
    await tester.pumpAndSettle();
    expect(find.text('연차 신청'), findsOneWidget);
    expect(find.text('연장 신청'), findsOneWidget);
    expect(find.text('전체'), findsOneWidget); // tab visible
  });
}
```

### Step 1.6: Verify + Commit

```bash
cd apps/mobile && flutter analyze lib/screens/inbox/ test/screens/inbox/ && flutter test test/screens/inbox/ && cd ../..
git add apps/mobile/lib/screens/inbox apps/mobile/test/screens/inbox
git commit -m "feat(mobile): InboxScreen native (manager tabs + employee single-list)"
```

---

## Task 2: LeaveApply screen (form + native date picker)

**Files:**
- New: `apps/mobile/lib/screens/leave_apply/state/leave_apply_controller.dart`
- New: `apps/mobile/lib/screens/leave_apply/leave_apply_screen.dart`
- New: `apps/mobile/test/screens/leave_apply/leave_apply_screen_test.dart`

### Step 2.1: Controller

```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LeaveApplyController extends ChangeNotifier {
  LeaveApplyController({required this.dio});
  final Dio dio;

  String leaveType = 'ANNUAL'; // ANNUAL | COMP | SICK | UNPAID
  DateTime? from;
  DateTime? to;
  String reason = '';
  bool submitting = false;
  String? error;
  bool success = false;

  void setLeaveType(String t) { leaveType = t; notifyListeners(); }
  void setFrom(DateTime d) { from = d; if (to != null && to!.isBefore(d)) to = d; notifyListeners(); }
  void setTo(DateTime d) { to = d; notifyListeners(); }
  void setReason(String r) { reason = r; notifyListeners(); }

  bool get canSubmit => from != null && to != null && !submitting;

  Future<void> submit() async {
    if (!canSubmit) return;
    submitting = true;
    error = null;
    notifyListeners();
    try {
      await dio.post('/v1/leave/requests', data: {
        'leave_type': leaveType,
        'from': from!.toIso8601String().substring(0, 10),
        'to': to!.toIso8601String().substring(0, 10),
        'reason': reason,
      });
      success = true;
    } on DioException catch (e) {
      error = e.response?.data?.toString() ?? e.message ?? 'submit failed';
    } finally {
      submitting = false;
      notifyListeners();
    }
  }
}
```

### Step 2.2: Screen

```dart
import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/leave_apply_controller.dart';

class LeaveApplyScreen extends StatefulWidget {
  const LeaveApplyScreen({super.key, required this.controller, required this.onDone});
  final LeaveApplyController controller;
  final VoidCallback onDone;

  @override
  State<LeaveApplyScreen> createState() => _LeaveApplyScreenState();
}

class _LeaveApplyScreenState extends State<LeaveApplyScreen> {
  final _reasonCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_on);
    _reasonCtrl.addListener(() => widget.controller.setReason(_reasonCtrl.text));
  }

  @override
  void dispose() {
    widget.controller.removeListener(_on);
    _reasonCtrl.dispose();
    super.dispose();
  }

  void _on() {
    if (!mounted) return;
    if (widget.controller.success) widget.onDone();
    setState(() {});
  }

  Future<void> _pickFrom() async {
    final d = await showDatePicker(
      context: context,
      initialDate: widget.controller.from ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) widget.controller.setFrom(d);
  }

  Future<void> _pickTo() async {
    final d = await showDatePicker(
      context: context,
      initialDate: widget.controller.to ?? widget.controller.from ?? DateTime.now(),
      firstDate: widget.controller.from ?? DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (d != null) widget.controller.setTo(d);
  }

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('휴가 신청', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _section('유형'),
          Wrap(
            spacing: 8,
            children: [
              ('ANNUAL', '연차'),
              ('COMP', '보상'),
              ('SICK', '병가'),
              ('UNPAID', '무급'),
            ].map((t) {
              final selected = c.leaveType == t.$1;
              return ChoiceChip(
                label: Text(t.$2),
                selected: selected,
                onSelected: (_) => c.setLeaveType(t.$1),
                selectedColor: WMTokens.blue500.withValues(alpha: 0.15),
                labelStyle: TextStyle(color: selected ? WMTokens.blue500 : WMTokens.grey700),
              );
            }).toList(),
          ),
          const SizedBox(height: 20),
          _section('기간'),
          _dateRow('시작', c.from, _pickFrom),
          const SizedBox(height: 8),
          _dateRow('종료', c.to, _pickTo),
          const SizedBox(height: 20),
          _section('사유 (선택)'),
          TextField(
            controller: _reasonCtrl,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: '사유 입력',
              filled: true,
              fillColor: WMTokens.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(WMTokens.rMd),
                borderSide: BorderSide(color: WMTokens.grey200),
              ),
            ),
          ),
          if (c.error != null) ...[
            const SizedBox(height: 16),
            Text(c.error!, style: TextStyle(color: WMTokens.danger, fontSize: 13)),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: c.canSubmit ? c.submit : null,
            style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
            child: Text(c.submitting ? '제출 중...' : '제출'),
          ),
        ],
      ),
    );
  }

  Widget _section(String s) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(s, style: TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey900)),
  );

  Widget _dateRow(String label, DateTime? d, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: WMTokens.white,
          borderRadius: BorderRadius.circular(WMTokens.rMd),
          border: Border.all(color: WMTokens.grey200),
        ),
        child: Row(
          children: [
            Text(label, style: TextStyle(color: WMTokens.grey600)),
            const Spacer(),
            Text(
              d != null ? '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}' : '선택',
              style: TextStyle(color: d != null ? WMTokens.grey900 : WMTokens.grey500, fontWeight: FontWeight.w600),
            ),
            const SizedBox(width: 8),
            Icon(Icons.calendar_today_outlined, size: 16, color: WMTokens.grey500),
          ],
        ),
      ),
    );
  }
}
```

### Step 2.3: Test smoke

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_apply/leave_apply_screen.dart';
import 'package:work_manager_mobile/screens/leave_apply/state/leave_apply_controller.dart';

void main() {
  testWidgets('LeaveApply renders form with type chips + date fields + submit', (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    final c = LeaveApplyController(dio: dio);
    await tester.pumpWidget(MaterialApp(home: LeaveApplyScreen(controller: c, onDone: () {})));
    await tester.pumpAndSettle();
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('보상'), findsOneWidget);
    expect(find.text('시작'), findsOneWidget);
    expect(find.text('종료'), findsOneWidget);
    expect(find.text('제출'), findsOneWidget);
  });
}
```

### Step 2.4: Verify + commit

```bash
cd apps/mobile && flutter analyze lib/screens/leave_apply/ test/screens/leave_apply/ && flutter test test/screens/leave_apply/ && cd ../..
git add apps/mobile/lib/screens/leave_apply apps/mobile/test/screens/leave_apply
git commit -m "feat(mobile): LeaveApplyScreen native (type chips + native date picker + form)"
```

---

## Task 3: LeaveBalance screen (ANNUAL/COMP buckets + recent)

**Files:**
- New: `apps/mobile/lib/screens/leave_balance/state/leave_balance_controller.dart`
- New: `apps/mobile/lib/screens/leave_balance/leave_balance_screen.dart`
- New: `apps/mobile/test/screens/leave_balance/leave_balance_screen_test.dart`

### Step 3.1: Controller

```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class LeaveBalance {
  LeaveBalance({required this.annual, required this.comp, required this.recent});
  final Map<String, num> annual; // {total, used, remaining}
  final Map<String, num> comp;
  final List<Map<String, dynamic>> recent;
}

class LeaveBalanceController extends ChangeNotifier {
  LeaveBalanceController({required this.dio});
  final Dio dio;
  LeaveBalance? data;
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true; error = null; notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/leave/balance');
      final d = (r.data?['data'] as Map<String, dynamic>?) ?? {};
      data = LeaveBalance(
        annual: Map<String, num>.from((d['annual'] as Map?) ?? {'total': 0, 'used': 0, 'remaining': 0}),
        comp: Map<String, num>.from((d['comp'] as Map?) ?? {'total': 0, 'used': 0, 'remaining': 0}),
        recent: List<Map<String, dynamic>>.from((d['recent'] as List?) ?? const []),
      );
    } on DioException catch (e) {
      error = e.message ?? 'balance load failed';
    } finally {
      loading = false; notifyListeners();
    }
  }
}
```

### Step 3.2: Screen

```dart
import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/leave_balance_controller.dart';

class LeaveBalanceScreen extends StatefulWidget {
  const LeaveBalanceScreen({super.key, required this.controller, required this.onApply});
  final LeaveBalanceController controller;
  final VoidCallback onApply;

  @override
  State<LeaveBalanceScreen> createState() => _LeaveBalanceScreenState();
}

class _LeaveBalanceScreenState extends State<LeaveBalanceScreen> {
  @override
  void initState() { super.initState(); widget.controller.addListener(_on); widget.controller.load(); }
  @override
  void dispose() { widget.controller.removeListener(_on); super.dispose(); }
  void _on() => mounted ? setState(() {}) : null;

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    final d = c.data;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('휴가 잔여', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
        actions: [
          TextButton(onPressed: widget.onApply, child: const Text('신청')),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (c.loading && d == null) const LinearProgressIndicator(minHeight: 2),
            if (d != null) ...[
              _bucket('연차', d.annual),
              const SizedBox(height: 12),
              _bucket('보상', d.comp),
              const SizedBox(height: 24),
              Text('최근 신청', style: TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey900)),
              const SizedBox(height: 8),
              ...d.recent.map((r) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: WMTokens.white, borderRadius: BorderRadius.circular(WMTokens.rMd)),
                child: Row(
                  children: [
                    Expanded(child: Text('${r['type'] ?? ''} · ${r['from'] ?? ''} ~ ${r['to'] ?? ''}', style: TextStyle(color: WMTokens.grey900))),
                    Text(r['status']?.toString() ?? '', style: TextStyle(color: WMTokens.grey600, fontSize: 12)),
                  ],
                ),
              )),
            ],
            if (c.error != null) Padding(padding: const EdgeInsets.only(top: 16), child: Text(c.error!, style: TextStyle(color: WMTokens.danger))),
          ],
        ),
      ),
    );
  }

  Widget _bucket(String label, Map<String, num> b) {
    final total = b['total'] ?? 0;
    final used = b['used'] ?? 0;
    final remaining = b['remaining'] ?? 0;
    final progress = total > 0 ? (used / total).toDouble().clamp(0.0, 1.0) : 0.0;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: WMTokens.white, borderRadius: BorderRadius.circular(WMTokens.rMd)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text(label, style: TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey900)),
            const Spacer(),
            Text('$remaining / $total일', style: TextStyle(color: WMTokens.grey900, fontWeight: FontWeight.w600)),
          ]),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(value: progress, minHeight: 4, backgroundColor: WMTokens.grey200, valueColor: AlwaysStoppedAnimation(WMTokens.blue500)),
          ),
          const SizedBox(height: 6),
          Text('사용 $used일', style: TextStyle(color: WMTokens.grey600, fontSize: 12)),
        ],
      ),
    );
  }
}
```

### Step 3.3: Test smoke

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/leave_balance/leave_balance_screen.dart';
import 'package:work_manager_mobile/screens/leave_balance/state/leave_balance_controller.dart';

Dio _stub(Map<String, dynamic> payload) {
  final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
  dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
    h.resolve(Response(data: {'data': payload}, requestOptions: o, statusCode: 200));
  }));
  return dio;
}

void main() {
  testWidgets('LeaveBalance renders annual + comp buckets', (tester) async {
    final c = LeaveBalanceController(dio: _stub({
      'annual': {'total': 15, 'used': 5, 'remaining': 10},
      'comp': {'total': 3, 'used': 1, 'remaining': 2},
      'recent': [
        {'type': 'ANNUAL', 'from': '2025-12-24', 'to': '2025-12-26', 'status': 'APPROVED'},
      ],
    }));
    await tester.pumpWidget(MaterialApp(home: LeaveBalanceScreen(controller: c, onApply: () {})));
    await tester.pumpAndSettle();
    expect(find.text('연차'), findsOneWidget);
    expect(find.text('보상'), findsOneWidget);
    expect(find.text('10 / 15일'), findsOneWidget);
    expect(find.text('2 / 3일'), findsOneWidget);
  });
}
```

### Step 3.4: Verify + commit

```bash
cd apps/mobile && flutter analyze lib/screens/leave_balance/ test/screens/leave_balance/ && flutter test test/screens/leave_balance/ && cd ../..
git add apps/mobile/lib/screens/leave_balance apps/mobile/test/screens/leave_balance
git commit -m "feat(mobile): LeaveBalanceScreen native (ANNUAL/COMP buckets + recent list)"
```

---

## Task 4: Settings screen

**Files:**
- New: `apps/mobile/lib/screens/settings/state/settings_controller.dart`
- New: `apps/mobile/lib/screens/settings/settings_screen.dart`
- New: `apps/mobile/test/screens/settings/settings_screen_test.dart`

### Step 4.1: Controller

```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class SettingsController extends ChangeNotifier {
  SettingsController({required this.dio});
  final Dio dio;
  bool useNativeHome = false;
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true; error = null; notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('/v1/me/settings');
      useNativeHome = ((r.data?['data'] as Map?)?['use_native_home'] as bool?) ?? false;
    } on DioException catch (e) {
      error = e.message;
    } finally {
      loading = false; notifyListeners();
    }
  }

  Future<void> toggleUseNativeHome(bool v) async {
    final prev = useNativeHome;
    useNativeHome = v; notifyListeners();
    try {
      await dio.patch('/v1/me/settings', data: {'use_native_home': v});
    } on DioException catch (e) {
      useNativeHome = prev;
      error = e.message;
      notifyListeners();
    }
  }
}
```

### Step 4.2: Screen

```dart
import 'package:flutter/material.dart';

import '../../theme/tokens.g.dart';
import 'state/settings_controller.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.controller, required this.onOpenWebView});
  final SettingsController controller;
  final void Function(String path) onOpenWebView;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  void initState() { super.initState(); widget.controller.addListener(_on); widget.controller.load(); }
  @override
  void dispose() { widget.controller.removeListener(_on); super.dispose(); }
  void _on() => mounted ? setState(() {}) : null;

  @override
  Widget build(BuildContext context) {
    final c = widget.controller;
    return Scaffold(
      backgroundColor: WMTokens.grey50,
      appBar: AppBar(
        title: const Text('설정', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: WMTokens.white,
        elevation: 0,
      ),
      body: ListView(
        children: [
          const SizedBox(height: 8),
          _section('일반'),
          SwitchListTile(
            tileColor: WMTokens.white,
            title: const Text('네이티브 홈 사용'),
            subtitle: Text('WebView 대신 Flutter native 홈 사용', style: TextStyle(color: WMTokens.grey600, fontSize: 12)),
            value: c.useNativeHome,
            onChanged: c.loading ? null : c.toggleUseNativeHome,
          ),
          _section('계정'),
          ListTile(tileColor: WMTokens.white, title: const Text('프로필'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/profile-full')),
          ListTile(tileColor: WMTokens.white, title: const Text('2단계 인증'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/settings/2fa')),
          ListTile(tileColor: WMTokens.white, title: const Text('비밀번호 변경'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/settings/password')),
          _section('기타'),
          ListTile(tileColor: WMTokens.white, title: const Text('알림 설정'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/notifications')),
          ListTile(tileColor: WMTokens.white, title: const Text('화면 꾸미기'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/customize')),
          ListTile(tileColor: WMTokens.white, title: const Text('도움말'), trailing: const Icon(Icons.chevron_right), onTap: () => widget.onOpenWebView('/m/help')),
          if (c.error != null) Padding(padding: const EdgeInsets.all(16), child: Text(c.error!, style: TextStyle(color: WMTokens.danger))),
        ],
      ),
    );
  }

  Widget _section(String s) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
    child: Text(s, style: TextStyle(fontWeight: FontWeight.w700, color: WMTokens.grey600, fontSize: 12)),
  );
}
```

### Step 4.3: Test smoke

```dart
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:work_manager_mobile/screens/settings/settings_screen.dart';
import 'package:work_manager_mobile/screens/settings/state/settings_controller.dart';

void main() {
  testWidgets('Settings renders sections + native home switch', (tester) async {
    final dio = Dio(BaseOptions(baseUrl: 'http://stub'));
    dio.interceptors.add(InterceptorsWrapper(onRequest: (o, h) {
      h.resolve(Response(data: {'data': {'use_native_home': true}}, requestOptions: o, statusCode: 200));
    }));
    final c = SettingsController(dio: dio);
    await tester.pumpWidget(MaterialApp(home: SettingsScreen(controller: c, onOpenWebView: (_) {})));
    await tester.pumpAndSettle();
    expect(find.text('네이티브 홈 사용'), findsOneWidget);
    expect(find.text('프로필'), findsOneWidget);
    expect(find.text('2단계 인증'), findsOneWidget);
    expect(find.byType(Switch), findsOneWidget);
  });
}
```

### Step 4.4: Verify + commit

```bash
cd apps/mobile && flutter analyze lib/screens/settings/ test/screens/settings/ && flutter test test/screens/settings/ && cd ../..
git add apps/mobile/lib/screens/settings apps/mobile/test/screens/settings
git commit -m "feat(mobile): SettingsScreen native (use_native_home toggle + account/etc list)"
```

---

## Task 5: AppShell + main.dart Navigator wire

**Files:**
- New: `apps/mobile/lib/app_shell.dart`
- Modify: `apps/mobile/lib/main.dart`

### Step 5.1: AppShell

Create `apps/mobile/lib/app_shell.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

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

class AppShell extends StatefulWidget {
  const AppShell({
    super.key,
    required this.dio,
    required this.wsClient,
    required this.role,
    required this.onOpenWebView,
    required this.onClockIn,
  });

  final Dio dio;
  final WsClient wsClient;
  final String role;
  final void Function(String path) onOpenWebView;
  final VoidCallback onClockIn;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _tab = 0;
  late final HomeController _home;
  late final InboxController _inbox;
  late final LeaveBalanceController _balance;
  late final SettingsController _settings;

  @override
  void initState() {
    super.initState();
    _home = HomeController(dio: widget.dio, wsClient: widget.wsClient);
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
    super.dispose();
  }

  void _openLeaveApply() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) {
      final c = LeaveApplyController(dio: widget.dio);
      return LeaveApplyScreen(
        controller: c,
        onDone: () { Navigator.of(context).pop(); _balance.load(); },
      );
    }));
  }

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      WMHomeScreen(controller: _home, onClockIn: widget.onClockIn, onOpenWebView: widget.onOpenWebView),
      InboxScreen(controller: _inbox, onOpenItem: (item) => widget.onOpenWebView('/m/approval-detail?id=${item.id}')),
      LeaveBalanceScreen(controller: _balance, onApply: _openLeaveApply),
      SettingsScreen(controller: _settings, onOpenWebView: widget.onOpenWebView),
    ];

    return Scaffold(
      body: IndexedStack(index: _tab, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (i) => setState(() => _tab = i),
        backgroundColor: WMTokens.white,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: '홈'),
          NavigationDestination(icon: Icon(Icons.inbox_outlined), selectedIcon: Icon(Icons.inbox), label: '받은함'),
          NavigationDestination(icon: Icon(Icons.beach_access_outlined), selectedIcon: Icon(Icons.beach_access), label: '휴가'),
          NavigationDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: '설정'),
        ],
      ),
    );
  }
}
```

### Step 5.2: Modify main.dart

In `apps/mobile/lib/main.dart`, find the section in `_BootState.build()` that constructs `WMHomeScreen(...)` (the native branch). Replace it with `AppShell(...)`:

```dart
// Before:
home: WMHomeScreen(
  controller: _homeController!,
  onClockIn: () => _homeController!.clockIn(),
  onOpenWebView: (path) {...},
),

// After:
home: AppShell(
  dio: _dio!,
  wsClient: _ws!,
  role: _role ?? 'EMPLOYEE',
  onClockIn: () => _homeController!.clockIn(),
  onOpenWebView: (path) {
    _navKey.currentState?.push(MaterialPageRoute(
      builder: (_) => WebViewHost(url: '$_baseUrl$path'),
    ));
  },
),
```

**Note on role:** `_role` is needed for Inbox tab visibility. Fetch from `GET /v1/me` during `_resolve()`:

```dart
final me = await _dio!.get<Map<String, dynamic>>('/v1/me');
_role = (me.data?['data']?['role'] as String?) ?? 'EMPLOYEE';
```

If `_homeController` was previously instantiated in `_BootState` for direct access, AppShell now owns its own copy — remove the field from `_BootState` to avoid double-instances. If `onClockIn` needs to use AppShell's home controller, expose it via a callback (or restructure — Plan-G).

Alternative simpler refactor: keep `_homeController` in `_BootState` BUT pass it to AppShell so AppShell uses the same instance. Update AppShell to accept an optional `homeController` parameter.

### Step 5.3: Verify + commit

```bash
cd apps/mobile && flutter analyze lib/app_shell.dart lib/main.dart && cd ../..
git add apps/mobile/lib/app_shell.dart apps/mobile/lib/main.dart
git commit -m "feat(mobile): AppShell with 4-tab NavigationBar (Home/Inbox/Leave/Settings)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Inbox native (Task 1)
- ✅ LeaveApply native (Task 2)
- ✅ LeaveBalance native (Task 3)
- ✅ Settings native (Task 4)
- ✅ Navigator integration (Task 5)

**Phase A 완료 후 잔여 페이지 (Plan-G/H 별도):**

Phase B (직원 잔여): Team / Notice / Compliance / Trip / Help / Notifications / Profile / Customize / Overtime / WeeklyReport / RecordDetail / LocPicker / ErrorGps / EmptyNoti / ApprovalDetail / LeaveExpiry / InboxQuick / LeaveSuccess / ComplianceBlock / ProfileFull

Phase C (어드민): Dashboard / Employees / Approvals / Audit / Settings / Reports / Compliance / Codes / EmployeeDetail / ExpiringLeave

Phase D (오너): Billing

Phase E: WebView 셸 제거 (모든 페이지 native 이후)

**Out of scope:**
- 페이지별 Sentry transaction wrapping (Plan-G)
- Integration test + golden test for new screens (Plan-G)
- 페이지 deep linking (Plan-G)
- IndexedStack vs Navigator nested routing — IndexedStack 으로 시작 (간단), Navigator nested 는 후속

**Placeholder scan:** Task 5 `_role` 처리 — `_BootState._resolve()` 에서 `GET /v1/me` 추가 필요. fall back 은 'EMPLOYEE'.

**Type consistency:** `Dio` / `WsClient` / role string — 모든 controller 시그니처 일치.
