# Home Native PoC — Plan-B: W2-W3 Codegen 본 구현 Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement. Steps use checkbox.

**Goal:** Plan-A 의 no-op skeleton 3종을 본 구현으로 교체. CSS tokens → Dart ThemeData / OpenAPI → Dart Dio client / i18next ko·en → ARB. CI drift gate 활성화.

**Architecture:** 단방향 codegen (web SSOT → mobile generated). 출력 파일은 git-tracked, drift gate가 PR 변경 감지. Plan-C (Flutter Home) 가 이 산출물을 import 한다.

**Tech Stack:** Node.js (CJS scripts), Flutter 3.24, dart-dio (Dio 5.x), openapi-generator-cli, Flutter gen-l10n (ARB), Github Actions.

**Related:** [spec](../specs/2026-05-13-home-native-poc-design.md) §5 / [Plan-A](2026-05-13-home-native-poc-w1-be-setup.md)

---

## File Structure

| File | Purpose | New/Modify |
|---|---|---|
| `scripts/codegen/flutter-tokens.cjs` | tokens.css → tokens.g.dart | Replace (no-op → real) |
| `apps/mobile/lib/theme/tokens.g.dart` | auto-gen color/spacing/radius | New (auto) |
| `apps/mobile/lib/theme/wm_theme.dart` | ThemeData factory | New |
| `scripts/codegen/flutter-api.cjs` | openapi-generator-cli wrapper | Replace |
| `apps/mobile/lib/api/openapi/` | Dio Dart client (auto) | New (auto, dir) |
| `apps/mobile/lib/api/dio_client.dart` | configured Dio + JWT interceptor | New |
| `apps/mobile/lib/api/jwt_store.dart` | secure JWT storage (shared_preferences PoC) | New |
| `scripts/codegen/flutter-i18n.cjs` | i18next json → ARB | Replace |
| `apps/mobile/lib/l10n/app_ko.arb` | i18n ko (auto) | New (auto) |
| `apps/mobile/lib/l10n/app_en.arb` | i18n en (auto) | New (auto) |
| `apps/mobile/l10n.yaml` | gen-l10n config | New |
| `apps/mobile/pubspec.yaml` | add dependencies (dio, json_annotation, intl, sentry_flutter) | Modify |
| `.github/workflows/ci.yml` | codegen-check job | Modify |

---

## Task 1: flutter-tokens.cjs 본 구현 + tokens.g.dart 첫 출력

**Files:**
- Replace: `scripts/codegen/flutter-tokens.cjs`
- Create (auto via script): `apps/mobile/lib/theme/tokens.g.dart`

- [ ] **Step 1.1: Replace the script**

Replace `scripts/codegen/flutter-tokens.cjs` content with:

```js
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

function parseHex(v) {
  // #RGB / #RRGGBB / #RRGGBBAA
  const m = v.match(/^#([0-9a-fA-F]{3,8})$/);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  if (hex.length === 6) hex = "FF" + hex;
  if (hex.length === 8) hex = hex.slice(6) + hex.slice(0, 6); // unused — keep ARGB form
  // Re-build canonical ARGB:
  let r, g, b, a;
  if (m[1].length === 8) {
    r = parseInt(m[1].slice(0, 2), 16);
    g = parseInt(m[1].slice(2, 4), 16);
    b = parseInt(m[1].slice(4, 6), 16);
    a = parseInt(m[1].slice(6, 8), 16);
  } else if (m[1].length === 6) {
    r = parseInt(m[1].slice(0, 2), 16);
    g = parseInt(m[1].slice(2, 4), 16);
    b = parseInt(m[1].slice(4, 6), 16);
    a = 0xff;
  } else {
    return null;
  }
  return { type: "color", argb: (a << 24) | (r << 16) | (g << 8) | b };
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
  return { type: "color", argb: (a << 24) | (r << 16) | (g << 8) | b };
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
    const line = raw.trim();
    if (!line || line.startsWith("/*")) continue;
    const cm = line.match(/^(--[a-zA-Z0-9-]+)\s*:\s*(.+)$/);
    if (!cm) continue;
    const name = cm[1];
    const valStr = cm[2];
    const parsed = parseValue(valStr);
    if (!parsed) {
      skipped.push({ name, valStr });
      continue;
    }
    const dartName = camelCase(name);
    if (parsed.type === "color") {
      colors.push({ dartName, argb: parsed.argb });
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
    out += `  static const Color ${c.dartName} = Color(0x${c.argb.toString(16).padStart(8, "0").toUpperCase()});\n`;
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
```

