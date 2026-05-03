/** Zustand store for app-wide UI tweaks (theme/brand/font/lang). */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type Brand = "blue" | "mint" | "violet" | "coral";
export type FontSize = "sm" | "md" | "lg";
export type Lang = "ko" | "en";

type TweaksFields = {
  theme: ThemeMode;
  brand: Brand;
  font: FontSize;
  lang: Lang;
};

interface TweaksState extends TweaksFields {
  set: <K extends keyof TweaksFields>(k: K, v: TweaksFields[K]) => void;
  reset: () => void;
}

const DEFAULTS = { theme: "light" as ThemeMode, brand: "blue" as Brand, font: "md" as FontSize, lang: "ko" as Lang };

export const useTweaksStore = create<TweaksState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (k, v) => set({ [k]: v } as Partial<TweaksState>),
      reset: () => set(DEFAULTS),
    }),
    { name: "wm:tweaks" },
  ),
);

export function applyTweaksToBody(state: Pick<TweaksState, "theme" | "brand" | "font">) {
  if (typeof document === "undefined") return;
  const body = document.body;
  body.classList.remove("theme-dark", "theme-mint", "theme-violet", "theme-coral");
  if (state.theme === "dark") body.classList.add("theme-dark");
  if (state.brand === "mint") body.classList.add("theme-mint");
  if (state.brand === "violet") body.classList.add("theme-violet");
  if (state.brand === "coral") body.classList.add("theme-coral");
  body.classList.remove("font-sm", "font-md", "font-lg");
  body.classList.add("font-" + state.font);
}
