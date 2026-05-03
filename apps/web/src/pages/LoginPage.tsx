import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { api, HttpError, setAccessToken } from "@/lib/api";
import { fetchMe } from "@/lib/me";

type LoginResponse = {
  data: { access_token: string; refresh_token: string };
};

export function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const r = await api<LoginResponse>("/v1/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setAccessToken(r.data.access_token);
      try {
        const me = await fetchMe();
        if (me && me.memberships && me.memberships.length > 0) {
          nav("/m/home", { replace: true });
        } else {
          nav("/onboarding/welcome", { replace: true });
        }
      } catch {
        nav("/m/home", { replace: true });
      }
    } catch (err) {
      if (err instanceof HttpError) setError(t("auth.invalid"));
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-5">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[360px] p-6"
        style={{
          background: "var(--white)",
          borderRadius: "var(--r-md)",
          boxShadow: "var(--shadow-2)",
        }}
      >
        <h1 className="text-[22px] font-bold mb-6 text-ink-900">{t("auth.login")}</h1>
        <div className="space-y-3">
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
            error={error ?? undefined}
          />
        </div>
        <div className="mt-6">
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? "…" : t("auth.submit")}
          </Button>
        </div>
        <div className="mt-3 text-center">
          <Link to="/forgot" className="text-[13px] font-semibold" style={{ color: "var(--brand)" }}>
            {t("auth.forgot")}
          </Link>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-600">
          {t("auth.no_account")}{" "}
          <Link to="/signup" className="font-semibold" style={{ color: "var(--brand)" }}>
            {t("auth.signup")}
          </Link>
        </p>
      </form>
    </main>
  );
}
