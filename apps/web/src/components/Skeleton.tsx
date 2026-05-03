import type { CSSProperties } from "react";

type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: CSSProperties;
  className?: string;
};

export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
  className = "",
}: Props) {
  return (
    <div
      className={`wm-skeleton ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
