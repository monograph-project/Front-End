import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const gateway =
    env.VITE_DEV_PROXY_TARGET?.replace(/\/$/, "") || "http://localhost:8080";
  const legacy =
    env.VITE_LEGACY_DEV_PROXY_TARGET?.replace(/\/$/, "") ||
    "http://localhost:5000";
  /** When true, `/students` and `/departments` proxy to legacy (e.g. json-server) instead of the gateway. */
  const legacyStudents =
    env.VITE_DEV_PROXY_STUDENTS_TO_LEGACY === "true";

  const studentsDeptTarget = legacyStudents ? legacy : gateway;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        // REST gateway (auth, users, blogs, notifications, VC under /api, etc.)
        "/api": { target: gateway, changeOrigin: true },
        "/file": { target: gateway, changeOrigin: true },
        "/auth": { target: gateway, changeOrigin: true },
        "/repos": { target: gateway, changeOrigin: true },
        "/students": { target: studentsDeptTarget, changeOrigin: true },
        "/departments": { target: studentsDeptTarget, changeOrigin: true },
        "/batches": { target: studentsDeptTarget, changeOrigin: true },
        "/teachers": { target: studentsDeptTarget, changeOrigin: true },
        "/employees": { target: studentsDeptTarget, changeOrigin: true },
      },
    },
  };
});
