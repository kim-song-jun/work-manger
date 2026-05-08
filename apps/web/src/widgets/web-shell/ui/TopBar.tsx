import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Avatar, Icon } from "@shared/ui";
import { setAccessToken } from "@shared/api";
import { useAuthStore } from "@shared/lib/store/useAuthStore";
import { useMe } from "@entities/user";

import type { Breakpoint } from "../model/useViewport";

type Props = {
  bp: Breakpoint;
  onMenu: () => void;
};

export function TopBar({ bp, onMenu }: Props) {
  const { t } = useTranslation();
  const me = useMe();
  const nav = useNavigate();
  const reset = useAuthStore((s) => s.reset);
  const [open, setOpen] = useState(false);

  function logout() {
    setAccessToken(null);
    reset();
    nav("/login", { replace: true });
  }

  return (
    <header
      style={{
        height: 60,
        padding: "0 24px",
        flexShrink: 0,
        background: "var(--white)",
        borderBottom: "1px solid var(--grey-100)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {bp === "sm" && (
        <button
          type="button"
          aria-label={t("web.open_menu")}
          onClick={onMenu}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          style={{
            width: 36,
            height: 36,
            border: "none",
            background: "var(--grey-100)",
            borderRadius: 10,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon.filter width={18} height={18} aria-hidden />
        </button>
      )}
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--grey-900)",
        }}
      >
        {t("app.title")}
      </div>
      <div style={{ flex: 1 }} />
      <button
        type="button"
        aria-label={t("web.open_user")}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-full"
        style={{
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Avatar name={me.data?.name ?? me.data?.email ?? "?"} size={32} />
      </button>
      {open && (
        <div
          role="menu"
          onMouseLeave={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 56,
            right: 16,
            background: "var(--white)",
            borderRadius: "var(--r-md)",
            boxShadow: "var(--shadow-3)",
            padding: 6,
            zIndex: 50,
            minWidth: 160,
          }}
        >
          <button
            role="menuitem"
            onClick={logout}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              border: "none",
              background: "transparent",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--grey-800)",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            {t("web.logout")}
          </button>
        </div>
      )}
    </header>
  );
}
