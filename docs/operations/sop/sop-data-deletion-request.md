# SOP · 사용자 데이터 삭제 요청 처리 (Right to be Forgotten)

- **Owner**: Data Protection Officer (DPO) / 보안 담당
- **Last Reviewed**: 2026-05-04
- **참고**: [`runbook.md`](../runbook.md), [`operations-guide.md`](../operations-guide.md) §8.4, [SOP-data-export-request](sop-data-export-request.md)

## Purpose

GDPR Article 17 (Right to Erasure) 및 한국 개인정보보호법 제36조 (개인정보의 정정·삭제) 에 따라, 사용자가 본인 데이터의 삭제(파기) 를 요청할 때 **법적 보존 의무를 침해하지 않으면서** 표준 절차로 처리한다.

## Scope

- **포함**: 본인 또는 법정대리인의 삭제 요청, 회사 계약 종료에 따른 회사 단위 데이터 파기(별도 트리거)
- **제외**: 사법기관 영장 / 법적 분쟁 중 데이터(법무 검토 후), 익명화된 통계 보존

## 법적 보존 의무 (Legal Hold Exceptions)

다음은 사용자 요청이 있어도 즉시 삭제 불가:

| 데이터 | 보존 기간 | 근거 |
|---|---|---|
| 출퇴근 기록 (`AttendanceRecord`) | **5년** | 근로기준법 제42조 (근로자 명부 / 근로 관계 서류) |
| 임금/연차 결정 관련 (`LeaveRequest`, `LeaveBalance`, `OvertimeRequest`) | **3년** | 근로기준법 제42조 |
| 감사 로그 (`AuditLog`) | **7년** | 개인정보보호법 손실 책임 입증 |
| 재무 / 정산 데이터 (해당 시) | **5년** | 상법 제33조 |

원칙: PII (이름, 이메일, 전화) 는 즉시 익명화/마스킹 가능. 출퇴근 시각 / 연차 일수 같은 **사실 데이터** 는 사번 또는 익명 ID 와만 결합한 형태로 법정 기간 보존 후 파기.

## 법적 요구 시한

- **GDPR**: 1개월 (연장 시 통지)
- **한국 개인정보보호법**: 10일 내 파기 또는 사유 통지
- **운영 SLA**: 영업일 기준 **5일 내 1차 처리(소프트 삭제 + 사용자 통지)**

## Steps

### 1. 요청 접수 + 신원 검증

SOP-data-export-request §1, §2 와 동일.

추가 확인:

- 사용자가 회사 OWNER 인 경우 → 본인 데이터만 삭제 가능. 회사 전체 데이터 삭제는 회사 계약 종료 절차(별도) 에서.
- 사용자가 결재 승인자(MANAGER) 인 경우 → 다른 사용자의 결재 기록에 본인 ID 가 남아 있음. 마스킹/익명화 처리 필요(아래 5단계).

### 2. 사용자 사전 동의 + 영향 안내

이메일/앱 내 동의:

- "데이터 삭제가 시작되면 30일 이내 취소 가능합니다."
- "법적 보존 대상(출퇴근 5년, 연차 3년) 은 즉시 삭제되지 않으며, 본인 식별 정보(이름, 이메일, 전화) 만 익명화됩니다."
- "삭제 후에는 동일 이메일로 새 가입은 가능하나, 이전 데이터에 접근할 수 없습니다."

사용자가 명시적으로 "이해함, 진행" 회신 → 다음 단계.

### 3. 소프트 삭제 (Soft Delete) — 즉시

운영 관리자가 admin shell 또는 admin API:

```bash
docker compose exec -T api python manage.py soft_delete_user \
  --user-email "alice@example.com" \
  --reason "user-requested-erasure-2026-05-04"
```

(스텁 — `services/api/apps/admin_api/management/commands/soft_delete_user.py` 가 v1.x 에 추가 예정. MVP 는 admin shell.)

수행 작업:

1. `User.is_active = False` + `User.deleted_at = now()` (필드 추가 예정)
2. 모든 `Membership.is_active = False`
3. `User.email` 을 `<uuid>@deleted.invalid` 로 임시 마스킹 (재가입 가능하도록 unique 충돌 회피)
4. 모든 활성 세션 / refresh token 무효화
5. 모든 `DeviceToken` 비활성화 → 푸시 발송 중단
6. 사용자 본인이 actor 인 모든 `AuditLog` 에는 손대지 않음 (보존)
7. 모든 처리 → audit_log: `user.soft_deleted` (actor=운영자, target=사용자, payload=사유)

이 단계에서 사용자가 30일 내 "복원" 요청하면 위 작업을 reverse 가능.

### 4. 사용자 통지

이메일 템플릿: `data_deletion_initiated.html`

- 처리 시작 일시, 30일 보호 기간 종료일
- 보존되는 데이터 목록 (출퇴근, 연차 — 익명화 후)
- 30일 내 복원 방법 (`privacy@molcube.com` 회신)
- 30일 후 영구 삭제 일정

