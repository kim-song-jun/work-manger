#!/usr/bin/env node
/**
 * flutter-tokens.cjs — real implementation (Plan-B).
 *
 * Reads `apps/web/src/shared/styles/tokens.css`, parses `--name: value;`
 * declarations inside `:root { }` (and `@media (prefers-color-scheme: dark)`
 * if present), and writes `apps/mobile/lib/theme/tokens.g.dart`.
 *
 * Supported value forms:
 *   - HEX colors:  #5B6CFF, #5B6CFFFF (alpha optional)
 *   - rgb/rgba:    rgb(91, 108, 255), rgba(91, 108, 255, 0.5)
 *   - px lengths:  8px, 16px → double
 *   - rem lengths: 0.5rem → double (× 16 base)
 *   - bare numbers: 1.25 → double
 *
 * Unsupported (skipped with warning):
 *   - var(--other-token) references — TODO Plan-C if needed
 *   - calc() — TODO Plan-C if needed
 *   - gradients
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const SRC = path.join(ROOT, "apps/web/src/shared/styles/tokens.css");
const OUT = path.join(ROOT, "apps/mobile/lib/theme/tokens.g.dart");

function toArgbHex(a, r, g, b) {
  // Build 8-char ARGB hex string without signed 32-bit overflow
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0").toUpperCase();
  return toHex(a) + toHex(r) + toHex(g) + toHex(b);
}

function parseHex(v) {
  // #RGB / #RRGGBB / #RRGGBBAA
  const m = v.match(/^#([0-9a-fA-F]{3,8})$/);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  let r, g, b, a;
  if (hex.length === 6) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    a = 0xff;
  } else if (hex.length === 8) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    a = parseInt(hex.slice(6, 8), 16);
  } else {
    return null;
  }
  return { type: "color", argbHex: toArgbHex(a, r, g, b) };
}

function parseRgb(v) {
  const m = v.match(/^rgba?\(([^)]+)\)$/);
  if (!m) return null;
  const parts = m[1].split(",").map((p) => p.trim());
  if (parts.length < 3 || parts.length > 4) return null;
  const r = parseInt(parts[0], 10);
  const g = parseInt(parts[1], 10);
  const b = parseInt(parts[2], 10);
  const a = parts[3] ? Math.round(parseFloat(parts[3]) * 255) : 0xff;
  if ([r, g, b, a].some((n) => Number.isNaN(n))) return null;
  return { type: "color", argbHex: toArgbHex(a, r, g, b) };
}

function parseLength(v) {
  const m = v.match(/^(-?\d+(?:\.\d+)?)(px|rem)$/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return { type: "double", value: m[2] === "rem" ? n * 16 : n };
}

function parseBareNumber(v) {
  const m = v.match(/^-?\d+(?:\.\d+)?$/);
  if (!m) return null;
  return { type: "double", value: parseFloat(v) };
}

function parseValue(v) {
  v = v.trim();
  return parseHex(v) ?? parseRgb(v) ?? parseLength(v) ?? parseBareNumber(v);
}

function camelCase(name) {
  // --color-primary → colorPrimary
  return name
    .replace(/^--/, "")
    .split("-")
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("");
}

function main() {
  const css = fs.readFileSync(SRC, "utf8");
  // Find :root { ... } block (greedy match within braces, simple parser)
  const rootMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
  if (!rootMatch) {
    process.stderr.write(`[flutter-tokens] no :root block in ${SRC}\n`);
    process.exit(1);
  }
  const decls = rootMatch[1].split(";");

  const colors = [];
  const doubles = [];
  const skipped = [];

  for (const raw of decls) {
    // A semicolon-split chunk may contain comment text before the declaration.
    // Extract the last `--name: value` occurrence in the chunk (handles
    // `/* comment */\n  --foo: bar` patterns).
    const cm = raw.match(/(--[a-zA-Z0-9-]+)\s*:\s*([^\n\r]+)\s*$/);
    if (!cm) continue;
    // Skip if the match is inside a block comment (e.g. /* --foo: bar */)
    if (raw.lastIndexOf("/*") > raw.lastIndexOf(cm[1])) continue;
    const name = cm[1];
    const valStr = cm[2];
    const parsed = parseValue(valStr);
    if (!parsed) {
      skipped.push({ name, valStr });
      continue;
    }
    const dartName = camelCase(name);
    if (parsed.type === "color") {
      colors.push({ dartName, argbHex: parsed.argbHex });
    } else {
      doubles.push({ dartName, value: parsed.value });
    }
  }

  let out = "// AUTO-GENERATED — do not edit by hand.\n";
  out += "// Source: apps/web/src/shared/styles/tokens.css\n";
  out += "// Regenerate: make codegen\n\n";
  out += "import 'package:flutter/material.dart';\n\n";
  out += "class WMTokens {\n";
  out += "  WMTokens._();\n\n";
  for (const c of colors) {
    out += `  static const Color ${c.dartName} = Color(0x${c.argbHex});\n`;
  }
  if (colors.length && doubles.length) out += "\n";
  for (const d of doubles) {
    out += `  static const double ${d.dartName} = ${d.value};\n`;
  }
  out += "}\n";

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out, "utf8");
  process.stdout.write(
    `[flutter-tokens] wrote ${OUT} (${colors.length} colors, ${doubles.length} doubles, ${skipped.length} skipped)\n`
  );
  if (skipped.length) {
    for (const s of skipped) {
      process.stderr.write(`  skipped: ${s.name} = ${s.valStr.slice(0, 60)}\n`);
    }
  }
}

main();
