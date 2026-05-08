#!/usr/bin/env bash
# Stop ntfy container for 60s — Web Push / APNs fallback 만으로 알림 회복 확인.
set -euo pipefail

DURATION="${DURATION:-60}"
SERVICE="${SERVICE:-ntfy}"

echo "[chaos:ntfy_down] started $(date -Iseconds) — stopping '$SERVICE' for ${DURATION}s"

cleanup() {
  echo "[chaos:ntfy_down] $(date -Iseconds) starting '$SERVICE'"
  docker compose start "$SERVICE" 2>/dev/null || true
}
trap cleanup EXIT

docker compose stop "$SERVICE"
echo "[chaos:ntfy_down] ntfy stopped — push provider fallback 모니터 (ADR-006)"

# API health 영향 없어야 — ntfy 는 알림 보조 채널
for _ in $(seq 1 "$DURATION"); do
  status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4455/v1/health || echo 000)
  if [[ "$status" != "200" ]]; then
    echo "[chaos:ntfy_down] WARN: API health = ${status} (ntfy 의존성 누설 의심)"
  fi
  sleep 1
done

echo "[chaos:ntfy_down] done $(date -Iseconds)"
