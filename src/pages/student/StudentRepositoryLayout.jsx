import { NavLink, Outlet, Navigate, useParams } from "react-router-dom";
import {
  BookMarked,
  GitFork,
  GitPullRequest,
  LayoutGrid,
  ListTodo,
  Star,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import Button from "../../components/Button";
import { useVcRepository } from "../../services/useApi";

function tabClass(active) {
  return cn(
    "-mb-px inline-flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors sm:gap-2.5",
    active
      ? "border-(--color-light-input-border-focus) text-primary dark:border-(--color-dark-input-border-focus) dark:text-dark-primary"
      : "border-transparent text-muted hover:border-(--color-light-card-border) hover:text-secondary dark:text-dark-muted dark:hover:border-(--color-dark-card-border) dark:hover:text-dark-secondary",
  );
}

function countOrDash(v) {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : String(n);
}

export default function StudentRepositoryLayout() {
  const { t } = useTranslation();
  const { owner, repo } = useParams();
  const decodedOwner = owner ? decodeURIComponent(owner) : "";
  const decodedRepo = repo ? decodeURIComponent(repo) : "";

  const {
    data: meta,
    isLoading,
    isError,
  } = useVcRepository(decodedOwner, decodedRepo, {
    notifyOnError: false,
    enabled: Boolean(decodedOwner && decodedRepo),
  });

  const repoBase = `/student/repository/${encodeURIComponent(decodedOwner)}/${encodeURIComponent(decodedRepo)}`;

  const visibility =
    meta?.visibility ??
    meta?.repository_visibility ??
    meta?.visibility_type ??
    "";
  const starCount =
    meta?.stars_count ??
    meta?.starsCount ??
    meta?.stars ??
    meta?.stargazers_count ??
    meta?.counts?.stars ??
    null;
  const forkCount =
    meta?.forks_count ??
    meta?.forksCount ??
    meta?.forks ??
    meta?.counts?.forks ??
    null;
  const watchCount =
    meta?.watchers_count ??
    meta?.subscriptions_count ??
    meta?.watch_count ??
    null;

  if (!decodedOwner.trim() || !decodedRepo.trim()) {
    return <Navigate to="/student/workspace" replace />;
  }

  return (
    <div className="min-h-screen flex-1 bg-light-app-bg dark:bg-dark-shell">
      <div className="border-b border-light-divider bg-(--color-light-card-bg) dark:border-dark-divider dark:bg-(--color-dark-card-bg)">
        <div className="mx-auto flex max-w-7xl px-4 py-2 md:px-6">
          <p className="font-mono text-xs text-muted dark:text-dark-muted">
            <NavLink
              to="/student/workspace"
              className="text-primary underline-offset-4 hover:underline dark:text-dark-primary"
            >
              {t("studentRepo.shell.back")}
            </NavLink>
            <span aria-hidden className="mx-1.5 opacity-60">
              /
            </span>
            <span className="font-semibold text-secondary dark:text-dark-secondary">
              {decodedOwner}
            </span>
            <span
              className="mx-1 text-muted opacity-75 dark:text-dark-muted"
              aria-hidden
            >
              /
            </span>
            <span className="text-secondary dark:text-dark-secondary">
              {decodedRepo}
            </span>
          </p>
        </div>

        <nav
          className="mx-auto flex max-w-7xl flex-wrap gap-x-2 gap-y-1 border-t border-light-divider px-2 py-2 dark:border-dark-divider md:px-6"
          aria-label={t("studentRepo.shell.tabsAria")}
        >
          <NavLink
            end
            to={repoBase}
            className={({ isActive }) => tabClass(isActive)}
          >
            <LayoutGrid
              className="size-4 shrink-0 md:size-[18px]"
              strokeWidth={2}
              aria-hidden
            />
            {t("studentRepo.tabs.code")}
          </NavLink>
          <NavLink
            to={`${repoBase}/pull-requests`}
            className={({ isActive }) => tabClass(isActive)}
          >
            <GitPullRequest
              className="size-4 shrink-0 md:size-[18px]"
              strokeWidth={2}
              aria-hidden
            />
            {t("studentRepo.tabs.pulls")}
          </NavLink>
          <NavLink
            to={`${repoBase}/tasks`}
            className={({ isActive }) => tabClass(isActive)}
          >
            <ListTodo
              className="size-4 shrink-0 md:size-[18px]"
              strokeWidth={2}
              aria-hidden
            />
            {t("studentRepo.tabs.tasks")}
          </NavLink>
          <NavLink
            to={`${repoBase}/contributors`}
            className={({ isActive }) => tabClass(isActive)}
          >
            <Users
              className="size-4 shrink-0 md:size-[18px]"
              strokeWidth={2}
              aria-hidden
            />
            {t("studentRepo.tabs.contributors")}
          </NavLink>
        </nav>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-light-divider px-4 py-5 dark:border-dark-divider md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <BookMarked
              className="size-6 shrink-0 text-muted dark:text-dark-muted"
              strokeWidth={2}
              aria-hidden
            />
            <h2 className="truncate text-xl font-bold tracking-tight text-primary md:text-2xl dark:text-dark-primary">
              {decodedRepo}
            </h2>
            {visibility ? (
              <span className="inline-flex rounded-full border border-(--color-light-card-border) px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary dark:border-(--color-dark-card-border) dark:text-dark-secondary">
                {String(visibility)}
              </span>
            ) : null}
            <p className="basis-full text-xs leading-relaxed text-secondary dark:text-dark-secondary md:basis-auto md:max-w-xl">
              {meta?.description ||
                (isLoading
                  ? t("studentRepo.shell.loadingSubtitle")
                  : isError
                    ? t("studentRepo.shell.errorSubtitle")
                    : "")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="tertiary"
              className="h-8 min-h-8 gap-1.5 px-3 text-xs"
            >
              {t("studentRepo.actions.watch")}
              <span className="font-semibold">{countOrDash(watchCount)}</span>
            </Button>
            <Button
              type="button"
              variant="tertiary"
              className="h-8 min-h-8 gap-1.5 px-3 text-xs"
            >
              <GitFork
                className="size-3.5 shrink-0"
                strokeWidth={2}
                aria-hidden
              />
              {countOrDash(forkCount)}
            </Button>
            <Button
              type="button"
              variant="tertiary"
              className="h-8 min-h-8 gap-1.5 px-3 text-xs"
            >
              <Star
                className="size-3.5 shrink-0 fill-current opacity-80"
                strokeWidth={2}
                aria-hidden
              />
              {countOrDash(starCount)}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <Outlet
          context={{
            owner: decodedOwner,
            repo: decodedRepo,
            repositoryMeta: meta ?? null,
            repoBase,
          }}
        />
      </div>
    </div>
  );
}
