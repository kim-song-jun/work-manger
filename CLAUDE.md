# 근무 관리 시스템 (Work Manager)

> Multi-platform 근무 관리 SaaS — 단일 React SPA 를 Web / Flutter WebView / Electron 셸로 호스팅, Django REST + Channels 백엔드, self-hosted push (Web Push VAPID + APNs HTTP/2 + ntfy — Firebase 의존성 0).

## Quick Start

```bash
# 전체 스택 기동 (db / redis / ntfy / api / ws / worker / beat / web)
make up

# Django 마이그레이션
make migrate

# 전체 회귀 (BE + web + desktop + mobile + e2e)
make test
```

기동 후: web `http://localhost:4444` / api `http://localhost:4455` / storybook `http://localhost:6006` (별도 `docker compose up storybook`).

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| Frontend (Web) | React 18 + TypeScript + Vite | Tanstack Query, RHF + Zod, Zustand, i18next (ko/en), Sentry, Storybook |
| Backend | Django 5 + DRF + Channels | PostgreSQL, Celery + Beat, Redis, daphne/uvicorn, drf-spectacular |
| Mobile | Flutter (WebView shell) | flutter_inappwebview, geolocator, workmanager, web_socket_channel (ntfy) |
| Desktop | Electron 33 | electron-builder, electron-updater (S3 publish), tray + auto clock-in |
| Infra | Docker + Nginx + AWS | Terraform 11개 모듈 (RDS/ElastiCache/S3/WAF/ACM/PD/observability) |
| 인증 | JWT (SimpleJWT) + OAuth2 (Google · Kakao) + 2FA TOTP (pyotp) | refresh + lockout |
| 푸시 | Web Push (VAPID via pywebpush) / APNs HTTP/2 (httpx) / ntfy (self-hosted) | ADR-006 |

## 포트 맵

| 포트 | 서비스 | 컨테이너 |
|---|---|---|
| 4444 | Web (Vite dev server) | wm-web |
| 4455 | API (Django + Channels via daphne) | wm-api |
| 6006 | Storybook (선택 기동) | wm-storybook |
| internal | db (Postgres 16) | wm-db |
| internal | redis | wm-redis |
| internal | ntfy (self-hosted push) | wm-ntfy |
| internal | ws (Channels worker) / worker (Celery) / beat (Celery beat) | wm-ws / wm-worker / wm-beat |

호스트 노출 포트는 4444 / 4455 / 6006 만. 그 외는 nginx 프록시 또는 내부망.

## 디렉토리 구조

```
work-manager/
├── apps/
│   ├── web/             React SPA (TS) — pages/admin-*, web-*, m-* + features/* + entities/* + processes/onboarding
│   ├── desktop/         Electron 셸 — 트레이 / 알림 / S3 자동 업데이트
│   ├── mobile/          Flutter WebView — bridge/ + geofence/ + notif/ + widget_channels
│   │   ├── android/     Glance widgets + NtfyForegroundService.kt
│   │   └── ios/         WidgetKit + AppDelegate APNs 직접
│   └── e2e/             Playwright real-stack (api+ws+web+db+redis+ntfy+seed) + scripts/{console,design}-smoke.mjs
├── services/
│   └── api/             Django 5 + DRF + Channels
│       └── apps/        admin_api · approval · attendance · audit · compliance · identity · leave · notice · notification · oauth · realtime · team · trip
├── infra/terraform/     11개 모듈 + envs/{dev,stg,prod}
├── docs/                roadmap · specs · architecture · operations · adr · qa · manuals · guidelines · design
├── _design/             디자인 핸드오프 자료
├── docker-compose.yml          개발 풀스택
├── docker-compose.prod.yml     prod-like override
└── Makefile             단일 진입점 (make up / test / package-* / audit / precommit)
```

## 개발 원칙

1. **Tech Debt — Never Defer**: 터치한 코드의 TODO/workaround 는 같은 변경에서 해결
2. **No Scope Retreat**: 양이 많아도 범위 축소 금지 — 병렬/wave 로 분할 완수
3. **Task Completion Gate**: task doc 모든 체크박스 ✅ 까지 종료 금지
4. **Design System Consistency**: 하드코딩 색상/간격 금지, design system SSOT 따름 (`docs/design/design-system.md`, `apps/web/src/shared/styles/tokens.css`)
5. **Security Always**: 시크릿 격리 (.env.example 만 commit), JWT + 2FA + lockout 필수, dependency CVE 점검 (`make audit`)
6. **Mock Data Discipline**: 스키마 변경 = 같은 PR 에서 MSW handlers / seed_demo / pytest fixture 동기화. OpenAPI 타입 drift 시 `npm run types:gen`
7. **No Ambiguous Skipping**: 추측 금지, 원본 요구조건 보존. ADR 결정 (특히 ADR-006 self-hosted push) 우회 금지
8. **BE Rebuild Rule**: BE (`services/api/`) 코드 변경 후 `docker compose build api && docker compose up -d api` 실행 필수. 신규 라우트 neighbor smoke (`curl /v1/admin/settings → 401` 등) 통과 확인 후 PR 머지.
9. **Windows CRLF 방지**: `*.sh` 파일은 항상 LF 로 저장 (`.gitattributes` 영구 설정: `*.sh text eol=lf`). Windows host 빌드 시 CRLF 로 인한 스크립트 실행 오류를 방지한다.
10. **Ambiguity → Re-enter Planning**: 빌더가 막히면 planner 에스컬레이션

