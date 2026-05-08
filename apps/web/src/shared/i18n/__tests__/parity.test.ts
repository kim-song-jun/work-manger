/**
 * Test: shared/i18n · ko/en parity
 * Type: Unit (vitest, jsdom)
 * Why:  The TS type guard `const en: typeof ko = {…}` enforces parity at
 *       compile time, but a future refactor or a `as any` regression could
 *       slip a missing key into the bundle. A runtime test is cheap insurance
 *       and catches drift in any scaffolded namespace before it hits users.
 * Covers:
 *   - Every leaf path present in `ko` exists in `en` (and vice versa)
 *   - Both bundles have identical leaf shape (string vs object)
 * Out of scope:
 *   - Translation quality / pluralization correctness
 *   - i18next runtime behaviour (handled by react-i18next test helper)
 * Coverage target: structural — all top-level namespaces traversed
 */
import { describe, expect, it } from "vitest";

import i18n from "../index";

type Bag = Record<string, unknown>;

function leafPaths(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return [prefix];
  const out: string[] = [];
  for (const [k, v] of Object.entries(obj as Bag)) {
    const next = prefix ? `${prefix}.${k}` : k;
    out.push(...leafPaths(v, next));
  }
  return out.sort();
}

describe("i18n parity (ko ↔ en)", () => {
  const ko = i18n.getResourceBundle("ko", "translation") as Bag;
  const en = i18n.getResourceBundle("en", "translation") as Bag;

  it("loads both bundles", () => {
    // Why: catch a botched i18n.init that drops a namespace before drilling
    // down to per-key diff (would otherwise produce a noisy 100-key diff).
    expect(ko).toBeTypeOf("object");
    expect(en).toBeTypeOf("object");
  });

  it("ko keys all exist in en", () => {
    // Why: a missing en key leaks Korean to English users via fallbackLng.
    const koPaths = new Set(leafPaths(ko));
    const enPaths = new Set(leafPaths(en));
    const missing = [...koPaths].filter((p) => !enPaths.has(p));
    expect(missing).toEqual([]);
  });

  it("en keys all exist in ko", () => {
    // Why: parity must be symmetric — orphan en keys are dead weight or a
    // typo away from a missing-key warning.
    const koPaths = new Set(leafPaths(ko));
    const enPaths = new Set(leafPaths(en));
    const missing = [...enPaths].filter((p) => !koPaths.has(p));
    expect(missing).toEqual([]);
  });
});
