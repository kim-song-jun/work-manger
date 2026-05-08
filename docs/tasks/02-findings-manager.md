---
persona: manager
agent: qa-manager
generated: 2026-05-08
task_n: 2
---

# qa-manager findings (Wave 2 audit)

## Coverage matrix

| 시나리오 | Web Mobile (`/m/*`) | Web Desktop (`/web/*`) | Electron | Android |
|---|---|---|---|---|
| 팀 캘린더 | `/m/team` (Grid/Grouped/Timeline) | `/web/team-calendar` (matrix) | same SPA shell | same SPA shell |
| 승인 inbox | `/m/inbox`, `/m/inbox/quick`, `/m/inbox/:id` | `/web/inbox` | same SPA shell | same SPA shell |
| 팀 연차 충돌 | N/A (no `/m/` equivalent) | `/web/team-leave` | same SPA shell | same SPA shell |
| 팀 컴플라이언스 | `/m/compliance` (자기 자신만) | N/A (team-scope 없음) | same SPA shell | same SPA shell |
| 관리자 라우트 차단 | `/admin/*` → AdminRoute guard | `/admin/*` → AdminRoute guard | same SPA shell | same SPA shell |
| i18n 정합성 | ko + en 모두 확인됨 | ko + en 모두 확인됨 | same | same |
| iter11 회귀 (GAP-B) | BE shape mismatch — partial | BE shape mismatch — partial | same | same |

---

## Findings

### F-MANAGER-01
**Severity**: P1
**Title**: self-approve 차단 미구현 — leave/attendance submit 시 manager == requester 인 경우 자기 승인 가능
**Area**: BE `services/api/apps/leave/services.py:232`, `services/api/apps/attendance/views.py:71`

**Description**:
`leave.services.submit_request()` 에서 `approver = membership.manager or membership` 로 폴백한다. manager 가 null 인 경우 **자기 자신이 approver** 로 설정된다. `attendance.views._pick_approver()` 도 동일 — 폴백이 `admin or membership` 이고 admin 이 없으면 self-approve 가 된다.

`approval/views.py` 의 `_ensure_approver()` 는 `IsApprover(membership)` 만 체크하므로, requester == approver 인 경우 403 을 돌려주지 않는다. spec 에서 "본인이 신청자일 때는 self-approve 차단 검증" 을 명시했으므로 P1 이다.

attendance 쪽 주석 `# fallback: self-approve (single-user dev case)` 는 dev 케이스 한정임을 명시하고 있으나, production 경로에서도 해당 브랜치가 실행될 수 있다.

**재현**: manager 가 지정되지 않은 membership 으로 `/v1/leave/requests` POST → 생성된 ApprovalTask 의 approver_id == requester_id → 동일 membership 으로 `/v1/inbox/{id}/approve` POST → 200 반환.

**Fix**: `IsApprover` 와 `_ensure_approver` 에 `IsSelfApprove` 스펙을 추가하거나, `submit_request` / `_pick_approver` 에서 manager == membership 일 때 상위 ADMIN/OWNER 로 에스컬레이션. 최소 규칙: approver != requester 강제.

---

### F-MANAGER-02
**Severity**: P1
**Title**: `/m/compliance` 및 `/web` 에 팀 단위 컴플라이언스 뷰 없음 — 매니저가 자기 팀의 52h 초과를 확인할 방법이 없음
**Area**: `apps/web/src/pages/m-compliance/index.tsx`, `services/api/apps/compliance/views.py`

**Description**:
`/m/compliance` 는 `fetchMyCompliance()` → `/v1/compliance/me` 만 호출, 로그인한 본인의 주간 시간만 표시한다. `/web/*` 에도 팀 단위 컴플라이언스 페이지가 없다 (admin-compliance 는 `/admin/compliance` 로 ADMIN/OWNER 전용).

BE `compliance/views.py` 의 `admin_company_compliance` 는 `HasRole.at_least("ADMIN")` 으로 잠겨 있어 MANAGER 가 호출하면 403 이다.

