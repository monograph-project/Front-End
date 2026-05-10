import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookMarked,
  Briefcase,
  Eye,
  GitFork,
  GitBranch,
  Globe2,
  LayoutGrid,
  List,
  Lock,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Select from "../../components/Select";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { resolveShellBasePath } from "../../lib/roles";
import { cn } from "../../lib/utils";
import {
  useVcAccessibleRepositoriesForViewer,
  useFacultyGroups,
  useFacultyProjects,
  useLinkedStudentRecord,
} from "../../services/useApi";

const SIDE_LINK =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-semibold transition-colors";

function normalizeMemberList(g) {
  const raw =
    g?.groupMembers ?? g?.members ?? g?.studentIds ?? g?.studentMemberIds ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.map((m) => String(m?.id ?? m?.studentId ?? m ?? ""));
}

function studentInFacultyGroup(group, studentEntityId) {
  if (!studentEntityId) return false;
  const sid = String(studentEntityId);
  return normalizeMemberList(group).some((m) => m === sid && m !== "");
}

function forkFlag(item) {
  return Boolean(
    item?.isFork ?? item?.fork ?? item?.is_fork ?? item?.repository?.fork,
  );
}

function visibilityKind(v) {
  const s = String(v ?? "").toLowerCase();
  if (s === "private" || s === "internal" || s === "limit" || s === "hidden") {
    return "private";
  }
  return "public";
}

