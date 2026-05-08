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
  const [failedBanner, setFailedBanner] = useState<{
    succeeded: number;
    total: number;
    failed: number;
  } | null>(null);

  const q = useQuery({
    queryKey: ["admin-approvals", status],
    queryFn: () => fetchApprovals(status),
  });

  const rows: ApprovalRow[] = useMemo(() => q.data ?? [], [q.data]);

  const m = useMutation({
    mutationFn: (decision: "approve" | "reject") =>
      batchDecide(Array.from(selected), decision),
    onSuccess: (out) => {
      if (out.failed > 0) {
        // Show inline banner for partial failures (F-ADMIN-04)
        setFailedBanner({ succeeded: out.succeeded, total: out.total, failed: out.failed });
        toast.show(
          t("admin.appr_partial_fail", {
            succeeded: out.succeeded,
            total: out.total,
            failed: out.failed,
          }),
        );
      } else {
        toast.show(`${out.succeeded}/${out.total}`);
        setFailedBanner(null);
      }
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

      {/* F-ADMIN-04: inline banner for partial failures */}
      {failedBanner && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--sp-3) var(--sp-4)",
            marginBottom: "var(--sp-3)",
            background: "var(--warn-soft)",
            border: "1px solid var(--warn)",
            borderRadius: "var(--r-sm)",
            fontSize: 13,
            color: "var(--grey-900)",
          }}
        >
          <span>
            {t("admin.appr_partial_fail", {
              succeeded: failedBanner.succeeded,
              total: failedBanner.total,
              failed: failedBanner.failed,
            })}
          </span>
          <button
            type="button"
            onClick={() => setFailedBanner(null)}
            aria-label={t("admin.common_cancel")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "var(--sp-1)",
              color: "var(--grey-700)",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

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
                style={{ width: 24, height: 24, cursor: "pointer" }}
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
                  style={{ width: 24, height: 24, cursor: "pointer", flex: "0 0 auto" }}
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
