import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, PageHeader, SegmentedControl, Skeleton } from "@shared/ui";
import { fetchInbox } from "@entities/inbox";
import type { InboxItem } from "@entities/inbox";
import { InboxQuickActions } from "@features/inbox-decide";

type Tab = "to-approve" | "mine" | "system";

const KIND_COLORS: Record<string, { fg: string; bg: string; label_key: string }> = {
  OVERTIME: { fg: "var(--warn, #E59700)", bg: "var(--warn-soft, #FFF4D6)", label_key: "mobile.inbox.kind_overtime" },
  LEAVE: { fg: "var(--brand)", bg: "var(--brand-soft)", label_key: "mobile.inbox.kind_leave" },
  WFH: { fg: "var(--brand)", bg: "var(--brand-soft)", label_key: "mobile.inbox.kind_wfh" },
  OTHER: { fg: "var(--grey-700)", bg: "var(--grey-100)", label_key: "mobile.inbox.kind_outwork" },
};

export function InboxPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("to-approve");
  const q = useQuery({ queryKey: ["inbox"], queryFn: () => fetchInbox() });

  const items: InboxItem[] = q.data?.items ?? [];
  const filtered = useMemo(() => {
    if (tab === "to-approve") return items.filter((i) => i.role === "approve");
    if (tab === "mine") return items.filter((i) => i.role === "mine");
    return items.filter((i) => i.role === "info");
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
            const km = KIND_COLORS[it.kind] ?? KIND_COLORS.OTHER;
            return (
              <Card key={it.id} padding={14}>
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
                    {it.requester?.name ? `${it.requester.name} · ` : ""}
                    <span style={{ fontWeight: 500, color: "var(--grey-700)" }}>{it.title}</span>
                  </div>
                  {it.reason && (
                    <div className="text-[12px] mt-1" style={{ color: "var(--grey-500)" }}>
                      {it.reason}
                    </div>
                  )}
                </button>
                {it.role === "approve" && <InboxQuickActions itemId={it.id} />}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
