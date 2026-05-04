.PHONY: up down logs ps build api-shell migrate makemigrations test test-be test-fe test-all fe-shell precommit precommit-install audit

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

# 단일 진입점 — BE 우선 실행 (기존 동작 호환).
test: test-be

# Backend pytest (settings.test = sqlite in-memory fallback).
test-be:
	docker compose exec -T api pytest --ds=work_manager.settings.test -q

# Frontend vitest + typecheck.
test-fe:
	docker compose exec -T web npm run typecheck
	docker compose exec -T web npm run test

# 전체 회귀 (BE + FE) — CI 와 동등한 로컬 검증.
test-all: test-be test-fe

fe-shell:
	docker compose exec web sh

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
