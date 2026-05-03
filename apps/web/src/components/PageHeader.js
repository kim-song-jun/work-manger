import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from "./Icon";
export function PageHeader({ date, title, subtitle, action, hasBadge, theme = "light", }) {
    const dark = theme === "dark";
    return (_jsxs("div", { className: "flex items-center gap-3 px-5 pt-2 pb-3", style: { background: dark ? "var(--grey-900)" : "var(--grey-50)" }, children: [_jsxs("div", { className: "flex-1 min-w-0", children: [date && (_jsx("div", { className: "text-[12px]", style: { color: dark ? "rgba(255,255,255,0.6)" : "var(--grey-500)" }, children: date })), _jsx("h1", { className: "text-[22px] font-bold leading-[30px] m-0 mt-0.5", style: {
                            color: dark ? "#fff" : "var(--grey-900)",
                            letterSpacing: "-0.3px",
                        }, children: title }), subtitle && (_jsx("div", { className: "text-[13px] mt-0.5", style: { color: dark ? "rgba(255,255,255,0.7)" : "var(--grey-600)" }, children: subtitle }))] }), action !== undefined ? (action) : (_jsxs("div", { className: "relative cursor-pointer", children: [_jsx(Icon.bell, { width: 24, height: 24, style: { color: dark ? "#fff" : "var(--grey-700)" } }), hasBadge && (_jsx("span", { className: "absolute", style: {
                            top: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            background: "var(--danger)",
                            borderRadius: 999,
                            border: `2px solid ${dark ? "var(--grey-900)" : "var(--grey-50)"}`,
                        } }))] }))] }));
}
