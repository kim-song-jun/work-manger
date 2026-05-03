import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, padding = 16, variant = "plain", onClick, style, className = "", }) {
    const base = {
        background: "var(--white)",
        borderRadius: variant === "elevated" ? "var(--r-lg)" : "var(--r-md)",
        boxShadow: variant === "elevated"
            ? "var(--shadow-2)"
            : variant === "flat" || variant === "subtle"
                ? undefined
                : "var(--shadow-1)",
        border: variant === "flat" ? "1px solid var(--grey-200)" : undefined,
        padding,
        cursor: onClick ? "pointer" : undefined,
        ...(variant === "subtle"
            ? { background: "var(--grey-100)", boxShadow: "none" }
            : {}),
        ...style,
    };
    return (_jsx("div", { className: className, onClick: onClick, style: base, children: children }));
}
