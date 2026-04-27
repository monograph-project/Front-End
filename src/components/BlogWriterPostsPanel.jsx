import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../lib/utils";

export default function BlogWriterPostsPanel({
  author,
  authorBlogs,
  statusLabels,
  statusStyles,
}) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell">
      <div>
        <p className="text-sm font-semibold text-primary dark:text-dark-primary">
          {t("blogAdmin.detail.writerPosts.title", { author })}
        </p>
        <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
          {t("blogAdmin.detail.writerPosts.description")}
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {authorBlogs.length ? (
          authorBlogs.map((item) => (
            <Link
              key={item.id}
              to={`/admin/blogs/${item.id}`}
              className="flex items-start justify-between gap-4 rounded-md border border-default bg-card p-4 transition-colors hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:hover:bg-dark-card-2"
            >
              <div>
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
                  {item.excerpt}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                  statusStyles[item.status],
                )}
              >
                {statusLabels[item.status]}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-secondary dark:text-dark-secondary">
            {t("blogAdmin.detail.writerPosts.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