MANAGER persona 시나리오 "팀 컴플라이언스 — 주 52h 초과 알림 (자기 팀만)" 이 프론트 및 백엔드 둘 다 미구현이다.

**Fix**: `/v1/compliance/team?week=` 엔드포인트 추가 (MANAGER 이상 권한, membership.department 필터), 프론트 `/web/compliance` 또는 WebShell 내 탭 추가.

---

### F-MANAGER-03
**Severity**: P1
**Title**: 팀 캘린더 BE — 전사 데이터 누출 (팀 멤버십 필터 없음)
**Area**: `services/api/apps/team/views.py` (모든 뷰: `status_grid`, `status_grouped`, `status_timeline`, `calendar_matrix`)

**Description**:
모든 팀 상태 엔드포인트가 `Membership.objects.filter(company_id=company_id, is_active=True)` 로 **회사 전체** 멤버를 반환한다. MANAGER 용 팀 필터링(`membership.department` 또는 `membership.direct_reports`) 이 없다.

`leave/views.py:team_calendar()` 는 `services.list_team_calendar(..., department=department)` 로 department 필터를 적용하므로 `/web/team-leave` 는 (부서 기준으로) 부분 격리되지만, `/v1/team/status/*` 와 `/v1/team/calendar/matrix` 는 격리 없이 전사 공개다.

ADR-004(Postgres single-DB multi-tenant deferred) 에서 테넌트 격리는 deferred 로 결정됐으나, "자기 팀만" 이라는 MANAGER 권한 경계는 ADR-004 와 별개 요건이다.

**Fix**: team 뷰에 `?scope=team` 파라미터 추가 또는 MANAGER 역할 감지 시 department 자동 필터 적용.

---

### F-MANAGER-04
**Severity**: P1
**Title**: `WebInboxPage` 의 "전사" 스코프 — MANAGER 가 전사 데이터 접근 가능
**Area**: `apps/web/src/pages/web-inbox/index.tsx:42-45`

**Description**:
```tsx
const isAdmin = useMemo(() => {
  const role = me.data?.memberships?.[0]?.role;
  return role === "ADMIN" || role === "OWNER";
}, [me.data]);
```
`isAdmin` 이 true 일 때만 "전사" 스코프 버튼이 노출된다. MANAGER 는 여기 포함되지 않으므로 프론트는 버튼을 숨긴다.

그러나 `fetchInbox({ scope: "company" })` 는 `q.scope === "company"` 이면 `/v1/admin/approvals` 를 직접 호출한다. `/v1/admin/approvals` 의 BE 권한 체크는 `HasRole.at_least("ADMIN")` (admin_api/views.py:195) 이므로 MANAGER 가 직접 API 를 호출하면 403 이 반환된다.

프론트 UI 상으로는 버튼이 없지만, API 레벨에서 MANAGER → company scope 는 올바르게 403 이다. **P1 이유**: FE 코드 가독성 + 미래 안전성 — MANAGER 도 company 스코프에 접근이 안 됨을 FE 에서도 명시적으로 체크하지 않는다. 현재는 우연히 올바르게 작동하지만 이 암묵적 의존이 취약하다.

**Fix**: `isAdmin` 로직을 `role === "ADMIN" || role === "OWNER"` 로 유지하되, 주석으로 MANAGER 제외 의도를 명시. 또는 `scope === "company"` 호출 전 역할 재검사.

---

### F-MANAGER-05
**Severity**: P2
**Title**: `m-compliance` — 팀 단위 뷰가 없는 상태에서 MANAGER 에게 자기 시간만 보이는 UX 혼란
**Area**: `apps/web/src/pages/m-compliance/index.tsx`

**Description**:
F-MANAGER-02 의 파생 UX 문제. `/m/compliance` 가 MANAGER 에게도 `fetchMyCompliance()` 결과만 보여준다. 매니저가 본인 52h 가 OK 임을 확인해도 팀원의 OVER 상태를 알 방법이 없다. 화면 타이틀/설명 모두 개인 기준(`이번 주 누적 근무 시간을 확인하세요`) 이어서 팀 컨텍스트 힌트조차 없다.

