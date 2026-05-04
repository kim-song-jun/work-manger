# API 명세서 (API Specification)

> **Base URL** (개발): `https://api.dev.work-manager.molcube.com/v1`
> **Base URL** (운영): `https://api.work-manager.molcube.com/v1`
> **버전 정책**: URL prefix `/v{N}`. Breaking change 시 N 증가. v2 출시 후에도 v1 12개월 호환 유지.

---

## 0. 공통 규약

### 0.1 인증
모든 보호된 엔드포인트는 `Authorization: Bearer <access_token>` 헤더 필수. 자세한 토큰 정책: [`authentication.md`](authentication.md)

### 0.2 응답 포맷

**성공**:
```json
{
  "data": { ... },
  "meta": { ... }       // 페이지네이션, 카운트 등 (선택)
}
```

**에러**:
```json
{
  "error": {
    "code": "LEAVE_INSUFFICIENT_BALANCE",
    "message": "남은 연차가 부족합니다.",
    "details": { "remaining": 1.5, "requested": 3 },
    "trace_id": "01HXXXXXXXXXX"
  }
}
```

### 0.3 페이지네이션
커서 기반.

```
GET /attendance/records?cursor=eyJ...&limit=20

→ {
  "data": [...],
  "meta": { "next_cursor": "eyJ...", "has_more": true }
}
```

### 0.4 멱등성
`POST` 중 멱등이 필요한 요청 (출근, 결제 등) 은 `Idempotency-Key: <uuid>` 헤더 지원.

### 0.5 시간 / 타임존
- 모든 timestamp는 ISO 8601 UTC (`2026-05-04T09:00:00Z`)
- 클라이언트가 요청 시 `X-Timezone: Asia/Seoul` 헤더로 표시 TZ 명시
- 서버는 회사 기본 TZ 로 비즈니스 룰 평가 (예: 출근 시각 비교)

### 0.6 다국어
- 응답 메시지(에러 등)는 `Accept-Language: ko, en;q=0.5` 협상
- 도메인 데이터는 항상 원문 그대로 반환

### 0.7 Rate Limit
- 인증된 사용자: 분당 600 req
- 비인증 (auth/login 등): 분당 20 req per IP
- 초과 시 `429 TOO_MANY_REQUESTS` + `Retry-After` 헤더

---

## 1. Auth

| Method | Path | 설명 |
|---|---|---|
| POST | `/auth/signup` | 이메일 회원가입 |
| POST | `/auth/login` | 로그인 (Access + Refresh 발급) |
| POST | `/auth/refresh` | Access token 재발급 |
| POST | `/auth/logout` | Refresh token 무효화 |
| POST | `/auth/password/change` | 비밀번호 변경 (인증된 사용자) |
| POST | `/auth/2fa/enable` | TOTP 시크릿 발급 (활성화 전) |
| POST | `/auth/2fa/verify` | TOTP 코드 검증 → 활성화 + 복구코드 |
| POST | `/auth/2fa/disable` | TOTP 비활성화 (현재 코드 필요) |
| POST | `/auth/2fa/challenge` | 로그인 후 2FA 토큰 + 코드 → 액세스 발급 |
| POST | `/auth/email/verify` | 이메일 인증 |
| POST | `/auth/email/resend` | 인증 메일 재발송 |
| POST | `/auth/password/forgot` | 비밀번호 찾기 메일 |
| POST | `/auth/password/reset` | 비밀번호 재설정 |
| GET  | `/auth/oauth/{provider}/start` | OAuth 시작 (`google`, `kakao`) |
| GET  | `/auth/oauth/{provider}/callback` | OAuth 콜백 |
| GET  | `/admin/audit` | 감사 로그 조회 (ADMIN+) |

### POST /auth/signup
**Request**
```json
{ "email": "user@co.com", "password": "********", "name": "홍길동", "locale": "ko" }
```
**Response 201**
```json
{ "data": { "user_id": "uuid", "email_verification_required": true } }
```
에러: `EMAIL_ALREADY_EXISTS`, `WEAK_PASSWORD`, `INVALID_EMAIL`

