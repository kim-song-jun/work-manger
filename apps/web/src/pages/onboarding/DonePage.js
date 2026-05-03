import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Icon } from "@/components";
export function DonePage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const steps = [
        { n: 1, titleKey: "onb.done_step1", subKey: "onb.done_step1_sub" },
        { n: 2, titleKey: "onb.done_step2", subKey: "onb.done_step2_sub" },
        { n: 3, titleKey: "onb.done_step3", subKey: "onb.done_step3_sub" },
    ];
    return (_jsx("div", { className: "min-h-screen w-full flex justify-center", style: { background: "var(--grey-200)" }, children: _jsxs("div", { className: "flex flex-col w-full", style: {
                maxWidth: 480,
                minHeight: "100vh",
                background: "var(--grey-50)",
                padding: "60px 24px 24px",
                textAlign: "center",
            }, children: [_jsx("div", { className: "mx-auto mb-6 flex items-center justify-center", style: {
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        background: "var(--success-soft)",
                    }, children: _jsx(Icon.check, { width: 44, height: 44, style: { color: "var(--success)" }, strokeWidth: 2.5 }) }), _jsx("h1", { className: "text-[26px] font-bold mb-2.5", style: { color: "var(--grey-900)" }, children: t("onb.done_title") }), _jsx("div", { className: "text-[16px] mb-6", style: { color: "var(--grey-600)", whiteSpace: "pre-line" }, children: t("onb.done_sub") }), _jsx("div", { className: "text-left", style: {
                        background: "var(--white)",
                        borderRadius: 14,
                        padding: 4,
                        boxShadow: "var(--shadow-1)",
                    }, children: steps.map((it, i) => (_jsxs("div", { className: "flex items-center gap-3 p-3.5", style: {
                            borderBottom: i < steps.length - 1 ? "1px solid var(--grey-100)" : "none",
                        }, children: [_jsx("div", { className: "flex items-center justify-center text-[12px] font-bold", style: {
                                    width: 26,
                                    height: 26,
                                    borderRadius: 13,
                                    background: "var(--brand-soft)",
                                    color: "var(--brand)",
                                    flexShrink: 0,
                                }, children: it.n }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[14px] font-semibold text-ink-900", children: t(it.titleKey) }), _jsx("div", { className: "text-[12px] text-ink-500", children: t(it.subKey) })] })] }, it.n))) }), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, className: "mt-6", onClick: () => nav("/m/home", { replace: true }), children: t("onb.done_go_home") })] }) }));
}
