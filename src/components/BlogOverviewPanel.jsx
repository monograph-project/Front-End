import { useTranslation } from "react-i18next";

export default function BlogOverviewPanel({ blog, formattedDate }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-5 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            {t("blogAdmin.detail.overview.writer")}
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-dark-primary">
            {blog.author}
          </p>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {blog.authorRole}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            {t("blogAdmin.detail.overview.category")}
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-dark-primary">
            {blog.category}
          </p>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {blog.readTime} • {formattedDate}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            {t("blogAdmin.detail.overview.performance")}
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-dark-primary">
            {t("blogAdmin.detail.overview.performanceValue", {
              claps: blog.claps,
              comments: blog.comments,
            })}
          </p>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {blog.featured
              ? t("blogAdmin.detail.overview.featured")
              : t("blogAdmin.detail.overview.notFeatured")}
          </p>
        </div>
      </div>
    </div>
  );
}
