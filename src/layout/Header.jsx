import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFacultyDashboardPath } from "../lib/roles";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownTrigger,
} from "../components/DropdownMenu";
import AvatarDemo from "../components/Avatar";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/themContext";
import { setDocumentDirection } from "../i18n";

export default function Header({ setMobileSidebarOpen }) {
  const { isAuthenticated, user } = useAuth();
  const facultyBase = user ? getFacultyDashboardPath(user.role) : null;
  const dashboardHref = facultyBase ? `${facultyBase}/dashboard` : null;
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setDocumentDirection(langCode);
  };

  const navCls = ({ isActive }) =>
    [
      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
      isActive
        ? "bg-foreground text-background"
        : "text-secondary hover:text-primary dark:text-dark-secondary dark:hover:text-dark-primary",
    ].join(" ");

  return (
    <header className="sticky top-0 z-20 border-b border-default bg-shell/90 backdrop-blur-md dark:border-dark-default dark:bg-dark-shell/90">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-default bg-card hover:bg-nav-hover dark:border-dark-default dark:bg-dark-card dark:hover:bg-dark-nav-hover lg:hidden"
            aria-label="Open sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link to="/" className="hidden shrink-0 items-center gap-2 sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white dark:bg-dark-accent dark:text-black">
              M
            </span>
            <span className="font-heading text-lg font-bold tracking-tight">
              Campus Medium
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={navCls}>
              Home
            </NavLink>
            <NavLink to="/library" className={navCls}>
              Library
            </NavLink>
            <NavLink to="/topic/Technology" className={navCls}>
              Topics
            </NavLink>
          </nav>
        </div>

        <div className="hidden max-w-md flex-1 md:flex lg:max-w-xl">
          <div className="relative w-full">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted dark:text-dark-muted">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search stories, writers, topics…"
              className="h-10 w-full rounded-full border border-default bg-input pl-10 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-primary dark:border-dark-default dark:bg-dark-input dark:text-dark-primary dark:placeholder:text-dark-muted dark:focus:border-dark-primary"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/write"
            className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:bg-dark-accent dark:text-black sm:inline-flex"
          >
            Write
          </Link>

          {isAuthenticated && dashboardHref ? (
            <Link
              to={dashboardHref}
              className="hidden rounded-full border border-default px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-nav-hover dark:border-dark-default dark:text-dark-secondary dark:hover:bg-dark-nav-hover sm:inline-flex"
            >
              Dashboard
            </Link>
          ) : null}

          {!isAuthenticated ? (
            <Link
              to="/login"
              className="rounded-full border border-default px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-nav-hover dark:border-dark-default dark:text-dark-secondary dark:hover:bg-dark-nav-hover sm:px-4 sm:text-sm"
            >
              Sign in
            </Link>
          ) : (
            <DropdownMenuRoot>
              <DropdownTrigger icon={<AvatarDemo />}>
                {user?.fullName?.split?.(" ")?.[0] ?? user?.email}
              </DropdownTrigger>

              <DropdownContent align="end" className="w-44">
                <DropdownLabel>Account</DropdownLabel>

                <DropdownItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownItem>
                <DropdownItem onClick={() => toggleTheme()}>
                  {theme === "light" ? "Switch to dark" : "Switch to light"}
                </DropdownItem>

                <DropdownSeparator />

                <DropdownLabel>Language</DropdownLabel>

                <DropdownRadioGroup
                  value={i18n.language}
                  onValueChange={handleLanguageChange}
                >
                  <DropdownRadioItem value="en">English</DropdownRadioItem>
                  <DropdownRadioItem value="ps">پښتو</DropdownRadioItem>
                  <DropdownRadioItem value="prs">فارسی</DropdownRadioItem>
                </DropdownRadioGroup>
              </DropdownContent>
            </DropdownMenuRoot>
          )}

          <Link
            to="/write"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-default bg-card sm:hidden dark:border-dark-default dark:bg-dark-card"
            aria-label="Write"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
      />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
      />
    </svg>
  );
}
