import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, PageHeader, SegmentedControl, Skeleton } from "@shared/ui";
import { fetchInbox } from "@entities/inbox";
import type { InboxItem, InboxTargetType } from "@entities/inbox";
import { InboxQuickActions } from "@features/inbox-decide";

type Tab = "to-approve" | "mine" | "system";

const KIND_COLORS: Record<
  InboxTargetType | "OTHER",
  { fg: string; bg: string; label_key: string }
> = {
  OVERTIME: {
    fg: "var(--warn, #E59700)",
    bg: "var(--warn-soft, #FFF4D6)",
    label_key: "mobile.inbox.kind_overtime",
  },
  LEAVE: { fg: "var(--brand)", bg: "var(--brand-soft)", label_key: "mobile.inbox.kind_leave" },
  MANUAL_CLOCK_IN: {
    fg: "var(--grey-700)",
    bg: "var(--grey-100)",
    label_key: "mobile.inbox.kind_manual_clock_in",
  },
  TRIP: {
    fg: "var(--grey-700)",
    bg: "var(--grey-100)",
    label_key: "mobile.inbox.kind_trip",
  },
  OTHER: { fg: "var(--grey-700)", bg: "var(--grey-100)", label_key: "mobile.inbox.kind_outwork" },
};

function targetTypeOf(it: InboxItem): InboxTargetType | "OTHER" {
  // BE payload uses `target_type`. Legacy fixtures may set `kind` only.
  const tt = (it.target_type ?? (it.kind as InboxTargetType | undefined)) ?? "OTHER";
  if (tt === "LEAVE" || tt === "OVERTIME" || tt === "MANUAL_CLOCK_IN" || tt === "TRIP") return tt;
  return "OTHER";
}

function requesterName(it: InboxItem): string {
  return it.requester_name ?? it.requester?.name ?? "";
}

function summaryReason(it: InboxItem): string | null {
  if (it.reason) return it.reason;
  const s = it.summary as Record<string, unknown> | null | undefined;
  if (s && typeof s === "object" && "reason" in s) {
    const r = (s as { reason?: unknown }).reason;
    return typeof r === "string" ? r : null;
  }
  return null;
}

export function InboxPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("to-approve");
  const q = useQuery({ queryKey: ["inbox"], queryFn: () => fetchInbox() });

  const items: InboxItem[] = useMemo(() => q.data?.items ?? [], [q.data?.items]);
  const filtered = useMemo(() => {
    if (tab === "to-approve") return items.filter((i) => i.status === "PENDING");
    if (tab === "mine") return items.filter((i) => i.status === "APPROVED" || i.role === "mine");
    return items.filter((i) => i.status === "REJECTED" || i.role === "info");
  }, [items, tab]);

  return (
    <>
      <PageHeader title={t("mobile.inbox.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: "to-approve", label: t("mobile.inbox.tab_to_approve") },
            { value: "mine", label: t("mobile.inbox.tab_mine") },
            { value: "system", label: t("mobile.inbox.tab_system") },
          ]}
        />
        <div className="flex flex-col gap-2 mt-3">
          {q.isLoading && <Skeleton height={92} />}
          {!q.isLoading && filtered.length === 0 && (
            <Card padding={20}>
              <div className="text-[14px] text-center" style={{ color: "var(--grey-600)" }}>
                {t("mobile.inbox.empty")}
              </div>
            </Card>
          )}
          {filtered.map((it) => {
            const tt = targetTypeOf(it);
            const km = KIND_COLORS[tt];
            const name = requesterName(it);
            const reason = summaryReason(it);
            // E2E hooks are consumed by apps/e2e/specs/{inbox-approve,realtime}.spec.ts.
            // See apps/e2e/README.md "FE testids" for the full list.
            return (
              <div
                key={it.id}
                data-testid="inbox-item"
                data-inbox-item-id={it.id}
              >
                <Card padding={14}>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-bold"
                      style={{
                        color: km.fg,
                        background: km.bg,
                        padding: "3px 8px",
                        borderRadius: "var(--r-xs, 6px)",
                      }}
                    >
                      {t(km.label_key)}
                    </span>
                    {it.urgent && (
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          color: "#fff",
                          background: "var(--warn, #E59700)",
                          padding: "3px 7px",
                          borderRadius: 999,
                        }}
                      >
                        URGENT
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => nav(`/m/inbox/${it.id}`)}
                    className="text-left mt-2 w-full"
                    style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <div className="text-[14px] font-bold" style={{ color: "var(--grey-900)" }}>
                      {name ? `${name} · ` : ""}
                      <span style={{ fontWeight: 500, color: "var(--grey-700)" }}>
                        {it.title ?? t(km.label_key)}
                      </span>
                    </div>
                    {reason && (
                      <div className="text-[12px] mt-1" style={{ color: "var(--grey-500)" }}>
                        {reason}
                      </div>
                    )}
                  </button>
                  {it.status === "PENDING" && <InboxQuickActions itemId={it.id} />}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
