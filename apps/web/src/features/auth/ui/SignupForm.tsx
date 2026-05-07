import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@shared/ui";
import { api, HttpError } from "@shared/api";
import { AuthShell } from "./AuthShell";

export function SignupForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await api("/v1/auth/signup", {
        method: "POST",
        json: { email, password, name, locale: "ko" },
      });
      nav("/login");
    } catch (e2) {
      if (e2 instanceof HttpError) setErr(e2.message);
      else setErr(String(e2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.signup_title")}
      subtitle={t("auth.signup_sub")}
      footer="MOLCUBE | Work Manager"
    >
      <form onSubmit={onSubmit} className="flex h-full flex-col">
        <div className="space-y-4">
          <TextField
            label={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label={t("auth.work_email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint={t("auth.password_hint")}
            error={err ?? undefined}
          />
        </div>
        <div className="mt-8">
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? t("common.loading") : t("auth.signup")}
          </Button>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-600">
          {t("auth.have_account")}{" "}
          <Link
            to="/login"
            className="inline-flex min-h-8 items-center align-middle font-semibold"
            style={{ color: "var(--brand)" }}
          >
            {t("auth.login")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
