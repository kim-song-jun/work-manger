/** entities/notice — company-wide announcements (read-only for EMPLOYEE). */
import { http } from "msw";

import { ok } from "./_envelope";

const SAMPLE = {
  id: "notice-1",
  title: "5월 정기 점검 안내",
  body: "5월 15일 오전 2시부터 30분간 점검이 진행됩니다.",
  pinned: true,
  published_at: "2026-05-10T00:00:00Z",
  published_by: { id: "admin-1", name: "Admin Acme" },
};

export const noticeHandlers = [
  http.get("*/v1/notices", () => ok([SAMPLE])),
  http.get("*/v1/notices/:id", ({ params }) => ok({ ...SAMPLE, id: String(params.id) })),
];
