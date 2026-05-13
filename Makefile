.PHONY: up down logs ps build api-shell migrate makemigrations test test-be test-fe test-desktop test-mobile test-e2e test-all package-desktop package-mobile package-all fe-shell codegen codegen-check precommit precommit-install audit

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

build:
	docker compose build

api-shell:
	docker compose exec api bash

migrate:
	docker compose exec api python manage.py migrate

makemigrations:
	docker compose exec api python manage.py makemigrations

# 단일 진입점 — Docker 기반 전체 회귀.
test: test-all

# Backend pytest (one-shot Docker container).
test-be:
	docker compose --profile test run --rm --build api-test

# Frontend typecheck + vitest + production build (one-shot Docker container).
test-fe:
	docker compose --profile test run --rm --build web-test

# Electron desktop shell typecheck + vitest (one-shot Docker container).
test-desktop:
	docker compose --profile test run --rm desktop-test

# Flutter WebView shell unit tests (one-shot Docker container).
test-mobile:
	docker compose --profile test run --rm mobile-test

# Real-stack Playwright regression (api/ws/web/db/redis/ntfy + demo seed).
test-e2e:
	docker compose up -d --build db redis ntfy api ws web
	docker compose --profile seed run --rm seed
	docker compose --profile e2e run --rm e2e

# 전체 회귀 — BE + web + desktop + mobile + real-stack e2e.
test-all: test-be test-fe test-desktop test-mobile test-e2e

# Local installable/test app artifacts, built inside Docker.
package-desktop:
	docker compose --profile package run --rm desktop-package

package-mobile:
	docker compose --profile package run --rm mobile-package

package-all: package-desktop package-mobile

fe-shell:
	docker compose exec web sh

# B-NAT-01 (ADR-007): CSS tokens → Flutter Dart codegen.
gen-tokens:
	node apps/mobile/tools/gen_tokens.mjs

# B-NAT-02 (ADR-007): OpenAPI schema → Dart models codegen.
gen-openapi-dart:
	bash apps/mobile/tools/gen_openapi_dart.sh

# Plan-A (ADR-007): Flutter codegen entrypoint (tokens, API, i18n).
codegen:
	node scripts/codegen/flutter-tokens.cjs
	node scripts/codegen/flutter-api.cjs
	node scripts/codegen/flutter-i18n.cjs

# Plan-A (ADR-007): Codegen drift gate (CI + pre-commit).
codegen-check:
	bash scripts/codegen-check.sh

# pre-commit 훅 설치 (개발자 1회용).
precommit-install:
	pre-commit install

# 변경 파일 + 전체 트리 회귀.
precommit:
	pre-commit run --all-files

# 의존성 보안 audit (로컬 수동 실행 — CI 는 .github/workflows/dep-audit.yml).
audit:
	cd services/api && pip-audit -r requirements.txt || true
	cd apps/web && npm audit --audit-level=moderate || true
	cd apps/desktop && npm audit --audit-level=moderate || true
