import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, KPIStat, PageHeader, Skeleton } from "@/components";
import { api, HttpError } from "@/lib/api";
async function fetchBalance() {
    try {
        const r = await api("/v1/leave/balance");
        return r.data;
    }
    catch (e) {
        if (e instanceof HttpError && e.status === 404)
            return null;
        throw e;
    }
}
export function LeavePage() {
    const { t } = useTranslation();
    const q = useQuery({ queryKey: ["leave-balance"], queryFn: fetchBalance });
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: t("leave.title") }), _jsxs("div", { className: "flex-1 overflow-y-auto", style: { padding: "8px 20px 24px" }, children: [q.isLoading && (_jsx("div", { className: "grid grid-cols-2 gap-2", children: [0, 1, 2, 3].map((i) => (_jsxs(Card, { padding: 16, children: [_jsx(Skeleton, { height: 14, width: "50%" }), _jsx("div", { className: "mt-2", children: _jsx(Skeleton, { height: 28, width: "60%" }) })] }, i))) })), !q.isLoading && q.data && (_jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsx(Card, { padding: 16, children: _jsx(KPIStat, { label: t("leave.balance"), value: q.data.remaining, unit: t("leave.days_unit"), size: "lg" }) }), _jsx(Card, { padding: 16, children: _jsx(KPIStat, { label: t("leave.used"), value: q.data.used, unit: t("leave.days_unit") }) }), _jsx(Card, { padding: 16, children: _jsx(KPIStat, { label: t("leave.accrued"), value: q.data.accrued, unit: t("leave.days_unit") }) }), _jsx(Card, { padding: 16, children: _jsx(KPIStat, { label: t("leave.expiring"), value: q.data.expiring, unit: t("leave.days_unit"), color: "var(--warn)" }) })] })), !q.isLoading && !q.data && (_jsx(Card, { padding: 20, children: _jsx("div", { className: "text-[14px] text-center", style: { color: "var(--grey-600)" }, children: t("leave.none_yet") }) }))] })] }));
}
