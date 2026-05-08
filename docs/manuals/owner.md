# OWNER 매뉴얼 (회사 오너 가이드)

> 대상: 회사 오너 (OWNER 역할 계정)
> 마지막 업데이트: 2026-05-08
> 관련 문서:
> - [관리자 매뉴얼 (admin.md)](admin.md)
> - [운영 SOP 색인](../operations/operations-guide.md#12-운영-sop-색인)

---

## 1. OWNER 역할이란

OWNER 는 회사의 최상위 관리 계정입니다. ADMIN 이 수행할 수 있는 모든 작업에 더해 다음을 할 수 있습니다.

| 권한 | OWNER | ADMIN |
|---|---|---|
| 회사 정보 · 브랜드 · 정책 변경 | ✅ | 읽기만 |
| 멤버 역할 변경 (OWNER 포함) | ✅ | ADMIN 이하만 |
| 데이터 export / 삭제 요청 | ✅ | - |
| 감사 로그 조회 | ✅ | ✅ |
| 가입 코드 발급 / 회수 | ✅ | ✅ |

---

## 2. 회사 정보 변경 SOP

### 2.1 진입

1. `/admin/settings` 접속 (좌측 사이드바 → "회사 설정").
2. OWNER 계정으로 로그인되어 있어야 저장 버튼이 활성화됩니다.

### 2.2 변경 가능 항목

| 탭 | 항목 |
|---|---|
| 회사 정보 | 회사명, 산업군, 주소, 이메일 도메인 |
| 브랜드 | 로고 URL (HTTPS 필수), 브랜드 컬러 (`#RRGGBB`) |
| 정책 | 52시간 초과 차단(`compliance_block_when_over`), 연장 기간 |

### 2.3 저장 후

- 변경 내용은 즉시 DB 에 반영됩니다.
- 출퇴근 · 연차 정책 변경은 이후 발생하는 이벤트부터 적용됩니다 (소급 없음).
- 모든 변경은 감사 로그(`/admin/audit`)에 자동 기록됩니다.

---

## 3. 데이터 Export 요청 절차

> **SOP 원문**: [`sop-data-export-request.md`](../operations/sop/sop-data-export-request.md)

현재 데이터 export 는 이메일 요청 방식으로 처리됩니다.

1. `privacy@molcube.com` 으로 아래 내용을 포함한 이메일 발송:
   - 회사명 및 회사 ID (설정 화면에서 확인)
   - 요청자 이름 및 직책
   - 요청 데이터 범위 (전체 / 기간 / 특정 직원)
   - 데이터 수령 방식 (암호화 ZIP / 보안 링크)
2. 담당자가 신원 확인 후 **영업일 5일 이내** 에 암호화된 파일을 제공합니다.
3. export 요청 및 다운로드 이력은 audit log 에 기록됩니다.

> v1.x 에서 앱 내 "데이터 다운로드" 버튼이 추가될 예정입니다.

---

## 4. 데이터 삭제 요청 절차

> **SOP 원문**: [`sop-data-deletion-request.md`](../operations/sop/sop-data-deletion-request.md)

회사 또는 특정 직원의 데이터 삭제(GDPR / 개인정보보호법 §35) 를 요청하는 경우:

1. `privacy@molcube.com` 으로 이메일 발송:
   - 회사명, 요청자 정보, 삭제 대상 범위
   - 삭제 근거 (계약 종료 / 개인정보 보호법 삭제 요청 등)
2. 요청 접수 확인 후 **30일 이내** 처리 (법적 보존 의무가 있는 데이터는 의무 기간 경과 후 삭제).
3. 처리 결과를 이메일로 통보합니다.

---

## 5. SOP 빠른 링크

| 상황 | SOP 문서 |
|---|---|
| 신규 직원 가입 코드 발급 | [admin-company-codes.md](admin-company-codes.md) |
| 신규 회사 온보딩 | [sop-onboard-new-company.md](../operations/sop/sop-onboard-new-company.md) |
| 데이터 export 요청 처리 | [sop-data-export-request.md](../operations/sop/sop-data-export-request.md) |
| 데이터 삭제 요청 처리 | [sop-data-deletion-request.md](../operations/sop/sop-data-deletion-request.md) |
| 비밀번호 강제 리셋 | [sop-emergency-password-reset.md](../operations/sop/sop-emergency-password-reset.md) |

---

## 6. 도움말 / 문의

- 앱 내: `/m/help` → "OWNER 매뉴얼" 링크
- 이메일: `privacy@molcube.com` (개인정보 · 데이터 관련) / `support@molcube.com` (일반 문의)
- 운영팀 Slack: `#cs-admin-tools`
