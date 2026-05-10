import { Link } from "react-router-dom";
import { useMemo } from "react";
import { NotebookPen, PenLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { mapArticleToAdminBlog } from "../../lib/adminArticleMap";
import { useArticlesByAuthor } from "../../services/useApi";

function normalizeAuthorArticles(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data?.content)) return raw.data.content;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}

export default function AuthorUnpublished() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const authorId = String(user?.id ?? "").trim();
  const { data, isLoading } = useArticlesByAuthor(
    authorId,
    { page: 0, size: 100 },
    { enabled: Boolean(authorId), notifyOnError: false },
  );

  const articles = useMemo(() => {
    return normalizeAuthorArticles(data)
      .map((article) => mapArticleToAdminBlog(article))
      .filter((article) => article._rawStatus !== "PUBLISHED");
  }, [data]);

  return (
    <div className="p-4 md:p-5 bg-white dark:bg-dark-card-bg w-full min-h-screen">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-6 py-6 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
                Author workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-primary dark:text-dark-primary">
                Unpublished stories
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-secondary dark:text-dark-secondary">
                Drafts and unpublished articles stay here until you are ready to publish them.
              </p>
            </div>
            <Button type="button" onClick={() => window.location.assign("/author/writing")}>
              New story
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-6 py-12 text-center text-sm text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
            Loading unpublished articles…
          </div>
        ) : !articles.length ? (
          <div className="rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-6 py-12 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <NotebookPen className="mx-auto h-10 w-10 text-muted dark:text-dark-muted" strokeWidth={1.6} />
            <p className="mt-4 text-base font-semibold text-primary dark:text-dark-primary">
              No unpublished stories yet
            </p>
            <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
              Start a draft in the editor, then come back here to review it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {articles.map((article) => (
              <article
                key={article.id}
                className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-5 py-5 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-primary dark:text-dark-primary">
                      {article.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold uppercase tracking-wide text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300">
                        {article._rawStatus || "DRAFT"}
                      </span>
                      {article.date ? (
                        <span className="text-muted dark:text-dark-muted">
                          Updated {new Date(article.date).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-light-app-tertiary dark:bg-dark-app-tertiary">
                    <NotebookPen className="h-4.5 w-4.5 text-primary dark:text-dark-primary" strokeWidth={1.8} />
                  </span>
                </div>

                {article.excerpt ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-secondary dark:text-dark-secondary">
                    {article.excerpt}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted dark:text-dark-muted">
                    <span>{article.category || "Story"}</span>
                    {article.readTime && article.readTime !== "—" ? <span>• {article.readTime} min read</span> : null}
                  </div>
                  <Link
                    to="/author/writing"
                    className="inline-flex items-center gap-2 rounded-xl border border-(--color-light-card-border) px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:text-dark-primary dark:hover:bg-dark-app-tertiary"
                  >
                    <PenLine className="h-3.5 w-3.5" strokeWidth={1.8} />
                    Open editor
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
