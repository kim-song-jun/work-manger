import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon, type IconName } from "../Icon";

type Tab = { key: string; to: string; icon: IconName; labelKey: string };

const TABS: Tab[] = [
  { key: "home", to: "/m/home", icon: "home", labelKey: "nav.home" },
  { key: "team", to: "/m/team", icon: "team", labelKey: "nav.team" },
  { key: "leave", to: "/m/leave", icon: "calendar", labelKey: "nav.leave" },
  { key: "my", to: "/m/my", icon: "user", labelKey: "nav.my" },
];

type Props = {
  badges?: Partial<Record<string, number>>;
};

export function TabBar({ badges = {} }: Props) {
  const { t } = useTranslation();
  return (
    <nav
      className="flex justify-around"
      style={{
        height: 64,
        padding: "6px 10px 14px",
        borderTop: "1px solid var(--grey-200)",
        background: "var(--white)",
        flexShrink: 0,
      }}
    >
      {TABS.map((tab) => {
        const Ic = Icon[tab.icon];
        const badge = badges[tab.key];
        return (
          <NavLink
            key={tab.key}
            to={tab.to}
            aria-label={t(tab.labelKey)}
            className="flex flex-1 flex-col items-center justify-center gap-[3px] relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
            style={({ isActive }) => ({
              color: isActive ? "var(--brand)" : "var(--grey-400)",
              fontSize: 11,
              fontWeight: 500,
              textDecoration: "none",
              transition: "color var(--motion-fast) var(--ease-standard)",
            })}
          >
            {({ isActive }) => (
              <>
                <Ic width={22} height={22} aria-hidden />
                <span
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    color: isActive ? "var(--grey-900)" : "var(--grey-400)",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {t(tab.labelKey)}
                </span>
                {badge ? (
                  <span
                    className="absolute"
                    style={{
                      top: 4,
                      right: "28%",
                      background: "var(--danger)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      minWidth: 16,
                      height: 16,
                      padding: "0 4px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
