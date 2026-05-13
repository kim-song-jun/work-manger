# 구현 현황 (Implementation Status — SDD)

> **Document version**: 1.0
> **Last updated**: 2026-05-13
> **Phase**: 4 · v1.0 출시 준비
> **Owner**: Engineering
> **Purpose**: 구현된 도메인 × 플랫폼 × 인프라 완성도 + 갭. SDD(Specification-Driven Development) 베이스라인.

본 문서는 코드 트리(`apps/*`, `services/api`, `infra/terraform`)와 사양 문서(`docs/specs/feature-spec.md`, `docs/specs/screen-catalog.md`, `docs/architecture/architecture.md`) 사이의 매핑이다.

---

## 0. 요약 (TL;DR)

| 레이어 | 완성도 | 비고 |
|---|---|---|
| Backend (Django + DRF + Channels) | ~90% | 13개 앱(+billing 스켈레톤) 구현. admin_api / identity 테스트 0건이 마지막 갭. |
| Web SPA (React + Vite) | ~92% | 54개 페이지 라우팅 완료, orphan 0, FSD 구조, i18n ko/en 패리티, MSW 일부만 |
| Desktop (Electron 33) | ~85% | 트레이/자동 클락인/auto-update(S3) 완료. EV 코드사이닝 미확보. |
| Mobile (Flutter WebView) | ~75% | Android 네이티브(geofence + ntfy + Glance widget) 완료. iOS는 WidgetKit 수동 Xcode 셋업 대기. |
| Infra (Terraform) | ~95% | 12개 모듈 + 3 envs. dev/stg/prod 동일 컴포지션, prod 한정 multi-AZ + WAF |
| CI/CD | 100% | ci.yml + dep-audit.yml + release.yml 가동 |
| Push (ADR-006) | 100% | Web Push(VAPID) + APNs HTTP/2 + ntfy 3채널 라우터 |
| 출시 블로커 | 운영 잔여 | 외부 펜테스트, 코드사이닝 인증서, 앱스토어 계정, prod 시크릿 주입 |

> CLAUDE.md 는 "Terraform 11개 모듈" 로 명시하나 **실제 12개**(network/rds/elasticache/s3-cdn/ecs/acm/alb/waf/route53/secrets/observability/desktop-updates). `desktop-updates` 가 iter12+에서 추가됨. CLAUDE.md 동기화 필요 (Task 7).

---

## 1. 도메인 × 백엔드 앱 매핑

`services/api/apps/` 13개 (+ `realtime` consumer + `billing` 스켈레톤).

| 도메인 | App | Models | Endpoints | Tests | Background | 상태 |
|---|---|---|---|---|---|---|
| 인증/온보딩 | identity | User, Company, Department, Membership, Location, CompanyJoinCode, RecoveryCode | `/v1/auth/*`, `/v1/me`, `/v1/onboarding/*`, `/v1/admin/company-codes` | 🟢 15 (B-CODE-06) | — | 구현 완료, auth flow 회귀 보호 |
| OAuth | oauth | OAuthAccount | `/v1/auth/oauth/{authorize,callback,link,unlink}` | 🟢 2 | — | 완료 |
| 출퇴근 | attendance | WorkSchedule, AttendanceRecord, BreakRecord, ManualClockInRequest, OvertimeRequest | `/v1/attendance/*`, `/v1/overtime/*` | 🟢 5 | `attendance.auto_clock_out` | 완료 |
| 연차 | leave | LeavePolicy, LeaveBalance, LeaveRequest | `/v1/leave/*` | 🟢 4 | `leave.{grant_monthly,grant_annual,notify_expiring,expire_balances_task,promote_unused_leave}` | 완료 (COMP balance bucket 임시 ANNUAL 공유 — backlog 참조) |
| 승인 | approval | ApprovalTask | `/v1/approvals/*` | 🟢 2 | — | 완료 |
| 팀 | team | (FK only, no new tables) | `/v1/team/*` | 🟢 2 | — | 완료 |
| 알림 | notification | NotificationPreference, NotificationLog, DeviceToken, NotificationOutbox | `/v1/notifications/*`, `/v1/notifications/devices`, `/v1/notifications/vapid-public-key` | 🟢 2 | Outbox dispatch (Beat) | 완료 (3채널 라우터) |
| 감사 | audit | AuditLog (append-only) | `/v1/audit/logs` | 🟢 1 | — | 완료 |
| 컴플라이언스 | compliance | (computed views) | `/v1/compliance/{me,team}`, `/v1/admin/compliance/52h` | 🟢 1 | — | 완료 |
| 출장 | trip | TripRequest | `/v1/trips/*` | 🟢 1 | — | 완료 |
| 공지 | notice | Notice | `/v1/notices/*` | 🟢 1 | — | 완료 |
| 실시간 | realtime | (ephemeral) | WS `/v1/ws/{team,inbox,admin}` | 🟢 1 | — | 완료 |
| 관리자 | admin_api | (view layer only) | `/v1/admin/*` (dashboard, employees, approvals, reports, expiring-leave, settings) | 🟢 14 (B-CODE-06) | — | RBAC + 권한 분리 회귀 보호 |
| 빌링 | billing | SubscriptionPlan, CompanySubscription, Invoice | `/v1/billing/{plans,subscription,invoices}` | 🟡 1 (skeleton) | — | **스켈레톤** (F-OWNER-07, Stripe 통합 backlog) |

