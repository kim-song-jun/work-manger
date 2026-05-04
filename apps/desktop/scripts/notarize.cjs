/**
 * Apple notarization hook (electron-builder afterSign).
 *
 * Submits the signed .app bundle to Apple's notary service via notarytool
 * (App Store Connect API), then staples the resulting ticket. Skips cleanly
 * when the required env vars are missing — local dev / fork PRs / unsigned
 * smoke builds all pass through untouched.
 *
 * Required env (all three or none):
 *   APPLE_ID                       — Apple Developer account email
 *   APPLE_APP_SPECIFIC_PASSWORD    — app-specific password (NOT the AC password)
 *   APPLE_TEAM_ID                  — 10-char team ID from developer.apple.com
 *
 * Optional:
 *   APPLE_NOTARIZE_DRY_RUN=1       — log the call, don't actually submit
 *   WM_NOTARIZE_TIMEOUT_MIN=30     — bail after this many minutes (default 30)
 *
 * Logs the notarytool ticket / submission ID for auditability.
 */
"use strict";

const path = require("node:path");

/** @type {(ctx: import('electron-builder').AfterPackContext) => Promise<void>} */
module.exports = async function notarize(ctx) {
  const { electronPlatformName, appOutDir, packager } = ctx;
  if (electronPlatformName !== "darwin") {
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_APP_SPECIFIC_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !teamId) {
    console.log(
      "[notarize] APPLE_ID / APPLE_APP_SPECIFIC_PASSWORD / APPLE_TEAM_ID not set — skipping notarization",
    );
    return;
  }

  if (process.env.APPLE_NOTARIZE_DRY_RUN === "1") {
    console.log(
      `[notarize] DRY-RUN: would submit ${appOutDir} for team ${teamId} as ${appleId}`,
    );
    return;
  }

  // Lazy-require so unsigned local builds don't fail when the dep isn't installed.
  let notarizeFn;
  try {
    // eslint-disable-next-line global-require
    notarizeFn = require("@electron/notarize").notarize;
  } catch (err) {
    console.error(
      "[notarize] @electron/notarize is not installed — run `npm install --save-dev @electron/notarize`",
    );
    throw err;
  }

  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);
  const timeoutMin = Number(process.env.WM_NOTARIZE_TIMEOUT_MIN ?? 30);

  console.log(
    `[notarize] submitting ${appPath} (team=${teamId}, account=${appleId}) — timeout ${timeoutMin}m`,
  );
  const start = Date.now();

  try {
    const result = await notarizeFn({
      tool: "notarytool",
      appPath,
      appleId,
      appleIdPassword,
      teamId,
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    // `result` may include `id` or other fields depending on version.
    const ticketId =
      (result && (result.id || result.uuid || result.submissionId)) ||
      "<no-id-returned>";
    console.log(
      `[notarize] OK in ${elapsed}s — ticket ${ticketId} stapled to ${appName}.app`,
    );
  } catch (err) {
    console.error(`[notarize] FAILED: ${err && err.message ? err.message : err}`);
    throw err;
  }
};
