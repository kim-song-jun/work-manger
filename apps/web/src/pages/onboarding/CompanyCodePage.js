import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { api, HttpError } from "@/lib/api";
import { OnbShell } from "./OnbShell";
const LEN = 6;
export function CompanyCodePage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [code, setCode] = useState(Array(LEN).fill(""));
    const refs = useRef([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const filled = useMemo(() => code.every((c) => c.length === 1), [code]);
    function setChar(idx, char) {
        const c = char.toUpperCase().slice(0, 1);
        const next = [...code];
        next[idx] = c;
        setCode(next);
        if (c && idx < LEN - 1)
            refs.current[idx + 1]?.focus();
    }
    async function onSubmit() {
        setSubmitting(true);
        setError(null);
        try {
            await api("/v1/onboarding/company-code", {
                method: "POST",
                json: { code: code.join("") },
            });
        }
        catch (e) {
            if (e instanceof HttpError && e.status !== 404) {
                setError(t("auth.invalid"));
                setSubmitting(false);
                return;
            }
            // 404 = endpoint stub — proceed
        }
        nav("/onboarding/profile");
    }
    return (_jsxs(OnbShell, { step: 1, children: [_jsx("h1", { className: "text-[26px] font-bold leading-tight mb-2.5", style: { color: "var(--grey-900)" }, children: t("onb.code_title") }), _jsx("div", { className: "text-[14px] text-ink-600 mb-6", children: t("onb.code_sub") }), _jsx("div", { className: "flex justify-center gap-2 mb-4", children: code.map((c, i) => (_jsx("input", { ref: (el) => {
                        refs.current[i] = el;
                    }, value: c, onChange: (e) => setChar(i, e.target.value), onKeyDown: (e) => {
                        if (e.key === "Backspace" && !c && i > 0)
                            refs.current[i - 1]?.focus();
                    }, inputMode: "text", maxLength: 1, "aria-label": `Code character ${i + 1}`, style: {
                        width: 44,
                        height: 56,
                        borderRadius: "var(--r-md)",
                        border: c
                            ? "2px solid var(--brand)"
                            : "2px solid var(--grey-200)",
                        background: "var(--white)",
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "var(--grey-900)",
                        outline: "none",
                    } }, i))) }), error && (_jsx("div", { className: "text-[13px] text-center mb-2", style: { color: "var(--danger)" }, children: error })), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, disabled: !filled || submitting, onClick: onSubmit, children: t("onb.next") }), _jsxs("div", { className: "text-center text-[13px] text-ink-500 mt-3.5", children: [t("onb.code_help"), " ", _jsx("span", { className: "font-bold", style: { color: "var(--brand)" }, children: t("onb.code_contact_admin") })] })] }));
}
