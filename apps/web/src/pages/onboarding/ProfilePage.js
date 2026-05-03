import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button, Icon } from "@/components";
import { api, HttpError } from "@/lib/api";
import { OnbShell } from "./OnbShell";
export function ProfilePage() {
    const { t } = useTranslation();
    const nav = useNavigate();
    const [form, setForm] = useState({ name: "", team: "", role: "", emp_no: "" });
    const [submitting, setSubmitting] = useState(false);
    function field(k, v) {
        setForm({ ...form, [k]: v });
    }
    async function onNext() {
        setSubmitting(true);
        try {
            await api("/v1/onboarding/profile", { method: "POST", json: form });
        }
        catch (e) {
            if (e instanceof HttpError && e.status !== 404) {
                // ignore for now; UX-only step
            }
        }
        nav("/onboarding/location");
    }
    const fields = [
        { k: "name", label: t("onb.profile_name") },
        { k: "team", label: t("onb.profile_team") },
        { k: "role", label: t("onb.profile_role") },
        { k: "emp_no", label: t("onb.profile_emp_no") },
    ];
    return (_jsxs(OnbShell, { step: 2, children: [_jsx("h1", { className: "text-[26px] font-bold mb-1.5", style: { color: "var(--grey-900)" }, children: t("onb.profile_title") }), _jsx("div", { className: "text-[14px] text-ink-600 mb-6", children: t("onb.profile_sub") }), _jsx("div", { className: "flex justify-center mb-6", children: _jsxs("div", { className: "relative", children: [_jsx(Avatar, { name: form.name || "?", size: 84 }), _jsx("div", { className: "absolute flex items-center justify-center", style: {
                                bottom: 0,
                                right: 0,
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                background: "var(--brand)",
                                color: "#fff",
                                border: "3px solid #fff",
                            }, children: _jsx(Icon.plus, { width: 14, height: 14 }) })] }) }), fields.map((f) => (_jsxs("div", { className: "mb-3.5", children: [_jsx("div", { className: "text-[12px] font-semibold text-ink-500 mb-1.5", children: f.label }), _jsx("input", { value: form[f.k], onChange: (e) => field(f.k, e.target.value), className: "w-full", style: {
                            padding: "12px 14px",
                            fontSize: 14,
                            border: "1px solid var(--grey-200)",
                            borderRadius: 10,
                            background: "var(--white)",
                            outline: "none",
                            color: "var(--grey-900)",
                        } })] }, f.k))), _jsx("div", { className: "flex-1" }), _jsx(Button, { size: "lg", fullWidth: true, disabled: !form.name || submitting, onClick: onNext, children: t("onb.next") })] }));
}
