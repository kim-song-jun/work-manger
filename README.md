# 근무 관리 시스템 (Work Manager)

토스 디자인 시스템 기반의 모바일 우선 근무 관리 플랫폼.

> **상태**: 기획 단계 (Phase 0 — 문서화)
> **목표**: MVP 이상의 완성도를 갖춘 운영 가능한 서비스

---

## 핵심 기능

| 영역 | 설명 |
|---|---|
| 출퇴근 체크 | 위치 기반 자동 감지 + 사용자 확인 (본사 / 재택) |
| 연차 자동화 | 입사일 / 근속연수 기반 자동 발생 · 소멸 전 자동 안내 |
| 초과근무 승인 | 정규 근무시간 외 자동 승인 요청을 상급자에게 전송 |
| 팀 상태 가시성 | 전 직원의 실시간 근무 상태(본사 / 재택 / 휴게 / 연차 / 퇴근) |
| 다국어 | 한글 / 영문 동등 지원 (i18n) |
| 관리자 | 승인 대기 통합, 직원 관리, 월간 / 주간 근태 리포트 |

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| Frontend (Web) | React 18 + TypeScript + Vite | Toss Pretendard, CSS Variables 토큰 |
| Backend | Django 5 + Django REST Framework | PostgreSQL, Celery, Redis |
| Mobile App | Flutter (WebView) | 단일 React 코드베이스를 호스팅 |
| Desktop App | Electron | 메뉴바 / 트레이 알림, 자동 출퇴근 트리거 |
| Infra | Docker + Nginx + AWS (RDS · ElastiCache · S3) | CI/CD GitHub Actions |
| 인증 | JWT (Access / Refresh) + OAuth2 (Google · Kakao) | |

자세한 구조: [`docs/architecture/architecture.md`](docs/architecture/architecture.md)

---

## 저장소 구조

```
work-manager/
├── README.md                  # 본 문서
├── docs/                      # 기획 문서 (Spec / API / Architecture / Ops)
│   ├── README.md
│   ├── specs/                 # 기능 명세서
│   ├── api/                   # API 명세서
│   ├── architecture/          # 아키텍처 설계도
│   ├── operations/            # 운영 유의사항 / 런북
│   └── design/                # 디자인 시스템 요약
├── _design/                   # 원본 디자인 핸드오프 (claude.ai/design)
├── apps/
│   ├── web/                   # React (Vite) — 모바일 / 웹 / 관리자 통합 SPA
│   ├── mobile/                # Flutter WebView 셸
│   └── desktop/               # Electron 셸
├── services/
│   └── api/                   # Django + DRF
└── infra/                     # Docker, Terraform, Nginx, GitHub Actions
```

---

## 개발 셋업 (Development Setup)

### 사전 요구사항 (Prerequisites)

| 도구 | 버전 | 비고 |
|---|---|---|
| Docker Desktop | 최신 | Engine + Compose v2 |
| Node.js | **24.x** | 선택: editor tooling only. 검증/개발 실행은 Docker |
| Python | **3.12** | 선택: editor tooling only. 검증/개발 실행은 Docker |
| `pre-commit` | 3.x+ | `pip install pre-commit` |
| Terraform | **1.9.x** | infra/terraform (선택, 인프라 작업 시) |
| Flutter SDK | 3.24+ | 선택: editor tooling only. 검증/개발 실행은 Docker |
| Apple Developer cert | — | macOS Electron 코드사이닝 (선택) |

### 한 줄 셋업 (One-liner)

```bash
pre-commit install && cp .env.example .env && docker compose up -d --build
```

### 자주 쓰는 명령 (Make targets)

| 명령 | 설명 |
|---|---|
| `make up` / `make down` | 전체 스택 기동 / 종료 |
| `make migrate` | Django 마이그레이션 실행 |
| `make test` | Docker 기반 전체 회귀 (= `make test-all`) |
| `make test-be` | API pytest one-shot Docker container |
| `make test-fe` | Web typecheck + vitest + production build one-shot Docker container |
| `make test-desktop` | Electron desktop typecheck + vitest one-shot Docker container |
| `make test-mobile` | Flutter mobile `flutter test` one-shot Docker container |
| `make test-e2e` | Real-stack Playwright: api/ws/web/db/redis/ntfy + seed |
| `make test-all` | BE + web + desktop + mobile + e2e 전체 회귀 |
| `make package-desktop` | Docker build of local desktop test artifact (`apps/desktop/release/linux-unpacked`) |
| `make package-mobile` | Docker build of local mobile debug APK (`apps/mobile/build/app/outputs/flutter-apk/app-debug.apk`) |
| `make precommit` | 모든 파일에 pre-commit 훅 실행 |
| `make audit` | pip-audit + npm audit 로컬 실행 |

### 모니터링 (Sentry, 선택)

`.env` (또는 컨테이너 env) 에 다음을 설정하면 활성:

```
# Backend (services/api)
SENTRY_DSN=https://<key>@sentry.io/<project>
SENTRY_TRACES_SAMPLE_RATE=0.1
DJANGO_ENV=dev|stg|prod

# Frontend (apps/web — Vite build-time)
VITE_SENTRY_DSN=https://<key>@sentry.io/<project>
```

DSN 미설정 시 SDK init 은 자동 skip → 로컬 / CI 무영향.

---

## 빠른 시작

```bash
# Docker-only dev stack
make up
docker compose --profile seed run --rm seed

# Docker-only verification
make test
```

---

## 문서

- [기능 명세서](docs/specs/feature-spec.md)
- [API 명세서](docs/api/api-spec.md)
- [아키텍처 설계도](docs/architecture/architecture.md)
- [데이터 모델](docs/architecture/data-model.md)
- [운영 유의사항](docs/operations/operations-guide.md)
- [디자인 시스템](docs/design/design-system.md)
- [관리자 매뉴얼 — 회사 가입 코드](docs/manuals/admin-company-codes.md)
- [로드맵](docs/roadmap.md)

---

## 시각 회귀 (Visual Regression)

페이지 스토리는 `apps/web/src/pages/**/*.stories.tsx` 에 있습니다.
`apps/web/.storybook/chromatic.json` 에 chromatic-ready 마커가 있습니다.

TODO: CI 에 chromatic 액션을 붙이려면 GitHub Secrets 에
`CHROMATIC_PROJECT_TOKEN` 을 등록한 뒤 다음 워크플로 스텝을 추가하세요
(현재 CI 에서는 의도적으로 비활성화되어 있습니다).

```yaml
- name: Publish to Chromatic
  uses: chromaui/action@v11
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    workingDir: apps/web
```

---

## 라이선스

Proprietary — Molcube © 2026
