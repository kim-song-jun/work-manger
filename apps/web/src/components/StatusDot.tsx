import type { CSSProperties } from "react";

export type StatusKind = "office" | "wfh" | "leave" | "break" | "off";

const colorVar: Record<StatusKind, string> = {
  office: "var(--s-office)",
  wfh: "var(--s-wfh)",
  leave: "var(--s-leave)",
  break: "var(--s-break)",
  off: "var(--s-off)",
};

type Props = {
  status: StatusKind;
  size?: number;
  ring?: boolean;
  style?: CSSProperties;
};

export function StatusDot({ status, size = 8, ring, style }: Props) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: colorVar[status],
        flexShrink: 0,
        border: ring ? "2px solid var(--white)" : undefined,
        ...style,
      }}
    />
  );
}
