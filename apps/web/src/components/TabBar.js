import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
const TABS = [
    { key: "home", to: "/m/home", icon: "home", labelKey: "nav.home" },
    { key: "team", to: "/m/team", icon: "team", labelKey: "nav.team" },
    { key: "leave", to: "/m/leave", icon: "calendar", labelKey: "nav.leave" },
    { key: "my", to: "/m/my", icon: "user", labelKey: "nav.my" },
];
export function TabBar({ badges = {} }) {
    const { t } = useTranslation();
    return (_jsx("nav", { className: "flex justify-around", style: {
            height: 64,
            padding: "6px 10px 14px",
            borderTop: "1px solid var(--grey-200)",
            background: "var(--white)",
            flexShrink: 0,
        }, children: TABS.map((tab) => {
            const Ic = Icon[tab.icon];
            const badge = badges[tab.key];
            return (_jsx(NavLink, { to: tab.to, className: "flex flex-1 flex-col items-center justify-center gap-[3px] relative", style: ({ isActive }) => ({
                    color: isActive ? "var(--brand)" : "var(--grey-400)",
                    fontSize: 11,
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "color var(--motion-fast) var(--ease-standard)",
                }), children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx(Ic, { width: 22, height: 22 }), _jsx("span", { style: {
                                color: isActive ? "var(--grey-900)" : "var(--grey-400)",
                                fontWeight: isActive ? 600 : 500,
                            }, children: t(tab.labelKey) }), badge ? (_jsx("span", { className: "absolute", style: {
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
                            }, children: badge })) : null] })) }, tab.key));
        }) }));
}
