# SOP · 사용자 데이터 Export 요청 처리 (Data Subject Access Request)

- **Owner**: Data Protection Officer (DPO) / 보안 담당
- **Last Reviewed**: 2026-05-04
- **참고**: [`runbook.md`](../runbook.md) §10 (R-010), [`operations-guide.md`](../operations-guide.md) §8.4

## Purpose

GDPR Article 15 (Right of Access) 및 한국 개인정보보호법 제35조 (개인정보의 열람) 에 따라 사용자가 본인의 데이터 사본(Data Export) 을 요청할 때, **신원 검증 → 데이터 수집 → 안전한 전달 → 감사 로그** 의 표준 절차를 정의한다.

## Scope

- **포함**: 본인 또는 법정대리인의 데이터 export 요청, 회사 OWNER 의 본인 회사 전체 데이터 export
- **제외**: 사법기관 영장에 의한 데이터 제출(별도 법무 검토 절차), 익명화된 통계 데이터 요청

## 법적 요구 시한

- **GDPR**: 1개월 (정당한 사유로 2개월 연장 가능, 사용자 통지 필수)
- **한국 개인정보보호법**: 10일 (지연 시 사유 통지)
- **운영 SLA**: 영업일 기준 **3일 내 완료** 목표 (법적 시한의 절반).

## Steps

### 1. 요청 접수

요청 채널:

- 앱 내 "내 정보 → 데이터 다운로드" (예정 — v1.x)
- `privacy@molcube.com` 이메일
- CS 채팅

접수자는 다음을 1차 확인 후 DPO/보안 담당에게 티켓 핸드오프:

- 요청자 이메일
- 요청 범위 (본인 데이터 / 회사 전체 / 특정 도메인만)
- 요청 형식 (JSON, CSV, PDF 중 선택 — 기본 JSON)

### 2. 신원 검증 (Identity Verification)

**필수 — 검증 없이 export 발급 절대 금지.**

검증 절차:

1. 요청 이메일이 시스템에 등록된 이메일과 일치하는지 확인.
2. 해당 이메일로 6자리 OTP 발송 → 사용자가 응답 (24시간 유효).
3. OTP 일치 + 해당 사용자가 활성 멤버십 보유 → 검증 통과.
4. 요청 범위가 "회사 전체" 인 경우 → 요청자가 OWNER 이어야 함. 아닐 시 거절 + 사유 회신.
5. 법정대리인(미성년자 법정대리인 등) 요청 시 → 법무 검토 후 별도 처리.

검증 실패 시: 사용자에게 회신 + audit_log 에 `data_export.identity_verification_failed` 기록.

### 3. 데이터 수집 (Admin Export)

운영 관리자가 admin UI 또는 admin CLI 사용:

```bash
docker compose exec -T api python manage.py export_user_data \
  --user-email "alice@example.com" \
  --format json \
  --output /tmp/export-<request_id>.zip
```

(스텁 명령 — `services/api/apps/admin_api/management/commands/export_user_data.py` 가 향후 구현 예정. MVP 단계에서는 admin shell 스크립트로 수동 수집.)

수집 대상:

- `User` (이메일, 이름, 연락처, 가입일, last_login)
- `Membership` (회사, 부서, 직급, 입사일, 권한 — 회사명은 마스킹 옵션)
- `AttendanceRecord` (전체)
- `LeaveRequest` + `LeaveBalance`
- `OvertimeRequest`
- `ApprovalTask` (요청자 본인이 등장하는 것만)
- `NotificationLog` (수신 기록)
- `DeviceToken` (단말 등록 기록 — 토큰 자체는 마스킹)
- `AuditLog` (해당 사용자가 actor 인 이벤트)

수집 안 할 것:

- 다른 사용자의 PII (예: 결재 승인자의 이메일은 마스킹)
- 시스템 내부 ID (UUID 는 유지하되 의미 없음 명시)
- 비밀번호 해시, JWT, refresh token

### 4. ZIP 생성 + S3 Presigned URL 발급

1. 수집한 JSON / CSV 파일을 `export-<request_id>.zip` 으로 압축.
2. ZIP 에 `README.md` 포함 — 각 파일의 의미, 시간/타임존 표기, 데이터 보관 정책 안내.
3. S3 업로드: `s3://wm-prod-exports/<company_id>/<request_id>.zip`. 버킷은 server-side encryption (KMS) 활성화.
4. Presigned URL 발급 — **유효기간 7일** (`runbook.md` §R-010 기준).
5. URL 발송 채널 — 사용자 계정 이메일 (Bearer 토큰 없이 다운로드 가능하도록 설계).

### 5. 사용자 통지

이메일 템플릿: `data_export_ready.html`

포함:

- presigned URL + 만료일시
- 다운로드 가이드 (브라우저 → "Save As")
- ZIP 안의 파일 설명
- 7일 후 자동 삭제 안내
- 추가 문의 시 `privacy@molcube.com`

### 6. 감사 로그 기록

자동으로 기록되는 이벤트:

- `data_export.requested` — 요청 접수
- `data_export.identity_verified` — 신원 검증 통과
- `data_export.generated` — ZIP 생성 (size_bytes 포함)
- `data_export.url_issued` — presigned URL 발급
- `data_export.downloaded` — S3 access log 기준 (CloudTrail / S3 access logging 활용)

수동 기록(운영자가 audit 시스템에 추가):

- 처리 담당자, 처리 소요 시간, 특이사항

### 7. 정리

- 7일 후 S3 ZIP 자동 삭제 (lifecycle policy `wm-exports-7d-expire`).
- audit_log 의 export 기록은 7년 보존 (개인정보보호법 손실 책임 입증용).
- 처리 결과를 사용자에게 회신 — 요청 일자, 발송 일자, 만료 일자, 다운로드 성공 여부.

## Success Criteria

- [ ] 요청 접수 후 3 영업일 내 presigned URL 발급
- [ ] 신원 검증 OTP 일치 후에만 export 진행
- [ ] ZIP 안에 다른 사용자 PII 누출 0건
- [ ] presigned URL 7일 후 자동 만료
- [ ] audit_log 5종 이벤트 모두 기록
- [ ] 사용자가 다운로드 완료 회신 또는 7일 후 만료 처리

## Edge Cases

- **회사 OWNER 의 회사 전체 export**: 양이 매우 클 수 있음. ZIP 분할 또는 S3 폴더 단위 presigned URL 다수 발급. 별도 SLA 협의 (영업일 기준 7일).
- **퇴사 사용자**: 멤버십이 비활성이어도 export 가능. 단, 회사 데이터 접근권은 사라졌으므로 본인 데이터만.
- **삭제 처리 중인 사용자**: SOP-data-deletion-request 와 충돌 시 export 우선 처리 후 deletion 진행.
- **법인 분쟁 / 소송 중인 회사**: 법무 검토 필수. 단순 운영 SOP 로 진행 금지.

## 도구 / 시스템

- AWS S3: `wm-prod-exports` 버킷 (서버사이드 암호화, 7일 lifecycle)
- AWS SES: `data_export_ready.html` 템플릿
- Audit log: `apps/audit/services.py:write_event(...)`
- Admin CLI: `manage.py export_user_data` (작성 예정)

## 메모

- 데이터 export 명령 (`export_user_data`) 의 자동화 정도는 v1.x 에서 개선 예정. 현재는 수동 shell 작업 + 검증.
- 통지 이메일이 SES bounce / complaint 받으면 SOP-email-reputation-recovery 발동.
- 사용자 본인 셀프 export(앱 내 다운로드) 도입 시 이 SOP 는 "복잡한 케이스만 매뉴얼" 으로 좁혀진다.
