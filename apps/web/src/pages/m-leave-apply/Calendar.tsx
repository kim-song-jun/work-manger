import { useTranslation } from "react-i18next";
import { Icon } from "@shared/ui";

type Props = {
  year: number;
  month: number;            // 1-12
  start?: string | null;    // YYYY-MM-DD
  end?: string | null;
  onPick: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function Calendar({ year, month, start, end, onPick, onPrev, onNext }: Props) {
  const { t } = useTranslation();
  const dayHeaders = [
    t("common.days_short_sun"),
    t("common.days_short_mon"),
    t("common.days_short_tue"),
    t("common.days_short_wed"),
    t("common.days_short_thu"),
    t("common.days_short_fri"),
    t("common.days_short_sat"),
  ];
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const offset = first.getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const startISO = start ?? "";
  const endISO = end ?? "";
  const ymPrefix = `${year}-${pad(month)}-`;

  function isInRange(iso: string): boolean {
    if (!startISO || !endISO) return false;
    return iso >= startISO && iso <= endISO;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrev}
          aria-label={t("common.prev")}
          style={{
            width: 36,
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--grey-600)",
          }}
        >
          <Icon.chevL width={20} height={20} />
        </button>
        <div className="text-[15px] font-semibold" style={{ color: "var(--grey-900)" }}>
          {t("common.year_month", { year, month })}
        </div>
        <button
          type="button"
          onClick={onNext}
          aria-label={t("common.next")}
          style={{
            width: 36,
            height: 36,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--grey-600)",
          }}
        >
          <Icon.chevR width={20} height={20} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dayHeaders.map((d) => (
          <div
            key={d}
            className="text-center text-[11px]"
            style={{ color: "var(--grey-500)", padding: 4 }}
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const iso = `${ymPrefix}${pad(d)}`;
          const isStart = iso === startISO;
          const isEnd = iso === endISO;
          const inRange = isInRange(iso);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onPick(iso)}
              style={{
                aspectRatio: "1",
                fontSize: 13,
                fontWeight: isStart || isEnd ? 700 : 500,
                color: inRange ? "#fff" : "var(--grey-900)",
                background: inRange ? "var(--brand)" : "transparent",
                border: "none",
                borderRadius: isStart && isEnd ? 8 : isStart ? "8px 0 0 8px" : isEnd ? "0 8px 8px 0" : 4,
                cursor: "pointer",
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
