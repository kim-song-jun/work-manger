export type InboxKind = "LEAVE" | "OVERTIME" | "WFH" | "OTHER";
export type InboxTargetType = "LEAVE" | "OVERTIME" | "MANUAL_CLOCK_IN" | "TRIP";
export type InboxStatus = "PENDING" | "APPROVED" | "REJECTED";
export type InboxRole = "approve" | "mine" | "info";

/**
 * Inbox row as the BE returns it (apps/approval/views.InboxItemSerializer).
 * The legacy fields (`kind`, `role`, `requester`, `title`, ...) remain
 * optional for transitional callers; new code should rely on the BE-shape
 * fields (`target_type`, `requester_name`, `summary`, `created_at`).
 */
export type InboxItem = {
  // BE payload (canonical)
  id: string;
  target_type?: InboxTargetType;
  target_id?: string;
  status: InboxStatus;
  requester_name?: string | null;
  summary?: Record<string, unknown> | null;
  created_at?: string;
  decided_at?: string | null;

  // Legacy/derived fields used by older renderers + fixtures
  kind?: InboxKind;
  role?: InboxRole;
  urgent?: boolean;
  requester?: { id: string; name: string; team?: string | null };
  title?: string;
  reason?: string | null;
  detail?: string | null;
  requested_at?: string;       // ISO
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