**Fix**: F-MANAGER-02 팀 뷰 구현 완료 후 매니저 역할 감지 시 "팀 현황" 탭을 추가.

---

### F-MANAGER-06
**Severity**: P2
**Title**: iter11 GAP-B 잔여 — `InboxPage`(m-inbox) 탭 필터 로직이 BE shape 와 불일치
**Area**: `apps/web/src/pages/m-inbox/index.tsx:64-68`

**Description**:
iter11 에서 admin-approvals 페이지의 BE shape mismatch 를 수정했으나, m-inbox 의 탭 분기가 부분 레거시 상태이다.

```tsx
if (tab === "to-approve") return items.filter((i) => i.status === "PENDING");
if (tab === "mine") return items.filter((i) => i.status === "APPROVED" || i.role === "mine");
return items.filter((i) => i.status === "REJECTED" || i.role === "info");
```

BE `/v1/inbox` 는 `approver=membership` 으로 필터된 항목만 반환하므로 all-items 가 to-approve 뷰에 해당한다. "내 요청" 탭(`tab === "mine"`)은 `i.role === "mine"` 을 체크하지만 BE `InboxItemSerializer` 는 `role` 필드를 반환하지 않는다 (`InboxItem.role` 은 legacy/optional). 따라서 "내 요청" 탭은 **승인된 항목만** 보이고 승인 대기 중인 자기 요청이 누락된다.

BE `/v1/inbox` 는 "내가 approver 인 항목" 만 반환하므로 "내가 requester 인 항목" 을 보려면 별도 엔드포인트 또는 파라미터가 필요하다. 이 엔드포인트가 없다.

**Fix**: "내 요청" 탭은 `/v1/leave/requests`, `/v1/attendance/overtime-requests` 등 requester-perspective 엔드포인트를 호출하거나, BE `/v1/inbox` 에 `?role=mine` 파라미터 추가.

---

### F-MANAGER-07
**Severity**: P2
**Title**: `InboxQuickPage`(m-inbox-quick) — 필터 조건에 BE shape 불일치
**Area**: `apps/web/src/pages/m-inbox-quick/index.tsx:17`

**Description**:
```tsx
const items = (q.data?.items ?? []).filter((i) => i.status === "PENDING" || i.role === "approve");
```
BE 는 `role` 필드를 반환하지 않으므로 `i.role === "approve"` 조건은 항상 false 다. `status === "PENDING"` 만 동작한다. 로직상 결과는 동일하나(PENDING 인 항목만 표시), legacy 필드를 신뢰하는 코드가 남아 있어 향후 혼란 가능성이 있다. iter11 GAP-B 의 잔여 파편이다.

**Fix**: `i.role === "approve"` 조건 제거, `status === "PENDING"` 만 유지.

---

### F-MANAGER-08
**Severity**: P2
**Title**: `ApprovalDetailPage`(m-approval-detail) — `role === "approve"` 체크 → BE shape 불일치
**Area**: `apps/web/src/pages/m-approval-detail/index.tsx:64`

**Description**:
```tsx
{(item.role === "approve" || item.status === "PENDING") && (
  <InboxQuickActions itemId={item.id} size="md" />
)}
```
`item.role` 은 BE 에서 오지 않으므로 항상 undefined. `role === "approve"` 가 없으면 `status === "PENDING"` 만으로 동작한다. 실제 동작상 문제는 없으나 dead code 가 오해를 유발한다. iter11 GAP-B 잔여.

**Fix**: `item.role === "approve" ||` 조건 제거.

---

### F-MANAGER-09
**Severity**: P2
**Title**: `WebInboxPage` — detail pane 의 `canDecide` 에 `role === "approve"` 포함
**Area**: `apps/web/src/pages/web-inbox/index.tsx:355`

**Description**:
```tsx
const canDecide = (it.role === "approve" || it.status === "PENDING") && it.status === "PENDING";
```
`it.role === "approve"` 는 항상 false 이므로 조건은 `it.status === "PENDING"` 으로 단순화된다. Dead code + iter11 GAP-B 잔여.

**Fix**: `(it.role === "approve" || ...)` 부분 정리.

---

