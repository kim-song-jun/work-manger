import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { api, HttpError } from "@/lib/api";
export function SignupPage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setErr(null);
        try {
            await api("/v1/auth/signup", {
                method: "POST",
                json: { email, password, name, locale: "ko" },
            });
            nav("/login");
        }
        catch (e2) {
            if (e2 instanceof HttpError)
                setErr(e2.message);
            else
                setErr(String(e2));
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsx("main", { className: "min-h-screen grid place-items-center px-5", children: _jsxs("form", { onSubmit: onSubmit, className: "w-full max-w-[360px] bg-white rounded-lg shadow-2 p-6", children: [_jsx("h1", { className: "text-[22px] font-bold mb-6 text-ink-900", children: t("auth.signup") }), _jsxs("div", { className: "space-y-3", children: [_jsx(TextField, { label: t("auth.name"), value: name, onChange: (e) => setName(e.target.value), required: true }), _jsx(TextField, { label: t("auth.email"), type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true }), _jsx(TextField, { label: t("auth.password"), type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, hint: "8\uC790 \uC774\uC0C1, \uC601\uBB38 + \uC22B\uC790 + \uD2B9\uC218\uBB38\uC790 \uD3EC\uD568", error: err ?? undefined })] }), _jsx("div", { className: "mt-6", children: _jsx(Button, { type: "submit", fullWidth: true, size: "lg", disabled: loading, children: loading ? "…" : t("auth.submit") }) }), _jsxs("p", { className: "mt-4 text-center text-[13px] text-ink-600", children: [t("auth.have_account"), " ", _jsx(Link, { to: "/login", className: "text-brand font-medium", children: t("auth.login") })] })] }) }));
}
