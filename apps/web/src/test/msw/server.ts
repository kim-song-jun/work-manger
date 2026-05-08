/**
 * Node-side MSW server used by Vitest. Browser worker is intentionally NOT
 * registered in production: only the in-process Node handler exists.
 */
import { setupServer } from "msw/node";

import { handlers } from "./handlers";

export const server = setupServer(...handlers);
