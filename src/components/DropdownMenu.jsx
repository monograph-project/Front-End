import * as React from "react";
import { DropdownMenu } from "radix-ui";
import {
  CheckIcon,
  DotFilledIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

// ─── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --dm-bg: #0f0f11;
    --dm-surface: #18181c;
    --dm-surface-raised: #202026;
    --dm-border: rgba(255,255,255,0.07);
    --dm-border-hover: rgba(255,255,255,0.14);
    --dm-accent: #7c6af7;
    --dm-accent-soft: rgba(124,106,247,0.15);
    --dm-accent-glow: rgba(124,106,247,0.35);
    --dm-text-primary: #e8e8f0;
    --dm-text-secondary: #8888a0;
    --dm-text-disabled: #44445a;
    --dm-text-accent: #a89af9;
    --dm-danger: #f76a6a;
    --dm-danger-soft: rgba(247,106,106,0.12);
    --dm-success: #5ed4a0;
    --dm-warn: #f5a623;
    --dm-radius: 10px;
    --dm-radius-sm: 6px;
    --dm-shadow:
      0 0 0 1px rgba(255,255,255,0.06),
      0 8px 24px rgba(0,0,0,0.5),
      0 24px 48px rgba(0,0,0,0.3),
      0 0 0 0.5px rgba(124,106,247,0.2);
    --dm-font: 'DM Sans', sans-serif;
    --dm-font-mono: 'DM Mono', monospace;
  }

  /* ── Trigger Button ── */
  .dm-trigger {
    font-family: var(--dm-font);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--dm-surface);
    border: 1px solid var(--dm-border);
    border-radius: var(--dm-radius-sm);
    color: var(--dm-text-primary);
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
    letter-spacing: 0.01em;
  }
  .dm-trigger:hover {
    background: var(--dm-surface-raised);
    border-color: var(--dm-border-hover);
  }
  .dm-trigger:focus-visible {
    box-shadow: 0 0 0 2px var(--dm-accent-glow);
    border-color: var(--dm-accent);
  }
  .dm-trigger[data-state="open"] {
    background: var(--dm-surface-raised);
    border-color: var(--dm-accent);
    box-shadow: 0 0 0 2px var(--dm-accent-glow);
    color: var(--dm-text-accent);
  }
  .dm-trigger-icon {
    display: flex;
    align-items: center;
    color: var(--dm-text-secondary);
    transition: transform 0.2s ease, color 0.15s;
  }
  .dm-trigger[data-state="open"] .dm-trigger-icon {
    transform: rotate(180deg);
    color: var(--dm-text-accent);
  }

  /* ── Content Panel ── */
  .dm-content {
    font-family: var(--dm-font);
    min-width: 230px;
    background: var(--dm-surface);
    border-radius: var(--dm-radius);
    padding: 5px;
    box-shadow: var(--dm-shadow);
    border: 1px solid var(--dm-border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    z-index: 9999;
    overflow: hidden;
    transform-origin: var(--radix-dropdown-menu-content-transform-origin);
  }

  /* Entrance animations by side */
  .dm-content[data-side="bottom"] { animation: dm-slideUpFade 0.18s cubic-bezier(0.16,1,0.3,1); }
  .dm-content[data-side="top"]    { animation: dm-slideDownFade 0.18s cubic-bezier(0.16,1,0.3,1); }
  .dm-content[data-side="left"]   { animation: dm-slideRightFade 0.18s cubic-bezier(0.16,1,0.3,1); }
  .dm-content[data-side="right"]  { animation: dm-slideLeftFade 0.18s cubic-bezier(0.16,1,0.3,1); }

  @keyframes dm-slideUpFade   { from { opacity:0; transform:translateY(6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes dm-slideDownFade { from { opacity:0; transform:translateY(-6px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes dm-slideRightFade{ from { opacity:0; transform:translateX(-6px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
  @keyframes dm-slideLeftFade { from { opacity:0; transform:translateX(6px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }

  /* ── Base Item ── */
  .dm-item {
    font-family: var(--dm-font);
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
    min-height: 32px;
    padding: 0 10px 0 34px;
    border-radius: var(--dm-radius-sm);
    font-size: 13px;
    font-weight: 400;
    color: var(--dm-text-primary);
    cursor: pointer;
    user-select: none;
    outline: none;
    transition: background 0.1s, color 0.1s;
    letter-spacing: 0.01em;
  }
  .dm-item[data-highlighted] {
    background: var(--dm-accent-soft);
    color: var(--dm-text-accent);
  }
  .dm-item[data-disabled] {
    color: var(--dm-text-disabled);
    pointer-events: none;
  }
  .dm-item.dm-item--danger[data-highlighted] {
    background: var(--dm-danger-soft);
    color: var(--dm-danger);
  }
  .dm-item.dm-item--danger {
    color: var(--dm-danger);
  }

  /* Left icon slot */
  .dm-item-icon {
    position: absolute;
    left: 9px;
    display: flex;
    align-items: center;
    color: var(--dm-text-secondary);
    transition: color 0.1s;
    pointer-events: none;
  }
  .dm-item[data-highlighted] .dm-item-icon { color: var(--dm-text-accent); }
  .dm-item.dm-item--danger[data-highlighted] .dm-item-icon { color: var(--dm-danger); }

  /* Indicator (checkbox / radio) */
  .dm-item-indicator {
    position: absolute;
    left: 9px;
    display: flex;
    align-items: center;
    width: 16px;
    color: var(--dm-accent);
  }

  /* Shortcut badge */
  .dm-shortcut {
    font-family: var(--dm-font-mono);
    margin-left: auto;
    padding-left: 16px;
    font-size: 10.5px;
    font-weight: 500;
    color: var(--dm-text-disabled);
    letter-spacing: 0.04em;
    transition: color 0.1s;
    pointer-events: none;
  }
  .dm-item[data-highlighted] .dm-shortcut { color: var(--dm-text-secondary); }

  /* Badge */
  .dm-badge {
    margin-left: auto;
    padding: 1px 6px;
    border-radius: 99px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    pointer-events: none;
  }
  .dm-badge--new {
    background: var(--dm-accent-soft);
    color: var(--dm-text-accent);
    border: 1px solid rgba(124,106,247,0.25);
  }
  .dm-badge--warn {
    background: rgba(245,166,35,0.12);
    color: var(--dm-warn);
    border: 1px solid rgba(245,166,35,0.2);
  }

  /* ── Label ── */
  .dm-label {
    font-family: var(--dm-font);
    padding: 6px 10px 4px 10px;
    font-size: 10px;
    font-weight: 600;
    color: var(--dm-text-secondary);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    user-select: none;
  }

  /* ── Separator ── */
  .dm-separator {
    height: 1px;
    background: var(--dm-border);
    margin: 4px 5px;
  }

  /* ── Arrow ── */
  .dm-arrow {
    fill: var(--dm-surface);
    filter: drop-shadow(0 -1px 0 rgba(255,255,255,0.06));
  }

  /* ── Sub Trigger ── */
  .dm-subtrigger[data-state="open"] {
    background: var(--dm-accent-soft);
    color: var(--dm-text-accent);
  }
  .dm-subtrigger[data-state="open"] .dm-item-icon { color: var(--dm-text-accent); }
  .dm-subtrigger .dm-chevron {
    margin-left: auto;
    padding-left: 16px;
    color: var(--dm-text-secondary);
    transition: color 0.1s;
    display: flex;
    align-items: center;
  }
  .dm-subtrigger[data-highlighted] .dm-chevron,
  .dm-subtrigger[data-state="open"] .dm-chevron { color: var(--dm-text-accent); }
`;

// Inject styles once into head
function useStyleInjection() {
  React.useEffect(() => {
    if (document.getElementById("dm-styles")) return;
    const tag = document.createElement("style");
    tag.id = "dm-styles";
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    return () => {
      /* styles persist intentionally */
    };
  }, []);
}

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Root — controls open state */
export const DropdownMenuRoot = DropdownMenu.Root;

/** Shortcut text (⌘K etc.) */
export const DropdownShortcut = ({ children }) => (
  <span className="dm-shortcut">{children}</span>
);

/** Badge (NEW, BETA, etc.) */
export const DropdownBadge = ({ children, variant = "new" }) => (
  <span className={`dm-badge dm-badge--${variant}`}>{children}</span>
);

// ─── Trigger ──────────────────────────────────────────────────────────────────
/**
 * DropdownTrigger
 * @param {React.ReactNode} children  — label text
 * @param {React.ReactNode} icon      — optional left icon
 * @param {boolean}         showArrow — show animated chevron (default true)
 * @param {string}          className — extra classes
 */
export const DropdownTrigger = React.forwardRef(
  ({ children, icon, showArrow = true, className = "", ...props }, ref) => {
    useStyleInjection();
    return (
      <DropdownMenu.Trigger asChild>
        <button ref={ref} className={`dm-trigger ${className}`} {...props}>
          {icon && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                color: "var(--dm-text-secondary)",
              }}
            >
              {icon}
            </span>
          )}
          {children}
          {showArrow && (
            <span className="dm-trigger-icon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 4.5L6 8L9.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </button>
      </DropdownMenu.Trigger>
    );
  },
);
DropdownTrigger.displayName = "DropdownTrigger";

// ─── Content ──────────────────────────────────────────────────────────────────
/**
 * DropdownContent
 * @param {number}  sideOffset — gap from trigger (default 6)
 * @param {string}  align      — "start"|"center"|"end" (default "start")
 * @param {boolean} arrow      — show pointing arrow (default false)
 */
export const DropdownContent = React.forwardRef(
  (
    {
      children,
      sideOffset = 6,
      align = "start",
      arrow = false,
      className = "",
      ...props
    },
    ref,
  ) => (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={`dm-content ${className}`}
        {...props}
      >
        {children}
        {arrow && <DropdownMenu.Arrow className="dm-arrow" />}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  ),
);
DropdownContent.displayName = "DropdownContent";

// ─── Item ─────────────────────────────────────────────────────────────────────
/**
 * DropdownItem
 * @param {React.ReactNode} icon      — optional leading icon
 * @param {boolean}         danger    — red destructive styling
 * @param {function}        onSelect  — callback
 */
export const DropdownItem = React.forwardRef(
  (
    { children, icon, danger = false, className = "", onSelect, ...props },
    ref,
  ) => (
    <DropdownMenu.Item
      ref={ref}
      className={`dm-item ${danger ? "dm-item--danger" : ""} ${className}`}
      onSelect={onSelect}
      {...props}
    >
      {icon && <span className="dm-item-icon">{icon}</span>}
      {children}
    </DropdownMenu.Item>
  ),
);
DropdownItem.displayName = "DropdownItem";

// ─── CheckboxItem ─────────────────────────────────────────────────────────────
export const DropdownCheckboxItem = React.forwardRef(
  ({ children, checked, onCheckedChange, className = "", ...props }, ref) => (
    <DropdownMenu.CheckboxItem
      ref={ref}
      className={`dm-item ${className}`}
      checked={checked}
      onCheckedChange={onCheckedChange}
      {...props}
    >
      <DropdownMenu.ItemIndicator className="dm-item-indicator">
        <CheckIcon width={14} height={14} />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.CheckboxItem>
  ),
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

// ─── RadioGroup & RadioItem ───────────────────────────────────────────────────
export const DropdownRadioGroup = DropdownMenu.RadioGroup;

export const DropdownRadioItem = React.forwardRef(
  ({ children, value, className = "", ...props }, ref) => (
    <DropdownMenu.RadioItem
      ref={ref}
      className={`dm-item ${className}`}
      value={value}
      {...props}
    >
      <DropdownMenu.ItemIndicator className="dm-item-indicator">
        <DotFilledIcon width={14} height={14} />
      </DropdownMenu.ItemIndicator>
      {children}
    </DropdownMenu.RadioItem>
  ),
);
DropdownRadioItem.displayName = "DropdownRadioItem";

// ─── Sub Menu ─────────────────────────────────────────────────────────────────
export const DropdownSub = DropdownMenu.Sub;

export const DropdownSubTrigger = React.forwardRef(
  ({ children, icon, className = "", ...props }, ref) => (
    <DropdownMenu.SubTrigger
      ref={ref}
      className={`dm-item dm-subtrigger ${className}`}
      {...props}
    >
      {icon && <span className="dm-item-icon">{icon}</span>}
      {children}
      <span className="dm-chevron">
        <ChevronRightIcon width={13} height={13} />
      </span>
    </DropdownMenu.SubTrigger>
  ),
);
DropdownSubTrigger.displayName = "DropdownSubTrigger";

export const DropdownSubContent = React.forwardRef(
  (
    { children, sideOffset = 6, alignOffset = -4, className = "", ...props },
    ref,
  ) => (
    <DropdownMenu.Portal>
      <DropdownMenu.SubContent
        ref={ref}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={`dm-content ${className}`}
        {...props}
      >
        {children}
      </DropdownMenu.SubContent>
    </DropdownMenu.Portal>
  ),
);
DropdownSubContent.displayName = "DropdownSubContent";

// ─── Separator & Label ────────────────────────────────────────────────────────
export const DropdownSeparator = () => (
  <DropdownMenu.Separator className="dm-separator" />
);

export const DropdownLabel = ({ children }) => (
  <DropdownMenu.Label className="dm-label">{children}</DropdownMenu.Label>
);

export const DropdownGroup = DropdownMenu.Group;

// ─────────────────────────────────────────────────────────────────────────────
// DEMO — shows every feature of the component system
// Remove this export and file below when using in your own project
// ─────────────────────────────────────────────────────────────────────────────

// SVG icon helpers (inline — no external dependency needed)
const Icon = ({ d, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path
      d={d}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ICONS = {
  user: "M8 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 9a5 5 0 0 1 10 0",
  settings:
    "M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM13.5 8c0-.46-.06-.9-.17-1.32l1.9-1.1-1.5-2.6-1.9 1.1A5.5 5.5 0 0 0 9.5 3V1h-3v2a5.5 5.5 0 0 0-2.33 1.08L2.27 2.98l-1.5 2.6 1.9 1.1C2.56 7.1 2.5 7.54 2.5 8s.06.9.17 1.32l-1.9 1.1 1.5 2.6 1.9-1.1A5.5 5.5 0 0 0 6.5 13v2h3v-2a5.5 5.5 0 0 0 2.33-1.08l1.9 1.1 1.5-2.6-1.9-1.1c.11-.42.17-.86.17-1.32z",
  team: "M11 7a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-4 9a5 5 0 0 1 10 0m5-9a5 5 0 0 1 4.5 7",
  billing: "M1 4h14v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4zm0 3h14",
  invite: "M14 8H2m8-4 4 4-4 4",
  keyboard: "M1 4h14v8H1V4zm3 4h.01M7 8h.01M10 8h.01M4 10.5h8",
  github:
    "M8 1a7 7 0 0 0-2.21 13.64c.35.06.48-.15.48-.34l-.01-1.32c-1.94.42-2.35-.94-2.35-.94-.32-.81-.78-1.02-.78-1.02-.64-.44.05-.43.05-.43.7.05 1.07.72 1.07.72.62 1.06 1.63.76 2.03.58.06-.45.24-.76.44-.93-1.55-.18-3.18-.78-3.18-3.46 0-.76.27-1.39.72-1.88-.07-.18-.31-.9.07-1.87 0 0 .59-.19 1.92.71A6.66 6.66 0 0 1 8 4.88c.6 0 1.2.08 1.76.24 1.33-.9 1.92-.71 1.92-.71.38.97.14 1.69.07 1.87.45.49.72 1.12.72 1.88 0 2.69-1.64 3.28-3.2 3.45.25.22.48.65.48 1.3l-.01 1.94c0 .19.13.4.48.34A7 7 0 0 0 8 1z",
  docs: "M4 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm0 4h8M4 9h5",
  logout: "M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3m4-10 4 4-4 4m4-4H6",
  palette:
    "M8 1a7 7 0 1 0 6.33 10 2 2 0 0 0-2-3H11a2 2 0 0 1-2-2 2 2 0 0 0-1-1.73",
  export: "M8 1v8m-4-3 4-4 4 4M2 13h12",
  copy: "M5 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2M6 1h7a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z",
  trash:
    "M2 4h12m-9 0V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1m2 0v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4",
};

export function DropdownMenuDemo() {
  const [theme, setTheme] = React.useState("dark");
  const [notifications, setNotifications] = React.useState(true);
  const [compact, setCompact] = React.useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0d",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        fontFamily: "var(--dm-font, 'DM Sans', sans-serif)",
        padding: "40px 20px",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(124,106,247,0.08) 0%, transparent 70%)",
        }}
      />

      <div style={{ textAlign: "center", position: "relative" }}>
        <p
          style={{
            fontFamily: "var(--dm-font-mono, 'DM Mono', monospace)",
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: "var(--dm-accent, #7c6af7)",
            textTransform: "uppercase",
            marginBottom: "10px",
            opacity: 0.9,
          }}
        >
          Reusable Component
        </p>
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 600,
            color: "#e8e8f0",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Dropdown Menu System
        </h1>
        <p style={{ color: "#8888a0", fontSize: "14px", marginTop: "8px" }}>
          Built on Radix UI · Fully Reusable · Zero-dependency styling
        </p>
      </div>

      {/* ── DEMO GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          width: "100%",
          maxWidth: "760px",
          position: "relative",
        }}
      >
        {/* ① Profile menu */}
        <DemoCard label="Profile Menu">
          <DropdownMenuRoot>
            <DropdownTrigger icon={<Icon d={ICONS.user} />}>
              My Account
            </DropdownTrigger>
            <DropdownContent arrow>
              <DropdownLabel>Workspace</DropdownLabel>
              <DropdownItem icon={<Icon d={ICONS.user} />}>
                Profile
                <DropdownShortcut>⌘P</DropdownShortcut>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.settings} />}>
                Settings
                <DropdownShortcut>⌘,</DropdownShortcut>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.team} />}>
                Team
                <DropdownBadge variant="new">NEW</DropdownBadge>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.billing} />}>
                Billing
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={<Icon d={ICONS.logout} />} danger>
                Sign out
                <DropdownShortcut>⇧⌘Q</DropdownShortcut>
              </DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
        </DemoCard>

        {/* ② With submenus */}
        <DemoCard label="Nested Submenus">
          <DropdownMenuRoot>
            <DropdownTrigger icon={<Icon d={ICONS.settings} />}>
              Options
            </DropdownTrigger>
            <DropdownContent>
              <DropdownItem icon={<Icon d={ICONS.copy} />}>
                Duplicate
                <DropdownShortcut>⌘D</DropdownShortcut>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.export} />}>
                Export
              </DropdownItem>
              <DropdownSeparator />
              <DropdownSub>
                <DropdownSubTrigger icon={<Icon d={ICONS.docs} />}>
                  More Tools
                </DropdownSubTrigger>
                <DropdownSubContent>
                  <DropdownItem icon={<Icon d={ICONS.github} />}>
                    View on GitHub
                  </DropdownItem>
                  <DropdownItem icon={<Icon d={ICONS.docs} />}>
                    Documentation
                    <DropdownBadge variant="warn">BETA</DropdownBadge>
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownSub>
                    <DropdownSubTrigger>Advanced</DropdownSubTrigger>
                    <DropdownSubContent>
                      <DropdownItem icon={<Icon d={ICONS.keyboard} />}>
                        Keyboard Shortcuts
                        <DropdownShortcut>?</DropdownShortcut>
                      </DropdownItem>
                      <DropdownItem>Developer Mode</DropdownItem>
                    </DropdownSubContent>
                  </DropdownSub>
                </DropdownSubContent>
              </DropdownSub>
              <DropdownSeparator />
              <DropdownItem icon={<Icon d={ICONS.trash} />} danger>
                Delete
                <DropdownShortcut>⌫</DropdownShortcut>
              </DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
        </DemoCard>

        {/* ③ Checkbox + Radio */}
        <DemoCard label="Toggles & Selections">
          <DropdownMenuRoot>
            <DropdownTrigger icon={<Icon d={ICONS.palette} />}>
              Preferences
            </DropdownTrigger>
            <DropdownContent>
              <DropdownLabel>View</DropdownLabel>
              <DropdownCheckboxItem
                checked={notifications}
                onCheckedChange={setNotifications}
              >
                Notifications
              </DropdownCheckboxItem>
              <DropdownCheckboxItem
                checked={compact}
                onCheckedChange={setCompact}
              >
                Compact mode
              </DropdownCheckboxItem>
              <DropdownSeparator />
              <DropdownLabel>Theme</DropdownLabel>
              <DropdownRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownRadioItem value="dark">Dark</DropdownRadioItem>
                <DropdownRadioItem value="light">Light</DropdownRadioItem>
                <DropdownRadioItem value="system">System</DropdownRadioItem>
              </DropdownRadioGroup>
              <DropdownSeparator />
              <DropdownItem icon={<Icon d={ICONS.invite} />}>
                Invite people
              </DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
        </DemoCard>

        {/* ④ Disabled items */}
        <DemoCard label="Disabled States">
          <DropdownMenuRoot>
            <DropdownTrigger showArrow={false}>Actions</DropdownTrigger>
            <DropdownContent align="center">
              <DropdownItem icon={<Icon d={ICONS.copy} />}>
                Copy link
                <DropdownShortcut>⌘C</DropdownShortcut>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.export} />} disabled>
                Export PDF
                <DropdownBadge variant="warn">SOON</DropdownBadge>
              </DropdownItem>
              <DropdownItem icon={<Icon d={ICONS.team} />} disabled>
                Share to team
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={<Icon d={ICONS.trash} />} danger>
                Delete forever
              </DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
        </DemoCard>
      </div>

      {/* State display */}
      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "8px",
          padding: "12px 20px",
          fontFamily: "var(--dm-font-mono, monospace)",
          fontSize: "12px",
          color: "#8888a0",
          letterSpacing: "0.02em",
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <span>
          theme: <span style={{ color: "#a89af9" }}>{theme}</span>
        </span>
        <span>
          notifications:{" "}
          <span style={{ color: notifications ? "#5ed4a0" : "#f76a6a" }}>
            {String(notifications)}
          </span>
        </span>
        <span>
          compact:{" "}
          <span style={{ color: compact ? "#5ed4a0" : "#f76a6a" }}>
            {String(compact)}
          </span>
        </span>
      </div>
    </div>
  );
}

// Small demo card wrapper
function DemoCard({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "24px 20px",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          color: "#8888a0",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

export default DropdownMenuDemo;
