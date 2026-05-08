import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Icon } from "@shared/ui";

type Props = {
  title: ReactNode;
  action?: ReactNode;
  onBack?: () => void;
};

/** Compact app-bar for sub-pages: back chevron + title + optional action. */
export function SubHeader({ title, action, onBack }: Props) {
  const nav = useNavigate();
  const { t } = useTranslation();
  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{ height: 52, background: "var(--white)" }}
    >
      <button
        type="button"
        aria-label={t("mobile.back")}
        onClick={() => (onBack ? onBack() : nav(-1))}
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--r-sm)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--grey-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon.chevL width={22} height={22} />
      </button>
      <h1
        className="flex-1 text-[17px] font-bold m-0"
        style={{ color: "var(--grey-900)", letterSpacing: "-0.2px" }}
      >
        {title}
      </h1>
      {action}
    </div>
  );
}
