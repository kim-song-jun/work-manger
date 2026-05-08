import { api, HttpError } from "@shared/api";

import type { CompanySubscription, Invoice } from "../model/types";

type Envelope<T> = { data: T };

/** GET /v1/billing/subscription — OWNER-only. Returns null when 404. */
export async function fetchSubscription(): Promise<CompanySubscription | null> {
  try {
    const r = await api<Envelope<CompanySubscription>>("/v1/billing/subscription");
    return r.data;
  } catch (e) {
    // F-OWNER-07: 404 means "no subscription provisioned yet" — branch to CTA
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}

/** GET /v1/billing/invoices — OWNER-only, newest first. */
export async function fetchInvoices(): Promise<Invoice[]> {
  const r = await api<Envelope<Invoice[]>>("/v1/billing/invoices");
  return Array.isArray(r.data) ? r.data : [];
}
