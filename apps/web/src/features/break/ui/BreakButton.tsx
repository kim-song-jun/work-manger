/**
 * BreakButton — shows "Start break" or "End break" CTA while clocked in.
 * Calls POST /v1/attendance/break/start|end on tap.
 */
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { useToast } from "@shared/ui";
import { startBreak, endBreak } from "../api/breakApi";

type Props = {
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
  onBreaking?: boolean;
};

export function BreakButton({ onBreakStart, onBreakEnd, onBreaking = false }: Props) {
  const { t } = useTranslation();
  const toast = useToast();

  const startM = useMutation({
    mutationFn: startBreak,
    onSuccess: () => {
      toast.show(t("home.break_started"), "success");
      onBreakStart?.();
    },
    onError: () => toast.show(t("home.break_failed"), "danger"),
  });

  const endM = useMutation({
    mutationFn: endBreak,
    onSuccess: () => {
      toast.show(t("home.break_ended"), "success");
      onBreakEnd?.();
    },
    onError: () => toast.show(t("home.break_failed"), "danger"),
  });

  const isPending = startM.isPending || endM.isPending;

  if (onBreaking) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => endM.mutate()}
        className="text-[13px] font-semibold"
        style={{
          display: "block",
          width: "100%",
          padding: "12px 0",
          borderRadius: "var(--r-md)",
          background: "var(--warn-soft, #FFF4D6)",
          color: "var(--warn, #E59700)",
          border: "none",
          cursor: isPending ? "not-allowed" : "pointer",
          textAlign: "center",
        }}
      >
        {isPending ? t("common.loading") : t("home.break_end")}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startM.mutate()}
      className="text-[13px] font-semibold"
      style={{
        display: "block",
        width: "100%",
        padding: "12px 0",
        borderRadius: "var(--r-md)",
        background: "var(--grey-100)",
        color: "var(--grey-700)",
        border: "none",
        cursor: isPending ? "not-allowed" : "pointer",
        textAlign: "center",
      }}
    >
      {isPending ? t("common.loading") : t("home.break_start")}
    </button>
  );
}
