# 기능 검증 (Feature Verification — SDD)

> **Document version**: 1.0
> **Last updated**: 2026-05-13
> **Phase**: 4 · v1.0 출시 준비
> **Owner**: QA
> **Sibling docs**: [`e2e-ui-ux-audit.md`](e2e-ui-ux-audit.md) (canonical Playwright + smoke gate), [`ui-ux-verification.md`](ui-ux-verification.md), [`live-test-2026-05-10-prelaunch-smoke.md`](live-test-2026-05-10-prelaunch-smoke.md)

본 문서는 **도메인 × 페르소나 × 플랫폼** 검증 매트릭스다. e2e-ui-ux-audit.md 는 release gate(통과/거부) 정의이고, 본 문서는 **확장 시나리오 카탈로그** — 자동/수동 모두 포함하며 향후 추가 e2e 가 어디부터 채워야 하는지 가이드한다.

---

## 0. 4 페르소나 + 검증 책임

`docs/specs/feature-spec.md §1` 참조. 페르소나 권한 누적: `OWNER ⊃ ADMIN ⊃ MANAGER ⊃ EMPLOYEE`.

| 페르소나 | 시드 계정 | 주요 화면 | QA agent file |
|---|---|---|---|
| EMPLOYEE | `<name>-<6digit>@acme.demo` (random suffix) / `DemoPass!1` | `/m/home`, `/m/leave`, `/m/inbox`, `/m/my` | `.claude/agents/qa-employee.md` |
| MANAGER | `manager{1..3}@acme.demo` / `DemoPass!1` | `/m/inbox` + `/web/inbox`, `/web/team-leave` | `.claude/agents/qa-manager.md` |
| ADMIN | `admin@acme.demo` / `DemoPass!1` | `/admin/*` 10개 | `.claude/agents/qa-admin.md` |
| OWNER | `owner@acme.demo` / `DemoPass!1` | `/admin/*` + `/owner/billing` | `.claude/agents/qa-owner.md` |

> EMPLOYEE 이메일은 seed 마다 random suffix. 조회: `curl /v1/admin/employees -H "Authorization: Bearer <admin_token>"` (memory `feedback_live_testing_session.md`).

---

## 1. 검증 분류

각 시나리오에 다음 레이블 부여:

- **자동** — Playwright spec / vitest / pytest 로 reproducible
- **반자동** — design-smoke / console-smoke 스크립트로 측정값/콘솔 점검
- **수동** — 라이브 테스트(브라우저/Electron/Android emulator) 필수
- **regression-gate** — release gate 항목 (e2e-ui-ux-audit.md 참조)
- **smoke** — 빠른 통과 확인용

---

## 2. 도메인 × 시나리오 매트릭스

### 2.1 인증 / 온보딩 (identity, oauth)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-AUTH-01 | 이메일 회원가입 → 이메일 인증 → 로그인 | new user | 자동 | `apps/e2e/specs/onboarding.spec.ts` | BE 테스트 0 (B-CODE-06) |
| F-AUTH-02 | OAuth (Google) 로그인 | new user | 반자동 | BE `tests/test_oauth_google.py` | E2E 부재 (실 OAuth 콜백 의존 — 수동) |
| F-AUTH-03 | OAuth (Kakao) 로그인 | new user | 반자동 | (없음) | 자동 ↔ Kakao mock 필요 |
| F-AUTH-04 | 비밀번호 분실 → 이메일 링크 → 재설정 | EMPLOYEE | 수동 | (없음) | E2E + BE 테스트 갭 |
| F-AUTH-05 | 로그인 락아웃 (5회 실패 후 잠금) | EMPLOYEE | 수동 | (없음) | BE 테스트 갭 (B-CODE-06) |
| F-AUTH-06 | 2FA TOTP 설정 → 백업 코드 다운로드 → 로그인 challenge | EMPLOYEE | 수동 | (없음) | BE 테스트 갭 |
| F-AUTH-07 | 8단계 온보딩 wizard 완주 (회사 코드 ACMEDM 입력) | new user | 자동 | `apps/e2e/specs/onboarding.spec.ts` | regression-gate |
| F-AUTH-08 | 이미 멤버 → `/onboarding/*` 직접 접근 시 `/m/home` redirect | EMPLOYEE | 자동 | `apps/e2e/specs/auth.spec.ts` | regression-gate |
| F-AUTH-09 | 미인증 시 `/m/*` 접근 → `/login` redirect | anonymous | 자동 | `apps/e2e/specs/all-pages.spec.ts` | regression-gate |
| F-AUTH-10 | 잘못된 회사 코드 입력 → 에러 + 재시도 가능 | new user | 수동 | (없음) | E2E 갭 |
| F-AUTH-11 | `/logout` SPA route → 세션 종료 | EMPLOYEE | 자동 | `apps/e2e/specs/auth.spec.ts` (iter14 추가) | regression-gate |

