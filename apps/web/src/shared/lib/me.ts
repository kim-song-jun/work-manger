import { useQuery } from "@tanstack/react-query";
import { api, HttpError } from "@shared/api";

export type Membership = {
  org_id: string;
  org_name?: string;
  role?: string;
};

export type Me = {
  id: string;
  email: string;
  name?: string;
  memberships: Membership[];
};

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
