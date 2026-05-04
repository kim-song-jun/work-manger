import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Sheet, useToast } from "@shared/ui";
import { approveInbox, rejectInbox } from "@entities/inbox";

type Props = {
  itemId: string;
  size?: "sm" | "md";
};

export function InboxQuickActions({ itemId, size = "sm" }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const decide = useMutation({
    mutationFn: async (action: "approve" | "reject") => {
      if (action === "approve") await approveInbox(itemId);
      else await rejectInbox(itemId, { reason });
    },
    onSuccess: (_, action) => {
      toast.show(
        t(action === "approve" ? "mobile.inbox.approved_toast" : "mobile.inbox.rejected_toast"),
        "success",
      );
      qc.invalidateQueries({ queryKey: ["inbox"] });
    },
    onError: () => toast.show(t("mobile.inbox.decision_failed"), "danger"),
  });

  return (
    <>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="secondary"
          size={size}
          onClick={() => setOpen(true)}
          disabled={decide.isPending}
        >
          {t("mobile.inbox.reject_label")}
        </Button>
        <Button
          type="button"
          size={size}
          onClick={() => decide.mutate("approve")}
          disabled={decide.isPending}
        >
          {t("mobile.inbox.approve_label")}
        </Button>
      </div>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
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
          onClick={() => {
            decide.mutate("reject");
            setOpen(false);
          }}
          disabled={decide.isPending}
        >
          {t("mobile.inbox.send_reject")}
        </Button>
      </Sheet>
    </>
  );
}
