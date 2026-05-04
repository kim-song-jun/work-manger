import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@shared/ui";
import { api, HttpError } from "@shared/api";

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
    <main className="min-h-screen grid place-items-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[360px] bg-white rounded-lg shadow-2 p-6"
      >
        <h1 className="text-[22px] font-bold mb-6 text-ink-900">{t("auth.signup")}</h1>
        <div className="space-y-3">
          <TextField
            label={t("auth.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField
            label={t("auth.email")}
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
        <div className="mt-6">
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "…" : t("auth.submit")}
          </Button>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-600">
          {t("auth.have_account")}{" "}
          <Link to="/login" className="text-brand font-medium">
            {t("auth.login")}
          </Link>
        </p>
      </form>
    </main>
  );
}
