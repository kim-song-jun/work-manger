#!/usr/bin/env node
/**
 * gen-api-types.mjs
 *
 * Reads the live drf-spectacular schema (`/v1/schema/`) from the API service
 * and writes a TypeScript bindings file at `src/shared/api/openapi-types.ts`.
 *
 * Pipeline (see docs/architecture/architecture.md §4.3):
 *   drf-spectacular -> JSON OpenAPI 3.x -> openapi-typescript -> .ts
 *
 * Usage:
 *   node scripts/gen-api-types.mjs              # write to default path
 *   node scripts/gen-api-types.mjs --out=tmp.ts # write to custom path (drift check)
 *
 * Env:
 *   VITE_API_URL  Schema source origin (default: http://api:4455)
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const outArg = args.find((a) => a.startsWith("--out="));
const outPath = outArg
  ? resolve(process.cwd(), outArg.slice("--out=".length))
  : resolve(__dirname, "..", "src", "shared", "api", "openapi-types.ts");

const base = process.env.VITE_API_URL ?? "http://api:4455";
const schemaUrl = `${base.replace(/\/$/, "")}/v1/schema/?format=json`;

async function main() {
  const res = await fetch(schemaUrl, {
    headers: { Accept: "application/json, application/vnd.oai.openapi+json" },
  });
  if (!res.ok) {
    throw new Error(`Schema fetch failed: ${res.status} ${res.statusText} (${schemaUrl})`);
  }
  const schema = await res.json();
  const ast = await openapiTS(schema, {
    additionalProperties: false,
    alphabetize: true,
  });
  const body = astToString(ast);
  const header = [
    "// AUTO-GENERATED — do not edit by hand. Source: docs/api/api-spec.md + drf-spectacular",
    `// Generated from ${schemaUrl}`,
    "// Run `npm run types:gen` to refresh.",
    "",
  ].join("\n");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, header + body, "utf8");
  // Bytes for visibility in CI logs.
  const bytes = Buffer.byteLength(header + body, "utf8");
  process.stdout.write(`wrote ${outPath} (${bytes} bytes)\n`);
}

main().catch((err) => {
  process.stderr.write(`gen-api-types: ${err?.message ?? err}\n`);
  process.exit(1);
});
