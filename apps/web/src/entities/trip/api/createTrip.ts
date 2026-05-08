import { api } from "@shared/api";

import type { CreateTripBody, Trip } from "../model/types";

type Envelope<T> = { data: T };

export async function createTrip(body: CreateTripBody): Promise<Trip> {
  const r = await api<Envelope<Trip>>("/v1/trip/requests", {
    method: "POST",
    json: body,
  });
  return r.data;
}
