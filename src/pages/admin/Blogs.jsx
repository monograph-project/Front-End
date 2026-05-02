import React, { useMemo, useState } from "react";
import {
  BookText,
  CircleCheckBig,
  FileClock,
  LayoutGrid,
  Loader2,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import BlogModerationCard from "../../components/BlogModerationCard";
import Select from "../../components/Select";
import Button from "../../components/Button";
import { cn } from "../../lib/utils";
import { mapArticleToAdminBlog } from "../../lib/adminArticleMap";
import {
  useArticles,
  useDeleteArticle,
  usePublishArticle,
  useUpdateArticle,
} from "../../services/useApi";

const SURFACE_CARD =
  "rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";
const SURFACE_INSET =
  "rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary";

function SummaryStat({
  label,
  value,
  hint,
  icon: Icon,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        `${SURFACE_CARD} cursor-pointer p-4 text-left transition-colors duration-200`,
        active
          ? "border-(--color-light-input-border-focus) ring-2 ring-blue-500/15 dark:border-(--color-dark-input-border-focus) dark:ring-blue-400/15"
          : "hover:border-(--color-light-input-border-focus) dark:hover:border-(--color-dark-input-border-focus)",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
            {hint}
          </p>
        </div>
        <div
          className={`${SURFACE_INSET} flex shrink-0 items-center justify-center p-3 text-primary dark:text-dark-primary`}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </button>
  );
}

function Blogs() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const pageSize = 12;
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { data, isLoading, isError, refetch } = useArticles(
    { page, pageSize },
    { notifyOnError: true },
  );

  const rawRows = data?.data ?? data?.content ?? [];
  const pagination = data?.pagination;
  const totalCount = pagination?.totalCount ?? rawRows.length;
  const totalPages = pagination?.totalPages ?? 1;

  const blogs = useMemo(() => rawRows.map(mapArticleToAdminBlog), [rawRows]);

  const publishMutation = usePublishArticle({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
  const deleteMutation = useDeleteArticle({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
  const updateMutation = useUpdateArticle({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

  const counts = useMemo(() => {
    const acc = {
      total: blogs.length,
      pending: 0,
      accepted: 0,
      published: 0,
      rejected: 0,
      draft: 0,
    };
    for (const b of blogs) {
      acc[b.status] += 1;
    }
    return acc;
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = blogs.filter((blog) => {
      const matchesStatus =
        activeStatus === "all" ? true : blog.status === activeStatus;
      const matchesQuery =
        !normalizedQuery ||
        [blog.title, blog.author, blog.category, blog.excerpt, blog.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });

    return result.sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "oldest")
        return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });
  }, [activeStatus, blogs, query, sortBy]);

  const resolveAuthorId = (blog) => {
    if (blog.authorId) return blog.authorId;
    return null;
  };

  const handleStatusChange = async (blogId, nextStatus) => {
    const blog = blogs.find((b) => b.id === blogId);
    if (!blog) return;
    const authorId = resolveAuthorId(blog);
    if (!authorId) return;

    try {
      if (nextStatus === "published") {
        await publishMutation.mutateAsync({
          articleId: blogId,
          authorId,
          visibility: "PUBLIC",
        });
        return;
      }
      if (nextStatus === "rejected") {
        await deleteMutation.mutateAsync({ articleId: blogId, authorId });
        return;
      }
      if (nextStatus === "draft" || nextStatus === "accepted") {
        await updateMutation.mutateAsync({
          articleId: blogId,
          authorId,
          status: nextStatus === "accepted" ? "DRAFT" : "DRAFT",
        });
        return;
      }
      if (nextStatus === "pending") {
        await updateMutation.mutateAsync({
          articleId: blogId,
          authorId,
          status: "DRAFT",
        });
      }
    } catch {
      /* toast via mutation */
    }
  };

  const publishedRate =
    blogs.length > 0
      ? Math.round((counts.published / blogs.length) * 100)
      : 0;

  const hasFilters =
    activeStatus !== "all" || query.trim() || sortBy !== "newest";

  const statusFilters = [
    { label: t("blogAdmin.filters.all"), value: "all" },
    { label: t("blogAdmin.status.pendingShort"), value: "pending" },
    { label: t("blogAdmin.status.accepted"), value: "accepted" },
    { label: t("blogAdmin.status.published"), value: "published" },
    { label: t("blogAdmin.status.rejected"), value: "rejected" },
    { label: t("blogAdmin.status.draft"), value: "draft" },
  ];

  const sortOptions = [
    { label: t("blogAdmin.sort.newest"), value: "newest" },
    { label: t("blogAdmin.sort.oldest"), value: "oldest" },
    { label: t("blogAdmin.sort.title"), value: "title" },
  ];

  const topSummaryCards = [
    {
      label: t("blogAdmin.summary.totalBlogs"),
      value: blogs.length,
      hint: t("blogAdmin.summary.pageScopeHint", {
        page: page + 1,
        totalPages,
        total: totalCount,
      }),
      icon: BookText,
      active: activeStatus === "all",
      onClick: () => setActiveStatus("all"),
    },
    {
      label: t("blogAdmin.summary.waitingReview"),
      value: counts.pending,
      hint: t("blogAdmin.summary.waitingReviewHint"),
      icon: FileClock,
      active: activeStatus === "pending",
      onClick: () => setActiveStatus("pending"),
    },
    {
      label: t("blogAdmin.summary.accepted"),
      value: counts.accepted,
      hint: t("blogAdmin.summary.acceptedHint"),
      icon: CircleCheckBig,
      active: activeStatus === "accepted",
      onClick: () => setActiveStatus("accepted"),
    },
    {
      label: t("blogAdmin.summary.published"),
      value: counts.published,
      hint: t("blogAdmin.summary.publishedHint"),
      icon: Send,
      active: activeStatus === "published",
      onClick: () => setActiveStatus("published"),
    },
  ];

  const clearFilters = () => {
    setQuery("");
    setActiveStatus("all");
    setSortBy("newest");
  };

  const busy =
    publishMutation.isPending ||
    deleteMutation.isPending ||
    updateMutation.isPending;

  return (
    <div className="flex min-h-screen flex-1 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className={`${SURFACE_CARD} overflow-hidden`}>
          <div className="relative border-b border-light-divider px-4 py-6 dark:border-dark-divider md:px-6 md:py-7">
            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted`}
                >
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  {t("blogAdmin.header.eyebrow")}
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary md:text-4xl">
                  {t("blogAdmin.header.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-secondary dark:text-dark-secondary">
                  {t("blogAdmin.header.description")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[320px]">
                <div className={`${SURFACE_INSET} p-4`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    {t("blogAdmin.header.publishRate")}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
                    {publishedRate}%
                  </p>
                  <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.header.publishRateHint")}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} p-4 md:col-span-2`}>
                  <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {t("blogAdmin.header.ruleTitle")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.header.ruleDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-4 py-6 md:grid-cols-2 md:px-6 xl:grid-cols-4">
            {topSummaryCards.map((card) => (
              <SummaryStat key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className={SURFACE_CARD}>
          <div className="border-b border-light-divider px-4 py-5 dark:border-dark-divider md:px-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full bg-light-app-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted dark:bg-dark-app-tertiary dark:text-dark-muted`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                    {t("blogAdmin.collection.eyebrow")}
                  </div>
                  <p className="mt-4 text-2xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                    {t("blogAdmin.collection.title")}
                  </p>
                  <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.collection.description")}
                  </p>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_200px] lg:max-w-xl">
                  <div className="flex flex-col gap-1">
                    
                    <div className="relative">
                      <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-dark-muted"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("blogAdmin.collection.searchPlaceholder")}
                        className="h-8 w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) py-1.5 pl-9 pr-3.5 text-xs text-(--color-light-text-primary) outline-none transition-colors placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                      />
                    </div>
                  </div>
                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="table-toolbar-tabs flex max-w-full flex-wrap p-1">
                  {statusFilters.map((status) => {
                    const isActive = activeStatus === status.value;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setActiveStatus(status.value)}
                        className={cn(
                          "table-toolbar-tab",
                          isActive && "table-toolbar-tab--active",
                        )}
                      >
                        {status.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="text-muted dark:text-dark-muted">
                    {t("blogAdmin.collection.displaying", {
                      shown: filteredBlogs.length,
                      total: blogs.length,
                    })}
                  </span>
                  {hasFilters && (
                    <Button
                      type="button"
                      variant="tertiary"
                      className="gap-2"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                      {t("blogAdmin.filters.clear")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 md:px-6">
            {isLoading && (
              <div
                className={`${SURFACE_INSET} flex items-center justify-center gap-2 px-6 py-16 text-secondary dark:text-dark-secondary`}
              >
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} />
                {t("blogAdmin.loading")}
              </div>
            )}

            {isError && !isLoading && (
              <div
                className={`${SURFACE_INSET} flex flex-col items-center gap-3 px-6 py-12 text-center`}
              >
                <p className="font-semibold text-primary dark:text-dark-primary">
                  {t("blogAdmin.error")}
                </p>
                <Button type="button" variant="secondary" onClick={() => refetch()}>
                  {t("blogAdmin.retry")}
                </Button>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                <div className="grid gap-5 xl:grid-cols-2">
                  {filteredBlogs.map((blog) => (
                    <BlogModerationCard
                      key={blog.id}
                      blog={blog}
                      showActions
                      onStatusChange={handleStatusChange}
                      linkTo={`/admin/blogs/${blog.id}`}
                    />
                  ))}
                </div>

                {!filteredBlogs.length && (
                  <div
                    className={`${SURFACE_INSET} border-dashed px-6 py-14 text-center`}
                  >
                    <p className="text-lg font-semibold text-primary dark:text-dark-primary">
                      {t("blogAdmin.empty.title")}
                    </p>
                    <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                      {t("blogAdmin.empty.description")}
                    </p>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-light-divider pt-6 dark:border-dark-divider">
                    <p className="text-sm text-muted dark:text-dark-muted">
                      {t("blogAdmin.pageStatus", {
                        page: page + 1,
                        totalPages,
                        total: totalCount,
                      })}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={page <= 0 || busy}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                      >
                        {t("blogAdmin.prevPage")}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={
                          busy ||
                          (pagination?.hasNext === false) ||
                          (pagination == null
                            ? page + 1 >= totalPages
                            : page >= totalPages - 1)
                        }
                        onClick={() => setPage((p) => p + 1)}
                      >
                        {t("blogAdmin.nextPage")}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Blogs;