### POST /auth/login
**Request**
```json
{ "email": "user@co.com", "password": "********" }
```
**Response 200**
```json
{
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "access_expires_in": 1800,
    "refresh_expires_in": 1209600,
    "user": { "id": "uuid", "email": "...", "name": "...", "locale": "ko" },
    "memberships": [ { "id":"...", "company": {...}, "role": "EMPLOYEE" } ]
  }
}
```
에러: `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `ACCOUNT_LOCKED`

> **Lockout 정책**: 5회 연속 실패 시 15분간 423 ACCOUNT_LOCKED. 성공 시 카운터 리셋.
> **2FA 켠 사용자**: 위 응답 대신 `{ "two_fa_required": true, "two_fa_token": "<60s 서명 토큰>" }` 반환 → `/auth/2fa/challenge` 호출 필요.

### POST /auth/logout
현재 refresh token 을 블랙리스트에 등록하고 audit `auth.logout` 기록.
**Request** `{ "refresh_token": "..." }` → **200** `{ "data": { "logged_out": true } }`

### POST /auth/password/change
인증된 사용자가 비밀번호 변경. 검증 통과 시 해당 사용자의 모든 refresh 토큰 즉시 블랙리스트.
**Request** `{ "old_password": "...", "new_password": "..." }` → **200** `{ "data": { "changed": true } }`
에러: `INVALID_CREDENTIALS` (old 불일치), `VALIDATION_ERROR` (정책 미달)

### POST /auth/2fa/enable
TOTP 시크릿 + provisioning URI 반환. 사용자는 이 시점에서 *아직 활성화되지 않음* — `verify` 호출 시에만 켜진다.
**Response** `{ "data": { "secret": "BASE32...", "otpauth_uri": "otpauth://totp/..." } }`

### POST /auth/2fa/verify
**Request** `{ "code": "123456" }` → **200** `{ "data": { "enabled": true, "recovery_codes": ["xxxx-xxxx", ...] } }` (10개, 1회용, 평문은 이때만 노출)

### POST /auth/2fa/disable
**Request** `{ "code": "123456" }` → **200** `{ "data": { "enabled": false } }`. 시크릿 + 복구 코드 모두 삭제.

### POST /auth/2fa/challenge
**Request** `{ "two_fa_token": "...", "code": "123456" }` (코드는 TOTP 또는 복구 코드)
**Response 200** `{ "data": { "access_token": "...", "refresh_token": "...", ... } }`
에러: `TOKEN_EXPIRED` (60초 만료), `INVALID_CREDENTIALS`

### POST /auth/email/verify
이메일 인증 토큰을 검증하고 `is_email_verified` 를 true 로 전환. 멱등 — 두 번째 호출은 409.
**Request**
```json
{ "token": "<signed-token-from-email-link>" }
```
**Response 200**
```json
{ "data": { "verified": true } }
```
에러: `EMAIL_VERIFY_INVALID` (400, 위조/만료), `EMAIL_ALREADY_VERIFIED` (409)

### POST /auth/email/resend
인증 메일 재발송. 항상 200 (account enumeration 방어 — 모르는 이메일도 동일 응답).
**Request** `{ "email": "user@co.com" }` → **200** `{ "data": { "sent": true } }`
> 미인증 사용자에 한해 NotificationOutbox 에 EMAIL 행이 추가되며, 이미 인증된 / 모르는 이메일은 silently no-op.

### POST /auth/password/forgot
비밀번호 재설정 메일 큐잉. 항상 200 (enumeration 방어).
**Request** `{ "email": "user@co.com" }` → **200** `{ "data": { "sent": true } }`

### POST /auth/password/reset
재설정 토큰을 소비하고 새 비밀번호 적용. 모든 refresh 토큰 블랙리스트 + 잠금 카운터 초기화.
**Request**
```json
{ "token": "<signed-token>", "new_password": "BrandNew!42" }
```
**Response 200**
```json
{ "data": { "reset": true } }
```
에러: `PASSWORD_RESET_INVALID` (400, 위조/만료), `PASSWORD_RESET_USED` (400, 재사용), `VALIDATION_ERROR` (400, 정책 미달)
> 토큰 TTL 15분, jti 는 Redis SETNX 로 30분 봉인 → 동일 토큰 재사용 불가.

### GET /auth/oauth/{provider}/start
OAuth 시작 — `provider` ∈ `google | kakao`. PKCE state 발급 + DB 저장.
**Query**: `redirect_uri=<absolute-url>` 필수
**Headers**: `Accept: application/json` 일 때 JSON 응답, 그 외엔 302 리다이렉트.
**Response 200 (JSON)**
```json
{ "data": { "url": "https://accounts.google.com/o/oauth2/v2/auth?...", "state": "..." } }
```
**Response 302 (HTML)**: `Location: <provider-auth-url>`
에러: `OAUTH_NOT_CONFIGURED` (503, client_id 미설정), `OAUTH_UNKNOWN_PROVIDER` (400)

### GET /auth/oauth/{provider}/callback
OAuth 콜백 — code/state → 토큰 교환 → User 발급/연동. 응답 형식은 `/auth/login` 과 동일.
**Query**: `code=<authcode>&state=<echoed-state>`
**Response 200**
```json
{
  "data": {
    "access_token": "...", "refresh_token": "...",
    "access_expires_in": 1800, "refresh_expires_in": 1209600,
    "user": { "id": "uuid", "email": "...", "name": "...", "locale": "ko" },
    "created": false
  }
}
```
> 2FA 가 켜진 사용자는 대신 `{ "two_fa_required": true, "two_fa_token": "..." }` 반환 (`/auth/2fa/challenge` 호출 필요).
에러: `OAUTH_STATE_INVALID` (400, CSRF/만료), `OAUTH_EMAIL_NOT_VERIFIED` (400, 기존 사용자 연동 거부), `OAUTH_EMAIL_REQUIRED` (400, 공급자가 이메일 비반환), `OAUTH_PROFILE_INVALID` (400)

### GET /admin/audit (ADMIN+)
필터: `action`, `actor`, `from`, `to` (ISO-8601), 커서 페이지네이션 (`cursor`, `limit` 1~200, default 50).
**Response** `{ "data": [ { "id": "...", "action": "auth.login.success", "actor_id": "...", "ip": "...", "user_agent": "...", "payload": {...}, "created_at": "..." } ], "next_cursor": "..." }`

---

## 2. Onboarding

| Method | Path | 설명 |
|---|---|---|
| POST | `/onboarding/join-company` | 회사 코드로 조인 |
| PATCH | `/onboarding/profile` | 프로필 입력 |
| POST | `/onboarding/locations` | 위치 등록 |
| PATCH | `/onboarding/schedule` | 근무시간 설정 |
| PATCH | `/onboarding/notifications` | 알림 채널 설정 |
| POST | `/onboarding/complete` | 완료 처리 |

---

## 3. Attendance

| Method | Path | 설명 |
|---|---|---|
| GET | `/attendance/today` | 오늘의 출퇴근 상태 |
| POST | `/attendance/clock-in` | 출근 |
| POST | `/attendance/clock-out` | 퇴근 |
| POST | `/attendance/break/start` | 휴게 시작 |
| POST | `/attendance/break/end` | 휴게 종료 |
| GET | `/attendance/records` | 본인 기록 목록 |
| GET | `/attendance/records/{id}` | 기록 상세 |
| POST | `/attendance/manual-request` | 수동 출근 신청 (위치 외) |

### POST /attendance/clock-in
**Headers**: `Idempotency-Key: <uuid>`
**Request**
```json
{
  "location": { "latitude": 37.5, "longitude": 127.0, "accuracy_m": 12 },
  "kind": "OFFICE",
  "client_time": "2026-05-04T09:01:23+09:00"
}
```
**Response 201**
```json
{
  "data": {
    "record_id": "uuid",
    "clock_in_at": "2026-05-04T00:01:23Z",
    "is_late": false,
    "matched_location": { "id": "uuid", "label": "본사" }
  }
}
```
에러: `ALREADY_CLOCKED_IN`, `LOCATION_OUT_OF_RANGE`, `MANUAL_APPROVAL_REQUIRED`

---

## 4. Overtime

| Method | Path | 설명 |
|---|---|---|
| POST | `/overtime/requests` | 신청 |
| GET  | `/overtime/requests` | 본인 신청 목록 |
| GET  | `/overtime/requests/{id}` | 상세 |
| POST | `/overtime/requests/{id}/cancel` | 취소 |
| GET  | `/overtime/settings` | 자동 요청 설정 조회 |
| PATCH | `/overtime/settings` | 자동 요청 설정 변경 |
| GET  | `/overtime/history` | 이력 (월별 합계 등) |

---

## 5. Leave

| Method | Path | 설명 |
|---|---|---|
| GET | `/leave/balance` | 잔여 / 사용 / 소멸 예정 |
| GET | `/leave/policy` | 회사 연차 정책 (현행) |
| POST | `/leave/requests` | 연차 신청 |
| GET | `/leave/requests` | 본인 신청 목록 |
| GET | `/leave/requests/{id}` | 상세 |
| POST | `/leave/requests/{id}/cancel` | 취소 |
| GET | `/leave/team-calendar` | 팀 연차 캘린더 (월/분기) |

### GET /leave/balance
```json
{
  "data": {
    "granted_total": 15.0,
    "used": 4.0,
    "remaining": 11.0,
    "expiring_soon": [
      { "days": 2.0, "expires_at": "2026-12-31" }
    ]
  }
}
```

---

## 6. Team

| Method | Path | 설명 |
|---|---|---|
| GET | `/team/status` | 전 직원 상태 (회사 내) |
| GET | `/team/status/grid` | 그리드 뷰 |
| GET | `/team/status/grouped` | 부서별 그룹 |
| GET | `/team/status/timeline?date=YYYY-MM-DD` | 타임라인 |
| GET | `/team/members/{membership_id}` | 팀원 상세 (권한 범위 내) |

---

## 7. Inbox & Notifications

| Method | Path | 설명 |
|---|---|---|
| GET | `/inbox` | 통합 인박스 (승인 대기 + 알림) |
| POST | `/inbox/{task_id}/approve` | 승인 |
| POST | `/inbox/{task_id}/reject` | 반려 (사유 포함) |
| GET | `/notifications` | 알림 목록 |
| POST | `/notifications/{id}/read` | 읽음 처리 |
| POST | `/notifications/read-all` | 전체 읽음 |
| POST | `/notifications/devices` | 디바이스 토큰 등록 (FCM/APNs/Web Push) |
| DELETE | `/notifications/devices/{id}` | 토큰 해제 |

---

## 8. Admin

> 모든 엔드포인트는 `ADMIN` 또는 `OWNER` 권한 필수.

| Method | Path | 설명 |
|---|---|---|
| GET | `/admin/dashboard` | 운영 대시보드 (오늘) |
| GET | `/admin/employees` | 직원 목록 / 검색 / 필터 |
| POST | `/admin/employees` | 신규 직원 등록 |
| POST | `/admin/employees/bulk` | CSV 일괄 등록 |
| GET | `/admin/employees/{id}` | 직원 상세 |
| PATCH | `/admin/employees/{id}` | 정보 / 권한 수정 |
| POST | `/admin/employees/{id}/deactivate` | 비활성화 |
| GET | `/admin/approvals` | 승인 대기 통합 |
| POST | `/admin/approvals/bulk` | 일괄 승인/반려 |
| GET | `/admin/leave/expiring` | 소멸 임박 연차 목록 |
| POST | `/admin/leave/grant` | 일괄 부여 (특별 휴가 등) |
| GET | `/admin/leave/policy` | 정책 조회 |
| PUT | `/admin/leave/policy` | 정책 수정 (버전 증가) |
| GET | `/admin/reports/monthly?ym=YYYY-MM` | 월간 리포트 |
| GET | `/admin/reports/weekly?w=YYYY-Www` | 주간 리포트 |
| GET | `/admin/reports/export?format=csv|pdf` | 내보내기 |
| GET | `/admin/compliance/52h` | 52시간 컴플라이언스 |
| GET | `/admin/live` | 실시간 보드 (WS upgrade 가능) |
| POST | `/admin/company-codes` | 가입 코드 발급 |
| GET | `/admin/company-codes` | 코드 목록 |
| DELETE | `/admin/company-codes/{id}` | 코드 회수 |

### POST /admin/employees/bulk
**Request** — `multipart/form-data`
- `file` (required) — UTF-8 CSV. 헤더 행: `email,name,role,department_name,employee_no,position,hired_at,locale`. `hired_at`은 `YYYY-MM-DD`. 빈 컬럼은 허용 (위치/사번 등). `role`은 `EMPLOYEE|MANAGER|ADMIN|OWNER` (대소문자 무시).
- `dry_run` (optional) — `"true"` 시 검증만 수행. DB 변경 없음.

**Response 200**
```json
{
  "data": {
    "created": ["alice@co.com", "bob@co.com"],
    "skipped": [{ "email": "carol@co.com", "reason": "ALREADY_MEMBER" }],
    "errors": [{ "row_index": 4, "email": "", "message": "INVALID_EMAIL" }],
    "count_created": 2,
    "count_skipped": 1,
    "count_errors": 1,
    "dry_run": false
  }
}
```
- 신규 사용자는 `set_unusable_password()` 상태로 생성 → 첫 로그인 전 비밀번호 재설정(이메일 링크) 필수.
- 행 단위 트랜잭션 — 일부 실패해도 정상 행은 모두 커밋. 멱등성: 두 번째 호출은 모두 `ALREADY_MEMBER` 로 SKIP.
- 감사 로그: `identity.bulk_imported` (count_*).

에러: `FILE_REQUIRED` (multipart 누락), `INVALID_CSV` (헤더/디코딩 오류), `403 FORBIDDEN` (EMPLOYEE 권한).

### GET /admin/reports/export
**Query**
- `format=csv|pdf` (default `csv`).
- `ym=YYYY-MM` (default 현재 월).

**Response 200 — CSV**
- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="monthly-2026-05.csv"`
- 헤더 행 + 멤버별 1행: `membership_id,name,department,days,late_days,total_minutes,leave_used`.

