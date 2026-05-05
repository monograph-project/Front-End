import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gateway =
    env.VITE_DEV_PROXY_TARGET?.replace(/\/$/, "") || "http://localhost:8080";


  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // REST gateway (auth, users, blogs, notifications, VC under /api, etc.)
        "/api": { target: gateway, changeOrigin: true },
        "/file": { target: gateway, changeOrigin: true },
        "/auth": { target: gateway, changeOrigin: true },
        "/repos": { target: gateway, changeOrigin: true },
        "/students": { target: gateway, changeOrigin: true },
        "/departments": { target: gateway, changeOrigin: true },
        "/batches": { target: gateway, changeOrigin: true },
        "/teachers": { target: gateway, changeOrigin: true },
        "/employees": { target: gateway, changeOrigin: true },
      },
    },
  };
});
