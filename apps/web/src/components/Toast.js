import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState } from "react";
const ToastCtx = createContext({ show: () => { } });
export function ToastProvider({ children }) {
    const [items, setItems] = useState([]);
    const show = useCallback((message, tone) => {
        const id = Date.now() + Math.random();
        setItems((prev) => [...prev, { id, message, tone }]);
        setTimeout(() => {
            setItems((prev) => prev.filter((t) => t.id !== id));
        }, 2400);
    }, []);
    return (_jsxs(ToastCtx.Provider, { value: { show }, children: [children, _jsx("div", { className: "pointer-events-none fixed inset-x-0 z-[100] flex flex-col items-center gap-2", style: { bottom: 24 }, children: items.map((t) => (_jsx("div", { className: "wm-anim-fade px-4 py-3 text-[14px] shadow-3", style: {
                        background: t.tone === "danger"
                            ? "var(--danger)"
                            : t.tone === "success"
                                ? "var(--success)"
                                : "var(--grey-900)",
                        color: "#fff",
                        borderRadius: "var(--r-md)",
                        maxWidth: 320,
                    }, children: t.message }, t.id))) })] }));
}
export function useToast() {
    return useContext(ToastCtx);
}
