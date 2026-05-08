#!/usr/bin/env bash
# Pause RDS (postgres) for 30s and observe API recovery.
# operations-guide §11.1 + runbook §"DB 장애 복구"
set -euo pipefail

DURATION="${DURATION:-30}"
SERVICE="${SERVICE:-db}"

echo "[chaos:db_pause] started $(date -Iseconds) — pausing '$SERVICE' for ${DURATION}s"

cleanup() {
  echo "[chaos:db_pause] $(date -Iseconds) unpausing '$SERVICE'"
  docker compose unpause "$SERVICE" 2>/dev/null || true
}
trap cleanup EXIT

docker compose pause "$SERVICE"
echo "[chaos:db_pause] paused — API 의 5xx 응답률 확인 (다른 터미널: curl /v1/health)"

sleep "$DURATION"

# cleanup() 가 trap 으로 unpause 자동 호출

# 회복 검증 (최대 30초 polling)
for i in $(seq 1 30); do
  status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4455/v1/health || echo 000)
  if [[ "$status" == "200" ]]; then
    echo "[chaos:db_pause] recovered at $(date -Iseconds) after ${i}s probe"
    exit 0
  fi
  sleep 1
done

echo "[chaos:db_pause] WARN: API 가 30초 내 회복 안 됨 — runbook §DB 장애 복구 절차 확인"
exit 1
