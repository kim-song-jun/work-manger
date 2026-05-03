import { useQuery } from "@tanstack/react-query";
import { api, HttpError } from "./api";
export async function fetchMe() {
    try {
        const r = await api("/v1/me");
        return r.data;
    }
    catch (e) {
        if (e instanceof HttpError && (e.status === 401 || e.status === 404)) {
            return null;
        }
        throw e;
    }
}
export function useMe() {
    return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}
