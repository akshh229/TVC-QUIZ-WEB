// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) {
              return "lucide";
            }
            if (id.includes("@supabase")) {
              return "supabase";
            }
            if (id.includes("framer-motion")) {
              return "framer-motion";
            }
            if (id.includes("@tanstack")) {
              return "tanstack";
            }
            return "vendor";
          }
        },
      },
    },
  },
});

