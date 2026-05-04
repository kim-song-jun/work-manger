# CI / CD 운영 가이드

이 문서는 work-manager 모노리포의 로컬 검증 + GitHub Actions 파이프라인을
요약한다. (운영 가이드 §11 출시 체크리스트와 함께 읽을 것.)

---

## 1. 로컬 개발 / 검증

### 1.1 도커 스택 기동

```bash
# 1. 백엔드 + DB + Redis + Celery + ws + 프런트 + nginx
docker compose up -d

# 2. 헬스 확인
curl -fsS http://localhost:4455/v1/health   # api
curl -fsS http://localhost:4444/__health    # web
```

서비스 포트:
- `web`     → http://localhost:4444
- `api`     → http://localhost:4455
- `ws`      → 내부 only (web 의 nginx 가 `/v1/ws/` 를 daphne 로 프록시)
- `db`      → 내부 only (Postgres 16)
- `redis`   → 내부 only (Redis 7)

### 1.2 데모 데이터 시드

```bash
docker compose run --rm seed
```

- `seed` 서비스는 `profiles: ["seed"]` 라 평소엔 기동되지 않는다.
- 멱등(re-run safe) — 기존 데모 회사 (`ACMEDM`) 를 wipe → 재생성.
- 생성 계정 (모두 비밀번호 `DemoPass!1`):
  - `owner@acme.demo`     OWNER
  - `admin@acme.demo`     ADMIN
  - `manager1@acme.demo`  MANAGER (직속 부하 보유)
  - `manager2@acme.demo`  MANAGER
  - `<random>@acme.demo`  EMPLOYEE × 25

### 1.3 단위 / 통합 테스트

```bash
# Backend
docker compose exec api pytest --ds=work_manager.settings.test \
  --cov=apps --cov=core --cov-report=term-missing --cov-fail-under=50

# Frontend
docker compose exec web npm run test -- --coverage
```

### 1.4 E2E (Playwright)

두 가지 실행 방식 — 둘 다 동일한 spec 셋 (`apps/e2e/specs/*.spec.ts`) 을 돌린다.

**A. 호스트에서 직접 (디버깅 편의):**

```bash
cd apps/e2e
npm install --no-audit --no-fund
npx playwright install chromium      # 최초 1회
npm test                              # 전체
npm run test:headed                   # GUI 로 관찰
npm run test:ui                       # Playwright UI 모드
npx playwright test specs/auth.spec.ts --project=chromium   # 단일 spec
```

전제: `docker compose up -d` 가 떠 있고 `docker compose run --rm seed` 완료.
환경변수:
- `BASE_URL` (기본 `http://localhost:4444`)
- `API_URL`  (기본 `http://localhost:4455`)

**B. 컨테이너 안에서 (CI 와 동일 환경):**

```bash
docker compose --profile e2e run --rm e2e
```

- `mcr.microsoft.com/playwright:v1.49.1-jammy` 이미지 사용
- `BASE_URL=http://web:4444`, `API_URL=http://api:4455`, `E2E_SKIP_SEED=1`
- `apps/e2e` 가 `/e2e` 로 마운트, 실행 시 `npm ci` 후 `npx playwright test`

### 1.5 결과 보고서

- HTML: `apps/e2e/playwright-report/index.html` (`npx playwright show-report` 로 열기)
- 실패 트레이스: `apps/e2e/test-results/`
- 실패 영상: 동일 디렉터리 (config: `video: retain-on-failure`)

---

## 2. GitHub Actions 파이프라인

파일: `.github/workflows/ci.yml`

### 2.1 트리거

- `push` — 모든 브랜치
- `pull_request` — 모든 브랜치
- `concurrency` — 동일 ref 의 이전 실행은 즉시 취소

### 2.2 잡 구성

| Job        | Needs        | 핵심 단계                                                                 |
|------------|--------------|--------------------------------------------------------------------------|
| `backend`  | —            | Python 3.12 → pip cache → `pytest --cov-fail-under=50` → coverage 업로드 |
| `frontend` | —            | Node 24 → `npm ci --legacy-peer-deps` → typecheck → vitest → build       |
| `e2e`      | backend, fe  | `docker compose up -d --build` → `seed` → `--profile e2e run e2e`        |

`e2e` 잡은 실패 시 `apps/e2e/playwright-report` + `test-results` 를 14일 보관
아티팩트로 업로드하고, `api/web/ws/worker` 컨테이너 로그를 마지막 400줄 dump한다.

### 2.3 게이트

- **Backend**: pytest-cov 50% (Phase 0). Phase 1 → 75%, Phase 2 → 85%
  (testing-standards §4 참조).
- **Frontend**: vitest 임계는 `apps/web/vitest.config.ts` `coverage.thresholds` 에서 관리.
- **E2E**: 모든 spec PASS 시에만 머지 가능. 단, 일부 spec 은 FE 라우트 미구현 시
  `test.skip()` 처리 (예: `/m/leave/apply`, `/m/inbox`).

### 2.4 비밀 관리

CI 잡은 비밀이 필요 없다 (도커 스택이 dev 시크릿으로 자가완결). 운영 배포
파이프라인은 별도 워크플로 (TBD: `.github/workflows/deploy.yml`) 에서 GitHub
Environments + OIDC 로 관리한다.

---

## 3. 트러블슈팅

| 증상 | 원인 | 조치 |
|------|------|------|
| `loginViaApi failed (401) for admin@acme.demo` | seed 누락 | `docker compose run --rm seed` |
| `API at .../v1/health did not become ready` | api/db 기동 실패 | `docker compose logs api db` 후 재기동 |
| `slider has no bounding box` | FE 빌드 미반영 | `docker compose restart web` |
| Playwright 이미지 다운 느림 | 첫 실행 | 첫 회만 ~수백MB. CI 캐시 적용 검토 |
| `EACCES /e2e/node_modules` (컨테이너) | 호스트 잔여 권한 | `sudo rm -rf apps/e2e/node_modules` |
| 컨테이너 e2e 가 web 못 찾음 | network 다름 | 서비스 정의가 `networks: [wm-net]` 인지 확인 |

---

## 4. 변경 이력

| 날짜       | 변경                                           |
|------------|------------------------------------------------|
| 2026-05-04 | 초기 작성: backend + frontend + e2e 3-job 도입 |
