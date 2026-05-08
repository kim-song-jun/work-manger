import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Button, Card, Sheet, useToast } from "@shared/ui";
import { approveInbox, rejectInbox } from "@entities/inbox";
import type { InboxItem } from "@entities/inbox";

type Props = {
  item: InboxItem;
  onDone?: () => void;
};

const SWIPE_THRESHOLD = 80;

export function QuickDecide({ item, onDone }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [dx, setDx] = useState(0);
  const startX = useRef<number | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");

  const decide = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      if (action === "approve") await approveInbox(item.id);
      else await rejectInbox(item.id, { reason });
    },
    onSuccess: (_d, action) => {
      toast.show(
        t(action === "approve" ? "mobile.inbox.approved_toast" : "mobile.inbox.rejected_toast"),
        "success",
      );
      qc.invalidateQueries({ queryKey: ["inbox"] });
      onDone?.();
    },
    onError: () => toast.show(t("mobile.inbox.decision_failed"), "danger"),
  });

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current == null) return;
    const next = e.clientX - startX.current;
    setDx(Math.max(-160, Math.min(160, next)));
  }
  function onPointerUp() {
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx > 0) decide.mutate("approve");
      else setReasonOpen(true);
    }
    setDx(0);
    startX.current = null;
  }

  return (
    <>
      <div
        data-testid="quick-decide-card"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${dx}px)`,
          transition: dx === 0 ? "transform 200ms" : undefined,
          touchAction: "pan-y",
        }}
      >
        <Card padding={20} variant="elevated">
          <div className="text-[12px] font-semibold" style={{ color: "var(--brand)" }}>
            {item.kind ?? item.target_type ?? ""}
          </div>
          <div className="text-[18px] font-bold mt-2" style={{ color: "var(--grey-900)" }}>
            {item.title ?? item.requester_name ?? ""}
          </div>
          {item.reason && (
            <div className="text-[13px] mt-3" style={{ color: "var(--grey-700)" }}>
              {item.reason}
            </div>
          )}
        </Card>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          fullWidth
          disabled={decide.isPending}
          onClick={() => setReasonOpen(true)}
        >
          {t("mobile.inbox.reject_label")}
        </Button>
        <Button
          type="button"
          size="lg"
          fullWidth
          disabled={decide.isPending}
          onClick={() => decide.mutate("approve")}
        >
          {t("mobile.inbox.approve_label")}
        </Button>
      </div>
      <div
        className="text-[12px] text-center mt-3"
        style={{ color: "var(--grey-500)" }}
      >
        {t("mobile.inbox.swipe_hint")}
      </div>

      <Sheet
        open={reasonOpen}
        onClose={() => setReasonOpen(false)}
        title={t("mobile.inbox.reject_reason")}
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t("mobile.inbox.reject_reason_placeholder")}
          className="block w-full rounded-md bg-ink-100 px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
          style={{ minHeight: 96, resize: "none", marginBottom: 12 }}
        />
        <Button
          type="button"
          fullWidth
          size="lg"
          disabled={decide.isPending}
          onClick={() => {
            decide.mutate("reject");
            setReasonOpen(false);
          }}
        >
          {t("mobile.inbox.send_reject")}
        </Button>
      </Sheet>
    </>
  );
}
