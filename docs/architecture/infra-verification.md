# Infra 아키텍처 검증 (Infrastructure Verification — SDD)

> **Document version**: 1.0
> **Last updated**: 2026-05-13
> **Phase**: 4 · v1.0 출시 준비
> **Owner**: SRE / Backend
> **Sources**: `infra/terraform/` (모듈 12 + envs 3), `.github/workflows/{ci,dep-audit,release}.yml`, `docs/operations/{operations-guide.md,ci-cd.md,runbook.md}`, [ADR-003](../adr/ADR-003-django-rest-channels.md), [ADR-006](../adr/ADR-006-self-hosted-push-no-firebase.md)

본 문서는 Terraform 모듈, CI/CD, 관측, 보안, 재해 복구 영역의 **검증 절차 카탈로그** + **prod readiness gate** 정의다. operations-guide §11.1 의 출시 체크리스트는 본 문서의 P0 항목과 일치한다.

---

## 0. 검증 흐름

```
Terraform validate → plan → stg apply → 회귀 → prod apply
       ↓
관측 / 알람 / 로그 (CloudWatch + Sentry + PagerDuty)
       ↓
복원 / 카오스 / 부하 리허설
       ↓
Release Gate (P0 모두 ✅) → GA
```

---

## 1. Terraform 모듈 검증 매트릭스

`infra/terraform/modules/` 12개. CLAUDE.md 가 "11개" 로 명시한 것은 stale (Task 7 참조).

| 모듈 | 검증 항목 | 도구 | 환경별 차이 |
|---|---|---|---|
| **network** | VPC CIDR / 3AZ subnet / NAT 가동 | tf validate + AWS console | NAT 1개(dev), AZ당 1개(prod) |
| **secrets** | DB 패스워드 rotation 가능, recovery 기간 | tf validate | 7d(dev) / 30d(stg/prod) |
| **acm** | regional cert (ap-northeast-2) + CF cert (us-east-1) DNS 검증 통과 | AWS console | 동일 |
| **alb** | listener 80(redirect) + 443(HTTPS), target group health | curl + ALB log | deletion_protection: prod only |
| **route53** | A/AAAA 레코드 + health check probe(`/v1/health`) | dig + route53 console | dev 는 zone 미생성 |
| **s3-cdn** | SPA bucket 정적자산 + CF distribution + cache invalidation | curl + CF log | force_destroy: prod=false |
| **rds** | PostgreSQL 16, encryption at rest, multi-AZ, automated backup | RDS console + `psql` | multi-AZ: prod only |
| **elasticache** | Redis cluster reachability, max memory policy | redis-cli ping | multi-AZ: prod only |
| **ecs** | Fargate task defs(api/ws/worker/beat), service health, IAM role 최소 권한 | ECS console + CloudWatch | image tag per env |
| **observability** | log group 보존, metric filter, alarm 발화, SNS/PD 라우팅 | CloudWatch + SNS console | 보존: 30d(dev/stg), 90d(prod) |
| **waf** | WAF v2 rate limit + (선택) bot control + (선택) geo block | WAF console + 합성 트래픽 | 기본 비활성(dev), 활성(prod) |
| **desktop-updates** | Electron auto-update 매니페스트 + binary 서명 검증 | electron-updater + integrity 체크 | 채널: beta(dev) / stg / prod |

### 1.1 자동 검증

```bash
# 포맷
terraform -chdir=infra/terraform fmt -check -recursive

# 각 env 별 validate (CI 의 infrastructure 잡과 동일)
for env in dev stg prod; do
  terraform -chdir=infra/terraform/envs/$env init -backend=false
  terraform -chdir=infra/terraform/envs/$env validate
done
```

CI: `.github/workflows/ci.yml#L<infrastructure-job>` — 모든 PR 에서 fmt + validate.

### 1.2 수동 / Live 검증

```bash
# stg plan (실 변경 없음)
terraform -chdir=infra/terraform/envs/stg init \
  -backend-config="bucket=wm-tfstate-<account>" \
  -backend-config="dynamodb_table=wm-tfstate-lock"
terraform -chdir=infra/terraform/envs/stg plan
```

