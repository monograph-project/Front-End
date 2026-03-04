import { useState } from "react";
import Icon from "./Icon";
import IC from "./IC";

export default function LeadsCard() {
  const [tab, setTab] = useState("Status");
  const tabs = ["Status", "Sources", "Qualification"];
  const leadsData = [
    { label: "Qualified", value: 65, color: "#7c3aed" },
    { label: "Contacted", value: 48, color: "#a78bfa" },
    { label: "Lost", value: 20, color: "#ef4444" },
    { label: "Won", value: 55, color: "#7c3aed" },
  ];
  return (
    <div
      style={{
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: "16px 18px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--c-text-primary)",
          }}
        >
          Leads Management
        </span>
        <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: tab === t ? "1px solid var(--c-border)" : "none",
              background: tab === t ? "var(--c-bg-card)" : "transparent",
              color:
                tab === t ? "var(--c-text-primary)" : "var(--c-text-muted)",
              fontSize: 11,
              fontWeight: tab === t ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {leadsData.map((l) => (
          <div
            key={l.label}
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span
              style={{
                width: 72,
                fontSize: 11,
                color: "var(--c-text-secondary)",
              }}
            >
              {l.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 99,
                background: "var(--c-bar-bg)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${l.value}%`,
                  borderRadius: 99,
                  background: l.color,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span
              style={{
                width: 28,
                fontSize: 11,
                color: "var(--c-text-muted)",
                textAlign: "right",
              }}
            >
              {l.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
