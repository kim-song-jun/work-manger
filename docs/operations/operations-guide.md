# 운영 유의사항 (Operations Guide)

> **대상 독자**: 백엔드 / SRE / 온콜 엔지니어
> **읽기 전제**: [`architecture.md`](../architecture/architecture.md) 숙지

---

## 1. 환경

| 환경 | 도메인 | 사용 시점 |
|---|---|---|
| local | localhost | 개발 |
| dev | `*.dev.work-manager.molcube.com` | PR 통합 테스트 |
| stg | `*.stg.work-manager.molcube.com` | 출시 전 회귀 테스트 (운영 동일 구성) |
| prod | `*.work-manager.molcube.com` | 실 사용자 |

원칙: **stg 를 거치지 않은 변경은 prod 에 가지 않는다.** 핫픽스도 stg 에 30분 이상 머무른 뒤 prod.

---

## 2. 배포

### 2.1 일정
- 정기 배포: 화·목 오후 2시 (KST). 점심시간 / 출근시간(09:00 전후) / 퇴근시간(18:00 전후) **금지**.
- 긴급 배포: 운영 영향 없는 패치만. 두 명 이상 승인 + Slack `#release` 공지 후.

### 2.2 절차
1. `main` 머지 → CI 자동으로 stg 배포
2. stg 회귀 테스트 (자동 + 수동 체크리스트)
3. 릴리스 태그 (`v1.x.y`) → CI 가 prod 배포 워크플로 트리거 (수동 승인 게이트)
4. blue/green 또는 ECS rolling (50% → 100%, 헬스체크 통과 시)
5. 배포 후 5분 모니터링 (에러율, P95 레이턴시, 알림 채널)

### 2.3 롤백
- ECS: 이전 task definition 으로 즉시 롤백 (rolling 5분 이내)
- DB 마이그레이션 포함된 배포 롤백 시:
  - 코드만 롤백 (forward-compatible 마이그레이션 원칙)
  - 컬럼 / 테이블 drop 은 별도 배포 (충분한 stable 기간 후)

---

## 3. 출퇴근 도메인 — 운영 관점 위험 포인트

### 3.1 동시성

- 동일 멤버십이 여러 디바이스에서 동시에 출근 시도 → DB UNIQUE 제약으로 차단
- 첫 요청만 201, 나머지는 409 `ALREADY_CLOCKED_IN`
- **테스트 필수**: 트래픽 급증(09:00) 시 동시성 부하 테스트

### 3.2 시간 / 타임존

- 회사 단위 타임존 (`Asia/Seoul` 기본)
- DB 는 항상 UTC 저장. 비교는 회사 TZ 기준.
- DST 가능성 있는 회사 (글로벌 확장 시) → 추가 검증 필요

### 3.3 위치

- GPS 정확도가 낮은 환경 (지하, 빌딩 안쪽) 다발 → "수동 출근 신청" 플로우 모니터링
- 오프라인 출근: 클라이언트 로컬 큐 → 온라인 복귀 시 동기화. 24h 이내만 인정.

### 3.4 자동 출퇴근 / 자동 초과근무

- Celery Beat 가 정시 트리거. **Beat 가 죽으면 자동 처리 누락** → Beat 단일 인스턴스 죽음 알림 즉시 (Sentry / CloudWatch Alarm).
- 자동 처리 결과는 사용자에게 항상 알림. 임의 처리 금지.

---

## 4. 연차 도메인 — 운영 관점 위험 포인트

### 4.1 자동 부여 / 소멸 배치

- 매일 자정에 실행. **실패 시 사용자 영향 큼** (잔여 표시 오류, 소멸 처리 누락).
- 배치는 멱등하게 작성: 같은 입력에 같은 결과. 재실행 안전.
- 실패 시 자동 재시도 3회 (5분, 15분, 60분 간격). 그 후 운영 알림.

### 4.2 정책 변경

- `leave_policy` 는 버전 관리. **기존 부여 데이터에 소급 적용 금지** (사용자 신뢰 훼손).
- 정책 변경은 ADMIN/OWNER 권한, 변경 이유 입력 필수, 감사 로그 자동 기록.

### 4.3 잔여 계산 캐싱

- 잔여 = balance 트랜잭션 합산. 사용자가 신청할 때마다 계산 → Redis 5분 캐시.
- 신청 / 승인 / 부여 / 소멸 발생 시 캐시 무효화.

---

## 5. 알림 발송

### 5.1 큐 / 백오프

