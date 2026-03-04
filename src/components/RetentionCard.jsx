import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart as BC,
} from "recharts";
import IC from "./IC";
import Icon from "./Icon";

export default function RetentionCard() {
  const retentionData = [
    { month: "Jun", sme: 55, start: 40, ent: 25 },
    { month: "Jul", sme: 60, start: 55, ent: 35 },
    { month: "Aug", sme: 50, start: 48, ent: 30 },
    { month: "Sep", sme: 80, start: 70, ent: 60, active: true },
    { month: "Oct", sme: 45, start: 40, ent: 28 },
    { month: "Nov", sme: 50, start: 45, ent: 32 },
    { month: "Dec", sme: 55, start: 50, ent: 35 },
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
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--c-text-primary)",
          }}
        >
          Retention Rate
        </span>
        <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: "var(--c-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          95%
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--c-green)",
            marginLeft: 8,
            fontWeight: 500,
          }}
        >
          +12% vs last month
        </span>
      </div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {[
          ["SMEs", "#7c3aed"],
          ["Startups", "#a78bfa"],
          ["Enterprises", "#c4b5fd"],
        ].map(([label, color]) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: color,
              }}
            />
            <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart
          data={retentionData}
          barSize={10}
          barGap={2}
          margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
        >
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "var(--c-text-muted)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "var(--c-text-muted)" }}
            domain={[0, 100]}
          />
          <Bar dataKey="sme" radius={[3, 3, 0, 0]} fill="#7c3aed" />
          <Bar dataKey="start" radius={[3, 3, 0, 0]} fill="#a78bfa" />
          <Bar dataKey="ent" radius={[3, 3, 0, 0]} fill="#c4b5fd" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
