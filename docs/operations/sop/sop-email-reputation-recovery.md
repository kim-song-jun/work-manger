# SOP · 이메일 평판(Reputation) 회복 — SES Bounce / Complaint 대응

- **Owner**: 운영 온콜 / DevOps Lead
- **Last Reviewed**: 2026-05-04
- **참고**: [`operations-guide.md`](../operations-guide.md) §5.2, [`runbook.md`](../runbook.md)

## Purpose

Amazon SES (Simple Email Service) 의 bounce rate / complaint rate 가 임계 초과해 **계정 sending pause / probation** 위험에 진입했을 때, 발송 차단 → 원인 분석 → suppression list 정리 → 점진 ramp-up 의 표준 절차.

## Scope

- **포함**: SES bounce/complaint 임계 초과, DKIM/SPF/DMARC 인증 실패, 도메인 평판 하락
- **제외**: SMTP 의존 시스템 (현재 fallback 만), 푸시 알림 (FCM/APNs — `runbook.md` R-006)

## SES 임계 (AWS 기준)

| 메트릭 | 경고 (warn) | 위험 (danger) | AWS 자동 조치 |
|---|---|---|---|
| Bounce Rate | > 5% | > 10% | sending probation → pause |
| Complaint Rate | > 0.1% | > 0.5% | probation → pause |

운영 자체 임계 (조기 경보):

- Bounce > 2% → Slack `#ops-alerts` 경고
- Bounce > 5% → PagerDuty 페이지 + 이 SOP 발동

## Steps

### 1. 즉시 발송 차단 (Sending Pause)

가장 빠른 완화 — 추가 bounce / complaint 누적 방지.

방법 A — 환경변수 토글 (권장):

```bash
# ECS task definition 환경변수 변경 → 새 task 배포
NOTIFICATION_PROVIDER_MODE=stub
```

`operations-guide.md` §5.4 에 따라 `stub` 모드는 SES 호출 자체를 안 함. outbox / 큐 / 재시도 로직은 정상 동작 (메시지가 stub 처리되어 DB 에 marker 만 남음).

ECS Service 재배포:

```bash
aws ecs update-service \
  --cluster wm-prod-cluster \
  --service wm-prod-api \
  --force-new-deployment
```

방법 B — SES 콘솔에서 sending paused

- 더 강한 차단. 모든 SES 호출이 즉시 throttled 응답 → 코드 레벨에서 outbox 가 retry 큐에 누적.
- 단점: 모든 트랜잭션 메일(비밀번호 재설정 등) 도 막힘. 5분 이상 발동 권장 안 함.

### 2. 영향 범위 확정

CloudWatch + SES 대시보드 확인:

- 최근 24시간 bounce 수 / complaint 수 / 발송 총량
- bounce 종류 분포: hard bounce (영구) vs soft bounce (일시)
- complaint 발생 시간대 / 수신 도메인 분포 (Gmail, Naver, Kakao 등)
- SES 이벤트 알림 (SNS topic) 의 최근 페이로드

원인 가설:

| 패턴 | 가능 원인 |
|---|---|
| Hard bounce 다수, 신규 사용자 가입 직후 | 회원가입 시 잘못된 이메일 검증 부재 |
| Hard bounce 다수, 오래된 사용자 | DB 의 stale 이메일 (퇴사자, 도메인 종료) |
| Complaint 다수 | 알림 빈도 과다, 옵트아웃 미작동, 스팸성 콘텐츠 |
| 특정 도메인만 bounce (예: Naver 만) | 그 도메인의 정책 변경 / SPF 거절 |
| DKIM-Failure 알림 | DNS 변경 / KMS rotated / Route53 미동기화 |

### 3. DKIM / SPF / DMARC 검증

```bash
# DKIM 셀렉터 확인 (SES 가 발급한 토큰)
dig TXT <selector>._domainkey.work-manager.molcube.com

# SPF
dig TXT work-manager.molcube.com | grep spf

# DMARC
dig TXT _dmarc.work-manager.molcube.com
```

기대값:

- DKIM: SES 발급 CNAME 3건 모두 활성 (Route53 → SES 검증 상태 "Verified")
- SPF: `v=spf1 include:amazonses.com -all` (또는 `~all`)
- DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@molcube.com; ruf=mailto:dmarc-reports@molcube.com`

불일치 시 → Route53 수정 + SES 재검증 트리거.

### 4. Suppression List 정리

SES 의 account-level suppression list 를 점검:

```bash
aws sesv2 list-suppressed-destinations --reasons BOUNCE COMPLAINT \
  --start-date 2026-04-01T00:00:00Z
