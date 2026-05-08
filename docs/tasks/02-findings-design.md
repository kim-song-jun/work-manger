---
agent: designer
generated: 2026-05-08
task_n: 2
---

# designer findings (Wave 2 audit)

## design system SSOT summary

- Tokens defined at: `apps/web/src/shared/styles/tokens.css` (CSS custom properties) and `docs/design/design-system.md`
- Tailwind mapping: `apps/web/tailwind.config.ts` — `brand`, `ink-*` (grey), `success`, `warn`, `danger`, `info`, `caution`, `rounded-sm/md/lg/xl/pill`, `shadow-1/2/3/4`
- **Key rules**:
  - 8px grid: spacing values are `--sp-1` (4px) / `--sp-2` (8px) / `--sp-3` (12px) … non-multiples of 4 are off-grid
  - Typography: use `.t-*` utility classes or Tailwind `text-sm`, `text-base`; raw `text-[Npx]` and `fontSize: N` are violations
  - Focus ring: `focus-visible:ring-2 focus-visible:ring-brand` (from Button.tsx reference) — must exist on every interactive element
  - Hit-target: mobile interactive elements ≥ 44×44px
  - Shadow: use `var(--shadow-N)` or Tailwind `shadow-1..4`; raw rgba shadows and gradient backgrounds forbidden
  - Color: never hardcode hex except via `var(--token)` or Tailwind token class

---

## Token violations (raw color / spacing / radius)

### F-DESIGN-001: Hardcoded `#5B6CFF` fallback color in ColorField
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:286`
- reason: `value={value.length === 7 ? value : "#5B6CFF"}` uses a raw hex that does not correspond to any design-system token. `--blue-500` is `#3182F6`; `#5B6CFF` is an unregistered color.
- Suggested fix: replace with `"var(--brand)"` (resolves to `#3182F6`) — `value={value.length === 7 ? value : "var(--brand)"}`

### F-DESIGN-002: Hardcoded `"#fff"` for button text and input background
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:182, 257, 304, 339`
- reason: `color: "#fff"` (save button) and `background: "#fff"` (TextField, ColorField text input, SelectField) use literal white instead of `var(--white)`. In dark/theme modes `--white` remaps to `#131720`; raw `"#fff"` does not theme-switch.
- Suggested fix: `color: "var(--white)"` / `background: "var(--white)"` or Tailwind `bg-white` (which maps to `var(--white)` if configured).

### F-DESIGN-003: Raw `borderRadius: 6` — off-token, off-grid
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:255, 301, 337`
- reason: Three inline inputs (TextField, ColorField text input, SelectField) use `borderRadius: 6`. The design system token ladder is `--r-xs:4px`, `--r-sm:8px`; 6px is neither a token nor a grid-aligned value. Tailwind `rounded-sm` = `var(--r-sm)` = 8px is the correct choice for inputs.
- Suggested fix: `borderRadius: "var(--r-sm)"` or remove inline style and add Tailwind `rounded-sm`.

### F-DESIGN-004: Raw `borderRadius: 8` (save / reset buttons) — not using token
- Severity: **P2**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:166, 184`
- reason: Save/reset buttons use `borderRadius: 8`, which equals `--r-sm`, but bypasses the token. Functionally correct value but not token-referenced; will drift if token changes.
- Suggested fix: `borderRadius: "var(--r-sm)"` or shared `<Button>` component which already applies `rounded-sm`/`rounded-md`.

### F-DESIGN-005: Raw `borderRadius: 7` in AdminShell logo mark
- Severity: **P2**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/widgets/admin-shell/ui/AdminShell.tsx:35`
- reason: `borderRadius: 7` is off-token (closest tokens: `--r-xs:4`, `--r-sm:8`). Visually close but not token-aligned.
- Suggested fix: `borderRadius: "var(--r-sm)"` (8px).

### F-DESIGN-006: `paddingBottom: 80` — off 8px-grid
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:78`
- reason: `paddingBottom: 80` is not a `--sp-*` token (closest: `--sp-10:40px`, `--sp-12:48px`). 80px is not in the token scale.
- Suggested fix: Use `pb-20` Tailwind (80px is available in default Tailwind scale but still bypasses token). Better: measure actual sticky-bar height and use `paddingBottom: "var(--sp-12)"` (48px) + adjust sticky bar height, or define a component-level constant.

