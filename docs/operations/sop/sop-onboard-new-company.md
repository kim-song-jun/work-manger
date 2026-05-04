# SOP · 신규 회사 온보딩 (Onboarding a New Company)

- **Owner**: Customer Success Lead
- **Last Reviewed**: 2026-05-04
- **참고**: [`runbook.md`](../runbook.md), [`operations-guide.md`](../operations-guide.md)

## Purpose

신규 회사(고객사) 가 계약 후 실사용을 시작할 수 있도록, **회사 레코드 + 오너(Owner) 멤버십 + 초기 회사 코드 + 기본 연차 정책 + 환영 커뮤니케이션** 을 일관된 절차로 발급한다. 이 SOP 는 영업 → CS → 운영(Ops) 핸드오프를 표준화한다.

## Scope

- **포함**: 회사 생성, 첫 오너 발급, 기본 정책(연차, 알림) 시드, 환영 이메일, Slack 채널 생성
- **제외**: 영업 계약 협상, 결제 연동(MVP 미포함), 데이터 마이그레이션(별도 SOP, 추후 작성)

## 사전 조건 (Prerequisites)

- 영업 / CS 가 다음 정보를 핸드오프 티켓(Linear / Notion) 으로 전달:
  - 회사 공식명, 회계연도 시작일, 타임존(기본 `Asia/Seoul`)
  - 첫 오너 사용자: 이메일, 이름, 연락처
  - 본사 좌표(위도/경도) 또는 주소(지오코딩 가능해야 함)
  - 정규 근무시간 (예: 09:00–18:00, 휴게 60분)

## Steps

### 1. 사전 검증

1. 핸드오프 티켓의 정보 누락 / 모호한 항목을 영업에 회신.
2. 동일 회사명 중복 확인 (`docs/api/api-spec.md` §2 의 `GET /v1/admin/companies?name=...` — admin token 으로). 중복 시 영업과 합의(법인 분리 / 법인 통합 / 계열사 처리).
3. 첫 오너 이메일이 이미 다른 회사 멤버십에 속해 있지 않은지 확인. v1 정책상 한 사용자는 한 회사(`docs/specs/feature-spec.md` §2.3). 충돌 시 새 이메일 사용 요청.

### 2. 회사 생성 + 오너 멤버십

#### 2-A. Dev / 내부 검증 환경

`POST /v1/dev/bootstrap-company` (DEBUG 모드 only — `services/api/apps/identity/onboarding_views.py:285` 의 `dev_bootstrap_company`).

```bash
curl -X POST https://api.dev.work-manager.molcube.com/v1/dev/bootstrap-company \
  -H "Authorization: Bearer $OWNER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp"}'
```

응답: `{ "data": { "company": { "id": "...", "code": "AB12CD", "name": "Acme Corp" } } }` — 6자리 영숫자 회사 코드 자동 발급.

이 엔드포인트는 prod 에서 항상 404 (DEBUG=False). prod 에서는 2-B.

#### 2-B. Production

운영 관리자 계정으로 admin UI 또는 admin API 사용:

1. 운영 관리자 → admin 페이지 → "회사 추가" → 폼 입력 (이름, 회계연도, 타임존)
2. 시스템이 6자리 코드 발급. 후속 단계에서 사용.
3. 첫 오너에게 회원가입 안내 이메일 발송. 가입 시 회사 코드 입력 → `POST /v1/onboarding/join-company` 가 OWNER 권한 멤버십 생성.
   - 대안: 운영자가 admin 으로 사용자 invite 발송. 사용자가 링크 클릭 → 가입 → 자동으로 OWNER 부여.

### 3. 기본 정책 시드 (Default Policies)

내부 검증 환경에서는 `services/api/apps/identity/management/commands/seed_demo.py` 가 참고 모델 — 동일한 도메인 객체를 prod 에서도 만들어준다(개별 PR 또는 admin UI).

생성할 객체:

