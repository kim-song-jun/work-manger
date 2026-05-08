import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Avatar, Card, Icon, ListRow, PageHeader, Skeleton } from "@shared/ui";
import { useMe } from "@entities/user";
import { setAccessToken } from "@shared/api";

export function MyPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const me = useMe();

  function logout() {
    setAccessToken(null);
    nav("/login", { replace: true });
  }

  return (
    <>
      <PageHeader title={t("my.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        <Card padding={20} style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-3">
            <Avatar name={me.data?.name ?? me.data?.email ?? "?"} size={56} />
            <div className="flex-1 min-w-0">
              {me.isLoading ? (
                <>
                  <Skeleton height={18} width="60%" />
                  <div className="mt-2">
                    <Skeleton height={12} width="80%" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-[18px] font-bold text-ink-900">
                    {me.data?.name ?? "—"}
                  </div>
                  <div className="text-[13px] text-ink-500">
                    {me.data?.email ?? ""}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card padding={0}>
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
                <Icon.user width={20} height={20} />
              </div>
            }
            title={t("my.profile")}
          />
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
                <Icon.settings width={20} height={20} />
              </div>
            }
            title={t("my.settings")}
          />
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
                <Icon.edit width={20} height={20} />
              </div>
            }
            title={t("my.customize")}
            divider={false}
          />
        </Card>

        <button
          type="button"
          onClick={logout}
          className="w-full mt-4 text-[14px] font-semibold"
          style={{
            background: "transparent",
            color: "var(--danger)",
            border: "none",
            padding: 12,
            cursor: "pointer",
          }}
        >
          {t("my.logout")}
        </button>
      </div>
    </>
  );
}
