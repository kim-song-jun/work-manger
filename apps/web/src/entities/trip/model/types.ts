export type TripKind = "BUSINESS_TRIP" | "FIELD_WORK";

export type TripStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type Trip = {
  id: string;
  kind: TripKind;
  start_date: string; // YYYY-MM-DD
  end_date: string;
  location_label: string;
  purpose: string;
  status: TripStatus;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateTripBody = {
  kind: TripKind;
  start_date: string;
  end_date: string;
  location_label: string;
  purpose?: string;
};
