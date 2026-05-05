import { CalendarDays, ChevronRight, Clock3, Star } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20",
  accepted:
    "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/20",
  published:
    "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20",
  rejected:
    "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20",
  draft:
    "bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/20",
};

function formatBlogDate(date) {
  if (!date) return null;
  return format(new Date(date), "yyyy-MM-dd");
}

function ActionButton({ children, tone = "default", className, ...props }) {
  const toneClass =
    tone === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : tone === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-700"
        : tone === "danger"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "border border-default bg-card text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:text-dark-primary dark:hover:bg-dark-card-2";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-full px-3 py-2 text-xs font-semibold transition-colors",
        toneClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function BlogModerationCard({
  blog,
  showActions = false,
  onStatusChange,
  onToggleFeatured,
  linkTo,
}) {
  const { t } = useTranslation();
  const statusLabels = {
    pending: t("blogAdmin.status.pendingShort"),
    accepted: t("blogAdmin.status.accepted"),
    published: t("blogAdmin.status.published"),
    rejected: t("blogAdmin.status.rejected"),
    draft: t("blogAdmin.status.draft"),
  };

  return (
    <article className="relative overflow-hidden rounded-md border border-default bg-shell p-5 transition-transform duration-200 hover:-translate-y-1 dark:border-dark-default dark:bg-dark-shell md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted dark:text-dark-muted">
          <span className="inline-flex items-center gap-2 font-medium text-primary dark:text-dark-primary">
            <CalendarDays className="h-4 w-4" />
            {formatBlogDate(blog.date) || t("blogAdmin.common.noDate")}
          </span>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              STATUS_STYLES[blog.status],
            )}
          >
            {statusLabels[blog.status]}
          </span>
        </div>

        {onToggleFeatured ? (
          <button
            type="button"
            onClick={() => onToggleFeatured(blog.id)}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) text-primary transition-colors hover:bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-primary dark:hover:bg-dark-app-tertiary",
              blog.featured &&
                "border-(--color-light-success-border) bg-(--color-light-success-bg) text-(--color-light-success-text) dark:border-(--color-dark-success-border) dark:bg-(--color-dark-success-bg) dark:text-(--color-dark-success-text)",
            )}
            aria-label={
              blog.featured
                ? t("blogAdmin.actions.removeFeatured")
                : t("blogAdmin.actions.markFeatured")
            }
          >
            <Star className={cn("h-5 w-5", blog.featured && "fill-current")} />
          </button>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted dark:text-dark-muted">
          <span className="rounded-full bg-white/80 px-2.5 py-1 font-medium dark:bg-dark-shell">
            {blog.category}
          </span>
          <span>{t("blogAdmin.common.by", { author: blog.author })}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {typeof blog.readTime === "number"
              ? t("blogAdmin.common.readMinutes", { count: blog.readTime })
              : blog.readTime}
          </span>
        </div>

        <h3 className="mt-4 max-w-[28rem] text-2xl font-semibold leading-tight text-primary dark:text-dark-primary">
          {linkTo ? (
            <Link
              to={linkTo}
              className="transition-colors hover:text-secondary dark:hover:text-dark-secondary"
            >
              {blog.title}
            </Link>
          ) : (
            blog.title
          )}
        </h3>
        <p className="mt-4 max-w-[34rem] text-base leading-8 text-secondary dark:text-dark-secondary">
          {blog.excerpt}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {blog.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-default bg-white/70 px-3 py-1 text-xs font-medium text-secondary dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary"
            >
              #{tag}
            </span>
          ))}
        </div>

        {linkTo ? (
          <Link
            to={linkTo}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
          >
            {t("blogAdmin.actions.reviewArticle")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
          >
            {t("blogAdmin.actions.reviewArticle")}
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-default/70 pt-5 dark:border-dark-default">
          {blog.status === "pending" && (
            <>
              <ActionButton
                tone="success"
                onClick={() => onStatusChange?.(blog.id, "accepted")}
              >
                {t("blogAdmin.actions.accept")}
              </ActionButton>
              <ActionButton
                tone="danger"
                onClick={() => onStatusChange?.(blog.id, "rejected")}
              >
                {t("blogAdmin.actions.reject")}
              </ActionButton>
            </>
          )}

          {blog.status === "accepted" && (
            <>
              <ActionButton
                tone="primary"
                onClick={() => onStatusChange?.(blog.id, "published")}
              >
                {t("blogAdmin.actions.publishNow")}
              </ActionButton>
              <ActionButton
                onClick={() => onStatusChange?.(blog.id, "pending")}
              >
                {t("blogAdmin.actions.backToWaiting")}
              </ActionButton>
            </>
          )}

          {blog.status === "published" && (
            <>
              <ActionButton
                onClick={() => onStatusChange?.(blog.id, "accepted")}
              >
                {t("blogAdmin.actions.unpublish")}
              </ActionButton>
              <ActionButton onClick={() => onStatusChange?.(blog.id, "draft")}>
                {t("blogAdmin.actions.moveToDraft")}
              </ActionButton>
            </>
          )}

          {blog.status === "rejected" && (
            <ActionButton
              tone="success"
              onClick={() => onStatusChange?.(blog.id, "accepted")}
            >
              {t("blogAdmin.actions.restoreAndAccept")}
            </ActionButton>
          )}

          {blog.status === "draft" && (
            <ActionButton
              tone="primary"
              onClick={() => onStatusChange?.(blog.id, "pending")}
            >
              {t("blogAdmin.actions.sendForApproval")}
            </ActionButton>
          )}
        </div>
      )}
    </article>
  );
}
