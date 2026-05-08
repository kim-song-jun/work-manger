/**
 * Billing entity types — mirrors apps/billing/serializers.py.
 *
 * Stripe integration is deferred to iter14, so `external_id` and
 * `pdf_url` are typed as nullable strings (BE returns "" today, but
 * the iter14 webhook will fill them).
 */

export type SubscriptionStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED";

export type InvoiceStatus = "DRAFT" | "PAID" | "VOID";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly_krw: number;
  max_employees: number;
  features_jsonb: Record<string, unknown>;
  is_active: boolean;
}

export interface CompanySubscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  started_at: string;
  current_period_end: string | null;
  canceled_at: string | null;
}

export interface Invoice {
  id: string;
  amount_krw: number;
  status: InvoiceStatus;
  issued_at: string;
  paid_at: string | null;
  external_id: string;
  pdf_url: string;
}