function coalesceNumber(...vals) {
  for (const v of vals) {
    if (v == null) continue;
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

function languageLabel(item) {
  const lang =
    item?.language ??
    item?.Language ??
    item?.primaryLanguage ??
    item?.repository?.language ??
    "";
  return typeof lang === "string" && lang.trim() ? lang.trim() : "";
}

function visibilityStyle(v) {
  return visibilityKind(v) === "private"
    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/60"
    : "bg-green-50 text-green-700 border-green-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/60";
}

function languageDotColor(language) {
  const colors = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3776ab",
    Markdown: "#083fa1",
  };
  return colors[language] || "#858585";
}

/** @typedef {'contributions' | 'mine' | 'forks' | 'admin' | 'milestones' | 'pullRequests' | 'projects'} WorkspaceNav */

export default function StudentWorkspace() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const shellBase = resolveShellBasePath(location.pathname, user?.role);
  const vcLogin =
    typeof user?.username === "string" ? user.username.trim() : "";
  /** Gateway user id for VC `GET /api/v1/repos/{ownerId}` (list `RepositoryResponse`). */
  const vcOwnerAccountId =
    user?.id != null && String(user.id).trim() !== ""
      ? String(user.id).trim()
      : "";

  /** @type {[ 'repos' | 'projects', React.Dispatch<React.SetStateAction<'repos' | 'projects'>> ]} */
  const [mainPanel, setMainPanel] = useState(
    /** @type {'repos' | 'projects'} */ ("repos"),
  );
  /** @type {[Exclude<WorkspaceNav, 'projects'>, import('react').Dispatch<import('react').SetStateAction<Exclude<WorkspaceNav, 'projects'>>>]} */
  const [repoFilter, setRepoFilter] = useState(
    /** @type {Exclude<WorkspaceNav, 'projects'>} */ ("contributions"),
  );
  const nav = mainPanel === "projects" ? "projects" : repoFilter;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("relevance");
  const [layoutMode, setLayoutMode] = useState("list");

  const { data: student } = useLinkedStudentRecord(user ?? null, {
    notifyOnError: false,
    enabled: Boolean(user),
  });
  const studentEntityId = student?.id ?? null;

  const { data: repoList = [], isLoading: reposLoading } =
    useVcAccessibleRepositoriesForViewer(vcOwnerAccountId, {
      enabled: Boolean(vcOwnerAccountId),
      notifyOnError: false,
      activityUsernameFallback: vcLogin,
    });

  const queriesEnabled = Boolean(studentEntityId);
  const { data: facultyGroups = [] } = useFacultyGroups(
    {},
    {
      enabled: queriesEnabled,
      notifyOnError: false,
    },
  );
  const { data: facultyProjects = [] } = useFacultyProjects(
    {},
    {
      enabled: queriesEnabled,
      notifyOnError: false,
    },
  );

  const { memberGroupIds, assignedProjects } = useMemo(() => {
    const groups = Array.isArray(facultyGroups) ? facultyGroups : [];
    const projects = Array.isArray(facultyProjects) ? facultyProjects : [];
    const memberIds = new Set();
    const sidStr = studentEntityId != null ? String(studentEntityId) : "";

    groups.forEach((g) => {
      const gid = String(g?.id ?? g?.uuid ?? "");
      if (gid && studentInFacultyGroup(g, sidStr)) memberIds.add(gid);
    });

    const list = projects.filter((p) => {
      const gid =
        typeof p.group === "object" && p.group != null
          ? String(p.group.id ?? p.group.uuid ?? "")
          : String(p.group ?? p.groupId ?? "");
      return gid && memberIds.has(gid);
    });

    return { memberGroupIds: memberIds, assignedProjects: list };
  }, [facultyGroups, facultyProjects, studentEntityId]);

  const normalizedRepos = useMemo(() => {
    const list = Array.isArray(repoList) ? repoList : [];
    return list.filter((r) => r?.ownerUsername && r?.repositoryName);
  }, [repoList]);

  const scopedRepos = useMemo(() => {
    /** `GET /api/v1/repos/{userId}` response is already scoped to this account — avoid username-based filtering. */
    const fromOwnerAccountListing = Boolean(vcOwnerAccountId);
    const loginLc = vcLogin.toLowerCase();
    if (fromOwnerAccountListing) {
      if (nav === "forks") return normalizedRepos.filter((r) => forkFlag(r));
      return normalizedRepos;
    }
    if (nav === "mine") {
      return normalizedRepos.filter(
        (r) => String(r.ownerUsername).toLowerCase() === loginLc,
      );
    }
    if (nav === "forks") return normalizedRepos.filter((r) => forkFlag(r));
    if (nav === "milestones" || nav === "pullRequests") return normalizedRepos;
    if (nav === "admin") {
      /* Same scope as ownership until VC exposes administrators */
      return normalizedRepos.filter(
        (r) => String(r.ownerUsername).toLowerCase() === loginLc,
      );
    }
    return normalizedRepos;
  }, [normalizedRepos, nav, vcLogin, vcOwnerAccountId]);

  const searchedRepos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scopedRepos;
    return scopedRepos.filter((item) => {
      const slug = `${item.ownerUsername}/${item.repositoryName}`.toLowerCase();
      const desc = String(item.description ?? "").toLowerCase();
      const lang = languageLabel(item).toLowerCase();
      return slug.includes(q) || desc.includes(q) || lang.includes(q);
    });
  }, [scopedRepos, query]);

  const filteredRepos = useMemo(() => {
    const sorted = [...searchedRepos];
    if (sort === "name") {
      sorted.sort((a, b) =>
        `${a.ownerUsername}/${a.repositoryName}`.localeCompare(
          `${b.ownerUsername}/${b.repositoryName}`,
          i18n.language,
        ),
      );
    }
    if (sort === "updated") {
      sorted.sort((a, b) => {
        const ta = new Date(a.updatedAt ?? 0).getTime();
        const tb = new Date(b.updatedAt ?? 0).getTime();
        return tb - ta;
      });
    }
    return sorted;
  }, [searchedRepos, sort, i18n.language]);

  const sidebarNavItems = /** @type {const} */ ([
    {
      id: "contributions",
      label: "studentWorkspace.nav.contributions",
      icon: BookMarked,
    },
    { id: "mine", label: "studentWorkspace.nav.myRepos", icon: Briefcase },
    { id: "forks", label: "studentWorkspace.nav.forks", icon: GitFork },
    {
      id: "milestones",
      label: "studentWorkspace.nav.milestones",
      icon: Globe2,
    },
    {
      id: "pullRequests",
      label: "studentWorkspace.nav.pullRequests",
      icon: GitBranch,
    },
    { id: "admin", label: "studentWorkspace.nav.adminAccess", icon: Lock },
  ]);

  const pageTitle =
    nav === "contributions"
      ? t("studentWorkspace.page.contributions")
      : nav === "mine"
        ? t("studentWorkspace.page.mine")
        : nav === "forks"
          ? t("studentWorkspace.page.forks")
          : nav === "milestones"
            ? t("studentWorkspace.page.milestones")
            : nav === "pullRequests"
              ? t("studentWorkspace.page.pullRequests")
          : nav === "admin"
            ? t("studentWorkspace.page.admin")
            : t("studentWorkspace.page.projects");

  const sortOptions = useMemo(
    () => [
      { value: "relevance", label: t("studentWorkspace.sort.relevance") },
      { value: "name", label: t("studentWorkspace.sort.name") },
      { value: "updated", label: t("studentWorkspace.sort.updated") },
    ],
    [t],
  );

  const showSearchShell = nav !== "projects";

  return (
    <div className="min-h-screen flex-1 bg-white dark:bg-dark-app-secondary">
      <div className="mx-auto flex w-full  flex-col gap-0 md:flex-row">
        <main className="min-w-0 flex-1 p-4 md:p-5">
          <div
            className="mb-6 flex flex-wrap gap-2 border-b border-light-divider pb-3 dark:border-dark-divider"
            role="tablist"
            aria-label={t("studentWorkspace.workspacePanelsAria")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mainPanel === "repos"}
              onClick={() => setMainPanel("repos")}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                mainPanel === "repos"
                  ? "bg-accent/12 text-primary dark:bg-[rgba(0,102,255,0.14)] dark:text-dark-primary"
                  : "text-secondary hover:bg-light-app-tertiary hover:text-primary dark:text-dark-secondary dark:hover:bg-dark-app-tertiary dark:hover:text-dark-primary",
              )}
            >
              {t("studentWorkspace.tabs.repositories")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainPanel === "projects"}
              onClick={() => setMainPanel("projects")}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                mainPanel === "projects"
                  ? "bg-accent/12 text-primary dark:bg-[rgba(0,102,255,0.14)] dark:text-dark-primary"
                  : "text-secondary hover:bg-light-app-tertiary hover:text-primary dark:text-dark-secondary dark:hover:bg-dark-app-tertiary dark:hover:text-dark-primary",
              )}
            >
              {t("studentWorkspace.tabs.projects")}
            </button>
          </div>

          {mainPanel === "repos" ? (
            <div
              className="table-toolbar-tabs mb-5 flex max-w-full flex-wrap p-1"
              role="tablist"
              aria-label={t("studentWorkspace.repoScopeAria")}
            >
              {sidebarNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={repoFilter === item.id}
                  onClick={() =>
                    setRepoFilter(/** @type {typeof repoFilter} */ (item.id))
                  }
                  className={cn(
                    "table-toolbar-tab",
                    repoFilter === item.id && "table-toolbar-tab--active",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon
                      className="h-4 w-4 shrink-0"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    {t(item.label)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-primary dark:text-dark-primary md:text-3xl">
                {pageTitle}
              </h1>
              {showSearchShell ? (
                <p className="mt-1 max-w-2xl text-sm text-secondary dark:text-dark-secondary">
                  {t("studentWorkspace.lead.repositories")}
                </p>
              ) : (
                <p className="mt-1 max-w-2xl text-sm text-secondary dark:text-dark-secondary">
                  {t("studentWorkspace.lead.projects")}
                </p>
              )}
            </div>
            {showSearchShell ? (
              <Link
                to={`${shellBase}/workspace/repositories/new`}
                className="shrink-0"
              >
                <Button
                  icon={
                    <Plus
                      className="size-4 shrink-0"
                      strokeWidth={2}
                      aria-hidden
                    />
                  }
                  type="button"
                  variant="primary"
                  className="gap-2 whitespace-nowrap"
                >
                  {t("studentWorkspace.actions.newRepository")}
                </Button>
              </Link>
            ) : null}
          </div>

          {showSearchShell && (
            <>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <div className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-muted dark:text-dark-muted">
                    <Search className="size-4" strokeWidth={2} aria-hidden />
                  </div>
                  <label
                    htmlFor="student-workspace-repo-search"
                    className="sr-only"
                  >
                    {t("studentWorkspace.search.label")}
                  </label>
                  <input
                    id="student-workspace-repo-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("studentWorkspace.search.placeholder")}
                    autoComplete="off"
                    className="h-9 w-full rounded-md border border-(--color-light-input-border) bg-(--color-light-input-bg) py-1.5 ps-9 pe-20 text-xs text-(--color-light-text-primary) outline-none transition-colors placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                  />
                  <div className="pointer-events-none absolute inset-e-10 top-1/2 -translate-y-1/2">
                    <span className="rounded-md border border-(--color-light-input-border) bg-light-app-tertiary px-2 py-0.5 font-mono text-[10px] font-medium text-secondary dark:border-dark-input-border dark:bg-dark-app-tertiary dark:text-dark-secondary">
                      {t("studentWorkspace.search.filterChip")}
                    </span>
                  </div>
                  {query.trim() ? (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute inset-e-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-light-app-tertiary hover:text-primary dark:text-dark-muted dark:hover:bg-dark-app-tertiary dark:hover:text-dark-primary"
                      aria-label={t("studentWorkspace.search.clearAria")}
                    >
                      <X className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 border-b border-light-divider pb-3 sm:flex-row sm:items-center sm:justify-between dark:border-dark-divider">
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  {t("studentWorkspace.toolbar.count", {
                    count: filteredRepos.length,
                  })}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="w-42">
                    <Select
                      value={sort}
                      onChange={setSort}
                      options={sortOptions}
                      placeholder={t("studentWorkspace.sort.label")}
                    />
                  </div>
                  <div className="inline-flex rounded-xl border border-(--color-light-input-border) p-0.5 dark:border-dark-input-border">
                    <button
                      type="button"
                      onClick={() => setLayoutMode("list")}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                        layoutMode === "list"
                          ? "bg-light-app-tertiary text-primary dark:bg-dark-app-tertiary dark:text-dark-primary"
                          : "text-muted hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary",
                      )}
                      aria-label={t("studentWorkspace.view.listAria")}
                      aria-pressed={layoutMode === "list"}
                    >
                      <List className="size-4" strokeWidth={1.5} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode("grid")}
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                        layoutMode === "grid"
                          ? "bg-light-app-tertiary text-primary dark:bg-dark-app-tertiary dark:text-dark-primary"
                          : "text-muted hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary",
                      )}
                      aria-pressed={layoutMode === "grid"}
                      aria-label={t("studentWorkspace.view.gridAria")}
                    >
                      <LayoutGrid
                        className="size-4"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </button>
                  </div>
                </div>
              </div>

              {reposLoading && (
                <p className="mt-6 text-sm text-muted dark:text-dark-muted">
                  {t("studentWorkspace.repositories.loading")}
                </p>
              )}

              {!reposLoading && !filteredRepos.length ? (
                <p className="mt-8 text-sm text-muted dark:text-dark-muted">
                  {!normalizedRepos.length
                    ? t("studentWorkspace.repositories.empty")
                    : nav === "admin"
                      ? t("studentWorkspace.repositories.emptyAdmin")
                      : t("studentWorkspace.repositories.noMatch")}
                </p>
              ) : null}

              {!reposLoading &&
              layoutMode === "list" &&
              filteredRepos.length ? (
                <ul
                  className="mt-4 flex flex-col gap-y-1 overflow-hidden rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-2 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                  aria-label={t("studentWorkspace.list.aria")}
                >
                  {filteredRepos.map((item) => (
                    <RepoListRow
                      key={`${item.owner.user_name}/${item.repositoryName}`}
                      item={item}
                      t={t}
                      shellBase={shellBase}
                    />
                  ))}
                </ul>
              ) : null}

              {!reposLoading &&
              layoutMode === "grid" &&
              filteredRepos.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredRepos.map((item) => (
                    <RepoGridCard
                      key={`${item.ownerUsername}/${item.repositoryName}`}
                      item={item}
                      t={t}
                      shellBase={shellBase}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}

          {!showSearchShell && (
            <div className="mt-8">
              <SettingsSectionCard
                icon={Briefcase}
                title={t("studentWorkspace.projects.title")}
                description={t("studentWorkspace.projects.subtitle", {
                  groups: memberGroupIds.size,
                })}
              >
                {!assignedProjects.length && (
                  <p className="text-sm text-muted dark:text-dark-muted">
                    {t("studentWorkspace.projects.empty")}
                  </p>
                )}
                <div className="grid gap-3 md:grid-cols-2">
                  {assignedProjects.map((proj) => {
                    const pname =
                      proj.projectName ??
                      proj.name ??
                      proj.title ??
                      proj.id ??
                      "—";
                    const repoField =
                      proj.projectRepository ??
                      proj.project_repository ??
                      proj.repository ??
                      proj.repositoryId;
                    const subtitle =
                      typeof repoField === "object" && repoField != null
                        ? `${repoField.ownerUsername}/${repoField.repositoryName}`
                        : repoField != null
                          ? String(repoField)
                          : "";
                    return (
                      <div
                        key={String(proj.id ?? proj.uuid)}
                        className="rounded-md border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                      >
                        <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                          {pname}
                        </p>
                        {subtitle ? (
                          <p className="mt-1 font-mono text-[11px] text-muted dark:text-dark-muted">
                            {subtitle}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                            {t("studentWorkspace.projects.awaitingRepo")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SettingsSectionCard>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * @param {{ item: object, t: import('i18next').TFunction, shellBase: string }} props
 */
function RepoListRow({ item, t, shellBase }) {
  console.log(item)
  const owner = item.owner.user_name;
  const name = item.repositoryName;
  const to = `${shellBase}/repository/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const visibility = visibilityKind(item.visibility);
  const visibilityLabel =
    visibility === "private"
      ? t("studentWorkspace.repositories.private")
      : t("studentWorkspace.repositories.public");
  const lang = languageLabel(item);
  const stars = coalesceNumber(
    item.stars,
    item.stars_count,
    item.starsCount,
    item.stargazers_count,
    item.watchers_count /* some APIs reuse */,
  );
  const forks = coalesceNumber(item.forks, item.forks_count, item.forksCount);
  const updatedAt = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <li>
      <Link
        to={to}
        className="block rounded-lg border border-[#e4e8ef] bg-white p-4 transition-colors hover:border-[#cfd7e6] hover:bg-[#f7f8fa] dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-app-tertiary"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="cursor-pointer text-sm font-semibold text-[#0a1224] hover:text-[#0066ff] dark:text-dark-text-primary dark:hover:text-(--color-chart-blue-secondary)">
                {name}
              </h4>
              <span
                className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${visibilityStyle(item.visibility)}`}
              >
                {visibilityLabel}
              </span>
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
              {item.description || t("studentWorkspace.repositories.noDesc")}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
              {lang ? (
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: languageDotColor(lang) }}
                  />
                  <span>{lang}</span>
                </div>
              ) : null}

              <div className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>{stars != null ? stars : "—"}</span>
              </div>

              <div className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                <span>{forks != null ? forks : "—"}</span>
              </div>

              {updatedAt ? (
                <span className="text-[#98a2b3] dark:text-dark-text-muted">
                  {t("studentWorkspace.repositories.updated")} {updatedAt}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex-shrink-0">
            <Eye className="h-4 w-4 cursor-pointer text-[#98a2b3] hover:text-[#0a1224] dark:text-dark-text-muted dark:hover:text-dark-text-primary" />
          </div>
        </div>
      </Link>
    </li>
  );
}

/**
 * @param {{ item: object, t: import('i18next').TFunction, shellBase: string }} props
 */
function RepoGridCard({ item, t, shellBase }) {
  const owner = item.ownerUsername;
  const name = item.repositoryName;
  const to = `${shellBase}/repository/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const visibility = visibilityKind(item.visibility);
  const visibilityLabel =
    visibility === "private"
      ? t("studentWorkspace.repositories.private")
      : t("studentWorkspace.repositories.public");
  const lang = languageLabel(item);
  const stars = coalesceNumber(
    item.stars,
    item.stars_count,
    item.starsCount,
    item.stargazers_count,
  );
  const forks = coalesceNumber(item.forks, item.forks_count, item.forksCount);
  const updatedAt = item.updatedAt
    ? new Date(item.updatedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Link
      to={to}
      className="rounded-lg border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 transition-colors hover:border-(--color-light-input-border) hover:bg-[#f7f8fa] dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-app-tertiary"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-[#0a1224] dark:text-dark-text-primary">
              {owner}/{name}
            </span>
            <span
              className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${visibilityStyle(item.visibility)}`}
            >
              {visibilityLabel}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
            {item.description || t("studentWorkspace.repositories.noDesc")}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
            {lang ? (
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: languageDotColor(lang) }}
                />
                <span>{lang}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{stars != null ? stars : "—"}</span>
            </div>

            <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              <span>{forks != null ? forks : "—"}</span>
            </div>

            {updatedAt ? (
                <span className="text-[#98a2b3] dark:text-dark-text-muted">
                  {t("studentWorkspace.repositories.updated")} {updatedAt}
                </span>
            ) : null}
          </div>
        </div>

        <div className="flex-shrink-0">
          {visibility === "private" ? (
            <Lock className="h-4 w-4 text-[#98a2b3] dark:text-dark-text-muted" />
          ) : (
            <BookMarked className="h-4 w-4 text-[#98a2b3] dark:text-dark-text-muted" />
          )}
        </div>
      </div>
    </Link>
  );
}
