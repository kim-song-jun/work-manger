import { api } from "@shared/api";

/** POST /v1/attendance/break/start */
export async function startBreak(): Promise<void> {
  await api("/v1/attendance/break/start", { method: "POST" });
}

/** POST /v1/attendance/break/end */
export async function endBreak(): Promise<void> {
  await api("/v1/attendance/break/end", { method: "POST" });
}