### F-DESIGN-007: `gap: 14` — off 8px-grid
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:210`
- reason: `gap: 14` in `SettingsSection` field list is not on the 4px/8px grid (valid values: 12=`--sp-3`, 16=`--sp-4`).
- Suggested fix: `gap: "var(--sp-3)"` (12px) or `gap: "var(--sp-4)"` (16px).

### F-DESIGN-008: `marginBottom: 6` — off 4px-grid
- Severity: **P2**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/m-help/index.tsx:99`
- reason: `marginBottom: 6` for manual link list items is not a token value (grid values: 4=`--sp-1`, 8=`--sp-2`).
- Suggested fix: `marginBottom: "var(--sp-2)"` (8px).

### F-DESIGN-009: Raw `padding: "10px 16px"` / `"10px 20px"` — off 8px-grid
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:163, 180`
- reason: Save/reset button padding uses 10px vertical, which is off the 4/8px grid (grid values: 8=`--sp-2`, 12=`--sp-3`). The shared `<Button>` component uses Tailwind height classes (`h-9`, `h-11`) which correctly align to grid.
- Suggested fix: Replace raw `<button>` elements with the shared `<Button variant="secondary" size="sm">` and `<Button variant="primary" size="sm">` components which already have correct token-aligned sizing and focus rings.

---

## Accessibility findings

### F-DESIGN-010: Missing `focus-visible` on sticky save/reset buttons (P0)
- Severity: **P0**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:158-192`
- reason: The sticky action bar buttons are raw `<button>` elements with only `cursor` styling. There is **no** `focus-visible` ring class. Keyboard users cannot see focus on the primary save action — WCAG 2.4.7 violation (focus visible).
- Suggested fix: Replace with shared `<Button>` (which has `focus-visible:ring-2 focus-visible:ring-brand/40`) OR add `className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"`.

### F-DESIGN-011: Missing `focus-visible` on FAQ accordion button in m-help (P0)
- Severity: **P0**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/m-help/index.tsx:41-51`
- reason: The FAQ toggle `<button>` uses `className="w-full flex items-center gap-2 text-left"` with no focus ring class. `border: "none"` removes the native outline. Keyboard navigation through FAQ items will have no visible focus indicator — WCAG 2.4.7 violation.
- Suggested fix: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand` to the button className.

### F-DESIGN-012: Missing `focus-visible` on inline `<input>` elements in AdminSettingsPage (P0)
- Severity: **P0**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:246-261, 293-308, 329-348`
- reason: The local `TextField`, `ColorField` text input, and `SelectField` use raw `<input>` and `<select>` with only border styling. No `focus-visible` or `focus:ring` is applied. Browser default outline may be suppressed. Compare with `shared/ui/TextField` which correctly applies `focus-visible:ring-2 focus-visible:ring-brand`.
- Suggested fix: Either use the shared `<TextField>` component, or add the same focus classes to the local implementations.

### F-DESIGN-013: Native `<input type="checkbox">` used without custom accessible toggle in ToggleField (P1)
- Severity: **P1**
- owner: designer
- change_type: spec
- reason: `ToggleField` uses a browser-default `<input type="checkbox">` at 16×16px. The design system calls for a Switch/Toggle component (`--r-pill`, 44×44 hit-target on mobile). No Switch component currently exists in `apps/web/src/shared/ui/`. This is a spec gap — the component needs to be added to the design system.
- Suggested fix: designer to define Switch component spec (anatomy, states, tokens); dev to implement using token-aligned `<button role="switch" aria-checked={...}>` wrapper with `--r-pill` radius.

### F-DESIGN-014: `aria-label` for AdminNav uses dashboard label string for nav landmark (P1)
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/widgets/admin-shell/ui/AdminNav.tsx:27`
- reason: `aria-label={t("admin.nav_dashboard")}` passes the "대시보드" translation key to the `<nav>` landmark. This makes the nav read as "대시보드 navigation" to screen readers, which is misleading — it's the entire admin navigation, not just dashboard. Should be `t("admin.nav_aria_label")` or a literal `"관리자 메뉴"`.
- Suggested fix: Add a dedicated i18n key `admin.nav_aria_label` = "관리자 메뉴" and use it; also add the key to the translation files.

