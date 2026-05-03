import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Card, Icon, ListRow, PageHeader, Skeleton } from "@/components";
import { useMe } from "@/lib/me";
import { setAccessToken } from "@/lib/api";
export function MyPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const me = useMe();
    function logout() {
        setAccessToken(null);
        nav("/login", { replace: true });
    }
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: t("my.title") }), _jsxs("div", { className: "flex-1 overflow-y-auto", style: { padding: "8px 20px 24px" }, children: [_jsx(Card, { padding: 20, style: { marginBottom: 12 }, children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { name: me.data?.name ?? me.data?.email ?? "?", size: 56 }), _jsx("div", { className: "flex-1 min-w-0", children: me.isLoading ? (_jsxs(_Fragment, { children: [_jsx(Skeleton, { height: 18, width: "60%" }), _jsx("div", { className: "mt-2", children: _jsx(Skeleton, { height: 12, width: "80%" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-[18px] font-bold text-ink-900", children: me.data?.name ?? "—" }), _jsx("div", { className: "text-[13px] text-ink-500", children: me.data?.email ?? "" })] })) })] }) }), _jsxs(Card, { padding: 0, children: [_jsx(ListRow, { leading: _jsx("div", { className: "flex items-center justify-center", style: {
                                        width: 36,
                                        height: 36,
                                        borderRadius: "var(--r-md)",
                                        background: "var(--brand-soft)",
                                        color: "var(--brand)",
                                    }, children: _jsx(Icon.user, { width: 20, height: 20 }) }), title: t("my.profile") }), _jsx(ListRow, { leading: _jsx("div", { className: "flex items-center justify-center", style: {
                                        width: 36,
                                        height: 36,
                                        borderRadius: "var(--r-md)",
                                        background: "var(--grey-100)",
                                        color: "var(--grey-700)",
                                    }, children: _jsx(Icon.settings, { width: 20, height: 20 }) }), title: t("my.settings") }), _jsx(ListRow, { leading: _jsx("div", { className: "flex items-center justify-center", style: {
                                        width: 36,
                                        height: 36,
                                        borderRadius: "var(--r-md)",
                                        background: "var(--grey-100)",
                                        color: "var(--grey-700)",
                                    }, children: _jsx(Icon.edit, { width: 20, height: 20 }) }), title: t("my.customize"), divider: false })] }), _jsx("button", { type: "button", onClick: logout, className: "w-full mt-4 text-[14px] font-semibold", style: {
                            background: "transparent",
                            color: "var(--danger)",
                            border: "none",
                            padding: 12,
                            cursor: "pointer",
                        }, children: t("my.logout") })] })] }));
}
