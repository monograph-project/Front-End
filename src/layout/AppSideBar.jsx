import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ClipboardList,
  Building2,
  CalendarDays,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LayoutGrid,
  Library,
  LineChart,
  NotebookPen,
  PenLine,
  Presentation,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import Avatar from "../components/Avatar";
import Tooltip from "../components/Tooltip";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getFacultyDashboardPath, resolveShellBasePath } from "../lib/roles";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
import {
  resolveProfilePhotoUrl,
  buildPersonInitials,
} from "../lib/profileMedia";
import { resolveNotificationRecipientId } from "../lib/notificationRecipientId";
import { useUserNotificationUnreadCount } from "../services/useApi";

const NOTIFICATION_NAV_KEYS = new Set(["notification", "notifications"]);

function NavGlyph({ IconComponent, active }) {
  return (
    <IconComponent
      strokeWidth={active ? 2 : 1.5}
      className={`size-4 shrink-0 transition-all ${
        active
          ? "text-dark-text-primary"
          : "text-light-text-primary dark:text-dark-text-primary group-hover:text-dark-text-primary"
      }`}
      aria-hidden
    />
  );
}

export default function AppSidebar() {
  const { collapsed, handleSidebarToggle, isMobile, mobileMenuOpen } =
    useSidebar();
  const drawerExpanded = Boolean(isMobile && mobileMenuOpen);
  const railMode = collapsed && !drawerExpanded;
  const navShowsLabels = !railMode;
  const sidebarWidthClass = railMode
    ? "w-16 min-w-16"
    : "w-[min(20rem,calc(100vw-2rem))] min-w-[14rem] sm:w-65 sm:min-w-65";
  const { t } = useTranslation();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const primaryRole = user?.role;
  const roleForHome =
    primaryRole === "user" ? "student" : primaryRole || "student";
  const basePath =
    getFacultyDashboardPath(roleForHome ?? "student") ?? "/student";
  const pathnameShell = resolveShellBasePath(location.pathname, primaryRole);
  const navRole =
    pathnameShell === "/staff"
      ? "teacher"
      : pathnameShell === "/dean"
        ? "admin"
        : primaryRole === "user"
          ? "student"
          : primaryRole || "student";

  const notificationUserKey = resolveNotificationRecipientId(user);
  const { data: unreadNotifications = 0 } = useUserNotificationUnreadCount(
    notificationUserKey,
    {
      enabled: Boolean(notificationUserKey),
      notifyOnError: false,
    },
  );
  const notifUnread =
    typeof unreadNotifications === "number" ? unreadNotifications : 0;

  const roleNavItems = {
    admin: [
      {
        key: "dashboard",
        labelKey: "sidebar.admin.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "users",
        labelKey: "sidebar.admin.users",
        Icon: Users,
        path: `${basePath}/users`,
      },
      {
        key: "student",
        labelKey: "sidebar.admin.student",
        Icon: GraduationCap,
        path: `${basePath}/student`,
      },
      {
        key: "teacher",
        labelKey: "sidebar.admin.teacher",
        Icon: UsersRound,
        path: `${basePath}/teacher`,
      },
      {
        key: "employee",
        labelKey: "sidebar.admin.employee",
        Icon: BriefcaseBusiness,
        path: `${basePath}/employee`,
      },
      {
        key: "notification",
        labelKey: "sidebar.admin.notification",
        Icon: Bell,
        path: `${basePath}/notification`,
      },
      {
        key: "department",
        labelKey: "sidebar.admin.department",
        Icon: Building2,
        path: `${basePath}/department`,
      },
      {
        key: "projects",
        labelKey: "sidebar.admin.projects",
        Icon: FolderKanban,
        path: `${basePath}/projects`,
      },
      {
        key: "blogs",
        labelKey: "sidebar.admin.blogs",
        Icon: BookOpen,
        path: `${basePath}/blogs`,
      },
      {
        key: "setting",
        labelKey: "sidebar.admin.setting",
        Icon: Settings,
        path: `${basePath}/setting`,
      },
      {
        key: "report",
        labelKey: "sidebar.admin.report",
        Icon: LineChart,
        path: `${basePath}/report`,
      },
    ],
    teacher: [
      {
        key: "dashboard",
        labelKey: "sidebar.teacher.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.teacher.notifications",
        Icon: Bell,
        path: `${basePath}/notifications`,
      },
      {
        key: "projects",
        labelKey: "sidebar.teacher.projects",
        Icon: FolderKanban,
        path: `${basePath}/projects`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.teacher.calendar",
        Icon: CalendarDays,
        path: `${basePath}/calendar`,
      },
      {
        key: "notes",
        labelKey: "sidebar.researchNotes",
        Icon: NotebookPen,
        path: `${basePath}/notes`,
      },
      {
        key: "reports",
        labelKey: "sidebar.teacher.reports",
        Icon: LineChart,
        path: `${basePath}/reports`,
      },
      {
        key: "settings",
        labelKey: "sidebar.teacher.settings",
        Icon: Settings,
        path: `${basePath}/settings`,
      },
    ],
    student: [
      {
        key: "dashboard",
        labelKey: "sidebar.student.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "workspace",
        labelKey: "sidebar.student.workspace",
        Icon: FolderKanban,
        path: `${basePath}/workspace`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.student.notifications",
        Icon: Bell,
        path: `${basePath}/notifications`,
      },
      {
        key: "settings",
        labelKey: "sidebar.student.settings",
        Icon: Settings,
        path: `${basePath}/settings`,
      },
    ],
    staff: [
      {
        key: "dashboard",
        labelKey: "sidebar.staff.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.staff.notifications",
        Icon: Bell,
        path: `${basePath}/notifications`,
      },
      {
        key: "deals",
        labelKey: "sidebar.staff.tasks",
        Icon: ClipboardList,
        path: `${basePath}/deals`,
      },
      {
        key: "notes",
        labelKey: "sidebar.staff.notes",
        Icon: NotebookPen,
        path: `${basePath}/notes`,
      },

      {
        key: "projects",
        labelKey: "sidebar.staff.projects",
        Icon: FolderKanban,
        path: `${basePath}/projects`,
      },
      {
        key: "reports",
        labelKey: "sidebar.staff.reports",
        Icon: LineChart,
        path: `${basePath}/reports`,
      },
      {
        key: "settings",
        labelKey: "sidebar.staff.settings",
        Icon: Settings,
        path: `${basePath}/settings`,
      },
    ],
    author: [
      {
        key: "dashboard",
        labelKey: "sidebar.author.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "writing",
        labelKey: "sidebar.author.writing",
        Icon: PenLine,
        path: `${basePath}/writing`,
      },
      {
        key: "published",
        labelKey: "sidebar.author.published",
        Icon: Library,
        path: `${basePath}/published`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.author.notifications",
        Icon: Bell,
        path: `${basePath}/notifications`,
      },
      {
        key: "settings",
        labelKey: "sidebar.author.settings",
        Icon: Settings,
        path: `${basePath}/settings`,
      },
    ],
    dean: [
      {
        key: "dashboard",
        labelKey: "sidebar.dean.dashboard",
        Icon: LayoutDashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.dean.notifications",
        Icon: Bell,
        path: `${basePath}/notifications`,
      },
      {
        key: "students",
        labelKey: "sidebar.dean.students",
        Icon: GraduationCap,
        path: `${basePath}/students`,
      },
      {
        key: "deals",
        labelKey: "sidebar.dean.overview",
        Icon: LayoutGrid,
        path: `${basePath}/deals`,
      },
      {
        key: "projects",
        labelKey: "sidebar.dean.projects",
        Icon: FolderKanban,
        path: `${basePath}/projects`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.dean.calendar",
        Icon: CalendarDays,
        path: `${basePath}/calendar`,
      },
      {
        key: "reports",
        labelKey: "sidebar.dean.reports",
        Icon: LineChart,
        path: `${basePath}/reports`,
      },
      {
        key: "notes",
        labelKey: "sidebar.dean.notes",
        Icon: NotebookPen,
        path: `${basePath}/notes`,
      },
      {
        key: "setting",
        labelKey: "sidebar.dean.settings",
        Icon: Settings,
        path: `${basePath}/setting`,
      },
    ],
  };

  const primaryNav = [...(roleNavItems[navRole] || roleNavItems.teacher)];

  const authorAddonNav =
    hasRole("author") && primaryRole && primaryRole !== "author"
      ? [
          {
            key: "author-writing",
            labelKey: "sidebar.author.writing",
            Icon: PenLine,
            path: "/author/writing",
          },
          {
            key: "author-published",
            labelKey: "sidebar.author.published",
            Icon: Library,
            path: "/author/published",
          },
        ]
      : [];

  const navItems =
    primaryRole === "author"
      ? [...(roleNavItems.author || [])]
      : [...primaryNav, ...authorAddonNav];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const photoSrc = resolveProfilePhotoUrl(user ?? {});
  const initials = buildPersonInitials(user ?? {});

  return (
    <aside
      className={` flex h-full shrink-0 flex-col overflow-hidden border-default bg-shell transition-[width,min-width] duration-100 ease-out dark:border-dark-app-tertiary dark:bg-dark-app-secondary ltr:border-r rtl:border-l ${isMobile ? "border-none" : ""} ${sidebarWidthClass}`}
    >
      <div
        className={`flex min-h-12 shrink-0 items-center border-b border-default px-2.5 py-[11.5px] dark:border-dark-default ${railMode ? "justify-center px-4 py-4.5" : "justify-end rtl:flex-row-reverse"}`}
      >
        <button
          type="button"
          onClick={handleSidebarToggle}
          aria-label={t("appHeader.toggleSidebar")}
          className="group flex shrink-0 items-center rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) p-1 text-secondary transition-colors hover:border-(--color-light-input-border-focus) hover:bg-(--color-light-nav-hover-bg) hover:text-primary dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-dark-secondary dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary sm:p-1.5"
        >
          {railMode ? (
            <TbLayoutSidebarRightCollapse className="text-[1rem] sm:text-[18px]" />
          ) : (
            <TbLayoutSidebarLeftCollapse className="text-[1rem] sm:text-[18px]" />
          )}
        </button>
      </div>

      <nav
        style={{
          padding: railMode ? "10px 8px" : "10px 10px",
        }}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const label = item.labelKey.includes(".")
            ? t(item.labelKey)
            : item.labelKey;
          const showNotifBadge =
            NOTIFICATION_NAV_KEYS.has(item.key) &&
            typeof notifUnread === "number" &&
            notifUnread > 0;

          const link = (
            <Link
              to={item.path}
              className={`relative mb-0.5 flex w-full cursor-pointer items-center gap-2.25 rounded-lg border-none text-left text-xs no-underline transition-all duration-150 hover:bg-dark-btn-primary-bg group ${active ? " bg-accent/10 font-bold bg-dark-btn-primary-bg dark:bg-dark-btn-primary-bg dark:text-white" : " font-normal"} ${railMode ? "justify-center p-2.25" : "justify-start py-2.25 px-2.5"}`}
            >
              <span className="relative inline-flex shrink-0 items-center justify-center">
                <NavGlyph IconComponent={item.Icon} active={active} />
                {showNotifBadge ? (
                  <span className="absolute -top-1.5 -end-1 min-h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-chart-error text-[9px] font-bold leading-none text-white">
                    {notifUnread > 99 ? "99+" : notifUnread}
                  </span>
                ) : null}
              </span>
              {navShowsLabels ? (
                <span
                  className={`group-hover:text-dark-text-primary ${active ? "text-dark-text-primary" : "text-light-text-primary dark:text-dark-text-primary"}`}
                >
                  {label}
                </span>
              ) : null}
            </Link>
          );

          return (
            <div key={item.key} className="contents">
              {railMode && !isMobile ? (
                <Tooltip content={label} side="right" sideOffset={8}>
                  {link}
                </Tooltip>
              ) : (
                link
              )}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          padding: railMode ? "12px 8px" : "12px 14px",
          borderTop: "1px solid var(--c-border)",
        }}
        className={`${railMode ? "py-3 px-2" : "py-3 px-3.5"}`}
      >
        <div
          style={{ marginTop: railMode ? 0 : 8 }}
          className={`${railMode ? "mt-0" : "mt-2"}`}
        >
          <div className="flex items-center gap-2">
            <div className="inline-flex shrink-0 overflow-hidden rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) dark:border-dark-input-border dark:bg-(--color-dark-input-bg)">
              <Avatar src={photoSrc} initials={initials} />
            </div>
            {navShowsLabels ? (
              <div className="min-w-0 text-sm text-secondary dark:text-dark-secondary">
                <div className="truncate font-medium text-primary dark:text-dark-primary">
                  {user?.fullName ||
                    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
                    user?.user_name ||
                    user?.email}
                </div>
                <div className="truncate text-xs">{user?.email}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
