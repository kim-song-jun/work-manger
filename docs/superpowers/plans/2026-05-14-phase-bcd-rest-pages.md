# Phase B/C/D 잔여 페이지 Implementation Plan (Plan-G)

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** ADR-007 Phase B (직원 잔여) + Phase C (어드민) + Phase D (오너) 핵심 페이지 Flutter native 구현. 트래픽 낮은 페이지 (예: m-record-detail, admin-audit 등 detail/log) 는 WebView fallback 유지하되 native 진입점 (탭/링크) 은 제공.

**Architecture:** 각 페이지 = 단일 `lib/screens/<page>/` (controller.dart + screen.dart + 1 smoke test). 패턴 일관 — Plan-F 와 동일 (ChangeNotifier + Scaffold + RefreshIndicator + 토큰 사용). AppShell 확장 — Drawer 또는 BottomSheet 로 4 탭 외 페이지 접근.

**Pages covered (native):**

**Phase B 직원 핵심 (7):**
- m-team → TeamScreen (`GET /v1/team`)
- m-notice → NoticeScreen (`GET /v1/notices`)
- m-compliance → ComplianceScreen (`GET /v1/compliance/week`)
- m-trip → TripScreen (`GET /v1/trips`)
- m-help → HelpScreen (static FAQ)
- m-notifications → NotificationsScreen (`GET /v1/notifications`)
- m-my → MyScreen (`GET /v1/me` + sub menu)

**Phase C 어드민 핵심 (4):**
- admin-dashboard → AdminDashboardScreen (`GET /v1/admin/dashboard`)
- admin-approvals → AdminApprovalsScreen (재사용 InboxController role='ADMIN')
- admin-employees → AdminEmployeesScreen (`GET /v1/admin/employees`)
- admin-settings → AdminSettingsScreen (`GET /v1/admin/settings`)

**Phase D 오너 (1):**
- owner-billing → OwnerBillingScreen (`GET /v1/billing/invoices` 등)

**Out of scope (WebView fallback 유지):**
- m-customize, m-overtime, m-weekly-report, m-record-detail, m-loc-picker, m-error-gps, m-empty-noti, m-leave-expiry, m-inbox-quick, m-leave-success, m-compliance-block, m-profile-full, m-approval-detail
- admin-audit, admin-reports, admin-compliance, admin-codes, admin-employee-detail, admin-expiring-leave

이유: 사용 빈도 낮음 (detail/log pages) 또는 복잡한 form (overtime, customize) — Phase A 가치 검증 후 별도 plan.

**Plan-J (WebView 셸 제거):** 잔여 페이지가 모두 native 화 된 이후. 본 plan 종료 시점은 WebView shell 여전히 유지 (m-* / admin-* / owner-* 미해당 경로).

**Tech Stack:** 동일 — Flutter 3.24, dio, ChangeNotifier, WMTokens, MaterialApp.

**Related:** ADR-007 / [Plan-F](2026-05-14-phase-a-rest-and-navigator.md)

---

## 통일 패턴 (모든 페이지 공통)

각 페이지는 3-file 구조:
```
lib/screens/<page>/
├── state/<page>_controller.dart   # ChangeNotifier + load()
└── <page>_screen.dart             # Scaffold
test/screens/<page>/<page>_screen_test.dart   # 1 smoke
```

Controller boilerplate:
```dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

class <Page>Controller extends ChangeNotifier {
  <Page>Controller({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;

  Future<void> load() async {
    loading = true; error = null; notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('<endpoint>');
      items = List<Map<String, dynamic>>.from((r.data?['data'] as List?) ?? const []);
    } on DioException catch (e) {
      error = e.message ?? 'load failed';
    } finally {
      loading = false; notifyListeners();
    }
  }
}
```

