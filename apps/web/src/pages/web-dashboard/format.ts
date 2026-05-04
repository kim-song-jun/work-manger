/** Small formatters for dashboard cells. ISO-string safe. */
import i18n from "@shared/i18n";

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function formatMinutes(min: number): string {
  if (!min || min < 0) return "0h 0m";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export function formatDateLabel(yyyymmdd: string): string {
  // Accepts "YYYY-MM-DD"; localized via i18n template (KO: "M월 D일", EN: "M/D").
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyymmdd);
  if (!m) return yyyymmdd;
  return i18n.t("common.month_day", { month: Number(m[2]), day: Number(m[3]) });
}
