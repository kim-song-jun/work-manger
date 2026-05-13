import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, PageHeader, SegmentedControl, Skeleton } from "@shared/ui";
import { fetchInbox } from "@entities/inbox";
import type { InboxItem, InboxTargetType } from "@entities/inbox";
import { InboxQuickActions } from "@features/inbox-decide";
import { useMe } from "@entities/user";

import "./styles.css";

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
  const me = useMe();

  // F-EMPLOYEE-008: EMPLOYEE role defaults to "mine" tab; MANAGER/ADMIN/OWNER default to "to-approve".
  // F-MANAGER-XX (2026-05-13 live-test): the original `useState(defaultTab)` froze the
  // initial tab on first render — when `me.data` was still loading, `myRole` fell back
  // to "EMPLOYEE" and MANAGER users landed on the empty "내 요청" tab. Switch to a
  // role-aware default that re-syncs once /v1/me resolves (but only until the user
  // explicitly picks a tab, tracked by `userPickedRef`).
  const myRole = me.data?.memberships?.[0]?.role ?? null;
  const defaultTab: Tab = myRole === "EMPLOYEE" ? "mine" : "to-approve";
  const [tab, setTab] = useState<Tab>(defaultTab);
  const userPickedRef = useRef(false);
  useEffect(() => {
    if (userPickedRef.current) return;
    if (myRole === null) return;
    setTab(myRole === "EMPLOYEE" ? "mine" : "to-approve");
  }, [myRole]);
  const handleTabChange = (next: Tab) => {
    userPickedRef.current = true;
    setTab(next);
  };
  const q = useQuery({ queryKey: ["inbox"], queryFn: () => fetchInbox() });

  const items: InboxItem[] = useMemo(() => q.data?.items ?? [], [q.data?.items]);
  const filtered = useMemo(() => {
    if (tab === "to-approve") return items.filter((i) => i.status === "PENDING");
    // F-MANAGER-06: BE does not return `role` field — filter by status only
    // "mine" tab shows APPROVED items (requester perspective); BE endpoint for requester-scope
    // items does not exist yet (W4c dependency). Until then, show APPROVED items.
    if (tab === "mine") return items.filter((i) => i.status === "APPROVED");
    // "system" tab shows REJECTED items
    return items.filter((i) => i.status === "REJECTED");
  }, [items, tab]);

  return (
    <>
      <PageHeader title={t("mobile.inbox.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        <SegmentedControl
          value={tab}
          onChange={(v) => handleTabChange(v as Tab)}
          options={[
            { value: "to-approve", label: t("mobile.inbox.tab_to_approve") },
            { value: "mine", label: t("mobile.inbox.tab_mine") },
            { value: "system", label: t("mobile.inbox.tab_system") },
          ]}
        />
        <div className="flex flex-col gap-2 mt-3">
          {q.isLoading && <Skeleton height={92} />}
          {/* F-LIVE-006: show error state rather than infinite skeleton on 404/5xx */}
          {!q.isLoading && q.isError && (
            <Card padding={20}>
              <div className="text-[14px] text-center" style={{ color: "var(--danger)" }}>
                {t("common.error_load_failed", { defaultValue: "데이터를 불러오지 못했습니다." })}
              </div>
            </Card>
          )}
          {!q.isLoading && !q.isError && filtered.length === 0 && (
            <Card padding={0}>
              <div className="wm-inbox-empty" role="status" aria-live="polite">
                <svg
                  className="wm-inbox-empty-illus"
                  viewBox="0 0 80 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {/* Inbox tray */}
                  <path d="M16 38h12l4 6h16l4-6h12v18a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4z" />
                  <path d="M22 38l4-18h28l4 18" />
                  {/* checkmark badge */}
                  <circle cx="58" cy="22" r="9" />
                  <path d="M54 22l3 3 5-6" />
                </svg>
                <div className="wm-inbox-empty-title">{t("mobile.inbox.empty")}</div>
                <div className="wm-inbox-empty-sub">{t("mobile.inbox.empty_sub", { defaultValue: "잠시 후 다시 확인해주세요." })}</div>
              </div>
            </Card>
          )}
          {!q.isError && filtered.map((it) => {
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
                data-status={it.status}
                className="wm-inbox-card-wrapper"
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
                      <span className="wm-inbox-urgent" aria-label="긴급">
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
