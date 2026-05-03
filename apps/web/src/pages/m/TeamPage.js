import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Avatar, Card, PageHeader, Skeleton, StatusDot } from "@/components";
import { api, HttpError } from "@/lib/api";
async function fetchTeam() {
    try {
        const r = await api("/v1/team/status");
        return r.data;
    }
    catch (e) {
        if (e instanceof HttpError && e.status === 404)
            return null;
        throw e;
    }
}
const FALLBACK = [
    { id: "1", name: "지우", status: "office", team: "디자인" },
    { id: "2", name: "민수", status: "office", team: "엔지니어링" },
    { id: "3", name: "예린", status: "wfh", team: "엔지니어링" },
    { id: "4", name: "현우", status: "office", team: "프로덕트" },
    { id: "5", name: "수아", status: "leave", team: "프로덕트" },
    { id: "6", name: "도윤", status: "off", team: "오퍼레이션" },
];
export function TeamPage() {
    const { t } = useTranslation();
    const q = useQuery({ queryKey: ["team-status"], queryFn: fetchTeam });
    const members = q.data ?? FALLBACK;
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: t("team.title") }), _jsx("div", { className: "flex-1 overflow-y-auto", style: { padding: "8px 20px 24px" }, children: q.isLoading ? (_jsx("div", { className: "grid grid-cols-3 gap-2", children: [0, 1, 2, 3, 4, 5].map((i) => (_jsx(Card, { padding: 12, children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(Skeleton, { width: 48, height: 48, radius: 24 }), _jsx(Skeleton, { width: "80%", height: 12 }), _jsx(Skeleton, { width: "60%", height: 10 })] }) }, i))) })) : (_jsx("div", { className: "grid grid-cols-3 gap-2", children: members.map((m) => (_jsx(Card, { padding: 12, children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsxs("div", { className: "relative", children: [_jsx(Avatar, { name: m.name, size: 48 }), _jsx("span", { className: "absolute", style: { bottom: 0, right: 0 }, children: _jsx(StatusDot, { status: m.status, size: 12, ring: true }) })] }), _jsx("div", { className: "text-[13px] font-semibold text-ink-900", style: {
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }, children: m.name }), m.team && (_jsx("div", { className: "text-[11px] text-ink-500", children: m.team }))] }) }, m.id))) })) })] }));
}
