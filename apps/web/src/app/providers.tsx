import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@shared/ui";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>{children}</BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
