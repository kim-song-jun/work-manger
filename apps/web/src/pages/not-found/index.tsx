import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useMe } from "@shared/lib/me";

/**
 * Replaces the legacy `<Navigate to="/login">` wildcard. Authenticated users
 * see "Go home" → /m/home; signed-out users see "Log in" → /login. Avoids the
 * "I look logged out" UX trap on typo'd URLs (GAP-D, audited 2026-05-07).
 */
export function NotFoundPage() {
  const { t } = useTranslation();
  const me = useMe();
  const location = useLocation();
  const authed = !!me.data?.id;

  return (
    <main
      role="main"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        background: "var(--grey-50, #fafafa)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "var(--grey-300, #d4d4d4)",
          letterSpacing: -2,
          marginBottom: 8,
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "var(--grey-900, #1a1a1a)",
          marginBottom: 6,
        }}
      >
        {t("common.notfound_title")}
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "var(--grey-500, #737373)",
          marginBottom: 20,
          maxWidth: 360,
        }}
      >
        {t("common.notfound_sub")}
      </p>
      <code
        style={{
          fontSize: 12,
          color: "var(--grey-400, #a3a3a3)",
          marginBottom: 24,
          fontFamily: "monospace",
          maxWidth: "100%",
          overflowWrap: "anywhere",
        }}
      >
        {location.pathname}
      </code>
      <Link
        to={authed ? "/m/home" : "/login"}
        style={{
          minHeight: 44,
          padding: "0 20px",
          display: "inline-flex",
          alignItems: "center",
          background: "var(--brand, #3182f6)",
          color: "#fff",
          borderRadius: "var(--r-sm, 8px)",
          fontSize: 14,
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        {authed ? t("common.notfound_go_home") : t("common.notfound_go_login")}
      </Link>
    </main>
  );
}
