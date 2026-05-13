# Home Native PoC — Plan-E: openapi-generator Windows fix Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Steps use checkbox.

**Goal:** Plan-B Task 4 의 fallback stub 교체 — Java 17 JAR (`openapi-generator-cli.jar`) 직접 호출로 Windows NestJS bundler crash 우회. dart-dio Dart client 진짜 출력 (73 files 추정). `.gitignore` 의 `apps/mobile/lib/api/openapi/` exception 해제 → tracked.

**Architecture:** `npx @openapitools/openapi-generator-cli` 는 NestJS-based bundle 이라 Windows + Node 22 조합에서 spawn crash. 대안: openapi-generator-cli JAR (~30MB, Maven Central) 을 한 번 다운로드 후 `java -jar` 직접 호출. Cross-platform, deterministic. Linux/WSL/CI 에서도 동일 코드.

**Tech Stack:** Java 17 (Temurin 17.0.13 confirmed), openapi-generator JAR 7.x, Node.js (script glue).

**iOS scope:** 여전히 본 host (Windows) 환경 빌드 불가 (B-OPS-02 Mac signing host). Plan-F (Mac 확보 후) 로 이관.

**Related:** [spec](../specs/2026-05-13-home-native-poc-design.md) / [Plan-B Task 4](2026-05-13-home-native-poc-w2-w3-codegen.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `scripts/codegen/flutter-api.cjs` | replace fallback with Java JAR call | Modify |
| `scripts/codegen/_lib/openapi-generator.jar` | JAR (gitignored, lazy-download) | New (untracked) |
| `.gitignore` | drop `apps/mobile/lib/api/openapi/` exception + add JAR cache path | Modify |
| `apps/mobile/lib/api/openapi/**` | real dart-dio output (~73 files) | New (tracked) |
| `apps/mobile/lib/api/openapi/.gitignore` | local exceptions (build artifacts) | New (optional) |
| `Makefile` | optional `codegen-fetch-jar` target | Modify (optional) |
| `docs/operations/runbook.md` | add R-PoC-02 note for JAR refresh | Modify (optional) |

---

## Task 1: flutter-api.cjs JAR-based codegen

**Files:**
- Modify: `scripts/codegen/flutter-api.cjs`

- [ ] **Step 1.1: Replace the script**

Replace `scripts/codegen/flutter-api.cjs` with:

```js
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
  const r = spawnSync("java", args, { stdio: "pipe", env: process.env });
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
```

- [ ] **Step 1.2: Update .gitignore for JAR cache**

In `.gitignore`, add (next to other codegen artifacts):

```
# openapi-generator JAR (lazy-downloaded by scripts/codegen/flutter-api.cjs)
scripts/codegen/_lib/
```

- [ ] **Step 1.3: Drop the openapi/ exception**

In `.gitignore`, REMOVE the line `apps/mobile/lib/api/openapi/` (Plan-D cleanup commit added it as a transient — Plan-E makes it tracked). Keep the explanatory comment as-is OR delete the whole block; cleanest is to delete the block.

- [ ] **Step 1.4: Run**

```bash
docker compose up -d api  # if not already running
timeout 60 bash -c 'until curl -sf http://localhost:4455/v1/health; do sleep 2; done'
node scripts/codegen/flutter-api.cjs
```

Expected on first run: download JAR (~30MB, 5-30s depending on net), then `[flutter-api] wrote /.../apps/mobile/lib/api/openapi (N .dart files)` where N is ~30-80 (depends on schema operations + models).

If `java` errors with `Unable to access jarfile`, the download failed — check JAR_PATH exists and is non-zero bytes. Re-run.

If openapi-generator JAR errors (e.g. enum extension complaint), drop `useEnumExtension=true` from `--additional-properties` and re-run.

- [ ] **Step 1.5: flutter analyze sanity**

```bash
cd apps/mobile
flutter pub get  # in case dart-dio output adds files that need resolution
flutter analyze lib/api/dio_client.dart lib/api/jwt_store.dart 2>&1 | tail -5
cd ../..
```

The generated `openapi/` tree may have its own lints (analysis_options omitted), but `dio_client.dart` + `jwt_store.dart` (our hand-written files) should still be `No issues found!`.

- [ ] **Step 1.6: Commit**

```bash
git add scripts/codegen/flutter-api.cjs .gitignore apps/mobile/lib/api/openapi
git commit -m "feat(codegen): replace npx openapi-generator with Java JAR (Plan-E Windows fix)"
```

(If the openapi/ tree has many files, the commit will be large — that's expected. Generated tracked output mirrors apps/web's openapi-types.ts pattern.)

---

## Task 2: codegen-check drift gate verification

**Files:** none (verification)

- [ ] **Step 2.1: Re-run make codegen**

```bash
make codegen
```

Expected:
- `[flutter-tokens] wrote ... (29 colors, 15 doubles, 30 skipped)`
- `[flutter-api] using JAR openapi-generator-cli-7.10.0.jar`
- `[flutter-api] wrote ... (N .dart files)`
- `[flutter-i18n] wrote ... app_ko.arb (705 keys)` + `app_en.arb`

- [ ] **Step 2.2: codegen-check pass**

```bash
make codegen-check
```

Expected: `[codegen-check] no drift.` (re-run produces identical bytes → 0 git diff).

If non-zero diff appears in `apps/mobile/lib/api/openapi/`, the generator output is non-deterministic. Investigate — common causes:
- Schema dict ordering differs (Python schema endpoint nondeterminism) → drf-spectacular bug
- Generator timestamps in headers → openapi-generator should not include those for dart-dio, but check
- Build counter in pubspec.yaml → already cleaned in Task 1.1

If non-determinism is real, document as Plan-F concern and commit the latest output as canonical baseline; the gate is informational until determinism is fixed.

- [ ] **Step 2.3: Drift simulation**

```bash
echo "  --test-drift-key: #DEADBEEF;" >> apps/web/src/shared/styles/tokens.css
make codegen-check
```

Expected: exit 1 with error message. Then revert:

```bash
git checkout apps/web/src/shared/styles/tokens.css
make codegen-check
```

Should pass again.

- [ ] **Step 2.4: No commit** — verification only.

---

## Task 3: Backlog + spec stamp Plan-E

**Files:**
- Modify: `docs/tasks/backlog.md`
- Modify: `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`

- [ ] **Step 3.1: Append Plan-E note to backlog**

In `docs/tasks/backlog.md`, find the `### B-NAT-04` block (Plan-D stamp from W6-8). After it, replace the `B-NAT-05 (Plan-E)` follow-up line with a completion stamp:

```markdown
### B-NAT-05 · Plan-E openapi-generator Windows fix ✅ 완료 (2026-05-14, Plan-E)

Plan-B Task 4 의 fallback stub 교체 — Java 17 JAR 직접 호출. dart-dio
generated client 본 출력 (lib/api/openapi/ tracked).

iOS 차단 (B-OPS-02 Mac signing) 은 여전히 본 host 불가 — Plan-F (Mac
host 확보 후) 로 이관.

후속:
- B-NAT-06 / B-NAT-07 — ADR-007 Phase A~D (별도 plan)
- Plan-F (Mac host): iOS 빌드 + TestFlight + 베타 5인 enrollment
```

- [ ] **Step 3.2: Stamp spec**

In `docs/superpowers/specs/2026-05-13-home-native-poc-design.md`, append to "## 변경 이력":

```markdown
| 2026-05-14 | @sungjun + Claude | Plan-E openapi-generator Windows fix 완료. npx 대신 Java JAR 직접 호출. dart-dio output 진짜 출력 (N files). iOS 는 Plan-F 로 이관. |
```

(Replace `N` with the actual file count from Task 1.4 stdout.)

- [ ] **Step 3.3: Commit**

```bash
git add docs/tasks/backlog.md docs/superpowers/specs/2026-05-13-home-native-poc-design.md
git commit -m "docs(backlog,spec): Plan-E openapi-generator JAR fix complete (B-NAT-05)"
```

---

## Self-Review

**Spec coverage:**
- ✅ Plan-B Task 4 fallback stub 교체 → Task 1
- ✅ codegen-check drift gate 검증 → Task 2
- ✅ backlog stamp + spec 이력 → Task 3

**Placeholder scan:** Task 3.2 'N files' replaced at commit time with actual count.

**Out of scope:**
- iOS host (Plan-F)
- Generated client 사용으로 manual Dio 교체 (Phase A 또는 Plan-F)
- 베타 enrollment + 14일 라이브 (operational)
- Phase A 본격 (Inbox, LeaveApply, ... — ADR-007 §일정)

**Risks:**
- JAR 다운로드 실패 (network) — first-run only; cached after
- dart-dio output 비결정성 — Task 2.2 에서 surfacing
- Generated `openapi/` tree 크기 — commit 50-200 file 크지만 web `openapi-types.ts` 패턴과 동일
