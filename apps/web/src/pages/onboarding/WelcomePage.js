import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/components";
export function WelcomePage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const features = [
        { icon: "map", titleKey: "onb.feature_loc_title", subKey: "onb.feature_loc_sub" },
        { icon: "calendar", titleKey: "onb.feature_leave_title", subKey: "onb.feature_leave_sub" },
        { icon: "team", titleKey: "onb.feature_team_title", subKey: "onb.feature_team_sub" },
    ];
    return (_jsx("div", { className: "min-h-screen w-full flex justify-center", style: { background: "var(--grey-200)" }, children: _jsxs("div", { className: "flex flex-col w-full", style: {
                maxWidth: 480,
                minHeight: "100vh",
                background: "var(--grey-50)",
                padding: "60px 32px 32px",
                textAlign: "center",
            }, children: [_jsxs("div", { children: [_jsx("div", { className: "mx-auto mb-7 flex items-center justify-center", style: {
                                width: 80,
                                height: 80,
                                borderRadius: 24,
                                background: "var(--brand)",
                                boxShadow: "0 12px 32px rgba(20, 122, 245, 0.25)",
                            }, children: _jsx(Icon.clock, { width: 40, height: 40, style: { color: "#fff" } }) }), _jsx("h1", { className: "text-[28px] font-bold leading-tight mb-3", style: { whiteSpace: "pre-line", color: "var(--grey-900)" }, children: t("onb.welcome_title") }), _jsx("div", { className: "text-[16px] text-ink-600", children: t("onb.welcome_sub") })] }), _jsx("div", { className: "flex flex-col gap-2.5 my-6", children: features.map((f) => {
                        const Ic = Icon[f.icon];
                        return (_jsxs("div", { className: "flex items-center gap-3.5 p-3.5 text-left", style: { background: "var(--white)", borderRadius: 14 }, children: [_jsx("div", { className: "flex items-center justify-center", style: {
                                        width: 40,
                                        height: 40,
                                        borderRadius: "var(--r-md)",
                                        background: "var(--brand-soft)",
                                        color: "var(--brand)",
                                        flexShrink: 0,
                                    }, children: _jsx(Ic, { width: 20, height: 20 }) }), _jsxs("div", { children: [_jsx("div", { className: "text-[14px] font-bold text-ink-900", children: t(f.titleKey) }), _jsx("div", { className: "text-[12px] text-ink-500", children: t(f.subKey) })] })] }, f.titleKey));
                    }) }), _jsxs("div", { className: "mt-auto", children: [_jsx(Button, { size: "lg", fullWidth: true, className: "mb-2", onClick: () => nav("/onboarding/company-code"), children: t("onb.welcome_start") }), _jsxs("div", { className: "text-[13px] text-ink-500", children: [t("auth.have_account"), " ", _jsx(Link, { to: "/login", className: "font-bold", style: { color: "var(--brand)" }, children: t("auth.login") })] })] })] }) }));
}
