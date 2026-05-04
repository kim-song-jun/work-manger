import { useTranslation } from "react-i18next";
import { Icon } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

export function EmptyNotificationsPage() {
  const { t } = useTranslation();
  return (
    <>
      <SubHeader title={t("mobile.notifications.title")} />
      <div
        className="flex-1 flex flex-col items-center justify-center"
        style={{ padding: "0 32px", background: "var(--white)" }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: "var(--grey-100)",
            color: "var(--brand)",
            marginBottom: 16,
          }}
        >
          <Icon.check width={44} height={44} />
        </div>
        <h2 className="text-[20px] font-bold mb-2" style={{ color: "var(--grey-900)" }}>
          {t("mobile.notifications.empty_title")}
        </h2>
        <div
          className="text-[14px] text-center"
          style={{ color: "var(--grey-500)", maxWidth: 280 }}
        >
          {t("mobile.notifications.empty_sub")}
        </div>
      </div>
    </>
  );
}
