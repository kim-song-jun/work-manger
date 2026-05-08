import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui";
import { api, HttpError } from "@shared/api";
import { fetchMe } from "@entities/user";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

import { OnbShell } from "./OnbShell";

const LEN = 6;

export function CompanyCode() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const setStoreMe = useAuthStore((s) => s.setMe);
  const [code, setCode] = useState<string[]>(Array(LEN).fill(""));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filled = useMemo(() => code.every((c) => c.length === 1), [code]);

  function setChar(idx: number, char: string) {
    const c = char.toUpperCase().slice(0, 1);
    const next = [...code];
    next[idx] = c;
    setCode(next);
    if (c && idx < LEN - 1) refs.current[idx + 1]?.focus();
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api("/v1/onboarding/join-company", {
        method: "POST",
        json: { code: code.join("") },
      });
      try {
        const me = await fetchMe();
        setStoreMe(me);
      } catch {
        setStoreMe(null);
      }
    } catch (e) {
      if (e instanceof HttpError) {
        setError(t("auth.invalid"));
      } else {
        setError(String(e));
      }
      setSubmitting(false);
      return;
    }
    nav("/onboarding/profile");
  }

  return (
    <OnbShell step={1}>
      <h1
        className="text-[26px] font-bold leading-tight mb-2.5"
        style={{ color: "var(--grey-900)" }}
      >
        {t("onb.code_title")}
      </h1>
      <div className="text-[14px] text-ink-600 mb-6">{t("onb.code_sub")}</div>

      <div className="flex justify-center gap-2 mb-4">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={c}
            onChange={(e) => setChar(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !c && i > 0) refs.current[i - 1]?.focus();
            }}
            inputMode="text"
            maxLength={1}
            aria-label={`Code character ${i + 1}`}
            style={{
              width: 44,
              height: 56,
              borderRadius: "var(--r-md)",
              border: c
                ? "2px solid var(--brand)"
                : "2px solid var(--grey-200)",
              background: "var(--white)",
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--grey-900)",
              outline: "none",
            }}
          />
        ))}
      </div>

      {error && (
        <div className="text-[13px] text-center mb-2" style={{ color: "var(--danger)" }}>
          {error}
        </div>
      )}

      <div className="flex-1" />
      <Button
        size="lg"
        fullWidth
        disabled={!filled || submitting}
        onClick={onSubmit}
      >
        {t("onb.next")}
      </Button>
      <div className="text-center text-[13px] text-ink-500 mt-3.5">
        {t("onb.code_help")}{" "}
        <span className="font-bold" style={{ color: "var(--brand)" }}>
          {t("onb.code_contact_admin")}
        </span>
      </div>
    </OnbShell>
  );
}
