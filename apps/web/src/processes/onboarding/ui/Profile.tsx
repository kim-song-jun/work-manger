import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Avatar, Button, Icon } from "@shared/ui";
import { api, HttpError } from "@shared/api";
import { OnbShell } from "./OnbShell";

type Form = { name: string; team: string; role: string; emp_no: string };

export function Profile() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [form, setForm] = useState<Form>({ name: "", team: "", role: "", emp_no: "" });
  const [submitting, setSubmitting] = useState(false);

  function field(k: keyof Form, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function onNext() {
    setSubmitting(true);
    try {
      await api("/v1/onboarding/profile", { method: "POST", json: form });
    } catch (e) {
      if (e instanceof HttpError && e.status !== 404) {
        // ignore for now; UX-only step
      }
    }
    nav("/onboarding/location");
  }

  const fields: { k: keyof Form; label: string }[] = [
    { k: "name", label: t("onb.profile_name") },
    { k: "team", label: t("onb.profile_team") },
    { k: "role", label: t("onb.profile_role") },
    { k: "emp_no", label: t("onb.profile_emp_no") },
  ];

  return (
    <OnbShell step={2}>
      <h1 className="text-[26px] font-bold mb-1.5" style={{ color: "var(--grey-900)" }}>
        {t("onb.profile_title")}
      </h1>
      <div className="text-[14px] text-ink-600 mb-6">{t("onb.profile_sub")}</div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <Avatar name={form.name || "?"} size={84} />
          <div
            className="absolute flex items-center justify-center"
            style={{
              bottom: 0,
              right: 0,
              width: 28,
              height: 28,
              borderRadius: 14,
              background: "var(--brand)",
              color: "#fff",
              border: "3px solid #fff",
            }}
          >
            <Icon.plus width={14} height={14} />
          </div>
        </div>
      </div>

      {fields.map((f) => (
        <div key={f.k} className="mb-3.5">
          <div className="text-[12px] font-semibold text-ink-500 mb-1.5">{f.label}</div>
          <input
            value={form[f.k]}
            onChange={(e) => field(f.k, e.target.value)}
            className="w-full"
            style={{
              padding: "12px 14px",
              fontSize: 14,
              border: "1px solid var(--grey-200)",
              borderRadius: 10,
              background: "var(--white)",
              outline: "none",
              color: "var(--grey-900)",
            }}
          />
        </div>
      ))}

      <div className="flex-1" />
      <Button size="lg" fullWidth disabled={!form.name || submitting} onClick={onNext}>
        {t("onb.next")}
      </Button>
    </OnbShell>
  );
}
