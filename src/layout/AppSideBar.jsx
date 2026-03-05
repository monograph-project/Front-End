import { Link, useLocation } from "react-router";
import IC from "../components/IC";
import Icon from "../components/Icon";

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: IC.dashboard, path: "/" },
    { key: "deals", label: "Deals", icon: IC.deals, path: "/deals" },
    { key: "notes", label: "Notes", icon: IC.notes, path: "/notes" },
    {
      key: "calendar",
      label: "Calendar",
      icon: IC.calendar,
      path: "/calendar",
    },
    { key: "reports", label: "Reports", icon: IC.reports, path: "/reports" },
    {
      key: "projects",
      label: "Projects",
      icon: IC.projects,
      path: "/projects",
    },
  ];
  const favItems = [
    { key: "companies", label: "Companies", icon: IC.company, count: "1,212" },
    { key: "contacts", label: "Contacts", icon: IC.contact, count: "898" },
    { key: "meetings", label: "Meetings", icon: IC.meeting, count: "32" },
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
        className={` ${collapsed ? "px-4 py-4.5" : "px-4 py-4.5"} flex min-h-15.5 items-center border-b border-default dark:border-dark-default ${collapsed ? " justify-center" : " justify-between"}`}
      >
        {!collapsed && (
          <div className=" flex items-center gap-2">
            <div className=" w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-[linear-gradient(135deg,#7c3aed,#ec4899)]">
              <Icon
                d={IC.zap}
                size={14}
                stroke="#fff"
                fill="#fff"
                strokeWidth={1}
              />
            </div>
            <div>
              <div className=" text-sm font-bold text-primary  dark:text-dark-primary ">
                Pivora
              </div>
              <div className=" text-xs text-muted dark:text-dark-muted leading-3">
                CRM Platform
              </div>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            onClick={onToggle}
            className=" cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg bg-[linear-gradient(135deg,#7c3aed,#ec4899)]"
          >
            <Icon
              d={IC.zap}
              size={14}
              stroke="#fff"
              fill="#fff"
              strokeWidth={1}
            />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className=" flex bg-none border-none text-muted dark:text-dark-muted cursor-pointer p-1 rounded-[6px]"
          >
            <Icon d={IC.collapse} size={15} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* User */}
      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 14px",
        }}
        className=" border-b border-default dark:border-dark-default"
      >
        <div
          className=" cursor-pointer  flex items-center gap-2 bg-nav-hover dark:bg-dark-nav-hover rounded[8px]"
          style={{
            padding: collapsed ? "7px" : "7px 10px",
          }}
        >
          <div className=" flex items-center justify-center shrink-0 text-xs font-bold text-white  w-7 h-7 rounded-full bg-[linear-gradient(135deg,#6366f1,#8b5cf6)]">
            W
          </div>
          {!collapsed && (
            <>
              <span className=" text-xs text-secondary dark:text-dark-secondary flex-1 overflow-hidden whitespace-nowrap">
                williams@mesh.com
              </span>
              <Icon
                d={IC.chevDown}
                className={
                  " size-3 stroke-muted dark:stroke-dark-muted stroke-2"
                }
              />
            </>
          )}
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
              className={` relative text-left ${active ? " font-bold" : " font-normal"} ${collapsed ? "p-2.25" : " py-2.25 px-2.5"} mb-0.5 text-xs relative transition-all duration-150 ${collapsed ? " justify-center" : " justify-start"}  ${active ? " bg-nav-main-active dark:bg-dark-nav-main-active text-nav-text-active dark:text-dark-nav-text-active  " : " text-secondary  bg-transparent"}  cursor-pointer  flex items-center gap-2.25 w-full rounded-lg border-none no-underline`}
              key={item.key}
            >
              {active && !collapsed && (
                <div className=" absolute -left-0.5 top-[20%] bottom-[20%]  border-2 bg-accent dark:bg-accent-dark" />
              )}
              <Icon
                d={item.icon}
                className={`  size-4 ${active ? " text-nav-text-active stroke-2 " : " text-muted stroke-[1.5]"}`}
              />
              {!collapsed && item.label}
            </Link>
          );
        })}

        {/* Favorites */}
        {!collapsed && (
          <>
            <div className="flex items-center justify-between mt-1 pt-3.5 pr-2.5 pb-1.5 ">
              <span className=" text-[10px] font-semibold tracking-[0.08em] text-muted dark:text-dark-muted  uppercase">
                Favorites
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
                className=" text-secondary dark:text-dark-secondary text-xs cursor-pointer mb-0.5  flex items-center gap-2 w-full py-2.25 px-2.5 rounded-lg border-none bg-transparent"
              >
                <Icon
                  d={f.icon}
                  className={
                    " stroke-muted dark:stroke-dark-muted stroke-[1.5] size-3.5"
                  }
                />
                <span style={{ flex: 1, textAlign: "left" }}>{f.label}</span>
                <span style={{ fontSize: 10, color: "var(--c-text-muted)" }}>
                  {f.count}
                </span>
              </button>
            ))}

            {/* Projects */}
            <div className=" flex items-center justify-between pt-3 pr-2.5 pb-1.5">
              <span className=" text-[10px] tracking-[0.08em] font-semibold text-muted dark:text-dark-muted uppercase l">
                Projects
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

      {/* Storage */}
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
                Cloud Storage
              </span>
              <span className=" text-[11px] font-semibold text-secondary dark:text-dark-secondary">
                90%
              </span>
            </div>
            <div className=" bg-storage-bg dark:bg-storage-dark-bg rounded-[99px] overflow-hidden mb-2 h-1.25">
              <div className=" h-full w-[90%] rounded-[99px] bg-storage-fill dark:bg-storage-dark-fill" />
            </div>
            <div className=" text-[10px] text-muted dark:text-dark-muted mb-2">
              1.8 GB of 2 GB used
            </div>
            <button className=" bg-card text-[11px] cursor-pointer  dark:bg-dark-card text-secondary dark:text-dark-secondary  flex items-center gap-1.5 w-full py-1.75 px-2.5 rounded-lg border border-default dark:border-dark-default">
              <Icon
                d={IC.upload}
                className={" stroke-muted dark:stroke-dark-muted size-3"}
              />
              Upgrade Storage
              <span className=" ml-auto text-[10px] text-muted dark:text-dark-muted">
                (up to 25GB)
              </span>
            </button>
          </>
        )}
        <div
          style={{ marginTop: collapsed ? 0 : 8 }}
          className={`${collapsed ? " mt-0" : " mt-2"}`}
        >
          <button
            className={` text-xs cursor-pointer   border-8 border-none bg-transparent  text-secondary dark:text-dark-secondary  flex items-center gap-2 w-full ${collapsed ? " p-2 justify-center" : " justify-start  px-2.5 py-2"}`}
          >
            <Icon
              d={IC.settings}
              className={
                " stroke-muted dark:stroke-dark-muted stroke-[1.5] size-3.5"
              }
            />
            {!collapsed && "Settings"}
          </button>
          <button
            className={` text-xs cursor-pointer   border-8 border-none bg-transparent  text-secondary dark:text-dark-secondary  flex items-center gap-2 w-full ${collapsed ? " p-2 justify-center" : " justify-start  px-2.5 py-2"}`}
          >
            <Icon
              d={IC.help}
              className={
                " stroke-muted dark:stroke-dark-muted stroke-[1.5] size-3.5"
              }
            />
            {!collapsed && "Help Center"}
          </button>
        </div>
      </div>
    </aside>
  );
}
