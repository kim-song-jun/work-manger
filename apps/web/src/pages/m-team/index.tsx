import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader, SegmentedControl } from "@shared/ui";
import { useTeamStream } from "@shared/lib";

import { GridSlice } from "./slices/GridSlice";
import { GroupedSlice } from "./slices/GroupedSlice";
import { TimelineSlice } from "./slices/TimelineSlice";

type Tab = "grid" | "grouped" | "timeline";

export function TeamPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("grid");
  useTeamStream();

  return (
    <>
      <PageHeader title={t("team.title")} />
      <div className="flex-1 overflow-y-auto" style={{ padding: "8px 20px 24px" }}>
        <SegmentedControl
          value={tab}
          onChange={(v) => setTab(v as Tab)}
          options={[
            { value: "grid", label: t("mobile.team_tabs.grid") },
            { value: "grouped", label: t("mobile.team_tabs.grouped") },
            { value: "timeline", label: t("mobile.team_tabs.timeline") },
          ]}
        />
        <div style={{ marginTop: 14 }}>
          {tab === "grid" && <GridSlice />}
          {tab === "grouped" && <GroupedSlice />}
          {tab === "timeline" && <TimelineSlice />}
        </div>
      </div>
    </>
  );
}
