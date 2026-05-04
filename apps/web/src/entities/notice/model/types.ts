export type NoticeCategory = "policy" | "event" | "it" | "hr" | "general";

export type Notice = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  priority: number;
  category: NoticeCategory;
  published_at: string;
  archived_at: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
};

export type FetchNoticesQuery = {
  pinned?: boolean;
  category?: NoticeCategory;
  q?: string;
};
