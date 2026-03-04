import IC from "../components/IC";
import Icon from "../components/Icon";

export default function ActionHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: "1px solid var(--c-border)",
        gap: 10,
        background: "var(--c-bg-card)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
        <Icon
          d={IC.check}
          size={13}
          stroke="var(--c-green)"
          strokeWidth={2.5}
        />
        <span
          style={{ fontSize: 11, color: "var(--c-green)", fontWeight: 500 }}
        >
          Last updated now
        </span>
      </div>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--c-border)",
          background: "var(--c-bg-card)",
          color: "var(--c-text-secondary)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <Icon d={IC.customize} size={12} strokeWidth={1.5} />
        Customize Widget
      </button>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--c-border)",
          background: "var(--c-bg-card)",
          color: "var(--c-text-secondary)",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <Icon d={IC.import} size={12} strokeWidth={1.5} />
        Imports
        <Icon
          d={IC.chevDown}
          size={11}
          stroke="var(--c-text-muted)"
          strokeWidth={2}
        />
      </button>
      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 14px",
          borderRadius: 8,
          border: "none",
          background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
          color: "#fff",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <Icon d={IC.export} size={12} stroke="#fff" strokeWidth={2} />
        Exports
        <Icon d={IC.chevDown} size={11} stroke="#fff" strokeWidth={2} />
      </button>
    </div>
  );
}
