import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { setDocumentDirection } from "../i18n";
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
} from "../components/DropdownMenu";
import IC from "../components/IC";
import Icon from "../components/Icon";
import NotificationDropdown from "../components/NotificationDropdown";
import SearchableSelect from "../components/SearchableSelect";
import { useTheme } from "../context/themContext";
import Button from "./../components/Button";
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
          <span className="absolute top-0.5 right-0.5 min-w-[14px] h-3.5 px-0.5 flex items-center justify-center rounded-full bg-accent dark:bg-dark-accent text-[8px] font-bold text-white leading-none">
            {unreadCount}
          </span>
        )}
      </HeaderIconButton>
      {active && <NotificationDropdown onClose={() => onClick(null)} />}
    </div>
  );
}

function LanguageMenu({ current, onChange }) {
  return (
    <DropdownMenuRoot>
      <DropdownTrigger
        icon={
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.49996 1.80002C4.35194 1.80002 1.79996 4.352 1.79996 7.50002C1.79996 10.648 4.35194 13.2 7.49996 13.2C10.648 13.2 13.2 10.648 13.2 7.50002C13.2 4.352 10.648 1.80002 7.49996 1.80002ZM0.899963 7.50002C0.899963 3.85494 3.85488 0.900024 7.49996 0.900024C11.145 0.900024 14.1 3.85494 14.1 7.50002C14.1 11.1451 11.145 14.1 7.49996 14.1C3.85488 14.1 0.899963 11.1451 0.899963 7.50002Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
            <path
              d="M13.4999 7.89998H1.49994V7.09998H13.4999V7.89998Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
            <path
              d="M7.09991 13.5V1.5H7.89991V13.5H7.09991zM10.375 7.49998C10.375 5.32724 9.59364 3.17778 8.06183 1.75656L8.53793 1.24341C10.2396 2.82218 11.075 5.17273 11.075 7.49998 11.075 9.82724 10.2396 12.1778 8.53793 13.7566L8.06183 13.2434C9.59364 11.8222 10.375 9.67273 10.375 7.49998zM3.99969 7.5C3.99969 5.17611 4.80786 2.82678 6.45768 1.24719L6.94177 1.75281C5.4582 3.17323 4.69969 5.32389 4.69969 7.5 4.6997 9.67611 5.45822 11.8268 6.94179 13.2472L6.45769 13.7528C4.80788 12.1732 3.9997 9.8239 3.99969 7.5z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
            <path
              d="M7.49996 3.95801C9.66928 3.95801 11.8753 4.35915 13.3706 5.19448 13.5394 5.28875 13.5998 5.50197 13.5055 5.67073 13.4113 5.83948 13.198 5.89987 13.0293 5.8056 11.6794 5.05155 9.60799 4.65801 7.49996 4.65801 5.39192 4.65801 3.32052 5.05155 1.97064 5.8056 1.80188 5.89987 1.58866 5.83948 1.49439 5.67073 1.40013 5.50197 1.46051 5.28875 1.62927 5.19448 3.12466 4.35915 5.33063 3.95801 7.49996 3.95801zM7.49996 10.85C9.66928 10.85 11.8753 10.4488 13.3706 9.6135 13.5394 9.51924 13.5998 9.30601 13.5055 9.13726 13.4113 8.9685 13.198 8.90812 13.0293 9.00238 11.6794 9.75643 9.60799 10.15 7.49996 10.15 5.39192 10.15 3.32052 9.75643 1.97064 9.00239 1.80188 8.90812 1.58866 8.9685 1.49439 9.13726 1.40013 9.30601 1.46051 9.51924 1.62927 9.6135 3.12466 10.4488 5.33063 10.85 7.49996 10.85z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        }
      >
        {current?.toUpperCase()}
      </DropdownTrigger>

      <DropdownContent align="end" className="w-44">
        <DropdownLabel>Language</DropdownLabel>

        <DropdownRadioGroup value={current} onValueChange={onChange}>
          <DropdownRadioItem value="en">English</DropdownRadioItem>
          <DropdownRadioItem value="ps">پښتو</DropdownRadioItem>
          <DropdownRadioItem value="prs">فارسی</DropdownRadioItem>
        </DropdownRadioGroup>
      </DropdownContent>
    </DropdownMenuRoot>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AppHeader({ handleSidebarToggle, collapsed }) {
  const { user, isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
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
      i18n.changeLanguage(langCode);
      setDocumentDirection(langCode);
    },
    [i18n],
  );

  // Derived value — recalculated only when NOTIFICATIONS changes (stable ref).
  const notifUnread = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  return (
    <header className=" bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default h-14 flex items-center gap-2 sm:gap-3 shrink-0 px-2 sm:px-3 md:px-5">
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
      <div className="space-y-2 w-70">
        <SearchableSelect
          options={FRAMEWORK_OPTIONS}
          searchPlaceholder="select"
          value={search}
        />
      </div>
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

        {/* <DropdownMenuDemo /> */}
        <LanguageMenu current={i18n.language} onChange={handleLanguageChange} />
      </div>
    </header>
  );
}
