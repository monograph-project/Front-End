import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { getFacultyDashboardPath } from "../lib/roles";

const NAV = [
  {
    to: "/",
    label: "Home",
    icon: (
      <svg
        width={15}
        height={15}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.07926 0.222253C7.31275 -0.007434 7.6873 -0.007434 7.92079 0.222253L14.6708 6.86227C14.907 7.09465 14.9101 7.47453 14.6778 7.71076C14.4454 7.947 14.0655 7.95012 13.8293 7.71773L13 6.90201V12.5C13 12.7761 12.7762 13 12.5 13H2.50002C2.22388 13 2.00002 12.7761 2.00002 12.5V6.90201L1.17079 7.71773C0.934558 7.95012 0.554672 7.947 0.32229 7.71076C0.0899079 7.47453 0.0930283 7.09465 0.32926 6.86227L7.07926 0.222253ZM7.50002 1.49163L12 5.91831V12H10V8.49999C10 8.22385 9.77617 7.99999 9.50002 7.99999H6.50002C6.22388 7.99999 6.00002 8.22385 6.00002 8.49999V12H3.00002V5.91831L7.50002 1.49163ZM7.00002 12H9.00002V8.99999H7.00002V12Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
    ),
    end: true,
  },
  {
    to: "/write",
    label: "Write",
    icon: (
      <svg
        width={15}
        height={15}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.94993 2.95002L3.94993 4.49998C3.94993 4.74851 3.74845 4.94998 3.49993 4.94998C3.2514 4.94998 3.04993 4.74851 3.04993 4.49998V2.50004C3.04993 2.45246 3.05731 2.40661 3.07099 2.36357C3.12878 2.18175 3.29897 2.05002 3.49993 2.05002H11.4999C11.6553 2.05002 11.7922 2.12872 11.8731 2.24842C11.9216 2.32024 11.9499 2.40682 11.9499 2.50002L11.9499 2.50004V4.49998C11.9499 4.74851 11.7485 4.94998 11.4999 4.94998C11.2514 4.94998 11.0499 4.74851 11.0499 4.49998V2.95002H8.04993V12.05H9.25428C9.50281 12.05 9.70428 12.2515 9.70428 12.5C9.70428 12.7486 9.50281 12.95 9.25428 12.95H5.75428C5.50575 12.95 5.30428 12.7486 5.30428 12.5C5.30428 12.2515 5.50575 12.05 5.75428 12.05H6.94993V2.95002H3.94993Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
    ),
  },
  {
    to: "/library",
    label: "Reading list",
    icon: (
      <svg
        width={15}
        height={15}
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M13.5 4H1.5C1.22386 4 1 4.22386 1 4.5V10.5C1 10.7761 1.22386 11 1.5 11H13.5C13.7761 11 14 10.7761 14 10.5V4.5C14 4.22386 13.7761 4 13.5 4ZM1.5 3C0.671573 3 0 3.67157 0 4.5V10.5C0 11.3284 0.671573 12 1.5 12H13.5C14.3284 12 15 11.3284 15 10.5V4.5C15 3.67157 14.3284 3 13.5 3H1.5ZM2 5H3V6H2V5ZM5 5H4V6H5V5ZM6 5H7V6H6V5ZM9 5H8V6H9V5ZM10 5H11V6H10V5ZM13 5H12V6H13V5ZM11 7H12V8H11V7ZM13 9H12V10H13V9ZM9 7H10V8H9V7ZM8 7H7V8H8V7ZM5 7H6V8H5V7ZM4 7H3V8H4V7ZM2 9H3V10H2V9ZM11 9H4V10H11V9Z"
          fill="currentColor"
        ></path>
      </svg>
    ),
  },
  {
    to: "/topic/Technology",
    label: "follower",
    icon: (
      <svg
        className=" w-6"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0.877014 7.49988C0.877014 3.84219 3.84216 0.877045 7.49985 0.877045C11.1575 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1575 14.1227 7.49985 14.1227C3.84216 14.1227 0.877014 11.1575 0.877014 7.49988ZM7.49985 1.82704C4.36683 1.82704 1.82701 4.36686 1.82701 7.49988C1.82701 8.97196 2.38774 10.3131 3.30727 11.3213C4.19074 9.94119 5.73818 9.02499 7.50023 9.02499C9.26206 9.02499 10.8093 9.94097 11.6929 11.3208C12.6121 10.3127 13.1727 8.97172 13.1727 7.49988C13.1727 4.36686 10.6328 1.82704 7.49985 1.82704ZM10.9818 11.9787C10.2839 10.7795 8.9857 9.97499 7.50023 9.97499C6.01458 9.97499 4.71624 10.7797 4.01845 11.9791C4.97952 12.7272 6.18765 13.1727 7.49985 13.1727C8.81227 13.1727 10.0206 12.727 10.9818 11.9787ZM5.14999 6.50487C5.14999 5.207 6.20212 4.15487 7.49999 4.15487C8.79786 4.15487 9.84999 5.207 9.84999 6.50487C9.84999 7.80274 8.79786 8.85487 7.49999 8.85487C6.20212 8.85487 5.14999 7.80274 5.14999 6.50487ZM7.49999 5.10487C6.72679 5.10487 6.09999 5.73167 6.09999 6.50487C6.09999 7.27807 6.72679 7.90487 7.49999 7.90487C8.27319 7.90487 8.89999 7.27807 8.89999 6.50487C8.89999 5.73167 8.27319 5.10487 7.49999 5.10487Z"
          fill="currentColor"
          fill-rule="evenodd"
          clip-rule="evenodd"
        ></path>
      </svg>
    ),
  },
];

