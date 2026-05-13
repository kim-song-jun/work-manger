#!/usr/bin/env node
/**
 * flutter-tokens.cjs
 * ------------------
 * NO-OP skeleton (Plan-A). The real implementation lives in Plan-B (W2):
 * reads `apps/web/src/shared/styles/tokens.css`, parses CSS custom
 * properties, and writes `apps/mobile/lib/theme/tokens.g.dart`.
 *
 * For now: exits 0 with a marker log so `make codegen-check` succeeds and
 * Plan-B PRs surface the change to this file as the real codegen.
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const path = require("path");

function main() {
  const root = path.resolve(__dirname, "..", "..");
  process.stdout.write(`[flutter-tokens] noop skeleton (root=${root})\n`);
  process.exit(0);
}

main();
