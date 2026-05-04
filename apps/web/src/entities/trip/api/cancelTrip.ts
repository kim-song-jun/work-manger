import { api } from "@shared/api";
import type { Trip } from "../model/types";

type Envelope<T> = { data: T };

export async function cancelTrip(id: string): Promise<Trip> {
  const r = await api<Envelope<Trip>>(`/v1/trip/requests/${id}/cancel`, {
    method: "POST",
  });
  return r.data;
}