### 5. 30일 보호 기간 (Cooling-off Period)

이 기간 동안:

- 사용자가 복원 요청 → 운영자가 admin 으로 `User.is_active = True`, 이메일 복원, 멤버십 복원.
- 복원 시 audit_log: `user.restored` 기록.
- 복원 미요청 시 30일 후 단계 6 자동 실행.

### 6. 물리 삭제 (Physical Delete) — Celery 배치

매일 자정 Celery Beat 가 `soft_delete_at + 30d <= now()` 인 사용자 대상으로 `tasks.compliance.physical_delete_user` 실행 (작성 예정).

수행 작업:

1. PII 익명화:
   - `User.name` → `"deleted-user"`
   - `User.email` 은 이미 마스킹됨
   - `User.phone` (있다면) → `null`
   - `Membership.position`, `Membership.employee_no` → `null`
2. 법적 보존 대상은 사용자 ID 와의 연결 유지하되 PII 만 마스킹 (위 1번이 동일 행동).
3. 법적 보존 대상이 아닌 데이터 물리 삭제:
   - `DeviceToken` 행 삭제
   - `NotificationLog` 행 삭제 (수신 기록 — 발송 통계만 익명 집계 보존)
   - `Notification.Preference` 삭제
   - 프로필 이미지 (S3) 삭제
4. 다른 사용자에게 영향:
   - 결재 기록의 승인자/요청자 표시는 "deleted-user" 로 자동 표시
   - 팀 보드에서 해당 사용자 표시 사라짐
5. audit_log: `user.physically_deleted` 기록

### 7. 법적 보존 데이터 만료 처리 (별도 배치)

- `AttendanceRecord.work_date + 5y < today` → 행 자체 물리 삭제 (5년 후)
- `LeaveRequest.created_at + 3y < today` → 물리 삭제
- `OvertimeRequest.created_at + 3y < today` → 물리 삭제
- `AuditLog.created_at + 7y < today` → 물리 삭제 (단, GDPR 침해 분쟁 진행 중이면 제외)

이 배치는 회사 단위가 아니라 글로벌. Celery Beat 의 `compliance.expire_legal_hold` (작성 예정) 가 매월 1일 실행.

### 8. 사용자 최종 통지

물리 삭제 완료 후 1회만:

- 가능하면 사용자가 사용했던 외부 이메일 (등록 시 입력) 로 발송
- 이메일이 마스킹돼서 발송 불가하면 미발송 (audit_log 에만 기록)
- 내용: "요청하신 데이터 삭제가 완료되었습니다. (날짜)"

## Success Criteria

- [ ] 요청 접수 후 5 영업일 내 소프트 삭제 + 사용자 통지
- [ ] 30일 보호 기간 동안 사용자가 복원 가능
- [ ] 30일 후 물리 삭제 + 익명화 자동 실행
- [ ] 법적 보존 대상 데이터는 PII 만 마스킹, 사실 데이터는 보존
- [ ] audit_log 4종 (`soft_deleted`, `restored`(선택), `physically_deleted`) 기록
- [ ] 다른 사용자 데이터 손상 0건

## Edge Cases

- **회사 OWNER 가 삭제 요청**: 회사에 새 OWNER 위임이 선행되어야 함. 위임 없이 OWNER 삭제 불가 — 거절 + 안내.
- **결재 진행 중인 사용자**: 진행 중 결재(`ApprovalTask.status = PENDING`) 가 있으면 알림 후 1주 유예. 사용자가 결재 처리 또는 취소 후 삭제 진행.
- **사용자가 다중 회사 (v2 가정)**: 한 회사 멤버십만 종료할지, 모든 회사 데이터 삭제할지 명시적 동의 필요.
- **사법기관 / 노동부 조사 진행 중**: 법무 검토. 데이터 보존 명령(legal hold) 적용된 사용자는 삭제 보류 + audit_log 에 사유 기록.
- **회사 자체가 계약 종료**: 별도 SOP (회사 단위 파기, 작성 예정). 30일 후 모든 회사 데이터 익명화, 90일 후 물리 삭제(`operations-guide.md` §8.4).

## 도구 / 시스템

- Admin CLI: `manage.py soft_delete_user` (작성 예정)
- Celery Beat: `compliance.physical_delete_user` (작성 예정)
- Celery Beat: `compliance.expire_legal_hold` (작성 예정)
- Audit: `apps/audit/services.py`

## 메모

- 위에 언급한 management command 와 Celery 태스크는 v1.x 로드맵. MVP 단계에서는 admin shell 수동 작업 + 체크리스트.
- Email bounce 누적 시 SOP-email-reputation-recovery 와 연계.
- 다른 사용자가 본 결재함 / 팀 보드의 표시 갱신은 WS 브로드캐스트로 자동.
