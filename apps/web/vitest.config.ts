import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@app": path.resolve(__dirname, "src/app"),
      "@processes": path.resolve(__dirname, "src/processes"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@widgets": path.resolve(__dirname, "src/widgets"),
      "@features": path.resolve(__dirname, "src/features"),
      "@entities": path.resolve(__dirname, "src/entities"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    // Container memory cap: the default `threads` pool spawns a worker per CPU
    // and each worker holds its own jsdom + module graph, blowing past the
    // ~1.5GB Node heap inside `wm-web` and OOM-killing `npm run test`.
    // `forks` + `singleFork` runs every test file inside a single forked
    // process, capping peak RSS at one worker's worth of jsdom + modules.
    // We KEEP `isolate: true` (default) so each file still gets a fresh
    // module graph — dropping isolation leaks zustand store / fetch mock
    // state between files (e.g. m-leave-apply vs auth) and breaks tests
    // that assume module-level cleanup. Single-fork alone is enough to
    // bring peak RSS from ~1.4GB → ~500MB and let `npm run test` complete.
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Coverage gate scope:
      //  - Phase 0/1 covers `shared/*` (UI atoms + api client + stores) and the
      //    `features/auth` slice owned by this agent. Other slices (clock-in,
      //    leave-apply, mobile/admin pages, processes, widgets) ship their
      //    own tests in subsequent phases — including them now would dilute
      //    the gate and mask regressions in tested code.
      include: [
        "src/shared/api/**/*.{ts,tsx}",
        "src/shared/lib/store/**/*.{ts,tsx}",
        "src/shared/ui/**/*.{ts,tsx}",
        "src/features/auth/ui/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.stories.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/index.ts",
      ],
      thresholds: {
        // Phase 1 prep — bumped from Phase 0 baseline (50/60/50/40) once
        // shared/ui + shared/api + shared/lib/store have unit tests in place.
        // Tests must keep passing at these numbers; if a slice regresses,
        // bump the tests, not the threshold.
        lines: 65,
        functions: 75,
        statements: 65,
        branches: 50,
      },
    },
  },
});