export default function Sidebar({ mobileSidebarOpen, setMobileSidebarOpen }) {
  const { collapsed, handleSidebarToggle, isMobile } = useSidebar();
  const { user } = useAuth();
  const facultyBase = user ? getFacultyDashboardPath(user.role) : null;

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      handleSidebarToggle();
    }
  };

  return (
    <aside
      className={` flex flex-col h-full shrink-0 transition-width  duration-100 ease  overflow-hidden bg-shell dark:bg-dark-shell rtl:border-l  ltr:border-r border-default dark:border-dark-default ${isMobile ? "border-none" : ""}  ${collapsed ? "w-16 min-w-18" : "w-70 min-w-70"}`}
    >
      <div className="h-full relative">
        <div
          onClick={toggleSidebar}
          className={`  flex items-center justify-center  ${collapsed ? "px-4 py-4.5" : "px-2.5 py-2"} flex min-h-14 items-center border-b border-default dark:border-dark-default ${collapsed ? " justify-center" : " justify-between"}`}
        >
          {!collapsed && (
            <h1 className="text-lg font-bold tracking-tight">Campus Medium</h1>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 px-2 py-1 mt-4  overflow-y-auto `}>
          <nav className=" space-y-1 px-2 pb-4">
            {NAV.map((item) => {
              return (
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive: navActive }) =>
                    `relative dark:hover:bg-dark-app hover:bg-app group  ${
                      navActive
                        ? "font-bold dark:text-white dark:bg-accent-light/10 bg-accent/10"
                        : "dark:text-white/60 font-normal"
                    } ${collapsed ? "p-2.25 py-2" : " py-2.25 px-2.5"}   text-xs relative transition-all duration-150 ${
                      collapsed ? " justify-center " : " justify-start   "
                    } cursor-pointer flex items-center   mx-auto  gap-2.25 w-full rounded-lg  no-underline`
                  }
                  key={item.to}
                >
                  <span className="">{item.icon}</span>
                  {!collapsed && (
                    <span className=" dark:text-badge text-primary ">
                      {item.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className=" absolute bottom-3 w-full  px-3 py-3 ">
          <button
            type="button"
            className="rounded-md w-full flex items-center gap-x-3 justify-center bg-success cursor-pointer  text-white px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 2C2.44772 2 2 2.44772 2 3V12C2 12.5523 2.44772 13 3 13H12C12.5523 13 13 12.5523 13 12V8.5C13 8.22386 12.7761 8 12.5 8C12.2239 8 12 8.22386 12 8.5V12H3V3L6.5 3C6.77614 3 7 2.77614 7 2.5C7 2.22386 6.77614 2 6.5 2H3ZM12.8536 2.14645C12.9015 2.19439 12.9377 2.24964 12.9621 2.30861C12.9861 2.36669 12.9996 2.4303 13 2.497L13 2.5V2.50049V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3.70711L6.85355 8.85355C6.65829 9.04882 6.34171 9.04882 6.14645 8.85355C5.95118 8.65829 5.95118 8.34171 6.14645 8.14645L11.2929 3H9.5C9.22386 3 9 2.77614 9 2.5C9 2.22386 9.22386 2 9.5 2H12.4999H12.5C12.5678 2 12.6324 2.01349 12.6914 2.03794C12.7504 2.06234 12.8056 2.09851 12.8536 2.14645Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </span>
            {!collapsed && <span>Write</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
