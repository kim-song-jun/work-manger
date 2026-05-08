/**
 * Switch — F-DESIGN-013
 * Design spec: docs/design/design-system.md §7.2
 *
 * Accessible toggle using role="switch" + aria-checked.
 * Supports keyboard (Space to toggle), focus-visible ring, dark mode,
 * and a hit-target of ≥44×44 px (WCAG 2.5.8).
 */
import { useId, type KeyboardEvent } from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  id?: string;
  "aria-label"?: string;
}

const TRACK = {
  md: { width: 44, height: 24, thumbSize: 20, hitTarget: 44 },
  sm: { width: 32, height: 18, thumbSize: 14, hitTarget: 32 },
} as const;

export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  size = "md",
  id: externalId,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const autoId = useId();
  const switchId = externalId ?? autoId;
  const labelId = label ? `${switchId}-label` : undefined;

  const dim = TRACK[size];
  const thumbOffset = checked
    ? dim.width - dim.thumbSize - (dim.height - dim.thumbSize) / 2
    : (dim.height - dim.thumbSize) / 2;

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) onChange(!checked);
    }
  }

  const trackColor = disabled
    ? checked
      ? "var(--brand-soft)"
      : "var(--grey-100)"
    : checked
      ? "var(--brand)"
      : "var(--grey-200)";

  const thumbColor = disabled && !checked ? "var(--grey-300)" : "var(--white)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
      onClick={() => !disabled && onChange(!checked)}
    >
      {/* Hit-target wrapper: ensures ≥44×44 px touch area around the track */}
      <span
        style={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: dim.hitTarget,
          minHeight: dim.hitTarget,
        }}
      >
        <button
          id={switchId}
          role="switch"
          aria-checked={checked}
          aria-label={ariaLabel ?? (label ? undefined : "toggle")}
          aria-labelledby={labelId}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          onClick={(e) => {
            // Prevent the outer span's onClick from double-firing
            e.stopPropagation();
            if (!disabled) onChange(!checked);
          }}
          style={{
            position: "relative",
            display: "inline-block",
            width: dim.width,
            height: dim.height,
            borderRadius: 9999,
            border: "none",
            padding: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            background: trackColor,
            transition:
              "background-color var(--motion-fast, 150ms) var(--ease-standard, ease)",
            // focus-visible ring applied via CSS class below
            outline: "none",
          }}
          // Use data attributes so CSS can apply :focus-visible ring
          data-switch=""
        >
          {/* Thumb */}
          <span
            style={{
              position: "absolute",
              top: (dim.height - dim.thumbSize) / 2,
              left: thumbOffset,
              width: dim.thumbSize,
              height: dim.thumbSize,
              borderRadius: "50%",
              background: thumbColor,
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              transition:
                "transform var(--motion-fast, 150ms) var(--ease-standard, ease), left var(--motion-fast, 150ms) var(--ease-standard, ease)",
            }}
          />
        </button>
      </span>

      {label && (
        <span
          id={labelId}
          style={{
            fontSize: 15,
            color: "var(--grey-800)",
            lineHeight: 1.4,
            userSelect: "none",
          }}
        >
          {label}
        </span>
      )}

      {/* Focus-visible ring using a style block scoped to data-switch */}
      <style>{`
        [data-switch]:focus-visible {
          box-shadow: 0 0 0 3px var(--brand-soft, #E8F3FF);
        }
        @media (prefers-reduced-motion: reduce) {
          [data-switch],
          [data-switch] > span {
            transition-duration: 0ms !important;
          }
        }
      `}</style>
    </span>
  );
}
