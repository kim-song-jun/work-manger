import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components";
import { OnbShell } from "./OnbShell";

const SIZES = [
  { key: "small", label: "Small", sub: "근무시간만" },
  { key: "medium", label: "Medium", sub: "근무 + 팀" },
  { key: "large", label: "Large", sub: "풀 대시보드" },
] as const;

type SizeKey = (typeof SIZES)[number]["key"];

export function WidgetPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [picked, setPicked] = useState<SizeKey>("medium");
  return (
    <OnbShell step={6}>
      <h1 className="text-[26px] font-bold mb-1.5" style={{ color: "var(--grey-900)" }}>
        {t("onb.widget_title")}
      </h1>
      <div className="text-[14px] text-ink-600 mb-6">{t("onb.widget_sub")}</div>

      <div
        className="flex justify-center mb-5 p-6"
        style={{
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          borderRadius: 22,
        }}
      >
        <div
          style={{
            width: 144,
            height: 144,
            background: "var(--white)",
            borderRadius: 22,
            padding: 14,
            boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          }}
        >
          <div className="text-[10px] text-ink-500">오늘 근무</div>
          <div className="num-tab text-[22px] font-bold mt-0.5">6h 12m</div>
          <div
            style={{
              height: 5,
              background: "var(--grey-100)",
              borderRadius: 3,
              marginTop: 8,
              overflow: "hidden",
            }}
          >
            <div style={{ width: "70%", height: "100%", background: "var(--brand)" }} />
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                background: "var(--success)",
              }}
            />
            <span className="text-[10px] text-ink-600">본사 · 09:02</span>
          </div>
          <div
            className="text-center text-[12px] font-bold mt-3 py-1.5"
            style={{
              background: "var(--brand)",
              color: "#fff",
              borderRadius: "var(--r-sm)",
            }}
          >
            퇴근하기
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {SIZES.map((s, i) => {
          const on = picked === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setPicked(s.key)}
              className="text-center"
              style={{
                padding: 12,
                borderRadius: 10,
                border: on ? "2px solid var(--brand)" : "1px solid var(--grey-200)",
                background: on ? "var(--brand-soft)" : "var(--white)",
                gridColumn: i === 2 ? "span 2" : undefined,
                cursor: "pointer",
              }}
            >
              <div
                className="text-[13px] font-bold"
                style={{ color: on ? "var(--brand)" : "var(--grey-900)" }}
              >
                {s.label}
              </div>
              <div className="text-[12px] text-ink-500">{s.sub}</div>
            </button>
          );
        })}
      </div>

      <div className="flex-1" />
      <Button
        size="lg"
        fullWidth
        className="mb-2"
        onClick={() => nav("/onboarding/done")}
      >
        {t("onb.widget_add")}
      </Button>
      <button
        type="button"
        onClick={() => nav("/onboarding/done")}
        className="w-full text-[14px]"
        style={{
          background: "transparent",
          color: "var(--grey-500)",
          border: "none",
          padding: 12,
          cursor: "pointer",
        }}
      >
        {t("onb.later")}
      </button>
    </OnbShell>
  );
}
