import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Card, Icon } from "@/components";
import { OnbShell } from "./OnbShell";

const DAYS_KO = ["월", "화", "수", "목", "금", "토", "일"];
const PATTERN = [true, true, true, true, true, false, false];

export function SchedulePage() {
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
        {DAYS_KO.map((d, i) => (
          <div
            key={d}
            className="flex items-center justify-center font-bold text-[13px]"
            style={{
              aspectRatio: "1",
              borderRadius: 10,
              background: PATTERN[i] ? "var(--brand-soft)" : "var(--grey-100)",
              color: PATTERN[i] ? "var(--brand)" : "var(--grey-400)",
            }}
          >
            {d}
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
            <div className="text-[13px] font-bold text-ink-900">초과근무 자동 감지</div>
            <div className="text-[12px] text-ink-500">18시 이후 근무 시 승인 요청</div>
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
            <div className="text-[13px] font-bold text-ink-900">연차 자동 발생</div>
            <div className="text-[12px] text-ink-500">매월 1일 입사일 기준</div>
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
