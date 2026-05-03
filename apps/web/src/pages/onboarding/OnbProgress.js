import { jsx as _jsx } from "react/jsx-runtime";
export function OnbProgress({ step, total = 6 }) {
    return (_jsx("div", { className: "flex gap-1 px-6 pt-5", children: Array.from({ length: total }, (_, i) => (_jsx("div", { style: {
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i < step ? "var(--brand)" : "var(--grey-200)",
                transition: "background var(--motion-standard) var(--ease-standard)",
            } }, i))) }));
}
