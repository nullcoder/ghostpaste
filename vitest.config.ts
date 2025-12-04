import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.tsx"],
    include: ["**/*.{test,spec}.{js,jsx,ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/*.{test,spec}.*",
        ".next/",
        ".open-next/",
        ".wrangler/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@/components": path.resolve(__dirname, "./components"),
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/types": path.resolve(__dirname, "./types"),
      "@/app": path.resolve(__dirname, "./app"),
    },
  },
});
