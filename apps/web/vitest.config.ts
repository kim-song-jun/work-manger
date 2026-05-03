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
    coverage: {
      reporter: ["text", "html", "lcov"],
      thresholds: {
        // 일정 수준 커버리지 강제 — Phase 1 출시 전 80%+ 목표.
        // Phase 0(현재): 50% 라인 / 60% 함수. 기능 슬라이스가 늘면서 임계 상향 조정.
        lines: 50,
        functions: 60,
        statements: 50,
        branches: 40,
      },
    },
  },
});
