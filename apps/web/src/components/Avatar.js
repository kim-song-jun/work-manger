import { jsx as _jsx } from "react/jsx-runtime";
export function Avatar({ name = "?", size = 40, src, color }) {
    const initial = name.trim().charAt(0).toUpperCase() || "?";
    const hue = (name.charCodeAt(0) || 0) * 137 % 360;
    const bg = color ?? `hsl(${hue}, 70%, 88%)`;
    const fg = color ? "#fff" : `hsl(${hue}, 60%, 35%)`;
    const style = {
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: bg,
        color: fg,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        letterSpacing: "-0.5px",
        overflow: "hidden",
        flexShrink: 0,
    };
    if (src) {
        return (_jsx("span", { style: style, children: _jsx("img", { src: src, alt: "", style: { width: "100%", height: "100%", objectFit: "cover" } }) }));
    }
    return _jsx("span", { style: style, children: initial });
}
