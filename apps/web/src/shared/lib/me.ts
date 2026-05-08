import { useQuery } from "@tanstack/react-query";

import { api, HttpError } from "@shared/api";

import type { MeMembership, MeUser } from "./store/useAuthStore";

export type Membership = MeMembership;
export type Me = MeUser;

type MeEnvelope = { data: Me };

export async function fetchMe(): Promise<Me | null> {
  try {
    const r = await api<MeEnvelope>("/v1/me");
    return r.data;
  } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 404)) {
      return null;
    }
    throw e;
  }
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}
