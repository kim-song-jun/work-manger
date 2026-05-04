import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Card, Skeleton, TextField } from "@shared/ui";
import { fetchAudit, type AuditFilters } from "@entities/audit";

export function AdminAuditPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AuditFilters>({});
  const [draft, setDraft] = useState<AuditFilters>({});

  const q = useInfiniteQuery({
    queryKey: ["admin-audit", filters],
    queryFn: ({ pageParam }) => fetchAudit(filters, pageParam ?? null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.next_cursor,
  });

  const items = (q.data?.pages ?? []).flatMap((p) => p.items);

  return (
    <div>
      <h1 className="text-[24px] font-bold m-0 mb-4">{t("admin.audit_title")}</h1>

      <div
        className="flex flex-wrap items-end gap-3 mb-4"
        style={{
          background: "var(--white)",
          padding: 14,
          borderRadius: "var(--r-md)",
          border: "1px solid var(--grey-200)",
        }}
      >
        <div style={{ flex: "1 1 160px" }}>
          <TextField
            label={t("admin.audit_filter_action")}
            value={draft.action ?? ""}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
          />
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <TextField
            label={t("admin.audit_filter_actor")}
            value={draft.actor ?? ""}
            onChange={(e) => setDraft({ ...draft, actor: e.target.value })}
          />
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <TextField
            label={t("admin.audit_filter_from")}
            type="date"
            value={draft.from ?? ""}
            onChange={(e) => setDraft({ ...draft, from: e.target.value })}
          />
        </div>
        <div style={{ flex: "1 1 160px" }}>
          <TextField
            label={t("admin.audit_filter_to")}
            type="date"
            value={draft.to ?? ""}
            onChange={(e) => setDraft({ ...draft, to: e.target.value })}
          />
        </div>
        <Button type="button" onClick={() => setFilters(draft)}>
          {t("admin.audit_apply")}
        </Button>
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : items.length === 0 ? (
        <Card padding={20}>
          <div className="text-center text-[14px]" style={{ color: "var(--grey-600)" }}>
            {t("admin.audit_empty")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "var(--grey-50)" }}>
              <tr style={{ textAlign: "left", color: "var(--grey-600)", fontWeight: 600 }}>
                <th style={{ padding: "12px 16px" }}>{t("admin.audit_col_at")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.audit_col_actor")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.audit_col_action")}</th>
                <th style={{ padding: "12px 16px" }}>{t("admin.audit_col_target")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid var(--grey-100)" }}>
                  <td style={{ padding: "12px 16px", fontFamily: "var(--font-mono)" }}>
                    {row.at}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{row.actor_name ?? row.actor}</td>
                  <td style={{ padding: "12px 16px" }}>{row.action}</td>
                  <td style={{ padding: "12px 16px" }}>{row.target ?? row.target_id ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {q.hasNextPage && (
        <div className="mt-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => q.fetchNextPage()}
            disabled={q.isFetchingNextPage}
          >
            {t("admin.audit_load_more")}
          </Button>
        </div>
      )}
    </div>
  );
}