**Push 프로바이더** (`services/api/apps/notification/providers/`):
- `web_push.py` — Web Push (VAPID, pywebpush). Web / Desktop 디바이스 fan-out. 410/404 → 토큰 삭제.
- `real_push.py` — APNs HTTP/2 (httpx, JWT signed `.p8`). iOS 디바이스. 410/badToken → 영구 실패.
- `ntfy.py` — self-hosted ntfy. Android. 토픽 `{NTFY_TOPIC_PREFIX}-membership-{id}`. ACL deny-all + Bearer.
- `push.py` — placeholder (dev/테스트 보조). DeviceToken 존재 시 success.
- `inapp.py` / `real_email.py` — 인박스 + 이메일.

**ADR-006 준수**: Firebase 의존성 0건. VAPID 키는 6개월 회전(`manage.py generate_vapid_keys`).

---

## 2. 프론트엔드 × 도메인 매핑

### 2.1 Web SPA (`apps/web/`)

**라우트 인벤토리** (`apps/web/src/app/App.tsx`): 54 라우트, **orphan 0**.

| 구역 | 라우트 prefix | 페이지 수 | 가드 | 비고 |
|---|---|---|---|---|
| Public | `/login`, `/signup`, `/forgot`, `/onboarding/*`, `/logout`, `/__health` | 11 | 없음 | 8단계 온보딩 wizard 포함 |
| Mobile (직원/관리자) | `/m/*` | 27 | `RequireMember` + MobileShell | home, attendance, leave, my, overtime, inbox, record, report, notifications, notice, settings, profile, customize, trip, help, loc-picker, error-gps, compliance |
| Web 데스크탑 | `/web/*` | 5 | `RequireMember` + WebShell | dashboard, inbox, records, team-leave, team-calendar |
| Admin | `/admin/*` | 10 | `RequireAdmin` | dashboard, approvals, employees, employees/:id, reports, expiring-leave, audit, codes, compliance, settings |
| Owner | `/owner/*` | 1 | `RequireOwner` | billing (Stripe placeholder, "Change plan" 버튼 비활성 — i18n key `owner.billing.change_plan_tooltip` 명시) |

**Feature 레이어** (`apps/web/src/features/`, FSD): admin-approve-batch, admin-employee-edit, admin-issue-code, auth, break, clock-in, inbox-decide, leave-apply, overtime-request, trip-request, widget-sync.

**Entity 레이어** (`apps/web/src/entities/`): admin-dashboard, admin-report, approval, attendance, audit, billing, company-code, company-settings, compliance, employee, inbox, leave, notice, notification, overtime, team, trip, user (18개).

**Cross-cutting**:
- Route guards: `apps/web/src/app/routeGuards.tsx` (RequireMember/Admin/Owner)
- i18n: `apps/web/src/shared/i18n/index.ts` — 18 namespace, ko/en 패리티 100%
- 디자인 토큰: `apps/web/src/shared/styles/tokens.css` (CSS 변수, ADR-005)
- UI atoms: `apps/web/src/shared/ui/` 17개 컴포넌트
- OpenAPI 타입: `apps/web/src/shared/api/openapi-types.ts` (CI 에서 drift 체크)
- Sentry: `apps/web/src/main.tsx` (DSN env-gated)
- MSW: `apps/web/src/shared/msw/handlers/` (🟡 현재 billing.ts 1개만 — 확장 필요)
- Storybook: `.storybook/` + 68 stories

