import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, Skeleton, useToast } from "@shared/ui";
import { fetchCompanyCodes, revokeCompanyCode } from "@entities/company-code";
import { IssueCodeForm } from "@features/admin-issue-code";

export function AdminCodesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["admin-company-codes"],
    queryFn: fetchCompanyCodes,
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeCompanyCode(id),
    onSuccess: () => {
      toast.show(t("admin.emp_save_success"));
      qc.invalidateQueries({ queryKey: ["admin-company-codes"] });
    },
    onError: () => toast.show(t("admin.common_error")),
  });

  const codes = q.data ?? [];

  return (
    <div>
      <h1 className="text-[24px] font-bold m-0 mb-4">{t("admin.code_title")}</h1>

      <div className="mb-4">
        <IssueCodeForm />
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : codes.length === 0 ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("admin.code_empty")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--grey-50)" }}>
              <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>{t("admin.code_col_code")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.code_col_uses")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.code_col_expires")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.code_col_status")}</th>
                <th style={{ padding: "12px 16px" }} />
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {c.code}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {c.used_count ?? 0}
                    {c.max_uses ? ` / ${c.max_uses}` : ""}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{c.expires_at ?? "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {c.revoked
                      ? t("admin.code_status_revoked")
                      : t("admin.code_status_active")}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {!c.revoked && (
                      <button
                        type="button"
                        onClick={() => revoke.mutate(c.id)}
                        disabled={revoke.isPending}
                        className="text-[13px] font-semibold"
                        style={{
                          minHeight: 32,
                          padding: "6px 0",
                          color: "var(--danger)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        {t("admin.code_revoke")}
                      </button>
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
