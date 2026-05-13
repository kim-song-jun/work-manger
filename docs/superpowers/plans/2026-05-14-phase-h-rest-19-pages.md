# Plan-H — 잔여 19 페이지 native + WebView 셸 제거 준비

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** Plan-F/G 가 핵심 16 페이지를 native 화. 본 plan 은 나머지 19 페이지 (detail / log / edit form / static / chart / map) 를 simple native widget 으로 구현. 모든 페이지 native 화 후 WebView 셸 진입점 제거 (Plan-J 일부 선행).

**Architecture:** Plan-G 의 boilerplate 패턴 (ChangeNotifier + Scaffold + AppBar) 그대로. 각 페이지 단일 file controller + screen. List/Detail/Form/Static 4 카테고리.

**Pages (19):**

| 카테고리 | 페이지 | 패턴 |
|---|---|---|
| List (7) | m-leave-expiry, m-inbox-quick, admin-audit, admin-reports, admin-compliance, admin-codes, admin-expiring-leave | RefreshIndicator + ListView |
| Detail (3) | m-record-detail, m-approval-detail, admin-employee-detail | Scaffold + read view + action buttons |
| Form (3) | m-customize, m-overtime, m-profile-full | TextField/Switch/Chip + submit |
| Static (4) | m-error-gps, m-empty-noti, m-leave-success, m-compliance-block | 단일 message + CTA |
| Chart (1) | m-weekly-report | bar chart placeholder (가벼운 LinearProgressIndicator) |
| Map (1) | m-loc-picker | OpenStreetMap placeholder 또는 WebView fallback (네이티브 맵 plugin 별도) |

**Tech Stack:** Plan-F/G 와 동일. `fl_chart` 또는 stub for weekly report. Map 은 WebView fallback OK (m-loc-picker 만).

**Related:** [Plan-F](2026-05-14-phase-a-rest-and-navigator.md) / [Plan-G](2026-05-14-phase-bcd-rest-pages.md)

---

## Boilerplate references

**List pattern** (e.g., admin-audit, admin-reports):
```dart
class <Name>Controller extends ChangeNotifier {
  <Name>Controller({required this.dio});
  final Dio dio;
  List<Map<String, dynamic>> items = [];
  String? error;
  bool loading = false;
  Future<void> load() async {
    loading = true; error = null; notifyListeners();
    try {
      final r = await dio.get<Map<String, dynamic>>('<endpoint>');
      items = List<Map<String, dynamic>>.from((r.data?['data'] as List?) ?? []);
    } on DioException catch (e) { error = e.message; }
    finally { loading = false; notifyListeners(); }
  }
}
```

**Detail pattern**: similar but `data: Map<String, dynamic>?` instead of `items`.

**Form pattern**: TextEditingControllers + `submit()` method + DioException error handling.

**Static pattern**: stateless widget, no controller.

---

## Task 1: List pages (7) — m-leave-expiry, m-inbox-quick, admin-audit, admin-reports, admin-compliance, admin-codes, admin-expiring-leave

### Endpoints
- m-leave-expiry: `GET /v1/leave/expiring` (verify)
- m-inbox-quick: `GET /v1/inbox?quick=true` or new endpoint
- admin-audit: `GET /v1/admin/audit` or `/v1/audit`
- admin-reports: `GET /v1/admin/reports`
- admin-compliance: `GET /v1/admin/compliance/week` or `/v1/compliance/team`
- admin-codes: `GET /v1/admin/company-codes`
- admin-expiring-leave: `GET /v1/admin/leave/expiring`

For each: create `lib/screens/<page>/{state/<page>_controller.dart, <page>_screen.dart}` + smoke test + commit.

Per-page customization is minimal — just the title and tile rendering:

| Page | Title | Tile shows |
|---|---|---|
| m-leave-expiry | 만료 임박 휴가 | type + expire_date + remaining |
| m-inbox-quick | 빠른 받은함 | summary |
| admin-audit | 감사 로그 | action + actor + at |
| admin-reports | 리포트 | name + period |
| admin-compliance | 52시간 (팀) | name + used + remaining |
| admin-codes | 회사 코드 | code + status + expires |
| admin-expiring-leave | 만료 임박 (팀) | name + type + days |

Each gets a 1-line `feat(mobile): <Page>Screen native (list)` commit.

## Task 2: Detail pages (3) — m-record-detail, m-approval-detail, admin-employee-detail

### Pattern
- Detail screen accepts an `id` parameter via constructor.
- Loads `GET /v1/<resource>/<id>`.
- Shows the resource in a 2-column key-value layout + bottom action buttons (Approve/Reject, etc.).

### Endpoints
- m-record-detail: `GET /v1/attendance/records/<id>`
- m-approval-detail: `GET /v1/approvals/<id>` + `POST /v1/approvals/<id>/decide` (action: APPROVE/REJECT)
- admin-employee-detail: `GET /v1/admin/employees/<id>`

Commit per page.

## Task 3: Form pages (3) — m-customize, m-overtime, m-profile-full

### Pattern
- Form widget with TextField/Switch/Chip groups.
- Submit calls POST/PATCH endpoint.
- On success: pop or show snackbar.

### Endpoints
- m-customize: `PATCH /v1/me/preferences`
- m-overtime: `POST /v1/overtime/requests`
- m-profile-full: `PATCH /v1/me/profile`

Commit per page.

## Task 4: Static pages (4) — m-error-gps, m-empty-noti, m-leave-success, m-compliance-block

### Pattern
- Stateless widget.
- Centered icon + message + CTA button.