### 2.2 Desktop (`apps/desktop/`)

| 영역 | 파일 | 상태 |
|---|---|---|
| Main process | `src/main/index.ts` | App lifecycle, single-instance lock, dock icon |
| 트레이 | `src/main/tray.ts` | Windows tray / macOS menubar, 컨텍스트 메뉴 |
| 자동 클락인 | `src/main/auto-clock-in.ts` | One-shot 타이머 (setTimeout 24.8d 오버플로 re-arming) |
| Auto-update | `src/main/updater.ts` | electron-updater + S3(`WM_UPDATE_BUCKET`) → 제너릭(`WM_UPDATE_FEED_URL`) → none |
| 알림 | `src/main/notifications.ts` | OS native notification 라우팅 |
| IPC | `src/main/ipc.ts`, `src/shared/ipc-contracts.ts` | Typed channels |
| Preload | `src/preload/bridge.ts` | contextIsolation ON, channel allowlist |
| Tests | `src/main/__tests__/{auto-clock-in,notifications,updater}.test.ts` | 🟢 3 |

**배포**: `electron-builder.yml` — Mac(notarytool via `scripts/notarize.cjs`), Win(signtool RFC3161, cloud-sign via `scripts/win-sign.cjs`), Linux(AppImage). S3 publish: `s3://${WM_UPDATE_BUCKET}/desktop/{channel}/`.

### 2.3 Mobile (`apps/mobile/`)

| 영역 | 파일 | 플랫폼 | 상태 |
|---|---|---|---|
| Bootstrap | `lib/main.dart`, `lib/app.dart`, `lib/web_shell.dart` | both | 완료 |
| Native bridge | `lib/bridge/native_bridge.dart`, `lib/bridge/inject.dart` | both | 완료 (`window.NativeBridge` JS shim) |
| Geofence | `lib/geofence/geofence_service.dart` | Android | 완료 |
| Geofence | (above) | iOS | 🟡 stub no-op (Mac signing host 부재) |
| ntfy | `lib/notif/ntfy_client.dart`, `lib/notif/local_notifs.dart` | Android | 완료 |
| Android 네이티브 | `android/.../NtfyForegroundService.kt`, `GeofenceMethodChannelHandler.kt`, `GeofenceBroadcastReceiver.kt`, `WorkStatusWidget.kt` (Glance) | Android | 완료 |
| iOS 네이티브 | `ios/Runner/AppDelegate.swift` (APNs), `ios/WorkManagerWidget/*.swift` (WidgetKit) | iOS | 🟡 코드 존재, Xcode 수동 셋업 필요 |
| Tests | `test/{widget_channel_payload,geofence_payload,ntfy_client,bridge_payload,geofence/geofence_service}_test.dart` | both | 🟢 5 (unit only, no UI integration) |

**MethodChannel 인벤토리**:
- `com.molcube.workmanager/geofence` — `initBackground/addGeofence/removeGeofence/getActiveFences`
- `wm.push.apns` — iOS APNs 디바이스 토큰 등록
- WidgetChannel — Today/ThisWeek 위젯 데이터 sync

---

## 3. 인프라 × Terraform 모듈 매핑

`infra/terraform/modules/` 12개. `infra/terraform/envs/{dev,stg,prod}/` 동일 컴포지션, env-specific overrides.

| 모듈 | 리소스 (주요) | env 차이 |
|---|---|---|
| network | aws_vpc + 3AZ subnets, NAT, IGW | NAT 1개(dev) / AZ당 1개(prod) |
| secrets | aws_secretsmanager_secret | recovery 7d(dev) / 30d(prod) |
| acm | regional cert (ap-northeast-2) + CloudFront cert (us-east-1) | 동일 |
| alb | ALB + target groups (api / ws) | deletion_protection: prod only |
| route53 | DNS records, health check | dev 는 zone 미생성 |
| s3-cdn | SPA bucket + CloudFront | force_destroy: prod=false |
| rds | aws_db_instance(PostgreSQL 16) | multi-AZ: prod only |
| elasticache | aws_elasticache_cluster (Redis) | multi-AZ: prod only |
| ecs | Fargate cluster + task defs (api/ws/worker/beat) | image tag per env |
| observability | CloudWatch log groups + metric filters + alarms + SNS + PD | 로그 보존: 30d(dev/stg) / 90d(prod) |
| waf | aws_wafv2_web_acl | 기본 비활성(dev: $5-15/mo 절감) |
| desktop-updates | S3 update bucket + CloudFront | 채널: beta/stg/prod |

