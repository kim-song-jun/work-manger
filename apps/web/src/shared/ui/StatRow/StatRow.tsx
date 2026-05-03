type Item = { label: string; value: string };

type Props = {
  items: Item[];
  variant?: "default" | "inverse";
};

export function StatRow({ items, variant = "default" }: Props) {
  const labelColor =
    variant === "inverse" ? "rgba(255,255,255,0.7)" : "var(--grey-500)";
  const valueColor = variant === "inverse" ? "#fff" : "var(--grey-900)";
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <div className="text-[12px]" style={{ color: labelColor }}>
            {it.label}
          </div>
          <div
            className="num-tab text-[14px] font-semibold mt-1"
            style={{ color: valueColor }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}
