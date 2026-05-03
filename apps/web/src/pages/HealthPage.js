import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
export function HealthPage() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        api("/v1/health")
            .then(setData)
            .catch((e) => setError(String(e)));
    }, []);
    return (_jsx("main", { className: "min-h-screen grid place-items-center px-5", children: _jsxs("div", { className: "bg-white rounded-lg shadow-2 p-8 min-w-[280px]", children: [_jsx("h1", { className: "text-[20px] font-bold text-ink-900 mb-3", children: "API health" }), data && (_jsx("pre", { className: "text-[13px] text-ink-700 font-num", children: JSON.stringify(data, null, 2) })), error && _jsx("p", { className: "text-danger text-[13px]", children: error })] }) }));
}
