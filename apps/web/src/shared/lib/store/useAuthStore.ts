/** Zustand store for current session: access token + me snapshot. */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MeMembership {
  id: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN" | "OWNER";
  company: { id: string; name: string };
}

export interface MeUser {
  id: string;
  email: string;
  name: string;
  locale: "ko" | "en";
  is_email_verified: boolean;
  memberships: MeMembership[];
}

interface AuthState {
  accessToken: string | null;
  me: MeUser | null;
  setToken: (t: string | null) => void;
  setMe: (m: MeUser | null) => void;
  isAuthenticated: () => boolean;
  hasMembership: () => boolean;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      me: null,
      setToken: (t) => set({ accessToken: t }),
      setMe: (m) => set({ me: m }),
      isAuthenticated: () => Boolean(get().accessToken),
      hasMembership: () => Boolean(get().me?.memberships?.length),
      reset: () => set({ accessToken: null, me: null }),
    }),
    { name: "wm:auth", partialize: (s) => ({ accessToken: s.accessToken }) },
  ),
);