- [ ] **Step 1.2: Run it to produce tokens.g.dart**

```bash
node scripts/codegen/flutter-tokens.cjs
```

Expected stdout: `[flutter-tokens] wrote /.../apps/mobile/lib/theme/tokens.g.dart (N colors, M doubles, K skipped)`. Skipped warnings on stderr for any `var(...)` / `calc(...)` references — review those manually if you need them for Plan-C.

- [ ] **Step 1.3: Visual sanity check**

```bash
head -30 apps/mobile/lib/theme/tokens.g.dart
```

Verify the file starts with the AUTO-GENERATED header, imports `flutter/material.dart`, and contains a `WMTokens` class with `static const Color colorPrimary = Color(0xFF5B6CFF);` (matching `--color-primary: #5B6CFF;` from `tokens.css`).

- [ ] **Step 1.4: Commit**

```bash
git add scripts/codegen/flutter-tokens.cjs apps/mobile/lib/theme/tokens.g.dart
git commit -m "feat(codegen): flutter-tokens.cjs real impl + tokens.g.dart first output"
```

---

## Task 2: wm_theme.dart ThemeData factory

**Files:**
- Create: `apps/mobile/lib/theme/wm_theme.dart`

- [ ] **Step 2.1: Create the factory**

Create `apps/mobile/lib/theme/wm_theme.dart`:

```dart
import 'package:flutter/material.dart';

import 'tokens.g.dart';

/// Factory for the Work Manager Flutter native theme.
///
/// Bridges the web design system (CSS custom properties in
/// apps/web/src/shared/styles/tokens.css → tokens.g.dart) into Flutter
/// Material 3 ThemeData. Plan-C consumes this in WMHomeScreen.
class WMTheme {
  WMTheme._();

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.fromSeed(
        seedColor: WMTokens.colorPrimary,
        brightness: Brightness.light,
        primary: WMTokens.colorPrimary,
      ),
      scaffoldBackgroundColor: WMTokens.colorBackground,
      textTheme: const TextTheme().apply(
        bodyColor: WMTokens.colorTextPrimary,
        displayColor: WMTokens.colorTextPrimary,
      ),
      cardTheme: CardTheme(
        color: WMTokens.colorSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(WMTokens.radiusMd),
        ),
      ),
    );
  }
}
```

**Note:** The exact field names (`colorPrimary`, `colorBackground`, `colorSurface`, `colorTextPrimary`, `radiusMd`) come from `tokens.g.dart` generated in Task 1. If any are missing (e.g. the CSS uses `--text-primary` instead of `--color-text-primary`), adjust the Dart names to match what tokens.g.dart actually exposes. Run `grep "static const" apps/mobile/lib/theme/tokens.g.dart | head -20` to inspect.

- [ ] **Step 2.2: Verify flutter analyze**

```bash
cd apps/mobile
flutter pub get
flutter analyze lib/theme/
cd ../..
```

Expected: `No issues found!`. If there are missing token references (`Undefined name 'colorXxx'`), update wm_theme.dart to use the names that exist.

- [ ] **Step 2.3: Commit**

```bash
git add apps/mobile/lib/theme/wm_theme.dart
git commit -m "feat(mobile): WMTheme factory bridging tokens.g.dart → ThemeData"
```

---

## Task 3: pubspec.yaml dependencies

**Files:**
- Modify: `apps/mobile/pubspec.yaml`

- [ ] **Step 3.1: Add dependencies**

In `apps/mobile/pubspec.yaml`, under `dependencies:`, ADD (alongside the existing entries — do not remove anything):

```yaml
  # Plan-B — generated API client + JWT auth
  dio: ^5.7.0
  # Plan-B — Material 3 + i18n
  intl: ^0.19.0
  # Plan-C — observability
  sentry_flutter: ^8.9.0
```

Also under `flutter:` (the bottom Flutter section), add the `generate: true` flag if not already present:

```yaml
flutter:
  uses-material-design: true
  generate: true   # enable gen-l10n
```

- [ ] **Step 3.2: Resolve**

```bash
cd apps/mobile
flutter pub get
cd ../..
```

Expected: `Got dependencies!` (no version conflicts). If `intl` clashes with `flutter_localizations` requirement, pin `intl: any`.

- [ ] **Step 3.3: Commit**

```bash
git add apps/mobile/pubspec.yaml apps/mobile/pubspec.lock
git commit -m "feat(mobile): add dio/intl/sentry_flutter dependencies (Plan-B/C)"
```

---

## Task 4: flutter-api.cjs + Dio client