- Celery 큐 분리: `notification.high` (즉시), `notification.bulk` (배치)
- 푸시 실패 시 3회 재시도 (지수 백오프). 그 후 NotificationLog 에 `failed_at` 기록.
- DeviceToken 이 invalid 응답 받으면 자동 비활성화 (per platform):
  - Web Push: HTTP 410 Gone / 404 Not Found
  - APNs: HTTP 410 BadDeviceToken / 400 DeviceTokenNotForTopic
  - ntfy: 토큰 개념 없음 — 구독자 0명이어도 publish 는 200 (이상치 아님)

### 5.2 이메일

- AWS SES. 평판 (bounce / complaint rate) 모니터링.
- 회사 도메인 SPF / DKIM / DMARC 설정 가이드 운영팀 보유.
- Bounce 임계 (5%) 초과 시 Slack 알림.

### 5.3 푸시 — 한도

- iOS / Android 모두 한 사용자당 빈도 제한 (스팸 방지). 동일 종류 알림 1시간 1회.

### 5.4 Provider 설정 (env-vars)

Provider 코드는 `apps/notification/providers/` 에 모드별로 분리되어 있다.
실제 발송은 `NOTIFICATION_PROVIDER_MODE=real` 로 토글한다.

> **자체 호스팅 푸시 스택**: 2026 년부터 Firebase / FCM 의존성을 제거했다.
> 자세한 배경은 [ADR-006](../adr/ADR-006-self-hosted-push-no-firebase.md).
> Web → Web Push (VAPID), iOS → APNs HTTP/2 직접, Android → ntfy (self-hosted).

| env-var | 기본값 | 설명 |
|---|---|---|
| `NOTIFICATION_PROVIDER_MODE` | `stub` | `stub` (테스트 / dev) ↔ `real` (stg / prod) |
| `EMAIL_PROVIDER` | `ses` | `ses` (boto3) ↔ `smtp` (Django `send_mail` fallback) |
| `EMAIL_FROM` | `no-reply@work-manager.molcube.com` | SES Source / SMTP From |
| `AWS_REGION` | `ap-northeast-2` | SES 리전 (boto3) |
| `WEB_PUSH_VAPID_PUBLIC_KEY` | (빈 값) | VAPID 공개 키 (URL-safe base64). FE `VITE_VAPID_PUBLIC_KEY` 와 동일 값. |
| `WEB_PUSH_VAPID_PRIVATE_KEY` | (빈 값) | VAPID 비공개 키 (PEM). 노출 금지. |
| `WEB_PUSH_VAPID_SUBJECT` | `mailto:ops@work-manager.molcube.com` | VAPID `sub` claim (운영 연락처) |
| `APNS_KEY_ID` / `APNS_TEAM_ID` / `APNS_BUNDLE_ID` / `APNS_KEY_PEM` | (빈 값) | APNs HTTP/2 직접 경로 필수. 비어 있으면 iOS 푸시는 `apns_not_configured` soft-fail → router 가 다른 채널로 fallback. |
| `APNS_USE_SANDBOX` | `True` | APNs sandbox 게이트웨이 (TestFlight / dev). prod 는 `False`. |
| `NTFY_BASE_URL` | `http://ntfy:80` | compose 내부 ntfy 서비스. nginx 가 `/v1/ntfy/` 로 프록시. |
| `NTFY_TOPIC_PREFIX` | `wm-prod` | env 별 prefix (`wm-stg`, `wm-prod`). 토픽 = `{prefix}-membership-{id}`. |
| `NTFY_AUTH_TOKEN` | (빈 값) | BE publisher Bearer 토큰. `init_ntfy_user` 명령어로 발급. |

#### Provider 스위치 (stub ↔ real)

- `stub`: `apps/notification/providers/{email,push,inapp}.py` — 네트워크 호출 없음.
  outbox / 큐 / 재시도 로직을 격리 테스트하기 위한 기본 모드. **테스트는 항상 stub.**
- `real`: `apps/notification/providers/__init__.py` 의 router 가 채널별로 분기:
  - `EMAIL` → `real_email.py` (SES + SMTP fallback)
  - `INAPP` → `inapp.py` (DB row only)
  - `PUSH` → DeviceToken.platform 별 fan-out:
    - `WEB`/`DESKTOP` → `web_push.py` (VAPID, `pywebpush`)
    - `IOS` → `real_push.py` (APNs HTTP/2 direct, `httpx[http2]`)
    - `ANDROID` → `ntfy.py` (self-hosted ntfy publish)
  - 한 멤버가 여러 platform 토큰을 등록한 경우 모든 채널에 fan-out 하고 한
    채널이라도 성공하면 outbox 는 SENT. 실패별 사유는 `ProviderResult.details` 에 적재.

