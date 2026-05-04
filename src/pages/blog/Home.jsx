import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "../../components/LoadingSpinner";
import PublicLandingHero from "../../components/PublicLandingHero";
import Select from "../../components/Select";
import StoryCard from "../../components/StoryCard";
import {
  collectAllTags,
  filterAndSortStories,
} from "../../data/mockStories";
import { mapArticlePreviewToStory } from "../../lib/mapArticlePreviewToStory";
import { useArticles } from "../../services/useApi";
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

function extractPaginatedList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.content)) return payload.content;
  return [];
}

export default function Home() {
  const { t } = useTranslation();
  const [contentTab, setContentTab] = useState("weblog");
  const [criteria, setCriteria] = useState(() => ({ ...DEFAULT_SEARCH }));
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const contentType = contentTab === "monograph" ? "MONOGRAPH" : "WEBLOG";

  const { data: articlePayload, isLoading, isError, refetch } = useArticles(
    { page: 0, pageSize: 48, contentType },
    { notifyOnError: false },
  );

  const stories = useMemo(() => {
    const raw = extractPaginatedList(articlePayload);
    return raw.map((item) =>
      mapArticlePreviewToStory(item, { collectionLabel: t("publicFooter.links.stories") }),
    );
  }, [articlePayload, t]);

  const SORT_OPTIONS = useMemo(
    () => [
      { value: "newest", label: t("publicHome.sort.newest") },
      { value: "oldest", label: t("publicHome.sort.oldest") },
      { value: "claps", label: t("publicHome.sort.claps") },
      { value: "read_short", label: t("publicHome.sort.readShort") },
      { value: "read_long", label: t("publicHome.sort.readLong") },
    ],
    [t],
  );

  const allTags = useMemo(() => collectAllTags(stories), [stories]);

  const tagOptions = useMemo(
    () => [
      { value: "__all__", label: t("publicHome.fields.topicPh") },
      ...allTags.map((tag) => ({ value: tag, label: tag })),
    ],
    [allTags, t],
  );

  const filteredStories = useMemo(
    () => filterAndSortStories(stories, criteria),
    [stories, criteria],
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
      [...stories]
        .sort((a, b) => (b.claps_count ?? 0) - (a.claps_count ?? 0))
        .slice(0, 4),
    [stories],
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

  const scopeLabel =
    contentTab === "monograph"
      ? t("publicHome.context.monographs")
      : t("publicHome.context.weblogs");

  const showMonographPlaceholder =
    contentTab === "monograph" &&
    !isLoading &&
    !isError &&
    stories.length === 0 &&
    !hasActiveFilters;

  const inputCls = `
    h-9 w-full rounded-xl border px-3 text-sm outline-none transition-colors
    border-(--color-light-input-border) bg-(--color-light-input-bg) text-(--color-light-text-primary)
    placeholder:text-(--color-light-input-placeholder)
    focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15
    dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)
    dark:placeholder:text-(--color-dark-input-placeholder)
    dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15
  `;

  return (
    <>
      <PublicLandingHero />

      <section className="border-b border-light-divider bg-(--color-light-card-bg) px-4 py-12 dark:border-dark-divider dark:bg-(--color-dark-card-bg) sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-[1192px] gap-8 lg:grid-cols-2 lg:items-start lg:gap-x-16 xl:gap-x-24">
          <h2 className="font-blog-display text-2xl font-bold leading-tight tracking-tight text-primary dark:text-dark-primary sm:text-3xl lg:text-[2rem]">
            {t("publicHome.secondary.title")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-secondary dark:text-dark-secondary sm:text-base lg:pt-1">
            {t("publicHome.secondary.subtitle")}
          </p>
        </div>
      </section>

      <BlogShell>
        <div className="pb-14 pt-5 sm:pt-8 lg:pb-24">
          <div className="sticky top-0 z-[35] mb-5 border-b border-light-divider bg-(--color-light-app-bg)/95 py-3 backdrop-blur-md dark:border-dark-divider dark:bg-dark-shell/95">
            <div className="-mx-1 flex items-center gap-4 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-8">
              <button
                type="button"
                onClick={() => setContentTab("monograph")}
                className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                  contentTab === "monograph"
                    ? "text-primary dark:text-dark-primary"
                    : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary"
                }`}
              >
                {t("publicHome.tabs.monographs")}
                {contentTab === "monograph" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-(--color-chart-success) dark:bg-(--color-chart-blue-secondary)" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setContentTab("weblog")}
                className={`relative shrink-0 pb-3 text-sm font-medium transition-colors ${
                  contentTab === "weblog"
                    ? "text-primary dark:text-dark-primary"
                    : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary"
                }`}
              >
                {t("publicHome.tabs.weblogs")}
                {contentTab === "weblog" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-(--color-chart-success) dark:bg-(--color-chart-blue-secondary)" />
                )}
              </button>
            </div>
          </div>

          {isError && (
            <div className="mb-8 rounded-xl border border-(--color-light-error-border) bg-(--color-light-error-bg) px-4 py-3 text-sm text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
              <span>{t("publicHome.feed.error")}</span>{" "}
              <button
                type="button"
                onClick={() => refetch()}
                className="font-semibold underline"
              >
                {t("publicHome.feed.retry")}
              </button>
            </div>
          )}

          <div className="mb-8 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) sm:mb-10 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-dark-muted"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <input
                  type="search"
                  value={criteria.query}
                  onChange={(e) => setField("query", e.target.value)}
                  placeholder={t("publicHome.search.placeholder")}
                  className={`${inputCls} ps-10`}
                  autoComplete="off"
                />
              </div>
              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 text-sm font-medium text-secondary transition-colors hover:border-(--color-light-input-border-focus) hover:text-primary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary dark:hover:text-dark-primary sm:w-auto"
                aria-expanded={advancedOpen}
              >
                <SlidersHorizontal className="size-4" aria-hidden />
                {t("publicHome.advanced.toggle")}
                <ChevronDown
                  className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </div>

            {advancedOpen && (
              <div className="mt-5 border-t border-light-divider pt-5 dark:border-dark-divider">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                      {t("publicHome.fields.author")}
                    </label>
                    <input
                      type="text"
                      value={criteria.author}
                      onChange={(e) => setField("author", e.target.value)}
                      placeholder={t("publicHome.fields.authorPh")}
                      className={inputCls}
                    />
                  </div>
                  <Select
                    label={t("publicHome.fields.topic")}
                    value={criteria.tag}
                    onChange={(val) => setField("tag", val)}
                    options={tagOptions}
                    placeholder={t("publicHome.fields.topicPh")}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                      {t("publicHome.fields.dateFrom")}
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
                      {t("publicHome.fields.dateTo")}
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
                      {t("publicHome.fields.minRead")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={criteria.minRead}
                      onChange={(e) => setField("minRead", e.target.value)}
                      placeholder="5"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-primary dark:text-dark-primary">
                      {t("publicHome.fields.maxRead")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={criteria.maxRead}
                      onChange={(e) => setField("maxRead", e.target.value)}
                      placeholder="30"
                      className={inputCls}
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <Select
                      label={t("publicHome.sort.label")}
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
                    className="text-sm font-semibold text-primary underline-offset-4 hover:underline dark:text-dark-primary"
                  >
                    {t("publicHome.filters.reset")}
                  </button>
                  {hasActiveFilters && (
                    <span className="text-xs text-muted dark:text-dark-muted">
                      {t("publicHome.filters.hint")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="mb-10 flex justify-center py-12">
              <LoadingSpinner />
              <span className="sr-only">{t("publicHome.feed.loading")}</span>
            </div>
          )}

          {!isLoading && (
            <>
              <p className="mb-6 text-sm text-secondary dark:text-dark-secondary">
                {t(
                  filteredStories.length === 1
                    ? "publicHome.count.one"
                    : "publicHome.count.other",
                  {
                    count: filteredStories.length,
                    scope: scopeLabel,
                  },
                )}
                {hasActiveFilters ? t("publicHome.filteredSuffix") : ""}
              </p>

              <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] xl:gap-16">
                <div>
                  {showMonographPlaceholder ? (
                    <div className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-5 py-12 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary sm:px-8 sm:py-16">
                      <h2 className="font-blog-display text-xl font-bold text-primary dark:text-dark-primary sm:text-2xl">
                        {t("publicHome.tabs.monographs")}
                      </h2>
                      <p className="mx-auto mt-3 max-w-lg text-secondary dark:text-dark-secondary">
                        {t("publicHome.monographs.placeholder")}
                      </p>
                    </div>
                  ) : filteredStories.length > 0 ? (
                    <motion.div
                      key={listAnimKey}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      className="space-y-0 divide-y divide-light-divider dark:divide-dark-divider"
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
                    <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-5 py-12 text-center dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) sm:px-8 sm:py-16">
                      <h2 className="font-blog-display text-xl font-bold text-primary dark:text-dark-primary sm:text-2xl">
                        {t("publicHome.empty.title")}
                      </h2>
                      <p className="mx-auto mt-3 max-w-md text-secondary dark:text-dark-secondary">
                        {t("publicHome.empty.hint")}
                      </p>
                      <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <button
                          type="button"
                          onClick={resetAdvanced}
                          className="rounded-xl border border-(--color-light-card-border) px-4 py-2 text-sm font-semibold text-primary dark:border-(--color-dark-card-border) dark:text-dark-primary"
                        >
                          {t("publicHome.empty.clear")}
                        </button>
                        <Link
                          to="/write"
                          className="btn-primary inline-flex h-10 items-center px-6 text-sm"
                        >
                          {t("publicHome.empty.write")}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <aside className="border-t border-light-divider pt-8 dark:border-dark-divider xl:hidden">
                  <section>
                    <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary dark:text-dark-secondary">
                      {t("publicHome.staffPicks", { scope: scopeLabel })}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {staffPicks.length ? (
                        staffPicks.map((story) => (
                          <div
                            key={story.id}
                            className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                          >
                            <StoryCard story={story} variant="sidebar" />
                          </div>
                        ))
                      ) : (
                        <p className="rounded-xl border border-(--color-light-card-border) px-4 py-6 text-center text-sm text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted sm:col-span-2">
                          {t("publicHome.empty.title")}
                        </p>
                      )}
                    </div>
                  </section>
                </aside>

                <aside className="hidden border-s border-light-divider ps-6 dark:border-dark-divider xl:block">
                  <div className="sticky top-28 space-y-10">
                    <section>
                      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-secondary dark:text-dark-secondary">
                        {t("publicHome.staffPicks", { scope: scopeLabel })}
                      </h2>
                      <div className="divide-y divide-light-divider overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:divide-dark-divider dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                        {staffPicks.length ? (
                          staffPicks.map((story) => (
                            <StoryCard key={story.id} story={story} variant="sidebar" />
                          ))
                        ) : (
                          <p className="px-4 py-6 text-center text-sm text-muted dark:text-dark-muted">
                            {t("publicHome.empty.title")}
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </BlogShell>
    </>
  );
}
