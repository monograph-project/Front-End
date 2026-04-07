import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import IC from "../components/IC";
import Icon from "../components/Icon";

export default function Sidebar({ collapsed, onToggle }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const basePath = user?.role === "admin" ? "/admin" : `/${user?.role}`;

  const navItems = [
    {
      key: "dashboard",
      labelKey: "sidebar.dashboard",
      icon: IC.dashboard,
      path: `${basePath}/dashboard`,
    },
    {
      key: "students",
      labelKey: "sidebar.students",
      icon: IC.deals,
      path: `${basePath}/deals`,
    },
    {
      key: "researchNotes",
      labelKey: "sidebar.researchNotes",
      icon: IC.notes,
      path: `${basePath}/notes`,
    },
    {
      key: "academicCalendar",
      labelKey: "sidebar.academicCalendar",
      icon: IC.calendar,
      path: `${basePath}/calendar`,
    },
    {
      key: "academicReports",
      labelKey: "sidebar.academicReports",
      icon: IC.reports,
      path: `${basePath}/reports`,
    },
    {
      key: "researchProjects",
      labelKey: "sidebar.researchProjects",
      icon: IC.projects,
      path: `${basePath}/projects`,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const favItems = [
    {
      key: "departments",
      labelKey: "sidebar.departments",
      icon: IC.company,
      count: "1,212",
    },
    {
      key: "facultyMembers",
      labelKey: "sidebar.facultyMembers",
      icon: IC.contact,
      count: "898",
    },
    {
      key: "meetings",
      labelKey: "sidebar.meetings",
      icon: IC.meeting,
      count: "32",
    },
  ];

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={` flex flex-col h-full shrink-0 transition-width  duration-100 ease  overflow-hidden bg-sidebar dark:bg-dark-sidebar border-r border-default dark:border-dark-default  ${collapsed ? "w-16 min-w-16" : "w-50 min-w-50"}`}
    >
      {/* Brand */}
      <div
        className={` ${collapsed ? "px-4 py-4.5" : "px-2.5 py-4"} flex min-h-14 items-center border-b border-default dark:border-dark-default ${collapsed ? " justify-center" : " justify-between"}`}
      ></div>

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
              className={` relative text-left ${active ? " font-bold dark:text-white dark:bg-accent-light/10 bg-accent/10" : "dark:text-white/60  font-normal"} ${collapsed ? "p-2.25" : " py-2.25 px-2.5"} mb-0.5 text-xs relative transition-all duration-150 ${collapsed ? " justify-center" : " justify-start"}  cursor-pointer    flex items-center gap-2.25 w-full rounded-lg border-none no-underline`}
              key={item.key}
            >
              {active && !collapsed && (
                <div className=" absolute ltr:-left-0.5  rtl:-right-0.5 top-[20%] bottom-[20%]  border-2 bg-accent   rounded-3xl" />
              )}
              <Icon
                d={item.icon}
                className={` dark:text-white  size-4 ${active ? " text-nav-text-active stroke-2 " : " text-muted stroke-[1.5]"}`}
              />
              {!collapsed && t(item.labelKey)}
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
                className=" text-secondary dark:text-dark-secondary text-xs cursor-pointer mb-0.5  flex items-center justify-between gap-2 w-full py-2.25 px-2.5 rounded-lg border-none bg-transparent"
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
        {!collapsed && user && (
          <div className="mb-4 p-3 bg-input dark:bg-dark-input rounded-lg">
            <div className="text-xs font-semibold text-primary dark:text-dark-primary capitalize mb-1">
              {user.role}
            </div>
            <div className="text-[10px] text-muted dark:text-dark-muted truncate">
              {user.email}
            </div>
          </div>
        )}
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
          <button
            onClick={handleLogout}
            className={` text-xs cursor-pointer border-none bg-transparent text-error dark:text-dark-error flex items-center gap-2 w-full ${collapsed ? " p-2 justify-center" : " justify-start px-2.5 py-2"} hover:bg-input dark:hover:bg-dark-input rounded-lg transition-colors`}
          >
            <Icon
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              className="size-3.5 stroke-[1.5]"
            />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>
    </aside>
  );
}
