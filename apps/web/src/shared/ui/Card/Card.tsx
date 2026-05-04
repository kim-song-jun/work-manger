import type { CSSProperties, ReactNode, MouseEvent, KeyboardEvent } from "react";

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

  // Clickable Card → expose as a button so keyboard users can activate it.
  function onKey(e: KeyboardEvent<HTMLDivElement>): void {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(e as unknown as MouseEvent<HTMLDivElement>);
    }
  }

  const cls = [
    className,
    onClick ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onClick={onClick}
      onKeyDown={onClick ? onKey : undefined}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={base}
    >
      {children}
    </div>
  );
}