Screen boilerplate:
```dart
import 'package:flutter/material.dart';
import '../../theme/tokens.g.dart';
import 'state/<page>_controller.dart';

class <Page>Screen extends StatefulWidget {
  const <Page>Screen({super.key, required this.controller, this.onOpenWebView});
  final <Page>Controller controller;
  final void Function(String path)? onOpenWebView;

  @override
  State<<Page>Screen> createState() => _<Page>ScreenState();
}

class _<Page>ScreenState extends State<<Page>Screen> {
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
      appBar: AppBar(title: const Text('<title>', style: TextStyle(fontWeight: FontWeight.w700)), backgroundColor: WMTokens.white, elevation: 0),
      body: RefreshIndicator(
        onRefresh: c.load,
        child: c.items.isEmpty && !c.loading
            ? const Center(child: Text('비어있습니다.'))
            : ListView.builder(
                itemCount: c.items.length,
                itemBuilder: (_, i) => _tile(c.items[i]),
              ),
      ),
    );
  }

  Widget _tile(Map<String, dynamic> it) => ListTile(
    tileColor: WMTokens.white,
    title: Text((it['title'] ?? '') as String),
    subtitle: Text((it['subtitle'] ?? '') as String, style: TextStyle(color: WMTokens.grey600)),
  );
}
```

각 페이지는 이 boilerplate 를 변형 (필드명, 표시 row, action).

---

## Task 1: Phase B 직원 3 페이지 (Team / Notice / Compliance)

For each page (Team, Notice, Compliance):
- Create the 3 files using the boilerplate above
- Adapt the controller `dio.get` URL per the page list
- Adapt the screen tile / list rendering
- 1 smoke widget test
- Single batched commit per page

### Step 1.1: Team

- Endpoint: `GET /v1/team` (verify path; could be `/v1/teams` or under `/v1/admin/team`)
- Page title: `팀`
- Tile: avatar (Icons.person) + name + status (`출근` / `재택` / `휴가` etc.)
- Commit: `feat(mobile): TeamScreen native (직원 팀 status list)`

### Step 1.2: Notice

- Endpoint: `GET /v1/notices`
- Page title: `공지`
- Tile: title + date + body excerpt; tap → onOpenWebView('/m/notice/<id>')
- Commit: `feat(mobile): NoticeScreen native (회사 공지 list)`

### Step 1.3: Compliance

- Endpoint: `GET /v1/compliance/week`
- Page title: `52시간`
- Body: progress bar (used / 52h) + warning banner if > 40h
- Commit: `feat(mobile): ComplianceScreen native (52h weekly tracker)`

---

## Task 2: Phase B 직원 4 페이지 (Trip / Help / Notifications / My)

### Step 2.1: Trip

- Endpoint: `GET /v1/trips`
- Page title: `출장`
- Tile: title + dates + status
- Commit: `feat(mobile): TripScreen native (출장 list)`

### Step 2.2: Help

- Static (no endpoint)
- Page title: `도움말`
- Sections: FAQ items (hard-coded ko/en), contact link → onOpenWebView('/m/help/contact')
- Commit: `feat(mobile): HelpScreen native (static FAQ + contact link)`

### Step 2.3: Notifications

- Endpoint: `GET /v1/notifications`
- Page title: `알림`
- Tile: title + body + ago + unread dot; tap → mark-read (`PATCH /v1/notifications/<id>/read`)
- Commit: `feat(mobile): NotificationsScreen native (push history + mark-read)`

### Step 2.4: My

- Endpoint: `GET /v1/me`
- Page title: `내 정보`
- Body: profile header (avatar/name/email) + sub-menu rows (프로필 / 비밀번호 / 2FA / 알림 / 로그아웃) → onOpenWebView for most, logout dialog
- Commit: `feat(mobile): MyScreen native (profile header + account submenu)`

---

## Task 3: AppShell 확장 (Drawer 또는 More 탭)

**Files:**
- Modify: `apps/mobile/lib/app_shell.dart`

추가 7 페이지 (Team / Notice / Compliance / Trip / Help / Notifications / My) 의 진입점이 필요. 옵션:

