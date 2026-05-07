import { api } from "@shared/api";
import type {
  OvertimeHistoryMonth,
  OvertimeRequest,
  OvertimeRequestBody,
  OvertimeSettings,
} from "../model/types";

type Envelope<T> = { data: T };
type BackendOvertimeSettings = {
  auto_request_enabled?: boolean;
  trigger_after_minutes?: number;
  max_weekly_minutes?: number;
  auto_enabled?: boolean;
  auto_threshold_minutes?: number;
};

function fromBackendSettings(settings: BackendOvertimeSettings): OvertimeSettings {
  return {
    auto_enabled: settings.auto_enabled ?? settings.auto_request_enabled ?? false,
    auto_threshold_minutes:
      settings.auto_threshold_minutes ?? settings.trigger_after_minutes ?? 30,
  };
}

function toBackendSettings(settings: OvertimeSettings): BackendOvertimeSettings {
  return {
    auto_request_enabled: settings.auto_enabled,
    trigger_after_minutes: settings.auto_threshold_minutes,
  };
}

export async function postOvertimeRequest(
  body: OvertimeRequestBody,
): Promise<OvertimeRequest> {
  const r = await api<Envelope<OvertimeRequest>>("/v1/overtime/requests", {
    method: "POST",
    json: body,
  });
  return r.data;
}

export async function fetchOvertimeRequests(): Promise<OvertimeRequest[]> {
  const r = await api<Envelope<OvertimeRequest[]>>("/v1/overtime/requests");
  return r.data;
}

export async function fetchOvertimeHistory(): Promise<OvertimeHistoryMonth[]> {
  const r = await api<Envelope<{ months: OvertimeHistoryMonth[] }>>(
    "/v1/overtime/history",
  );
  return r.data.months;
}

export async function fetchOvertimeSettings(): Promise<OvertimeSettings> {
  const r = await api<Envelope<BackendOvertimeSettings>>("/v1/overtime/settings");
  return fromBackendSettings(r.data);
}

export async function updateOvertimeSettings(
  settings: OvertimeSettings,
): Promise<OvertimeSettings> {
  const r = await api<Envelope<BackendOvertimeSettings>>("/v1/overtime/settings", {
    method: "PATCH",
    json: toBackendSettings(settings),
  });
  return fromBackendSettings(r.data);
}