### 1.3 State backend 검증

| 항목 | 검증 |
|---|---|
| S3 bucket `wm-tfstate-<account>` | versioning 활성, AES256 암호화, public access block |
| DynamoDB table `wm-tfstate-lock` | PAY_PER_REQUEST, primary key `LockID` |
| 백엔드 config | `-backend-config` 로 init 시 주입 (HCL 커밋 금지) |
| 동시성 | 두 명 동시 apply 시도 → DynamoDB lock 으로 차단 |

---

## 2. 시크릿 관리 검증

### 2.1 검증 항목

| ID | 항목 | 도구 |
|---|---|---|
| INF-SEC-01 | `.env.example` 만 commit. 실 시크릿 0건 | gitleaks pre-commit + `.gitignore` |
| INF-SEC-02 | AWS Secrets Manager 에 prod 시크릿 주입 (`SENTRY_DSN_*`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAGERDUTY_INTEGRATION_KEY`, `SLACK_WEBHOOK_OPS`, DB 패스워드) | AWS console + Terraform `aws_secretsmanager_secret` |
| INF-SEC-03 | ECS task definition 에서 secret 참조 (`secrets` block) | task def JSON |
| INF-SEC-04 | GitHub Secrets 에 release 시크릿 (`APPLE_ID`, `MAC_CSC_LINK`, `CSC_KEY_PASSWORD`, `WM_UPDATE_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) | `.github/RELEASE_SECRETS.md` |
| INF-SEC-05 | VAPID key 6개월 회전 | `manage.py generate_vapid_keys` + ops calendar |
| INF-SEC-06 | APNs `.p8` 1년 회전 (Apple Developer Portal 정책) | `APNS_KEY_PEM` env |
| INF-SEC-07 | ntfy ACL deny-all + Bearer 토큰 사용 | ntfy 서버 config 검사 |
| INF-SEC-08 | dep-audit HIGH/CRITICAL → 자동 이슈 발행 | `.github/workflows/dep-audit.yml` |

---

## 3. CI/CD 검증

### 3.1 ci.yml (push / PR)

| Job | 검증 |
|---|---|
| backend | Postgres + Redis 컨테이너 부팅 + healthcheck wait. `pytest --cov-fail-under=50 --cov-report=xml`. coverage artifact upload. |
| frontend | OpenAPI 스키마 drift 체크 (`npm run types:check`) — 실패 시 빨간색. typecheck + lint(`--max-warnings=0`) + vitest + build. |
| e2e | 전체 스택 부팅 (db/redis/api/ws/worker/beat/web/ntfy). seed_demo 실행. Playwright 2 retries. 실패 시 HTML report + container logs. |
| infrastructure | tf fmt + envs/{dev,stg,prod} validate |

### 3.2 dep-audit.yml (weekly)

| Job | 검증 |
|---|---|
| backend | pip-audit. HIGH/CRITICAL → `gh issue create --label security` |
| web | npm audit. 동일 |
| desktop | npm audit. 동일 |
| mobile | flutter pub audit. `continue-on-error` (다른 잡 block 방지) |

### 3.3 release.yml (release published / dispatch)

| Job | 검증 |
|---|---|
| release-mac | Apple Developer ID 서명 → notarytool 인증 → DMG/ZIP. 환경 시크릿 (APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID, MAC_CSC_LINK, CSC_KEY_PASSWORD). |
| release-win | signtool RFC3161 서명 (또는 cloud sign via `WM_WIN_SIGN_MODE=cloud`). 환경 시크릿 (CSC_LINK, CSC_KEY_PASSWORD). |
| release-linux | unsigned AppImage |
| publish | `WM_UPDATE_BUCKET` 시 `--publish=always` → `s3://<bucket>/desktop/<channel>/`. GitHub Release asset upload. |

### 3.4 검증 시나리오

