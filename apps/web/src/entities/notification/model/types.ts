export type NotificationKind =
  | "ot"
  | "leave"
  | "expire"
  | "team"
  | "notice"
  | "weekly";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  created_at: string;            // ISO
  read_at?: string | null;
};

export type NotificationList = {
  items: NotificationItem[];
  next_cursor?: string | null;
};