### F-MANAGER-10
**Severity**: P2
**Title**: leave self-approve fallback — manager 미배정 시 BE 가 requester = approver 로 ApprovalTask 생성
**Area**: `services/api/apps/leave/services.py:232`, `services/api/apps/attendance/views.py:71`

**Description**:
F-MANAGER-01 의 BE 구현 측면. `approval.views.approve()` 는 `IsApprover` 만 체크하므로 requester == approver 일 때 403 이 발생하지 않는다. 이 fallback 으로 생성된 ApprovalTask 는 requester 가 자신의 inbox 에서 직접 승인할 수 있다.

attendance 의 주석 `# fallback: self-approve (single-user dev case)` 는 production 에서도 실행 가능하다.

F-MANAGER-01 은 이를 spec 위반으로 보고했고, 이 항목은 구체적으로 두 파일에 동일 패턴이 중복됨을 강조하기 위해 별도로 기록.

---

### F-MANAGER-11
**Severity**: P3
**Title**: `WebInboxPage` — `ListRowContent` 에서 `it.reason` 직접 사용 (BE shape: reason 은 `summary.reason` 에 있음)
**Area**: `apps/web/src/pages/web-inbox/index.tsx:317-329`

**Description**:
```tsx
function ListRowContent({ it }: { it: InboxItem }) {
  ...
  {it.reason && (
    <div ...>{it.reason}</div>
  )}
}
```
BE `InboxItemSerializer` 는 `reason` 을 직접 반환하지 않는다. reason 은 `summary.reason` 에 중첩되어 있다 (leave/overtime/etc.). `InboxItem.reason` 은 optional legacy 필드이므로 BE shape 로는 항상 undefined. 리스트 행에서 reason 미리보기가 절대 표시되지 않는다.

`m-inbox/index.tsx` 의 `summaryReason()` 헬퍼는 이를 올바르게 처리하지만 `web-inbox` 에는 동일 패턴이 없다.

**Fix**: `ListRowContent` 에 `summaryReason()` 상당 로직 추가.

---

### F-MANAGER-12
**Severity**: P3
**Title**: 팀 캘린더 (`/web/team-calendar`) — 제목 키 오류 (`compliance.matrix_title` 사용)
**Area**: `apps/web/src/pages/web-team-calendar/index.tsx:64`

**Description**:
```tsx
<h1 className="text-[22px] font-bold m-0">{t("compliance.matrix_title")}</h1>
```
`compliance.matrix_title` 은 ko: `"팀 캘린더"` / en: `"Team calendar"` 로 현재 의미상 맞게 동작하지만, 키 네임스페이스가 잘못됐다. 팀 캘린더는 컴플라이언스와 무관한데 compliance 네임스페이스를 사용한다. 향후 compliance namespace 리팩토링 시 버그 유발 가능.

**Fix**: `team.calendar_title` 등 올바른 네임스페이스 키 사용.

---

### F-MANAGER-13
**Severity**: P3
**Title**: 팀 상태 `GroupedSlice` 에서 `groups` 가 아닌 `data.groups` 경로 미확인
**Area**: `apps/web/src/pages/m-team/slices/GroupedSlice.tsx`

**Description**:
BE `status_grouped` 뷰는 `{"data": {"date": "...", "groups": [...]}}` 형태로 반환한다. `fetchTeamGrouped()` 는 `api<Envelope<TeamGroup[]>>(path)` 로 호출하고 `r.data ?? fallback` 을 반환하는데, BE 응답의 `data` 키는 `TeamGroup[]` 이 아닌 `{ date, groups }` 객체다.

`fetchTeamStatus.ts:21` 에서 `safe<TeamGroup[]>("/v1/team/status/grouped", [])` 를 호출하나, BE 는 `{ date, groups }` 를 돌려주므로 `r.data` 는 배열이 아닌 객체가 된다. 타입 불일치가 존재하고 결과가 fallback 으로 떨어진다.

비교: `status_grid` 는 `{ date, items }` 를 반환하지만 `fetchTeamGrid()` 는 `TeamMember[]` 를 기대한다 — 동일 문제. `status_timeline` 도 `{ date, events }` 구조지만 FE 타입은 `TeamTimeline { rows, now_minute }` 를 기대한다.

