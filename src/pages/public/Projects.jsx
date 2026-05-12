import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  FolderKanban,
  GitBranch,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BlogShell } from "../blog/BlogShell";
import {
  usePublishedFacultyProject,
  usePublishedFacultyProjects,
} from "../../services/useApi";
import { getPublishedFacultyProjectDownloadUrl } from "../../services/apiRoute";

function listFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function displayName(person, fallback = "-") {
  const full = [person?.firstName, person?.lastName].filter(Boolean).join(" ");
  return full || person?.name || person?.email || fallback;
}

function projectTitle(project) {
  return (
    project?.projectName ||
    project?.name ||
    project?.title ||
    project?.projectRepository?.repositoryName ||
    "-"
  );
}

function projectAbstract(project, fallback) {
  const text = String(
    project?.abstract ??
      project?.summary ??
      project?.description ??
      project?.projectRepository?.description ??
      "",
  ).trim();
  if (!text) return fallback;
  const firstParagraph = text.split(/\n{2,}/).find(Boolean) ?? text;
  return firstParagraph.length > 520
    ? `${firstParagraph.slice(0, 517).trim()}...`
    : firstParagraph;
}

function collectSearchText(value, seen = new WeakSet()) {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map((item) => collectSearchText(item, seen)).join(" ");
  }
  if (typeof value === "object") {
    if (seen.has(value)) return "";
    seen.add(value);
    return Object.entries(value)
      .filter(([key]) => !["profilePicture", "avatar", "image", "file", "blob"].includes(key))
      .map(([, item]) => collectSearchText(item, seen))
      .join(" ");
  }
  return "";
}

