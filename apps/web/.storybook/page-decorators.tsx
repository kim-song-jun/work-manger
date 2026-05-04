/**
 * Story decorators for page-level stories.
 *
 * Wraps each page in MemoryRouter (so `<Link>` works) and a fresh
 * QueryClientProvider (so cache state never leaks between stories). i18n is
 * already initialized by `preview.ts` (shares the production bundle so
 * stories render real Korean copy).
 */
import type { Decorator } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../src/shared/ui";

export const withPageProviders =
  (initialEntries: string[] = ["/"]): Decorator =>
  (Story) => {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    return (
      <QueryClientProvider client={qc}>
        <ToastProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <Story />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>
    );
  };
