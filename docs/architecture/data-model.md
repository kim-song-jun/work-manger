# 데이터 모델 (Data Model)

> PostgreSQL 16 기준. 도메인 정의는 [`../specs/domain-model.md`](../specs/domain-model.md), 본 문서는 물리 스키마.

---

## 1. 명명 규칙

- 테이블: `snake_case`, 단수형 (`attendance_record`)
- PK: `id` (UUID v7, 시간 정렬 가능)
- FK: `<table>_id`
- 타임스탬프: `created_at`, `updated_at` (모든 테이블), `deleted_at` (소프트 삭제 대상)
- 모든 도메인 테이블은 `company_id` 포함, 인덱스 첫 컬럼

---

## 2. 핵심 테이블 (요약)

### 2.1 identity

```sql
CREATE TABLE company (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  code CHAR(6) UNIQUE NOT NULL,
  fiscal_year_start DATE NOT NULL DEFAULT '2026-01-01',
  default_locale TEXT NOT NULL DEFAULT 'ko',
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_user (
  id UUID PRIMARY KEY,
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ko',
  is_email_verified BOOL NOT NULL DEFAULT FALSE,
  totp_secret TEXT,
  totp_enabled BOOL NOT NULL DEFAULT FALSE,
  failed_login_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE department (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  parent_id UUID REFERENCES department(id),
  name TEXT NOT NULL,
  path TEXT NOT NULL,                        -- materialized path '/eng/backend'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_department_company_path ON department(company_id, path);

CREATE TABLE membership (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  user_id UUID NOT NULL REFERENCES app_user(id),
  department_id UUID REFERENCES department(id),
  manager_id UUID REFERENCES membership(id),
  role TEXT NOT NULL CHECK (role IN ('EMPLOYEE','MANAGER','ADMIN','OWNER')),
  position TEXT,
  employee_no TEXT,
  hired_at DATE NOT NULL,
  is_active BOOL NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id),
  UNIQUE(company_id, employee_no)
);
CREATE INDEX idx_membership_company_dept ON membership(company_id, department_id);
CREATE INDEX idx_membership_manager ON membership(manager_id);

CREATE TABLE location (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  kind TEXT NOT NULL CHECK (kind IN ('OFFICE','WFH')),
  label TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  radius_m INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_location_company ON location(company_id);

CREATE TABLE company_join_code (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  code CHAR(6) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  max_uses INT,
  used_count INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES membership(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
```

### 2.2 attendance

```sql
CREATE TABLE work_schedule (
  id UUID PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES membership(id),
  start_time TIME NOT NULL DEFAULT '09:00',
  end_time TIME NOT NULL DEFAULT '18:00',
  break_minutes INT NOT NULL DEFAULT 60,
  work_days INT[] NOT NULL DEFAULT '{1,2,3,4,5}',  -- 월=1..일=7
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_work_schedule_membership ON work_schedule(membership_id);

CREATE TABLE attendance_record (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  membership_id UUID NOT NULL REFERENCES membership(id),
  work_date DATE NOT NULL,
  clock_in_at TIMESTAMPTZ,
  clock_out_at TIMESTAMPTZ,
  clock_in_location_id UUID REFERENCES location(id),
  clock_in_kind TEXT CHECK (clock_in_kind IN ('OFFICE','WFH','MANUAL')),
  is_late BOOL NOT NULL DEFAULT FALSE,
  is_early_leave BOOL NOT NULL DEFAULT FALSE,
  total_break_minutes INT NOT NULL DEFAULT 0,
  total_work_minutes INT,
  status TEXT NOT NULL CHECK (status IN ('WORKING','ON_BREAK','COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(membership_id, work_date)
);
CREATE INDEX idx_att_company_date ON attendance_record(company_id, work_date);
CREATE INDEX idx_att_status ON attendance_record(company_id, status);

CREATE TABLE break_record (
  id UUID PRIMARY KEY,
  attendance_record_id UUID NOT NULL REFERENCES attendance_record(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ
);
CREATE INDEX idx_break_record_att ON break_record(attendance_record_id);

CREATE TABLE overtime_request (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  membership_id UUID NOT NULL REFERENCES membership(id),
  work_date DATE NOT NULL,
  requested_minutes INT NOT NULL,
  reason TEXT,
  auto_generated BOOL NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  decided_by UUID REFERENCES membership(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ot_company_status ON overtime_request(company_id, status);
CREATE INDEX idx_ot_member_date ON overtime_request(membership_id, work_date);
```

### 2.3 leave