### 2.2 출퇴근 (attendance, overtime)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-ATT-01 | 슬라이드 클락인 → 위치 검증 통과 → WORKING 상태 | EMPLOYEE | 자동 | `apps/e2e/specs/clock-in.spec.ts` | regression-gate |
| F-ATT-02 | 동일 멤버십 동시에 다른 디바이스에서 클락인 → 첫 요청만 201, 나머지 409 | EMPLOYEE | 반자동 | BE `tests/test_attendance_concurrent.py` (있음 가정) | 동시성 부하 테스트 자동화 필요 |
| F-ATT-03 | 위치 범위 밖 → 거부 + "수동 출근 신청" 분기 | EMPLOYEE | 수동 | (없음) | E2E 갭 |
| F-ATT-04 | 휴게 시작 / 종료 → BreakRecord 생성 | EMPLOYEE | 자동 | BE `tests/test_attendance_break.py` (있음) | E2E 갭 |
| F-ATT-05 | 클락아웃 → COMPLETED, 자동 휴게 차감, total_work_minutes 정합성 | EMPLOYEE | 자동 | BE `tests/test_attendance_clock_out.py` | regression-gate |
| F-ATT-06 | Beat 가 24시간 후 WORKING 레코드 자동 마감 → is_early_leave 마킹 | EMPLOYEE | 자동 | BE `tests/test_attendance_auto_clock_out.py` | regression-gate |
| F-ATT-07 | 수동 클락인 요청 → MANAGER 승인 → AttendanceRecord 생성 | EMPLOYEE → MANAGER | 수동 | (없음) | E2E 갭 |
| F-ATT-08 | overtime 자동 요청 (스케줄 종료 후 + N분) → MANAGER 승인 | EMPLOYEE → MANAGER | 수동 | (없음) | E2E 갭 |
| F-ATT-09 | 컴플라이언스 52h 초과 임박 → 클락인 차단(`/m/compliance/block`) | EMPLOYEE | 수동 | (없음) | E2E 갭 |
| F-ATT-10 | 주간 통계 (`/v1/attendance/stats/weekly`) — 시간 합산 + 평균 | EMPLOYEE | 반자동 | BE `tests/test_attendance_stats.py` | 자동 |

