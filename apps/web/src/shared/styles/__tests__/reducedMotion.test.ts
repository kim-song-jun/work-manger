/**
 * Test: shared/styles · prefers-reduced-motion override
 * Type: Unit (vitest, jsdom)
 * Why:  Users with vestibular disorders rely on `prefers-reduced-motion: reduce`
 *       to silence animation. The design system collapses motion duration tokens
 *       inside the matching media query — a regression here re-introduces motion
 *       for those users without any visible signal.
 * Covers:
 *   - tokens.css declares the @media (prefers-reduced-motion: reduce) block
 *   - Within that block, --motion-fast / --motion-standard / --motion-slow /
 *     --motion-page are all collapsed to 0ms
 *   - The wildcard rule clamps animation/transition durations to 0.01ms
 * Out of scope:
 *   - Browser actually honouring the media query (unit-level — we lint the CSS
 *     source rather than spin up a real layout engine that supports the query)
 * Coverage target: structural assertion on the source file
 */
import { describe, expect, it } from "vitest";

// Vite raw-string import: bundles tokens.css source as a JS string at test time
// without pulling in @types/node for fs access.
import css from "../tokens.css?raw";

describe("prefers-reduced-motion overrides", () => {
  it("declares the @media (prefers-reduced-motion: reduce) block", () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it("collapses every motion duration token inside the reduced-motion block", () => {
    // Why: the design system promises "all motion tokens go to 0" — verify
    // each one explicitly so a future addition (e.g. --motion-xl) doesn't
    // silently skip the override.
    const block = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/.exec(css);
    expect(block).not.toBeNull();
    const body = block![1];
    expect(body).toMatch(/--motion-fast:\s*0ms/);
    expect(body).toMatch(/--motion-standard:\s*0ms/);
    expect(body).toMatch(/--motion-slow:\s*0ms/);
    expect(body).toMatch(/--motion-page:\s*0ms/);
  });

  it("clamps wildcard animation+transition durations", () => {
    // Why: even components that hard-code a duration (e.g. older code that
    // passes `transition: '150ms'`) get clamped via the global wildcard.
    const block = /@media\s*\(prefers-reduced-motion:\s*reduce\)([\s\S]*)$/.exec(css);
    const body = block ? block[1] : "";
    expect(body).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(body).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });
});
