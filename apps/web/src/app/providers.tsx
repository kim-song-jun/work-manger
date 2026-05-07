import { useEffect, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@shared/ui";
import { setAccessToken } from "@shared/api";
import { fetchMe } from "@entities/user";
import { useInboxStream } from "@shared/lib/realtime/useInboxStream";
import { useAuthStore } from "@shared/lib/store/useAuthStore";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <AuthBootstrap />
      <RealtimeSubscriptions />
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

function AuthBootstrap() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const me = useAuthStore((s) => s.me);
  const setStoreMe = useAuthStore((s) => s.setMe);
  const reset = useAuthStore((s) => s.reset);

  useEffect(() => {
    if (!accessToken || me) return;
    let cancelled = false;
    fetchMe()
      .then((next) => {
        if (cancelled) return;
        if (next) {
          setStoreMe(next);
        } else {
          setAccessToken(null);
          reset();
        }
      })
      .catch(() => {
        if (!cancelled) setStoreMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, me, reset, setStoreMe]);

  return null;
}

function RealtimeSubscriptions() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasMembership = useAuthStore((s) => Boolean(s.me?.memberships?.length));
  useInboxStream({ enabled: Boolean(accessToken && hasMembership), token: accessToken });
  return null;
}
