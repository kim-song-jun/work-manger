# SOP · 비밀번호 강제 리셋 (Mass Password Invalidation)

- **Owner**: Security Lead / 운영 온콜
- **Last Reviewed**: 2026-05-04
- **참고**: [`runbook.md`](../runbook.md) §R-011, [`operations-guide.md`](../operations-guide.md) §8

## Purpose

대규모 보안 사고(credential leak, 침해 의심, 인증 시스템 결함) 시 **모든 또는 특정 범위 사용자의 비밀번호를 무효화하고, refresh token 을 일괄 폐기하며, 사용자에게 안전한 재설정 채널을 안내** 하는 표준 절차.

## Scope

- **포함**: 전사 / 회사 단위 / 사용자 그룹 단위 강제 리셋
- **제외**: 개별 사용자의 비밀번호 분실 (셀프 서비스 — `POST /v1/auth/password/reset` 으로 처리)

## 발동 조건 (Trigger)

다음 중 하나 이상 충족 시 인시던트 커맨더(IC) 가 이 SOP 발동:

1. **인증 시스템 결함**: JWT signing key 누출 / OAuth client secret 노출 / SimpleJWT 라이브러리 critical CVE
2. **credential stuffing 다발**: `runbook.md` R-011 의 임계 초과 + 영향 사용자 수 100+ 추정
3. **DB 백업 / 덤프 누출 의심**: 비밀번호 해시 외부 노출 가능성
4. **법무 / 컴플라이언스 권고**: 외부 감사 / 사법기관 권고
5. **회사 단위 사고**: 단일 회사의 어드민 계정 침해 → 그 회사만 강제 리셋

## 의사결정 권한

- **전사(global) 강제 리셋**: CTO + Security Lead 양자 승인
- **회사 단위**: Security Lead 단독 승인 (CTO 통지 의무)
- **개별 사용자**: 운영 온콜 단독 (R-011 routine)

## Steps

### 1. 인시던트 선언 + 커뮤니케이션 셋업

1. PagerDuty 인시던트 생성 → IC 지정
2. Slack `#incidents` 에 영향 범위 / 추정 시점 / 발동 사유 공유
3. 임시 워룸(Slack huddle 또는 Zoom) 개설
4. 사용자 공지 초안 준비 (이메일 + 앱 내 배너 + 회사 OWNER 슬랙 메시지)
5. 영향 범위 동결 — 결정 전까지 코드 배포 / 시크릿 로테이션 추가 변경 보류

### 2. 영향 범위 확정

질문:

- 모든 사용자? 특정 회사? 특정 가입 시기? 특정 OAuth provider 만?
- access token / refresh token 만 폐기? 비밀번호도 강제 변경?
- 2FA 활성 사용자 제외 가능?

확정 후 운영 워크북에 기록 (사후 보고서 자료).

### 3. Refresh Token 일괄 무효화

```bash
docker compose exec -T api python manage.py invalidate_all_refresh_tokens \
  --reason "incident-2026-05-04-credential-suspicion" \
  --scope all   # all | company:<uuid> | user:<email>
```

(스텁 — `services/api/apps/identity/management/commands/invalidate_all_refresh_tokens.py` 가 v1.x 추가 예정.
MVP 단계에서는 SimpleJWT 의 `OutstandingToken` / `BlacklistedToken` 모델을 직접 조작하는 ad-hoc 스크립트 사용.)

수행:

1. 대상 범위 사용자의 모든 활성 `OutstandingToken` 을 `BlacklistedToken` 으로 이동
2. JWT 검증 미들웨어가 다음 요청부터 401 반환 → 클라이언트가 자동 로그아웃
3. WebSocket 연결도 끊김 (Channels 의 `JWTAuthMiddleware` 가 토큰 만료 감지 시 disconnect)
4. audit_log: `auth.refresh_tokens_invalidated` (actor=운영자, payload={scope, reason, count})

검증:

```python
# Django shell
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
print(BlacklistedToken.objects.filter(blacklisted_at__gte=now()-timedelta(minutes=5)).count())
```

### 4. 비밀번호 강제 리셋 (필요 시)

비밀번호 해시 자체가 위협받았다고 판단되면:

```bash
docker compose exec -T api python manage.py force_password_reset \
  --scope all \
  --reason "incident-2026-05-04"
```

(스텁 — v1.x 추가 예정.)

