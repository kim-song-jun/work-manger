import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, Skeleton } from "@shared/ui";
import { fetchInvoices, fetchSubscription } from "@entities/billing";

/**
 * F-OWNER-07 (iter13 T6 SKELETON) — Owner-only billing overview.
 *
 * Displays the current subscription (plan + status) and an invoice
 * history table. The "Change plan" CTA is intentionally disabled
 * with a tooltip pointing to iter14 (Stripe integration).
 *
 * Data flow:
 *   - GET /v1/billing/subscription — single object, 404 → null/CTA state
 *   - GET /v1/billing/invoices — array, newest first
 */
export function OwnerBillingPage() {
  const { t } = useTranslation();

  const subQuery = useQuery({
    queryKey: ["owner-billing-subscription"],
    queryFn: fetchSubscription,
    staleTime: 60_000,
  });

  const invQuery = useQuery({
    queryKey: ["owner-billing-invoices"],
    queryFn: fetchInvoices,
    staleTime: 60_000,
  });

  const sub = subQuery.data ?? null;
  const invoices = invQuery.data ?? [];
  const subLoading = subQuery.isLoading;
  const invLoading = invQuery.isLoading;

  return (
    <div>
      <h1 className="text-[24px] font-bold m-0 mb-1">{t("owner.billing.title")}</h1>
      <div className="text-[13px] mb-4" style={{ color: "var(--grey-600)" }}>
        {t("owner.billing.subtitle")}
      </div>

      {/* Current plan card */}
      <Card padding={20}>
        {subLoading ? (
          <>
            <Skeleton height={16} width="40%" />
            <div className="mt-2">
              <Skeleton height={28} width="60%" />
            </div>
          </>
        ) : sub === null ? (
          <div style={{ color: "var(--grey-600)" }} className="text-[14px]">
            {t("owner.billing.no_subscription")}
          </div>
        ) : (
          <>
            <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
              {t("owner.billing.current_plan")}
            </div>
            <div
              className="mt-1"
              style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}
            >
              <div className="text-[20px] font-bold">{sub.plan.name}</div>
              <div className="text-[15px]" style={{ color: "var(--grey-700)" }}>
                ₩{sub.plan.price_monthly_krw.toLocaleString("ko-KR")}
                {" / "}
                {t("owner.billing.month")}
              </div>
              <span
                className="text-[11px]"
                style={{
                  padding: "3px 8px",
                  borderRadius: "var(--r-pill)",
                  background:
                    sub.status === "ACTIVE"
                      ? "var(--success-50, #e6f7e6)"
                      : sub.status === "PAST_DUE"
                        ? "var(--danger-50, #fde8e8)"
                        : "var(--grey-100)",
                  color:
                    sub.status === "ACTIVE"
                      ? "var(--success, #1f7a1f)"
                      : sub.status === "PAST_DUE"
                        ? "var(--danger)"
                        : "var(--grey-700)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {t(`owner.billing.status_${sub.status.toLowerCase()}`)}
              </span>
            </div>
            <div className="text-[12px] mt-3" style={{ color: "var(--grey-500)" }}>
              {sub.current_period_end
                ? `${t("owner.billing.period_end")} · ${sub.current_period_end.slice(0, 10)}`
                : null}
            </div>
            <div className="mt-4">
              <button
                type="button"
                disabled
                title={t("owner.billing.change_plan_tooltip")}
                style={{
                  padding: "10px 16px",
                  minHeight: 40,
                  fontSize: 13,
                  fontWeight: 600,
                  background: "var(--grey-200)",
                  color: "var(--grey-500)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  cursor: "not-allowed",
                }}
              >
                {t("owner.billing.change_plan")}
              </button>
            </div>
          </>
        )}
      </Card>

      {/* Invoice history */}
      <h2 className="text-[15px] font-bold mt-7 mb-3">
        {t("owner.billing.invoice_history")}
      </h2>
      {invLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : invoices.length === 0 ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("owner.billing.no_invoices")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--grey-50)" }}>
              <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>{t("owner.billing.col_issued_at")}</th>
                <th style={{ padding: "12px 16px" }}>{t("owner.billing.col_amount")}</th>
                <th style={{ padding: "12px 16px" }}>{t("owner.billing.col_status")}</th>
                <th style={{ padding: "12px 16px" }}>{t("owner.billing.col_pdf")}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px" }}>{inv.issued_at.slice(0, 10)}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                    ₩{inv.amount_krw.toLocaleString("ko-KR")}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {t(`owner.billing.invoice_status_${inv.status.toLowerCase()}`)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {inv.pdf_url ? (
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--brand)", textDecoration: "underline" }}
                      >
                        {t("owner.billing.download_pdf")}
                      </a>
                    ) : (
                      <span style={{ color: "var(--grey-400)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
