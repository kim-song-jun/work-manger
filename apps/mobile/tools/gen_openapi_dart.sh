#!/usr/bin/env bash
# gen_openapi_dart.sh — B-NAT-02 (ADR-007)
#
# Generate Dart models + API client from the running Django /v1/schema/
# endpoint. Uses openapi-generator-cli (Docker image, no local install).
#
# Output: apps/mobile/lib/api/generated/  (Dart files)
#
# Usage:
#   make gen-openapi-dart
#   # or directly: bash apps/mobile/tools/gen_openapi_dart.sh
#
# Pre-conditions:
#   - docker compose up -d api (Django listening on :4455)
#   - or override SCHEMA_URL env to point elsewhere
set -euo pipefail

SCHEMA_URL="${SCHEMA_URL:-http://localhost:4455/v1/schema/?format=openapi-json}"
OUT_DIR="$(dirname "$0")/../lib/api/generated"
SCHEMA_FILE="$(dirname "$0")/.schema-cache.json"

echo "[gen-openapi-dart] Fetching $SCHEMA_URL ..."
curl -fsSL "$SCHEMA_URL" -o "$SCHEMA_FILE"

mkdir -p "$OUT_DIR"

echo "[gen-openapi-dart] Generating Dart models via openapi-generator-cli ..."
docker run --rm \
  -v "$(realpath "$(dirname "$0")/.."):/local" \
  openapitools/openapi-generator-cli:v7.10.0 generate \
    -i "/local/tools/.schema-cache.json" \
    -g dart-dio \
    -o "/local/lib/api/generated" \
    --additional-properties=pubName=wm_api,pubAuthor=Molcube,pubVersion=0.1.0,nullableFields=true,enumUnknownDefaultCase=true \
    --skip-validate-spec

echo "[gen-openapi-dart] ✓ written to $OUT_DIR"
echo "[gen-openapi-dart] Next:"
echo "  1. apps/mobile/lib/api/generated 를 .gitignore 에 추가 (생성물)"
echo "  2. apps/mobile/pubspec.yaml 에 dio: ^5.5.0 dependency 추가 검토"
echo "  3. Phase A 페이지에서 'package:wm_api/...' 로 모델 import"
