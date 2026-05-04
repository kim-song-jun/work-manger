/**
 * Dev-only i18n missing-key reporter.
 *
 * Why: `t("foo.bar")` silently falls back to the key string when a translation
 * is missing — easy to ship to prod. In DEV we hook react-i18next's
 * `missingKey` event and log a warning so the developer sees the regression
 * before users do. Production builds tree-shake this out via
 * `import.meta.env.DEV` (Vite replaces with `false`, dead-code eliminated).
 */
import type { i18n as I18nInstance } from "i18next";

export function installMissingKeyLogger(i18n: I18nInstance): void {
  if (!import.meta.env.DEV) return;
  // Avoid double-installing when HMR re-runs this module.
  const flag = "__wmMissingKeyInstalled" as const;
  type Tagged = I18nInstance & { [flag]?: boolean };
  const tagged = i18n as Tagged;
  if (tagged[flag]) return;
  tagged[flag] = true;

  i18n.on("missingKey", (lngs, namespace, key, _res) => {
    // eslint-disable-next-line no-console
    console.warn(
      `[i18n] missing key: ns=${namespace} key="${key}" lngs=${lngs.join(",")}`,
    );
  });
}