**State backend**: S3(`wm-tfstate-<account-id>`) + DynamoDB lock(`wm-tfstate-lock`). `-backend-config` 으로 init 시 주입(시크릿 격리).

**CI 검증**: `.github/workflows/ci.yml` infrastructure job — `terraform fmt -check -recursive` + envs/* 별 `init -backend=false` → `validate`.

---

## 4. 자동화 (CI/CD)

`.github/workflows/`:

| Workflow | 트리거 | 잡 | 비고 |
|---|---|---|---|
| ci.yml | push/PR all branches | backend(pytest --cov-fail-under=50) → frontend(typecheck + vitest + OpenAPI drift + build) → e2e(Playwright real-stack) // infrastructure(tf validate) | Postgres + Redis 컨테이너 부팅 + healthcheck wait. e2e seed 자동. |
| dep-audit.yml | weekly cron(Mon 02:00 UTC) + manual | pip-audit + npm audit(web) + npm audit(desktop) + flutter pub audit | HIGH/CRITICAL → GitHub issue 자동 (label: `security`) |
| release.yml | Release published(`v*.*.*`) + manual | release-mac(notarytool) // release-win(signtool RFC3161) // release-linux(AppImage) | S3 publish: `WM_UPDATE_BUCKET` 시 `--publish=always` |

**비밀 키** (`.github/RELEASE_SECRETS.md`): APPLE_ID, MAC_CSC_LINK, CSC_KEY_PASSWORD, WM_UPDATE_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.

---

## 5. 보안 매핑

| 영역 | 구현 | 위치 |
|---|---|---|
| JWT | SimpleJWT 5.3.1 (access + refresh) | `services/api/work_manager/settings/base.py` |
| OAuth2 | Google + Kakao | `services/api/apps/oauth/` |
| 2FA TOTP | pyotp, recovery codes (bcrypt) | `services/api/apps/identity/` (User.totp_enabled, RecoveryCode) |
| 로그인 락아웃 | failed_login_count + locked_until | `services/api/apps/identity/models.py` |
| 패스워드 | bcrypt + argon2-cffi | settings PASSWORD_HASHERS |
| 감사 로그 | append-only AuditLog (UPDATE/DELETE 금지) | `services/api/apps/audit/` |
| 시크릿 격리 | `.env.example` 만 commit, gitleaks pre-commit, AWS Secrets Manager | `.pre-commit-config.yaml`, `infra/terraform/modules/secrets/` |
| 컴플라이언스 | 90일 audit 보존, 52h 보드 | `apps/compliance/` + operations §3 |
| CVE 점검 | weekly dep-audit.yml | `.github/workflows/dep-audit.yml` |
| TLS | nginx + ACM | `infra/terraform/modules/{acm,alb}/` |
| 헬스 | `/v1/health` (200 JSON) | `services/api/work_manager/urls.py` |

---

## 6. 테스트 커버리지 매핑

| 영역 | 파일 수 | 갭 |
|---|---|---|
| BE pytest | 50 | 🔴 admin_api / identity 0건. billing/email-verify/2FA/lockout/RBAC 0건. |
| Web vitest | 70 | 🟡 페이지 24%(13/54), entity 50%(9/18). MSW 1개만(billing). |
| Desktop vitest | 3 | 🟢 핵심 3개 커버 |
| Mobile Dart unit | 5 | 🟢 unit 만, UI integration 0 |
| E2E Playwright | 12 specs | 🟢 페르소나 4 + 플로우 5 + smoke 2 |
| design-smoke | `apps/e2e/scripts/design-smoke.mjs` | 🟢 login/signup/onboarding 4 화면 (확장 여지) |
| console-smoke | `apps/e2e/scripts/console-smoke.mjs`, `onboarding-console-smoke.mjs` | 🟢 |

**갭 우선순위**:
1. **HIGH** — admin_api / identity 백엔드 테스트 (보안 핵심)
2. **MED** — Web 페이지 vitest 확장 (admin-dashboard, admin-reports, m-* detail)
3. **MED** — MSW handlers 도메인별 분리 (billing 외 17 entity)
4. **LOW** — E2E 에러 케이스 (quota, 권한 거부, WS reconnect)
5. **LOW** — Mobile UI widget integration tests

---

## 7. 갭 인벤토리 (구현 vs 사양)

코드/문서 양쪽 모두 식별된 갭. 자세한 acceptance criteria 는 `docs/tasks/backlog.md` 참조.

### 7.1 코드 갭
- **F-OWNER-07 빌링 Stripe 통합** — 데이터 레이어 완성, SDK init / `POST /v1/billing/checkout` / webhook receiver / `Invoice.external_id` writes 미완. Web 의 "Change plan" 비활성.
- **iOS 네이티브** — geofence + Glance 등가 (WidgetKit). 코드는 존재하나 Xcode 수동 셋업 + Mac signing host 필요.
- **COMP 휴가 balance bucket** — iter13 에서 임시 ANNUAL 공유. 별도 `LeaveBalance.kind=COMP` + 승인된 overtime → 1:1 적립 로직 필요.
- **iter13 발견 stale test** — `tests/test_seed_demo.py::test_seed_demo_creates_expected_rows` (9 leave req 반영), `apps/web/src/features/leave-apply/...` 2 vitest case.
- **F-MANAGER P3 deadcode 5건** — iter12 에서 deferred.
- **푸시 디바이스 토큰 invalidation 정책** — 410 / badToken 외 활성 토큰 만료 로직 미확정.

### 7.2 운영 갭
- **출시 블로커** (operations-guide §11.1):
  - Electron Setup.exe EV 코드사이닝 — 인증서 미확보
  - macOS Apple Notarization — Apple Developer ID + env 필요
  - App Store / Play Store 개발자 계정 — 등록 미진행
  - 외부 펜테스트 — 미수행
  - prod Sentry / Grafana / PagerDuty DSN 주입 — 미완
  - 온콜 로테이션 + 백업 복원 리허설 — 미수행
  - stg 부하 + 카오스 실측 — scripts 준비됨, stg 미실시
  - 법무 검토 (이용약관 / 개인정보처리방침 v1.0) — 미진행
  - GDPR 감사 — 미수행

### 7.3 문서 갭 (Task 7 cleanup)
- `docs/roadmap.md` line 3 — "Phase 0" 명시 (실제는 Phase 4)
- `docs/adr/README.md` — ADR-006 인덱스 누락 (파일은 존재)
- `docs/architecture/data-model.md` — Phase 1 스키마 참조 (실제 구현은 코드 우선)
- `docs/tasks/` — SESSION-* 보고서 4개 → archive/ 이전 권장

---

## 8. SDD 흐름 — 다음 단계

1. **본 문서**(현황) → **사양** (`docs/specs/feature-spec.md`, `docs/specs/screen-catalog.md`, `docs/specs/domain-model.md`) → **테스트** (`docs/qa/feature-verification.md` + `docs/qa/ui-ux-verification.md`) → **인프라 검증** (`docs/architecture/infra-verification.md`)
2. 갭은 `docs/tasks/backlog.md` 에 acceptance criteria 형식으로 등록
3. 갭 해결 시 본 문서 표 업데이트 — 코드/문서 동시 PR (Tech Debt Never Defer 원칙)

---

## 부록 A: 본 문서 산출 근거

| 데이터 | 출처 |
|---|---|
| BE 앱 인벤토리 | `services/api/apps/*/` (models.py, urls.py, tests/) |
| Web 라우트 | `apps/web/src/app/App.tsx` |
| Feature/Entity 레이어 | `apps/web/src/{features,entities,processes,widgets,shared/ui}/` |
| Desktop | `apps/desktop/src/main/`, `electron-builder.yml`, `package.json` |
| Mobile | `apps/mobile/lib/`, `apps/mobile/android/app/src/main/kotlin/`, `apps/mobile/ios/Runner/`, `apps/mobile/pubspec.yaml` |
| Infra | `infra/terraform/modules/`, `infra/terraform/envs/` |
| CI | `.github/workflows/{ci,dep-audit,release}.yml` |
| 메모리(개정 전) | `~/.claude/projects/.../memory/project_status.md` (2026-05-07 기준), `feedback_live_testing_session.md` |
