import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import Select from "../../components/Select";
import StoryCard from "../../components/StoryCard";
import {
  MOCK_STORIES,
  collectAllTags,
  filterAndSortStories,
  storiesByPublishType,
} from "../../data/mockStories";
import { BlogShell } from "./BlogShell";

const DEFAULT_SEARCH = {
  query: "",
  author: "",
  tag: "__all__",
  dateFrom: "",
  dateTo: "",
  minRead: "",
  maxRead: "",
  sort: "newest",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "claps", label: "Most claps" },
  { value: "read_short", label: "Shortest read" },
  { value: "read_long", label: "Longest read" },
];

export default function Home() {
  const stories = MOCK_STORIES;
  const [loading, setLoading] = useState(true);
  const [contentTab, setContentTab] = useState("monograph");
  const [criteria, setCriteria] = useState(() => ({ ...DEFAULT_SEARCH }));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(t);
  }, []);

  const allTags = useMemo(() => collectAllTags(stories), [stories]);

  const tagOptions = useMemo(
    () => [
      { value: "__all__", label: "Any topic" },
      ...allTags.map((tag) => ({ value: tag, label: tag })),
    ],
    [allTags],
  );

  const tabStories = useMemo(
    () => storiesByPublishType(stories, contentTab),
    [stories, contentTab],
  );

  const filteredStories = useMemo(
    () => filterAndSortStories(tabStories, criteria),
    [tabStories, criteria],
  );

  const listAnimKey = useMemo(
    () =>
      [
        contentTab,
        criteria.query,
        criteria.author,
        criteria.tag,
        criteria.dateFrom,
        criteria.dateTo,
        criteria.minRead,
        criteria.maxRead,
        criteria.sort,
      ].join("|"),
    [contentTab, criteria],
  );

  const staffPicks = useMemo(
    () =>
      [...tabStories]
        .sort((a, b) => (b.claps_count ?? 0) - (a.claps_count ?? 0))
        .slice(0, 4),
    [tabStories],
  );

  const setField = (key, value) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  };

  const resetAdvanced = () => {
    setCriteria({ ...DEFAULT_SEARCH });
  };

  const hasActiveFilters =
    criteria.query.trim() ||
    criteria.author.trim() ||
    (criteria.tag && criteria.tag !== "__all__") ||
    criteria.dateFrom ||
    criteria.dateTo ||
    criteria.minRead !== "" ||
    criteria.maxRead !== "" ||
    criteria.sort !== "newest";

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-shell dark:bg-dark-shell">
        <LoadingSpinner />
      </div>
    );
  }

  const inputCls = `
    h-9 w-full rounded-xl border px-3 text-sm outline-none transition-colors
    border-default bg-card text-primary placeholder:text-muted
    focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-dark-default dark:bg-dark-card dark:text-dark-primary dark:placeholder:text-dark-muted dark:focus:border-dark-primary dark:focus:ring-accent-light/15
  `;

  return (
    <BlogShell>
      <div className="pb-16 pt-6 sm:pt-10 lg:pb-24">
        <div className="sticky top-0 z-[35] mb-6 border-b border-default bg-shell/95 py-3 backdrop-blur-md dark:border-dark-default dark:bg-dark-shell/95 sm:top-0">
          <div className="flex flex-wrap items-center gap-8">
            <button
              type="button"
              onClick={() => setContentTab("monograph")}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                contentTab === "monograph"
                  ? "text-primary dark:text-dark-primary"
                  : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary"
              }`}
            >
              Monographs
              {contentTab === "monograph" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary dark:bg-dark-primary" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setContentTab("weblog")}
              className={`relative pb-3 text-sm font-medium transition-colors ${
                contentTab === "weblog"
                  ? "text-primary dark:text-dark-primary"
                  : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary"
              }`}
            >
              Weblogs
              {contentTab === "weblog" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary dark:bg-dark-primary" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-10 rounded-2xl border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-dark-muted"
                strokeWidth={1.75}
                aria-hidden
              />
              <input
                type="search"
                value={criteria.query}
                onChange={(e) => setField("query", e.target.value)}
                placeholder="Search title, subtitle, or body…"
                className={`${inputCls} pl-10`}
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-default bg-shell px-4 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary dark:hover:border-dark-primary dark:hover:text-dark-primary"
              aria-expanded={advancedOpen}
            >
              <SlidersHorizontal className="size-4" aria-hidden />
              Advanced search
              <ChevronDown
                className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
          </div>

          {advancedOpen && (
            <div className="mt-5 border-t border-default pt-5 dark:border-dark-default">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                    Author
                  </label>
                  <input
                    type="text"
                    value={criteria.author}
                    onChange={(e) => setField("author", e.target.value)}
                    placeholder="Name contains…"
                    className={inputCls}
                  />
                </div>
                <Select
                  label="Topic tag"
                  value={criteria.tag}
                  onChange={(val) => setField("tag", val)}
                  options={tagOptions}
                  placeholder="Any topic"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                    Published from
                  </label>
                  <input
                    type="date"
                    value={criteria.dateFrom}
                    onChange={(e) => setField("dateFrom", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                    Published to
                  </label>
                  <input
                    type="date"
                    value={criteria.dateTo}
                    onChange={(e) => setField("dateTo", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                    Min read time (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={criteria.minRead}
                    onChange={(e) => setField("minRead", e.target.value)}
                    placeholder="e.g. 5"
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                    Max read time (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    value={criteria.maxRead}
                    onChange={(e) => setField("maxRead", e.target.value)}
                    placeholder="e.g. 30"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Select
                    label="Sort"
                    value={criteria.sort}
                    onChange={(val) => setField("sort", val)}
                    options={SORT_OPTIONS}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={resetAdvanced}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline dark:text-dark-primary"
                >
                  Reset all filters
                </button>
                {hasActiveFilters && (
                  <span className="text-xs text-muted dark:text-dark-muted">
                    Filters narrow the list below.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <p className="mb-6 text-sm text-secondary dark:text-dark-secondary">
          {filteredStories.length}{" "}
          {filteredStories.length === 1 ? "piece" : "pieces"}{" "}
          {contentTab === "monograph" ? "in monographs" : "in weblogs"}
          {hasActiveFilters ? " (filtered)" : ""}.
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_minmax(260px,320px)] lg:gap-16">
          <div>
            {filteredStories.length > 0 ? (
              <motion.div
                key={listAnimKey}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-0 divide-y divide-default dark:divide-dark-default"
              >
                {filteredStories.map((story, idx) => (
                  <motion.div
                    key={story.id}
                    layout="position"
                    className="py-9 first:pt-0 lg:py-10"
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  >
                    <StoryCard
                      story={story}
                      variant={idx === 0 ? "featured" : "default"}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-2xl border border-default bg-card px-8 py-16 text-center dark:border-dark-default dark:bg-dark-card">
                <h2 className="font-blog-display text-2xl font-bold text-primary dark:text-dark-primary">
                  No matches
                </h2>
                <p className="mx-auto mt-3 max-w-md text-secondary dark:text-dark-secondary">
                  Try another tab or loosen your search criteria.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetAdvanced}
                    className="rounded-xl border border-default px-4 py-2 text-sm font-medium text-primary dark:border-dark-default dark:text-dark-primary"
                  >
                    Clear filters
                  </button>
                  <Link
                    to="/write"
                    className="btn-primary inline-flex h-10 items-center px-6 text-sm"
                  >
                    Write a story
                  </Link>
                </div>
              </div>
            )}
          </div>

          <aside className="hidden lg:block border-l border-default dark:border-dark-default pl-4">
            <div className="sticky top-28 space-y-10">
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary dark:text-dark-secondary">
                  Staff picks ({contentTab === "monograph" ? "monographs" : "weblogs"})
                </h2>
                <div className="divide-y divide-default rounded-xl border border-default bg-card dark:divide-dark-default dark:border-dark-default dark:bg-dark-card">
                  {staffPicks.map((story) => (
                    <StoryCard key={story.id} story={story} variant="sidebar" />
                  ))}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </BlogShell>
  );
}
