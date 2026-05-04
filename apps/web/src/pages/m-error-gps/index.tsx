import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@shared/ui";

export function ErrorGpsPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  return (
    <div
      className="flex-1 flex flex-col items-center justify-between"
      style={{ padding: "60px 24px 24px", background: "var(--white)" }}
    >
      <div className="flex flex-col items-center text-center">
        <div
          className="flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: "var(--danger-soft, #FFE0E0)",
            color: "var(--danger, #FF5A5F)",
            marginBottom: 20,
            position: "relative",
          }}
        >
          <Icon.map width={44} height={44} />
        </div>
        <h2 className="text-[20px] font-bold mb-3" style={{ color: "var(--grey-900)" }}>
          {t("mobile.error_gps.title")}
        </h2>
        <div className="text-[14px]" style={{ color: "var(--grey-600)", maxWidth: 280 }}>
          {t("mobile.error_gps.sub")}
        </div>
      </div>
      <div className="w-full grid gap-2" style={{ maxWidth: 320 }}>
        <Button type="button" fullWidth size="lg" onClick={() => nav(0)}>
          {t("mobile.error_gps.retry")}
        </Button>
        <Button
          type="button"
          fullWidth
          size="lg"
          variant="secondary"
          onClick={() => nav("/m/loc-picker")}
        >
          {t("mobile.error_gps.manual")}
        </Button>
      </div>
    </div>
  );
}