```sql
CREATE TABLE leave_policy (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  effective_from DATE NOT NULL,
  rules_json JSONB NOT NULL,
  expiry_months INT NOT NULL DEFAULT 12,
  notify_days_before INT[] NOT NULL DEFAULT '{30,14,7,1}',
  created_by UUID REFERENCES membership(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leave_policy_company ON leave_policy(company_id, effective_from DESC);

CREATE TABLE leave_balance (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  membership_id UUID NOT NULL REFERENCES membership(id),
  kind TEXT NOT NULL CHECK (kind IN ('GRANTED','USED','EXPIRED','ADJUSTED')),
  days NUMERIC(5,2) NOT NULL,
  granted_at DATE NOT NULL,
  expires_at DATE,
  related_request_id UUID,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_balance_member_kind ON leave_balance(membership_id, kind);
CREATE INDEX idx_balance_expires ON leave_balance(company_id, expires_at) WHERE kind='GRANTED';

CREATE TABLE leave_request (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  membership_id UUID NOT NULL REFERENCES membership(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('FULL','AM_HALF','PM_HALF')),
  days NUMERIC(5,2) NOT NULL,
  reason TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
  decided_by UUID REFERENCES membership(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (start_date <= end_date)
);
CREATE INDEX idx_leave_req_member_status ON leave_request(membership_id, status);
CREATE INDEX idx_leave_req_company_range ON leave_request(company_id, start_date, end_date);
```

### 2.4 approval

```sql
CREATE TABLE approval_task (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES company(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('OVERTIME','LEAVE','MANUAL_CLOCK_IN')),
  target_id UUID NOT NULL,
  requester_id UUID NOT NULL REFERENCES membership(id),
  approver_id UUID NOT NULL REFERENCES membership(id),
  status TEXT NOT NULL CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);
CREATE INDEX idx_appr_approver_status ON approval_task(approver_id, status, created_at DESC);
CREATE INDEX idx_appr_company_status ON approval_task(company_id, status);
```

### 2.5 notification

```sql
CREATE TABLE notification_preference (
  id UUID PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES membership(id),
  channel TEXT NOT NULL CHECK (channel IN ('PUSH','EMAIL','INAPP')),
  event_kind TEXT NOT NULL,
  enabled BOOL NOT NULL DEFAULT TRUE,
  UNIQUE(membership_id, channel, event_kind)
);

CREATE TABLE notification_log (
  id UUID PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES membership(id),
  event_kind TEXT NOT NULL,
  channel TEXT NOT NULL,
  payload_json JSONB NOT NULL,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notif_member_unread ON notification_log(membership_id, read_at);

CREATE TABLE device_token (
  id UUID PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES membership(id),
  platform TEXT NOT NULL CHECK (platform IN ('IOS','ANDROID','WEB','DESKTOP')),
  token TEXT NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(platform, token)
);
```

### 2.6 audit

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY,
  company_id UUID,
  actor_id UUID REFERENCES app_user(id),
  action TEXT NOT NULL,                 -- 'login.success', 'employee.deactivated' ...
  target_type TEXT,
  target_id UUID,
  ip INET,
  user_agent TEXT,
  payload_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_company_time ON audit_log(company_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action, created_at DESC);
```

`audit_log` 는 append-only. UPDATE/DELETE 권한 회수.

---

## 3. 마이그레이션 정책

- Django 의 `makemigrations` / `migrate` 표준 사용
- 모든 마이그레이션은 PR 리뷰 시 SQL 출력 (`sqlmigrate`) 첨부
- 운영 적용 전 stg 에서 실측 (큰 테이블의 ALTER 는 시간 측정)
- 백워드 호환 단계:
  1. 새 컬럼 추가 (nullable)
  2. 백필 (배치)
  3. NOT NULL 제약 추가
  4. 코드에서 새 컬럼 읽기 / 쓰기 전환
  5. 구 컬럼 제거 (충분한 안정 기간 후)
- 큰 인덱스는 `CONCURRENTLY` 사용

---

## 4. 데이터 보존 정책

| 데이터 | 보존 기간 | 비고 |
|---|---|---|
| `attendance_record` | 영구 | 회사 계약 종료 시 익명화 / 삭제 |
| `audit_log` | 1년 (회사 설정 가능, max 7년) | |
| `notification_log` | 90일 | 그 이전은 S3 cold storage |
| `device_token` | last_seen_at + 90일 | 미사용 토큰 정리 |
| `leave_balance` | 영구 | 감사 추적 |
| 사용자 위치 좌표 | 클로킹 시점만 저장 | 추적 / 이동경로 저장 금지 |

---

## 5. 백업

- RDS 자동 백업 일일, 7일 보존
- 매주 일요일 수동 스냅샷, 4주 보존
- 매월 1일 수동 스냅샷, 12개월 보존
- 월 1회 복원 리허설 (stg 에 복원 후 헬스체크)
