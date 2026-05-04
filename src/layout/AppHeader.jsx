import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, Compass } from "lucide-react";
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
import { formatHeaderFullPath, splitPathFragments } from "../lib/headerPath";
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

/** Styled path trail beside the sidebar control. */
function RouteTrail({ pathname }) {
  const { t } = useTranslation();
  const full = formatHeaderFullPath(pathname);
  const parts = splitPathFragments(pathname);
  const hasParts = parts.length > 0;

  return (
    <nav
      className="min-w-0 hidden md:block flex-1 overflow-hidden ps-1"
      aria-label={t("appHeader.routeLocation")}
      title={full}
    >
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto whitespace-nowrap rounded-2xl   px-2.5 py-1.5  sm:px-3 sm:py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <span className="inline-flex shrink-0 items-center rounded-full bg-(--color-light-card-bg) px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary dark:bg-(--color-dark-card-bg) dark:text-dark-primary sm:text-xs">
            {t("appHeader.routeHome")}
          </span>

          {hasParts
            ? parts.map((seg, idx) => {
                const last = idx === parts.length - 1;
                return (
                  <span
                    key={`${seg}-${idx}`}
                    className="inline-flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2"
                  >
                    <ChevronRight
                      className="size-3 shrink-0 text-muted dark:text-dark-muted sm:size-3.5"
                      strokeWidth={1.8}
                      aria-hidden
                    />
                    <span
                      className={`min-w-0 max-w-[8.25rem] capitalize truncate  px-2.5 py-1 text-[11px] sm:max-w-[12rem] sm:text-xs md:max-w-none ${
                        last
                          ? "bg-(--color-light-card-bg) font-semibold text-primary shadow-xs dark:bg-(--color-dark-card-bg) dark:text-dark-primary"
                          : "font-medium text-secondary dark:text-dark-secondary"
                      }`}
                    >
                      {seg}
                    </span>
                  </span>
                );
              })
            : null}
        </div>
      </div>
    </nav>
  );
}

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
      <HeaderIconButton onClick={onClick} active={active} ariaLabel={ariaLabel}>
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
    <header className="sticky top-0 z-20 flex h-11 shrink-0 items-center gap-2 border-b border-(--color-light-card-border) bg-(--color-light-card-bg)/88 px-2 backdrop-blur-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)/90 sm:h-14 sm:gap-2.5 md:gap-3 md:px-4 lg:px-5">
      {/* Sidebar + route */}
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <RouteTrail pathname={pathname} />
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
                  <DropdownItem
                    onClick={() => navigateToFacetDashboard("admin")}
                  >
                    {t("adminShared.roles.admin")}
                  </DropdownItem>
                )}
                {hasRole("teacher") && (
                  <DropdownItem
                    onClick={() => navigateToFacetDashboard("teacher")}
                  >
                    {t("adminShared.roles.teacher")}
                  </DropdownItem>
                )}
                {(hasRole("student") || hasRole("user")) && (
                  <DropdownItem
                    onClick={() => navigateToFacetDashboard("student")}
                  >
                    {t("adminShared.roles.student")}
                  </DropdownItem>
                )}
                {hasRole("author") && (
                  <DropdownItem
                    onClick={() => navigateToFacetDashboard("author")}
                  >
                    {t("adminShared.roles.author")}
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
