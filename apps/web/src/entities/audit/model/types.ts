/** Audit log entry types. */
export type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  actor_name?: string;
  target?: string;
  target_id?: string;
  at: string; // ISO timestamp
  metadata?: Record<string, unknown>;
};

export type AuditFilters = {
  action?: string;
  actor?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

export type AuditPage = {
  items: AuditEntry[];
  next_cursor: string | null;
};
