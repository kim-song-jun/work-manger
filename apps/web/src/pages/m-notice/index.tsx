import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { Card, SegmentedControl, Skeleton } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import {
  fetchNotices,
  type Notice,
  type NoticeCategory,
} from "@entities/notice";

type CategoryFilter = NoticeCategory | "all";

const CATEGORY_TINT: Record<NoticeCategory, { bg: string; fg: string }> = {
  policy: { bg: "var(--brand-soft, #E8F0FF)", fg: "var(--brand, #2563EB)" },
  event: { bg: "var(--grey-100)", fg: "var(--grey-700)" },
  it: { bg: "var(--ok-soft, #DFF7E8)", fg: "var(--ok, #21C07B)" },
  hr: { bg: "var(--warn-soft, #FFF1D6)", fg: "var(--warn, #C58110)" },
  general: { bg: "var(--grey-100)", fg: "var(--grey-700)" },
};

function formatDate(iso: string): string {
  if (!iso) return "";
  return iso.slice(5, 10).replace("-", "/");
}

export function NoticePage() {
  const { t } = useTranslation();
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>("all");

  const q = useQuery({
    queryKey: ["notices", { pinnedOnly, category }],
    queryFn: () =>
      fetchNotices({
        pinned: pinnedOnly || undefined,
        category: category === "all" ? undefined : category,
      }),
  });

  const notices: Notice[] = useMemo(() => q.data ?? [], [q.data]);
  const pinned = useMemo(() => notices.filter((n) => n.pinned), [notices]);
  const recent = useMemo(() => notices.filter((n) => !n.pinned), [notices]);

  return (
    <>
      <SubHeader title={t("notice.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "16px 20px 24px", background: "var(--grey-50)" }}
      >
        <SegmentedControl
          value={category}
          onChange={(v) => setCategory(v as CategoryFilter)}
          options={[
            { value: "all", label: t("notice.cat_all") },
            { value: "policy", label: t("notice.cat_policy") },
            { value: "event", label: t("notice.cat_event") },
            { value: "it", label: t("notice.cat_it") },
            { value: "hr", label: t("notice.cat_hr") },
          ]}
        />

        <button
          type="button"
          onClick={() => setPinnedOnly((v) => !v)}
          className="text-[12px] font-bold mt-3"
          style={{
            color: pinnedOnly ? "var(--brand, #2563EB)" : "var(--grey-500)",
            background: "none",
            border: 0,
            minHeight: 32,
            padding: "6px 0",
            cursor: "pointer",
          }}
          aria-pressed={pinnedOnly}
        >
          {pinnedOnly ? t("notice.show_all") : t("notice.show_pinned")}
        </button>

        {q.isLoading && (
          <Card padding={16} style={{ marginTop: 12 }}>
            <Skeleton height={14} width="60%" />
            <div className="mt-2">
              <Skeleton height={14} width="40%" />
            </div>
          </Card>
        )}

        {!q.isLoading && pinned.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div
              className="text-[12px] font-bold mb-2"
              style={{ color: "var(--grey-500)" }}
            >
              {t("notice.pinned")}
            </div>
            {pinned.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        )}

        {!q.isLoading && recent.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div
              className="text-[12px] font-bold mb-2"
              style={{ color: "var(--grey-500)" }}
            >
              {t("notice.recent")}
            </div>
            {recent.map((n) => (
              <NoticeCard key={n.id} notice={n} />
            ))}
          </div>
        )}

        {!q.isLoading && notices.length === 0 && (
          <Card padding={20} style={{ marginTop: 12 }}>
            <div
              className="text-[14px] text-center"
              style={{ color: "var(--grey-600)" }}
            >
              {t("notice.empty")}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  const { t } = useTranslation();
  const tint = CATEGORY_TINT[notice.category] ?? CATEGORY_TINT.general;
  return (
    <Card padding={14} style={{ marginBottom: 8 }}>
      <span
        className="text-[10px] font-bold"
        style={{
          display: "inline-block",
          padding: "3px 8px",
          background: tint.bg,
          color: tint.fg,
          borderRadius: "var(--r-xs, 6px)",
          marginBottom: 8,
        }}
      >
        {t(`notice.cat_${notice.category}`, { defaultValue: notice.category })}
      </span>
      <div
        className="text-[14px] font-bold"
        style={{ color: "var(--grey-900)" }}
      >
        {notice.title}
      </div>
      {notice.body && (
        <div
          className="text-[13px] mt-1"
          style={{ color: "var(--grey-500)" }}
        >
          {notice.body}
        </div>
      )}
      <div
        className="text-[12px] mt-2 flex gap-2"
        style={{ color: "var(--grey-500)" }}
      >
        <span>{formatDate(notice.published_at)}</span>
        {notice.author_name && (
          <>
            <span>·</span>
            <span>{notice.author_name}</span>
          </>
        )}
      </div>
    </Card>
  );
}
