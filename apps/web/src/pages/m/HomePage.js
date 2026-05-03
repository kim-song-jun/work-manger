import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Icon, KPIStat, ListRow, PageHeader, StatRow, useToast, } from "@/components";
import { api, HttpError } from "@/lib/api";
import { getCurrentLocation } from "@/lib/geo";
import { SlideToClockIn } from "./SlideToClockIn";
import { TweaksFab } from "./TweaksPanel";
const FAKE_PEOPLE = [
    { name: "지우", status: "office" },
    { name: "민수", status: "office" },
    { name: "예린", status: "wfh" },
    { name: "현우", status: "office" },
    { name: "수아", status: "leave" },
    { name: "도윤", status: "off" },
    { name: "하린", status: "office" },
];
function todayDateLabel() {
    const d = new Date();
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return `${days[d.getDay()]} · ${d.getMonth() + 1}월 ${d.getDate()}일`;
}
export function HomePage() {
    const { t } = useTranslation();
    const toast = useToast();
    const [clockedIn, setClockedIn] = useState(false);
    const [clockedInAt, setClockedInAt] = useState(null);
    const [kind] = useState("OFFICE");
    const mutation = useMutation({
        mutationFn: async () => {
            let location;
            try {
                location = await getCurrentLocation();
            }
            catch {
                toast.show(t("home.geo_denied"), "danger");
                throw new Error("geo");
            }
            const body = {
                location,
                kind,
                client_time: new Date().toISOString(),
            };
            try {
                await api("/v1/attendance/clock-in", { method: "POST", json: body });
            }
            catch (e) {
                if (e instanceof HttpError && e.status === 404) {
                    // backend not ready yet — treat as success for the UI
                    return;
                }
                throw e;
            }
        },
        onSuccess: () => {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            setClockedInAt(`${hh}:${mm}`);
            setClockedIn(true);
            toast.show(t("home.clock_in_success"), "success");
        },
        onError: (err) => {
            if (err instanceof Error && err.message === "geo")
                return;
            toast.show(t("home.clock_in_failed"), "danger");
        },
    });
    const greeting = clockedIn ? t("home.good_evening") : t("home.good_morning");
    const dateLabel = useMemo(todayDateLabel, []);
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { date: dateLabel, title: greeting, hasBadge: true }), _jsxs("div", { className: "flex-1 overflow-y-auto", style: { padding: "4px 20px 16px", background: "var(--grey-50)" }, children: [_jsxs(Card, { padding: "24px 20px", style: {
                            background: clockedIn ? "var(--brand)" : "var(--white)",
                            color: clockedIn ? "#fff" : undefined,
                        }, children: [_jsx("div", { className: "text-[12px] font-semibold", style: { color: clockedIn ? "rgba(255,255,255,0.85)" : "var(--grey-500)" }, children: t("home.today_work") }), _jsx("div", { className: "num-tab text-[40px] font-bold leading-tight mt-2", style: { color: clockedIn ? "#fff" : "var(--grey-900)" }, children: clockedIn ? "0h 36m" : "—" }), _jsx("div", { className: "mt-5", children: _jsx(StatRow, { variant: clockedIn ? "inverse" : "default", items: [
                                        { label: t("home.label_clock_in"), value: clockedInAt ?? "—" },
                                        { label: t("home.label_clock_out"), value: "—" },
                                        { label: t("home.label_regular"), value: "09–18" },
                                    ] }) })] }), _jsx(Card, { padding: 0, style: { marginTop: 10 }, children: _jsx(ListRow, { divider: false, leading: _jsx("div", { className: "flex items-center justify-center", style: {
                                    width: 36,
                                    height: 36,
                                    borderRadius: "var(--r-md)",
                                    background: "var(--brand-soft)",
                                    color: "var(--brand)",
                                }, children: _jsx(Icon.building, { width: 20, height: 20 }) }), title: t("home.at_office"), subtitle: `강남 오피스 · ${t("home.auto_detected")}`, trailing: _jsx("button", { type: "button", className: "text-[13px] font-semibold", style: {
                                    background: "transparent",
                                    color: "var(--grey-700)",
                                    border: "none",
                                    padding: "6px 10px",
                                    borderRadius: "var(--r-sm)",
                                    cursor: "pointer",
                                }, children: t("home.change") }) }) }), _jsx("div", { style: { marginTop: 14 }, children: _jsx(SlideToClockIn, { onCommit: () => {
                                if (clockedIn) {
                                    setClockedIn(false);
                                    setClockedInAt(null);
                                    toast.show(t("home.label_clock_out"), "success");
                                }
                                else {
                                    mutation.mutate();
                                }
                            }, disabled: mutation.isPending, active: clockedIn, labelIn: t("home.slide_in"), labelOut: t("home.slide_out") }) }), _jsxs("div", { className: "grid grid-cols-3 gap-2 mt-3.5", children: [_jsx(Card, { padding: 12, children: _jsx(KPIStat, { label: t("home.week_label"), value: "32", unit: "h" }) }), _jsx(Card, { padding: 12, children: _jsx(KPIStat, { label: t("home.leave_balance"), value: "11", unit: t("leave.days_unit") }) }), _jsx(Card, { padding: 12, children: _jsx(KPIStat, { label: t("home.overtime_label"), value: "4.3", unit: "h" }) })] }), _jsxs(Card, { padding: 14, style: { marginTop: 10 }, onClick: () => { }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "text-[14px] font-semibold text-ink-900", children: t("home.team_status") }), _jsx(Icon.chevR, { width: 16, height: 16, style: { color: "var(--grey-400)" } })] }), _jsxs("div", { className: "flex items-center mt-2.5", children: [FAKE_PEOPLE.slice(0, 7).map((p, i) => (_jsxs("div", { style: { marginLeft: i === 0 ? 0 : -8, position: "relative" }, children: [_jsx(Avatar, { name: p.name, size: 32 }), _jsx("span", { style: {
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    background: `var(--s-${p.status})`,
                                                    border: "2px solid var(--white)",
                                                } })] }, p.name))), _jsx("div", { className: "flex items-center justify-center text-[11px] font-bold", style: {
                                            marginLeft: -8,
                                            width: 32,
                                            height: 32,
                                            borderRadius: "var(--r-lg)",
                                            background: "var(--grey-100)",
                                            color: "var(--grey-600)",
                                        }, children: "+5" })] })] })] }), _jsx(TweaksFab, {})] }));
}
