export default function BlogOverviewPanel({ blog, formattedDate }) {
  return (
    <div className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            Writer
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
            Category
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
            Performance
          </p>
          <p className="mt-2 text-base font-semibold text-primary dark:text-dark-primary">
            {blog.claps} claps • {blog.comments} comments
          </p>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {blog.featured ? "Featured for readers" : "Not featured yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
