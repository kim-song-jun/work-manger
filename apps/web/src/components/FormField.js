import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FormField({ label, hint, error, required, children }) {
    return (_jsxs("div", { className: "mb-4", children: [label && (_jsxs("label", { className: "flex items-center gap-1 mb-1.5 text-[13px] font-semibold text-ink-600", children: [label, required && _jsx("span", { style: { color: "var(--danger)" }, children: "*" })] })), children, error ? (_jsx("div", { className: "mt-1.5 text-[13px]", style: { color: "var(--danger)" }, children: error })) : hint ? (_jsx("div", { className: "mt-1.5 text-[13px] text-ink-500", children: hint })) : null] }));
}
