/**
 * Windows code-sign wrapper for electron-builder.
 *
 * Mode is selected by the `WM_WIN_SIGN_MODE` env var:
 *
 *   - unset / "local" : delegates to electron-builder's built-in signtool
 *                       path. The exported function returns falsy → builder
 *                       runs its default behavior using win.certificateFile
 *                       + win.certificatePassword (CSC_LINK / CSC_KEY_PASSWORD).
 *
 *   - "cloud"         : invokes signtool.exe directly with a cloud-cert
 *                       configuration (DigiCert KeyLocker, SSL.com eSigner,
 *                       Azure Trusted Signing). Reads the cert ref + password
 *                       from CSC_LINK / CSC_KEY_PASSWORD and timestamps via
 *                       DigiCert RFC 3161.
 *
 *   - "skip"          : returns truthy without doing anything. Useful when you
 *                       want unsigned dev builds while keeping the YAML wired.
 *
 * electron-builder calls this once per binary that needs signing (the
 * installer, the .exe, helper exes, etc.). Throwing fails the build.
 */
"use strict";

const { execFileSync } = require("node:child_process");

const TIMESTAMP_URL =
  process.env.WM_WIN_TIMESTAMP_URL || "http://timestamp.digicert.com";

/** @param {{ path: string, name?: string, hash?: string }} configuration */
module.exports = async function winSign(configuration) {
  const mode = (process.env.WM_WIN_SIGN_MODE || "local").toLowerCase();

  if (mode === "skip") {
    console.log(`[win-sign] WM_WIN_SIGN_MODE=skip — leaving ${configuration.path} unsigned`);
    return true;
  }

  if (mode === "local") {
    // Falsy return → electron-builder runs its default signtool flow with
    // win.certificateFile + win.certificatePassword from electron-builder.yml.
    return false;
  }

  if (mode !== "cloud") {
    throw new Error(
      `[win-sign] unknown WM_WIN_SIGN_MODE='${mode}' (expected 'local' | 'cloud' | 'skip')`,
    );
  }

  const cscLink = process.env.CSC_LINK || process.env.WIN_CSC_LINK;
  const cscPass = process.env.CSC_KEY_PASSWORD || process.env.WIN_CSC_KEY_PASSWORD;
  if (!cscLink || !cscPass) {
    throw new Error(
      "[win-sign] WM_WIN_SIGN_MODE=cloud requires CSC_LINK + CSC_KEY_PASSWORD env vars",
    );
  }

  const args = [
    "sign",
    "/f", cscLink,
    "/p", cscPass,
    "/tr", TIMESTAMP_URL,
    "/td", "sha256",
    "/fd", "sha256",
    configuration.path,
  ];

  console.log(
    `[win-sign] cloud-signing ${configuration.path} (timestamp=${TIMESTAMP_URL})`,
  );

  // Resolve signtool from PATH (Windows SDK ships it in the SDK bin dir; the
  // GitHub Actions windows-latest runner has it on PATH).
  try {
    execFileSync("signtool", args, { stdio: "inherit" });
  } catch (err) {
    throw new Error(
      `[win-sign] signtool failed for ${configuration.path}: ${err && err.message}`,
    );
  }

  // Truthy return → electron-builder skips its own signing pass.
  return true;
};