## 테스트

```bash
make test-be        # Django pytest (one-shot Docker container)
make test-fe        # Web typecheck + vitest + production build
make test-desktop   # Electron typecheck + vitest
make test-mobile    # Flutter unit tests
make test-e2e       # Playwright real-stack regression (api/ws/web/db/redis/ntfy + seed)
make test-all       # 위 5개 합본
make precommit      # pre-commit run --all-files (변경 + 전체)
```

CI 는 `make test-be` / `make test-fe` / `make test-e2e` 와 동등한 잡을 GitHub Actions 에서 직접 실행 (`.github/workflows/ci.yml`).

수용 기준 (`docs/qa/e2e-ui-ux-audit.md` Acceptance Gate):
- API/web/desktop/mobile/e2e 모두 Docker 안에서 통과
- 콘솔/네트워크 smoke 0 failure
- design smoke 스크린샷 신규 생성 + 측정값 모두 통과

## CI/CD

`.github/workflows/`:

| Workflow | 트리거 | 잡 |
|---|---|---|
| `ci.yml` | push / PR (모든 브랜치) | `backend` (pytest + coverage --cov-fail-under=50) → `frontend` (typecheck + vitest + OpenAPI 타입 drift + build) → `e2e` (Playwright real-stack) → `terraform validate` (envs/* 별 init -backend=false + validate) |
| `dep-audit.yml` | 주간 cron | pip-audit (services/api) + npm audit (apps/web, apps/desktop) + flutter pub audit. HIGH/CRITICAL → security 라벨 GitHub issue 자동 생성 |
| `release.yml` | GitHub Release published (`v*.*.*`) / `workflow_dispatch` | `release-mac` (notarize via Apple notarytool) / `release-win` (signtool RFC3161) / `release-linux` (AppImage). S3 publish (`--publish=always` when `WM_UPDATE_BUCKET` set) + GitHub Release assets 업로드 |

시크릿: `.github/RELEASE_SECRETS.md` (APPLE_ID, MAC_CSC_LINK, CSC_KEY_PASSWORD, WM_UPDATE_BUCKET 등).

## Code Conventions

- **Linter / Formatter**:
  - Python: ruff (line-length 100, target py3.12, lint set: E/W/F/I/B/C4/SIM/DJ) + ruff-format
  - Type: mypy (`services/api/pyproject.toml`) — `core/` 만 strict, `apps/` 는 incremental
  - Frontend: ESLint (`--max-warnings=0`) + Prettier
  - Mobile: dart format
  - Infra: terraform fmt
- **Pre-commit hooks** (`.pre-commit-config.yaml`):
  - 위생: trailing-whitespace · end-of-file-fixer · check-merge-conflict · check-yaml · check-json
  - 언어: ruff · ruff-format · mypy · prettier · eslint-web · tsc-web · dart-format · terraform-fmt
  - 보안: gitleaks (모든 commit)
- **Convention docs**:
  - [Engineering Guidelines](docs/guidelines/engineering-guidelines.md)
  - [Testing Standards](docs/guidelines/testing-standards.md)
  - [Design System](docs/design/design-system.md)

설치: `make precommit-install` (개발자 1회). 회귀: `make precommit`.

## Security

- **Auth**: JWT (`djangorestframework-simplejwt` 5.3.1, access + refresh) + OAuth2 (Google + Kakao via `google-auth`) + 2FA TOTP (`pyotp`) + 로그인 lockout (`apps/audit/`). 비밀번호: bcrypt + argon2-cffi.
- **Push 키 관리** (ADR-006): VAPID 키 6개월 회전 (`manage.py generate_vapid_keys`), APNs `.p8` env 주입 (`APNS_KEY_PEM`), ntfy ACL deny-all + Bearer 토큰.
- **시크릿 격리**: `.env.example` 만 commit, 실제 값은 secret manager (AWS Secrets / 1Password). gitleaks pre-commit 으로 평문 시크릿 차단.
- **CVE 점검**: 주간 `dep-audit.yml` (pip-audit + npm audit web/desktop + flutter pub audit) → HIGH/CRITICAL 자동 GH 이슈. 로컬 수동: `make audit`.
- **컴플라이언스**: audit log 90일 보존 (`apps/audit/`), 데이터 export/삭제 SOP (`docs/operations/sop/sop-data-{export,deletion}-request.md`), Compliance52h 모듈 (`apps/compliance/`).
- **TLS / 헬스**: nginx + Terraform ACM 모듈, /v1/health 엔드포인트.

## 문서

### Overview
- [README](docs/README.md)
- [Roadmap](docs/roadmap.md)

### Architecture & Specs
- [Architecture](docs/architecture/architecture.md) — §10 Infra · §11 Observability · §13 Capacity
- [Data Model](docs/architecture/data-model.md)
- [Domain Model](docs/specs/domain-model.md)
- [Feature Spec](docs/specs/feature-spec.md)
- [Screen Catalog](docs/specs/screen-catalog.md)
- [Design System](docs/design/design-system.md)

### API
- [API Spec](docs/api/api-spec.md)
- [Authentication](docs/api/authentication.md)

### ADRs
- [ADR Index](docs/adr/README.md)
- [ADR-001 React SPA shell adapter](docs/adr/ADR-001-react-spa-shell-adapter.md)
- [ADR-002 Flutter WebView mobile](docs/adr/ADR-002-flutter-webview-mobile.md)
- [ADR-003 Django REST + Channels](docs/adr/ADR-003-django-rest-channels.md)
- [ADR-004 Postgres single-DB multi-tenant deferred](docs/adr/ADR-004-postgres-single-db-multitenant-deferred.md)
- [ADR-005 Design tokens (CSS vars + Tailwind)](docs/adr/ADR-005-design-tokens-css-vars-tailwind.md)
- [ADR-006 Self-hosted push (no Firebase)](docs/adr/ADR-006-self-hosted-push-no-firebase.md)

### Operations
- [Operations Guide](docs/operations/operations-guide.md) — §5.4 push provider · §11.1 v1.0 출시 체크리스트
- [Operations Index](docs/operations/index.md)
- [CI/CD](docs/operations/ci-cd.md)
- [Runbook](docs/operations/runbook.md)
- SOPs: [onboard-new-company](docs/operations/sop/sop-onboard-new-company.md) · [data-export-request](docs/operations/sop/sop-data-export-request.md) · [data-deletion-request](docs/operations/sop/sop-data-deletion-request.md) · [emergency-password-reset](docs/operations/sop/sop-emergency-password-reset.md) · [email-reputation-recovery](docs/operations/sop/sop-email-reputation-recovery.md) · [app-store-emergency-update](docs/operations/sop/sop-app-store-emergency-update.md)

### Operations (continued)
- [Local 3-Platform Guide](docs/operations/local-3platform.md) — Web/Desktop/Mobile 로컬 검증 + docker-android (WSA EOL 대안)

### QA & Manuals
- [E2E + UI/UX Audit](docs/qa/e2e-ui-ux-audit.md)
- [Admin Company Codes Manual](docs/manuals/admin-company-codes.md)
- [Admin Manual](docs/manuals/admin.md)
- [Owner Manual](docs/manuals/owner.md)

### Conventions
- [Engineering Guidelines](docs/guidelines/engineering-guidelines.md)
- [Testing Standards](docs/guidelines/testing-standards.md)

<!-- agent-orchestration metadata (parsed by /agent-all) -->
<DEV_BOOT_COMMAND>: make up

---

## Agent Pipeline Index

> `/agent-init` 으로 부트스트랩됨 (size: large, qa-personas: employee, manager, admin, owner, lang-primary: typescript)

### Roles
- planner: `.claude/agents/planner.md`
- frontend-dev: `.claude/agents/frontend-dev.md` (lang: typescript)
- backend-dev: `.claude/agents/backend-dev.md` (lang: python)
- doc-writer: `.claude/agents/doc-writer.md`
- designer: `.claude/agents/designer.md`
- qa-employee: `.claude/agents/qa-employee.md`
- qa-manager: `.claude/agents/qa-manager.md`
- qa-admin: `.claude/agents/qa-admin.md`
- qa-owner: `.claude/agents/qa-owner.md`
- tester: `.claude/agents/tester.md`
- reviewer: `.claude/agents/reviewer.md`

### Workflow
- Gate sequence + reject loop + ambiguity pattern: `.claude/agents/workflow.md`

### Pipeline 실행
- `/agent-all "<작업>"` — 자유 prompt → planner 자동 task doc 생성 → wave dispatch → gate loop → PR
- `/agent-all docs/tasks/{N}-*.md` — 기존 task doc 재실행

### Project-local override
- `.claude/commands/agent-all.md` — 글로벌 skill 위에 프로젝트별 hook (e.g. `make verify`, `make seed`)

### Ledger
- `docs/tasks/index.md` — task doc 인덱스
- `docs/tasks/{N}-{slug}.md` — task 별 체크박스 + ambiguity log
- `docs/tasks/{N}-findings.md` — gate reject finding append-only
- `docs/tasks/{N}-fixes.md` — dev fix append-only (finding 과 1:1)
