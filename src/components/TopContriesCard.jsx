import IC from "./IC";
import Icon from "./Icon";

export default function TopCountryCard() {
  const countries = [
    { name: "Australia", flag: "🇦🇺", pct: 48 },
    { name: "Malaysia", flag: "🇲🇾", pct: 33 },
    { name: "Indonesia", flag: "🇮🇩", pct: 25 },
    { name: "Singapore", flag: "🇸🇬", pct: 17 },
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
          Top Country
        </span>
        <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
      </div>
      {/* Map placeholder with purple blobs */}
      <div
        style={{
          height: 100,
          background: "var(--c-bg-card2)",
          borderRadius: 10,
          marginBottom: 14,
          overflow: "hidden",
          position: "relative",
          border: "1px solid var(--c-border-light)",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 100"
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Simplified world-blob shapes for SE Asia/Pacific */}
          <ellipse
            cx="220"
            cy="50"
            rx="35"
            ry="22"
            fill="#7c3aed"
            opacity="0.18"
          />
          <ellipse
            cx="215"
            cy="48"
            rx="18"
            ry="12"
            fill="#7c3aed"
            opacity="0.5"
          />
          <ellipse
            cx="240"
            cy="60"
            rx="12"
            ry="8"
            fill="#a78bfa"
            opacity="0.5"
          />
          <ellipse
            cx="200"
            cy="62"
            rx="10"
            ry="6"
            fill="#6d28d9"
            opacity="0.4"
          />
          <ellipse
            cx="255"
            cy="45"
            rx="14"
            ry="8"
            fill="#7c3aed"
            opacity="0.35"
          />
          {/* dots */}
          <circle cx="215" cy="48" r="3" fill="#7c3aed" />
          <circle cx="240" cy="60" r="2.5" fill="#a78bfa" />
          <circle cx="200" cy="62" r="2" fill="#6d28d9" />
        </svg>
        {/* expand icon */}
        <button
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "var(--c-bg-card)",
            border: "1px solid var(--c-border)",
            borderRadius: 6,
            padding: "3px 5px",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <Icon
            d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
            size={11}
            stroke="var(--c-text-muted)"
            strokeWidth={1.5}
          />
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {countries.map((c, i) => (
          <div
            key={c.name}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{ fontSize: 11, color: "var(--c-text-muted)", width: 14 }}
            >
              {i + 1}
            </span>
            <span style={{ fontSize: 14 }}>{c.flag}</span>
            <span
              style={{
                fontSize: 12,
                color: "var(--c-text-secondary)",
                flex: 1,
              }}
            >
              {c.name}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--c-text-primary)",
              }}
            >
              {c.pct}%
            </span>
          </div>
        ))}
        <button
          style={{
            marginTop: 4,
            fontSize: 11,
            color: "var(--c-accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          View more{" "}
          <Icon
            d={IC.chevRight}
            size={11}
            stroke="var(--c-accent)"
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}
