import type { StatusKind } from "@shared/ui";

export type TeamMember = {
  id: string;
  name: string;
  status: StatusKind;
  team?: string;
};
