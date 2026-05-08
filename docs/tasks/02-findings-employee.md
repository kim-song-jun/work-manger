---
persona: employee
agent: qa-employee
generated: 2026-05-08
task_n: 2
---

# qa-employee findings (Wave 2 audit)

## Coverage matrix (시나리오 × 결과)

| 시나리오 | Web mobile (390x844) | Web desktop (1440x900) | Electron | Android |
|---|---|---|---|---|
| 출퇴근 슬라이드 (clock-in) | F-EMPLOYEE-001, F-EMPLOYEE-002 | F-EMPLOYEE-001 | 미검증 | 미검증 |
| 퇴근 슬라이드 (clock-out) | F-EMPLOYEE-003 | F-EMPLOYEE-003 | 미검증 | 미검증 |
| 휴게 시작/종료 | F-EMPLOYEE-004 | F-EMPLOYEE-004 | 미검증 | 미검증 |
| 연차 신청 (`/m/leave/apply`) | F-EMPLOYEE-006, F-EMPLOYEE-007 | OK | 미검증 | 미검증 |
| 잔여 연차 (`/m/leave`) | F-EMPLOYEE-005 | F-EMPLOYEE-005 | 미검증 | 미검증 |
| 연차 소멸 예정 (`/m/leave/expiry`) | OK (fetchBalance 공유) | OK | 미검증 | 미검증 |
| 초과근무 신청 (`/m/overtime`) | OK | OK | 미검증 | 미검증 |
| 인박스 (`/m/inbox`) | F-EMPLOYEE-008 | F-EMPLOYEE-008 | 미검증 | 미검증 |
| 알림 (`/m/notifications`) | F-EMPLOYEE-009 | OK | 미검증 | 미검증 |
| 공지사항 (`/m/notice`) | F-EMPLOYEE-010 | OK | 미검증 | 미검증 |
| 출장/외근 (`/m/trip`) | OK (전체 구현됨) | OK | 미검증 | 미검증 |
| 도움말 (`/m/help`) | F-EMPLOYEE-011 | OK | 미검증 | 미검증 |
| /admin/* 접근 차단 | OK (→ /m/home redirect) | OK | 미검증 | 미검증 |
| i18n 정합성 | OK (ko/en 완전 일치) | OK | 미검증 | 미검증 |
| 홈 통계/KPI | F-EMPLOYEE-012 | F-EMPLOYEE-012 | 미검증 | 미검증 |

---

## Findings

### F-EMPLOYEE-001: 홈 화면 refresh 시 clock-in 상태 소실 (BE 동기화 없음)

- **Severity**: P0
- **Where**: `apps/web/src/pages/m-home/index.tsx:52` (`const [clockedIn, setClockedIn] = useState(false)`)
- **Repro**:
  1. 홈 화면에서 SlideToClockIn으로 출근 등록
  2. 페이지 새로고침 (F5 / 앱 재시작)
  3. 홈 화면이 다시 "밀어서 출근" 상태로 표시됨
- **Expected**: `fetchToday()` (`/v1/attendance/today`) 호출 결과로 `is_clocked_in: true`이면 출근 상태로 초기화
- **Actual**: `clockedIn`은 local `useState(false)`로만 관리, 페이지 마운트 시 BE 동기화 없음. `fetchToday` 함수는 `apps/web/src/entities/attendance/api/fetchToday.ts`에 존재하지만 `m-home`에서 미호출.
- **Suggested fix scope**: `apps/web/src/pages/m-home/index.tsx` — 마운트 시 `useQuery({ queryKey: ["attendance","today"], queryFn: fetchToday })` 추가, `is_clocked_in` / `clock_in_at` 으로 초기 상태 설정

---

### F-EMPLOYEE-002: 출근 후 clock-in 시각이 항상 현재 시각 표시 (서버 응답 무시)

- **Severity**: P1
- **Where**: `apps/web/src/pages/m-home/index.tsx:84–87`
- **Repro**:
  1. SlideToClockIn 완료 후 BE가 `201 Created`와 함께 `clock_in_at` 반환
  2. 홈 화면 상단 "출근" 값에 현재 클라이언트 시각이 표시됨
- **Expected**: 서버 응답 `data.clock_in_at` 파싱 후 표시 (서버 타임스탬프 우선)
- **Actual**: `mutation.onSuccess`에서 `new Date()`를 직접 포맷해 `setClockedInAt` 설정, API 응답의 `clock_in_at` 미사용. 클라이언트/서버 시간 차이 또는 idempotency replay 시 불일치.
- **Suggested fix scope**: `apps/web/src/pages/m-home/index.tsx` — `mutation.onSuccess` 콜백에서 응답의 `data.clock_in_at` 값을 파싱하여 `setClockedInAt` 설정

---

### F-EMPLOYEE-003: 퇴근 슬라이드가 BE API를 호출하지 않음

- **Severity**: P0
- **Where**: `apps/web/src/pages/m-home/index.tsx:179–184`
- **Repro**:
  1. 출근 후 SlideToClockIn을 다시 밀어서 퇴근
  2. 토스트 "퇴근" 표시, `clockedIn = false`로 UI 업데이트
  3. 서버에서 `/v1/attendance/records` 확인 시 `clock_out_at`이 `null`
- **Expected**: `clockedIn === true` 분기에서 `POST /v1/attendance/clock-out` 호출 후 성공 시 상태 업데이트
- **Actual**: `onCommit` 핸들러에서 `clockedIn`이 true일 때 `setClockedIn(false)` + 토스트만 실행, BE clock-out 뮤테이션 없음. BE에 `views.clock_out`, `urls.py`에 `attendance/clock-out` 경로는 정상 존재.
- **Suggested fix scope**: `apps/web/src/pages/m-home/index.tsx` — clock-out mutation 추가 (`POST /v1/attendance/clock-out`), 성공 시에만 상태 업데이트. 오류 시 toast.

---

### F-EMPLOYEE-004: 휴게 시작/종료 UI 미구현 (BE 엔드포인트 존재)

- **Severity**: P1
- **Where**: `apps/web/src/pages/` (해당 파일 없음), `services/api/apps/attendance/urls.py:7–8` (BE endpoints 존재)
- **Repro**:
  1. 출근 후 점심 휴게를 등록하려 함
  2. 홈 화면, /m/* 어떤 페이지에도 "휴게 시작/종료" 버튼 없음
- **Expected**: 출근 중인 상태에서 "휴게 시작" 버튼 표시, 탭 또는 홈 카드로 접근 가능
- **Actual**: `POST /v1/attendance/break/start`, `POST /v1/attendance/break/end` BE 엔드포인트 존재하나, FE에 대응 UI 없음. `apps/web/src/features/`에 `break` feature 폴더도 없음.
- **Suggested fix scope**: `apps/web/src/pages/m-home/index.tsx` 또는 신규 `apps/web/src/features/break/` — 출근 중 "휴게 시작" CTA 추가, 휴게 중 "휴게 종료" CTA 표시

---

### F-EMPLOYEE-005: /m/leave 페이지와 다른 페이지 간 leave balance 쿼리 키 불일치 (캐시 미동기화)

- **Severity**: P1
- **Where**:
  - `apps/web/src/pages/m-leave/index.tsx:9` (`queryKey: ["leave-balance"]`)
  - `apps/web/src/pages/m-home/index.tsx:56` (`queryKey: ["leave", "balance"]`)
  - `apps/web/src/features/leave-apply/ui/LeaveApplyForm.tsx:32,84` (`queryKey: ["leave", "balance"]`)
- **Repro**:
  1. `/m/leave/apply`에서 연차 신청 완료
  2. `LeaveApplyForm.onSuccess`에서 `invalidateQueries({ queryKey: ["leave", "balance"] })` 실행
  3. `/m/leave` 페이지로 이동하면 잔여 연차가 갱신되지 않음 (stale)
- **Expected**: 연차 신청 후 모든 balance 표시가 즉시 최신 데이터로 갱신
- **Actual**: `m-leave` 페이지는 `["leave-balance"]` 키 사용, invalidate 대상에서 제외됨. `web-dashboard`와 `m-leave-expiry`는 `["leave", "balance"]` 사용으로 정상 갱신.
- **Suggested fix scope**: `apps/web/src/pages/m-leave/index.tsx` — `queryKey: ["leave-balance"]` → `["leave", "balance"]` 통일

---

### F-EMPLOYEE-006: m-leave-success 페이지에서 신청 내용(기간·유형)이 "—"로 표시

- **Severity**: P1
- **Where**: `apps/web/src/pages/m-leave-success/index.tsx:43–57`, `apps/web/src/pages/m-leave-apply/index.tsx:71`
- **Repro**:
  1. `/m/leave/apply`에서 날짜/유형 선택 후 신청 완료
  2. 성공 화면으로 이동 시 "기간", "유형" 항목이 모두 "—" 표시
- **Expected**: 신청한 기간(`start_date ~ end_date`)과 유형(`FULL / AM_HALF / PM_HALF`)이 성공 화면에 표시
- **Actual**: `nav("/m/leave/success", { replace: true })` 호출 시 state 미전달. `LeaveSuccessPage`는 navigation state나 query param을 읽지 않아 항상 `"—"` 렌더.
- **Suggested fix scope**: `apps/web/src/pages/m-leave-apply/index.tsx` + `apps/web/src/pages/m-leave-success/index.tsx` — navigation state로 `{ start, end, kind }` 전달, success 페이지에서 `useLocation().state` 읽기

---

### F-EMPLOYEE-007: 연차 신청 오류 메시지 원시 Zod 키 노출 위험 (start_date regex)

- **Severity**: P2
- **Where**: `apps/web/src/features/leave-apply/model/schema.ts:9` (`z.string().regex(dateRe, "YYYY-MM-DD")`), `apps/web/src/features/leave-apply/ui/LeaveApplyForm.tsx:119`
- **Repro**:
  1. `<input type="date">` 대신 직접 텍스트 입력 지원 환경(구형 브라우저 or mobile 접근성 도구)에서 잘못된 날짜 입력
  2. 오류 메시지로 `"YYYY-MM-DD"` 원시 문자열 표시
- **Expected**: 사람이 읽을 수 있는 오류 메시지 (예: `t("leave_apply.invalid_dates")` 사용)
- **Actual**: `errors.start_date?.message`가 그대로 렌더되며, i18n 키가 아닌 `"YYYY-MM-DD"` 포맷 힌트 노출.
- **Suggested fix scope**: `apps/web/src/features/leave-apply/model/schema.ts` — `"YYYY-MM-DD"` → `"leave_apply.invalid_dates"` 또는 별도 i18n key

---

### F-EMPLOYEE-008: m-inbox 기본 탭이 EMPLOYEE에게 빈 "승인할 것" 탭 표시

- **Severity**: P1
- **Where**: `apps/web/src/pages/m-inbox/index.tsx:60` (`const [tab, setTab] = useState<Tab>("to-approve")`)
- **Repro**:
  1. EMPLOYEE 역할로 `/m/inbox` 진입
  2. 기본 탭 "승인할 것"에 항목 없음 (BE `/v1/inbox`는 `approver=membership` 필터)
  3. 본인 연차/초과 신청 내역은 "내 요청" 탭에 있으나 기본 탭이 아님
- **Expected**: EMPLOYEE 역할일 때 기본 탭을 "내 요청"으로 설정하거나, "내 요청" 탭을 첫 번째로 배치
- **Actual**: 역할 무관하게 항상 "승인할 것" 탭이 기본값 — EMPLOYEE는 빈 화면을 먼저 봄.
- **Suggested fix scope**: `apps/web/src/pages/m-inbox/index.tsx` — role 기반 기본 탭 분기 또는 탭 순서 변경

---

### F-EMPLOYEE-009: m-notifications 페이지 마운트 시 N개 개별 markRead 호출 (N+1 패턴)

- **Severity**: P1
- **Where**: `apps/web/src/pages/m-notifications/index.tsx:33–39`
- **Repro**:
  1. 미읽은 알림이 10개인 상태에서 `/m/notifications` 진입
  2. 네트워크 탭에서 `POST /v1/notifications/{id}/read` 요청 10번 동시 발생
- **Expected**: `POST /v1/notifications/read-all` 단일 호출로 일괄 처리 (BE에 존재: `notifications/read-all`)
- **Actual**: `useEffect`에서 `Promise.all(unread.map((u) => markRead(u.id)))` — 미읽은 항목 수만큼 개별 HTTP 요청. `markAllRead()` 함수는 존재하나 자동 마크에 미사용.
- **Suggested fix scope**: `apps/web/src/pages/m-notifications/index.tsx` — 자동 마크를 `markAllRead()` 단일 호출로 교체

---

### F-EMPLOYEE-010: m-notice 카테고리 필터에 "일반(general)" 항목 누락

- **Severity**: P2
- **Where**: `apps/web/src/pages/m-notice/index.tsx:56–62`
- **Repro**:
  1. category=general인 공지가 BE에서 반환됨
  2. `/m/notice` 필터 바에 "일반" 탭 없음 (all, 정책, 이벤트, IT, 인사만 표시)
  3. "전체" 탭에서만 general 공지를 볼 수 있음
- **Expected**: "일반" 카테고리 필터 옵션 표시 (`notice.cat_general` i18n 키 이미 정의됨)
- **Actual**: SegmentedControl `options` 배열에서 `{ value: "general", label: t("notice.cat_general") }` 누락.
- **Suggested fix scope**: `apps/web/src/pages/m-notice/index.tsx` — options에 `{ value: "general", label: t("notice.cat_general") }` 추가

---

### F-EMPLOYEE-011: m-help "문의하기" 버튼 미구현 (i18n 키 `mobile.help.contact` 정의됨)

- **Severity**: P2
- **Where**: `apps/web/src/pages/m-help/index.tsx` (해당 버튼 없음), `apps/web/src/shared/i18n/index.ts:670,1402`
- **Repro**:
  1. `/m/help` 진입
  2. FAQ 섹션과 매뉴얼 링크는 표시되나 "문의하기" / "Contact us" 버튼 없음
- **Expected**: 고객 지원 연락처(mailto: 또는 채팅 링크)로 이동하는 버튼 표시
- **Actual**: `mobile.help.contact` i18n 키 ("문의하기" / "Contact us")가 ko/en 모두 정의되어 있으나 HelpPage 컴포넌트에 렌더링 없음.
- **Suggested fix scope**: `apps/web/src/pages/m-help/index.tsx` — `t("mobile.help.contact")` 레이블의 버튼/링크 추가 (href: 환경변수 `VITE_SUPPORT_EMAIL` 등)

---

### F-EMPLOYEE-012: 홈 화면 KPI 값 하드코딩 (실제 BE 데이터 미연결)

- **Severity**: P1
- **Where**: `apps/web/src/pages/m-home/index.tsx:123,198,204`
- **Repro**:
  1. 임의의 계정으로 로그인 후 홈 화면 진입
  2. "오늘 근무" 카드에 항상 "0h 36m" 표시 (출근 시)
  3. "이번 주" KPI = 항상 "32h", "초과 누적" = 항상 "4.3h"
  4. 정규 시간 StatRow = 항상 "09–18"
- **Expected**: 각 값이 BE fetchToday, 주간 집계 API에서 동적으로 채워짐
- **Actual**: `{clockedIn ? "0h 36m" : "—"}`, `value="32"`, `value="4.3"` 리터럴 하드코딩. 팀 현황도 `FAKE_PEOPLE` 배열 사용.
- **Suggested fix scope**: `apps/web/src/pages/m-home/index.tsx` — fetchToday (출퇴근 시각·근무 분), fetchWeeklyStats (주간 합계·초과), fetchTeamStatus (팀원 상태) 연동

---

## Summary

- **Total findings**: 12 (P0: 2, P1: 7, P2: 3)

| ID | Severity | 제목 |
|---|---|---|
| F-EMPLOYEE-001 | P0 | 홈 refresh 시 clock-in 상태 소실 |
| F-EMPLOYEE-003 | P0 | 퇴근 슬라이드 BE API 미호출 |
| F-EMPLOYEE-002 | P1 | 출근 시각 클라이언트 시각 사용 (서버 응답 무시) |
| F-EMPLOYEE-004 | P1 | 휴게 시작/종료 UI 미구현 |
| F-EMPLOYEE-005 | P1 | leave balance 쿼리 키 불일치 (캐시 미동기화) |
| F-EMPLOYEE-006 | P1 | m-leave-success 신청 내용 "—" 표시 |
| F-EMPLOYEE-008 | P1 | m-inbox 기본 탭 EMPLOYEE에 부적합 |
| F-EMPLOYEE-009 | P1 | 알림 페이지 N+1 markRead 호출 |
| F-EMPLOYEE-012 | P1 | 홈 화면 KPI 하드코딩 |
| F-EMPLOYEE-007 | P2 | 연차 신청 Zod 오류 키 원시 노출 |
| F-EMPLOYEE-010 | P2 | 공지 "일반" 카테고리 필터 누락 |
| F-EMPLOYEE-011 | P2 | m-help "문의하기" 버튼 미구현 |

- **Coverage gaps (검증 못한 영역)**:
  - Electron tray 자동 clock-in (코드 정적 분석 불가, 브라우저 자동화 도구 필요)
  - Flutter 지오펜스 진입 알림 (모바일 네이티브 검증 불가)
  - push 알림 실수신 (ntfy/APNs 라이브 환경 검증 미수행)
  - 연차 보상휴가(COMP) 타입: BE/FE 모두 정의 없음 — spec 요구 여부 추가 확인 필요

- **회귀 결과**: 회귀 0건
  - iter11 대상 회귀 검증: m-inbox `useMemo(() => q.data?.items ?? [], [q.data?.items])` 정상 유지 (무한 렌더 없음). m-notice useMemo 3중 체인(`notices → pinned, recent`) 정상. m-help FAQ 6건 + 매뉴얼 링크 ko/en 완전 일치. leave balance SSOT는 `fetchBalance()`로 일원화 (단, 쿼리 키 불일치 신규 발견 — F-EMPLOYEE-005).
