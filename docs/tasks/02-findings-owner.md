---
persona: qa-owner
task_n: 2
created: 2026-05-08
status: complete
---

# iter12 QA — OWNER Persona Findings

## Summary

OWNER 페르소나 코드 리뷰 + 시나리오 워크스루 결과.

- 검증 범위: AdminSettingsPage 권한 분리 · 브랜드/정책 변경 · audit log · 데이터 export/삭제 SOP UI · 권한 위임 · 빌링 모듈 · SOP 가시성
- 전체 finding: **10 건** (P0: 0, P1: 6, P2: 4)

---

## Findings

### F-OWNER-01: 정책 변경 시 다른 사용자에게 즉시 반영되지 않음 (WS broadcast 없음)

- Severity: P1
- Where: `services/api/apps/admin_api/views_bulk.py:305-315` (`company_settings_update`)
- Repro:
  1. OWNER 가 AdminSettingsPage 에서 `compliance_block_when_over = true` 로 저장
  2. 동시에 직원이 출퇴근 화면에 접속해 있는 상태
  3. OWNER 가 저장 완료 후 직원이 clock-in 시도
- Expected: 정책 변경이 WS 채널(`team.{company_id}`)로 broadcast 되어 직원의 React Query 캐시가 즉시 무효화됨. 또는 출퇴근 서비스가 DB 에서 최신값을 읽어 즉시 차단.
- Actual: `company_settings_update` view 에 `notify_team()` 호출이 없음. 직원 측은 SWR window/focus 재검색까지 캐시된 구 정책을 사용한다. `attendance/services.py` 의 `compliance_block_when_over` check 는 DB에서 `Company` 객체를 직접 읽으므로 BE 동작은 정확하지만, FE 가 `GET /v1/admin/settings` 를 다시 호출하기 전까지 OWNER 가 정책 변경 효과를 UI 로 즉시 확인할 수 없다.
- Suggested fix: `company_settings_update` 에서 저장 후 `notify_team(company, "company.policy_changed", {"fields": update_fields})` 호출 추가. FE 에서 `team.{cid}` WS 이벤트 `company.policy_changed` 수신 시 `["admin-company-settings"]` query invalidate.

---

### F-OWNER-02: `update_employee` (역할 변경) 에 audit log 가 없음

- Severity: P1
- Where: `services/api/apps/admin_api/views.py:152-177` (`update_employee`)
- Repro:
  1. OWNER 또는 ADMIN 이 `/admin/employees/{id}` → "권한" 탭 → 역할을 `ADMIN` 으로 변경 후 저장
  2. `/admin/audit` 조회
- Expected: `identity.member.role_changed` (또는 유사) audit log 행이 기록됨. 권한 위임은 민감 이벤트이므로 감사 추적 필수.
- Actual: `update_employee` 에 `audit_record` 호출 없음. 역할 변경(`EMPLOYEE → ADMIN`, `ADMIN → OWNER`) 이 audit log 에 기록되지 않음.
- Suggested fix: `target.save()` 이후 `audit_record(request.user, "identity.member.updated", company=me.company, target=target, request=request, payload={"fields": list(s.validated_data.keys())})` 추가. 역할 변경 감지 시 `payload` 에 `old_role/new_role` 포함.

---

### F-OWNER-03: ADMIN 이 `update_employee` 로 자신보다 높은 역할(OWNER)을 다른 멤버에게 부여 가능 — 권한 에스컬레이션

- Severity: P1
- Where: `services/api/apps/admin_api/views.py:152-177` (`update_employee`)
- Repro:
  1. ADMIN 계정으로 PATCH `/v1/admin/employees/{id}` `{ "role": "OWNER" }` 전송
  2. 대상 멤버의 역할이 OWNER 로 승격됨
- Expected: 자신의 역할보다 높은 역할로의 변경은 OWNER 만 수행 가능해야 한다. 또는 최소한 `OWNER` 역할 부여는 OWNER 만 가능하도록 제한.
- Actual: `permission_classes = [HasRole.at_least("ADMIN")]` 만 있고, 역할 변경 내용에 대한 추가 인가 검사가 없다. ADMIN 이 OWNER 를 직접 임명할 수 있음.
- Suggested fix:
  ```python
  if "role" in s.validated_data:
      new_role = s.validated_data["role"]
      if ROLE_RANK.get(new_role, 0) > ROLE_RANK.get(me.role, 0):
          raise Forbidden(message="자신보다 높은 역할은 부여할 수 없어요.")
  ```
  `ROLE_RANK` 는 `core/permissions.py` 에 이미 정의되어 있음.

---

### F-OWNER-04: `logo_url` 서버 측 URL 형식 검증 없음

