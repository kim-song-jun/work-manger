import { api } from "@shared/api";
import type { Trip, TripStatus } from "../model/types";

type Envelope<T> = { data: T };

export type FetchTripsQuery = {
  status?: TripStatus;
};

export async function fetchTrips(query: FetchTripsQuery = {}): Promise<Trip[]> {
  const search = new URLSearchParams();
  if (query.status) search.set("status", query.status);
  const qs = search.toString();
  const path = qs ? `/v1/trip/requests?${qs}` : "/v1/trip/requests";
  const r = await api<Envelope<Trip[]>>(path);
  return r.data;
}
