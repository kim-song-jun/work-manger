/**
 * /web/inbox — 3-pane unified inbox (filter / list / detail).
 *
 * Left pane: scope + status filters with counts.
 * Middle pane: scrollable list with current selection.
 * Right pane: selected item detail + APPROVE / REJECT actions.
 *
 * Subscribes to the realtime websocket so peer decisions arrive without
 * polling. Optimistic invalidation refreshes both inbox and notifications.
 */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Skeleton,
  useToast,
} from "@shared/ui";
import {
  approveInbox,
  fetchInbox,
  rejectInbox,
} from "@entities/inbox";
import type { InboxItem, InboxStatus } from "@entities/inbox";
import { useMe } from "@entities/user";
import { useInboxStream } from "@shared/lib";
import { InboxRejectReasonForm } from "./InboxRejectReasonForm";

type Scope = "me" | "company";

const STATUS_TABS: InboxStatus[] = ["PENDING", "APPROVED", "REJECTED"];

export function WebInboxPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const me = useMe();
  useInboxStream();

  const isAdmin = useMemo(() => {
    const role = me.data?.memberships?.[0]?.role;
    return role === "ADMIN" || role === "OWNER";
  }, [me.data]);

  const [scope, setScope] = useState<Scope>("me");
  const [status, setStatus] = useState<InboxStatus>("PENDING");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);

  const list = useQuery({
    queryKey: ["inbox", { scope, status }],
    queryFn: () => fetchInbox({ scope, status }),
  });

  const items = list.data?.items ?? [];
  const selected = items.find((it) => it.id === selectedId) ?? items[0] ?? null;

  const approveM = useMutation({
    mutationFn: (id: string) => approveInbox(id),
    onSuccess: () => {
      toast.show(t("inbox.approved_toast"), "success");
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
    onError: () => toast.show(t("inbox.decision_failed"), "danger"),
  });

  const rejectM = useMutation({
    mutationFn: (vars: { id: string; reason?: string }) =>
      rejectInbox(vars.id, { reason: vars.reason }),
    onSuccess: () => {
      toast.show(t("inbox.rejected_toast"), "success");
      qc.invalidateQueries({ queryKey: ["inbox"] });
      setShowReject(false);
    },
    onError: () => toast.show(t("inbox.decision_failed"), "danger"),
  });

  return (
    <div
      data-testid="web-inbox"
      style={{
        display: "grid",
        gridTemplateColumns: "220px 380px 1fr",
        gap: 0,
        height: "calc(100vh - 60px - 48px)",
        background: "var(--white)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
      }}
    >
      {/* Pane 1 — filters */}
      <aside
        style={{
          padding: 16,
          borderRight: "1px solid var(--grey-100)",
          overflow: "auto",
        }}
      >
        <h1 className="text-[20px] font-bold mb-3">{t("inbox.title")}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
          <ScopeButton
            active={scope === "me"}
            onClick={() => setScope("me")}
            label={t("inbox.filter_to_approve")}
          />
          {isAdmin && (
            <ScopeButton
              active={scope === "company"}
              onClick={() => setScope("company")}
              label={t("inbox.filter_company")}
            />
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--grey-100)", paddingTop: 12 }}>
          {STATUS_TABS.map((s) => (
            <FilterButton
              key={s}
              active={status === s}
              label={t(`inbox.filter_${s.toLowerCase()}` as never)}
              onClick={() => setStatus(s)}
            />
          ))}
        </div>
      </aside>

      {/* Pane 2 — list */}
      <section
        aria-label={t("inbox.title")}
        style={{
          borderRight: "1px solid var(--grey-100)",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--grey-100)",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {t(`inbox.filter_${status.toLowerCase()}` as never)} · {items.length}
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          {list.isLoading ? (
            <div style={{ padding: 20 }}>
              <Skeleton width="100%" height={56} />
            </div>
          ) : items.length === 0 ? (
            <div
              style={{ padding: 20, color: "var(--grey-500)", fontSize: 14 }}
              data-testid="inbox-empty"
            >
              {t("inbox.empty_list")}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((it) => (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(it.id);
                      setShowReject(false);
                    }}
                    aria-pressed={selected?.id === it.id}
                    data-testid={`inbox-row-${it.id}`}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      cursor: "pointer",
                      background:
                        selected?.id === it.id ? "var(--brand-soft)" : "transparent",
                      borderLeft:
                        selected?.id === it.id
                          ? "3px solid var(--brand)"
                          : "3px solid transparent",
                      borderBottom: "1px solid var(--grey-50)",
                      textAlign: "left",
                      border: "none",
                      borderBottomColor: "var(--grey-50)",
                      borderBottomWidth: 1,
                      borderBottomStyle: "solid",
                    }}
                  >
                    <ListRowContent it={it} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Pane 3 — detail */}
      <section
        aria-label={t("inbox.detail")}
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          background: "var(--white)",
        }}
      >
        {!selected ? (
          <div
            style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              color: "var(--grey-500)",
            }}
          >
            {t("inbox.select_to_view")}
          </div>
        ) : (
          <DetailPane
            it={selected}
            onApprove={() => approveM.mutate(selected.id)}
            approvePending={approveM.isPending}
            showReject={showReject}
            onShowReject={() => setShowReject(true)}
            onRejectCancel={() => setShowReject(false)}
            onSubmitReject={(reason) =>
              rejectM.mutate({ id: selected.id, reason })
            }
            rejectPending={rejectM.isPending}
          />
        )}
      </section>
    </div>
  );
}

function ScopeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 10,
        background: active ? "var(--grey-100)" : "transparent",
        border: "none",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: "var(--grey-800)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 12px",
        borderRadius: 8,
        background: active ? "var(--brand-soft)" : "transparent",
        border: "none",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? "var(--brand)" : "var(--grey-700)",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function ListRowContent({ it }: { it: InboxItem }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Avatar name={it.requester.name} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="text-[13px] font-bold" style={{ color: "var(--grey-900)" }}>
          {it.requester.name} · <span style={{ fontWeight: 500 }}>{it.title}</span>
        </div>
        {it.reason && (
          <div
            className="text-[12px]"
            style={{
              color: "var(--grey-500)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {it.reason}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailPane({
  it,
  onApprove,
  approvePending,
  showReject,
  onShowReject,
  onRejectCancel,
  onSubmitReject,
  rejectPending,
}: {
  it: InboxItem;
  onApprove: () => void;
  approvePending: boolean;
  showReject: boolean;
  onShowReject: () => void;
  onRejectCancel: () => void;
  onSubmitReject: (reason?: string) => void;
  rejectPending: boolean;
}) {
  const { t } = useTranslation();
  const canDecide = it.role === "approve" && it.status === "PENDING";

  return (
    <>
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid var(--grey-100)",
          flexShrink: 0,
        }}
      >
        <div className="text-[20px] font-bold" style={{ color: "var(--grey-900)" }}>
          {it.title}
        </div>
        <div className="text-[13px] mt-1" style={{ color: "var(--grey-500)" }}>
          {it.requester.name} · {it.requester.team ?? ""}
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "24px 32px" }}>
        <Card padding={16} variant="subtle">
          <div className="text-[12px] font-bold uppercase" style={{ color: "var(--grey-500)" }}>
            {t("inbox.reason")}
          </div>
          <div className="text-[14px] mt-2" style={{ color: "var(--grey-800)" }}>
            {it.reason ?? "—"}
          </div>
        </Card>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
            marginTop: 16,
          }}
        >
          <DetailKV label={t("inbox.type")} value={it.kind} />
          <DetailKV label={t("inbox.detail")} value={it.detail ?? "—"} />
          <DetailKV label={t("inbox.requested_at")} value={it.requested_at} />
        </div>
      </div>
      {canDecide && (
        <div
          style={{
            padding: "16px 32px",
            borderTop: "1px solid var(--grey-100)",
            flexShrink: 0,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {showReject ? (
            <div style={{ flex: 1 }}>
              <InboxRejectReasonForm
                pending={rejectPending}
                onSubmit={(v) => onSubmitReject(v.reason)}
              />
              <button
                type="button"
                onClick={onRejectCancel}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--grey-500)",
                  fontSize: 12,
                  marginTop: 4,
                  cursor: "pointer",
                }}
              >
                {t("common.cancel")}
              </button>
            </div>
          ) : (
            <>
              <Button variant="secondary" onClick={onShowReject} disabled={approvePending}>
                {t("inbox.reject")}
              </Button>
              <div style={{ flex: 1 }} />
              <Button
                variant="primary"
                onClick={onApprove}
                disabled={approvePending}
                data-testid="inbox-approve"
              >
                {t("inbox.approve")}
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}

function DetailKV({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: 14,
        border: "1px solid var(--grey-100)",
        borderRadius: 10,
      }}
    >
      <div className="text-[12px]" style={{ color: "var(--grey-500)", fontWeight: 600 }}>
        {label}
      </div>
      <div className="text-[14px] font-bold mt-1" style={{ color: "var(--grey-900)" }}>
        {value}
      </div>
    </div>
  );
}
