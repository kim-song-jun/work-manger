import { useTranslation } from "react-i18next";
import { Card } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";

type RecentItem = {
  tagKey: string;
  titleKey: string;
  subKey: string;
  tg: string;
  bg: string;
  date: string;
  views: number;
};

const RECENT: RecentItem[] = [
  {
    tagKey: "mobile.notice.demo_workshop_tag",
    titleKey: "mobile.notice.demo_workshop_title",
    subKey: "mobile.notice.demo_workshop_sub",
    tg: "var(--grey-700)",
    bg: "var(--grey-100)",
    date: "11/08",
    views: 98,
  },
  {
    tagKey: "mobile.notice.demo_system_tag",
    titleKey: "mobile.notice.demo_system_title",
    subKey: "mobile.notice.demo_system_sub",
    tg: "var(--brand)",
    bg: "var(--brand-soft)",
    date: "11/05",
    views: 87,
  },
];

export function NoticePage() {
  const { t } = useTranslation();
  return (
    <>
      <SubHeader title={t("mobile.notice.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "16px 20px 24px", background: "var(--grey-50)" }}
      >
        <Card padding={16} style={{ marginBottom: 16, border: "1.5px solid var(--danger-soft, #FFE0E0)" }}>
          <div className="text-[12px] font-bold mb-1" style={{ color: "var(--danger, #FF5A5F)" }}>
            {t("mobile.notice.required_tag")}
          </div>
          <div className="text-[15px] font-semibold mb-2" style={{ color: "var(--grey-900)" }}>
            {t("mobile.notice.pinned_title")}
          </div>
          <div className="text-[13px]" style={{ color: "var(--grey-700)" }}>
            {t("mobile.notice.pinned_body")}
          </div>
        </Card>
        <div className="text-[12px] font-bold mb-2" style={{ color: "var(--grey-500)" }}>
          {t("mobile.notice.recent")}
        </div>
        {RECENT.map((n, i) => (
          <Card key={i} padding={14} style={{ marginBottom: 8 }}>
            <span
              className="text-[10px] font-bold"
              style={{
                display: "inline-block",
                padding: "3px 8px",
                background: n.bg,
                color: n.tg,
                borderRadius: "var(--r-xs, 6px)",
                marginBottom: 8,
              }}
            >
              {t(n.tagKey)}
            </span>
            <div className="text-[14px] font-bold" style={{ color: "var(--grey-900)" }}>
              {t(n.titleKey)}
            </div>
            <div className="text-[13px] mt-1" style={{ color: "var(--grey-500)" }}>
              {t(n.subKey)}
            </div>
            <div
              className="text-[12px] mt-2 flex gap-2"
              style={{ color: "var(--grey-500)" }}
            >
              <span>{n.date}</span>
              <span>·</span>
              <span>{t("mobile.notice.views", { n: n.views })}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
