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
            onClick={() => onChange(o.value)}
            type="button"
            className="flex-1 h-9 text-[13px] font-semibold transition-colors"
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