### 2.3 연차 (leave)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-LEAVE-01 | 2일 풀 연차 신청 → PENDING → MANAGER 승인 | EMPLOYEE → MANAGER | 자동 | `apps/e2e/specs/leave-apply.spec.ts` | regression-gate |
| F-LEAVE-02 | 오전 반차 신청 — 0.5 day 차감 | EMPLOYEE | 자동 | `apps/e2e/specs/leave-apply.spec.ts` | regression-gate |
| F-LEAVE-03 | start_date > end_date — 폼 검증 에러 | EMPLOYEE | 자동 | `apps/web/.../leave-apply.test.tsx` | |
| F-LEAVE-04 | 잔여 부족 → 신청 거부 (서버 422) | EMPLOYEE | 수동 | (없음) | E2E 갭 |
| F-LEAVE-05 | 신청 취소 (PENDING 상태) | EMPLOYEE | 수동 | (없음) | E2E 갭 |
| F-LEAVE-06 | 자동 부여 배치 (`leave.grant_monthly`) — 1년 미만 신입 매월 1일 | ADMIN | 자동 | BE `tests/test_leave_monthly_grant.py` | |
| F-LEAVE-07 | 자동 부여 배치 (`leave.grant_annual`) — 1년차 회계연도 시작 | ADMIN | 자동 | BE `tests/test_leave_annual_grant.py` | |
| F-LEAVE-08 | 만료 예정 (notify_days_before) → 알림 발송 | EMPLOYEE | 자동 | BE `tests/test_leave_notify_expiring.py` | |
| F-LEAVE-09 | 잔여 만료 (`leave.expire_balances_task`) | ADMIN | 자동 | BE `tests/test_leave_expire.py` | |
| F-LEAVE-10 | COMP 휴가 신청 — 별도 bucket 차감 | EMPLOYEE | — | — | **갭: B-CODE-03 미완** (현재 ANNUAL 공유) |
| F-LEAVE-11 | leave_policy 변경 — 기존 부여 데이터 소급 미적용 | ADMIN | 수동 | (없음) | BE 갭 |

### 2.4 승인 (approval)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-APR-01 | 인박스 일괄 승인 (3건 선택 → bulk decide) | MANAGER | 자동 | `apps/e2e/specs/inbox-approve.spec.ts` | regression-gate |
| F-APR-02 | swipe-to-approve UX (`/m/inbox/quick`) | MANAGER | 수동 | (없음) | E2E 갭 (gesture) |
| F-APR-03 | 승인 거부 + 사유 입력 → 신청자 알림 | MANAGER | 수동 | (없음) | E2E 갭 |
| F-APR-04 | WS 통한 신규 신청 실시간 표시 (no refresh) | MANAGER | 자동 | `apps/e2e/specs/realtime.spec.ts` | regression-gate |
| F-APR-05 | 본인 신청을 본인이 승인 시도 → 403 | MANAGER | 수동 | (없음) | BE 갭 |
| F-APR-06 | 권한 외 신청 (다른 팀) 보임 여부 — MANAGER 는 본인 팀만 | MANAGER | 수동 | (없음) | BE + E2E 갭 |

### 2.5 팀 / 컴플라이언스 (team, compliance)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-TEAM-01 | 팀 멤버 리스트 + 실시간 상태 (WORKING/BREAK/COMPLETED) | EMPLOYEE | 자동 | `apps/e2e/specs/realtime.spec.ts` (부분) | |
| F-TEAM-02 | 조직 트리 (`/v1/team/organization-tree`) | MANAGER | 반자동 | BE `tests/test_team_org_tree.py` | E2E 갭 |
| F-TEAM-03 | 컴플라이언스 52h 본인 현황 (`/v1/compliance/me`) | EMPLOYEE | 반자동 | BE `tests/test_compliance.py` | E2E 갭 (`/m/compliance`) |
| F-TEAM-04 | 회사 전체 52h 보드 (`/v1/admin/compliance/52h`) | ADMIN | 수동 | (없음) | E2E 갭 |
| F-TEAM-05 | 52h 임박자 차단 정책 (`compliance_block_when_over=True`) | EMPLOYEE | 수동 | (없음) | regression-gate 후보 |

### 2.6 알림 (notification)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-NOTIF-01 | 디바이스 토큰 등록 (web push subscribe) | EMPLOYEE | 자동 | BE `tests/test_notification_devices.py` (있음 가정) | regression-gate 후보 |
| F-NOTIF-02 | 인박스 unread count 실시간 갱신 | EMPLOYEE | 자동 | `apps/e2e/specs/realtime.spec.ts` | |
| F-NOTIF-03 | Web Push (VAPID) — 백그라운드 알림 표시 | EMPLOYEE | 수동 | (없음) | 자동 어려움 (Push API + sw.js 필요) |
| F-NOTIF-04 | APNs HTTP/2 (iOS) — 백그라운드 알림 | EMPLOYEE | 수동 | (없음) | 실기기 필요 |
| F-NOTIF-05 | ntfy (Android) — 포그라운드 서비스 알림 표시 | EMPLOYEE | 수동 | (없음) | 실기기 / emulator (GAP-16 이슈) |
| F-NOTIF-06 | Outbox 재시도 (transient failure) | system | 자동 | BE `tests/test_notification_outbox.py` (있음 가정) | |
| F-NOTIF-07 | 410/badToken → 토큰 삭제 | system | 자동 | BE | |
| F-NOTIF-08 | NotificationPreference 비활성 → 발송 안 됨 | EMPLOYEE | 자동 | BE | |
| F-NOTIF-09 | 알림 inbox(`/m/notifications`) read / read-all | EMPLOYEE | 자동 | `apps/e2e/specs/all-pages.spec.ts` (부분) | |

