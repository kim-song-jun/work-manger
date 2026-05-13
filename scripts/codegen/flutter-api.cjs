#!/usr/bin/env node
/**
 * flutter-api.cjs — wraps openapi-generator JAR (Java) against the live
 * drf-spectacular schema.
 *
 * Plan-E rationale: `npx @openapitools/openapi-generator-cli` crashes on
 * Windows (NestJS bundler runtime issue). Java JAR is cross-platform and
 * deterministic. JAR is auto-downloaded on first run (~30MB) and cached
 * under `scripts/codegen/_lib/`.
 *
 * Requires: java 17+ on PATH, API service reachable at VITE_API_URL.
 *
 * Output: apps/mobile/lib/api/openapi/  (dart-dio layout)
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "apps/mobile/lib/api/openapi");
const JAR_DIR = path.join(__dirname, "_lib");

// Resolve java binary: prefer JAVA_HOME/bin/java, then PATH fallback
const JAVA_BIN = (() => {
  const jh = process.env.JAVA_HOME;
  if (jh) {
    const candidate = path.join(jh, "bin", process.platform === "win32" ? "java.exe" : "java");
    if (fs.existsSync(candidate)) return candidate;
  }
  return "java";
})();
const JAR_VERSION = "7.10.0"; // pin — bump deliberately
const JAR_PATH = path.join(JAR_DIR, `openapi-generator-cli-${JAR_VERSION}.jar`);
const JAR_URL = `https://repo1.maven.org/maven2/org/openapitools/openapi-generator-cli/${JAR_VERSION}/openapi-generator-cli-${JAR_VERSION}.jar`;
const BASE = (process.env.VITE_API_URL ?? "http://localhost:4455").replace(/\/$/, "");
const SCHEMA_URL = `${BASE}/v1/schema/?format=json`;

function downloadJar() {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(JAR_DIR, { recursive: true });
    process.stdout.write(`[flutter-api] downloading JAR ${JAR_URL}\n`);
    const file = fs.createWriteStream(JAR_PATH);
    https.get(JAR_URL, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // follow redirect once
        https.get(res.headers.location, (r2) => r2.pipe(file).on("finish", () => file.close(resolve)));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`JAR fetch HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file).on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib.get(url, { headers: { Accept: "application/json" } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Schema HTTP ${res.statusCode} (${url})`));
        return;
      }
      let buf = "";
      res.setEncoding("utf8");
      res.on("data", (c) => (buf += c));
      res.on("end", () => resolve(JSON.parse(buf)));
    }).on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(JAR_PATH)) {
    await downloadJar();
  }
  process.stdout.write(`[flutter-api] using JAR ${path.basename(JAR_PATH)}\n`);

  const schema = await fetchJson(SCHEMA_URL);
  const cacheDir = path.join(ROOT, ".cache");
  fs.mkdirSync(cacheDir, { recursive: true });
  const schemaFile = path.join(cacheDir, "openapi-schema.json");
  fs.writeFileSync(schemaFile, JSON.stringify(schema), "utf8");

  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const args = [
    "-jar", JAR_PATH,
    "generate",
    "-i", schemaFile,
    "-g", "dart-dio",
    "-o", OUT_DIR,
    "--additional-properties=pubName=wm_api,nullableFields=true,useEnumExtension=true",
    "--skip-validate-spec",
  ];
  process.stdout.write(`[flutter-api] java binary: ${JAVA_BIN}\n`);
  const r = spawnSync(JAVA_BIN, args, { stdio: "pipe", env: process.env });
  if (r.stdout) process.stdout.write(r.stdout.toString());
  if (r.stderr) process.stderr.write(r.stderr.toString());
  if (r.status !== 0) {
    process.stderr.write(`[flutter-api] java -jar failed (status ${r.status})\n`);
    process.exit(r.status ?? 1);
  }

  // Clean up generator-emitted noise (pubspec.yaml, README, etc.)
  for (const f of [".openapi-generator", ".openapi-generator-ignore", "pubspec.yaml", "README.md", ".gitignore", "analysis_options.yaml"]) {
    const p = path.join(OUT_DIR, f);
    fs.rmSync(p, { recursive: true, force: true });
  }
  const dartCount = fs.existsSync(OUT_DIR)
    ? walkDart(OUT_DIR).length
    : 0;
  process.stdout.write(`[flutter-api] wrote ${OUT_DIR} (${dartCount} .dart files)\n`);
}

function walkDart(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkDart(p));
    else if (ent.name.endsWith(".dart")) out.push(p);
  }
  return out;
}

main().catch((e) => {
  process.stderr.write(`[flutter-api] ${e.message}\n`);
  process.exit(1);
});
