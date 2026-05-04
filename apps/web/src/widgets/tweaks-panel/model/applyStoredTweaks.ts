export type Theme = "light" | "dark";
export type Brand = "blue" | "mint" | "violet" | "coral";
export type FontSize = "sm" | "md" | "lg";

export type Tweaks = {
  theme: Theme;
  brand: Brand;
  fontSize: FontSize;
  lang: "ko" | "en";
};

export const STORAGE_KEY = "wm:tweaks";

export const defaultTweaks: Tweaks = {
  theme: "light",
  brand: "blue",
  fontSize: "md",
  lang: "ko",
};

/**
 * Pick the OS-preferred color scheme as a default. When the user has no
 * stored theme override we honour `prefers-color-scheme: dark` so the app
 * matches the rest of the OS on first visit.
 */
function osPrefersDark(): boolean {
  try {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // No prior choice → fall back to OS preference for theme only.
      return { ...defaultTweaks, theme: osPrefersDark() ? "dark" : "light" };
    }
    return { ...defaultTweaks, ...JSON.parse(raw) };
  } catch {
    return defaultTweaks;
  }
}

export function applyTweaks(tw: Tweaks) {
  const body = document.body;
  body.classList.remove(
    "theme-dark",
    "theme-mint",
    "theme-violet",
    "theme-coral",
    "font-sm",
    "font-md",
    "font-lg",
  );
  if (tw.theme === "dark") body.classList.add("theme-dark");
  if (tw.brand === "mint") body.classList.add("theme-mint");
  if (tw.brand === "violet") body.classList.add("theme-violet");
  if (tw.brand === "coral") body.classList.add("theme-coral");
  body.classList.add(`font-${tw.fontSize}`);
}

export function applyStoredTweaks() {
  applyTweaks(loadTweaks());
}
