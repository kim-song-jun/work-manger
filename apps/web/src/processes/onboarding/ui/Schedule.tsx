import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@shared/ui";
import { OnbShell } from "./OnbShell";

const DAY_KEYS = [
  "common.days_short_mon",
  "common.days_short_tue",
  "common.days_short_wed",
  "common.days_short_thu",
  "common.days_short_fri",
  "common.days_short_sat",
  "common.days_short_sun",
];
const PATTERN = [true, true, true, true, true, false, false];

export function Schedule() {
  const { t } = useTranslation();
  const nav = useNavigate();
  return (
    <OnbShell step={4}>
      <h1 className="text-[26px] font-bold mb-1.5" style={{ color: "var(--grey-900)" }}>
        {t("onb.schedule_title")}
      </h1>
      <div className="text-[14px] text-ink-600 mb-5">{t("onb.schedule_sub")}</div>

      <Card
        padding={18}
        style={{ background: "var(--brand)", color: "#fff", marginBottom: 12 }}
      >
        <div className="text-[12px]" style={{ opacity: 0.85 }}>
          {t("onb.schedule_standard")}
        </div>
        <div className="flex items-center gap-3.5 mt-2">
          <div>
            <div className="text-[12px]" style={{ opacity: 0.8 }}>
              {t("home.label_clock_in")}
            </div>
            <div className="num-tab text-[26px] font-bold">09:00</div>
          </div>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          <div>
            <div className="text-[12px]" style={{ opacity: 0.8 }}>
              {t("home.label_clock_out")}
            </div>
            <div className="num-tab text-[26px] font-bold">18:00</div>
          </div>
        </div>
        <div
          className="text-[12px] mt-2.5 pt-2.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.2)", opacity: 0.85 }}
        >
          {t("onb.schedule_lunch")}
        </div>
      </Card>

      <div className="text-[13px] font-bold mb-2 text-ink-900">
        {t("onb.schedule_pattern")}
      </div>
      <div className="grid gap-1 mb-4" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
        {DAY_KEYS.map((k, i) => (
          <div
            key={k}
            className="flex items-center justify-center font-bold text-[13px]"
            style={{
              aspectRatio: "1",
              borderRadius: 10,
              background: PATTERN[i] ? "var(--brand-soft)" : "var(--grey-100)",
              color: PATTERN[i] ? "var(--brand)" : "var(--grey-400)",
            }}
          >
            {t(k)}
          </div>
        ))}
      </div>

      <Card padding={14} style={{ marginBottom: 10 }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--warn-soft)",
              color: "var(--warn)",
            }}
          >
            <Icon.clock width={18} height={18} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-ink-900">
              {t("onb.schedule_overtime_title")}
            </div>
            <div className="text-[12px] text-ink-500">
              {t("onb.schedule_overtime_sub")}
            </div>
          </div>
        </div>
      </Card>

      <Card padding={14}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--success-soft)",
              color: "var(--success)",
            }}
          >
            <Icon.calendar width={18} height={18} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-ink-900">
              {t("onb.schedule_leave_title")}
            </div>
            <div className="text-[12px] text-ink-500">
              {t("onb.schedule_leave_sub")}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex-1" />
      <Button
        size="lg"
        fullWidth
        className="mt-4"
        onClick={() => nav("/onboarding/notifications")}
      >
        {t("onb.next")}
      </Button>
    </OnbShell>
  );
}
