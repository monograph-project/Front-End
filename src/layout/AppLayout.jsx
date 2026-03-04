import { useState } from "react";
import Sidebar from "./AppSideBar";
import AppHeader from "./AppHeader";
import ActionHeader from "./ActionHeader";
import Dashboard from "../pages/Dashboard";

export default function Applayout() {
  const LIGHT = {
    "--c-bg-app": "#f0eff4",
    "--c-bg-shell": "#ffffff",
    "--c-bg-sidebar": "#f9f9fb",
    "--c-bg-card": "#ffffff",
    "--c-bg-card2": "#f9f9fb",
    "--c-bg-nav-active": "#f3f0ff",
    "--c-bg-nav-hover": "#f5f5f8",
    "--c-bg-input": "#f5f5f8",
    "--c-bg-badge": "#f0edff",
    "--c-border": "#ebebf0",
    "--c-border-light": "#f2f2f5",
    "--c-text-primary": "#0f0f14",
    "--c-text-secondary": "#6b7280",
    "--c-text-muted": "#9ca3af",
    "--c-text-nav-active": "#7c3aed",
    "--c-accent": "#7c3aed",
    "--c-accent-light": "#ede9fe",
    "--c-accent-btn": "#7c3aed",
    "--c-green": "#10b981",
    "--c-red": "#ef4444",
    "--c-orange": "#f97316",
    "--c-purple-bar": "#7c3aed",
    "--c-bar-bg": "#ede9fe",
    "--c-storage-fill": "#ef4444",
    "--c-storage-bg": "#fee2e2",
    "--c-shadow": "0 1px 3px rgba(0,0,0,0.06),0 1px 2px rgba(0,0,0,0.04)",
    "--c-shadow-card": "0 0 0 1px rgba(0,0,0,0.05)",
  };
  const DARK = {
    "--c-bg-app": "#0c0c10",
    "--c-bg-shell": "#131318",
    "--c-bg-sidebar": "#0f0f14",
    "--c-bg-card": "#1a1a22",
    "--c-bg-card2": "#15151c",
    "--c-bg-nav-active": "#1e1830",
    "--c-bg-nav-hover": "#1a1a22",
    "--c-bg-input": "#1a1a22",
    "--c-bg-badge": "#1e1830",
    "--c-border": "#2a2a35",
    "--c-border-light": "#22222c",
    "--c-text-primary": "#f1f1f5",
    "--c-text-secondary": "#8b8fa8",
    "--c-text-muted": "#5a5f78",
    "--c-text-nav-active": "#a78bfa",
    "--c-accent": "#a78bfa",
    "--c-accent-light": "#1e1830",
    "--c-accent-btn": "#7c3aed",
    "--c-green": "#34d399",
    "--c-red": "#f87171",
    "--c-orange": "#fb923c",
    "--c-purple-bar": "#8b5cf6",
    "--c-bar-bg": "#2a2040",
    "--c-storage-fill": "#f87171",
    "--c-storage-bg": "#3a1a1a",
    "--c-shadow": "0 1px 3px rgba(0,0,0,0.3),0 1px 2px rgba(0,0,0,0.2)",
    "--c-shadow-card": "0 0 0 1px rgba(255,255,255,0.04)",
  };

  function injectTokens(tokens) {
    const vars = Object.entries(tokens)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");
    return `:root{${vars}}`;
  }
  const [theme, setTheme] = useState("light");
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  const tokens = theme === "light" ? LIGHT : DARK;
  return (
    <>
      <style>{`
        ${injectTokens(tokens)}
        * { box-sizing: border-box; margin:0; padding:0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { background: var(--c-bg-app); }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:var(--c-border); border-radius:99px; }
        button { font-family: inherit; }
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Outer shell — the grey app background with padding */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "var(--c-bg-app)",
          padding: 16,
          display: "flex",
        }}
      >
        {/* Unified card */}
        <div
          style={{
            flex: 1,
            display: "flex",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid var(--c-border)",
            boxShadow: "var(--c-shadow)",
            background: "var(--c-bg-shell)",
          }}
        >
          {/* Sidebar */}
          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            activeNav={activeNav}
            onNav={setActiveNav}
          />

          {/* Main area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "var(--c-bg-shell)",
            }}
          >
            <AppHeader
              theme={theme}
              onThemeToggle={() =>
                setTheme((t) => (t === "light" ? "dark" : "light"))
              }
            />
            <ActionHeader />
            <Dashboard />
          </div>
        </div>
      </div>
    </>
  );
}
