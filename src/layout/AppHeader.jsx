import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
import {
  DropdownContent,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
  DropdownItem,
  DropdownSeparator,
  DropdownSub,
  DropdownSubTrigger,
  DropdownSubContent,
} from "../components/DropdownMenu";
import AvatarDemo from "../components/Avatar";
import { getFacultyDashboardPath } from "../lib/roles";
import IC from "../components/IC";
import Icon from "../components/Icon";
import NotificationDropdown from "../components/NotificationDropdown";
import SearchableSelect from "../components/SearchableSelect";
import { useTheme } from "../context/themContext";
import { useAuth } from "../context/AuthContext";

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
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-success text-[8px] font-bold text-success-light leading-none">
            {unreadCount}
          </span>
        )}
      </HeaderIconButton>
      {active && <NotificationDropdown onClose={() => onClick(null)} />}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AppHeader({ handleSidebarToggle, collapsed }) {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const { lang, setLang } = useLanguage();
  const { toggleTheme, theme } = useTheme();
  const [openPanel, setOpenPanel] = useState(null);
  const [search, setSearch] = useState();
  const FRAMEWORK_OPTIONS = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "svelte", label: "Svelte" },
  ];
  // Memoised so child components that receive this as a prop don't re-render
  // unnecessarily when unrelated state changes.
  const toggle = useCallback(
    (panel) => setOpenPanel((prev) => (prev === panel ? null : panel)),
    [],
  );

  const handleLanguageChange = useCallback(
    (langCode) => {
      setLang(langCode);
      if (i18n && typeof i18n.changeLanguage === "function") {
        i18n.changeLanguage(langCode);
      }
    },
    [setLang, i18n],
  );

  // Derived value — recalculated only when NOTIFICATIONS changes (stable ref).
  const notifUnread = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  const switchRole = (newRole) => {
    const updatedUser = { ...(user || {}), role: newRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    const next = getFacultyDashboardPath(newRole);
    window.location.href = next ? `${next}/dashboard` : "/";
  };

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center gap-2 sm:gap-3 shrink-0 px-2 sm:px-3 md:px-5 bg-shell/75 dark:bg-dark-shell/75 backdrop-blur-md border-b border-default/80 dark:border-dark-default/80 ">
      {/* Mobile menu toggle */}

      {/* Page title */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div
          onClick={handleSidebarToggle}
          className="p-1.5 group hover:border-light group transition-all border rounded-xl border-default dark:border-dark-default hover:dark:border-dark-default"
        >
          {collapsed ? (
            <TbLayoutSidebarRightCollapse />
          ) : (
            <TbLayoutSidebarLeftCollapse className="text-xl cursor-pointer" />
          )}
        </div>
        {/* here routes */}
      </div>

      {/* Search */}
      <div className="space-y-2 w-75">
        <SearchableSelect
          options={FRAMEWORK_OPTIONS}
          searchPlaceholder="select"
          value={search}
        />
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-1.5">
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

        {/* <DropdownMenuDemo /> */}
        <DropdownMenuRoot>
          <DropdownTrigger
            showArrow={false}
            icon={<AvatarDemo />}
          ></DropdownTrigger>

          <DropdownContent align="end" className="w-48">
            <DropdownLabel>Account</DropdownLabel>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem>Settings</DropdownItem>
            <DropdownSeparator />
            <DropdownSub>
              <DropdownSubTrigger>Language</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownLabel>language</DropdownLabel>
                <DropdownItem onClick={() => handleLanguageChange("en")}>
                  English
                </DropdownItem>
                <DropdownItem onClick={() => handleLanguageChange("ps")}>
                  پښتو
                </DropdownItem>
                <DropdownItem onClick={() => handleLanguageChange("prs")}>
                  فارسی
                </DropdownItem>
              </DropdownSubContent>
            </DropdownSub>

            <DropdownSeparator />
            <DropdownLabel>Actions</DropdownLabel>
            <DropdownItem
              data={20}
              icon={<Icon d={IC.bell} className="size-4 stroke-[1.5]" />}
              onClick={() => toggle("notifications")}
            >
              Notification
            </DropdownItem>
            <DropdownSeparator />
            <DropdownSub>
              <DropdownSubTrigger>More</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownItem onClick={() => switchRole("admin")}>
                  Admin
                </DropdownItem>
                <DropdownItem onClick={() => switchRole("dean")}>
                  Dean
                </DropdownItem>
                <DropdownItem onClick={() => switchRole("staff")}>
                  Staff
                </DropdownItem>
                <DropdownItem onClick={() => switchRole("teacher")}>
                  Teacher
                </DropdownItem>
                <DropdownItem onClick={() => switchRole("student")}>
                  Student
                </DropdownItem>
                <DropdownItem onClick={() => switchRole("user")}>
                  Reader
                </DropdownItem>
              </DropdownSubContent>
            </DropdownSub>
          </DropdownContent>
        </DropdownMenuRoot>
      </div>
    </header>
  );
}
