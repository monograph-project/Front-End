import { useTranslation } from "react-i18next";

export default function BlogWriterPanel({ blog, blogs }) {
  const { t } = useTranslation();
  const totalPosts = blogs.filter((item) => item.author === blog.author).length;
  const publishedPosts = blogs.filter(
    (item) => item.author === blog.author && item.status === "published",
  ).length;
  const pendingPosts = blogs.filter(
    (item) => item.author === blog.author && item.status === "pending",
  ).length;

  return (
    <div className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-base font-bold text-white dark:bg-dark-primary dark:text-dark-shell">
            {blog.author
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="text-lg font-semibold text-primary dark:text-dark-primary">
              {blog.author}
            </p>
            <p className="text-sm text-secondary dark:text-dark-secondary">
              {blog.authorRole}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-default bg-card p-3 dark:border-dark-default dark:bg-dark-card">
            <p className="text-xs text-muted dark:text-dark-muted">
              {t("blogAdmin.detail.writer.posts")}
            </p>
            <p className="mt-1 text-lg font-semibold text-primary dark:text-dark-primary">
              {totalPosts}
            </p>
          </div>
          <div className="rounded-md border border-default bg-card p-3 dark:border-dark-default dark:bg-dark-card">
            <p className="text-xs text-muted dark:text-dark-muted">
              {t("blogAdmin.detail.writer.published")}
            </p>
            <p className="mt-1 text-lg font-semibold text-primary dark:text-dark-primary">
              {publishedPosts}
            </p>
          </div>
          <div className="rounded-md border border-default bg-card p-3 dark:border-dark-default dark:bg-dark-card">
            <p className="text-xs text-muted dark:text-dark-muted">
              {t("blogAdmin.detail.writer.pending")}
            </p>
            <p className="mt-1 text-lg font-semibold text-primary dark:text-dark-primary">
              {pendingPosts}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-secondary dark:text-dark-secondary">
        {t("blogAdmin.detail.writer.description")}
      </p>
    </div>
  );
}