- **Option A:** Drawer (햄버거 메뉴). `Scaffold.drawer` 에 9 항목 ListView.
- **Option B:** "More" 탭 = 5번째 NavigationBar destination, push 시 grid 형태로 7 페이지 진입.
- **Option C:** Home 화면에서 "더보기" 카드.

권장 **Option B** — More 탭 (5번째 tab, GridView 페이지). Material 3 NavigationBar는 5 destination 까지 정상 동작.

### Step 3.1: Modify AppShell

Add a 5th destination "더보기" with icon `Icons.apps_outlined`. Add a `MoreScreen` widget that renders a 3x3 GridView with 7 destinations:

```dart
class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key, required this.onOpen, required this.onOpenWebView});
  final void Function(Widget screen) onOpen;
  final void Function(String path) onOpenWebView;

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.group_outlined, '팀', () => onOpen(TeamScreen(controller: ...))),
      (Icons.campaign_outlined, '공지', () => onOpen(NoticeScreen(controller: ...))),
      (Icons.shield_outlined, '52시간', () => onOpen(ComplianceScreen(controller: ...))),
      (Icons.flight_takeoff_outlined, '출장', () => onOpen(TripScreen(controller: ...))),
      (Icons.notifications_outlined, '알림', () => onOpen(NotificationsScreen(controller: ...))),
      (Icons.help_outline, '도움말', () => onOpen(HelpScreen())),
      (Icons.person_outline, '내 정보', () => onOpen(MyScreen(controller: ...))),
    ];
    return Scaffold(
      appBar: AppBar(title: const Text('더보기'), backgroundColor: WMTokens.white, elevation: 0),
      body: GridView.count(
        crossAxisCount: 3,
        padding: const EdgeInsets.all(16),
        children: items.map((t) => InkWell(
          onTap: t.$3,
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: WMTokens.white, borderRadius: BorderRadius.circular(WMTokens.rMd)),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [Icon(t.$1, size: 32, color: WMTokens.blue500), const SizedBox(height: 8), Text(t.$2)],
            ),
          ),
        )).toList(),
      ),
    );
  }
}
```

`onOpen(Widget)` callback in MoreScreen pushes the supplied screen via Navigator on AppShell's NavigatorState.

AppShell holds controllers for MoreScreen's 5 dynamic pages (Team/Notice/Compliance/Trip/Notifications/My) — lazy-create on first open OR construct eagerly with the other 4.

### Step 3.2: Verify + commit

```bash
cd apps/mobile && flutter analyze lib/app_shell.dart lib/screens/ && cd ../..
git add apps/mobile/lib/app_shell.dart
git commit -m "feat(mobile): AppShell add More tab (Team/Notice/Compliance/Trip/Help/Notifications/My)"
```

---

## Task 4: Phase C 어드민 4 페이지

### Step 4.1: AdminDashboardScreen

- Endpoint: `GET /v1/admin/dashboard`
- Body: KPI cards (전체 직원, 오늘 출근, 대기 결재, 52h 초과)
- Commit: `feat(mobile): AdminDashboardScreen native (KPI cards)`

### Step 4.2: AdminApprovalsScreen

- Reuse `InboxController` with `role='ADMIN'` (already supports role param)
- Page title: `결재 대기`
- Commit: `feat(mobile): AdminApprovalsScreen native (reuse InboxController role=ADMIN)`

### Step 4.3: AdminEmployeesScreen

- Endpoint: `GET /v1/admin/employees`
- Body: search bar + filterable list (name / role / status)
- Tap → onOpenWebView('/admin/employees/<id>') (detail is WebView fallback)
- Commit: `feat(mobile): AdminEmployeesScreen native (search + list)`

### Step 4.4: AdminSettingsScreen

- Endpoint: `GET /v1/admin/settings`
- Body: company name / fiscal year / brand color preview / logo (read-only — edit via WebView)
- Commit: `feat(mobile): AdminSettingsScreen native (read-only summary)`

---

## Task 5: Phase D 오너 (OwnerBillingScreen)

