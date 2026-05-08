import type { ReactNode } from "react";

import { Icon } from "../Icon";

type Props = {
  date?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  hasBadge?: boolean;
  theme?: "light" | "dark";
};

export function PageHeader({
  date,
  title,
  subtitle,
  action,
  hasBadge,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  return (
    <div
      className="flex items-center gap-3 px-5 pt-2 pb-3"
      style={{ background: dark ? "var(--grey-900)" : "var(--grey-50)" }}
    >
      <div className="flex-1 min-w-0">
        {date && (
          <div
            className="text-[12px]"
            style={{ color: dark ? "rgba(255,255,255,0.6)" : "var(--grey-500)" }}
          >
            {date}
          </div>
        )}
        <h1
          className="text-[22px] font-bold leading-[30px] m-0 mt-0.5"
          style={{
            color: dark ? "#fff" : "var(--grey-900)",
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            className="text-[13px] mt-0.5"
            style={{ color: dark ? "rgba(255,255,255,0.7)" : "var(--grey-600)" }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {action !== undefined ? (
        action
      ) : (
        <div className="relative cursor-pointer">
          <Icon.bell
            width={24}
            height={24}
            style={{ color: dark ? "#fff" : "var(--grey-700)" }}
          />
          {hasBadge && (
            <span
              className="absolute"
              style={{
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                background: "var(--danger)",
                borderRadius: 999,
                border: `2px solid ${dark ? "var(--grey-900)" : "var(--grey-50)"}`,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
