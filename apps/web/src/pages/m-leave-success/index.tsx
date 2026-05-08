import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, Card, Icon } from "@shared/ui";

type SuccessState = {
  start?: string | null;
  end?: string | null;
  kind?: string | null;
};

export function LeaveSuccessPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  // F-EMPLOYEE-006: read navigation state passed from m-leave-apply
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessState;
  const { start, end, kind } = state;

  function periodLabel(): string {
    if (!start && !end) return "—";
    if (start && end && start !== end) return `${start} ~ ${end}`;
    return start ?? end ?? "—";
  }

  function kindLabel(): string {
    if (!kind) return "—";
    const keyMap: Record<string, string> = {
      FULL: "mobile.leave_apply.kind_full",
      AM_HALF: "mobile.leave_apply.kind_am_half",
      PM_HALF: "mobile.leave_apply.kind_pm_half",
    };
    return t(keyMap[kind] ?? kind, { defaultValue: kind });
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-between"
      style={{ padding: "60px 20px 24px", background: "var(--white)" }}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: "var(--success-soft, #E6F7EE)",
            color: "var(--success, #00B894)",
            marginBottom: 20,
          }}
        >
          <Icon.check width={44} height={44} />
        </div>
        <h2
          className="text-[22px] font-bold mb-2"
          style={{ color: "var(--grey-900)" }}
        >
          {t("mobile.leave_apply.success_title")}
        </h2>
        <div
          className="text-[14px]"
          style={{ color: "var(--grey-600)", maxWidth: 280 }}
        >
          {t("mobile.leave_apply.success_sub")}
        </div>

        <Card padding={16} style={{ marginTop: 24, width: "100%", maxWidth: 320 }}>
          <div className="flex justify-between text-[13px] mb-2">
            <span style={{ color: "var(--grey-500)" }}>
              {t("mobile.leave_apply.period")}
            </span>
            <b className="num-tab">{periodLabel()}</b>
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: "var(--grey-500)" }}>
              {t("mobile.leave_apply.type")}
            </span>
            <b>{kindLabel()}</b>
          </div>
        </Card>
      </div>
      <div className="w-full grid gap-2" style={{ maxWidth: 320 }}>
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={() => nav("/m/home", { replace: true })}
        >
          {t("mobile.leave_apply.primary")}
        </Button>
        <Button
          type="button"
          fullWidth
          size="lg"
          variant="secondary"
          onClick={() => nav("/m/leave", { replace: true })}
        >
          {t("mobile.leave_apply.secondary")}
        </Button>
      </div>
    </div>
  );
}
