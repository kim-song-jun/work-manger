# 도메인 모델 (Domain Model)

> Bounded Context별 핵심 엔티티 / 상태 / 관계.

---

## 1. Bounded Contexts

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Identity      │  │   Attendance    │  │     Leave       │
│   (인증/조직)   │  │   (출퇴근)      │  │   (연차)        │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │    Approval        │
                    │    (승인 워크플로) │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Notification     │
                    │   (알림)           │
                    └────────────────────┘
```

---

## 2. Identity Context

### Company
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `name` | string | 회사명 |
| `code` | string(6) | 가입 코드 (영숫자) |
| `fiscal_year_start` | date | 회계연도 기준일 |
| `default_locale` | enum(`ko`,`en`) | 기본 언어 |
| `timezone` | string | IANA TZ (`Asia/Seoul`) |

### User
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | UUID | PK |
| `email` | string | UNIQUE |
| `password_hash` | string | bcrypt |
| `name` | string | |
| `locale` | enum(`ko`,`en`) | |
| `is_email_verified` | bool | |
| `created_at` | timestamp | |

### Membership
회사-유저 N:M 관계.

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `user_id` | FK → User |
| `company_id` | FK → Company |
| `role` | enum(`EMPLOYEE`,`MANAGER`,`ADMIN`,`OWNER`) |
| `department_id` | FK → Department (nullable) |
| `position` | string |
| `employee_no` | string |
| `hired_at` | date |
| `manager_id` | FK → Membership (nullable, 직속 상급자) |
| `is_active` | bool |

### Department
- `id`, `company_id`, `parent_id`, `name`, `path` (materialized path for tree query)

### Location
회사가 등록한 출근 가능 위치.

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `company_id` | FK |
| `kind` | enum(`OFFICE`,`WFH`) |
| `label` | string ("본사", "재택") |
| `latitude`, `longitude` | decimal |
| `radius_m` | int (default 100) |

---

## 3. Attendance Context

### WorkSchedule
사용자별 또는 회사 기본 근무 스케줄.

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `start_time` | time (예: 09:00) |
| `end_time` | time (예: 18:00) |
| `break_minutes` | int (default 60) |
| `work_days` | int[] (월=1..일=7) |

### AttendanceRecord
일일 출퇴근 기록.

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `work_date` | date |
| `clock_in_at` | timestamptz (nullable) |
| `clock_out_at` | timestamptz (nullable) |
| `clock_in_location_id` | FK → Location (nullable) |
| `clock_in_kind` | enum(`OFFICE`,`WFH`,`MANUAL`) |
| `is_late` | bool |
| `is_early_leave` | bool |
| `total_break_minutes` | int |
| `total_work_minutes` | int (computed) |
| `status` | enum(`WORKING`,`ON_BREAK`,`COMPLETED`) |

UNIQUE(`membership_id`, `work_date`)

### BreakRecord
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `attendance_record_id` | FK |
| `started_at`, `ended_at` | timestamptz |

### OvertimeRequest
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `work_date` | date |
| `requested_minutes` | int |
| `reason` | text |
| `auto_generated` | bool |
| `status` | enum(`PENDING`,`APPROVED`,`REJECTED`,`CANCELLED`) |
| `decided_by` | FK → Membership (nullable) |
| `decided_at` | timestamptz (nullable) |

---

## 4. Leave Context

### LeavePolicy
회사 단위 연차 정책 (버전 관리).

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `company_id` | FK |
| `effective_from` | date |
| `rules_json` | jsonb (단계별 부여 규칙) |
| `expiry_months` | int (default 12) |
| `notify_days_before` | int[] (default `[30,14,7,1]`) |

### LeaveBalance
사용자별 부여 트랜잭션 (잔여는 합산으로 계산).

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `kind` | enum(`GRANTED`,`USED`,`EXPIRED`,`ADJUSTED`) |
| `days` | decimal (음수 가능) |
| `granted_at` | date |
| `expires_at` | date (nullable) |
| `note` | text |

> 잔여 = `SUM(days WHERE kind=GRANTED AND expires_at > now) - SUM(days WHERE kind=USED) - SUM(days WHERE kind=EXPIRED)`

### LeaveRequest
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `start_date`, `end_date` | date |
| `kind` | enum(`FULL`,`AM_HALF`,`PM_HALF`) |
| `days` | decimal |
| `reason` | text |
| `status` | enum(`PENDING`,`APPROVED`,`REJECTED`,`CANCELLED`) |
| `decided_by` | FK → Membership (nullable) |
| `decided_at` | timestamptz (nullable) |

---

## 5. Approval Context

### ApprovalTask
다양한 승인 요청을 통합 관리.

| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `target_type` | enum(`OVERTIME`,`LEAVE`,`MANUAL_CLOCK_IN`) |
| `target_id` | UUID |
| `requester_id` | FK → Membership |
| `approver_id` | FK → Membership |
| `status` | enum(`PENDING`,`APPROVED`,`REJECTED`) |
| `created_at`, `decided_at` | timestamptz |

---

## 6. Notification Context

### NotificationPreference
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `channel` | enum(`PUSH`,`EMAIL`,`INAPP`) |
| `event_kind` | enum(...) |
| `enabled` | bool |

### NotificationLog
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `event_kind` | enum |
| `payload_json` | jsonb |
| `delivered_at` | timestamptz |
| `read_at` | timestamptz (nullable) |

### DeviceToken
| 필드 | 타입 |
|---|---|
| `id` | UUID |
| `membership_id` | FK |
| `platform` | enum(`IOS`,`ANDROID`,`WEB`,`DESKTOP`) |
| `token` | string |
| `last_seen_at` | timestamptz |

---

## 7. 상태 전이 (State Diagrams)

### AttendanceRecord.status

```
        clock_in              clock_out
   ───────────────►   WORKING ──────────►  COMPLETED
                       │  ▲
            break_start│  │break_end
                       ▼  │
                    ON_BREAK
```

### LeaveRequest.status

```
   submit         approve
   ─────► PENDING ───────► APPROVED
              │
              │reject
              ▼
          REJECTED

   PENDING ──cancel──► CANCELLED
```

### OvertimeRequest 동일 패턴.

---

## 8. 불변 규칙 (Invariants)

1. **출근 동시성**: `(membership_id, work_date)` 로 UNIQUE 제약. 중복 출근 시도는 DB 제약으로 차단.
2. **승인 권한**: `approver_id` 는 신청자의 `manager_id` 또는 `ADMIN` 이어야 함.
3. **연차 잔여**: 신청 일수가 잔여를 초과하면 거절.
4. **소속 일치**: 모든 도메인 객체는 단일 `company_id` 에 속하며 cross-company 참조 금지.
5. **소프트 삭제**: User / Membership 은 `deleted_at` 으로 소프트 삭제. 출근 / 연차 이력은 보존.