### F-DESIGN-015: Missing `aria-expanded` on FAQ accordion button (P1)
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/m-help/index.tsx:41-51`
- reason: The FAQ toggle button lacks `aria-expanded={isOpen}` and `aria-controls`. Screen readers cannot tell users that the button controls a collapsible section — WCAG 4.1.2 violation.
- Suggested fix: Add `aria-expanded={isOpen}` to the `<button>` and `id` / `aria-controls` to link button and panel.

---

## Responsive findings

### F-DESIGN-016: FAQ button hit-target < 44px on mobile (P0)
- Severity: **P0**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/m-help/index.tsx:45-46`
- reason: The FAQ `<button>` uses `padding: 16` (all sides). Vertical height = text (14px) + 32px padding = ~46px. Horizontal is `w-full` so it's fine. However, the chevron icon `<Icon.chevD width={16} height={16}>` adjacent to the text is 16×16 and is part of the same button — the button itself is full-width so the composite hit-target is acceptable. **However**, manual link `<a>` tags in the manual list use only `marginBottom: 6` with no explicit height — their line height is ~20px, which is well under 44px touch target for a mobile-first page.
- Suggested fix: Add `display: "block"` + `minHeight: 44` (or `py-3`) to each `<a>` in the manual links list.

### F-DESIGN-017: `fontSize: 11` is below minimum type scale (P1)
- Severity: **P1**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/m-help/index.tsx:111`
- reason: `<span style={{ color: "var(--grey-500)", fontSize: 11 }}>` renders the external link indicator at 11px. The design system minimum is `.t-caption` at 12px. 11px text fails WCAG 1.4.4 readability on small screens and is below the type scale floor.
- Suggested fix: Change to `fontSize: 12` (`var(--sp-3)` is spacing, use `text-[12px]` or `.t-caption` class).

---

## i18n / overflow findings

### F-DESIGN-018: Fixed-typography labels in `Field` without overflow protection (P2)
- Severity: **P2**
- owner: dev
- change_type: impl
- target_file: `apps/web/src/pages/admin-settings/index.tsx:215-226`
- reason: `Field` uses `justifyContent: "space-between"` with label + value. Long Korean labels (e.g., `admin.settings_fiscal_year` → "회계연도 시작 월") combined with a long value string may wrap in narrow admin columns. Neither label nor value has `maxWidth`, `overflow: "hidden"`, or `textOverflow: "ellipsis"`.
- Suggested fix: Add `maxWidth: "45%"` + `overflow: "hidden"` + `textOverflow: "ellipsis"` + `whiteSpace: "nowrap"` to both `<span>` elements, or switch to a column layout for narrow viewports.

---

## iter11 신규 화면 (집중)

### AdminSettingsPage (`apps/web/src/pages/admin-settings/index.tsx`)

**Typography**: Entire file uses `text-[Npx]` Tailwind arbitrary values (`text-[24px]`, `text-[14px]`, `text-[13px]`, `text-[12px]`) and `fontSize: 13` inline styles throughout. None use the design system `.t-*` class or Tailwind semantic aliases. **Count: 15+ violations** (all covered under general token violation pattern — grouped as P1 impl).

**Sticky save bar**: Uses `background: "linear-gradient(to top, var(--grey-50), transparent)"`. While it uses token colors in the gradient, gradients in functional UI elements are noted as a caution by the design system principle "절제가 곧 신뢰 — 그라데이션 금지". This applies to decorative gradients; a functional fade-to-transparent for scroll affordance may be acceptable, but should be reviewed vs. a simple solid `background: "var(--grey-50)"`.

**Components bypass shared UI**: All form controls (`TextField`, `ColorField`, `SelectField`, `ToggleField`) are local implementations that bypass `shared/ui/TextField`, `shared/ui/Button`. This caused the cascade of focus-ring, border-radius, and spacing violations above.

### m-help (`apps/web/src/pages/m-help/index.tsx`)

**Good**: Uses `var(--brand)`, `var(--grey-*)`, motion tokens (`var(--motion-fast)`, `var(--ease-standard)`) for chevron rotation. i18n keys throughout. `SubHeader` widget used.

**Violations**: No focus-visible on FAQ button (F-DESIGN-011), no aria-expanded (F-DESIGN-015), manual link hit-target too small (F-DESIGN-016), `fontSize: 11` below scale floor (F-DESIGN-017), `marginBottom: 6` off-grid (F-DESIGN-008).

### AdminNav (`apps/web/src/widgets/admin-shell/ui/AdminNav.tsx`)

**Positive**: "설정" item correctly re-added at line 24. Has `focus-visible:ring-2 focus-visible:ring-brand` on NavLink — focus ring present.

**Icon violation (P1)**: All three last items — `codes`, `compliance`, `settings` — share `Icon.lock`. "설정" (settings) should use `Icon.settings` which exists in the Icon set. Using lock for settings is semantically wrong and visually confusing to users.

```
F-DESIGN-019: AdminNav "설정" icon wrong (P1)
owner: dev | change_type: impl
target_file: apps/web/src/widgets/admin-shell/ui/AdminNav.tsx:24
reason: { to: "/admin/settings", icon: <Icon.lock ...> } — settings nav item uses the lock icon
  instead of Icon.settings. Icon.settings (gear) is already defined in Icon.tsx:41-45.
