import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Skeleton, useToast } from "@shared/ui";
import { fetchApprovals, type ApprovalRow, type ApprovalStatus } from "@entities/approval";
import { batchDecide, BulkActionBar } from "@features/admin-approve-batch";

const STATUS_TABS: ApprovalStatus[] = ["pending", "approved", "rejected"];

export function AdminApprovalsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = useQuery({
    queryKey: ["admin-approvals", status],
    queryFn: () => fetchApprovals(status),
  });

  const rows: ApprovalRow[] = useMemo(() => q.data ?? [], [q.data]);

  const m = useMutation({
    mutationFn: (decision: "approve" | "reject") =>
      batchDecide(Array.from(selected), decision),
    onSuccess: (out) => {
      toast.show(`${out.succeeded}/${out.total}`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ["admin-approvals"] });
    },
    onError: () => toast.show(t("admin.common_error")),
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === rows.length) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }

  const allChecked = rows.length > 0 && selected.size === rows.length;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h1 className="text-[24px] font-bold m-0">{t("admin.appr_title")}</h1>
        <div className="text-[13px] mt-1" style={{ color: "var(--grey-600)" }}>
          {t("admin.appr_sub")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginTop: 12,
          marginBottom: 14,
          borderBottom: "1px solid var(--grey-200)",
        }}
      >
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: status === s ? "var(--grey-900)" : "var(--grey-500)",
              borderBottom: status === s ? "2px solid var(--grey-900)" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t(`admin.appr_filter_${s}` as const)}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <BulkActionBar
          selectedCount={selected.size}
          onApprove={() => m.mutate("approve")}
          onReject={() => m.mutate("reject")}
          disabled={m.isPending}
        />
      </div>

      {q.isLoading ? (
        <Card padding={18}>
          <Skeleton height={20} />
        </Card>
      ) : rows.length === 0 ? (
        <Card padding={20}>
          <div
            className="text-[14px] text-center"
            style={{ color: "var(--grey-600)" }}
          >
            {t("admin.appr_empty")}
          </div>
        </Card>
      ) : (
        <Card padding={0} variant="flat">
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--grey-200)",
              fontSize: 13,
            }}
          >
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                aria-label={t("admin.appr_select_all")}
                checked={allChecked}
                onChange={toggleAll}
              />
              <span style={{ color: "var(--grey-600)" }}>
                {t("admin.appr_select_all")}
              </span>
            </label>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {rows.map((r) => (
              <li
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 16,
                  borderTop: "1px solid var(--grey-100)",
                }}
              >
                <input
                  type="checkbox"
                  aria-label={`select-${r.id}`}
                  checked={selected.has(r.id)}
                  onChange={() => toggle(r.id)}
                />
                <Avatar name={r.employee_name} size={36} />
                <div style={{ minWidth: 140 }}>
                  <div className="text-[14px] font-bold">{r.employee_name}</div>
                  <div className="text-[12px]" style={{ color: "var(--grey-500)" }}>
                    {r.team ?? ""}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold">
                    [{t(`admin.appr_kind_${r.kind}` as const)}] {r.summary}
                  </div>
                  {r.reason && (
                    <div
                      className="text-[12px] mt-1"
                      style={{ color: "var(--grey-500)" }}
                    >
                      {r.reason}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
