import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { LeaveApplyForm } from "@features/leave-apply";

import { Calendar } from "./Calendar";

export function LeaveApplyPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);

  function pick(iso: string) {
    // Range-pick UX:
    //   1st click → set start (clear end so the second click can extend)
    //   2nd click → if >= start, set end; if < start, treat as new start
    //   3rd click after a complete range → start a new range from this date
    if (!start || (start && end && start !== end)) {
      setStart(iso);
      setEnd(iso);
      return;
    }
    if (iso < start) {
      setStart(iso);
      return;
    }
    setEnd(iso);
  }
  function prev() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }
  function next() {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  return (
    <>
      <SubHeader title={t("leave_apply.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <Card padding={14} style={{ marginBottom: 12 }}>
          <Calendar
            year={year}
            month={month}
            start={start}
            end={end}
            onPick={pick}
            onPrev={prev}
            onNext={next}
          />
        </Card>
        <Card padding={16}>
          <LeaveApplyForm
            defaultDate={start ?? undefined}
            defaultEndDate={end ?? undefined}
            onDone={() => nav("/m/leave/success", { replace: true })}
          />
        </Card>
      </div>
    </>
  );
}