- Endpoint: `GET /v1/billing/invoices` + `GET /v1/billing/subscription`
- Body: current plan card + invoices list + "Stripe Portal 열기" button → onOpenWebView('/owner/billing/portal')
- Commit: `feat(mobile): OwnerBillingScreen native (plan + invoices + portal link)`

---

## Task 6: Role-based shell routing + admin/owner entries

**Files:**
- Modify: `apps/mobile/lib/app_shell.dart`
- Modify: `apps/mobile/lib/main.dart` (maybe — pass role to AppShell)

If user role is ADMIN: replace AppShell tabs with admin shell (Dashboard / Approvals / Employees / 더보기). If OWNER: include billing access via 더보기 grid.

Simplest pattern: keep 5-tab base, swap "Home" with "Dashboard" if ADMIN, add "Billing" to More grid if OWNER.

### Step 6.1: Branch in AppShell

```dart
@override
Widget build(BuildContext context) {
  if (widget.role == 'ADMIN' || widget.role == 'OWNER') {
    return _adminShell();
  }
  return _employeeShell();
}
```

### Step 6.2: Commit

```bash
git commit -m "feat(mobile): role-based AppShell branch (EMPLOYEE/MANAGER vs ADMIN/OWNER)"
```

---

## Task 7: Backlog/spec stamp

In `docs/tasks/backlog.md` after the existing B-NAT-05 block, add:

```markdown
### B-NAT-06 · Phase A 잔여 + Phase B/C/D 핵심 페이지 native ✅ 완료 (2026-05-14, Plan-F + Plan-G)

* Plan-F (W4-5 잔여): Inbox / LeaveApply / LeaveBalance / Settings + AppShell 4-tab
* Plan-G (Phase B/C/D): Team / Notice / Compliance / Trip / Help / Notifications / My + 어드민 4 페이지 + 오너 billing + role-based shell

잔여 (WebView fallback 유지):
* m-customize, m-overtime, m-weekly-report, m-record-detail, m-loc-picker, m-error-gps, m-empty-noti, m-leave-expiry, m-inbox-quick, m-leave-success, m-compliance-block, m-profile-full, m-approval-detail
* admin-audit, admin-reports, admin-compliance, admin-codes, admin-employee-detail, admin-expiring-leave

이유: detail/log/edit-form 페이지로 사용 빈도 낮음. ADR-007 Phase A 가치 검증 후 Plan-H 에서 처리.

후속:
* Plan-H: 잔여 19 페이지 native (트래픽 측정 결과 따라 우선순위)
* Plan-J: WebView 셸 제거 (모든 페이지 native 후)
```

Spec 변경 이력에 동일 추가.

Commit: `docs(backlog,spec): mark B-NAT-06 complete (Plan-F + Plan-G 14 페이지 native)`

---

## Self-Review

**Spec coverage (Plan-G):**
- ✅ Phase B 직원 7 페이지 (Tasks 1, 2) — Team / Notice / Compliance / Trip / Help / Notifications / My
- ✅ Phase C 어드민 4 페이지 (Task 4)
- ✅ Phase D 오너 1 페이지 (Task 5)
- ✅ AppShell 5-tab + role branch (Tasks 3, 6)
- ✅ docs stamp (Task 7)

**Not covered (Plan-H):**
- 19 페이지 잔여 (detail / log / edit form 영역)

**Out of scope:**
- 페이지별 Sentry transaction wrap (Plan-A KPI 패턴 — 추후)
- Golden test for every new screen (Plan-A KPI 패턴 — Plan-J)
- Real-device integration test
- WebView 셸 제거 (Plan-J)
- 페이지별 i18n parity (current code uses Korean inline — 다음 단계에서 ARB 키 추출)

**Placeholder scan:** none.

**Type consistency:** All controllers extend ChangeNotifier with `dio` field; all screens accept controller + optional onOpenWebView. AppShell uses Navigator key for cross-tab pushes.
