import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import AvatarDemo from "../components/Avatar";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getFacultyDashboardPath, resolveShellBasePath } from "../lib/roles";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
export default function AppSidebar() {
  const { collapsed, handleSidebarToggle, isMobile } = useSidebar();
  const small = collapsed;
  const { t } = useTranslation();
  const location = useLocation();
  const { user, hasRole } = useAuth();
  const primaryRole = user?.role;
  const roleForHome =
    primaryRole === "user" ? "student" : primaryRole || "student";
  const basePath = getFacultyDashboardPath(roleForHome) ?? "/student";
  const pathnameShell = resolveShellBasePath(location.pathname, primaryRole);
  const navRole =
    pathnameShell === "/staff"
      ? "teacher"
      : pathnameShell === "/dean"
        ? "admin"
        : primaryRole === "user"
          ? "student"
          : primaryRole || "student";

  // Role-specific navigation items (paths must match App.jsx)
  const roleNavItems = {
    admin: [
      {
        key: "dashboard",
        labelKey: "sidebar.admin.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "users",
        labelKey: "sidebar.admin.users",
        icon: IC.contact,
        path: `${basePath}/users`,
      },
      {
        key: "student",
        labelKey: "sidebar.admin.student",
        icon: IC.contact,
        path: `${basePath}/student`,
      },
      {
        key: "teacher",
        labelKey: "sidebar.admin.teacher",
        icon: IC.contact,
        path: `${basePath}/teacher`,
      },
      {
        key: "employee",
        labelKey: "sidebar.admin.employee",
        icon: IC.contact,
        path: `${basePath}/employee`,
      },
      {
        key: "notification",
        labelKey: "sidebar.admin.notification",
        icon: IC.reports,
        path: `${basePath}/notification`,
      },
      {
        key: "department",
        labelKey: "sidebar.admin.department",
        icon: IC.company,
        path: `${basePath}/department`,
      },
      {
        key: "projects",
        labelKey: "sidebar.admin.projects",
        icon: IC.projects,
        path: `${basePath}/projects`,
      },
      {
        key: "blogs",
        labelKey: "sidebar.admin.blogs",
        icon: IC.projects,
        path: `${basePath}/blogs`,
      },
      {
        key: "setting",
        labelKey: "sidebar.admin.setting",
        icon: IC.settings,
        path: `${basePath}/setting`,
      },
      {
        key: "report",
        labelKey: "sidebar.admin.report",
        icon: IC.reports,
        path: `${basePath}/report`,
      },
    ],
    teacher: [
      {
        key: "dashboard",
        labelKey: "sidebar.teacher.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "groups",
        labelKey: "sidebar.teacher.groups",
        icon: IC.deals,
        path: `${basePath}/deals`,
      },
      {
        key: "students",
        labelKey: "sidebar.teacher.students",
        icon: IC.contact,
        path: `${basePath}/students`,
      },
      {
        key: "projects",
        labelKey: "sidebar.teacher.projects",
        icon: IC.projects,
        path: `${basePath}/projects`,
      },
      {
        key: "gradebook",
        labelKey: "sidebar.teacher.gradebook",
        icon: IC.notes,
        path: `${basePath}/gradebook`,
      },
      {
        key: "lessons",
        labelKey: "sidebar.teacher.lessons",
        icon: IC.zap,
        path: `${basePath}/lessons`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.teacher.calendar",
        icon: IC.calendar,
        path: `${basePath}/calendar`,
      },
      {
        key: "notes",
        labelKey: "sidebar.researchNotes",
        icon: IC.notes,
        path: `${basePath}/notes`,
      },
      {
        key: "reports",
        labelKey: "sidebar.teacher.reports",
        icon: IC.reports,
        path: `${basePath}/reports`,
      },
    ],
    student: [
      {
        key: "dashboard",
        labelKey: "sidebar.student.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "workspace",
        labelKey: "sidebar.student.workspace",
        icon: IC.projects,
        path: `${basePath}/workspace`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.student.notifications",
        icon: IC.reports,
        path: `${basePath}/notifications`,
      },
      {
        key: "settings",
        labelKey: "sidebar.student.settings",
        icon: IC.settings,
        path: `${basePath}/settings`,
      },
    ],
    staff: [
      {
        key: "dashboard",
        labelKey: "sidebar.staff.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "deals",
        labelKey: "sidebar.staff.tasks",
        icon: IC.deals,
        path: `${basePath}/deals`,
      },
      {
        key: "notes",
        labelKey: "sidebar.staff.notes",
        icon: IC.notes,
        path: `${basePath}/notes`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.staff.calendar",
        icon: IC.calendar,
        path: `${basePath}/calendar`,
      },
      {
        key: "projects",
        labelKey: "sidebar.staff.projects",
        icon: IC.projects,
        path: `${basePath}/projects`,
      },
      {
        key: "reports",
        labelKey: "sidebar.staff.reports",
        icon: IC.reports,
        path: `${basePath}/reports`,
      },
    ],
    author: [
      {
        key: "dashboard",
        labelKey: "sidebar.author.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "writing",
        labelKey: "sidebar.author.writing",
        icon: IC.notes,
        path: `${basePath}/writing`,
      },
      {
        key: "published",
        labelKey: "sidebar.author.published",
        icon: IC.projects,
        path: `${basePath}/published`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.author.notifications",
        icon: IC.bell,
        path: `${basePath}/notifications`,
      },
    ],
    dean: [
      {
        key: "dashboard",
        labelKey: "sidebar.dean.dashboard",
        icon: IC.dashboard,
        path: `${basePath}/dashboard`,
      },
      {
        key: "students",
        labelKey: "sidebar.dean.students",
        icon: IC.contact,
        path: `${basePath}/students`,
      },
      {
        key: "deals",
        labelKey: "sidebar.dean.overview",
        icon: IC.deals,
        path: `${basePath}/deals`,
      },
      {
        key: "projects",
        labelKey: "sidebar.dean.projects",
        icon: IC.projects,
        path: `${basePath}/projects`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.dean.calendar",
        icon: IC.calendar,
        path: `${basePath}/calendar`,
      },
      {
        key: "reports",
        labelKey: "sidebar.dean.reports",
        icon: IC.reports,
        path: `${basePath}/reports`,
      },
      {
        key: "notes",
        labelKey: "sidebar.dean.notes",
        icon: IC.notes,
        path: `${basePath}/notes`,
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
            icon: IC.notes,
            path: "/author/writing",
          },
          {
            key: "author-published",
            labelKey: "sidebar.author.published",
            icon: IC.projects,
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

  return (
    <aside
      className={` flex transition-all flex-col h-full shrink-0 transition-width  duration-100 ease  overflow-hidden bg-shell dark:bg-dark-app-secondary  ltr:border-r rtl:border-l border-default dark:border-dark-app-tertiary ${isMobile ? "border-none" : ""}  ${collapsed ? "w-16 min-w-16" : "w-65 min-w-65"}`}
    >
      <div
        className={` ${collapsed ? "px-4 py-4.5" : "px-2.5 py-4"} relative flex min-h-14 items-center border-b border-default   dark:border-dark-default ${collapsed ? " justify-center" : " justify-between"}`}
      >
        <div
          className={`absolute  ltr:right-0 rtl:left-5 top-2/4 -translate-2/4 `}
        >
          <button
            type="button"
            onClick={handleSidebarToggle}
            aria-label={t("appHeader.toggleSidebar")}
            className="group flex shrink-0 items-center rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) p-1 text-secondary transition-colors hover:border-(--color-light-input-border-focus) hover:bg-(--color-light-nav-hover-bg) hover:text-primary dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-dark-secondary dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary sm:p-1.5"
          >
            {collapsed ? (
              <TbLayoutSidebarRightCollapse className="text-[1rem] sm:text-[18px]" />
            ) : (
              <TbLayoutSidebarLeftCollapse className="text-[1rem] sm:text-[18px]" />
            )}
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: collapsed ? "10px 8px" : "10px 10px",
        }}
        className={`  flex-1 overflow-y-auto overflow-x-hidden`}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);

          return (
            <Link
              to={item.path}
              className={` relative hover:bg-dark-btn-primary-bg  group   text-left ${active ? " font-bold dark:text-white bg-dark-btn-primary-bg bg-accent/10" : "  font-normal"} ${collapsed ? "p-2.25" : " py-2.25 px-2.5"} mb-0.5 text-xs relative transition-all duration-150 ${collapsed || isMobile ? " justify-center" : " justify-start"}  cursor-pointer    flex items-center gap-2.25 w-full rounded-lg border-none no-underline`}
              key={item.key}
            >
              <Icon
                d={item.icon}
                className={`  group-hover:text-dark-text-primary    group-hover:translate-y-0.5 transition-all  size-4 ${active ? " text-dark-text-primary stroke-2 " : "text-light-text-primary  stroke-[1.5] dark:text-dark-text-primary"}`}
              />
              {!collapsed && (
                <span
                  className={`group-hover:text-dark-text-primary    ${active ? " text-dark-text-primary" : "text-light-text-primary dark:text-dark-text-primary"}`}
                >
                  {!collapsed &&
                    (item.labelKey.includes(".")
                      ? t(item.labelKey)
                      : item.labelKey)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Storage & Logout */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 14px",
          borderTop: "1px solid var(--c-border)",
        }}
        className={`${collapsed ? " py-3 px-2" : " py-3 px-3.5"}`}
      >
        <div
          style={{ marginTop: collapsed ? 0 : 8 }}
          className={`${collapsed ? " mt-0" : " mt-2"}`}
        >
          <div className="flex items-center gap-2">
            <AvatarDemo />
            {!small && (
              <div className="text-sm text-secondary dark:text-dark-secondary">
                {user?.email}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
