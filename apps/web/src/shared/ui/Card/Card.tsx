import type { CSSProperties, ReactNode, MouseEvent } from "react";

type Variant = "plain" | "elevated" | "subtle" | "flat";

type Props = {
  children: ReactNode;
  padding?: number | string;
  variant?: Variant;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  style?: CSSProperties;
  className?: string;
};

export function Card({
  children,
  padding = 16,
  variant = "plain",
  onClick,
  style,
  className = "",
}: Props) {
  const base: CSSProperties = {
    background: "var(--white)",
    borderRadius: variant === "elevated" ? "var(--r-lg)" : "var(--r-md)",
    boxShadow:
      variant === "elevated"
        ? "var(--shadow-2)"
        : variant === "flat" || variant === "subtle"
          ? undefined
          : "var(--shadow-1)",
    border: variant === "flat" ? "1px solid var(--grey-200)" : undefined,
    padding,
    cursor: onClick ? "pointer" : undefined,
    ...(variant === "subtle"
      ? { background: "var(--grey-100)", boxShadow: "none" }
      : {}),
    ...style,
  };
  return (
    <div className={className} onClick={onClick} style={base}>
      {children}
    </div>
  );
}