#### 실패 분류 (terminal vs transient)

- `terminal:` 접두사 → outbox 가 **즉시 DEAD** (재시도 안 함):
  - SES: `MessageRejected`, `MailFromDomainNotVerifiedException`
  - Web Push: 401/403 (잘못된 VAPID 키)
  - APNs: 403 (잘못된 키), 410 BadDeviceToken (모든 디바이스), 400 DeviceTokenNotForTopic
  - ntfy: 401/403 (잘못된 publisher 토큰), 4xx (publish 형식 오류)
- 그 외 → outbox 가 백오프 후 재시도:
  - SES `Throttling`, web-push 429/5xx, APNs 429/5xx, ntfy 503, 네트워크 timeout

#### Self-hosted push 운영

- **VAPID 키 회전 (Web Push)**: `docker compose exec api python manage.py generate_vapid_keys`
  → 출력값을 dev/stg/prod env 와 FE `VITE_VAPID_PUBLIC_KEY` 양쪽에 동시 반영.
  키 변경 시 기존 구독은 모두 invalidate 되므로 사용자에게 재구독 안내가 필요.
  로테이션 주기: 6 개월 (§8.1).
- **ntfy 사용자 관리**: ACL 기본값은 `deny-all` (compose env `NTFY_AUTH_DEFAULT_ACCESS`).
  BE publisher 만 발급:
    ```bash
    docker compose exec ntfy ntfy user add --role=user wm-publisher
    docker compose exec ntfy ntfy access wm-publisher 'wm-prod-*' write
    docker compose exec ntfy ntfy access everyone   'wm-prod-*' read
    docker compose exec ntfy ntfy token add wm-publisher  # → NTFY_AUTH_TOKEN
    ```
  편의 명령어: `python manage.py init_ntfy_user wm-publisher` 가 위 스니펫을 출력.
- **APNs 키 (.p8) 회전**: App Store Connect 에서 새 키 발급 → `APNS_KEY_ID`,
  `APNS_KEY_PEM` env 갱신 → `api` 재시작. 구 키는 즉시 폐기 (Apple revoke).
- **모니터링**:
  - Web Push 실패율 > 10% (이상치) → Slack 알림 (VAPID 만료 / 잘못된 키 의심)
  - APNs 410 비율 > 일평균 + 3σ → 사용자 디바이스 교체율 급변 신호
  - ntfy 컨테이너 healthcheck (`/v1/health` GET) → 90s 다운 시 page

토글은 deploy 단계 환경변수만으로 완결된다. 코드 변경 없음. 시크릿 로테이션은 §8.1.

---

## 6. 데이터베이스 운영

### 6.1 모니터링

- CloudWatch + RDS Performance Insights
- 알림 임계:
  - CPU > 70% (5분 지속) → 경고
  - CPU > 85% (5분 지속) → 페이지
  - Replication lag > 30s → 경고
  - Free storage < 20% → 경고

### 6.2 마이그레이션

- 큰 테이블 ALTER 시 `pg_repack` 또는 단계적 마이그레이션 사용
- 인덱스 추가는 `CONCURRENTLY`
- 운영 시간 외 (자정 ~ 새벽 5시) 권장

### 6.3 백업 복원 리허설

- 월 1회 stg 환경에 prod 백업 복원 → 헬스체크 → 결과 기록
- 분기 1회 모의 장애 (DB primary 강제 failover)

---

## 7. 캐시 (Redis)

- 키 네임스페이스: `wm:<env>:<domain>:<key>` (예: `wm:prod:leave:balance:<membership_id>`)
- TTL 명시 필수. 무한 TTL 키 금지.
- 메모리 80% 초과 → 알림. eviction policy: `allkeys-lru`.

---

## 8. 보안 운영

### 8.1 시크릿

- 로테이션:
  - JWT signing key: 6개월 (양키 롤링 — 새 키 발행 후 1주 동시 검증)
  - DB 패스워드: 1년
  - OAuth client secret: 1년
  - 외부 API 키 (VAPID, APNs `.p8`, ntfy publisher token, SES): 6개월
- 노출 사고 시 즉시 로테이션 + 영향 분석.

### 8.2 권한

- AWS IAM: least privilege 원칙. 운영자 콘솔 직접 접근은 MFA 필수.
- prod DB 직접 SQL 실행은 2명 이상 승인. SELECT 만 허용 (운영 SOP).

### 8.3 취약점 관리

- `pip-audit` / `npm audit` / `flutter pub audit` 매주 실행 (CI)
- Critical CVE 공지 시 24시간 이내 패치 검토.
- 의존성 업그레이드는 분기별 정기 + 수시 보안 패치.

