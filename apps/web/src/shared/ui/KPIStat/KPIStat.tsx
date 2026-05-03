type Size = "sm" | "md" | "lg" | "xl";

const numCls: Record<Size, string> = {
  sm: "text-[18px] font-bold leading-tight",
  md: "text-[22px] font-bold leading-tight",
  lg: "text-[30px] font-bold leading-tight",
  xl: "text-[40px] font-bold leading-tight",
};

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  delta?: string;
  deltaPositive?: boolean;
  color?: string;
  size?: Size;
};

export function KPIStat({
  label,
  value,
  unit,
  hint,
  delta,
  deltaPositive,
  color,
  size = "md",
}: Props) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="text-[12px] font-semibold text-ink-500">{label}</div>
      <div
        className={`num-tab ${numCls[size]} flex items-baseline gap-[3px]`}
        style={{ color: color ?? "var(--grey-900)" }}
      >
        <span>{value}</span>
        {unit && (
          <span className="text-[0.5em] font-semibold text-ink-500">{unit}</span>
        )}
      </div>
      {(delta || hint) && (
        <div className="flex items-center gap-1">
          {delta && (
            <span
              className="text-[12px] font-semibold"
              style={{ color: deltaPositive ? "var(--success)" : "var(--danger)" }}
            >
              {delta}
            </span>
          )}
          {hint && <span className="text-[12px] text-ink-500">{hint}</span>}
        </div>
      )}
    </div>
  );
}
