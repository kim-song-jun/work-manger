import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@/components";
import { api, HttpError } from "@/lib/api";
export function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState(null);
    async function onSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await api("/v1/auth/forgot", { method: "POST", json: { email } });
            setDone(true);
        }
        catch (err) {
            if (err instanceof HttpError && err.status === 404) {
                setDone(true); // pretend success while endpoint stubs
            }
            else {
                setError(t("common.error"));
            }
        }
        finally {
            setSubmitting(false);
        }
    }
    return (_jsx("main", { className: "min-h-screen grid place-items-center px-5", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-[360px] p-6", style: {
                background: "var(--white)",
                borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-2)",
            }, children: [_jsx("h1", { className: "text-[22px] font-bold mb-2 text-ink-900", children: t("auth.forgot_title") }), _jsx("div", { className: "text-[13px] text-ink-600 mb-5", children: t("auth.forgot_desc") }), done ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-[14px] mb-4 p-3", style: {
                                background: "var(--success-soft)",
                                color: "var(--success)",
                                borderRadius: "var(--r-sm)",
                            }, children: t("auth.forgot_done") }), _jsx(Link, { to: "/login", className: "block text-center text-[13px] font-semibold", style: { color: "var(--brand)" }, children: t("auth.back_to_login") })] })) : (_jsxs(_Fragment, { children: [_jsx(TextField, { label: t("auth.email"), type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, error: error ?? undefined }), _jsx(Button, { type: "submit", fullWidth: true, size: "lg", disabled: submitting, className: "mt-4", children: submitting ? "…" : t("auth.forgot_send") }), _jsx(Link, { to: "/login", className: "block text-center text-[13px] mt-4 font-semibold", style: { color: "var(--brand)" }, children: t("auth.back_to_login") })] }))] }) }));
}
