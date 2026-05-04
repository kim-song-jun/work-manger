export type InboxKind = "LEAVE" | "OVERTIME" | "WFH" | "OTHER";
export type InboxStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InboxRole = "approve" | "mine" | "info";

export type InboxItem = {
  id: string;
  kind: InboxKind;
  status: InboxStatus;
  role: InboxRole;
  urgent?: boolean;
  requester: { id: string; name: string; team?: string | null };
  title: string;
  reason?: string | null;
  detail?: string | null;
  requested_at: string;       // ISO
  deadline_at?: string | null;
};

export type InboxCounts = {
  pending: number;
  approved: number;
  rejected: number;
  urgent: number;
};

export type InboxList = {
  items: InboxItem[];
  counts?: InboxCounts;
  next_cursor?: string | null;
};
