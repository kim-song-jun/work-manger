#!/usr/bin/env bash
# SIGSTOP Celery worker for 30s — async dispatch (notif/report) only impacted.
set -euo pipefail

DURATION="${DURATION:-30}"
CONTAINER="${CONTAINER:-wm-worker}"

echo "[chaos:celery_pause] started $(date -Iseconds) — SIGSTOP '$CONTAINER' for ${DURATION}s"

# Celery worker 의 master pid 추출
worker_pid=$(docker exec "$CONTAINER" sh -c 'cat /proc/1/cmdline | tr -d "\0"; echo')
echo "[chaos:celery_pause] worker root pid 1 cmd: $worker_pid"

cleanup() {
  echo "[chaos:celery_pause] $(date -Iseconds) SIGCONT $CONTAINER"
  docker kill --signal=SIGCONT "$CONTAINER" 2>/dev/null || true
}
trap cleanup EXIT

docker kill --signal=SIGSTOP "$CONTAINER"
echo "[chaos:celery_pause] STOPPED — outbox 에 작업 누적 시작"

sleep "$DURATION"

# cleanup() 자동 SIGCONT
sleep 5

# outbox drain 검증 (선택 — 별도 메트릭 도구 필요)
echo "[chaos:celery_pause] resumed — outbox drain 확인 권장 (ex: SELECT count(*) FROM notification_outbox WHERE delivered_at IS NULL)"
echo "[chaos:celery_pause] done $(date -Iseconds)"
