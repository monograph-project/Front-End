import IC from "./IC";
import Icon from "./Icon";

export default function CalendarCard() {
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const rows = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, null, null, null, null, null],
    [null, null, null, null, null, null, 11],
  ];
  // Simpler: show Oct 2025 grid
  const grid = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, null],
  ];
  const calEvents = [
    {
      title: "Mesh Weekly Meeting",
      time: "9.00 am - 10.00 am",
      platform: "On Google Meet",
      avatars: ["#6366f1", "#ec4899", "#f59e0b"],
    },
    {
      title: "Gamification Demo",
      time: "10.45 am - 11.45 am",
      platform: "On Slack",
      avatars: ["#10b981", "#6366f1", "#f97316"],
    },
  ];
  return (
    <div
      style={{
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: "16px 18px",
        width: 280,
        flexShrink: 0,
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--c-text-muted)",
              padding: 2,
            }}
          >
            <Icon d={IC.chevLeft} size={14} strokeWidth={2} />
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--c-text-primary)",
            }}
          >
            October 2025
          </span>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--c-text-muted)",
              padding: 2,
            }}
          >
            <Icon d={IC.chevRight} size={14} strokeWidth={2} />
          </button>
        </div>
        <Icon d={IC.moreV} size={14} stroke="var(--c-text-muted)" />
      </div>
      {/* Day headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7,1fr)",
          marginBottom: 4,
        }}
      >
        {days.map((d) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 10,
              color: "var(--c-text-muted)",
              fontWeight: 600,
              padding: "2px 0",
            }}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Days grid */}
      {[
        [null, null, null, null, 1, 2, 3],
        [4, 5, 6, 7, 8, 9, 10],
      ].map((row, ri) => (
        <div
          key={ri}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7,1fr)",
            marginBottom: 2,
          }}
        >
          {row.map((d, di) => (
            <div key={di} style={{ textAlign: "center", padding: "4px 0" }}>
              {d && (
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    margin: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: d === 8 ? "var(--c-accent)" : "transparent",
                    color: d === 8 ? "#fff" : "var(--c-text-primary)",
                    fontSize: 12,
                    fontWeight: d === 8 ? 700 : 400,
                    cursor: "pointer",
                  }}
                >
                  {d}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      {/* Events */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {calEvents.map((ev, i) => (
          <div
            key={i}
            style={{
              background: "var(--c-bg-card2)",
              borderRadius: 10,
              padding: "10px 12px",
              border: "1px solid var(--c-border-light)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--c-text-primary)",
                }}
              >
                {ev.title}
              </span>
              <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
                {ev.time}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                {ev.avatars.map((c, ai) => (
                  <div
                    key={ai}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: c,
                      border: "2px solid var(--c-bg-card)",
                      marginLeft: ai === 0 ? 0 : -6,
                    }}
                  />
                ))}
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--c-text-muted)",
                  background: "var(--c-bg-input)",
                  padding: "2px 8px",
                  borderRadius: 99,
                  border: "1px solid var(--c-border)",
                }}
              >
                {ev.platform}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