```

- Hard bounce 으로 자동 등록된 이메일 → 우리 DB 에 동기화 (해당 사용자의 이메일 status=`SUPPRESSED` 표시)
- Complaint 으로 자동 등록된 이메일 → 사용자에게 push/inApp 알림으로 "이메일 수신 거부됨" 안내. 사용자가 명시적 opt-in 하기 전까지 발송 차단.

stale 이메일 일괄 정리:

```bash
docker compose exec -T api python manage.py mark_emails_suppressed \
  --from-ses-suppression-list
```

(스텁 — v1.x 추가 예정.)

audit_log: `email.suppressed` (count 포함) 기록.

### 5. 발송 정책 검토

원인이 알림 빈도 / 콘텐츠라면:

- `apps/notification/services.py` 의 빈도 제한 룰 점검 (`operations-guide.md` §5.3 — 동일 종류 1시간 1회)
- 알림 콘텐츠 스팸성 단어 (대문자 다수, 특수문자 폭주, 가격/할인 표현) 검토
- 옵트아웃 링크 모든 마케팅 이메일에 포함 확인 (트랜잭션 메일은 면제)
- 사용자 알림 선호도 (`Notification.Preference`) 가 실제 반영되는지 확인

### 6. 점진 Ramp-up

차단 해제 후 한 번에 평소 볼륨으로 복귀하면 SES 가 다시 throttle. 단계적 회복:

| 시점 | 발송량 (시간당) | 조건 |
|---|---|---|
| T+0 (해제 직후) | 평소의 10% | 트랜잭션만 (비밀번호 재설정, 인증) |
| T+1h | 평소의 25% | + 출퇴근 알림 |
| T+6h | 평소의 50% | + 결재 알림 |
| T+24h | 평소의 100% | bounce rate < 1% 유지 시 |

각 단계에서 bounce / complaint 추이 모니터링. 임계 재진입 시 즉시 이전 단계로 후퇴.

해제 토글:

```bash
NOTIFICATION_PROVIDER_MODE=real
# 단계별 ramp-up 은 별도 rate limit 미들웨어 (작성 예정) 또는
# 큐 worker 의 prefetch_count 조정으로 구현
```

### 7. 사후 보고 + 모니터링 강화

24시간 내 사후 보고서 — 5 Whys, 영향 사용자 수, 차단된 이메일 수, 재발 방지.

신규 모니터링:

- SES bounce rate 1% 임계 알림 (현재 2% → 1% 강화)
- 일일 bounce 추이 dashboard widget 추가
- 신규 사용자 가입 시 이메일 syntax + MX record 검증 (가입 단계에서 차단)

## Success Criteria

- [ ] 발동 후 5분 내 발송 차단 적용 (stub 모드)
- [ ] 1시간 내 원인 가설 + 영향 범위 확정
- [ ] DKIM/SPF/DMARC 모두 검증 통과
- [ ] suppression list 동기화 완료
- [ ] 24시간 내 단계적 ramp-up 완료, bounce rate < 1% 유지
- [ ] 사후 보고서 작성

## Edge Cases

- **AWS 가 계정 자체를 paused 처리한 상태**: 콘솔에서 사유 확인 후 AWS Support 케이스 오픈 (Severity: Production system impaired). 답변 도착 전까지 SMTP fallback (`EMAIL_PROVIDER=smtp`) 으로 임시 우회 — 단 발송량 매우 제한.
- **DNS 전파 지연**: Route53 변경이 다른 DNS resolver 에 전파되는 데 최대 48시간. 주요 도메인(Gmail, Naver) 의 NS 응답을 직접 확인.
- **단일 회사가 원인**: 그 회사의 알림 발송만 임시 차단 가능. `Company.notification_paused = True` 플래그 (작성 예정) 활용.
- **비밀번호 재설정 / 인증 메일까지 막힌 상황**: 사용자가 신규 가입 / 로그인 불가능. 우선순위 큐(`notification.high`) 만 실시간 발송 유지하고 `bulk` 큐만 차단하는 옵션 검토.

## 도구 / 시스템

- AWS SES 콘솔 / SNS event topic
- Route53 (DNS 검증)
- Outbox: `apps/notification/outbox/`
- Provider: `apps/notification/providers/real_email.py`
- Admin CLI: `mark_emails_suppressed` (작성 예정)

## 메모

- DMARC reports 를 정기 분석 — `dmarc-reports@molcube.com` 로 들어오는 XML 을 주간으로 검토.
- 마케팅 / 트랜잭션 메일 발송 sub-account 분리 검토 (마케팅은 별도 SES configuration set / 도메인). 평판 격리 효과.
- SOP-emergency-password-reset 발동 시 일괄 발송이 평판 영향 — 이 SOP 와 동시 모니터링.
