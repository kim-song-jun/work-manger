import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router-dom";
import { TabBar } from "@/components";
export function MobileShell({ showTabBar = true }) {
    return (_jsx("div", { className: "min-h-screen w-full flex justify-center", style: { background: "var(--grey-200)" }, children: _jsxs("div", { className: "relative flex flex-col w-full", style: {
                maxWidth: 480,
                minHeight: "100vh",
                background: "var(--grey-50)",
                boxShadow: "var(--shadow-3)",
            }, children: [_jsx("main", { className: "flex-1 flex flex-col overflow-hidden", children: _jsx(Outlet, {}) }), showTabBar && _jsx(TabBar, {})] }) }));
}
