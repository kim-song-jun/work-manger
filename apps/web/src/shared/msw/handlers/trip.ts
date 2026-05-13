/** entities/trip — business trip requests + cancel. */
import { http } from "msw";

import { ok } from "./_envelope";

const SAMPLE = {
  id: "trip-1",
  start_date: "2026-05-20",
  end_date: "2026-05-21",
  destination: "부산 지사",
  purpose: "고객사 미팅",
  status: "PENDING",
};

export const tripHandlers = [
  http.get("*/v1/trip/requests", () => ok([SAMPLE])),
  http.post("*/v1/trip/requests", () => ok({ ...SAMPLE, id: "trip-new" })),
  http.post("*/v1/trip/requests/:id/cancel", ({ params }) =>
    ok({ ...SAMPLE, id: String(params.id), status: "CANCELLED" }),
  ),
];
