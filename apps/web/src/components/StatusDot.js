import { jsx as _jsx } from "react/jsx-runtime";
const colorVar = {
    office: "var(--s-office)",
    wfh: "var(--s-wfh)",
    leave: "var(--s-leave)",
    break: "var(--s-break)",
    off: "var(--s-off)",
};
export function StatusDot({ status, size = 8, ring, style }) {
    return (_jsx("span", { style: {
            display: "inline-block",
            width: size,
            height: size,
            borderRadius: "50%",
            background: colorVar[status],
            flexShrink: 0,
            border: ring ? "2px solid var(--white)" : undefined,
            ...style,
        } }));
}
