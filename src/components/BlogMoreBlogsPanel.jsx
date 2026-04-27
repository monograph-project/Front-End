import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BlogMoreBlogsPanel({ relatedBlogs }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell">
      <div>
        <p className="text-sm font-semibold text-primary dark:text-dark-primary">
          {t("blogAdmin.detail.more.title")}
        </p>
        <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
          {t("blogAdmin.detail.more.description")}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {relatedBlogs.map((item) => (
          <Link
            key={item.id}
            to={`/admin/blogs/${item.id}`}
            className="block rounded-md border border-default bg-card p-4 transition-colors hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:hover:bg-dark-card-2"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted dark:text-dark-muted">
              {item.category}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-primary dark:text-dark-primary">
              {item.title}
            </p>
            <p className="mt-2 text-xs text-secondary dark:text-dark-secondary">
              {item.readTime}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
