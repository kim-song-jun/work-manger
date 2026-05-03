import { jsx as _jsx } from "react/jsx-runtime";
export function Skeleton({ width = "100%", height = 16, radius = 8, style, className = "", }) {
    return (_jsx("div", { className: `wm-skeleton ${className}`, style: { width, height, borderRadius: radius, ...style } }));
}
