import { jsx as _jsx } from "react/jsx-runtime";
export function SegmentedControl({ options, value, onChange, }) {
    return (_jsx("div", { role: "tablist", className: "flex", style: {
            background: "var(--grey-100)",
            borderRadius: "var(--r-sm)",
            padding: 2,
        }, children: options.map((o) => {
            const active = o.value === value;
            return (_jsx("button", { role: "tab", "aria-selected": active, onClick: () => onChange(o.value), type: "button", className: "flex-1 h-9 text-[13px] font-semibold transition-colors", style: {
                    background: active ? "var(--white)" : "transparent",
                    color: active ? "var(--grey-900)" : "var(--grey-500)",
                    borderRadius: 6,
                    boxShadow: active ? "var(--shadow-1)" : undefined,
                    border: "none",
                    cursor: "pointer",
                }, children: o.label }, o.value));
        }) }));
}