### 2.7 출장 / 공지 / 감사 (trip, notice, audit)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-TRIP-01 | 출장 신청 → 승인 | EMPLOYEE → MANAGER | 수동 | (없음) | BE 1 test 만 / E2E 갭 |
| F-NOTICE-01 | 공지 발행 (ADMIN) → 직원 알림 + 인박스 노출 | ADMIN → EMPLOYEE | 수동 | (없음) | E2E 갭 |
| F-AUDIT-01 | audit log append-only — UPDATE/DELETE 시도 시 차단 | system | 자동 | BE `tests/test_audit_immutability.py` (있음 가정) | regression-gate 후보 |
| F-AUDIT-02 | 90일 보존 — 91일 이전 row 삭제 | system | 자동 | BE `tests/test_audit_retention.py` (있음 가정) | |
| F-AUDIT-03 | ADMIN 의 audit 필터링 + 조회 (`/admin/audit`) | ADMIN | 자동 | `apps/web/.../admin-audit.test.tsx` (있음 가정) | |

### 2.8 관리자 (admin_api)

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-ADMIN-01 | 대시보드 KPI (출석률 / pending 승인 / 진행중 OT) | ADMIN | 자동 | `apps/web/.../admin-dashboard.test.tsx` (있음 가정) | BE 테스트 갭 |
| F-ADMIN-02 | 직원 일괄 등록 (CSV / bulk API) | ADMIN | 수동 | (없음) | BE + E2E 갭 (B-CODE-06) |
| F-ADMIN-03 | 직원 역할 변경 (EMPLOYEE → MANAGER) | OWNER | 수동 | (없음) | BE + E2E 갭 |
| F-ADMIN-04 | 직원 비활성화 → 출근 불가 + 인박스 비공개 | ADMIN | 수동 | (없음) | BE + E2E 갭 |
| F-ADMIN-05 | 승인 일괄 결정 (`/v1/admin/approvals/bulk`) | ADMIN | 자동 | `apps/web/.../admin-approve-batch.test.tsx` | |
| F-ADMIN-06 | 만료 예정 연차 조회 + 알림 발송 (`/admin/expiring-leave`) | ADMIN | 자동 | `apps/web/.../admin-expiring-leave.test.tsx` (있음) | |
| F-ADMIN-07 | 월간 리포트 export (PDF/CSV) | ADMIN | 수동 | (없음) | B-V1X-06 (PDF v1.x) |
| F-ADMIN-08 | 회사 설정 변경 (브랜드 / 정책 / 위치) — 감사 로그 기록 | OWNER | 수동 | (없음) | E2E 갭 |
| F-ADMIN-09 | 회사 코드 발급 + 회수 + 만료 | ADMIN | 자동 | `apps/web/.../admin-codes.test.tsx` (있음 가정) | |

### 2.9 빌링 (billing) — **스켈레톤**

