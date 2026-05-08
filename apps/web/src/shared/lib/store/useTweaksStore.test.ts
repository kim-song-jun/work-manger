/**
 * Test: shared/lib/store · useTweaksStore + applyTweaksToBody
 * Type: Unit (vitest, jsdom)
 * Why:  Tweaks store powers theme/brand/font/lang switches. A misapplied
 *       body class breaks dark-mode and theming for every page.
 * Covers:
 *   - set(k, v) updates the matching field only
 *   - reset() restores defaults
 *   - applyTweaksToBody adds/removes the right body classes for theme/brand/font
 *   - applyTweaksToBody is idempotent
 * Out of scope:
 *   - i18next language switching (handled in widgets/tweaks-panel)
 * Coverage target: 100% lines for useTweaksStore.ts
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  useTweaksStore,
  applyTweaksToBody,
} from "./useTweaksStore";

describe("useTweaksStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useTweaksStore.getState().reset();
  });

  it("starts with defaults", () => {
    const s = useTweaksStore.getState();
    expect(s.theme).toBe("light");
    expect(s.brand).toBe("blue");
    expect(s.font).toBe("md");
    expect(s.lang).toBe("ko");
  });

  it("set() updates only the requested field", () => {
    useTweaksStore.getState().set("theme", "dark");
    expect(useTweaksStore.getState().theme).toBe("dark");
    expect(useTweaksStore.getState().brand).toBe("blue");
  });

  it("reset() restores defaults", () => {
    useTweaksStore.getState().set("theme", "dark");
    useTweaksStore.getState().set("brand", "violet");
    useTweaksStore.getState().reset();
    expect(useTweaksStore.getState().theme).toBe("light");
    expect(useTweaksStore.getState().brand).toBe("blue");
  });
});

describe("applyTweaksToBody", () => {
  afterEach(() => {
    document.body.className = "";
  });

  it("adds theme-dark for dark theme", () => {
    applyTweaksToBody({ theme: "dark", brand: "blue", font: "md" });
    expect(document.body.classList.contains("theme-dark")).toBe(true);
    expect(document.body.classList.contains("font-md")).toBe(true);
  });

  it("adds theme-mint / theme-violet / theme-coral for matching brand", () => {
    applyTweaksToBody({ theme: "light", brand: "mint", font: "sm" });
    expect(document.body.classList.contains("theme-mint")).toBe(true);
    applyTweaksToBody({ theme: "light", brand: "violet", font: "md" });
    expect(document.body.classList.contains("theme-violet")).toBe(true);
    applyTweaksToBody({ theme: "light", brand: "coral", font: "lg" });
    expect(document.body.classList.contains("theme-coral")).toBe(true);
  });

  it("removes prior theme classes when re-applied", () => {
    applyTweaksToBody({ theme: "dark", brand: "mint", font: "md" });
    applyTweaksToBody({ theme: "light", brand: "blue", font: "lg" });
    expect(document.body.classList.contains("theme-dark")).toBe(false);
    expect(document.body.classList.contains("theme-mint")).toBe(false);
    expect(document.body.classList.contains("font-lg")).toBe(true);
    expect(document.body.classList.contains("font-md")).toBe(false);
  });
});