**Files:**
- Replace: `scripts/codegen/flutter-api.cjs`
- Create: `apps/mobile/lib/api/dio_client.dart`
- Create: `apps/mobile/lib/api/jwt_store.dart`
- Create (auto via openapi-generator): `apps/mobile/lib/api/openapi/`

- [ ] **Step 4.1: Replace the codegen script**

Replace `scripts/codegen/flutter-api.cjs` with:

```js
#!/usr/bin/env node
/**
 * flutter-api.cjs — wraps openapi-generator-cli (dart-dio) against the live
 * drf-spectacular schema. Mirrors `apps/web/scripts/gen-api-types.mjs` but
 * for Dart.
 *
 * Requires:
 *   - npx openapi-generator-cli (we install via `npm exec --yes`)
 *   - API service reachable at VITE_API_URL (default http://api:4455)
 *
 * Output: apps/mobile/lib/api/openapi/
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "apps/mobile/lib/api/openapi");
const BASE = (process.env.VITE_API_URL ?? "http://localhost:4455").replace(/\/$/, "");
const SCHEMA_URL = `${BASE}/v1/schema/?format=json`;

async function fetchSchema() {
  const res = await fetch(SCHEMA_URL, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Schema fetch failed: ${res.status} ${res.statusText} (${SCHEMA_URL})`);
  }
  return res.json();
}

async function main() {
  const schema = await fetchSchema();
  const tmp = path.join(ROOT, ".cache/openapi-schema.json");
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(schema), "utf8");

  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const args = [
    "openapi-generator-cli",
    "generate",
    "-i", tmp,
    "-g", "dart-dio",
    "-o", OUT_DIR,
    "--additional-properties=pubName=wm_api,nullableFields=true,useEnumExtension=true",
    "--skip-validate-spec",
  ];
  const r = spawnSync("npx", ["--yes", ...args], { stdio: "inherit", env: process.env });
  if (r.status !== 0) {
    process.stderr.write("[flutter-api] openapi-generator-cli failed\n");
    process.exit(r.status ?? 1);
  }

  // Clean up generator-emitted files that pollute the repo
  for (const f of [".openapi-generator", ".openapi-generator-ignore", "pubspec.yaml", "README.md", ".gitignore"]) {
    const p = path.join(OUT_DIR, f);
    fs.rmSync(p, { recursive: true, force: true });
  }
  process.stdout.write(`[flutter-api] wrote ${OUT_DIR}\n`);
}

main().catch((e) => {
  process.stderr.write(`[flutter-api] ${e.message}\n`);
  process.exit(1);
});
```

- [ ] **Step 4.2: Run it**

```bash
docker compose up -d api  # ensure schema endpoint is reachable
node scripts/codegen/flutter-api.cjs
```

Expected: `[flutter-api] wrote /.../apps/mobile/lib/api/openapi`. Generated Dart files (likely 50-200) appear under `apps/mobile/lib/api/openapi/lib/` (dart-dio nested layout).

If openapi-generator-cli isn't cached, the first run downloads Java + the JAR (~80MB) — give it a minute. If Java is missing on host, install with `choco install openjdk` (Windows) or use the JS-only fallback by switching generator to `dart` (less feature-rich).

- [ ] **Step 4.3: Create jwt_store.dart**

Create `apps/mobile/lib/api/jwt_store.dart`:

```dart
import 'package:shared_preferences/shared_preferences.dart';

/// JWT storage backed by shared_preferences (PoC).
///
/// Production: migrate to flutter_secure_storage (Plan-D / post-PoC) so the
/// access/refresh tokens live in OS keychain instead of plain prefs.
class JwtStore {
  static const _kAccess = 'wm.jwt.access';
  static const _kRefresh = 'wm.jwt.refresh';

  Future<String?> readAccess() async => (await SharedPreferences.getInstance()).getString(_kAccess);
  Future<String?> readRefresh() async => (await SharedPreferences.getInstance()).getString(_kRefresh);

  Future<void> write({required String access, required String refresh}) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kAccess, access);
    await p.setString(_kRefresh, refresh);
  }

  Future<void> clear() async {
    final p = await SharedPreferences.getInstance();
    await p.remove(_kAccess);
    await p.remove(_kRefresh);
  }
}
```

- [ ] **Step 4.4: Create dio_client.dart**

Create `apps/mobile/lib/api/dio_client.dart`:

```dart
import 'dart:async';

import 'package:dio/dio.dart';

import 'jwt_store.dart';

