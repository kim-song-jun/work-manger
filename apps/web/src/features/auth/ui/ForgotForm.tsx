import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, TextField } from "@shared/ui";
import { api, HttpError } from "@shared/api";

export function ForgotForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/v1/auth/forgot", { method: "POST", json: { email } });
      setDone(true);
    } catch (err) {
      if (err instanceof HttpError && err.status === 404) {
        setDone(true); // pretend success while endpoint stubs
      } else {
        setError(t("common.error"));
      }
    } finally {
      setSubmitting(false);
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
        <h1 className="text-[22px] font-bold mb-2 text-ink-900">
          {t("auth.forgot_title")}
        </h1>
        <div className="text-[13px] text-ink-600 mb-5">{t("auth.forgot_desc")}</div>

        {done ? (
          <>
            <div
              className="text-[14px] mb-4 p-3"
              style={{
                background: "var(--success-soft)",
                color: "var(--success)",
                borderRadius: "var(--r-sm)",
              }}
            >
              {t("auth.forgot_done")}
            </div>
            <Link
              to="/login"
              className="block text-center text-[13px] font-semibold"
              style={{ color: "var(--brand)" }}
            >
              {t("auth.back_to_login")}
            </Link>
          </>
        ) : (
          <>
            <TextField
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              error={error ?? undefined}
            />
            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={submitting}
              className="mt-4"
            >
              {submitting ? "…" : t("auth.forgot_send")}
            </Button>
            <Link
              to="/login"
              className="block text-center text-[13px] mt-4 font-semibold"
              style={{ color: "var(--brand)" }}
            >
              {t("auth.back_to_login")}
            </Link>
          </>
        )}
      </form>
    </main>
  );
}
