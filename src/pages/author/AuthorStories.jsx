import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  Eye,
  MoreHorizontal,
  NotebookPen,
  PenLine,
} from "lucide-react";
import Button from "../../components/Button";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownTrigger,
} from "../../components/DropdownMenu";
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

function ArticleThumbnail({ article }) {
  if (article.coverImageUrl) {
    return (
      <img
        src={article.coverImageUrl}
        alt=""
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-light-app-tertiary dark:bg-dark-app-tertiary">
      <BookOpenCheck className="h-8 w-8 text-muted dark:text-dark-muted" strokeWidth={1.6} />
    </div>
  );
}

function statusClass(status) {
  if (status === "PUBLISHED") {
    return "border-(--color-light-success-border) bg-(--color-light-success-bg) text-(--color-light-success-text) dark:border-(--color-dark-success-border) dark:bg-(--color-dark-success-bg) dark:text-(--color-dark-success-text)";
  }
  return "border-(--color-light-warning-border) bg-(--color-light-warning-bg) text-(--color-light-warning-text) dark:border-(--color-dark-warning-border) dark:bg-(--color-dark-warning-bg) dark:text-(--color-dark-warning-text)";
}

export default function AuthorStories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const authorId = String(user?.id ?? "").trim();
  const { data, isLoading } = useArticlesByAuthor(
    authorId,
    { page: 0, size: 100 },
    { enabled: Boolean(authorId), notifyOnError: false },
  );

  const articles = useMemo(() => {
    const mapped = normalizeAuthorArticles(data).map((article) =>
      mapArticleToAdminBlog(article),
    );
    if (filter === "published") {
      return mapped.filter((article) => article._rawStatus === "PUBLISHED");
    }
    if (filter === "unpublished") {
      return mapped.filter((article) => article._rawStatus !== "PUBLISHED");
    }
    return mapped;
  }, [data, filter]);

  const counts = useMemo(() => {
    const all = normalizeAuthorArticles(data).map((article) =>
      mapArticleToAdminBlog(article),
    );
    return {
      all: all.length,
      published: all.filter((article) => article._rawStatus === "PUBLISHED").length,
      unpublished: all.filter((article) => article._rawStatus !== "PUBLISHED").length,
    };
  }, [data]);

  return (
    <div className="min-h-screen w-full bg-light-app-bg p-4 dark:bg-dark-card-bg md:p-5">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-6 py-6 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
                Author workspace
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-primary dark:text-dark-primary">
                My stories
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-secondary dark:text-dark-secondary">
                Manage drafts, submitted stories, and published articles from one place.
              </p>
            </div>
            <Link to="/author/writing">
              <Button type="button">New story</Button>
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["all", `All (${counts.all})`],
              ["published", `Published (${counts.published})`],
              ["unpublished", `Unpublished (${counts.unpublished})`],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`h-9 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                  filter === value
                    ? "border-(--color-light-input-border-focus) bg-light-app-tertiary text-primary dark:border-(--color-dark-input-border-focus) dark:bg-dark-app-tertiary dark:text-dark-primary"
                    : "border-(--color-light-card-border) text-secondary hover:bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:text-dark-secondary dark:hover:bg-dark-app-tertiary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-6 py-12 text-center text-sm text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
            Loading stories...
          </div>
        ) : !articles.length ? (
          <div className="rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-6 py-12 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <NotebookPen className="mx-auto h-10 w-10 text-muted dark:text-dark-muted" strokeWidth={1.6} />
            <p className="mt-4 text-base font-semibold text-primary dark:text-dark-primary">
              No stories found
            </p>
            <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
              Start a draft in the editor, then come back here to review it.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {articles.map((article) => {
              const published = article._rawStatus === "PUBLISHED";
              return (
                <article
                  key={article.id}
                  className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-sm transition-colors hover:border-(--color-light-input-border-focus) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus)"
                >
                  <div className="grid min-h-56 sm:grid-cols-[11rem_minmax(0,1fr)]">
                    <div className="aspect-video sm:aspect-auto">
                      <ArticleThumbnail article={article} />
                    </div>
                    <div className="flex min-w-0 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-lg font-semibold text-primary dark:text-dark-primary">
                            {article.title}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                            <span className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-wide ${statusClass(article._rawStatus)}`}>
                              {article._rawStatus || "DRAFT"}
                            </span>
                            {article.date ? (
                              <span className="text-muted dark:text-dark-muted">
                                {new Date(article.date).toLocaleDateString()}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <DropdownMenuRoot modal={false}>
                          <DropdownTrigger compactIcon showArrow={false} aria-label="Story actions">
                            <MoreHorizontal className="h-4 w-4 text-secondary dark:text-dark-secondary" />
                          </DropdownTrigger>
                          <DropdownContent align="end">
                            <DropdownItem
                              icon={<PenLine className="h-4 w-4" />}
                              onSelect={() =>
                                navigate(`/author/writing?articleId=${encodeURIComponent(article.id)}`)
                              }
                            >
                              Edit
                            </DropdownItem>
                            <DropdownItem
                              icon={<Eye className="h-4 w-4" />}
                              disabled={!published}
                              onSelect={() => {
                                if (published) navigate(`/story/${encodeURIComponent(article.id)}`);
                              }}
                            >
                              {published ? "Visit public page" : "Visit after publish"}
                            </DropdownItem>
                          </DropdownContent>
                        </DropdownMenuRoot>
                      </div>

                      {article.excerpt ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-secondary dark:text-dark-secondary">
                          {article.excerpt}
                        </p>
                      ) : null}

                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 text-xs text-muted dark:text-dark-muted">
                        <span>{article.category || "Story"}</span>
                        {article.readTime && article.readTime !== "—" ? (
                          <span>• {article.readTime} min read</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
