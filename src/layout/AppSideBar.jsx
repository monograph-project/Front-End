import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import AvatarDemo from "../components/Avatar";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getFacultyDashboardPath } from "../lib/roles";
export default function AppSidebar() {
  const { collapsed, handleSidebarToggle, isMobile } = useSidebar();
  const small = collapsed;
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const basePath = getFacultyDashboardPath(user?.role) ?? "/teacher";

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
        key: "projects",
        labelKey: "sidebar.student.projects",
        icon: IC.projects,
        path: `${basePath}/projects`,
      },
      {
        key: "repositories",
        labelKey: "sidebar.student.repositories",
        icon: IC.projects,
        path: `${basePath}/repositories`,
      },
      {
        key: "tasks",
        labelKey: "sidebar.student.tasks",
        icon: IC.deals,
        path: `${basePath}/tasks`,
      },
      {
        key: "contributors",
        labelKey: "sidebar.student.contributors",
        icon: IC.contact,
        path: `${basePath}/contributors`,
      },
      {
        key: "notifications",
        labelKey: "sidebar.student.notifications",
        icon: IC.reports,
        path: `${basePath}/notifications`,
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

  const navItems = [...(roleNavItems[user?.role] || roleNavItems.teacher)];

  // Role-specific favorites
  const roleFavItems = {
    admin: [
      {
        key: "userStats",
        labelKey: "sidebar.admin.userStats",
        icon: IC.reports,
        count: "1,250",
      },
      {
        key: "activeSessions",
        labelKey: "sidebar.admin.sessions",
        icon: IC.meeting,
        count: "45",
      },
    ],
    teacher: [
      {
        key: "recentStudents",
        labelKey: "sidebar.teacher.recentStudents",
        icon: IC.contact,
        count: "28",
      },
      {
        key: "pendingGrades",
        labelKey: "sidebar.teacher.pendingGrades",
        icon: IC.notes,
        count: "12",
      },
    ],
    student: [
      {
        key: "dueAssignments",
        labelKey: "sidebar.student.dueAssignments",
        icon: IC.notes,
        count: "5",
      },
      {
        key: "upcomingClasses",
        labelKey: "sidebar.student.classes",
        icon: IC.calendar,
        count: "3",
      },
    ],
    staff: [
      {
        key: "openTasks",
        labelKey: "sidebar.staff.openTasks",
        icon: IC.deals,
        count: "18",
      },
      {
        key: "meetings",
        labelKey: "sidebar.meetings",
        icon: IC.meeting,
        count: "4",
      },
    ],
    dean: [
      {
        key: "programs",
        labelKey: "sidebar.dean.programs",
        icon: IC.company,
        count: "6",
      },
      {
        key: "alerts",
        labelKey: "sidebar.dean.alerts",
        icon: IC.bell,
        count: "2",
      },
    ],
  };

  const favItems = roleFavItems[user?.role] || roleFavItems.teacher;

  const switchRole = (newRole) => {
    const updatedUser = { ...user, role: newRole };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    const next = getFacultyDashboardPath(newRole);
    window.location.href = next ? `${next}/dashboard` : "/";
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={` flex flex-col h-full shrink-0 transition-width  duration-100 ease  overflow-hidden bg-shell dark:bg-dark-shell  ltr:border-r rtl:border-l border-default dark:border-dark-default ${isMobile ? "border-none" : ""}  ${collapsed ? "w-16 min-w-16" : "w-65 min-w-65"}`}
    >
      <div
        className={` ${collapsed ? "px-4 py-4.5" : "px-2.5 py-4"} flex min-h-14 items-center border-b border-default dark:border-dark-default ${collapsed ? " justify-center" : " justify-between"}`}
        onClick={handleSidebarToggle}
      >
        {!collapsed && (
          <button className="ml-auto p-1 hover:bg-accent/20 rounded">
            <Icon d={IC.menu} className="w-4 h-4" />
          </button>
        )}
        {collapsed && <Icon d={IC.menu} className="w-4 h-4 cursor-pointer" />}
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
              className={` relative  dark:hover:bg-dark-app hover:bg-app group   text-left ${active ? " font-bold dark:text-white dark:bg-accent-light/10 bg-accent/10" : "dark:text-white/60  font-normal"} ${collapsed ? "p-2.25" : " py-2.25 px-2.5"} mb-0.5 text-xs relative transition-all duration-150 ${collapsed || isMobile ? " justify-center" : " justify-start"}  cursor-pointer    flex items-center gap-2.25 w-full rounded-lg border-none no-underline`}
              key={item.key}
            >
              {active && !collapsed && (
                <div className=" absolute ltr:-left-0.5  rtl:-right-0.5 top-[20%] bottom-[20%]  border-2 bg-accent   rounded-3xl" />
              )}
              <Icon
                d={item.icon}
                className={` dark:text-white text-primary group-hover:translate-y-0.5 transition-all  size-4 ${active ? " text-nav-text-active stroke-2 " : " text-muted stroke-[1.5]"}`}
              />
              {!collapsed && (
                <span className=" dark:text-badge text-primary ">
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
