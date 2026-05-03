import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from "react";
export const TextField = forwardRef(function TextField({ label, hint, error, id, className = "", ...rest }, ref) {
    return (_jsxs("label", { className: "block", children: [label && (_jsx("span", { className: "mb-1.5 block text-[13px] font-medium text-ink-700", children: label })), _jsx("input", { ref: ref, id: id, className: [
                    "block w-full h-12 rounded-md bg-ink-100 px-4 text-[15px] text-ink-900",
                    "placeholder:text-ink-400",
                    "focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand",
                    error ? "ring-2 ring-danger" : "",
                    className,
                ].join(" "), ...rest }), (hint || error) && (_jsx("span", { className: `mt-1.5 block text-[12px] ${error ? "text-danger" : "text-ink-500"}`, children: error ?? hint }))] }));
});
