/**
 * /m/compliance/block — full-screen warning shown when clock-in returns
 * 422 OVER_HOURS_LIMIT. Pure i18n + a single CTA back to home.
 */
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function ComplianceBlockPage() {
  const { t } = useTranslation();
  return (
    <div
      data-testid="m-compliance-block"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--danger-soft)",
        textAlign: "center",
      }}
    >
      <div
        aria-hidden
        style={{
          fontSize: 56,
          lineHeight: 1,
          marginBottom: 16,
        }}
      >
        {"!"}
      </div>
      <h1
        className="text-[22px] font-bold"
        style={{ color: "var(--danger)", marginBottom: 8 }}
      >
        {t("compliance.block_title")}
      </h1>
      <p
        className="text-[14px]"
        style={{ color: "var(--grey-700)", maxWidth: 320 }}
      >
        {t("compliance.block_sub")}
      </p>
      <Link
        to="/m/home"
        style={{
          marginTop: 24,
          padding: "12px 24px",
          borderRadius: "var(--r-md)",
          background: "var(--grey-900)",
          color: "var(--white)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        {t("compliance.block_close")}
      </Link>
    </div>
  );
}
