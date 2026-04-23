export default function BlogReviewPanel({ blog, statusLabels }) {
  return (
    <div className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            Current state
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-dark-primary">
            {statusLabels[blog.status]}
          </p>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {blog.status === "published"
              ? "Visible to readers."
              : "Still under admin control."}
          </p>
        </div>
        <div className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            Review checklist
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
            Check title clarity, content quality, author credibility, formatting,
            and whether the article is ready for public readers.
          </p>
        </div>
      </div>
    </div>
  );
}