- Severity: P1
- Where: `services/api/apps/admin_api/views_bulk.py:255` (`CompanySettingsSerializer.logo_url`)
- Repro:
  1. OWNER 가 `logo_url` 에 `javascript:alert(1)` 또는 임의 문자열 전송
  2. PATCH `/v1/admin/settings/update` `{ "logo_url": "javascript:alert(1)" }` → 200 OK
- Expected: `logo_url` 은 `https://` 로 시작하는 URL 형식만 허용해야 한다 (또는 공백 허용).
- Actual: `serializers.CharField(max_length=500, required=False, allow_blank=True)` — URL 형식 검증 없음. `javascript:` scheme 또는 임의 문자열 저장 가능.
- Suggested fix: `serializers.URLField(max_length=500, required=False, allow_blank=True)` 로 변경하거나 `validators=[URLValidator(schemes=["https"])]` 추가. FE `TextField` 도 URL 형식 힌트 추가.

---

### F-OWNER-05: 데이터 export/삭제 SOP 트리거 UI 없음

- Severity: P1
- Where: `apps/web/src/pages/admin-settings/index.tsx` (AdminSettingsPage 전체) / `/admin/settings` 라우트
- Repro:
  1. OWNER 계정으로 `/admin/settings` 접속
  2. "데이터 내보내기" 또는 "계정/회사 데이터 삭제 요청" 관련 버튼/링크 탐색
- Expected: OWNER 가 직접 데이터 export 요청 또는 삭제 요청을 시작할 수 있는 UI (버튼, 다이얼로그, 이메일 링크 등) 가 존재한다. `sop-data-export-request.md` §1 에 "앱 내 '내 정보 → 데이터 다운로드' (예정 — v1.x)" 언급.
- Actual: AdminSettingsPage 에 SOP 트리거 UI 없음. OWNER 가 데이터 export/삭제를 원할 때 `privacy@molcube.com` 이메일만이 유일한 채널이나, 이 이메일 주소도 UI 에 노출되지 않음.
- Suggested fix: AdminSettingsPage 하단 또는 별도 "데이터 관리" 섹션에 다음 추가:
  - "데이터 내보내기 요청" → `privacy@molcube.com` mailto 링크 (단기) 또는 향후 API endpoint
  - "계정/회사 데이터 삭제 요청" → 동일
  SOP 는 MVP 단계 수동 처리이므로 버튼 클릭 → 이메일 클라이언트 열기 방식도 허용.

---

### F-OWNER-06: 감사 로그 90일 보존 Celery 배치 미구현

- Severity: P1
- Where: `services/api/apps/audit/` (tasks.py 없음)
- Repro:
  1. `services/api/apps/audit/` 디렉토리 확인 — `tasks.py` 없음
  2. Celery beat 스케줄에 audit retention job 없음
  3. `AuditLog` 모델에 만료 필드/정책 없음
- Expected: operations-guide §11 / 감사 로그 90일 보존 정책에 따라 90일 경과 후 자동 삭제 배치가 존재해야 함. `sop-data-deletion-request.md` §7 에는 `AuditLog.created_at + 7y < today → 물리 삭제` 배치 기술.
- Actual: audit log 는 무기한 축적됨. 삭제 배치 없음. 90일 retention 이 Celery Beat 에 등록되지 않음.
- Suggested fix: `services/api/apps/audit/tasks.py` 생성, `purge_old_audit_logs` Celery 태스크 구현 (90일 초과 행 삭제). Beat migration 추가. `sop-data-deletion-request.md §7` 의 7년 삭제와 혼동하지 않도록 주석으로 정책 근거 명시.

---

### F-OWNER-07: 빌링/구독 모듈 없음

- Severity: P2
- Where: `services/api/apps/` (billing 디렉토리 없음)
- Repro:
  1. `services/api/apps/` 내 billing, subscription, payment 디렉토리 탐색
  2. 코드베이스 전체 `billing|subscription|payment|invoice` 검색 — 출결/알림 관련 파일 외 무관
- Expected: SaaS 모델로서 회사별 구독/빌링 관리 UI 및 API 가 존재해야 한다. OWNER 는 구독 플랜 조회/변경의 주체.
- Actual: 빌링 모듈 전무. OWNER 가 구독 상태, 청구 이력, 플랜 변경을 확인할 수 없음. Feature Spec 에서 빌링 언급 여부도 미확인이나 현재 코드베이스에는 구현 없음.
- Suggested fix: Backlog (v1.x) 로 등록. 단기 대응으로 AdminSettingsPage 에 "요금제/빌링 문의: billing@molcube.com" 안내 텍스트 추가.

---

### F-OWNER-08: `/m/help` SOP 링크 없음 — OWNER 가 SOP 접근 불가

- Severity: P2
- Where: `apps/web/src/pages/m-help/index.tsx:19-24`
- Repro:
  1. OWNER 계정으로 `/m/help` 접속
  2. 데이터 export/삭제 SOP 또는 관련 운영 문서 링크 탐색