결과: 세 슬라이스 모두 BE 데이터가 실제로 오면 빈 fallback 으로 렌더링되고 하드코딩 demo 데이터만 보인다.

**Fix**: FE 타입 & fetch 함수를 BE 실제 응답 구조(`{ date, items }`/`{ date, groups }`/`{ date, events }`)와 맞추거나 BE 응답을 flat 배열로 변경.

---

### F-MANAGER-14
**Severity**: P3
**Title**: `m-inbox` "내 요청" / "알림" 탭 — BE 에 대응 엔드포인트 없음
**Area**: `apps/web/src/pages/m-inbox/index.tsx:61`, `services/api/apps/approval/urls.py`

**Description**:
`m-inbox` 는 단일 `fetchInbox()` 호출로 모든 탭을 채운다. BE `/v1/inbox` 는 `approver=membership` 으로 필터된 항목만 반환한다. "내 요청(내가 신청한 항목)" 과 "알림(info 항목)" 을 얻기 위한 별도 엔드포인트가 없다. 따라서 "내 요청" 탭과 "알림" 탭은 빈 상태 또는 승인 완료된 항목만 보인다.

이는 F-MANAGER-06 의 원인 측 진술.

---

### F-MANAGER-15
**Severity**: P3
**Title**: `/web/team-calendar` — `fetchCalendarMatrix` shape 미스매치 (BE `rows` vs FE `CalendarMatrix.rows`)
**Area**: `apps/web/src/entities/team/api/fetchCalendarMatrix.ts`, `services/api/apps/team/views.py:254`

**Description**:
BE `calendar_matrix` 뷰는 `{ data: { from, to, rows, groups? }, meta: ... }` 를 반환한다. FE `fetchCalendarMatrix` 는 `api<Envelope<CalendarMatrix>>(...)` 로 호출하고 `r.data` 를 그대로 반환하므로 CalendarMatrix 타입 구조와 일치한다. 이 부분은 정상.

하지만 `CalendarMatrix.rows[i].days[j].status` 의 값이 `CalendarMatrixStatus` 타입 (`office | wfh | leave | break | off`) 이어야 하는데, FE에는 해당 타입 정의가 있으나 실제 `colorOf()` 의 `default` 케이스가 `var(--s-off)` 로 폴백한다. 즉 새로운 status 값이 BE 에서 추가되면 색상이 잘못 표시된다. 낮은 우선순위 주의 항목.

---

## Summary

| 항목 | 개수 |
|---|---|
| 총 findings | 15 |
| P0 (블로커) | 0 |
| P1 (주요 결함) | 4 |
| P2 (중간 결함) | 6 |
| P3 (경미 / 주의) | 5 |

### P1 요약

| ID | 핵심 문제 |
|---|---|
| F-MANAGER-01 | self-approve 차단 미구현 — manager 미배정 시 requester == approver 가능 |
| F-MANAGER-02 | 팀 단위 컴플라이언스 뷰 없음 — 매니저가 팀 52h OVER 확인 불가 |
| F-MANAGER-03 | 팀 캘린더 BE — 전사 데이터 누출, 팀/부서 필터 없음 |
| F-MANAGER-04 | WebInboxPage — 전사 스코프 UI 차단은 있으나 MANAGER 역할 명시적 체크 없음 (암묵적 의존) |

### Coverage gap

- **`/web/compliance`** (manager-team-scope): 프론트 + 백엔드 모두 없음 (P1 신규 기능 필요).
- **`/m/team`** (팀 필터 없음): BE 가 전사 반환하고 FE fallback demo 로 가림 (P1/P3 중첩).
- **`/v1/inbox?role=mine`**: "내 요청" 탭을 위한 요청자 관점 엔드포인트 없음 (P2).
- **iter11 GAP-B 잔여**: `role` 레거시 필드 참조 3개소 — `m-inbox-quick`, `m-approval-detail`, `web-inbox` (F-MANAGER-07/08/09, P2/P2/P2).
