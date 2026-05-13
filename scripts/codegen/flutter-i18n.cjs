#!/usr/bin/env node
/**
 * flutter-i18n.cjs — converts i18next (from TypeScript) to Flutter ARB files.
 *
 * Input:  apps/web/src/shared/i18n/index.ts (ko/en embedded as const ko/en objects)
 * Output: apps/mobile/lib/l10n/app_{ko,en}.arb (flat keys with @@locale)
 *
 * Key flattening: 'home.status_working' → 'homeStatusWorking' (camelCase, ARB requires non-dotted keys).
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "apps/web/src/shared/i18n/index.ts");
const LOCALES = [
  { locale: "ko", out: "apps/mobile/lib/l10n/app_ko.arb" },
  { locale: "en", out: "apps/mobile/lib/l10n/app_en.arb" },
];

function extractFromTypescript(tsContent) {
  // Extract both const ko = { ... } and const en: typeof ko = { ... } blocks
  const koMatch = tsContent.match(/^const ko = ({[\s\S]*?^});/m);
  const enMatch = tsContent.match(/^const en: typeof ko = ({[\s\S]*?^});/m);

  if (!koMatch || !enMatch) {
    throw new Error(`Could not find ko/en object literals in ${SRC}`);
  }

  const koObj = evalObject(koMatch[1]);
  const enObj = evalObject(enMatch[1]);

  return { ko: koObj, en: enObj };
}

function evalObject(objStr) {
  // Use Function constructor to evaluate object literal safely
  // (This is necessary because the i18n file uses JS object literals)
  try {
    // Wrap in parentheses to make it an expression, not a statement
    const fn = new Function(`return (${objStr})`);
    return fn();
  } catch (e) {
    throw new Error(`Failed to parse object literal: ${e.message}`);
  }
}

function flatten(obj, prefix = "", acc = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      flatten(v, key, acc);
    } else {
      acc[key] = String(v);
    }
  }
  return acc;
}

function dotToCamel(k) {
  // home.status_working → homeStatusWorking
  return k
    .split(".")
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("")
    .replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertPlaceholders(str) {
  // Convert i18next {{var}} syntax to ICU {var} syntax
  // But handle nested cases carefully: {{var}} → {var}
  return str.replace(/\{\{(\w+)\}\}/g, "{$1}");
}

function main() {
  if (!fs.existsSync(SRC)) {
    process.stderr.write(`[flutter-i18n] missing input ${SRC}\n`);
    process.exit(1);
  }

  const tsContent = fs.readFileSync(SRC, "utf8");
  let localeData;
  try {
    localeData = extractFromTypescript(tsContent);
  } catch (e) {
    process.stderr.write(`[flutter-i18n] ${e.message}\n`);
    process.exit(1);
  }

  for (const loc of LOCALES) {
    const dst = path.join(ROOT, loc.out);
    const json = localeData[loc.locale];

    if (!json) {
      process.stderr.write(`[flutter-i18n] missing locale ${loc.locale}\n`);
      continue;
    }

    const flat = flatten(json);
    const arb = { "@@locale": loc.locale };

    for (const [k, v] of Object.entries(flat)) {
      arb[dotToCamel(k)] = convertPlaceholders(v);
    }

    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, JSON.stringify(arb, null, 2) + "\n", "utf8");
    process.stdout.write(`[flutter-i18n] wrote ${dst} (${Object.keys(flat).length} keys)\n`);
  }
}

main();