| ID | 시나리오 | 도구 |
|---|---|---|
| INF-CI-01 | PR 머지 → ci.yml 모든 잡 통과 | GH Actions |
| INF-CI-02 | OpenAPI drift 발생 → frontend 잡 실패 + diff 노출 | `npm run types:check` |
| INF-CI-03 | pip-audit HIGH 발견 → 이슈 자동 발행 | weekly cron |
| INF-CI-04 | tag `v1.0.0` push → release.yml 3 잡 통과 + S3 publish | GH Actions + S3 console |
| INF-CI-05 | Electron app auto-update — 사용자에게 update-available → update-downloaded | 실 desktop binary + S3 prod 채널 |

---

## 4. 관측 (Observability) 검증

### 4.1 CloudWatch

| 항목 | 위치 | 검증 |
|---|---|---|
| log group `/wm/{env}/app` | observability 모듈 | api/ws 로그 흘러옴, 보존 기간 정확 |
| log group `aws-waf-logs-wm-{env}` | observability 모듈 | WAF 로그, 보존 기간 정확 |
| metric filter `AppErrors` | observability 모듈 | `$.level = "ERROR"` 카운트 → CloudWatch 메트릭 |
| alarm `wm-{env}-alb-5xx-rate` | observability 모듈 | 5xx ratio > 1% over 5min → SNS publish |
| SNS topic ops alerts | observability 모듈 | email subscription + PagerDuty (옵션) |

### 4.2 Sentry

| 플랫폼 | DSN env | init 위치 |
|---|---|---|
| Web | `VITE_SENTRY_DSN` | `apps/web/src/main.tsx` |
| Desktop main | `WM_SENTRY_DSN_MAIN` | `apps/desktop/src/main/index.ts` (있다면) |
| API | `SENTRY_DSN` | `services/api/work_manager/settings/prod.py` |
| Mobile (Flutter) | (현재 미설정 — 검토 필요) | — |

**검증**:
- 4개 환경별 프로젝트 분리 (api / web / desktop / mobile)
- DSN 은 env 주입, 코드 0건 (gitleaks 차단)
- prod 전용 에러 sampling rate(`traces_sample_rate=0.1`)

### 4.3 PagerDuty

| 항목 | 검증 |
|---|---|
| SNS → PD endpoint | `infra/terraform/modules/observability/pagerduty.tf` |
| 스케줄 | primary / secondary on-call (B-OPS-09) |
| Fire drill | 분기 1회 강제 발화 → 대응 시간 측정 |
| Runbook URL | 알람 description 에 runbook 링크 포함 (R-001~R-011) |

### 4.4 검증 시나리오

| ID | 시나리오 | 검증 |
|---|---|---|
| INF-OBS-01 | API 에서 500 발생 → Sentry 이벤트 도착 | manual / synthetic |
| INF-OBS-02 | ALB 5xx 비율 > 1% 5분간 → CloudWatch alarm → SNS → PD page | 합성 트래픽 |
| INF-OBS-03 | Beat down → metric 부재 감지 → 알람 | (현재 자동화 갭 — runbook R-XX 추가 권장) |
| INF-OBS-04 | DB connection pool > 80% → 알람 | (Phase 5 검토) |
| INF-OBS-05 | dep-audit weekly → GH 이슈 발행 → Slack 통보 | manual sync 1회 |

---

## 5. 보안 검증

### 5.1 자동 (CI)

| ID | 항목 | 도구 |
|---|---|---|
| INF-SEC-AUTO-01 | gitleaks pre-commit + CI | `.pre-commit-config.yaml` |
| INF-SEC-AUTO-02 | pip-audit / npm audit / flutter pub audit | `.github/workflows/dep-audit.yml` |
| INF-SEC-AUTO-03 | OpenAPI 스키마 drift — 호환 깨짐 검출 | ci.yml frontend job |
| INF-SEC-AUTO-04 | ESLint `--max-warnings=0` | ci.yml |
| INF-SEC-AUTO-05 | ruff + mypy(core/ strict) | ci.yml backend |
| INF-SEC-AUTO-06 | terraform validate | ci.yml infrastructure |

### 5.2 수동 / 외부

