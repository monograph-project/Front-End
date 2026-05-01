import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "../context/themContext";
import { useAuth } from "../context/AuthContext";
import AvatarDemo from "../components/Avatar";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../components/DropdownMenu";
import { getFacultyDashboardPath } from "../lib/roles";

const navLinkClass =
  ({ isActive }) =>
  `rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
    isActive
      ? "bg-neutral-200/70 text-neutral-950 dark:bg-white/10 dark:text-white"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
  }`;

const NAV = [
  { to: "/", label: "Stories", end: true },
  { to: "/write", label: "Publish" },
  { to: "/download", label: "Download" },
  { to: "/documentation", label: "Documentation" },
  { to: "/about", label: "About us" },
];

export default function PublicWebsiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, hydrated, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const dashboardBase = user?.role ? getFacultyDashboardPath(user.role) : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="font-blog-display shrink-0 text-[1.125rem] font-bold tracking-tight text-neutral-950 no-underline sm:text-xl dark:text-white"
          >
            Campus
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => toggleTheme()}
              aria-label="Toggle theme"
              className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/90 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              {theme === "light" ? (
                <Moon className="size-[18px]" strokeWidth={1.75} />
              ) : (
                <Sun className="size-[18px]" strokeWidth={1.75} />
              )}
            </button>

            {!hydrated ? (
              <div className="h-9 w-20 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/10" />
            ) : isAuthenticated ? (
              <DropdownMenuRoot>
                <DropdownTrigger
                  showArrow={false}
                  compactIcon
                  aria-label="Account menu"
                  className="!size-10 rounded-xl border border-neutral-200/90 shadow-sm dark:border-white/10"
                  icon={<AvatarDemo />}
                />
                <DropdownContent align="end" className="w-52">
                  <DropdownLabel>
                    {typeof user?.user_name === "string" &&
                    user.user_name.trim()
                      ? user.user_name
                      : typeof user?.email === "string"
                        ? user.email
                        : "Signed in"}
                  </DropdownLabel>
                  <DropdownItem
                    onSelect={() => {
                      navigate("/library");
                    }}
                  >
                    Reading list
                  </DropdownItem>
                  <DropdownItem
                    onSelect={() => {
                      navigate("/writer/profile");
                    }}
                  >
                    Your profile
                  </DropdownItem>
                  {dashboardBase ? (
                    <DropdownItem
                      onSelect={() => {
                        navigate(`${dashboardBase}/dashboard`);
                      }}
                    >
                      Dashboard
                    </DropdownItem>
                  ) : null}
                  <DropdownSeparator />
                  <DropdownItem onClick={() => logout()}>
                    Log out
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenuRoot>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="hidden rounded-xl px-3 py-2 text-[13px] font-semibold text-neutral-700 transition-colors hover:text-neutral-950 sm:inline dark:text-neutral-300 dark:hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-[13px] font-semibold text-white no-underline shadow-sm transition-opacity hover:opacity-90 dark:bg-white dark:text-neutral-950"
                >
                  Sign up
                </Link>
              </div>
            )}

            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/90 md:hidden dark:border-white/10"
              aria-expanded={mobileOpen}
              aria-label="Open menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <X className="size-[18px]" strokeWidth={1.75} />
              ) : (
                <Menu className="size-[18px]" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-neutral-200/80 bg-white px-4 py-4 dark:border-white/10 dark:bg-zinc-950 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  {item.label}
                </NavLink>
              ))}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="mt-3 rounded-xl border border-neutral-200 px-3 py-2.5 text-center text-[13px] font-semibold text-neutral-800 dark:border-white/15 dark:text-white"
                >
                  Log in
                </Link>
              ) : null}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
