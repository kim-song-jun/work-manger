/**
 * Preflight: warns (non-fatal) when the macOS Developer ID certificate or the
 * Apple Team ID is missing. Use as `npm run check:mac-signing` before a CI
 * release job to give a clear log line instead of letting electron-builder
 * print a confusing "no identity found" deep in its trace.
 *
 * Exit code is always 0 — this is informational, not a gate. Use the exit
 * code from `electron-builder --mac --publish=always` itself for gating.
 */
"use strict";

const { execSync } = require("node:child_process");

function checkKeychainForDeveloperId() {
  if (process.platform !== "darwin") {
    console.log(
      "[check-mac-signing] not running on macOS — skipping keychain check",
    );
    return;
  }
  try {
    const out = execSync('security find-identity -p codesigning -v', {
      encoding: "utf8",
    });
    const lines = out.split("\n").filter((l) => /Developer ID Application/.test(l));
    if (lines.length === 0) {
      console.warn(
        "[check-mac-signing] WARN: no 'Developer ID Application' identity found in the keychain. " +
          "Import the .p12 (or run `security unlock-keychain`) before building.",
      );
    } else {
      console.log(
        `[check-mac-signing] found ${lines.length} Developer ID Application identity(ies)`,
      );
    }
  } catch (err) {
    console.warn(
      `[check-mac-signing] WARN: 'security find-identity' failed: ${err && err.message}`,
    );
  }
}

function checkEnv() {
  const required = ["APPLE_ID", "APPLE_APP_SPECIFIC_PASSWORD", "APPLE_TEAM_ID"];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length === required.length) {
    console.warn(
      "[check-mac-signing] WARN: notarization env vars are unset (" +
        required.join(", ") +
        "). Build will produce a signed-but-not-notarized artifact — Gatekeeper will warn end users.",
    );
  } else if (missing.length > 0) {
    console.warn(
      `[check-mac-signing] WARN: partial notarization env — missing: ${missing.join(", ")}`,
    );
  } else {
    console.log("[check-mac-signing] notarization env present");
  }
}

checkKeychainForDeveloperId();
checkEnv();