| ID | 항목 | 주체 |
|---|---|---|
| INF-SEC-MAN-01 | 외부 펜테스트 (B-OPS-04) — HIGH/CRITICAL 100% 해결 | 외부 벤더 |
| INF-SEC-MAN-02 | OWASP Top 10 점검 — XSS / CSRF / SQL injection / SSRF | 펜테스트 + 코드 리뷰 |
| INF-SEC-MAN-03 | TLS 설정 — TLS 1.2 minimum, HSTS 1y, OCSP stapling | `ssllabs.com` 등 |
| INF-SEC-MAN-04 | WAF 규칙 검증 — rate limit + bot control 효과 | 합성 트래픽 |
| INF-SEC-MAN-05 | IAM 최소 권한 원칙 — ECS task role 권한 검사 | manual review |
| INF-SEC-MAN-06 | RBAC — DRF permission 검증 (admin_api / billing) | code review |

---

## 6. 재해 복구 (DR) 검증

### 6.1 백업

| 자원 | 백업 정책 | RPO 목표 | RTO 목표 |
|---|---|---|---|
| RDS PostgreSQL | automated backup (7d retention) + manual snapshot 월 1회 | 1시간 (PITR) | 2시간 |
| S3 (SPA assets + desktop updates) | versioning + replication (prod → 별도 region 검토) | 즉시 | 30분 |
| AWS Secrets Manager | secret rotation history (7d/30d) | 즉시 | 5분 |
| Audit logs | CloudWatch log retention 90d (prod) | 즉시 | 즉시 |

### 6.2 복원 리허설 (B-OPS-06)

| 시나리오 | 단계 | 검증 |
|---|---|---|
| RDS PITR | stg DB → 5분 전 시점 복원 | 데이터 일치 + RTO 2시간 이내 |
| S3 SPA | 이전 buckets version → CF cache invalidation | 사용자 접속 정상 |
| 전체 region down | 미정 — 단일 region (ap-northeast-2). 멀티 region 은 v2 검토 | — |

### 6.3 카오스 (B-OPS-07)

| 시나리오 | 검증 |
|---|---|
| Beat 죽음 | 자동 출퇴근 알림 누락 → 알람 발화 → runbook R-XX 따라 부활 |
| Redis 일시 차단 | WebSocket 끊김 → 자동 재연결 (client) + Sentry 에러 0 spike |
| DB connection pool 고갈 | `503 Service Unavailable` 발생 → 알람 + 자동 회복 |
| 09:00 트래픽 (DAU × 3) | API 응답 P95 ≤ 500ms 유지, WS 안정성 |

---

## 7. Capacity & Cost

`docs/architecture/architecture.md §13` 의 capacity 가정 검증.

| 항목 | 가정 | 검증 |
|---|---|---|
| DAU | 1000 (v1.0 출시 목표) | Sentry / CloudWatch metric |
| Peak concurrent users | DAU × 0.2 = 200 (09:00 / 18:00) | ALB metric |
| 동시 WS connections | DAU × 0.3 = 300 | Channels worker metric |
| RDS instance class | dev/stg: db.t4g.micro / prod: db.t4g.small (확장 가능) | RDS metric |
| Redis | dev/stg: cache.t4g.micro / prod: cache.t4g.small | ElastiCache metric |
| ECS Fargate vCPU | api/ws: 0.5 / worker: 0.25 / beat: 0.25 (dev). prod: scale 검토 | ECS metric |
| 월간 cost (prod 예상) | $400-600 (RDS + ALB + ECS + WAF + CF + S3 + 데이터 전송) | AWS Cost Explorer |

**갭**: prod 실측 미수행 (B-OPS-07). 출시 후 1주 데이터로 가정 보정.

---

## 8. 운영 SOP / Runbook cross-reference

`docs/operations/sop/` 6개:
- `sop-onboard-new-company.md` — 신규 회사 온보딩
- `sop-data-export-request.md` — 데이터 export 요청 (GDPR / 한국 개보법)
- `sop-data-deletion-request.md` — 데이터 삭제 요청
- `sop-emergency-password-reset.md` — 긴급 패스워드 재설정 (2FA bypass)
- `sop-email-reputation-recovery.md` — 이메일 평판 회복
- `sop-app-store-emergency-update.md` — 앱스토어 긴급 hotfix

