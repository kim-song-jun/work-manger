import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components";
import { OnbProgress } from "./OnbProgress";
export function OnbShell({ step, total = 6, children, back = true }) {
    const nav = useNavigate();
    return (_jsx("div", { className: "min-h-screen w-full flex justify-center", style: { background: "var(--grey-200)" }, children: _jsxs("div", { className: "relative flex flex-col w-full", style: {
                maxWidth: 480,
                minHeight: "100vh",
                background: "var(--grey-50)",
            }, children: [step !== undefined && _jsx(OnbProgress, { step: step, total: total }), back && (_jsx("div", { className: "px-5 pt-3", children: _jsx("button", { type: "button", onClick: () => nav(-1), "aria-label": "back", style: {
                            background: "transparent",
                            border: "none",
                            padding: 6,
                            cursor: "pointer",
                            color: "var(--grey-700)",
                        }, children: _jsx(Icon.chevL, { width: 22, height: 22 }) }) })), _jsx("div", { className: "flex-1 flex flex-col", style: { padding: "8px 24px 24px" }, children: children })] }) }));
}