/// Configured Dio with JWT Bearer + silent-refresh interceptor.
///
/// Usage:
///   final dio = await createWMDio(baseUrl: 'https://api.work-manager.molcube.com');
///   final res = await dio.get('/v1/me/settings');
Future<Dio> createWMDio({required String baseUrl, JwtStore? store}) async {
  final dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));
  final jwt = store ?? JwtStore();

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final access = await jwt.readAccess();
      if (access != null) options.headers['Authorization'] = 'Bearer $access';
      handler.next(options);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode != 401) return handler.next(e);
      final refresh = await jwt.readRefresh();
      if (refresh == null) return handler.next(e);
      // Silent refresh attempt
      try {
        final r = await Dio(BaseOptions(baseUrl: baseUrl)).post(
          '/v1/auth/refresh',
          data: {'refresh': refresh},
        );
        final data = r.data as Map<String, dynamic>;
        final newAccess = data['data']?['access'] as String?;
        if (newAccess == null) return handler.next(e);
        await jwt.write(access: newAccess, refresh: refresh);
        // Retry original request once
        final req = e.requestOptions;
        req.headers['Authorization'] = 'Bearer $newAccess';
        final retry = await dio.fetch(req);
        return handler.resolve(retry);
      } catch (_) {
        return handler.next(e);
      }
    },
  ));

  return dio;
}
```

- [ ] **Step 4.5: Compile check**

```bash
cd apps/mobile
flutter pub get
flutter analyze lib/api/
cd ../..
```

Expected: `No issues found!`. The generated openapi/ dir may have its own lints — `flutter analyze lib/api/dio_client.dart lib/api/jwt_store.dart` to scope only the hand-written files if the generated code emits warnings.

- [ ] **Step 4.6: Commit**

```bash
git add scripts/codegen/flutter-api.cjs apps/mobile/lib/api/dio_client.dart apps/mobile/lib/api/jwt_store.dart apps/mobile/lib/api/openapi
git commit -m "feat(api,codegen): dart-dio OpenAPI client + dio_client + jwt_store"
```

---

## Task 5: flutter-i18n.cjs + ARB outputs

**Files:**
- Replace: `scripts/codegen/flutter-i18n.cjs`
- Create: `apps/mobile/l10n.yaml`
- Create (auto): `apps/mobile/lib/l10n/app_ko.arb`, `apps/mobile/lib/l10n/app_en.arb`

- [ ] **Step 5.1: Replace the codegen script**

Replace `scripts/codegen/flutter-i18n.cjs` with:

```js
#!/usr/bin/env node
/**
 * flutter-i18n.cjs — converts i18next JSON (ko/en) to Flutter ARB files.
 *
 * Input:  apps/web/src/shared/i18n/locales/{ko,en}.json (nested keys)
 * Output: apps/mobile/lib/l10n/app_{ko,en}.arb (flat keys with @@locale)
 *
 * Key flattening: 'home.status_working' → 'homeStatusWorking' (camelCase, ARB requires non-dotted keys).
 *
 * Spec: docs/superpowers/specs/2026-05-13-home-native-poc-design.md §5
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "..");
const LOCALES = [
  { in: "apps/web/src/shared/i18n/locales/ko.json", out: "apps/mobile/lib/l10n/app_ko.arb", locale: "ko" },
  { in: "apps/web/src/shared/i18n/locales/en.json", out: "apps/mobile/lib/l10n/app_en.arb", locale: "en" },
];

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

function main() {
  for (const loc of LOCALES) {
    const src = path.join(ROOT, loc.in);
    const dst = path.join(ROOT, loc.out);
    if (!fs.existsSync(src)) {
      process.stderr.write(`[flutter-i18n] missing input ${src} — skipping ${loc.locale}\n`);
      continue;
    }
    const json = JSON.parse(fs.readFileSync(src, "utf8"));
    const flat = flatten(json);
    const arb = { "@@locale": loc.locale };
    for (const [k, v] of Object.entries(flat)) {
      arb[dotToCamel(k)] = v;
    }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, JSON.stringify(arb, null, 2) + "\n", "utf8");
    process.stdout.write(`[flutter-i18n] wrote ${dst} (${Object.keys(flat).length} keys)\n`);
  }
}

main();
```

- [ ] **Step 5.2: Run it**

```bash
node scripts/codegen/flutter-i18n.cjs
```

Expected stdout: two lines, one per locale. Inspect `head -20 apps/mobile/lib/l10n/app_ko.arb` — first line `"@@locale": "ko"`, then `"homeStatusWorking": "...",` entries.

- [ ] **Step 5.3: Create l10n.yaml**

Create `apps/mobile/l10n.yaml`:

```yaml
arb-dir: lib/l10n
template-arb-file: app_ko.arb
output-localization-file: app_localizations.dart
output-dir: lib/l10n/generated
synthetic-package: false
nullable-getter: false
```

- [ ] **Step 5.4: Generate Dart localizations**

```bash
cd apps/mobile
flutter gen-l10n
cd ../..
```

Expected: `apps/mobile/lib/l10n/generated/app_localizations.dart` (plus per-locale files) appear. Flutter's gen-l10n produces strongly-typed accessors like `AppLocalizations.of(context).homeStatusWorking`.

- [ ] **Step 5.5: Commit**

```bash
git add scripts/codegen/flutter-i18n.cjs apps/mobile/l10n.yaml apps/mobile/lib/l10n
git commit -m "feat(i18n,codegen): i18next ko/en → ARB + flutter gen-l10n config"
```

---

## Task 6: Makefile codegen + verify integration

**Files:**
- (No file change — Makefile target from Plan-A already runs all 3 scripts via `make codegen`. This task just verifies the full chain.)

- [ ] **Step 6.1: Full codegen run**

```bash
docker compose up -d api  # for flutter-api
make codegen
```

Expected: 3 stdout lines from the codegen scripts, each writing real files.

- [ ] **Step 6.2: Drift gate must STILL pass on no-source-change re-run**

```bash
make codegen-check
```

Expected: `[codegen-check] no drift.` — because re-running produces byte-identical output.

- [ ] **Step 6.3: Drift gate must FAIL when source drifts (simulation)**

```bash
echo "  --test-drift-key: #DEADBEEF;" >> apps/web/src/shared/styles/tokens.css
make codegen-check
```

Expected: exit 1 with `::error::codegen drift detected in apps/mobile/lib`. **Then revert the test edit**:

```bash
git checkout apps/web/src/shared/styles/tokens.css
make codegen-check
```

Should now pass again.

- [ ] **Step 6.4: No commit** — this task is verification only.

---

## Task 7: CI workflow integration

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 7.1: Inspect existing CI**

```bash
head -40 .github/workflows/ci.yml
```

Identify the job structure (jobs/run-on/steps) and find an appropriate place to add a `codegen-check` job — typically as an independent job that runs in parallel with `backend` / `frontend`.

- [ ] **Step 7.2: Add codegen-check job**

Append to `.github/workflows/ci.yml` under the `jobs:` map (preserving YAML indentation — 2 spaces per level):

```yaml
  codegen-check:
    name: Codegen Drift
    runs-on: ubuntu-latest
    needs: [backend]  # backend job boots the API and exposes /v1/schema
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Set up Java 17 (openapi-generator-cli)
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
      - name: Set up Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.24.0'
      - name: Boot API for schema fetch
        run: |
          docker compose up -d db redis api
          timeout 60 bash -c 'until curl -sf http://localhost:4455/v1/health; do sleep 2; done'
      - name: Run codegen + drift check
        env:
          VITE_API_URL: http://localhost:4455
        run: make codegen-check
```

**Adapt to existing CI patterns:** if the repo's `backend` job doesn't actually expose `/v1/schema` to subsequent jobs (CI sandboxes are isolated), drop `needs: [backend]` and let this job boot its own API. If the existing CI uses caching for node/flutter, match that pattern.

- [ ] **Step 7.3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: codegen-check job (drift gate against PR changes)"
```

---

## Self-Review

**Spec coverage (Plan-B scope — W2-W3 in spec §10):**
- ✅ B-NAT-01 real impl → Task 1+2 (tokens codegen + ThemeData)
- ✅ B-NAT-02 real impl → Task 4 (OpenAPI Dart client + Dio)
- ✅ i18n codegen → Task 5 (ARB)
- ✅ CI drift gate → Task 7

**Placeholder scan:** None. All steps contain complete code.

**Type consistency:**
- `WMTokens.colorPrimary` named consistently across tokens.g.dart / wm_theme.dart.
- `JwtStore.readAccess()` / `write()` / `clear()` signatures match between jwt_store.dart and dio_client.dart usage.

**Out of scope (Plan-C):**
- `main.dart` 분기 (Plan-C Task 1)
- `WMHomeScreen` + widgets (Plan-C Task 2+)
- `WsClient` (Plan-C)
- `NativeBridge.notifySettingsChanged` (Plan-C)
- Sentry init (sentry_flutter dep added here, init in Plan-C)

If your changes touch any out-of-scope file, stop and surface it.
