import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@/components";
import { OnbShell } from "./OnbShell";
export function LocationPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    return (_jsxs(OnbShell, { step: 3, children: [_jsx("h1", { className: "text-[26px] font-bold mb-1.5", style: { color: "var(--grey-900)" }, children: t("onb.location_title") }), _jsx("div", { className: "text-[14px] text-ink-600 mb-5", children: t("onb.location_sub") }), _jsxs("div", { className: "relative overflow-hidden mb-3.5", style: {
                    height: 180,
                    borderRadius: 14,
                    background: "linear-gradient(135deg, #DBE9FF 0%, #E8DBFF 100%)",
                }, children: [_jsxs("svg", { width: "100%", height: "100%", style: { position: "absolute" }, children: [_jsx("path", { d: "M 0 80 Q 100 60 200 100 T 400 80", stroke: "#fff", strokeWidth: 14, fill: "none", opacity: 0.6 }), _jsx("path", { d: "M 50 0 L 80 200", stroke: "#fff", strokeWidth: 8, fill: "none", opacity: 0.5 })] }), _jsx("div", { className: "absolute", style: { top: "40%", left: "50%", transform: "translate(-50%, -100%)" }, children: _jsx("div", { className: "flex items-center justify-center", style: {
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                background: "var(--brand)",
                                color: "#fff",
                                boxShadow: "0 4px 12px rgba(20,122,245,0.4)",
                            }, children: _jsx(Icon.building, { width: 18, height: 18 }) }) }), _jsx("div", { className: "absolute", style: {
                            top: "40%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 110,
                            height: 110,
                            borderRadius: "50%",
                            background: "rgba(20,122,245,0.12)",
                            border: "2px dashed var(--brand)",
                        } })] }), _jsxs(Card, { padding: 14, style: { marginBottom: 10 }, children: [_jsxs("div", { className: "flex items-center gap-2.5 mb-1", children: [_jsx(Icon.building, { width: 18, height: 18, style: { color: "var(--brand)" } }), _jsx("div", { className: "text-[14px] font-bold text-ink-900", children: t("onb.location_office", { name: "강남 오피스" }) }), _jsx("span", { className: "ml-auto text-[10px] font-semibold px-2 py-0.5", style: {
                                    background: "var(--success-soft)",
                                    color: "var(--success)",
                                    borderRadius: 999,
                                }, children: "\u2713" })] }), _jsxs("div", { className: "text-[12px] text-ink-500", children: ["\uC11C\uC6B8 \uAC15\uB0A8\uAD6C \u00B7 ", t("onb.location_radius")] })] }), _jsx(Card, { padding: 14, style: { marginBottom: 10, border: "1px dashed var(--grey-300)" }, children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx(Icon.house, { width: 18, height: 18, style: { color: "var(--grey-500)" } }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[14px] font-bold text-ink-900", children: t("onb.location_wfh") }), _jsx("div", { className: "text-[12px] text-ink-500", children: t("onb.location_wfh_sub") })] }), _jsxs("button", { type: "button", className: "text-[12px] font-semibold px-2.5 py-1.5", style: {
                                background: "var(--brand-soft)",
                                color: "var(--brand)",
                                border: "none",
                                borderRadius: "var(--r-xs)",
                                cursor: "pointer",
                            }, children: ["+ ", t("onb.next")] })] }) }), _jsxs("div", { className: "flex gap-2 mt-1 mb-3 p-3", style: { background: "var(--info-soft)", borderRadius: 10 }, children: [_jsx(Icon.lock, { width: 16, height: 16, style: { color: "var(--info)", flexShrink: 0, marginTop: 2 } }), _jsx("div", { className: "text-[12px] text-ink-700", children: t("onb.location_privacy") })] }), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, onClick: () => nav("/onboarding/schedule"), children: t("onb.next") })] }));
}
