import IC from "./IC";
import Icon from "./Icon";

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div
        style={{
          background: "var(--c-bg-card)",
          border: "1px solid var(--c-border)",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          minWidth: 120,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--c-text-secondary)",
            marginBottom: 4,
          }}
        >
          {label}, 2025
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--c-text-primary)",
          }}
        >
          ${(val / 1000).toFixed(2)}k
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--c-green)",
            display: "flex",
            alignItems: "center",
            gap: 3,
            marginTop: 2,
          }}
        >
          <Icon
            d={IC.arrowUp}
            size={10}
            stroke="var(--c-green)"
            strokeWidth={2.5}
          />{" "}
          2%
        </div>
      </div>
    );
  }
  return null;
}
export default CustomTooltip;
