#!/usr/bin/env bash
set -euo pipefail

export BASE_URL="${BASE_URL:-http://localhost:4444}"

npm ci --no-audit --no-fund >/dev/null
node scripts/local-web-proxy.mjs >/tmp/wm-local-web-proxy.log 2>&1 &
proxy_pid="$!"
trap 'kill "$proxy_pid" 2>/dev/null || true' EXIT

node scripts/wait-url.mjs "$BASE_URL/login"
node scripts/console-smoke.mjs
node scripts/onboarding-console-smoke.mjs
