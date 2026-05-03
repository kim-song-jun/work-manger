import type { CSSProperties, ReactNode, MouseEvent } from "react";
import { Icon } from "./Icon";

type Props = {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode | "chevron" | "none";
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
  danger?: boolean;
  divider?: boolean;
  style?: CSSProperties;
};

export function ListRow({
  leading,
  title,
  subtitle,
  meta,
  trailing = "chevron",
  onClick,
  selected,
  danger,
  divider = true,
  style,
}: Props) {
  const trail =
    trailing === "chevron" ? (
      <Icon.chevR
        width={16}
        height={16}
        style={{ color: "var(--grey-400)", flexShrink: 0 }}
      />
    ) : trailing === "none" ? null : (
      trailing
    );

  const titleColor = selected
    ? "var(--brand)"
    : danger
      ? "var(--danger)"
      : "var(--grey-900)";

  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderBottom: divider ? "1px solid var(--grey-100)" : "none",
        background: selected ? "var(--brand-soft)" : "transparent",
        cursor: onClick ? "pointer" : undefined,
        transition: "background var(--motion-fast) var(--ease-standard)",
        ...style,
      }}
    >
      {leading && <div style={{ flexShrink: 0 }}>{leading}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="text-[14px] font-semibold leading-[22px]"
          style={{
            color: titleColor,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className="text-[12px] mt-0.5"
            style={{
              color: "var(--grey-500)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {meta && (
        <div className="num-tab text-[12px] text-ink-500" style={{ flexShrink: 0 }}>
          {meta}
        </div>
      )}
      {trail}
    </div>
  );
}
