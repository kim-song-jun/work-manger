import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@shared/ui";

export function LeaveSuccessPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
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
            <b className="num-tab">—</b>
          </div>
          <div className="flex justify-between text-[13px]">
            <span style={{ color: "var(--grey-500)" }}>
              {t("mobile.leave_apply.type")}
            </span>
            <b>—</b>
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