### 8.4 PII 보호

- 개인정보 (이름, 이메일, 전화, 위치) 는 로그에 남기지 않는다 (구조화 로그 schema 에서 자동 마스킹).
- 데이터 export 시 다운로드한 사람 / 시각 / IP 기록 (audit_log).
- 회사 계약 종료 시 30일 후 익명화. 90일 후 물리 삭제.

---

## 9. 모니터링 / 알림

### 9.1 SLI / SLO

| 지표 | 목표 | 비고 |
|---|---|---|
| API 가용성 | 99.9% / 월 | 다운타임 ≤ 43분 |
| API P95 레이턴시 | ≤ 300ms | 핵심 엔드포인트 |
| API P99 레이턴시 | ≤ 800ms | |
| 출퇴근 성공률 | ≥ 99.95% | 5xx + 의도하지 않은 4xx |
| WS 연결 성공률 | ≥ 99.5% | |

### 9.2 알림 채널

- Slack `#ops-alerts`: 모든 경고
- PagerDuty: 페이지 등급 (즉시 대응) — SLO 위반, DB 다운, 인증 시스템 장애
- 이메일: 일일 운영 요약

### 9.3 대시보드

- Grafana (또는 CloudWatch Dashboard)
  - API 트래픽 / 에러율 / 레이턴시 (엔드포인트별)
  - DB CPU / 커넥션 / lock waits
  - Redis 메모리 / hit rate
  - Celery 큐 길이 / 처리량 / 실패율
  - 비즈니스 지표: 일일 출근 수, 신청 수, 승인 처리 시간

---

## 10. 장애 대응

[`runbook.md`](runbook.md) 에 시나리오별 절차 보관.

기본 원칙:
1. **확인** — 알림 → 대시보드 / 로그 확인
2. **공지** — Slack `#incidents` 에 영향 범위 공유
3. **완화** — 우선 사용자 영향 최소화 (롤백 / 우회 / 캐시)
4. **근본 원인 조사** — 완화 후
5. **사후 보고서** — 24시간 내 (5 Whys, 재발 방지)

---

## 11. 출시 체크리스트 (Pre-launch)

### 11.1 v1.0 MVP 출시 전

> 상태 표기: ✅ 완료 · 🟡 부분 완료 · ⏳ 미시작 · 🔴 차단 (blocked)
> 마지막 업데이트: 2026-05-08

#### BE 코드 변경 후 필수 절차 (F-LIVE-004)

BE (`services/api/`) 를 변경한 경우 **컨테이너 단순 재시작은 부족하다** — 이미지를 반드시 재빌드해야 한다.

```bash
docker compose build api && docker compose up -d api
```

