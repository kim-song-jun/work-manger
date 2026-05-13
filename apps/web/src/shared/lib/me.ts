import { useQuery } from "@tanstack/react-query";

import { api, HttpError } from "@shared/api";

import { useAuthStore, type MeMembership, type MeUser } from "./store/useAuthStore";

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
  // F-LIVE-003 (b-code-04 hardening): skip the network call when there is no
  // access token. /login mounts this hook to redirect already-authed users,
  // but firing GET /v1/me without a Bearer header produced a guaranteed 401
  // every cold-start and tripped console-smoke as a "regression".
  const hasToken = useAuthStore((s) => Boolean(s.accessToken));
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // F-LIVE-002/F-LIVE-007: 5 min stale — prevents repeated /v1/me calls
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: hasToken,
  });
}