export default function PublicProjects() {
  const { t } = useTranslation();
  const { id: projectId } = useParams();
  const [query, setQuery] = useState("");
  const publicRequestConfig = {
    skipAuthRedirect: true,
    skipAuthToken: true,
  };
  const detailQuery = usePublishedFacultyProject(projectId, {
    enabled: Boolean(projectId),
    notifyOnError: false,
    requestConfig: publicRequestConfig,
  });
  const { data, isLoading, isError } = usePublishedFacultyProjects(
    { page: 0, pageSize: 48, q: query.trim() || undefined },
    {
      enabled: !projectId,
      notifyOnError: false,
      requestConfig: publicRequestConfig,
    },
  );

  const projects = useMemo(() => listFromPayload(data), [data]);
  const heroStats = useMemo(() => {
    const groups = new Set();
    let repositories = 0;
    projects.forEach((project) => {
      if (project?.group?.id || project?.group?.name) {
        groups.add(project.group.id || project.group.name);
      }
      if (project?.projectRepository?.repositoryName) repositories += 1;
    });
    return [
      {
        icon: FolderKanban,
        label: t("publicProjects.hero.stats.projects"),
        value: projects.length,
      },
      {
        icon: Users,
        label: t("publicProjects.hero.stats.groups"),
        value: groups.size,
      },
      {
        icon: GitBranch,
        label: t("publicProjects.hero.stats.repositories"),
        value: repositories,
      },
    ];
  }, [projects, t]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      collectSearchText(project).toLowerCase().includes(q),
    );
  }, [projects, query]);

  if (projectId) {
    const project = detailQuery.data;
    const repository = project?.projectRepository;
    return (
      <BlogShell variant="feed">
        <div className="py-10 sm:py-14 lg:pb-24">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary"
          >
            <ArrowLeft className="size-4" strokeWidth={1.8} />
            {t("publicProjects.detail.back")}
          </Link>

          {detailQuery.isLoading ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-6 py-14 text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary">
              <Loader2 className="size-5 animate-spin" strokeWidth={1.8} />
              {t("publicProjects.loading")}
            </div>
          ) : detailQuery.isError || !project ? (
            <div className="mt-8 rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-6 py-14 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
              <p className="font-semibold text-primary dark:text-dark-primary">
                {t("publicProjects.error")}
              </p>
            </div>
          ) : (
            <article className="mt-6 overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <div className="border-b border-light-divider p-5 dark:border-dark-divider sm:p-7">
                <p className="inline-flex items-center gap-2 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
                  <FolderKanban className="size-3.5" strokeWidth={1.8} />
                  {project?.group?.name || t("publicProjects.groupFallback")}
                </p>
                <h1 className="font-blog-display mt-4 max-w-4xl text-3xl font-bold tracking-tight text-primary dark:text-dark-primary sm:text-5xl">
                  {projectTitle(project)}
                </h1>
                <div className="mt-5 grid gap-3 text-sm text-secondary dark:text-dark-secondary sm:grid-cols-3">
                  <span>
                    <strong className="text-primary dark:text-dark-primary">
                      {t("publicProjects.supervisor")}
                    </strong>{" "}
                    {displayName(project?.teacher)}
                  </span>
                  <span>
                    <strong className="text-primary dark:text-dark-primary">
                      {t("publicProjects.repository")}
                    </strong>{" "}
                    {repository?.repositoryName || t("publicProjects.repositoryFallback")}
                  </span>
                  <span>
                    <strong className="text-primary dark:text-dark-primary">
                      {t("publicProjects.statusLabel")}
                    </strong>{" "}
                    {project?.status || t("publicProjects.statusFallback")}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <section>
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    <FileText className="size-4" strokeWidth={1.8} />
                    {t("publicProjects.detail.abstractTitle")}
                  </div>
                  <p className="mt-4 whitespace-pre-line text-sm leading-7 text-secondary dark:text-dark-secondary sm:text-base">
                    {projectAbstract(project, t("publicProjects.noDescription"))}
                  </p>
                </section>

                <aside className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
                  <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {t("publicProjects.detail.readMoreTitle")}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-secondary dark:text-dark-secondary">
                    {t("publicProjects.detail.readMoreDescription")}
                  </p>
                  <a
                    href={getPublishedFacultyProjectDownloadUrl(project.id)}
                    className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-light-btn-primary-bg px-4 text-sm font-semibold text-white transition-colors hover:opacity-95 dark:bg-dark-primary dark:text-dark-shell"
                  >
                    <Download className="size-4" strokeWidth={1.8} />
                    {t("publicProjects.detail.download")}
                  </a>
                </aside>
              </div>
            </article>
          )}
        </div>
      </BlogShell>
    );
  }

  return (
    <BlogShell variant="feed">
      <div className="py-10 sm:py-14 lg:pb-24">
        <section className="relative isolate overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-5 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) sm:p-6 lg:p-8">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1469&auto=format&fit=crop')",
            }}
          />
          <div className="absolute inset-0 -z-10 bg-(--color-light-card-bg)/88 backdrop-blur-[1px] dark:bg-(--color-dark-card-bg)/90" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
                <FolderKanban className="size-3.5" strokeWidth={1.8} />
                {t("publicProjects.eyebrow")}
              </p>
              <h1 className="font-blog-display mt-4 max-w-3xl text-3xl font-bold tracking-tight text-primary dark:text-dark-primary sm:text-5xl">
                {t("publicProjects.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-secondary dark:text-dark-secondary sm:text-base">
                {t("publicProjects.description")}
              </p>
            </div>
            <div className="grid gap-2">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-secondary dark:text-dark-secondary">
                    <stat.icon className="size-4 text-(--color-chart-blue-primary) dark:text-(--color-chart-blue-secondary)" />
                    {stat.label}
                  </span>
                  <span className="text-xl font-semibold text-primary dark:text-dark-primary">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-6">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted dark:text-dark-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("publicProjects.search")}
              className="h-11 w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) pe-3 ps-10 text-sm text-(--color-light-text-primary) outline-none transition-colors placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
            />
          </div>
        </section>

        {isLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-6 py-14 text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary">
            <Loader2 className="size-5 animate-spin" strokeWidth={1.8} />
            {t("publicProjects.loading")}
          </div>
        ) : isError ? (
          <div className="mt-8 rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-6 py-14 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="font-semibold text-primary dark:text-dark-primary">
              {t("publicProjects.error")}
            </p>
          </div>
        ) : filtered.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {filtered.map((project) => {
              const repository = project?.projectRepository;
              return (
                <article
                  key={project?.id ?? projectTitle(project)}
                  className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-5 shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                        {project?.group?.name || t("publicProjects.groupFallback")}
                      </p>
                      <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-primary dark:text-dark-primary">
                        {projectTitle(project)}
                      </h2>
                    </div>
                    <span className="rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-2.5 py-1 text-[11px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary">
                      {project?.status || t("publicProjects.statusFallback")}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {project?.description || t("publicProjects.noDescription")}
                  </p>
                  <div className="mt-5 grid gap-3 text-xs text-secondary dark:text-dark-secondary sm:grid-cols-2">
                    <span>
                      <strong className="text-primary dark:text-dark-primary">
                        {t("publicProjects.supervisor")}
                      </strong>{" "}
                      {displayName(project?.teacher)}
                    </span>
                    <span>
                      <strong className="text-primary dark:text-dark-primary">
                        {t("publicProjects.repository")}
                      </strong>{" "}
                      {repository?.repositoryName || t("publicProjects.repositoryFallback")}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${encodeURIComponent(project?.id)}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)"
                  >
                    {t("publicProjects.openRepository")}
                    <ExternalLink className="size-4" strokeWidth={1.8} />
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-6 py-14 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="font-semibold text-primary dark:text-dark-primary">
              {t("publicProjects.emptyTitle")}
            </p>
            <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
              {t("publicProjects.emptyDescription")}
            </p>
          </div>
        )}
      </div>
    </BlogShell>
  );
}
