import { api, HttpError } from "@shared/api";
import type {
  OvertimeRequest,
  OvertimeRequestBody,
  OvertimeSettings,
} from "../model/types";

type Envelope<T> = { data: T };

export async function postOvertimeRequest(
  body: OvertimeRequestBody,
): Promise<OvertimeRequest> {
  try {
    const r = await api<Envelope<OvertimeRequest>>("/v1/overtime/requests", {
      method: "POST",
      json: body,
    });
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      // Backend stub: pretend success for UI demo end-to-end.
      return {
        id: "stub-" + Date.now(),
        work_date: body.work_date,
        requested_minutes: body.requested_minutes,
        reason: body.reason,
        status: "PENDING",
        created_at: new Date().toISOString(),
      };
    }
    throw e;
  }
}

export async function fetchOvertimeRequests(): Promise<OvertimeRequest[]> {
  try {
    const r = await api<Envelope<OvertimeRequest[]>>("/v1/overtime/requests");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}

export async function fetchOvertimeHistory(): Promise<OvertimeRequest[]> {
  try {
    const r = await api<Envelope<OvertimeRequest[]>>("/v1/overtime/history");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return [];
    throw e;
  }
}

export async function fetchOvertimeSettings(): Promise<OvertimeSettings> {
  try {
    const r = await api<Envelope<OvertimeSettings>>("/v1/overtime/settings");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      return { auto_enabled: false, auto_threshold_minutes: 30 };
    }
    throw e;
  }
}
