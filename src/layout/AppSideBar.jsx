import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import AvatarDemo from "../components/Avatar";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownSub,
  DropdownSubContent,
  DropdownSubTrigger,
  DropdownTrigger,
} from "../components/DropdownMenu";
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
        key: "departments",
        labelKey: "sidebar.admin.departments",
        icon: IC.company,
        path: `${basePath}/departments`,
      },
      {
        key: "roles",
        labelKey: "sidebar.admin.roles",
        icon: IC.settings,
        path: `${basePath}/roles`,
      },
      {
        key: "reports",
        labelKey: "sidebar.admin.reports",
        icon: IC.reports,
        path: `${basePath}/reports`,
      },
      {
        key: "students",
        labelKey: "sidebar.admin.students",
        icon: IC.contact,
        path: `${basePath}/students`,
      },
      {
        key: "projects",
        labelKey: "sidebar.admin.researchProjects",
        icon: IC.projects,
        path: `${basePath}/projects`,
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
        key: "collaboration",
        labelKey: "sidebar.student.collaboration",
        icon: IC.meeting,
        path: `${basePath}/collaboration`,
      },
      {
        key: "groups",
        labelKey: "sidebar.student.groups",
        icon: IC.deals,
        path: `${basePath}/deals`,
      },
      {
        key: "courses",
        labelKey: "sidebar.student.courses",
        icon: IC.company,
        path: `${basePath}/courses`,
      },
      {
        key: "assignments",
        labelKey: "sidebar.student.assignments",
        icon: IC.notes,
        path: `${basePath}/assignments`,
      },
      {
        key: "grades",
        labelKey: "sidebar.student.grades",
        icon: IC.reports,
        path: `${basePath}/grades`,
      },
      {
        key: "schedule",
        labelKey: "sidebar.student.schedule",
        icon: IC.calendar,
        path: `${basePath}/schedule`,
      },
      {
        key: "calendar",
        labelKey: "sidebar.academicCalendar",
        icon: IC.calendar,
        path: `${basePath}/calendar`,
      },
      {
        key: "reports",
        labelKey: "sidebar.academicReports",
        icon: IC.reports,
        path: `${basePath}/reports`,
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

  const navItems = roleNavItems[user?.role] || roleNavItems.teacher;

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
      className={` flex flex-col h-full shrink-0 transition-width  duration-100 ease  overflow-hidden bg-shell dark:bg-dark-shell  border-r border-default dark:border-dark-default ${isMobile ? "border-none" : ""}  ${collapsed ? "w-16 min-w-16" : "w-50 min-w-50"}`}
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
              <span className=" dark:text-badge text-primary ">
                {!collapsed && t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        {/* Favorites */}
        {!collapsed && (
          <>
            <div className="flex items-center justify-between mt-1 pt-3.5 pr-2.5 pb-1.5 ">
              <span className=" text-[10px] font-semibold tracking-[0.08em] text-muted dark:text-dark-muted  uppercase">
                {t("sidebar.favorites")}
              </span>
              <div className=" flex gap-1">
                <button className=" p-2 text-[16px] leading-px bg-none border-none text-muted dark:text-dark-muted cursor-pointer">
                  ···
                </button>
                <button className="bg-none border-none text-muted dark:text-dark-muted p-2 cursor-pointer">
                  <Icon
                    d={IC.plus}
                    className={
                      " stroke-muted dark:stroke-dark-muted stroke-[1.5] size-3.5"
                    }
                  />
                </button>
              </div>
            </div>
            {favItems.map((f) => (
              <button
                key={f.key}
                className=" text-secondary dark:text-dark-secondary t text-xs cursor-pointer mb-0.5  flex items-center justify-between gap-2 w-full py-2.25 px-2.5 rounded-lg border-none bg-transparent"
              >
                <div className="flex items-center gap-x-1">
                  <Icon
                    d={f.icon}
                    className={
                      " stroke-muted dark:stroke-dark-muted stroke-[1.5] size-3.5"
                    }
                  />
                  <span style={{ flex: 1, textAlign: "left" }}>
                    {t(f.labelKey)}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
                  {f.count}
                </span>
              </button>
            ))}

            {/* Projects */}
            <div className=" flex items-center justify-between pt-3 pr-2.5 pb-1.5">
              <span className=" text-[10px] tracking-[0.08em] font-semibold text-muted dark:text-dark-muted uppercase l">
                {t("sidebar.projectsSection")}
              </span>
              <div className=" flex gap-1">
                <button className=" bg-none border-none text-muted dark:bg-dark-muted cursor-pointer p-0.5 text-[16px] leading-1">
                  ···
                </button>
                <button className=" bg-none border-none text-muted dark:text-dark-muted cursor-pointer p-0.5">
                  <Icon d={IC.plus} size={12} />
                </button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Storage & Logout */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 14px",
          borderTop: "1px solid var(--c-border)",
        }}
        className={`${collapsed ? " py-3 px-2" : " py-3 px-3.5"}`}
      >
        {!collapsed && (
          <>
            <div className=" flex justify-between mb-1.5">
              <span className=" text-xs text-secondary dark:text-dark-secondary font-medium">
                {t("sidebar.cloudStorage")}
              </span>
              <span className=" text-[11px] font-semibold text-secondary dark:text-dark-secondary">
                90%
              </span>
            </div>
            <div className=" bg-storage-bg dark:bg-storage-dark-bg rounded-[99px] overflow-hidden mb-2 h-1.25">
              <div className=" h-full w-[90%] rounded-[99px] bg-storage-fill dark:bg-storage-dark-fill" />
            </div>
            <div className=" text-[10px] text-muted dark:text-dark-muted mb-4">
              {t("sidebar.storageUsed")}
            </div>
          </>
        )}
        <div
          style={{ marginTop: collapsed ? 0 : 8 }}
          className={`${collapsed ? " mt-0" : " mt-2"}`}
        >
          <DropdownMenuRoot>
            <DropdownTrigger icon={<AvatarDemo />}>
              {!small && user.email}
            </DropdownTrigger>
            {/* <AccountTrigger /> */}

            <DropdownContent>
              <DropdownLabel>Account</DropdownLabel>

              <DropdownItem
                icon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                }
              >
                <span>Profile</span>
              </DropdownItem>
              <DropdownItem
                icon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                }
              >
                Settings
              </DropdownItem>

              <DropdownSeparator />

              <DropdownLabel>Actions</DropdownLabel>

              <DropdownItem
                icon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                }
                variant="warning"
              >
                Archive
              </DropdownItem>
              <DropdownItem
                icon={
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                }
                variant="danger"
              >
                Delete
              </DropdownItem>

              <DropdownSeparator />

              <DropdownSub>
                <DropdownSubTrigger>Current: {user?.role}</DropdownSubTrigger>
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
                    Reader (public only)
                  </DropdownItem>
                </DropdownSubContent>
              </DropdownSub>
              <DropdownSub>
                <DropdownSubTrigger>More</DropdownSubTrigger>
                <DropdownSubContent>
                  <DropdownItem>Logs</DropdownItem>
                  <DropdownItem>Analytics</DropdownItem>
                </DropdownSubContent>
              </DropdownSub>
            </DropdownContent>
          </DropdownMenuRoot>
        </div>
      </div>
    </aside>
  );
}
