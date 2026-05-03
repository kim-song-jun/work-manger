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

export function loadTweaks(): Tweaks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTweaks;
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
