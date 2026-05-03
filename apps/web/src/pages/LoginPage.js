import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { api, HttpError, setAccessToken } from "@/lib/api";
import { fetchMe } from "@/lib/me";
export function LoginPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const r = await api("/v1/auth/login", {
                method: "POST",
                json: { email, password },
            });
            setAccessToken(r.data.access_token);
            try {
                const me = await fetchMe();
                if (me && me.memberships && me.memberships.length > 0) {
                    nav("/m/home", { replace: true });
                }
                else {
                    nav("/onboarding/welcome", { replace: true });
                }
            }
            catch {
                nav("/m/home", { replace: true });
            }
        }
        catch (err) {
            if (err instanceof HttpError)
                setError(t("auth.invalid"));
            else
                setError(String(err));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("main", { className: "min-h-screen grid place-items-center px-5", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-[360px] p-6", style: {
                background: "var(--white)",
                borderRadius: "var(--r-md)",
                boxShadow: "var(--shadow-2)",
            }, children: [_jsx("h1", { className: "text-[22px] font-bold mb-6 text-ink-900", children: t("auth.login") }), _jsxs("div", { className: "space-y-3", children: [_jsx(TextField, { label: t("auth.email"), type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(TextField, { label: t("auth.password"), type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, error: error ?? undefined })] }), _jsx("div", { className: "mt-6", children: _jsx(Button, { type: "submit", fullWidth: true, size: "lg", disabled: loading, children: loading ? "…" : t("auth.submit") }) }), _jsx("div", { className: "mt-3 text-center", children: _jsx(Link, { to: "/forgot", className: "text-[13px] font-semibold", style: { color: "var(--brand)" }, children: t("auth.forgot") }) }), _jsxs("p", { className: "mt-4 text-center text-[13px] text-ink-600", children: [t("auth.no_account"), " ", _jsx(Link, { to: "/signup", className: "font-semibold", style: { color: "var(--brand)" }, children: t("auth.signup") })] })] }) }));
}
