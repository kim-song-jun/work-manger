import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@/components";
import { OnbShell } from "./OnbShell";
const DAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const PATTERN = [true, true, true, true, true, false, false];
export function SchedulePage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    return (_jsxs(OnbShell, { step: 4, children: [_jsx("h1", { className: "text-[26px] font-bold mb-1.5", style: { color: "var(--grey-900)" }, children: t("onb.schedule_title") }), _jsx("div", { className: "text-[14px] text-ink-600 mb-5", children: t("onb.schedule_sub") }), _jsxs(Card, { padding: 18, style: { background: "var(--brand)", color: "#fff", marginBottom: 12 }, children: [_jsx("div", { className: "text-[12px]", style: { opacity: 0.85 }, children: t("onb.schedule_standard") }), _jsxs("div", { className: "flex items-center gap-3.5 mt-2", children: [_jsxs("div", { children: [_jsx("div", { className: "text-[12px]", style: { opacity: 0.8 }, children: t("home.label_clock_in") }), _jsx("div", { className: "num-tab text-[26px] font-bold", children: "09:00" })] }), _jsx("div", { className: "flex-1 h-px", style: { background: "rgba(255,255,255,0.3)" } }), _jsxs("div", { children: [_jsx("div", { className: "text-[12px]", style: { opacity: 0.8 }, children: t("home.label_clock_out") }), _jsx("div", { className: "num-tab text-[26px] font-bold", children: "18:00" })] })] }), _jsx("div", { className: "text-[12px] mt-2.5 pt-2.5", style: { borderTop: "1px solid rgba(255,255,255,0.2)", opacity: 0.85 }, children: t("onb.schedule_lunch") })] }), _jsx("div", { className: "text-[13px] font-bold mb-2 text-ink-900", children: t("onb.schedule_pattern") }), _jsx("div", { className: "grid gap-1 mb-4", style: { gridTemplateColumns: "repeat(7, 1fr)" }, children: DAYS_KO.map((d, i) => (_jsx("div", { className: "flex items-center justify-center font-bold text-[13px]", style: {
                        aspectRatio: "1",
                        borderRadius: 10,
                        background: PATTERN[i] ? "var(--brand-soft)" : "var(--grey-100)",
                        color: PATTERN[i] ? "var(--brand)" : "var(--grey-400)",
                    }, children: d }, d))) }), _jsx(Card, { padding: 14, style: { marginBottom: 10 }, children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "flex items-center justify-center", style: {
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "var(--warn-soft)",
                                color: "var(--warn)",
                            }, children: _jsx(Icon.clock, { width: 18, height: 18 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[13px] font-bold text-ink-900", children: "\uCD08\uACFC\uADFC\uBB34 \uC790\uB3D9 \uAC10\uC9C0" }), _jsx("div", { className: "text-[12px] text-ink-500", children: "18\uC2DC \uC774\uD6C4 \uADFC\uBB34 \uC2DC \uC2B9\uC778 \uC694\uCCAD" })] })] }) }), _jsx(Card, { padding: 14, children: _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "flex items-center justify-center", style: {
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background: "var(--success-soft)",
                                color: "var(--success)",
                            }, children: _jsx(Icon.calendar, { width: 18, height: 18 }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[13px] font-bold text-ink-900", children: "\uC5F0\uCC28 \uC790\uB3D9 \uBC1C\uC0DD" }), _jsx("div", { className: "text-[12px] text-ink-500", children: "\uB9E4\uC6D4 1\uC77C \uC785\uC0AC\uC77C \uAE30\uC900" })] })] }) }), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, className: "mt-4", onClick: () => nav("/onboarding/notifications"), children: t("onb.next") })] }));
}
