import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
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
import { normalizeFacetKey } from "../auth/roleModel";
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
        flex cursor-pointer items-center gap-0.5 rounded-lg p-1.5 sm:p-2
        text-secondary dark:text-dark-secondary
        hover:bg-hover dark:hover:bg-dark-hover transition-colors
        ${active ? "bg-nav-active dark:bg-dark-nav-active" : ""}
      `}
    >
      {children}
    </button>
  );
}

/** Public “Medium” stories surface: `/`, `/write`, `/library`, `/topic/*`, `/story/*`, `/writer/*` */
function isPublicStoriesPath(pathname) {
  if (pathname === "/") return true;
  if (pathname === "/write" || pathname.startsWith("/write/")) return true;
  if (pathname === "/writer" || pathname.startsWith("/writer/")) return true;
  if (pathname === "/library" || pathname.startsWith("/library/")) return true;
  if (pathname.startsWith("/topic/")) return true;
  if (pathname.startsWith("/story/")) return true;
  return false;
}

/** Notification bell with unread badge. */
function NotificationButton({ unreadCount, active, onClick, ariaLabel }) {
  return (
    <div className="relative">
      <HeaderIconButton
        onClick={onClick}
        active={active}
        ariaLabel={ariaLabel}
      >
        <Icon d={IC.bell} className="size-3.5 stroke-[1.5] sm:size-4" />
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
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { hasRole, user, logout } = useAuth();
  const showStoriesSearch = isPublicStoriesPath(pathname);

  const { t } = useTranslation();
  const { setLang } = useLanguage();
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
      /** Default context stub uses `setLang()` with no params; Provider passes arity-1 updater. */
      /** @type {(next?: string) => void} */ (setLang)(langCode);
    },
    [setLang],
  );

  // Derived value — recalculated only when NOTIFICATIONS changes (stable ref).
  const notifUnread = useMemo(
    () => NOTIFICATIONS.filter((n) => n.unread).length,
    [],
  );

  const navigateToFacetDashboard = useCallback(
    (raw) => {
      const facetRaw = String(raw ?? "").trim();
      const facet = normalizeFacetKey(facetRaw) ?? facetRaw.toLowerCase();

      /* Reader facet → student shell */
      if (facetRaw === "user" || facet === "user") {
        if (!(hasRole("user") || hasRole("student"))) return;
        const base = getFacultyDashboardPath("student");
        navigate(`${base}/dashboard`);
        return;
      }

      if (!hasRole(facetRaw) && !hasRole(facet)) return;
      const base = getFacultyDashboardPath(facet);
      if (base) navigate(`${base}/dashboard`);
    },
    [hasRole, navigate],
  );

  const navigateToProfile = useCallback(() => {
    const base = getFacultyDashboardPath(user?.role ?? "student");
    if (base === "/admin" && user?.id != null) {
      navigate(`/admin/users/${encodeURIComponent(user.id)}`);
      return;
    }
    navigate("/writer/profile");
  }, [navigate, user]);

  const navigateToAccountSettings = useCallback(() => {
    const base = getFacultyDashboardPath(user?.role ?? "student");
    if (base === "/admin") {
      navigate(`${base}/setting`);
      return;
    }
    navigate("/writer/profile");
  }, [navigate, user]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      /* AuthProvider redirects to /login on success */
    }
  }, [logout]);

  return (
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-1 border-b border-default/80 bg-white px-2 dark:border-dark-default dark:bg-dark-shell sm:h-14 sm:gap-2 md:gap-3 md:px-4 lg:px-5">
      {/* Mobile menu toggle + title area */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <div
          onClick={handleSidebarToggle}
          className="group rounded-xl border border-default p-1 transition-all hover:border-light dark:border-dark-default hover:dark:border-dark-default sm:p-1.5"
        >
          {collapsed ? (
            <TbLayoutSidebarRightCollapse className="text-[1.1rem] sm:text-xl" />
          ) : (
            <TbLayoutSidebarLeftCollapse className="cursor-pointer text-[1.1rem] sm:text-xl" />
          )}
        </div>
        {/* Route-specific title slots can mount here */}
      </div>

      {/* Stories filter — lg+ only (see header responsive rules) */}
      {showStoriesSearch ? (
        <div className="mx-2 hidden min-w-0 max-w-xs flex-1 lg:flex xl:max-w-md">
          <SearchableSelect
            options={FRAMEWORK_OPTIONS}
            searchPlaceholder="select"
            value={search}
            onValueChange={setSearch}
            className="min-h-9 gap-2 px-3.5 py-1.5 text-sm"
          />
        </div>
      ) : null}

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1 md:gap-1.5">
        {/* Theme toggle */}
        <HeaderIconButton
          onClick={toggleTheme}
          ariaLabel={t("appHeader.toggleTheme")}
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className="size-3.5 stroke-[1.5] sm:size-4"
          />
        </HeaderIconButton>

        {/* Notifications */}
        <NotificationButton
          unreadCount={notifUnread}
          active={openPanel === "notifications"}
          onClick={() => toggle("notifications")}
          ariaLabel={t("appHeader.notificationsBell")}
        />

        {/* <DropdownMenuDemo /> */}
        <DropdownMenuRoot>
          <DropdownTrigger
            showArrow={false}
            compactIcon
            aria-label={t("appHeader.accountMenu")}
            icon={<AvatarDemo />}
          ></DropdownTrigger>

          <DropdownContent align="end" className="w-48">
            <DropdownLabel>{t("common.sections.account")}</DropdownLabel>
            <DropdownItem onClick={navigateToProfile}>
              {t("common.actions.profile")}
            </DropdownItem>
            <DropdownItem onClick={navigateToAccountSettings}>
              {t("common.actions.settings")}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownSub>
              <DropdownSubTrigger>{t("common.language")}</DropdownSubTrigger>
              <DropdownSubContent>
                <DropdownLabel>{t("common.language")}</DropdownLabel>
                <DropdownItem onClick={() => handleLanguageChange("en")}>
                  {t("appHeader.langNames.en")}
                </DropdownItem>
                <DropdownItem onClick={() => handleLanguageChange("ps")}>
                  {t("appHeader.langNames.ps")}
                </DropdownItem>
                <DropdownItem onClick={() => handleLanguageChange("prs")}>
                  {t("appHeader.langNames.prs")}
                </DropdownItem>
              </DropdownSubContent>
            </DropdownSub>

            <DropdownSeparator />
            <DropdownLabel>{t("common.sections.actions")}</DropdownLabel>
            <DropdownItem
              data={20}
              icon={<Icon d={IC.bell} className="size-4 stroke-[1.5]" />}
              onClick={() => toggle("notifications")}
            >
              {t("appHeader.notifications")}
            </DropdownItem>
            <DropdownSeparator />
            <DropdownSub>
              <DropdownSubTrigger>
                {t("appHeader.moreDashboards")}
              </DropdownSubTrigger>
              <DropdownSubContent>
                {hasRole("admin") && (
                  <DropdownItem onClick={() => navigateToFacetDashboard("admin")}>
                    {t("adminShared.roles.admin")}
                  </DropdownItem>
                )}
                {hasRole("dean") && (
                  <DropdownItem onClick={() => navigateToFacetDashboard("dean")}>
                    {t("adminShared.roles.dean")}
                  </DropdownItem>
                )}
                {hasRole("staff") && (
                  <DropdownItem onClick={() => navigateToFacetDashboard("staff")}>
                    {t("adminShared.roles.staff")}
                  </DropdownItem>
                )}
                {hasRole("teacher") && (
                  <DropdownItem onClick={() => navigateToFacetDashboard("teacher")}>
                    {t("adminShared.roles.teacher")}
                  </DropdownItem>
                )}
                {(hasRole("student") || hasRole("user")) && (
                  <DropdownItem onClick={() => navigateToFacetDashboard("student")}>
                    {t("adminShared.roles.student")}
                  </DropdownItem>
                )}
              </DropdownSubContent>
            </DropdownSub>
            <DropdownSeparator />
            <DropdownItem
              variant="danger"
              onClick={() => {
                void handleLogout();
              }}
            >
              {t("common.actions.logout")}
            </DropdownItem>
          </DropdownContent>
        </DropdownMenuRoot>
      </div>
    </header>
  );
}
