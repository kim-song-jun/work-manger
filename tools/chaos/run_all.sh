#!/usr/bin/env bash
# Run all chaos scenarios sequentially with a 30-second cooldown between each.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCENARIOS=(
  "$SCRIPT_DIR/scripts/db_pause.sh"
  "$SCRIPT_DIR/scripts/redis_down.sh"
  "$SCRIPT_DIR/scripts/celery_pause.sh"
  "$SCRIPT_DIR/scripts/ntfy_down.sh"
)

echo "[chaos:run_all] started $(date -Iseconds) — ${#SCENARIOS[@]} scenarios"

for s in "${SCENARIOS[@]}"; do
  echo ""
  echo "============================================================"
  echo "[chaos:run_all] running $s"
  echo "============================================================"
  if "$s"; then
    echo "[chaos:run_all] OK $(basename "$s")"
  else
    echo "[chaos:run_all] FAIL $(basename "$s") — 다음 시나리오 진행"
  fi
  echo "[chaos:run_all] cooldown 30s"
  sleep 30
done

echo ""
echo "[chaos:run_all] done $(date -Iseconds)"
