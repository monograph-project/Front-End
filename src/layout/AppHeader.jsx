import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useTheme } from "../context/themContext";
import NotificationDropdown from "../components/NotificationDropdown";
import LanguageDropdown from "../components/LanguageDropDown";

// ─── Data ────────────────────────────────────────────────────────────────────

const NOTIFICATIONS = [
  {
    id: 1,
    type: "exam",
    avatar: "JW",
    color: "bg-success dark:bg-dark-success",
    title: "New exam scheduled",
    desc: "Math Exam has been added for Class 302 on Feb 15.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "attendance",
    avatar: "SA",
    color: "bg-warning dark:bg-dark-warning",
    title: "Attendance alert",
    desc: "Sarah Anderson was marked absent today.",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "message",
    avatar: "DR",
    color: "bg-accent dark:bg-dark-accent",
    title: "New message from Daniel Roberts",
    desc: "Can we reschedule Friday's session?",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    type: "report",
    avatar: "OB",
    color: "bg-secondary/30 dark:bg-dark-secondary/30",
    title: "Monthly report ready",
    desc: "February student performance report is available.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    type: "system",
    avatar: "SY",
    color: "bg-muted dark:bg-dark-muted",
    title: "System maintenance",
    desc: "Scheduled maintenance on Sun, 10 Mar at 2:00 AM.",
    time: "Yesterday",
    unread: false,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * Reusable icon button — consolidates the repeated p-2 / rounded-lg /
 * hover pattern that appeared on every action button.
 */
function HeaderIconButton({ onClick, active = false, ariaLabel, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
        p-2 rounded-lg flex items-center gap-1 cursor-pointer
        text-secondary dark:text-dark-secondary
        hover:bg-hover dark:hover:bg-dark-hover transition-colors
        ${active ? "bg-nav-active dark:bg-dark-nav-active" : ""}
      `}
    >
      {children}
    </button>
  );
}

/** Search input — extracted so the header JSX stays flat. */
function SearchInput({ placeholder }) {
  return (
    <div className="relative hidden lg:block">
      <input
        placeholder={placeholder}
        className="
          px-3 py-1.5 h-full text-xs rounded-lg outline-none
          w-44 xl:w-52 pl-7
          text-muted dark:text-dark-muted
          placeholder:text-muted dark:placeholder:text-dark-muted
          bg-input dark:bg-dark-input
          border border-default dark:border-dark-default
          focus:border-accent dark:focus:border-dark-accent
          transition-colors
        "
      />
      <Icon
        d={IC.search}
        className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 stroke-muted dark:stroke-dark-muted stroke-2 pointer-events-none"
      />
    </div>
  );
}

/** Notification bell with unread badge. */
function NotificationButton({ unreadCount, active, onClick }) {
  return (
    <div className="relative">
      <HeaderIconButton
        onClick={onClick}
        active={active}
        ariaLabel="Notifications"
      >
        <Icon d={IC.bell} className="size-4 stroke-[1.5]" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-accent dark:bg-dark-accent text-[8px] font-bold text-white leading-none">
            {unreadCount}
          </span>
        )}
      </HeaderIconButton>
      {active && <NotificationDropdown onClose={() => onClick(null)} />}
    </div>
  );
}

/** Language selector with globe icon + code label. */
function LanguageButton({ language, active, onClick, onChange, onClose }) {
  return (
    <div className="relative">
      <HeaderIconButton onClick={onClick} active={active} ariaLabel="Language">
        <Icon d={IC.globe} className="size-4" />
        <span className="text-[11px] font-medium hidden sm:block">
          {language.toUpperCase()}
        </span>
        <Icon
          d={IC.chevDown}
          className="size-2.5 stroke-[2.5] hidden sm:block"
        />
      </HeaderIconButton>
      {active && (
        <LanguageDropdown
          current={language}
          onChange={onChange}
          onClose={onClose}
        />
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AppHeader({ onMenuToggle }) {
  const { t, i18n } = useTranslation();
  const { toggleTheme, theme } = useTheme();

  const [openPanel, setOpenPanel] = useState(null);

  // Memoised so child components that receive this as a prop don't re-render
  // unnecessarily when unrelated state changes.
  const toggle = useCallback(
    (panel) => setOpenPanel((prev) => (prev === panel ? null : panel)),
    [],
  );

  const closePanel = useCallback(() => setOpenPanel(null), []);

  const handleLanguageChange = useCallback(
    (langCode) => i18n.changeLanguage(langCode),
    [i18n],
  );

  // Derived value — recalculated only when NOTIFICATIONS changes (stable ref).
  const notifUnread = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  return (
    <header className="bg-bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default h-14 flex items-center gap-2 sm:gap-3 shrink-0 px-2 sm:px-3 md:px-5">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg cursor-pointer text-secondary dark:text-dark-secondary hover:bg-hover dark:hover:bg-dark-hover transition-colors"
        aria-label="Toggle menu"
      >
        <Icon d={IC.collapse} className="size-5 stroke-[1.5] rotate-90" />
      </button>

      {/* Page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          d={IC.dashboard}
          className="dark:stroke-dark-primary text-primary size-4 stroke-[1.5] shrink-0 hidden sm:block"
        />
        <span className="text-sm font-medium text-primary dark:text-dark-primary truncate">
          {t("dashboard.title")}
        </span>
      </div>

      {/* Search */}
      <SearchInput placeholder={t("common.search")} />

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Mobile search toggle */}
        <HeaderIconButton ariaLabel="Search">
          <Icon d={IC.search} className="size-4 stroke-[1.5] lg:hidden" />
        </HeaderIconButton>

        {/* Theme toggle */}
        <HeaderIconButton onClick={toggleTheme} ariaLabel="Toggle theme">
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className="size-4 stroke-[1.5]"
          />
        </HeaderIconButton>

        {/* Notifications */}
        <NotificationButton
          unreadCount={notifUnread}
          active={openPanel === "notifications"}
          onClick={() => toggle("notifications")}
        />

        {/* Language */}
        <LanguageButton
          language={i18n.language}
          active={openPanel === "language"}
          onClick={() => toggle("language")}
          onChange={handleLanguageChange}
          onClose={closePanel}
        />
      </div>
    </header>
  );
}
