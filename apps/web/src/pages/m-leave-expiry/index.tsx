import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@shared/ui";
import { fetchBalance } from "@entities/leave";

export function LeaveExpiryAlertPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const q = useQuery({
    queryKey: ["leave", "balance"],
    queryFn: () => fetchBalance(),
  });
  const expiring = q.data?.expiring ?? 0;

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
            background: "var(--warn-soft, #FFF4D6)",
            color: "var(--warn, #E59700)",
            marginBottom: 20,
          }}
        >
          <Icon.bell width={44} height={44} />
        </div>
        <h2 className="text-[22px] font-bold mb-2" style={{ color: "var(--grey-900)" }}>
          {t("mobile.leave_apply.expiry_title")}
        </h2>
        <Card padding={16} style={{ marginTop: 16, maxWidth: 320 }}>
          <div className="text-[14px]" style={{ color: "var(--grey-700)" }}>
            {t("mobile.leave_apply.expiry_sub", { days: expiring })}
          </div>
        </Card>
      </div>
      <div className="w-full grid gap-2" style={{ maxWidth: 320 }}>
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={() => nav("/m/leave/apply")}
        >
          {t("mobile.leave_apply.expiry_cta")}
        </Button>
        <Button
          type="button"
          fullWidth
          size="lg"
          variant="secondary"
          onClick={() => nav(-1)}
        >
          {t("mobile.leave_apply.expiry_dismiss")}
        </Button>
      </div>
    </div>
  );
}
