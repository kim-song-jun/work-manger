#!/usr/bin/env bash
# codegen-check.sh — run all three codegen scripts and fail if git tree drifted.
# Used by `make codegen-check` and CI. Plan-A skeletons are no-ops so this
# always passes; Plan-B onwards this is a real drift gate.
#
# Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §8.4
set -euo pipefail

cd "$(dirname "$0")/.."

node scripts/codegen/flutter-tokens.cjs
node scripts/codegen/flutter-api.cjs
node scripts/codegen/flutter-i18n.cjs

if ! git diff --quiet --exit-code -- apps/mobile/lib; then
  echo "::error::codegen drift detected in apps/mobile/lib — re-run \`make codegen\` and commit." >&2
  git --no-pager diff --stat -- apps/mobile/lib >&2
  exit 1
fi

echo "[codegen-check] no drift."
