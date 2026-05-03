import { defineConfig } from "vite";
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
  server: {
    host: "0.0.0.0",
    port: 4444,
    strictPort: true,
    proxy: {
      "/v1": {
        target: process.env.VITE_API_URL ?? "http://api:4455",
        changeOrigin: true,
      },
    },
  },
  preview: { host: "0.0.0.0", port: 4444, strictPort: true },
});
