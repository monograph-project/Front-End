import IC from "./IC";
import Icon from "./Icon";

export default function StatCard({
  icon,
  label,
  value,
  delta,
  deltaDir,
  period,
}) {
  const isUp = deltaDir === "up";
  return (
    <div
      style={{
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: "16px 18px",
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "var(--c-accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              d={icon}
              size={14}
              stroke="var(--c-accent)"
              strokeWidth={1.8}
            />
          </div>
          <span
            style={{
              fontSize: 12,
              color: "var(--c-text-secondary)",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
        </div>
        <Icon
          d={IC.moreH}
          size={14}
          stroke="var(--c-text-muted)"
          strokeWidth={1.5}
        />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--c-text-primary)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </span>
        <div
          style={{
            marginBottom: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Icon
              d={isUp ? IC.arrowUp : IC.arrowDown}
              size={11}
              stroke={isUp ? "var(--c-green)" : "var(--c-red)"}
              strokeWidth={2.5}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: isUp ? "var(--c-green)" : "var(--c-red)",
              }}
            >
              {delta}
            </span>
          </div>
          <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
            {period}
          </span>
        </div>
      </div>
    </div>
  );
}
