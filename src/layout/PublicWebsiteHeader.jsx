import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Menu, Moon, Sun, X } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import { getDashboardPathForUser } from "../lib/roles";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
    isActive
      ? "bg-neutral-200/70 text-neutral-950 dark:bg-white/10 dark:text-white"
      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
  }`;

export default function PublicWebsiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, hydrated, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navConfig = useMemo(
    () => [
      { to: "/", labelKey: "publicHeader.nav.stories", end: true },
      { to: "/write", labelKey: "publicHeader.nav.publish", end: false },
      { to: "/download", labelKey: "publicHeader.nav.download", end: false },
      {
        to: "/documentation",
        labelKey: "publicHeader.nav.documentation",
        end: false,
      },
      { to: "/about", labelKey: "publicHeader.nav.about", end: false },
    ],
    [],
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const dashboardHref =
    hydrated && isAuthenticated && user ? getDashboardPathForUser(user) : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/85">
        <div className="mx-auto flex min-h-14 max-w-[1320px] flex-wrap items-center gap-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0 lg:px-8">
          <Link
            to="/"
            className="font-blog-display order-1 shrink-0 text-[1.05rem] font-bold leading-tight tracking-tight text-neutral-950 no-underline sm:order-none sm:text-[1.125rem] dark:text-white md:text-xl"
          >
            {t("publicHeader.brand")}
          </Link>

          <nav className="order-4 hidden w-full basis-full flex-none items-center justify-center gap-0.5 md:order-none md:flex md:w-auto md:basis-auto md:flex-1 lg:gap-1">
            {navConfig.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="order-2 ml-auto flex flex-1 flex-wrap items-center justify-end gap-1 sm:order-none sm:flex-none sm:gap-2 md:flex-initial">
           
            <button
              type="button"
              onClick={() => toggleTheme()}
              aria-label={t("publicHeader.toggleTheme")}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200/90 text-neutral-600 transition-colors hover:bg-neutral-100 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              {theme === "light" ? (
                <Moon className="size-[18px]" strokeWidth={1.75} />
              ) : (
                <Sun className="size-[18px]" strokeWidth={1.75} />
              )}
            </button>

            {!hydrated ? (
              <div className="h-9 w-20 shrink-0 animate-pulse rounded-xl bg-neutral-200/60 dark:bg-white/10" />
            ) : isAuthenticated ? (
              <DropdownMenuRoot>
                <DropdownTrigger
                  showArrow={false}
                  compactIcon
                  aria-label={t("publicHeader.accountMenu")}
                  className="!size-10 shrink-0 rounded-xl border border-neutral-200/90 shadow-sm dark:border-white/10"
                  icon={<AvatarDemo />}
                />
                <DropdownContent align="end" className="w-52">
                  <DropdownLabel>
                    {typeof user?.user_name === "string" &&
                    user.user_name.trim()
                      ? user.user_name
                      : typeof user?.email === "string"
                        ? user.email
                        : t("publicHeader.signedInFallback")}
                  </DropdownLabel>
                  <DropdownItem
                    onSelect={() => {
                      navigate("/library");
                    }}
                  >
                    {t("publicHeader.readingList")}
                  </DropdownItem>
                  <DropdownItem
                    onSelect={() => {
                      navigate("/writer/profile");
                    }}
                  >
                    {t("publicHeader.yourProfile")}
                  </DropdownItem>
                  {dashboardHref ? (
                    <DropdownItem
                      onSelect={() => {
                        navigate(dashboardHref);
                      }}
                    >
                      {t("publicHeader.dashboard")}
                    </DropdownItem>
                  ) : null}
                  <DropdownSeparator />
                  <DropdownItem onClick={() => logout()}>
                    {t("publicHeader.logOut")}
                  </DropdownItem>
                </DropdownContent>
              </DropdownMenuRoot>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="btn-secondary whitespace-nowrap px-3 text-xs sm:px-4 sm:text-sm"
                >
                  {t("publicHeader.logIn")}
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary whitespace-nowrap px-3 text-xs sm:px-4 sm:text-sm"
                >
                  {t("publicHeader.signUp")}
                </Link>
              </div>
            )}

            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200/90 md:hidden dark:border-white/10"
              aria-expanded={mobileOpen}
              aria-label={t("publicHeader.openMenu")}
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
              {navConfig.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={navLinkClass}
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
              {dashboardHref ? (
                <Link
                  to={dashboardHref}
                  className="mt-2 flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2.5 text-[13px] font-semibold text-neutral-800 dark:border-white/15 dark:text-white"
                >
                  <LayoutDashboard className="size-4 shrink-0" strokeWidth={1.75} />
                  {t("publicHeader.dashboard")}
                </Link>
              ) : null}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="mt-3 rounded-xl border border-neutral-200 px-3 py-2.5 text-center text-[13px] font-semibold text-neutral-800 dark:border-white/15 dark:text-white"
                >
                  {t("publicHeader.logIn")}
                </Link>
              ) : null}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