재빌드 후 신규 라우트 smoke 확인 (401 = route OK, 404 = rebuild 미적용):

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4455/v1/admin/settings
# → 401 (not 404)
curl http://localhost:4455/v1/health
# → {"status": "ok"}
```

`404` 가 반환되면 빌드가 반영되지 않은 것이므로 빌드를 다시 실행한다. PR 머지 전 위 smoke 를 통과해야 한다.

#### audit log 보존 (F-OWNER-06)

- audit log 는 90일 보존 후 자동 삭제 배치 필요 (`apps/audit/tasks.py` → `purge_old_audit_logs`).
- 배치는 Celery Beat 에 등록 (`CELERY_BEAT_SCHEDULE`): 매일 자정 실행.
- Beat 단독 인스턴스 (`wm-beat` 컨테이너) 가 중단되면 배치가 실행되지 않으므로 알림 설정 필수 (§3.4 참고).
- 7년 이상 데이터 물리 삭제 정책과 혼동 금지 — 90일은 audit log, 7년은 `sop-data-deletion-request.md §7` 의 법적 보존 최소 기간.

- [ ] 🟡 **부하 테스트** (목표 DAU × 3 트래픽) — `tools/load/locustfile.py` 09:00 출근 피크 시뮬 스켈레톤 작성됨 (1000 users / 50 spawn-rate / 5min). 실제 stg 환경에서 측정 + SLA(95p < 800ms) 검증 미실시. *Owner: TBD · Target: 2026-06-15*
- [ ] 🟡 **카오스 테스트** (DB failover, Redis down, Celery down) — `tools/chaos/scripts/{db_pause,redis_down,celery_pause,ntfy_down}.sh` + `run_all.sh` 4 시나리오 스크립트화 완료. stg 에서 부하 + 카오스 동시 실행 + 회복 검증 미실시. *Owner: TBD · Target: 2026-06-30*
- [ ] 🟡 **보안 점검** (OWASP Top 10, 의존성 audit) — audit log(`apps/audit/`) + 로그인 lockout + 2FA(TOTP) 구현 완료. 외부 펜테스트(pen-test) 미실시. *Owner: TBD · Target: 2026-07-15*
- [ ] ⏳ **개인정보처리방침 / 이용약관 / 통신판매업 신고** (해당 시) — 법무 검토 미시작. *Owner: TBD · Target: 2026-06-30*
- [ ] ⏳ **한국 개인정보보호법 / GDPR 검토** — DPO 지정 + SOP-data-export-request / SOP-data-deletion-request 작성 완료. 법무 최종 검토 + 외부 컴플라이언스 감사 미수행. *Owner: TBD · Target: 2026-07-15*
- [ ] ⏳ **App Store / Play Store 심사 통과** — Flutter 셸(`apps/mobile/`) 빌드 가능. 양 스토어 개발자 계정 등록 + 첫 제출 미진행. *Owner: TBD · Target: 2026-07-31*
- [ ] ⏳ **Apple Notarization (Mac Electron)** — `apps/desktop/electron-builder.yml` 의 `mac.notarize: false` 상태. Apple Developer ID 인증서 미확보, `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` env 미설정. *Owner: TBD · Target: 2026-07-31*
- [ ] ⏳ **Windows code signing** — `electron-builder.yml` win.target NSIS 설정 완료. EV / OV 인증서 미확보, `CSC_LINK` / `CSC_KEY_PASSWORD` env 미설정. *Owner: TBD · Target: 2026-07-31*
- [ ] 🟡 **모니터링 대시보드 / 알림 룰 모두 활성** — Terraform observability 모듈(`infra/terraform/modules/observability/main.tf`) 작성 완료(SNS topic + CloudWatch log group + metric filter). Sentry SDK 스캐폴딩 완료(BE: `services/api/work_manager/settings/base.py` SENTRY_DSN guard, FE: `apps/web/src/main.tsx` VITE_SENTRY_DSN guard) — stg+prod 에 DSN 주입 시 ✅. 실제 prod 환경 deploy + Grafana / PagerDuty 연동 미진행. *Owner: TBD · Target: 2026-06-15*
- [ ] ⏳ **온콜 로테이션 확정** — PagerDuty 계정 미연동. 로테이션 정책 / 보상 협의 미시작. *Owner: TBD · Target: 2026-06-30*
- [ ] 🟡 **사용자 매뉴얼 / 도움말 / FAQ 작성** — `docs/user-guide/` 작성 완료 (README + getting-started + employee/manager/admin/owner + faq). 앱 내 헬프 센터 라우트는 `/m/help` 가 매뉴얼로 링크 (Wave 5). 회사별 커스터마이즈 가이드 (회사 로고/콜백 URL) 별도 작성 필요. *Owner: TBD · Target: 2026-07-15*
- [ ] ⏳ **백업 / 복원 리허설** — RDS 자동 백업 활성, PITR 활성(architecture §7.1). stg 복원 리허설 미실시 (`operations-guide.md` §6.3 의 "월 1회" 약속 시작 전). *Owner: TBD · Target: 2026-06-30*

---

## 12. 운영 SOP 색인

| SOP | 문서 | Owner |
|---|---|---|
| 신규 회사 온보딩 | [`sop/sop-onboard-new-company.md`](sop/sop-onboard-new-company.md) | Customer Success Lead |
| 사용자 데이터 export 요청 처리 | [`sop/sop-data-export-request.md`](sop/sop-data-export-request.md) | DPO / 보안 담당 |
| 사용자 데이터 삭제 요청 처리 (GDPR / 개인정보보호법) | [`sop/sop-data-deletion-request.md`](sop/sop-data-deletion-request.md) | DPO / 보안 담당 |
| 비밀번호 강제 리셋 (대규모 사고 시) | [`sop/sop-emergency-password-reset.md`](sop/sop-emergency-password-reset.md) | Security Lead |
| 이메일 도메인 평판 회복 | [`sop/sop-email-reputation-recovery.md`](sop/sop-email-reputation-recovery.md) | DevOps Lead |
| App Store / Play Store 긴급 업데이트 | [`sop/sop-app-store-emergency-update.md`](sop/sop-app-store-emergency-update.md) | Mobile Lead |
| 회사 가입 코드 (company-code) 발급 / 회수 | [`../manuals/admin-company-codes.md`](../manuals/admin-company-codes.md) | Customer Success Lead |

운영 인덱스 전체: [`index.md`](index.md)
