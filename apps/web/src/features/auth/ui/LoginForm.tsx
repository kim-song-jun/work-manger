import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@shared/ui";
import { api, HttpError, setAccessToken } from "@shared/api";
import { useAuthStore } from "@shared/lib/store/useAuthStore";
import { fetchMe } from "@entities/user";

type LoginResponse = {
  data: { access_token: string; refresh_token: string };
};

export function LoginForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setStoreToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Defer navigation to a post-commit useEffect. Calling `nav()` directly
  // inside the async submit handler races with React's batched state updates,
  // and in production builds an upstream redirect can unmount LoginForm
  // before the navigate flushes — leaving the user stranded on /login even
  // after a successful POST /v1/auth/login.
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
      // Persist the token BEFORE any side-effecting fetch so that:
      //  1) the next /v1/me request carries Authorization: Bearer …
      //  2) route guards reading useAuthStore see the new token immediately
      // Write to BOTH the localStorage shim (legacy module-level `access`
      // var inside @shared/api) AND the zustand store (route guards read this).
      setAccessToken(r.data.access_token);
      setStoreToken(r.data.access_token);
      try {
        const me = await fetchMe();
        if (me && me.memberships && me.memberships.length > 0) {
          setRedirectTo("/m/home");
        } else {
          // No memberships (or fetchMe swallowed a 401 → null) means the
          // user has no company yet → onboarding, not the member home.
          setRedirectTo("/onboarding/welcome");
        }
      } catch {
        // /v1/me threw a non-401 error (network, 5xx, parse). Treat as
        // "unknown membership" → onboarding. Routing the user to /m/home
        // here would land them on a guarded page that immediately bounces
        // back to /login with a stale token, which is the original bug.
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