Suggested fix: change to <Icon.settings width={17} height={17} />
```

---

## Summary

**Total findings: 19 (P0: 4 / P1: 11 / P2: 4)**

| Severity | Count |
|---|---|
| P0 (a11y critical) | 4 |
| P1 (token / consistency / a11y) | 11 |
| P2 (improvement) | 4 |

| Owner | Count |
|---|---|
| owner: dev (change_type: impl) | 18 |
| owner: designer (change_type: spec) | 1 (F-DESIGN-013 — Switch component missing from design system) |

**Top 3 violation categories**:
1. **Focus ring missing** — 3 interactive surfaces (save/reset buttons, FAQ button, inline inputs) have no `focus-visible` styling (F-DESIGN-010, 011, 012) — all P0
2. **Raw typography values** — 15+ instances of `text-[Npx]` / `fontSize: N` inline styles bypassing the `.t-*` type scale (aggregated under F-DESIGN-002 pattern, reported individually as P1)
3. **Off-token/off-grid radius and spacing** — `borderRadius: 6`, `borderRadius: 7`, `gap: 14`, `marginBottom: 6`, `padding: "10px"` across 7 findings (F-DESIGN-003–009)

**iter11 신규 화면 위반 요약**:
- `AdminSettingsPage`: 14 violations — all form controls bypass shared UI components, causing cascading focus, radius, spacing, and color token violations. Sticky bar gradient borderline violation. Typography entirely hardcoded.
- `m-help`: 5 violations — focus ring, aria-expanded, hit-target (link), fontSize 11, off-grid margin. Token usage is otherwise good.
- `AdminNav`: 1 violation — settings icon uses lock instead of Icon.settings (semantic error).
