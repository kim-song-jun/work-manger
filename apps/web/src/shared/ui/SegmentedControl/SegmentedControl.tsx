import type { KeyboardEvent } from "react";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const idx = options.findIndex((o) => o.value === value);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    // WAI-ARIA tab pattern: arrows cycle, Home/End jump, Enter/Space activate.
    if (options.length === 0) return;
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      next = (idx + 1) % options.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      next = (idx - 1 + options.length) % options.length;
    } else if (e.key === "Home") {
      next = 0;
    } else if (e.key === "End") {
      next = options.length - 1;
    } else if (e.key === "Enter" || e.key === " ") {
      // Space/Enter activate; native button click already handles this but
      // we intercept to keep parity with the arrow flow when focus is moved
      // programmatically by the parent.
      e.preventDefault();
      onChange(options[idx]?.value ?? options[0].value);
      return;
    } else {
      return;
    }
    e.preventDefault();
    const target = options[next];
    if (target) onChange(target.value);
  }

  return (
    <div
      role="tablist"
      className="flex"
      style={{
        background: "var(--grey-100)",
        borderRadius: "var(--r-sm)",
        padding: 2,
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={onKeyDown}
            onClick={() => onChange(o.value)}
            type="button"
            className={[
              "flex-1 h-9 text-[13px] font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            ].join(" ")}
            style={{
              background: active ? "var(--white)" : "transparent",
              color: active ? "var(--grey-900)" : "var(--grey-500)",
              borderRadius: 6,
              boxShadow: active ? "var(--shadow-1)" : undefined,
              border: "none",
              cursor: "pointer",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