- `LeavePolicy` 1건 — `effective_from = 회사 회계연도 시작일`, `rules_json = {"strategy": "korean_labor_law"}`, `expiry_months = 12`, `notify_days_before = [30, 14, 7, 1]`.
- `Location` 2건 — 본사(좌표 + `radius_m = 150`), 재택(좌표는 임의, `radius_m = 10000`).
- `WorkSchedule` (오너용) — `start_time = 09:00`, `end_time = 18:00`, `break_minutes = 60`, `work_days = [1,2,3,4,5]`. 다른 직원은 본인 온보딩 시 자동 생성됨.

확인:

```bash
docker compose exec -T api python manage.py shell -c "
from apps.identity.models import Company
from apps.leave.models import LeavePolicy
c = Company.objects.get(code='AB12CD')
print(LeavePolicy.objects.filter(company=c).count())  # 기대: 1
"
```

### 4. 회사 코드 추가 발급 (선택)

오너가 직원을 초대할 회사 코드 추가 발급. admin UI → 회사 → "코드 발급" → 만료기한 설정.

권장:

- 첫 코드는 30일 유효 — 직원 일괄 초대 후 회수
- 외부 인턴 / 단기 근무자용 코드는 1주 유효
- 회수는 `POST /v1/admin/companies/<id>/codes/<code_id>/revoke` (`onboarding_views.py:271` 의 `revoke_company_code`).

### 5. 환영 이메일 발송

운영 발송 SES 템플릿 (`welcome_company_onboarded.html`) 사용. 포함 내용:

- 회사 코드 + 만료일
- 모바일 / 웹 / 데스크톱 다운로드 링크
- 첫 로그인 가이드 (8단계 온보딩 — `feature-spec.md` §2.2)
- CS 담당자 연락처

발송 확인:

- `NotificationLog` 의 `email` 채널에서 status = `sent` 인지 확인 (5분 이내).
- bounce 발생 시 영업/CS 회신 → 이메일 정정.

### 6. Slack 채널 생성 (선택, 내부 운영용)

`#cs-<company-slug>` 형식 (예: `#cs-acme`). 멤버: CS 담당자, 영업 담당자, 운영 온콜.

목적: 도입 초기 1개월간 사용자 문의 / 장애 / 피드백을 한 채널로 모음. 1개월 후 일반 CS 큐로 이관.

### 7. 핸드오프 종료

- 영업 / CS 에 다음을 전달:
  - 회사 ID, 회사 코드, 코드 만료일
  - 첫 오너 이메일 (가입 완료 여부)
  - LeavePolicy / Location / WorkSchedule 시드 결과
  - Slack 채널명
- `audit_log` 가 자동으로 다음 액션을 기록했는지 확인:
  - `company.created`
  - `membership.created` (role=OWNER)
  - `leave_policy.created`
  - `location.created` × 2

## Success Criteria

- [ ] 회사 레코드 생성 + 6자리 코드 발급 완료
- [ ] 첫 오너가 가입 완료 + OWNER 권한 확인
- [ ] LeavePolicy + Location 2건 + WorkSchedule(오너용) 시드 완료
- [ ] 환영 이메일 발송 + 5분 이내 `sent` 상태
- [ ] Slack 채널 생성 + CS/영업/운영 초대
- [ ] audit_log 4종 이벤트 기록 확인
- [ ] 핸드오프 티켓에 "온보딩 완료" 코멘트 + 상기 항목 체크리스트

## Rollback / 사고 시

- 회사 생성 도중 실패: `Company.objects.filter(code='...').delete()` (CASCADE 로 멤버십 / 정책 / 위치 정리). 단, 사용자가 이미 가입했다면 사용자 삭제 별도 (SOP-data-deletion-request 참조).
- 잘못된 정보로 생성된 경우: 운영자가 admin 으로 정정 가능 (회사명 / 타임존 / 회계연도). 회사 코드는 회수 후 재발급.
- 같은 오너가 두 번째 회사를 잘못 가입: v1 정책 위반. 두 번째 멤버십 즉시 삭제 + 사용자에게 안내.

## 메모

- 향후(v2) SSO 도입 시 이 SOP 의 2번 단계가 IdP provisioning 으로 대체될 수 있다. 그때까지 매뉴얼 절차.
- 데이터 마이그레이션(기존 다른 시스템에서 직원/연차 import) 은 별도 SOP 필요 — 현재 미작성.