| ID | 시나리오 | 페르소나 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|---|
| F-BILL-01 | 현재 플랜 + 인보이스 리스트 조회 (read-only) | OWNER | 자동 | `apps/web/.../owner-billing.test.tsx` | |
| F-BILL-02 | "Change plan" 버튼 비활성 + tooltip 메시지 | OWNER | 자동 | `apps/web/.../owner-billing.test.tsx` | |
| F-BILL-03 | Free → Pro 플랜 업그레이드 (Stripe Checkout) | OWNER | — | — | **갭: B-CODE-01 미완** |
| F-BILL-04 | Stripe webhook 처리 (signed event) | system | — | — | **갭: B-CODE-01 미완** |
| F-BILL-05 | 다운그레이드 / 취소 | OWNER | — | — | **갭: B-CODE-01 미완** |
| F-BILL-06 | 결제 실패 → PAST_DUE 표시 + 알림 | OWNER | — | — | **갭: B-CODE-01 미완** |

---

## 3. 플랫폼별 시나리오 (Mobile / Desktop)

### 3.1 Flutter Mobile (Android)

| ID | 시나리오 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|
| F-MOB-AND-01 | WebView 호스트가 SPA 렌더 (login → home) | 자동 | `docker compose --profile test run mobile-test` (5 unit) | UI integration test 갭 |
| F-MOB-AND-02 | 네이티브 bridge — geolocation 요청 → 권한 다이얼로그 | 수동 | (없음) | 실 emulator 필요 (GAP-16) |
| F-MOB-AND-03 | NtfyForegroundService 가 Doze 통과 후에도 WS 살아있음 | 수동 | (없음) | 운영 검증 필요 |
| F-MOB-AND-04 | Geofence 진입 → MethodChannel → 자동 클락인 | 수동 | (없음) | 실 GPS 시뮬레이션 필요 |
| F-MOB-AND-05 | Glance widget (`WorkStatusWidget`) 홈화면 노출 + 데이터 갱신 | 수동 | (없음) | 실 단말 필요 |
| F-MOB-AND-06 | Workmanager 15분 cadence 위치 sync | 수동 | (없음) | 운영 검증 필요 |

### 3.2 Flutter Mobile (iOS)

| ID | 시나리오 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|
| F-MOB-IOS-01 | WebView 호스트 + APNs 토큰 등록 (`AppDelegate.swift`) | 수동 | (없음) | Mac signing host 필요 |
| F-MOB-IOS-02 | CoreLocation region monitoring → 자동 클락인 | — | — | **갭: B-CODE-02 미완** |
| F-MOB-IOS-03 | WidgetKit Today/ThisWeek 위젯 | — | — | **갭: B-CODE-02 — Xcode 수동 셋업 + App Group** |
| F-MOB-IOS-04 | App Store Review §5.1.1 위치 권한 설명 | — | — | B-OPS-03 |

### 3.3 Electron Desktop

| ID | 시나리오 | 자동/수동 | 자동 artifact | 갭 |
|---|---|---|---|---|
| F-DSK-01 | 부팅 + 단일 인스턴스 락 | 수동 | (없음) | manual smoke |
| F-DSK-02 | 트레이 메뉴 — 출퇴근 / 설정 / 종료 | 수동 | (없음) | manual smoke |
| F-DSK-03 | 자동 클락인 스케줄러 — 시작 시각 +30s 후 발화 | 자동 | `apps/desktop/src/main/__tests__/auto-clock-in.test.ts` | |
| F-DSK-04 | OS native notification 발화 | 자동 | `notifications.test.ts` | |
| F-DSK-05 | Auto-update — S3 매니페스트 → update-available → update-downloaded | 자동 | `updater.test.ts` | 실 prod S3 검증 필요 |
| F-DSK-06 | Win SmartScreen 통과 (서명된 Setup.exe) | 수동 | — | **갭: B-OPS-01 미완** |
| F-DSK-07 | Mac Gatekeeper 통과 (Notarized) | 수동 | — | **갭: B-OPS-02 미완** |

---

## 4. 보안 시나리오

