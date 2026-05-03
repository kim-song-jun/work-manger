import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components";
import { OnbShell } from "./OnbShell";
export function NotificationsPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [items, setItems] = useState([
        { key: "clock", titleKey: "onb.notif_clock", subKey: "onb.notif_clock_sub", on: true },
        { key: "leave", titleKey: "onb.notif_leave", subKey: "onb.notif_leave_sub", on: true },
        {
            key: "overtime",
            titleKey: "onb.notif_overtime",
            subKey: "onb.notif_overtime_sub",
            on: true,
        },
    ]);
    function toggle(k) {
        setItems((prev) => prev.map((it) => (it.key === k ? { ...it, on: !it.on } : it)));
    }
    return (_jsxs(OnbShell, { step: 5, children: [_jsx("h1", { className: "text-[26px] font-bold mb-1.5", style: { color: "var(--grey-900)" }, children: t("onb.notif_title") }), _jsx("div", { className: "text-[14px] text-ink-600 mb-5", children: t("onb.notif_sub") }), items.map((it) => (_jsxs(Card, { padding: 14, style: { marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }, children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-[14px] font-semibold text-ink-900", children: t(it.titleKey) }), _jsx("div", { className: "text-[12px] text-ink-500", children: t(it.subKey) })] }), _jsx("button", { type: "button", role: "switch", "aria-checked": it.on, onClick: () => toggle(it.key), style: {
                            width: 40,
                            height: 24,
                            borderRadius: "var(--r-md)",
                            background: it.on ? "var(--brand)" : "var(--grey-200)",
                            position: "relative",
                            flexShrink: 0,
                            border: "none",
                            cursor: "pointer",
                            transition: "background var(--motion-fast) var(--ease-standard)",
                        }, children: _jsx("span", { style: {
                                position: "absolute",
                                top: 2,
                                left: it.on ? 18 : 2,
                                width: 20,
                                height: 20,
                                borderRadius: 10,
                                background: "#fff",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                transition: "left var(--motion-standard) var(--ease-standard)",
                            } }) })] }, it.key))), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, className: "mb-2", onClick: () => nav("/onboarding/widget"), children: t("onb.next") }), _jsx("button", { type: "button", onClick: () => nav("/onboarding/widget"), className: "w-full text-[14px]", style: {
                    background: "transparent",
                    color: "var(--grey-500)",
                    border: "none",
                    padding: 12,
                    cursor: "pointer",
                }, children: t("onb.later") })] }));
}
