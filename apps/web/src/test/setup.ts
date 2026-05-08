/**
 * Vitest global setup.
 *
 * - Adds @testing-library/jest-dom matchers.
 * - Initializes minimal i18n (./i18n-test).
 * - Boots a Node MSW server so unit tests do not touch the network.
 *   `onUnhandledRequest: 'error'` forces every test to either rely on a
 *   handler in `./msw/handlers.ts` or call `server.use(...)` to override.
 */
import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";

import "./i18n-test";
import { server } from "./msw/server";

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // msw v2 installs a non-writable `WebSocket` polyfill on the global. Some
  // page tests assign a no-op WebSocket constructor to silence websocket-using
  // hooks under jsdom; make the property writable + configurable so those
  // assignments still succeed.
  try {
    Object.defineProperty(globalThis, "WebSocket", {
      value: (globalThis as { WebSocket?: unknown }).WebSocket ?? class {},
      writable: true,
      configurable: true,
    });
  } catch {
    /* ignore - already writable */
  }
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
