import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const apiProxyTarget = process.env.API_PROXY_TARGET ?? "http://api:4455";
const wsProxyTarget = process.env.WS_PROXY_TARGET ?? "http://ws:4456";

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
  server: {
    host: "0.0.0.0",
    port: 4444,
    strictPort: true,
    allowedHosts: ["web"],
    proxy: {
      "/v1/ws": {
        target: wsProxyTarget,
        changeOrigin: true,
        ws: true,
      },
      "/v1": {
        target: apiProxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: { host: "0.0.0.0", port: 4444, strictPort: true },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react-vendor";
          if (id.includes("/@tanstack/")) return "query-vendor";
          if (id.includes("/@sentry/")) return "sentry-vendor";
          if (id.includes("/i18next") || id.includes("/react-i18next/")) return "i18n-vendor";
          if (id.includes("/react-hook-form/") || id.includes("/@hookform/") || id.includes("/zod/")) return "forms-vendor";
          if (id.includes("/react-router") || id.includes("/@remix-run/")) return "router-vendor";
          return "vendor";
        },
      },
    },
  },
});