수행:

1. 대상 사용자의 `User.password` 를 unusable password 로 설정 (`set_unusable_password()`)
2. 모든 사용자에게 비밀번호 재설정 링크 이메일 발송 — 평소 분실 플로우와 동일하나, 발신 트리거가 운영자
3. 링크 유효기간 단축 (평소 15분 → 15분 유지, 단 사용자에게 명시)
4. 재설정 후 자동 로그인 X — 명시적 재로그인 강제 (피싱 회피 차원에서 사용자가 도메인 다시 확인하도록)

### 5. 사용자 공지 (Outbox 활용)

이메일 + 앱 내 배너 + 푸시 알림 동시 발송.

이메일 템플릿: `security_incident_reset.html`

내용:

- 사고 발생 사실 (개요만 — 침해 범위 / 영향 / 조치)
- 사용자 행동 요청: "다시 로그인해주세요" + 비밀번호 재설정 시 (해당 시)
- 2FA 활성화 권장
- 추가 의심스러운 활동 시 `security@molcube.com`
- 진행 상황 추적 페이지 링크 (status page)

발송:

- `apps/notification/outbox` 통해 일괄 enqueue
- 큐: `notification.bulk` (즉시 큐 막힘 방지)
- bounce / complaint 모니터링 (SOP-email-reputation-recovery 발동 가능성 ↑)

회사 OWNER 에게는 추가 슬랙 메시지 / 전화 — 회사 임직원에게 안내 협조 요청.

### 6. 감사 로그 + 사후 절차

audit_log 에 자동 기록:

- `auth.refresh_tokens_invalidated`
- `auth.passwords_reset` (선택)
- `notification.security_blast_sent` (수신자 수 포함)

사후:

- 24시간 내 사후 보고서 (5 Whys, 영향 범위 최종, 재발 방지)
- 1주 후 사용자 재가입률 / 로그인 실패율 모니터링
- 1개월 후 정기 보안 리뷰에서 case study

## Success Criteria

- [ ] IC 지정 + 의사결정 권한 확보 후 1시간 내 토큰 무효화 완료
- [ ] 영향 사용자 100% 가 다음 요청에서 401 받음
- [ ] 사용자 공지 이메일 95%+ 5분 내 발송 (bounce 제외)
- [ ] audit_log 3종 이벤트 모두 기록
- [ ] 24시간 내 사후 보고서 완성

## Rollback

- 잘못된 발동 (false positive) 판정 시:
  - BlacklistedToken 에 추가된 행을 삭제 → 사용자 재로그인 불요 (단, 클라이언트가 이미 로그아웃됐다면 재로그인 필요)
  - 사용자 사과 공지 + audit_log: `auth.invalidation_reverted`
- 비밀번호를 unusable 로 설정한 후 되돌리기는 불가 — 사용자가 재설정 플로우 진행 필수

## Edge Cases

- **OAuth-only 사용자**: 비밀번호 없으므로 password reset 불가. refresh token 만 무효화 + 재로그인 안내.
- **2FA 활성 사용자**: 토큰 무효화는 동일. 재로그인 시 TOTP 추가 입력. 침해 의심 시 2FA 시크릿 재발급도 강제(별도 단계).
- **API integration 사용자(v2)**: 서비스 계정 토큰은 별도 처리 — 회사 OWNER 통보 + 새 키 발급.
- **활성 출퇴근 진행 중**: 토큰 무효화로 진행 중 출근 기록은 영향 없음 (서버 데이터 유지). 사용자가 재로그인 후 본인 상태 확인 가능.

## 도구 / 시스템

- SimpleJWT: `rest_framework_simplejwt.token_blacklist`
- Admin CLI: `invalidate_all_refresh_tokens`, `force_password_reset` (작성 예정)
- 알림 outbox: `apps/notification/outbox`
- Audit: `apps/audit/services.py`
- Status page: 외부 (Statuspage.io 또는 자체)

## 메모

- 토큰 무효화 명령은 회사/사용자 단위 scope 옵션 필수 — 전사 발동은 정말로 전사 사고일 때만.
- 1년에 1번은 stg 에서 모의 훈련 권장 (실제 사용자 없이 토큰만 무효화 후 시간 측정).
- SOP-email-reputation-recovery 와 연계 — 일괄 발송이 SES 평판에 영향 줄 수 있음.
