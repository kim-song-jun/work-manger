type Props = { step: number; total?: number };

export function OnbProgress({ step, total = 6 }: Props) {
  return (
    <div className="flex gap-1 px-6 pt-5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            background: i < step ? "var(--brand)" : "var(--grey-200)",
            transition: "background var(--motion-standard) var(--ease-standard)",
          }}
        />
      ))}
    </div>
  );
}