- Expected: OWNER 가 데이터 관련 SOP 절차를 앱 내에서 확인할 수 있어야 한다. `/m/help` 의 MANUAL_LINKS 에 `owner.md` 가 있으나, SOP 직접 링크 없음.
- Actual: `/m/help` 의 MANUAL_LINKS 에 `employee/manager/admin/owner` 매뉴얼 링크만 있고, SOP 가이드 또는 "데이터 문의" 링크 없음. `/admin` 패널에는 help 페이지 자체가 없음 (`apps/web/src/pages/admin-help/` 미존재).
- Suggested fix: AdminSettingsPage 또는 별도 `/admin/help` 페이지에 SOP 문서 링크 카드 추가. 단기적으로는 `/m/help` 의 manual_owner 링크가 SOP 섹션을 포함하도록 `docs/manuals/owner.md` 에 SOP 링크 추가.

---

### F-OWNER-09: audit action 명 불일치 — iter11 spec 과 실제 코드 상이

- Severity: P2
- Where: `services/api/apps/admin_api/views_bulk.py:310`
- Repro:
  1. `views_bulk.py` 의 audit action 확인: `"identity.company.settings_updated"`
  2. task doc (`docs/tasks/02-iter12-live-test-fix.md`) 의 언급: `"company.settings.*"` (spec 상 예시)
  3. `sop-data-export-request.md` 의 audit actions: `"data_export.requested"` 등
- Expected: audit action 명이 일관된 도메인 네임스페이스를 따른다. 예: `identity.company.settings.updated` (DDD dot-path 관례).
- Actual: `"identity.company.settings_updated"` — 중간에 `.` 대신 `_` 혼용. 다른 audit action 들 (`auth.login.success`, `identity.bulk_imported`, `data_export.requested`) 과 혼재. 검색/필터 시 혼란.
- Suggested fix: 모든 audit action 을 `{domain}.{entity}.{verb}` 형식으로 통일. 기존: `"identity.company.settings_updated"` → 수정: `"identity.company.settings.updated"`. `test_admin_settings.py` 에 audit log action 검증 케이스 추가.

---

### F-OWNER-10: `test_admin_settings.py` 에 audit log 기록 검증 테스트 없음

- Severity: P2
- Where: `services/api/tests/test_admin_settings.py` (전체)
- Repro:
  1. `test_admin_settings.py` 확인 — 5개 테스트 모두 HTTP 응답 코드/데이터만 검증
  2. `audit_record` 호출 여부, `AuditLog` 행 생성 여부 검증 없음
- Expected: OWNER 가 설정 변경 시 audit log 행이 생성됨을 pytest 로 검증해야 한다.
- Actual: `test_settings_update_owner_ok` 이후 `AuditLog.objects.filter(action="identity.company.settings_updated").count() == 1` 검증 없음.
- Suggested fix:
  ```python
  def test_settings_update_creates_audit_log(client_auth):
      from apps.audit.models import AuditLog
      client, m = client_auth(role="OWNER")
      client.patch("/v1/admin/settings/update", {"brand_color": "#AA0000"}, format="json")
      assert AuditLog.objects.filter(
          company=m.company,
          action="identity.company.settings_updated",
      ).exists()
  ```

---

## 권한 경계 검증 요약

| 시나리오 | 결과 |
|---|---|
| ADMIN GET `/v1/admin/settings` | 200 ✅ (HasRole.at_least("ADMIN")) |
| EMPLOYEE GET `/v1/admin/settings` | 403 ✅ (HasRole 차단, 테스트 확인) |
| ADMIN PATCH `/v1/admin/settings/update` | 403 ✅ (`me.role != "OWNER"` 수동 체크) |
| OWNER PATCH `/v1/admin/settings/update` | 200 ✅ |
| ADMIN PATCH 으로 다른 멤버 OWNER 승격 | **가능 — F-OWNER-03** |
| OWNER 의 다른 회사 데이터 접근 | 차단 ✅ (`active_membership` 이 본인 회사만 반환) |

## 검증 완료 항목

- brand_color hex 정규식 (`/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/`) — FE/BE 모두 적용 ✅
- OWNER 가 아닌 경우 저장 버튼 미노출 (`{isOwner && <sticky-bar>}`) ✅
- PATCH 전 OWNER check 이중 방어 (FE disabled + BE 403) ✅
- `identity` migration `0006_company_brand_logo` — brand_color/logo_url 컬럼 존재 ✅
- `Company.compliance_block_when_over` 이 attendance clock-in 에서 DB 값으로 직접 읽음 ✅
- 다른 회사 데이터 격리 — `active_membership` → `me.company` 경유 ✅
- `RequireAdmin` route guard 가 ADMIN/OWNER 만 `/admin/*` 진입 허용 ✅
