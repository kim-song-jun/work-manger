#!/usr/bin/env bash
# Stop Redis container for 60s — verify API stays available + Celery backs off.
set -euo pipefail

DURATION="${DURATION:-60}"
SERVICE="${SERVICE:-redis}"

echo "[chaos:redis_down] started $(date -Iseconds) — stopping '$SERVICE' for ${DURATION}s"

cleanup() {
  echo "[chaos:redis_down] $(date -Iseconds) starting '$SERVICE'"
  docker compose start "$SERVICE" 2>/dev/null || true
}
trap cleanup EXIT

docker compose stop "$SERVICE"
echo "[chaos:redis_down] redis stopped — Celery 큐/세션 캐시 영향 모니터"

# API 헬스는 redis 영향 없어야 (DB 만 의존). Celery 큐 backlog 만 누적.
for i in $(seq 1 "$DURATION"); do
  status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4455/v1/health || echo 000)
  if [[ "$status" != "200" ]]; then
    echo "[chaos:redis_down] WARN: API health 가 redis 다운 중 ${status} 반환 (200 기대)"
  fi
  sleep 1
done

echo "[chaos:redis_down] cleanup → 30초 동안 Celery worker drain 관찰"
sleep 30
echo "[chaos:redis_down] done $(date -Iseconds)"
