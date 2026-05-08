# 관리자 매뉴얼 (Admin Guide)

> 대상: 회사 관리자 (ADMIN / OWNER 역할 계정)
> 마지막 업데이트: 2026-05-08
> 관련 문서:
> - [OWNER 매뉴얼 (owner.md)](owner.md)
> - [회사 가입 코드 매뉴얼 (admin-company-codes.md)](admin-company-codes.md)
> - [운영 SOP 색인](../operations/operations-guide.md#12-운영-sop-색인)

---

## 1. 관리자 패널 진입

- URL: `/admin` (로그인 후 ADMIN 또는 OWNER 계정이어야 진입 가능)
- 사이드바 메뉴: 대시보드 · 직원 · 코드 · 감사 로그 · 설정

> EMPLOYEE/MANAGER 계정은 `/admin` 에 접근할 수 없습니다 (`RequireAdmin` guard 적용).

---

## 2. 주요 기능

### 2.1 직원 관리 (`/admin/employees`)

- 직원 목록 조회 · 검색 · 역할 변경 · 비활성화.
- 역할 변경 시 감사 로그 자동 기록.
- ADMIN 이 OWNER 역할을 부여하려면 OWNER 권한이 필요합니다.

### 2.2 가입 코드 (`/admin/codes`)

가입 코드 발급 · 회수 · 이력 조회.

상세 절차: [admin-company-codes.md](admin-company-codes.md)

### 2.3 감사 로그 (`/admin/audit`)

- 회사 내 모든 민감 이벤트 (설정 변경, 역할 변경, 코드 발급/회수, 데이터 export 등) 를 조회합니다.
- 보존 기간: 90일 (자동 삭제 배치 적용).
- 필터: 기간, 액션 유형, 멤버.

### 2.4 회사 설정 (`/admin/settings`)

- ADMIN: 읽기 전용 (저장 버튼 비활성).
- OWNER: 회사 정보 · 브랜드 · 정책 변경 가능.
- 상세: [owner.md §2](owner.md#2-회사-정보-변경-sop)

---

## 3. 도움말 진입점

앱 내 도움말:
- 모바일 웹: `/m/help` → "관리자 매뉴얼" 링크 카드
- OWNER 전용: `/m/help` → "OWNER 매뉴얼" 링크 카드

> `/admin/help` 전용 페이지는 v1.x 에서 추가 예정. 현재는 `/m/help` 를 통해 접근하거나 아래 SOP 링크를 직접 참조하세요.

---

## 4. SOP 빠른 링크

| 상황 | SOP 문서 |
|---|---|
| 신규 직원 가입 코드 발급 · 회수 | [admin-company-codes.md](admin-company-codes.md) |
| 신규 회사 온보딩 (CS 담당) | [sop-onboard-new-company.md](../operations/sop/sop-onboard-new-company.md) |
| 데이터 export 요청 처리 | [sop-data-export-request.md](../operations/sop/sop-data-export-request.md) |
| 데이터 삭제 요청 처리 | [sop-data-deletion-request.md](../operations/sop/sop-data-deletion-request.md) |
| 비밀번호 강제 리셋 (긴급) | [sop-emergency-password-reset.md](../operations/sop/sop-emergency-password-reset.md) |

---

## 5. 문의

- 이메일: `support@molcube.com`
- Slack: `#cs-admin-tools`
