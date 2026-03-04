import IC from "../components/IC";
import Icon from "../components/Icon";

export default function AppHeader({ theme, onThemeToggle }) {
  return (
    <header
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid var(--c-border)",
        gap: 12,
        flexShrink: 0,
        background: "var(--c-bg-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <Icon
          d={IC.dashboard}
          size={16}
          stroke="var(--c-text-primary)"
          strokeWidth={1.5}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--c-text-primary)",
          }}
        >
          Dashboard
        </span>
      </div>
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--c-bg-input)",
          border: "1px solid var(--c-border)",
          borderRadius: 8,
          padding: "6px 12px",
          width: 180,
        }}
      >
        <Icon
          d={IC.search}
          size={13}
          stroke="var(--c-text-muted)"
          strokeWidth={2}
        />
        <span style={{ fontSize: 12, color: "var(--c-text-muted)" }}>
          Search AI Mode
        </span>
        <Icon
          d={IC.aiMode}
          size={12}
          stroke="var(--c-accent)"
          strokeWidth={1.5}
          style={{ marginLeft: "auto" }}
        />
      </div>
      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={onThemeToggle}
          style={{
            background: "var(--c-bg-input)",
            border: "1px solid var(--c-border)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--c-text-secondary)",
            display: "flex",
          }}
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            size={15}
            strokeWidth={1.5}
          />
        </button>
        <button
          style={{
            position: "relative",
            background: "var(--c-bg-input)",
            border: "1px solid var(--c-border)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--c-text-secondary)",
            display: "flex",
          }}
        >
          <Icon d={IC.bell} size={15} strokeWidth={1.5} />
        </button>
        <button
          style={{
            position: "relative",
            background: "var(--c-bg-input)",
            border: "1px solid var(--c-border)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--c-text-secondary)",
            display: "flex",
          }}
        >
          <Icon d={IC.mail} size={15} strokeWidth={1.5} />
          <div
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#ef4444",
              border: "1.5px solid var(--c-bg-card)",
            }}
          />
        </button>
        <button
          style={{
            background: "var(--c-bg-input)",
            border: "1px solid var(--c-border)",
            borderRadius: 8,
            padding: "6px 8px",
            cursor: "pointer",
            color: "var(--c-text-secondary)",
            display: "flex",
          }}
        >
          <Icon d={IC.share} size={15} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
