import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, ListRow, SegmentedControl, Skeleton, useToast } from "@shared/ui";
import { SubHeader } from "@widgets/sub-header";
import { OvertimeForm } from "@features/overtime-request";
import {
  fetchOvertimeHistory,
  fetchOvertimeSettings,
} from "@entities/overtime";
import type { OvertimeRequest } from "@entities/overtime";
import { api, HttpError } from "@shared/api";

type Tab = "request" | "settings" | "history";

function fmtMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function HistoryList() {
  const { t } = useTranslation();
  const q = useQuery({ queryKey: ["overtime", "history"], queryFn: fetchOvertimeHistory });
  if (q.isLoading) return <Skeleton height={48} />;
  const items = q.data ?? [];
  if (items.length === 0)
    return (
      <Card padding={20}>
        <div className="text-[14px] text-center" style={{ color: "var(--grey-600)" }}>
          {t("mobile.overtime.history_empty")}
        </div>
      </Card>
    );
  return (
    <Card padding={0}>
      {items.map((it: OvertimeRequest, i) => (
        <ListRow
          key={it.id}
          divider={i < items.length - 1}
          title={it.work_date}
          subtitle={fmtMin(it.requested_minutes)}
          meta={it.status}
        />
      ))}
    </Card>
  );
}

function SettingsPanel() {
  const { t } = useTranslation();
  const toast = useToast();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["overtime", "settings"], queryFn: fetchOvertimeSettings });
  const data = q.data ?? { auto_enabled: false, auto_threshold_minutes: 30 };
  const m = useMutation({
    mutationFn: async (next: typeof data) => {
      try {
        await api("/v1/overtime/settings", { method: "PUT", json: next });
      } catch (e) {
        if (!(e instanceof HttpError && e.status === 404)) throw e;
      }
      return next;
    },
    onSuccess: (next) => {
      qc.setQueryData(["overtime", "settings"], next);
      toast.show(t("mobile.overtime.submitted"), "success");
    },
    onError: () => toast.show(t("mobile.overtime.failed"), "danger"),
  });

  return (
    <Card padding={16}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold" style={{ color: "var(--grey-900)" }}>
          {t("mobile.overtime.auto_enabled")}
        </span>
        <button
          type="button"
          onClick={() => m.mutate({ ...data, auto_enabled: !data.auto_enabled })}
          style={{
            width: 44,
            height: 26,
            borderRadius: 13,
            background: data.auto_enabled ? "var(--brand)" : "var(--grey-300)",
            border: "none",
            position: "relative",
            cursor: "pointer",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 3,
              left: data.auto_enabled ? 21 : 3,
              width: 20,
              height: 20,
              borderRadius: 10,
              background: "white",
              transition: "left var(--motion-fast) var(--ease-standard)",
            }}
          />
        </button>
      </div>
      <div className="text-[12px] mt-2" style={{ color: "var(--grey-500)" }}>
        {t("mobile.overtime.auto_threshold_desc")}
      </div>
      <div className="mt-3">
        <label className="text-[13px] font-semibold" style={{ color: "var(--grey-700)" }}>
          {t("mobile.overtime.auto_threshold")}
        </label>
        <input
          type="number"
          value={data.auto_threshold_minutes}
          min={5}
          max={240}
          onChange={(e) =>
            m.mutate({ ...data, auto_threshold_minutes: Number(e.target.value) })
          }
          className="block w-full h-12 rounded-md bg-ink-100 px-4 text-[15px] text-ink-900 mt-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
    </Card>
  );
}

export function OvertimePage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("request");
  return (
    <>
      <SubHeader title={t("mobile.overtime.title")} />
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "12px 20px 24px", background: "var(--grey-50)" }}
      >
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: "request", label: t("mobile.overtime.tab_request") },
            { value: "settings", label: t("mobile.overtime.tab_settings") },
            { value: "history", label: t("mobile.overtime.tab_history") },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          {tab === "request" && (
            <Card padding={16}>
              <OvertimeForm />
            </Card>
          )}
          {tab === "settings" && <SettingsPanel />}
          {tab === "history" && <HistoryList />}
        </div>
      </div>
    </>
  );
}
