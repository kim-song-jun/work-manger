import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const numCls = {
    sm: "text-[18px] font-bold leading-tight",
    md: "text-[22px] font-bold leading-tight",
    lg: "text-[30px] font-bold leading-tight",
    xl: "text-[40px] font-bold leading-tight",
};
export function KPIStat({ label, value, unit, hint, delta, deltaPositive, color, size = "md", }) {
    return (_jsxs("div", { className: "flex flex-col gap-1 min-w-0", children: [_jsx("div", { className: "text-[12px] font-semibold text-ink-500", children: label }), _jsxs("div", { className: `num-tab ${numCls[size]} flex items-baseline gap-[3px]`, style: { color: color ?? "var(--grey-900)" }, children: [_jsx("span", { children: value }), unit && (_jsx("span", { className: "text-[0.5em] font-semibold text-ink-500", children: unit }))] }), (delta || hint) && (_jsxs("div", { className: "flex items-center gap-1", children: [delta && (_jsx("span", { className: "text-[12px] font-semibold", style: { color: deltaPositive ? "var(--success)" : "var(--danger)" }, children: delta })), hint && _jsx("span", { className: "text-[12px] text-ink-500", children: hint })] }))] }));
}
