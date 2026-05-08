import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Avatar, Card, Icon, KPIStat, ListRow } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { useMe } from "@entities/user";

export function ProfileFullPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const me = useMe();

  return (
    <>
      <SubHeader title={t("mobile.profile_full.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <Card padding={20}>
          <div className="flex items-center gap-3">
            <Avatar name={me.data?.name ?? me.data?.email ?? "?"} size={64} />
            <div className="flex-1 min-w-0">
              <div className="text-[18px] font-bold" style={{ color: "var(--grey-900)" }}>
                {me.data?.name ?? "—"}
              </div>
              <div className="text-[13px]" style={{ color: "var(--grey-500)" }}>
                {me.data?.email ?? ""}
              </div>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <Card padding={12}>
            <KPIStat label={t("mobile.profile_full.kpi_attendance")} value="98" unit="%" />
          </Card>
          <Card padding={12}>
            <KPIStat label={t("mobile.profile_full.kpi_leave_used")} value="4" unit={t("leave.days_unit")} />
          </Card>
          <Card padding={12}>
            <KPIStat label={t("mobile.profile_full.kpi_avg_work")} value="8.4" unit="h" />
          </Card>
        </div>
        <Card padding={0} style={{ marginTop: 12 }}>
          <ListRow
            leading={
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--r-md)",
                  background: "var(--grey-100)",
                  color: "var(--grey-700)",
                }}
              >
                <Icon.calendar width={20} height={20} />
              </div>
            }
            title={t("mobile.weekly.title")}
            onClick={() => nav("/m/report/weekly")}
          />
          <ListRow
            leading={
              <div
                className="flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--r-md)",
                  background: "var(--brand-soft)",
                  color: "var(--brand)",
                }}
              >
                <Icon.settings width={20} height={20} />
              </div>
            }
            title={t("mobile.settings.title")}
            onClick={() => nav("/m/settings")}
            divider={false}
          />
        </Card>
      </div>
    </>
  );
}
