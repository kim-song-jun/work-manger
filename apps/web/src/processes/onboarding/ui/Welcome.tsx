import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@shared/ui";

export function Welcome() {
  const { t } = useTranslation();
  const nav = useNavigate();

  const features: { icon: keyof typeof Icon; titleKey: string; subKey: string }[] = [
    { icon: "map", titleKey: "onb.feature_loc_title", subKey: "onb.feature_loc_sub" },
    { icon: "calendar", titleKey: "onb.feature_leave_title", subKey: "onb.feature_leave_sub" },
    { icon: "team", titleKey: "onb.feature_team_title", subKey: "onb.feature_team_sub" },
  ];

  return (
    <div
      className="min-h-screen w-full flex justify-center"
      style={{ background: "var(--grey-200)" }}
    >
      <div
        className="flex flex-col w-full"
        style={{
          maxWidth: 480,
          minHeight: "100vh",
          background: "var(--grey-50)",
          padding: "60px 32px 32px",
          textAlign: "center",
        }}
      >
        <div>
          <div
            className="mx-auto mb-7 flex items-center justify-center"
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "var(--brand)",
              boxShadow: "0 12px 32px rgba(20, 122, 245, 0.25)",
            }}
          >
            <Icon.clock width={40} height={40} style={{ color: "#fff" }} />
          </div>
          <h1
            className="text-[28px] font-bold leading-tight mb-3"
            style={{ whiteSpace: "pre-line", color: "var(--grey-900)" }}
          >
            {t("onb.welcome_title")}
          </h1>
          <div className="text-[16px] text-ink-600">{t("onb.welcome_sub")}</div>
        </div>

        <div className="flex flex-col gap-2.5 my-6">
          {features.map((f) => {
            const Ic = Icon[f.icon];
            return (
              <div
                key={f.titleKey}
                className="flex items-center gap-3.5 p-3.5 text-left"
                style={{ background: "var(--white)", borderRadius: 14 }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--r-md)",
                    background: "var(--brand-soft)",
                    color: "var(--brand)",
                    flexShrink: 0,
                  }}
                >
                  <Ic width={20} height={20} />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-ink-900">
                    {t(f.titleKey)}
                  </div>
                  <div className="text-[12px] text-ink-500">{t(f.subKey)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-auto">
          <Button
            size="lg"
            fullWidth
            className="mb-2"
            onClick={() => nav("/onboarding/company-code")}
          >
            {t("onb.welcome_start")}
          </Button>
          <div className="text-[13px] text-ink-500">
            {t("auth.have_account")}{" "}
            <Link to="/login" className="font-bold" style={{ color: "var(--brand)" }}>
              {t("auth.login")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