| ID | 시나리오 | 자동/수동 | 갭 |
|---|---|---|---|
| F-SEC-01 | JWT 만료 → refresh → 갱신 | 자동 | `apps/web/.../auth-store.test.ts` |
| F-SEC-02 | refresh 만료 → 강제 로그아웃 | 수동 | E2E 갭 |
| F-SEC-03 | CSRF 안전 — JWT Bearer 헤더 사용 (쿠키 미사용) | 자동 | BE `tests/test_csrf.py` 가정 |
| F-SEC-04 | SQL injection — DRF serializer 검증 | 자동 | BE 일반 테스트로 커버 |
| F-SEC-05 | XSS — React escape + CSP | 수동 | console-smoke + 펜테스트 (B-OPS-04) |
| F-SEC-06 | 비밀번호 정책 — 8자 + 영숫자 + 특수 | 자동 | `apps/web/.../signup.test.tsx` 가정 |
| F-SEC-07 | 2FA TOTP 만료 30초 윈도우 | 수동 | BE 갭 |
| F-SEC-08 | Recovery code 일회용 — 두 번째 시도 거부 | 수동 | BE 갭 |
| F-SEC-09 | OAuth state 위변조 → 거부 | 자동 | BE `tests/test_oauth.py` |
| F-SEC-10 | gitleaks pre-commit — 평문 시크릿 차단 | 자동 | `.pre-commit-config.yaml` |
| F-SEC-11 | dep-audit HIGH/CRITICAL → GH 이슈 자동 발행 | 자동 | `.github/workflows/dep-audit.yml` |

---

## 5. 실행 명령어 (How to Verify)

### 5.1 자동 시나리오 — 전체 회귀

```bash
make test-all        # BE + Web + Desktop + Mobile + E2E
# 또는 개별:
make test-be         # services/api pytest --cov-fail-under=50
make test-fe         # apps/web typecheck + vitest + build
make test-desktop    # apps/desktop typecheck + vitest
make test-mobile     # apps/mobile flutter test
make test-e2e        # apps/e2e Playwright real-stack
```

### 5.2 반자동 — smoke

```bash
node apps/e2e/scripts/console-smoke.mjs              # 콘솔/네트워크 0 failure
node apps/e2e/scripts/onboarding-console-smoke.mjs   # 온보딩 0 failure
node apps/e2e/scripts/design-smoke.mjs               # design system 측정값 + 스크린샷
```

### 5.3 수동 — 라이브 테스트 (3 플랫폼)

`docs/operations/local-3platform.md` 참조. 페르소나별 sweep 패턴은 memory `feedback_live_testing_session.md` 의 §3.

**현재 환경 이슈** (memory `feedback_live_testing_session.md` §4-5):
- Android emulator GAP-16: `emulator-5554 offline` — `qemu-system-x86_64` 즉시 종료. 우회: 실기기 / Genymotion / BrowserStack
- JDK 17+ 미설치: `JAVA_HOME=jdk-1.8` 잘못된 경로 → APK 빌드 실패. 해결: Microsoft OpenJDK 17 설치 + `flutter config --jdk-dir <path>`

**검증 보고**:
- 보고서: `docs/qa/live-test-YYYY-MM-DD-*.md`
- 스크린샷: `docs/qa/screenshots/<slug>/` (커밋 대상)

---

## 6. Release Gate (e2e-ui-ux-audit.md 인용)

다음 모두 통과해야 GA:

1. `make test-all` 모든 잡 Docker 안에서 통과
2. `console-smoke.mjs` + `onboarding-console-smoke.mjs` 0 failure
3. `design-smoke.mjs` 스크린샷 신규 + 측정값 모두 통과
4. 본 문서 §2 의 모든 **regression-gate** 마킹 항목 통과
5. 본 문서 §3 의 mobile/desktop 수동 smoke 1회 이상 통과

추가(Phase 4 출시 한정):
6. `docs/qa/live-test-2026-MM-DD-prelaunch-smoke.md` 보고서 작성 + reviewer 승인

---

## 7. 다음 단계

- 갭 마킹 (🔴 / "갭: B-CODE-XX") 항목은 `docs/tasks/backlog.md` 의 해당 항목으로 연결
- 새 시나리오 추가 시 본 문서 §2 표에 ID 부여 + 자동/수동 분류 + 갭 명시
- 통과 후 시드 데이터/스크린샷 박제 위치는 `docs/qa/screenshots/<slug>/`
