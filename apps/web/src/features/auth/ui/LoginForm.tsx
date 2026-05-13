import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button, TextField } from "@shared/ui";
import { api, HttpError, setAccessToken } from "@shared/api";
import { useAuthStore } from "@shared/lib/store/useAuthStore";
import { fetchMe } from "@entities/user";

import { AuthShell } from "./AuthShell";

type LoginResponse = {
  data: { access_token: string; refresh_token: string };
};

export function LoginForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setStoreToken = useAuthStore((s) => s.setToken);
  const setStoreMe = useAuthStore((s) => s.setMe);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  useEffect(() => {
    if (redirectTo) nav(redirectTo, { replace: true });
  }, [redirectTo, nav]);

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
      setStoreToken(r.data.access_token);
      try {
        const me = await fetchMe();
        setStoreMe(me);
        if (me && me.memberships && me.memberships.length > 0) {
          setRedirectTo("/m/home");
        } else {
          setRedirectTo("/onboarding/welcome");
        }
      } catch {
        setStoreMe(null);
        setRedirectTo("/onboarding/welcome");
      }
    } catch (err) {
      if (err instanceof HttpError) setError(t("auth.invalid"));
      else setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t("auth.login_title")}
      subtitle={t("auth.login_sub")}
      footer="MOLCUBE | Work Manager"
    >
      <form onSubmit={onSubmit} className="flex h-full flex-col">
        <div className="space-y-4">
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
            error={error ?? undefined}
          />
        </div>
        <div className="mt-8">
          <Button type="submit" fullWidth size="lg" disabled={loading}>
            {loading ? t("common.loading") : t("auth.login")}
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[13px]">
          <span style={{ color: "var(--grey-600)" }}>{t("auth.forgot")}</span>
          <Link
            to="/forgot"
            className="inline-flex min-h-8 items-center font-semibold"
            style={{ color: "var(--brand-text)" }}
          >
            {t("auth.help")}
          </Link>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-600">
          {t("auth.no_account")}{" "}
          <Link
            to="/signup"
            className="inline-flex min-h-8 items-center align-middle font-semibold"
            style={{ color: "var(--brand-text)" }}
          >
            {t("auth.signup")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