**Response 200 — PDF**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="monthly-2026-05.pdf"`
- A4. 타이틀 (회사명 · YYYY-MM 근태 리포트), KPI 박스 (총 인원 / 평균 근무시간 / 지각 일수 / 연차 사용일), 직원별 표.
- Korean 글꼴 (`NotoSansKR-Regular.otf`)이 번들되어 있을 때만 한글 라벨; 미설치 시 romanized 라벨로 폴백 (`apps/admin_api/exporters/fonts/requirements-fonts.md` 참조).

에러: `INVALID_FORMAT` (422, `format` 이 csv/pdf 외), `INVALID_YM` (422).

---

## 9. Realtime (WebSocket)

```
wss://api.work-manager.molcube.com/v1/ws?token=<access_token>
```

**채널**:
- `team:{company_id}` — 팀원 상태 변경
- `inbox:{membership_id}` — 새 승인 요청 / 결과
- `admin:{company_id}` — 관리자 실시간 보드

**메시지 포맷**:
```json
{ "channel": "team:uuid", "event": "status.changed", "payload": { ... }, "ts": "..." }
```

---

## 10. Files / Misc

| Method | Path | 설명 |
|---|---|---|
| POST | `/files/upload` | 파일 업로드 (presigned URL 반환 후 PUT) |
| GET | `/i18n/{locale}.json` | 클라이언트용 i18n 번들 (캐시 가능) |
| GET | `/health` | 헬스체크 (auth 불필요) |
| GET | `/version` | 빌드 / 버전 메타 |

---

## 10.5 Trip (출장/외근)

m-trip 화면이 사용. 결재는 기존 `/inbox/{id}/approve|reject` 를 그대로 사용한다 (target_type=`TRIP`).

| Method | Path | 권한 | 설명 |
|---|---|---|---|
| POST | `/trip/requests` | 활성 멤버 | 신청 (BUSINESS_TRIP\|FIELD_WORK) → ApprovalTask 생성 |
| GET | `/trip/requests?status=` | 활성 멤버 | 본인 신청 목록 |
| GET | `/trip/requests/{id}` | 활성 멤버 (본인 또는 MANAGER+) | 상세 |
| POST | `/trip/requests/{id}/cancel` | 본인 | PENDING/APPROVED 취소 |

### POST /trip/requests
**Request**
```json
{ "kind": "BUSINESS_TRIP", "start_date": "2026-06-01", "end_date": "2026-06-03", "location_label": "부산 본사", "purpose": "고객 미팅" }
```
**Errors**: `INVALID_RANGE` 422 (end_date < start_date), `LOCATION_REQUIRED` 422, `INVALID_KIND` 422.

승인 시 `notification.event_kind = TRIP_DECISION` 이 신청자에게 dispatch 된다.

---

## 10.6 Notice (공지사항)

m-notice 화면이 사용. 회사 단위로 격리되어 있으며, 작성/수정/보관은 ADMIN/OWNER 만 가능.

| Method | Path | 권한 | 설명 |
|---|---|---|---|
| GET | `/notices?pinned=&category=&q=&include_archived=` | 활성 멤버 | 같은 회사 공지 목록 (pinned, priority desc, published_at desc) |
| GET | `/notices/{id}` | 활성 멤버 | 상세 |
| POST | `/notices` | ADMIN+ | 작성 (`title`, `body`, `pinned`, `priority`, `category`) |
| PATCH | `/notices/{id}` | ADMIN+ | 부분 수정 |
| POST | `/notices/{id}/archive` | ADMIN+ | 보관 (archived_at 설정 → 기본 list 에서 숨김) |

`category` 값: `policy` | `event` | `it` | `hr` | `general`. 다른 회사 공지는 절대 노출되지 않는다 (테넌시).

---

## 11. 에러 코드 (요약)

| 코드 | HTTP | 설명 |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | 로그인 실패 |
| `TOKEN_EXPIRED` | 401 | 토큰 만료 |
| `EMAIL_NOT_VERIFIED` | 403 | 이메일 미인증 |
| `ACCOUNT_LOCKED` | 423 | 계정 잠금 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `RESOURCE_NOT_FOUND` | 404 | 리소스 없음 |
| `VALIDATION_ERROR` | 422 | 입력 검증 실패 (`details.fields[]`) |
| `ALREADY_CLOCKED_IN` | 409 | 중복 출근 |
| `LOCATION_OUT_OF_RANGE` | 422 | 위치 범위 외 |
| `MANUAL_APPROVAL_REQUIRED` | 409 | 수동 승인 필요 |
| `LEAVE_INSUFFICIENT_BALANCE` | 422 | 연차 부족 |
| `OVERLAPPING_LEAVE` | 409 | 기간 중복 |
| `IDEMPOTENCY_KEY_CONFLICT` | 409 | 동일 키 다른 페이로드 |
| `RATE_LIMITED` | 429 | 호출 제한 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |
| `SERVICE_UNAVAILABLE` | 503 | 의존 서비스 장애 |

전체 코드 사전: [`api/error-codes.md`](error-codes.md) (별도 관리)

---

## 12. 호환성 / 변경 정책

- **Backward-compatible**: 필드 추가, 새 enum 값 추가 (단 기본값 안전), 새 엔드포인트
- **Breaking**: 필드 삭제, 타입 변경, 엔드포인트 제거 → 새 메이저 버전 필요
- 모든 변경은 [`api/changelog.md`](changelog.md) 에 기록
- Deprecated 엔드포인트는 응답 헤더 `Deprecation: true`, `Sunset: <RFC date>` 포함
