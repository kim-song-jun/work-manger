import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, Skeleton } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import {
  fetchNotifications,
  markAllRead,
  markRead,
} from "@entities/notification";
import type { NotificationKind } from "@entities/notification";

const KIND_COLOR: Record<NotificationKind, string> = {
  ot: "var(--warn, #E59700)",
  leave: "var(--brand)",
  expire: "var(--danger, #FF5A5F)",
  team: "var(--brand)",
  notice: "var(--grey-700)",
  weekly: "var(--success, #00B894)",
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | NotificationKind>("all");

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  // mark-read on view: when items load, fire markRead for each unread item.
  useEffect(() => {
    const items = q.data?.items ?? [];
    const unread = items.filter((it) => !it.read_at);
    if (unread.length === 0) return;
    Promise.all(unread.map((u) => markRead(u.id))).catch(() => {});
  }, [q.data]);

  const markAll = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const items = q.data?.items ?? [];
  const filtered =
    filter === "all" ? items : items.filter((i) => i.kind === filter);

  if (!q.isLoading && items.length === 0) {
    nav("/m/notifications/empty", { replace: true });
  }

  const filters: { v: "all" | NotificationKind; key: string }[] = [
    { v: "all", key: "mobile.notifications.filter_all" },
    { v: "ot", key: "mobile.notifications.filter_approve" },
    { v: "leave", key: "mobile.notifications.filter_leave" },
    { v: "notice", key: "mobile.notifications.filter_notice" },
  ];

  return (
    <>
      <SubHeader
        title={t("mobile.notifications.title")}
        action={
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="text-[13px] font-bold"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--brand)",
              cursor: "pointer",
            }}
          >
            {t("mobile.notifications.mark_all")}
          </button>
        }
      />
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: "10px 16px", background: "var(--white)" }}
      >
        {filters.map((f) => (
          <button
            key={f.v}
            type="button"
            onClick={() => setFilter(f.v)}
            className="text-[13px] font-semibold"
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              background: filter === f.v ? "var(--grey-900)" : "var(--grey-100)",
              color: filter === f.v ? "#fff" : "var(--grey-700)",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t(f.key)}
          </button>
        ))}
      </div>
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "8px 12px 24px", background: "var(--grey-50)" }}
      >
        {q.isLoading && <Skeleton height={64} />}
        {filtered.map((it) => (
          <Card
            key={it.id}
            padding={14}
            style={{
              marginBottom: 6,
              boxShadow: !it.read_at ? "0 0 0 1.5px rgba(49,130,246,0.15)" : undefined,
              position: "relative",
            }}
          >
            <div className="flex gap-3">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--r-sm)",
                  background: (KIND_COLOR[it.kind] ?? "var(--grey-700)") + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: KIND_COLOR[it.kind] ?? "var(--grey-700)",
                    display: "inline-block",
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[14px] font-bold"
                  style={{ color: "var(--grey-900)" }}
                >
                  {it.title}
                </div>
                {it.body && (
                  <div className="text-[13px] mt-1" style={{ color: "var(--grey-500)" }}>
                    {it.body}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
