import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@shared/ui";
import { OnbShell } from "./OnbShell";

export function Location() {
  const { t } = useTranslation();
  const nav = useNavigate();
  return (
    <OnbShell step={3}>
      <h1 className="text-[26px] font-bold mb-1.5" style={{ color: "var(--grey-900)" }}>
        {t("onb.location_title")}
      </h1>
      <div className="text-[14px] text-ink-600 mb-5">{t("onb.location_sub")}</div>

      {/* Faux map */}
      <div
        className="relative overflow-hidden mb-3.5"
        style={{
          height: 180,
          borderRadius: 14,
          background: "linear-gradient(135deg, #DBE9FF 0%, #E8DBFF 100%)",
        }}
      >
        <svg width="100%" height="100%" style={{ position: "absolute" }}>
          <path
            d="M 0 80 Q 100 60 200 100 T 400 80"
            stroke="#fff"
            strokeWidth={14}
            fill="none"
            opacity={0.6}
          />
          <path
            d="M 50 0 L 80 200"
            stroke="#fff"
            strokeWidth={8}
            fill="none"
            opacity={0.5}
          />
        </svg>
        <div
          className="absolute"
          style={{ top: "40%", left: "50%", transform: "translate(-50%, -100%)" }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              background: "var(--brand)",
              color: "#fff",
              boxShadow: "0 4px 12px rgba(20,122,245,0.4)",
            }}
          >
            <Icon.building width={18} height={18} />
          </div>
        </div>
        <div
          className="absolute"
          style={{
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 110,
            height: 110,
            borderRadius: "50%",
            background: "rgba(20,122,245,0.12)",
            border: "2px dashed var(--brand)",
          }}
        />
      </div>

      <Card padding={14} style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-2.5 mb-1">
          <Icon.building width={18} height={18} style={{ color: "var(--brand)" }} />
          <div className="text-[14px] font-bold text-ink-900">
            {t("onb.location_office", { name: t("home.location_office_name") })}
          </div>
          <span
            className="ml-auto text-[10px] font-semibold px-2 py-0.5"
            style={{
              background: "var(--success-soft)",
              color: "var(--success)",
              borderRadius: 999,
            }}
          >
            ✓
          </span>
        </div>
        <div className="text-[12px] text-ink-500">
          {t("onb.location_office_address")} · {t("onb.location_radius")}
        </div>
      </Card>

      <Card padding={14} style={{ marginBottom: 10, border: "1px dashed var(--grey-300)" }}>
        <div className="flex items-center gap-2.5">
          <Icon.house width={18} height={18} style={{ color: "var(--grey-500)" }} />
          <div className="flex-1">
            <div className="text-[14px] font-bold text-ink-900">{t("onb.location_wfh")}</div>
            <div className="text-[12px] text-ink-500">{t("onb.location_wfh_sub")}</div>
          </div>
          <button
            type="button"
            className="text-[12px] font-semibold px-2.5 py-1.5"
            style={{
              background: "var(--brand-soft)",
              color: "var(--brand)",
              border: "none",
              borderRadius: "var(--r-xs)",
              cursor: "pointer",
            }}
          >
            + {t("onb.next")}
          </button>
        </div>
      </Card>

      <div
        className="flex gap-2 mt-1 mb-3 p-3"
        style={{ background: "var(--info-soft)", borderRadius: 10 }}
      >
        <Icon.lock
          width={16}
          height={16}
          style={{ color: "var(--info)", flexShrink: 0, marginTop: 2 }}
        />
        <div className="text-[12px] text-ink-700">{t("onb.location_privacy")}</div>
      </div>

      <div className="flex-1" />
      <Button size="lg" fullWidth onClick={() => nav("/onboarding/schedule")}>
        {t("onb.next")}
      </Button>
    </OnbShell>
  );
}
