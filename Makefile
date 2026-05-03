.PHONY: up down logs ps build api-shell migrate test fe-shell

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

test:
	docker compose exec api pytest -q

fe-shell:
	docker compose exec web sh
