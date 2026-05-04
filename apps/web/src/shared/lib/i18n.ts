/**
 * i18n helpers — locale resolution.
 *
 * `getDefaultLocale()` is the single source of truth for picking the initial
 * language: it prefers the persisted `useTweaksStore.lang` value (so a user
 * choice survives reloads even before React mounts), and falls back to the
 * browser's `navigator.language` heuristic. We deliberately do NOT touch
 * i18n in here — wiring is done in `shared/i18n/index.ts` to keep the FSD
 * dependency direction (lib -> ui never imports a layer up).
 */
export type SupportedLang = "ko" | "en";

const STORAGE_KEY = "wm:tweaks";
const LEGACY_LANG_KEY = "wm:lang";

function fromTweaksStore(): SupportedLang | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    // zustand persist wraps state in { state: { ... }, version }
    const parsed = JSON.parse(raw) as
      | { state?: { lang?: unknown }; lang?: unknown }
      | null;
    const lang =
      (parsed && parsed.state && parsed.state.lang) ||
      (parsed && parsed.lang) ||
      null;
    if (lang === "ko" || lang === "en") return lang;
    return null;
  } catch {
    return null;
  }
}

function fromLegacyKey(): SupportedLang | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const v = localStorage.getItem(LEGACY_LANG_KEY);
    if (v === "ko" || v === "en") return v;
    return null;
  } catch {
    return null;
  }
}

function fromNavigator(): SupportedLang {
  try {
    if (typeof navigator === "undefined") return "ko";
    return navigator.language?.toLowerCase().startsWith("en") ? "en" : "ko";
  } catch {
    return "ko";
  }
}

/**
 * Resolution order:
 *   1. useTweaksStore.lang (zustand persisted JSON under "wm:tweaks")
 *   2. legacy "wm:lang" key (kept for older installs)
 *   3. navigator.language → en if starts with "en", else ko
 */
export function getDefaultLocale(): SupportedLang {
  return fromTweaksStore() ?? fromLegacyKey() ?? fromNavigator();
}
