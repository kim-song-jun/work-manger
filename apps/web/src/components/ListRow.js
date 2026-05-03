import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from "./Icon";
export function ListRow({ leading, title, subtitle, meta, trailing = "chevron", onClick, selected, danger, divider = true, style, }) {
    const trail = trailing === "chevron" ? (_jsx(Icon.chevR, { width: 16, height: 16, style: { color: "var(--grey-400)", flexShrink: 0 } })) : trailing === "none" ? null : (trailing);
    const titleColor = selected
        ? "var(--brand)"
        : danger
            ? "var(--danger)"
            : "var(--grey-900)";
    return (_jsxs("div", { onClick: onClick, style: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            borderBottom: divider ? "1px solid var(--grey-100)" : "none",
            background: selected ? "var(--brand-soft)" : "transparent",
            cursor: onClick ? "pointer" : undefined,
            transition: "background var(--motion-fast) var(--ease-standard)",
            ...style,
        }, children: [leading && _jsx("div", { style: { flexShrink: 0 }, children: leading }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { className: "text-[14px] font-semibold leading-[22px]", style: {
                            color: titleColor,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }, children: title }), subtitle && (_jsx("div", { className: "text-[12px] mt-0.5", style: {
                            color: "var(--grey-500)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }, children: subtitle }))] }), meta && (_jsx("div", { className: "num-tab text-[12px] text-ink-500", style: { flexShrink: 0 }, children: meta })), trail] }));
}
