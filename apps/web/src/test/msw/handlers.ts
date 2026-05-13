/**
 * MSW handlers (test entry-point).
 *
 * B-CODE-07: handlers were moved to `apps/web/src/shared/msw/handlers/` so the
 * Storybook decorator + vitest setup share a single per-entity registry. This
 * file is kept for backward compat — any future handler should land under
 * `shared/msw/handlers/<entity>.ts` and join `handlers` via the index re-export.
 */
export { handlers } from "@shared/msw/handlers";
