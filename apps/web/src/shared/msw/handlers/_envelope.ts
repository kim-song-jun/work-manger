/**
 * Shared envelope helper for MSW handler success bodies.
 * Matches the `{ data, ... }` shape documented in docs/api/api-spec.md.
 */
import { HttpResponse } from "msw";

export const ok = <T>(data: T, extra: Record<string, unknown> = {}) =>
  HttpResponse.json({ data, ...extra });
