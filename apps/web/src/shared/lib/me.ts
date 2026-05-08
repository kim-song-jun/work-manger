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
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // F-LIVE-002/F-LIVE-007: 5 min stale — prevents repeated /v1/me calls
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}
