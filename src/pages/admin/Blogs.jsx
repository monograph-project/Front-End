import React, { useEffect, useMemo, useState } from "react";
import {
  BookText,
  CircleCheckBig,
  FileClock,
  LayoutGrid,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import Select from "../../components/Select";
import BlogModerationCard from "../../components/BlogModerationCard";
import { loadAdminBlogs, saveAdminBlogs } from "../../data/adminBlogs";

function SummaryCard({
  label,
  value,
  hint,
  icon: Icon,
  active = false,
  accent = "default",
  onClick,
}) {
  const accentClasses = {
    default: "from-slate-100 to-white dark:from-dark-card-2 dark:to-dark-card",
    pending: "from-amber-100 to-white dark:from-amber-500/10 dark:to-dark-card",
    accepted: "from-sky-100 to-white dark:from-sky-500/10 dark:to-dark-card",
    published:
      "from-emerald-100 to-white dark:from-emerald-500/10 dark:to-dark-card",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border cursor-pointer  p-4 text-left transition-all duration-200 dark:border-dark-default",
        accentClasses[accent],
        active
          ? " border-primary/20   dark:border-dark-primary/20"
          : "border-default hover:-translate-y-0.5 hover:border-primary/20 dark:hover:border-dark-primary/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:text-dark-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
            {hint}
          </p>
        </div>
        <div className="rounded-2xl bg-shell p-3 text-primary dark:bg-dark-shell dark:text-dark-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </button>
  );
}

function Blogs() {
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState(() => loadAdminBlogs());
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    saveAdminBlogs(blogs);
  }, [blogs]);

  const counts = useMemo(
    () =>
      blogs.reduce(
        (acc, blog) => {
          acc.total += 1;
          acc[blog.status] += 1;
          return acc;
        },
        {
          total: 0,
          pending: 0,
          accepted: 0,
          published: 0,
          rejected: 0,
          draft: 0,
        },
      ),
    [blogs],
  );

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
      if (sortBy === "oldest") return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date);
    });
  }, [activeStatus, blogs, query, sortBy]);

  const handleStatusChange = (blogId, nextStatus) => {
    setBlogs((current) =>
      current.map((blog) =>
        blog.id === blogId ? { ...blog, status: nextStatus } : blog,
      ),
    );
  };

  const handleToggleFeatured = (blogId) => {
    setBlogs((current) =>
      current.map((blog) =>
        blog.id === blogId ? { ...blog, featured: !blog.featured } : blog,
      ),
    );
  };

  const featuredCount = blogs.filter((blog) => blog.featured).length;
  const hasFilters =
    activeStatus !== "all" || query.trim() || sortBy !== "newest";
  const publishedRate = counts.total
    ? Math.round((counts.published / counts.total) * 100)
    : 0;

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
      value: counts.total,
      hint: t("blogAdmin.summary.totalBlogsHint"),
      icon: BookText,
      active: activeStatus === "all",
      accent: "default",
      onClick: () => setActiveStatus("all"),
    },
    {
      label: t("blogAdmin.summary.waitingReview"),
      value: counts.pending,
      hint: t("blogAdmin.summary.waitingReviewHint"),
      icon: FileClock,
      active: activeStatus === "pending",
      accent: "pending",
      onClick: () => setActiveStatus("pending"),
    },
    {
      label: t("blogAdmin.summary.accepted"),
      value: counts.accepted,
      hint: t("blogAdmin.summary.acceptedHint"),
      icon: CircleCheckBig,
      active: activeStatus === "accepted",
      accent: "accepted",
      onClick: () => setActiveStatus("accepted"),
    },
    {
      label: t("blogAdmin.summary.published"),
      value: counts.published,
      hint: t("blogAdmin.summary.publishedHint"),
      icon: Send,
      active: activeStatus === "published",
      accent: "published",
      onClick: () => setActiveStatus("published"),
    },
  ];

  const clearFilters = () => {
    setQuery("");
    setActiveStatus("all");
    setSortBy("newest");
  };

  return (
    <div className="flex min-h-screen flex-1 overflow-y-auto bg-shell p-2 dark:bg-dark-shell">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-md border border-default  dark:border-dark-default ">
          <div className="relative border-b border-default px-6 py-7 dark:border-dark-default md:px-8">
            <div className="absolute" />
            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-default bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted dark:border-dark-default dark:bg-dark-shell dark:text-dark-muted">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t("blogAdmin.header.eyebrow")}
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary md:text-5xl">
                  {t("blogAdmin.header.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-secondary dark:text-dark-secondary">
                  {t("blogAdmin.header.description")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:min-w-105">
                <div className="rounded-md border border-dashed border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
                    {t("blogAdmin.header.featured")}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
                    {featuredCount}
                  </p>
                  <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.header.featuredHint")}
                  </p>
                </div>
                <div className="rounded-md border border-dashed border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
                    {t("blogAdmin.header.publishRate")}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
                    {publishedRate}%
                  </p>
                  <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.header.publishRateHint")}
                  </p>
                </div>
                <div className="rounded-md border border-dashed border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
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

          <div className="grid gap-4 px-6 py-6 md:grid-cols-2 md:px-8 xl:grid-cols-4">
            {topSummaryCards.map((card) => (
              <SummaryCard key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="rounded-md border border-default d dark:border-dark-default ">
          <div className="border-b border-default px-6 py-6 dark:border-dark-default md:px-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:bg-dark-shell dark:text-dark-muted">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    {t("blogAdmin.collection.eyebrow")}
                  </div>
                  <p className="mt-4 text-4xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                    {t("blogAdmin.collection.title")}
                  </p>
                  <p className="mt-2 text-base text-secondary dark:text-dark-secondary">
                    {t("blogAdmin.collection.description")}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px] lg:min-w-140">
                  <label className="flex items-center gap-3 rounded-md border border-default bg-shell px-4 py-1.90 dark:border-dark-default dark:bg-dark-shell">
                    <Search className="h-5 w-5 text-muted dark:text-dark-muted" />
                    <input
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t("blogAdmin.collection.searchPlaceholder")}
                      className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted dark:text-dark-primary dark:placeholder:text-dark-muted"
                    />
                  </label>

                  <Select
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortOptions}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  {statusFilters.map((status) => {
                    const isActive = activeStatus === status.value;

                    return (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() => setActiveStatus(status.value)}
                        className={cn(
                          "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "border border-default bg-shell text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:hover:bg-dark-card-2",
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
                      total: counts.total,
                    })}
                  </span>
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 rounded-full border border-default bg-shell px-3 py-2 font-semibold text-primary transition-colors hover:bg-card-2 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:hover:bg-dark-card-2"
                    >
                      <X className="h-4 w-4" />
                      {t("blogAdmin.filters.clear")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 md:px-8">
            <div className="grid gap-5 xl:grid-cols-2">
              {filteredBlogs.map((blog) => (
                <BlogModerationCard
                  key={blog.id}
                  blog={blog}
                  showActions
                  onStatusChange={handleStatusChange}
                  onToggleFeatured={handleToggleFeatured}
                  linkTo={`/admin/blogs/${blog.id}`}
                />
              ))}
            </div>

            {!filteredBlogs.length && (
              <div className="rounded- border border-dashed border-default px-6 py-14 text-center dark:border-dark-default">
                <p className="text-lg font-semibold text-primary dark:text-dark-primary">
                  {t("blogAdmin.empty.title")}
                </p>
                <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                  {t("blogAdmin.empty.description")}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Blogs;
