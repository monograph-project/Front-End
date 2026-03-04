import IC from "../components/IC";
import Icon from "../components/Icon";

export default function Sidebar({ collapsed, onToggle, activeNav, onNav }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: IC.dashboard },
    { key: "deals", label: "Deals", icon: IC.deals },
    { key: "notes", label: "Notes", icon: IC.notes },
    { key: "calendar", label: "Calendar", icon: IC.calendar },
    { key: "reports", label: "Reports", icon: IC.reports },
    { key: "projects", label: "Projects", icon: IC.projects },
  ];
  const favItems = [
    { key: "companies", label: "Companies", icon: IC.company, count: "1,212" },
    { key: "contacts", label: "Contacts", icon: IC.contact, count: "898" },
    { key: "meetings", label: "Meetings", icon: IC.meeting, count: "32" },
  ];
  return (
    <aside
      style={{
        width: collapsed ? 64 : 200,
        minWidth: collapsed ? 64 : 200,
        background: "var(--c-bg-sidebar)",
        borderRight: "1px solid var(--c-border)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
        transition: "width 0.22s ease, min-width 0.22s ease",
        overflow: "hidden",
      }}
    >
      {/* Brand */}
      <div
        style={{
          padding: collapsed ? "18px 16px" : "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          borderBottom: "1px solid var(--c-border)",
          minHeight: 62,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon
                d={IC.zap}
                size={14}
                stroke="#fff"
                fill="#fff"
                strokeWidth={1}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--c-text-primary)",
                  lineHeight: 1,
                }}
              >
                Pivora
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: "var(--c-text-muted)",
                  lineHeight: 1.4,
                }}
              >
                CRM Platform
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg,#7c3aed,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              d={IC.zap}
              size={14}
              stroke="#fff"
              fill="#fff"
              strokeWidth={1}
            />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              color: "var(--c-text-muted)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
              display: "flex",
            }}
          >
            <Icon d={IC.collapse} size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* User */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 14px",
          borderBottom: "1px solid var(--c-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--c-bg-nav-hover)",
            borderRadius: 8,
            padding: collapsed ? "7px" : "7px 10px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 10,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            W
          </div>
          {!collapsed && (
            <>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--c-text-secondary)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                williams@mesh.com
              </span>
              <Icon
                d={IC.chevDown}
                size={12}
                stroke="var(--c-text-muted)"
                strokeWidth={2}
              />
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? "10px 8px" : "10px 10px",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {navItems.map((item) => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                width: "100%",
                padding: collapsed ? "9px" : "9px 10px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                marginBottom: 2,
                background: isActive ? "var(--c-bg-nav-active)" : "transparent",
                color: isActive
                  ? "var(--c-text-nav-active)"
                  : "var(--c-text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                textAlign: "left",
                transition: "background 0.12s, color 0.12s",
                justifyContent: collapsed ? "center" : "flex-start",
                position: "relative",
              }}
            >
              {isActive && !collapsed && (
                <div
                  style={{
                    position: "absolute",
                    left: -2,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    borderRadius: 4,
                    background: "var(--c-accent)",
                  }}
                />
              )}
              <Icon
                d={item.icon}
                size={15}
                stroke={
                  isActive ? "var(--c-text-nav-active)" : "var(--c-text-muted)"
                }
                strokeWidth={isActive ? 2 : 1.5}
              />
              {!collapsed && item.label}
            </button>
          );
        })}

        {/* Favorites */}
        {!collapsed && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 10px 6px",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--c-text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Favorites
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--c-text-muted)",
                    cursor: "pointer",
                    padding: 2,
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ···
                </button>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--c-text-muted)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <Icon d={IC.plus} size={12} />
                </button>
              </div>
            </div>
            {favItems.map((f) => (
              <button
                key={f.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  color: "var(--c-text-secondary)",
                  fontSize: 12,
                  cursor: "pointer",
                  marginBottom: 1,
                }}
              >
                <Icon
                  d={f.icon}
                  size={13}
                  stroke="var(--c-text-muted)"
                  strokeWidth={1.5}
                />
                <span style={{ flex: 1, textAlign: "left" }}>{f.label}</span>
                <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
                  {f.count}
                </span>
              </button>
            ))}

            {/* Projects */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 10px 6px",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--c-text-muted)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Projects
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--c-text-muted)",
                    cursor: "pointer",
                    padding: 2,
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ···
                </button>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--c-text-muted)",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <Icon d={IC.plus} size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Storage */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 14px",
          borderTop: "1px solid var(--c-border)",
        }}
      >
        {!collapsed && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: "var(--c-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Cloud Storage
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--c-text-secondary)",
                  fontWeight: 600,
                }}
              >
                90%
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 99,
                background: "var(--c-storage-bg)",
                marginBottom: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "90%",
                  borderRadius: 99,
                  background: "var(--c-storage-fill)",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 10,
                color: "var(--c-text-muted)",
                marginBottom: 8,
              }}
            >
              1.8 GB of 2 GB used
            </div>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                width: "100%",
                padding: "7px 10px",
                borderRadius: 8,
                border: "1px solid var(--c-border)",
                background: "var(--c-bg-card)",
                color: "var(--c-text-secondary)",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              <Icon d={IC.upload} size={12} stroke="var(--c-text-muted)" />
              Upgrade Storage
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  color: "var(--c-text-muted)",
                }}
              >
                (up to 25GB)
              </span>
            </button>
          </>
        )}
        <div style={{ marginTop: collapsed ? 0 : 8 }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: collapsed ? 9 : "8px 10px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "var(--c-text-secondary)",
              fontSize: 12,
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <Icon
              d={IC.settings}
              size={14}
              stroke="var(--c-text-muted)"
              strokeWidth={1.5}
            />
            {!collapsed && "Settings"}
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: collapsed ? 9 : "8px 10px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "var(--c-text-secondary)",
              fontSize: 12,
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
          >
            <Icon
              d={IC.help}
              size={14}
              stroke="var(--c-text-muted)"
              strokeWidth={1.5}
            />
            {!collapsed && "Help Center"}
          </button>
        </div>
      </div>
    </aside>
  );
}
