import { useState } from "react";
import { useTranslation } from "react-i18next";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useTheme } from "../context/themContext";
import NotificationDropdown from "../components/NotificationDropdown";
import LanguageDropdown from "../components/LanguageDropDown";

const NOTIFICATIONS = [
  {
    id: 1,
    type: "exam",
    avatar: "JW",
    color: "bg-violet-500",
    title: "New exam scheduled",
    desc: "Math Exam has been added for Class 302 on Feb 15.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "attendance",
    avatar: "SA",
    color: "bg-emerald-500",
    title: "Attendance alert",
    desc: "Sarah Anderson was marked absent today.",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "message",
    avatar: "DR",
    color: "bg-blue-500",
    title: "New message from Daniel Roberts",
    desc: "Can we reschedule Friday's session?",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    type: "report",
    avatar: "OB",
    color: "bg-amber-500",
    title: "Monthly report ready",
    desc: "February student performance report is available.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    type: "system",
    avatar: "SY",
    color: "bg-slate-400",
    title: "System maintenance",
    desc: "Scheduled maintenance on Sun, 10 Mar at 2:00 AM.",
    time: "Yesterday",
    unread: false,
  },
];

export default function AppHeader({ onMenuToggle }) {
  const { t, i18n } = useTranslation();
  const { toggleTheme, theme } = useTheme();

  const [openPanel, setOpenPanel] = useState(null);
  const notifUnread = NOTIFICATIONS.filter((n) => n.unread).length;

  const toggle = (panel) =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  // Handle language change
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <header
      className="
      bg-bg-shell dark:bg-dark-shell
      border-b border-default dark:border-dark-default
      h-14 flex items-center gap-2 sm:gap-3 shrink-0 px-2 sm:px-3 md:px-5
    "
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg cursor-pointer text-secondary dark:text-dark-secondary hover:bg-hover dark:hover:bg-dark-hover transition-colors"
        aria-label="Toggle menu"
      >
        <Icon d={IC.collapse} className="size-5 stroke-[1.5] rotate-90" />
      </button>

      {/* Left: page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon
          d={IC.dashboard}
          className="dark:stroke-dark-primary text-primary size-4 stroke-[1.5] shrink-0 hidden sm:block"
        />
        <span className="text-sm font-medium text-primary dark:text-dark-primary truncate">
          {t("dashboard.title")}
        </span>
      </div>

      {/* Center: search */}
      <div className="relative hidden lg:block">
        <input
          placeholder={t("common.search")}
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

      {/* Right: actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Mobile search toggle */}
        <button
          className="
          lg:hidden p-2 rounded-lg flex cursor-pointer
          text-secondary dark:text-dark-secondary
          hover:bg-hover dark:hover:bg-dark-hover transition-colors
        "
        >
          <Icon d={IC.search} className="size-4 stroke-[1.5]" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-lg flex cursor-pointer
            text-secondary dark:text-dark-secondary
            hover:bg-hover dark:hover:bg-dark-hover transition-colors
          "
          aria-label="Toggle theme"
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className="size-4 stroke-[1.5]"
          />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => toggle("notifications")}
            className={`
              relative p-2 rounded-lg flex cursor-pointer
              text-secondary dark:text-dark-secondary
              transition-colors hover:bg-hover dark:hover:bg-dark-hover
              ${
                openPanel === "notifications"
                  ? "bg-nav-active dark:bg-dark-nav-active"
                  : ""
              }
            `}
            aria-label="Notifications"
          >
            <Icon d={IC.bell} className="size-4 stroke-[1.5]" />
            {notifUnread > 0 && (
              <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-accent dark:bg-dark-accent text-[8px] font-bold text-white leading-none">
                {notifUnread}
              </span>
            )}
          </button>

          {openPanel === "notifications" && (
            <NotificationDropdown onClose={() => setOpenPanel(null)} />
          )}
        </div>

        {/* Language */}
        <div className="relative">
          <button
            onClick={() => toggle("language")}
            className={`
              p-2 rounded-lg flex items-center gap-1 cursor-pointer
              text-secondary dark:text-dark-secondary
              transition-colors hover:bg-hover dark:hover:bg-dark-hover
              ${
                openPanel === "language"
                  ? "bg-nav-active dark:bg-dark-nav-active"
                  : ""
              }
            `}
            aria-label="Language"
          >
            <span className="text-sm leading-none">
              <Icon d={IC.globe} className="size-4" />
            </span>
            <span className="text-[11px] font-medium hidden sm:block">
              {i18n.language.toUpperCase()}
            </span>
            <Icon
              d={IC.chevDown}
              className="size-2.5 stroke-[2.5] hidden sm:block"
            />
          </button>

          {openPanel === "language" && (
            <LanguageDropdown
              current={i18n.language}
              onChange={handleLanguageChange}
              onClose={() => setOpenPanel(null)}
            />
          )}
        </div>
      </div>
    </header>
  );
}
