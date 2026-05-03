import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function StatRow({ items, variant = "default" }) {
    const labelColor = variant === "inverse" ? "rgba(255,255,255,0.7)" : "var(--grey-500)";
    const valueColor = variant === "inverse" ? "#fff" : "var(--grey-900)";
    return (_jsx("div", { className: "grid gap-2", style: { gridTemplateColumns: `repeat(${items.length}, 1fr)` }, children: items.map((it) => (_jsxs("div", { className: "min-w-0", children: [_jsx("div", { className: "text-[12px]", style: { color: labelColor }, children: it.label }), _jsx("div", { className: "num-tab text-[14px] font-semibold mt-1", style: { color: valueColor }, children: it.value })] }, it.label))) }));
}
