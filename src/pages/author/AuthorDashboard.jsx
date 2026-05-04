import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PenLine, BookOpenCheck, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AuthorDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const authorOnly = user?.role === "author";

  const cards = [
    {
      to: "/author/writing",
      icon: PenLine,
      title: t("authorDashboard.cards.writingTitle"),
      body: t("authorDashboard.cards.writingBody"),
    },
    {
      to: "/author/published",
      icon: BookOpenCheck,
      title: t("authorDashboard.cards.publishedTitle"),
      body: t("authorDashboard.cards.publishedBody"),
    },
    ...(authorOnly
      ? [
          {
            to: "/author/notifications",
            icon: Bell,
            title: t("authorDashboard.cards.notificationsTitle"),
            body: t("authorDashboard.cards.notificationsBody"),
          },
        ]
      : []),
  ];

  return (
    <div className="p-4 md:p-5">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
          {t("authorDashboard.eyebrow")}
        </p>
        <h1 className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
          {t("authorDashboard.title")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary dark:text-dark-secondary">
          {t("authorDashboard.subtitle")}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ to, icon: Glyph, title, body }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex h-full flex-col rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 shadow-sm transition-colors hover:border-(--color-light-input-border-focus) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus)"
              >
                <Glyph
                  className="size-8 text-(--color-light-timeline-accent) dark:text-(--color-dark-timeline-accent)"
                  strokeWidth={1.75}
                />
                <span className="mt-3 text-sm font-semibold text-primary dark:text-dark-primary">{title}</span>
                <span className="mt-1 text-xs leading-relaxed text-muted dark:text-dark-muted">{body}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
