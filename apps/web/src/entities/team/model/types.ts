import type { StatusKind } from "@shared/ui";

export type TeamMember = {
  id: string;
  name: string;
  status: StatusKind;
  team?: string;
};

export type TeamGroup = {
  team: string;
  members: TeamMember[];
};

export type TeamTimelineKind = "office" | "wfh" | "break" | "leave";

export type TeamTimelineBlock = {
  start_minute: number;            // 0-1440
  end_minute: number;
  kind: TeamTimelineKind;
};

export type TeamTimelineRow = {
  member: TeamMember;
  blocks: TeamTimelineBlock[];
};

export type TeamTimeline = {
  rows: TeamTimelineRow[];
  now_minute: number;
};