Examples:
- m-error-gps: warning icon + "GPS 권한이 필요합니다" + "설정 열기" button
- m-empty-noti: bell-off icon + "알림이 없습니다"
- m-leave-success: check icon + "신청이 완료되었습니다" + "확인" button (pops)
- m-compliance-block: shield icon + "이번 주 52시간을 초과했습니다" + "관리자에게 문의" button

Commit per page.

## Task 5: Chart + Map (2) — m-weekly-report, m-loc-picker

### m-weekly-report
- Endpoint: `GET /v1/reports/weekly?week=...`
- Body: 7-day bar chart (use `Container` height-scaled by minutes / day, since `fl_chart` adds a heavy dep — keep simple). Each bar = day, height = work hours / 8 * max-height.
- Commit: `feat(mobile): WeeklyReportScreen native (7-day mini bar chart)`

### m-loc-picker
- Map UI requires google_maps_flutter or openstreetmap_widget — heavy plugins.
- For PoC: WebView fallback. The screen is just `Scaffold(body: WebViewHost(url: '$baseUrl/m/loc-picker'))` with native AppBar.
- Commit: `feat(mobile): LocPickerScreen WebView fallback (native AppBar shell)`

## Task 6: Wire entry points

### AppShell More grid
The existing 더보기 tab in AppShell shows 7 items (Plan-G Task 3). Add the new screens that are most-used from the 19:

Append to `_moreTiles()`:
- 주간 리포트 → push WeeklyReportScreen
- 연장 신청 → push OvertimeScreen
- 프로필 (full) → push ProfileFullScreen
- 화면 꾸미기 → push CustomizeScreen
- 만료 임박 → push LeaveExpiryScreen
- 빠른 받은함 → push InboxQuickScreen
- 감사 로그 (admin only) → push AdminAuditScreen
- 리포트 (admin only) → push AdminReportsScreen
- 회사 코드 (admin only) → push AdminCodesScreen
- 만료 휴가 (admin only) → push AdminExpiringLeaveScreen
- 52시간 (팀) (admin only) → push AdminComplianceScreen

Modify `lib/app_shell.dart`: extend `_moreTiles()` with role-aware additions. Use `if (widget.role == 'ADMIN') tiles.add(...)` style.

### Detail screens
These are pushed from list screens via `onTap`:
- m-record-detail: from m-leave or attendance history (existing list)
- m-approval-detail: from InboxScreen (Plan-F) — already routes to WebView; change to `Navigator.push(ApprovalDetailScreen(id: ...))`
- admin-employee-detail: from AdminEmployeesScreen — replace `onOpenWebView` with `Navigator.push`

Update those 3 callers.

### Static screens
- m-error-gps: pushed by bridge / geolocator handler in main.dart on permission error (PoC: just register the screen, don't auto-trigger)
- m-empty-noti: integrated into NotificationsScreen empty state (already covered)
- m-leave-success: pushed by LeaveApplyScreen onDone (replace current pop-and-balance-reload with push success → on confirm pop both)
- m-compliance-block: pushed by HomeController on clock-in 403 (PoC: just register; wiring in Plan-J)

For PoC, the static screens are just made available — the trigger wiring can be partial.

Commit: `feat(mobile): wire 19 native screens into AppShell More + caller updates`

## Task 7: Backlog + spec stamp + roadmap

### docs/tasks/backlog.md
After existing B-NAT-06:

```markdown
### B-NAT-07 · 잔여 19 페이지 native ✅ 완료 (2026-05-14, Plan-H)

* 19 페이지 (list 7 / detail 3 / form 3 / static 4 / chart 1 / map 1)
* m-loc-picker 만 WebView fallback (네이티브 맵 plugin 보류)

총 native 페이지: 35 페이지 (16 Plan-F/G + 19 Plan-H), Plan-A 의 토글 (`use_native_home`)
true 상태 사용자는 모든 핵심 페이지를 native 로 사용.

후속:
* Plan-J: WebView 셸 progressive removal (PoC 베타 14일 KPI 통과 후)
* Plan-K (옵션): 네이티브 맵 plugin 도입 (loc-picker 진짜 native)
```

### docs/superpowers/specs/...design.md
Add row to 변경 이력:

```markdown
| 2026-05-14 | @sungjun + Claude | Plan-H 완료. 잔여 19 페이지 native (list/detail/form/static/chart). m-loc-picker 만 WebView fallback. AppShell More grid 확장 + caller updates (Inbox→ApprovalDetail, AdminEmployees→AdminEmployeeDetail, LeaveApply→LeaveSuccess). 총 35 페이지 native. |
```

Commit: `docs(backlog,spec): Plan-H complete — 19 잔여 페이지 native + WebView 잔존은 loc-picker만`

---

## Self-Review

**Spec coverage (Plan-H):**
- ✅ List 7 (Task 1)
- ✅ Detail 3 (Task 2)
- ✅ Form 3 (Task 3)
- ✅ Static 4 (Task 4)
- ✅ Chart + Map 2 (Task 5)
- ✅ AppShell More + caller updates (Task 6)
- ✅ docs (Task 7)

**Out of scope:**
- 실제 네이티브 맵 (`google_maps_flutter` / OSM plugin) — Plan-K
- Plan-J: WebView 셸 진입점 완전 제거 (베타 KPI 통과 후 운영 결정)
- 페이지별 i18n ARB 키 추출 (현재 inline Korean — Phase A 검증 후 정리)
- Golden tests for new 19 screens (Plan-A KPI 패턴 — 회귀 위험 시 추가)
- 페이지별 Sentry transaction
- Integration test 확대

**Placeholder scan:** Static + chart 페이지는 사용 빈도 낮음. PoC scope에 simple stub OK.

**Type consistency:** 모든 controller `Dio dio` 필드, ChangeNotifier 상속. 모든 screen `controller: <T>Controller` parameter.