`docs/operations/runbook.md` 시나리오 R-001~R-011: 헬스체크 실패, Beat down, 응답 지연, DB connection 고갈, Redis 차단, push 실패 burst, audit 누락, certificate 만료 등.

**검증**: 각 SOP/Runbook 항목에 대해 분기 1회 dry-run 또는 신입 온보딩 시 실습.

---

## 9. Release Readiness Gate

Phase 4 → GA 전제 (operations-guide §11.1 의 기준과 일치):

### 9.1 P0 — GA 차단

| ID | 항목 | 책임 | 상태 |
|---|---|---|---|
| RR-01 | Win EV 코드사이닝 (B-OPS-01) | SRE | 🟡 인증서 미확보 |
| RR-02 | macOS Notarization (B-OPS-02) | SRE | 🟡 미진행 |
| RR-03 | App Store + Play Store 개발자 계정 + 첫 제출 (B-OPS-03) | Product + SRE | 🟡 미진행 |
| RR-04 | 외부 펜테스트 (B-OPS-04) | SRE + 외부 | 🟡 미수행 |
| RR-05 | prod 시크릿 + 모니터링 주입 (B-OPS-05) | SRE | 🟡 부분 — Sentry DSN/PD/Slack 미주입 |
| RR-06 | 백업 / 복원 리허설 (B-OPS-06) | SRE | 🟡 미실행 |
| RR-07 | 법무 검토 + GDPR 감사 (B-OPS-08) | Legal | 🟡 미진행 |
| RR-08 | `make test-all` Docker 안에서 100% 통과 | All | 🟢 (iter13/14 시점 기준) |
| RR-09 | `docs/qa/feature-verification.md` regression-gate 모두 통과 | QA | 🟢 (iter14 prelaunch smoke 기준) |
| RR-10 | `docs/qa/ui-ux-verification.md` Release Gate 모두 통과 | QA + Designer | 🟢 |

### 9.2 P1 — GA 직후 (2주 이내)

| ID | 항목 | 책임 |
|---|---|---|
| RR-P1-01 | stg 부하 + 카오스 (B-OPS-07) | SRE |
| RR-P1-02 | 온콜 + Fire drill (B-OPS-09) | SRE |
| RR-P1-03 | F-OWNER-07 Stripe 통합 (B-CODE-01) | Backend + Frontend |
| RR-P1-04 | iOS 네이티브 (B-CODE-02) | Mobile |
| RR-P1-05 | COMP balance bucket (B-CODE-03) | Backend |

---

## 10. 자동 검증 명령어

```bash
# Terraform
terraform -chdir=infra/terraform fmt -check -recursive
for env in dev stg prod; do
  terraform -chdir=infra/terraform/envs/$env init -backend=false
  terraform -chdir=infra/terraform/envs/$env validate
done

# CI 잡 로컬 reproduction
make test-be        # backend pytest
make test-fe        # frontend + OpenAPI drift
make test-e2e       # Playwright real-stack
make audit          # pip-audit + npm audit + flutter pub audit

# 시크릿 스캔
pre-commit run gitleaks --all-files

# 헬스 probe
curl http://localhost:4455/v1/health   # 200 JSON
curl https://api.dev.work-manager.molcube.com/v1/health  # prod-like
```

---

## 11. 다음 단계

### 자동화 갭
- **Beat 헬스 메트릭** (INF-OBS-03 자동화)
- **합성 트래픽 부하 + 카오스 자동화** — k6 / Locust 스크립트 존재, stg 실행만 수동
- **a11y CI 잡 추가** — axe-playwright 추가 권장

### 문서 갭
- CLAUDE.md "Terraform 11개 모듈" → "12개" 수정 (Task 7)
- ADR-006 가 `docs/adr/README.md` 인덱스에 누락 (Task 7)
- prod 시크릿 주입 체크리스트 — operations-guide §11.1 보강

### 거버넌스
- 분기 1회 본 문서 표 갱신 (capacity 가정 재검토)
- 사고 발생 시 runbook + 본 문서 동시 갱신 (post-mortem 산출물)
