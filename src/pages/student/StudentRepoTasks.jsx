import { useOutletContext } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { useVcRepoTaskDashboard } from "../../services/useApi";

function num(raw) {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

/** @param {unknown} data */
function summarizeTasks(data) {
  if (Array.isArray(data)) {
    const tasks = data;
    if (tasks.length === 0) {
      return {
        total: null,
        open: null,
        completed: null,
        inProgress: null,
        inReview: null,
        tasks: [],
      };
    }
    return {
      total: tasks.length,
      open: null,
      completed: null,
      inProgress: null,
      inReview: null,
      tasks,
    };
  }
  if (!data || typeof data !== "object") {
    return {
      total: null,
      open: null,
      completed: null,
      inProgress: null,
      inReview: null,
      tasks: [],
    };
  }
  const o = /** @type {Record<string, unknown>} */ (data);
  return {
    total: num(o.totalTasks) ?? num(o.tasks_count) ?? num(o.total),
    open: num(o.openTasks),
    completed: num(o.completedTasks),
    inProgress: num(o.inProgressTasks),
    inReview: num(o.inReviewTasks),
    tasks: Array.isArray(o.tasks) ? o.tasks : [],
  };
}

export default function StudentRepoTasks() {
  const { t } = useTranslation();
  const { owner, repo } = useOutletContext() ?? {};

  const { data, isFetching } = useVcRepoTaskDashboard(owner, repo, {
    notifyOnError: false,
  });

  const summary = summarizeTasks(data);

  const hasScoreboard =
    summary.total != null ||
    summary.open != null ||
    summary.completed != null ||
    summary.inProgress != null ||
    summary.inReview != null;

  const hasList = summary.tasks.length > 0;

  const showEmpty = !isFetching && !hasList && !hasScoreboard;

  const tiles = /** @type {{ label: string; value: number }[]} */ ([]);
  if (summary.total != null) tiles.push({ label: t("studentRepo.tasks.statTotal"), value: summary.total });
  if (summary.open != null) tiles.push({ label: t("studentRepo.tasks.statOpen"), value: summary.open });
  if (summary.completed != null) {
    tiles.push({ label: t("studentRepo.tasks.statCompleted"), value: summary.completed });
  }
  if (summary.inProgress != null) {
    tiles.push({ label: t("studentRepo.tasks.statInProgress"), value: summary.inProgress });
  }
  if (summary.inReview != null) {
    tiles.push({ label: t("studentRepo.tasks.statInReview"), value: summary.inReview });
  }

  return (
    <SettingsSectionCard
      title={t("studentRepo.tasks.title")}
      description={t("studentRepo.tasks.subtitle")}
      icon={ClipboardList}
    >
      {isFetching && (
        <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.tasks.loading")}</p>
      )}

      {showEmpty ? (
        <p className="text-sm leading-relaxed text-muted dark:text-dark-muted">{t("studentRepo.tasks.empty")}</p>
      ) : null}

      {!isFetching && (tiles.length || hasList) ? (
        <div className="space-y-6">
          {tiles.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tiles.map((item) => (
                <li
                  key={item.label}
                  className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-primary dark:text-dark-primary">
                    {item.value}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {hasList ? (
            <div>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                {t("studentRepo.tasks.listHeading")}
              </h3>
              <ul className="space-y-2">
                {summary.tasks.map((row, idx) => (
                  <li
                    key={String(row.id ?? row.number ?? idx)}
                    className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                  >
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      {typeof row.title === "string"
                        ? row.title
                        : typeof row.name === "string"
                          ? row.name
                          : t("studentRepo.tasks.unnamed", { index: idx + 1 })}
                    </p>
                    {(row.description ?? row.body) &&
                    typeof (row.description ?? row.body) === "string" ? (
                      <p className="mt-1 line-clamp-2 text-xs text-secondary dark:text-dark-secondary">
                        {String(row.description ?? row.body)}
                      </p>
                    ) : null}
                    {(row.status ?? row.state) != null && String(row.status ?? row.state).trim() ? (
                      <span className="mt-2 inline-flex rounded-full border border-(--color-light-card-border) px-2 py-0.5 text-[10px] font-semibold uppercase text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted">
                        {String(row.status ?? row.state)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </SettingsSectionCard>
  );
}
