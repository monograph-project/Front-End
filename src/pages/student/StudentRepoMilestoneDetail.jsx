import { createElement, useMemo, useState, useEffect } from "react";
import {
  Link,
  Navigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flag,
  Gauge,
  ListChecks,
  Lock,
  Milestone as MilestoneIcon,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import Field from "../../components/Field";
import GlobalModal from "../../components/GlobalModal";
import RepoOverviewStatCard from "../../components/repo/RepoOverviewStatCard";
import { REPO_OVERVIEW_STAT_PALETTES } from "../../components/repo/repoOverviewStatPalettes";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { useAuth } from "../../context/AuthContext";
import {
  canEditIssueOrMilestoneGradingForms,
  canViewMilestoneGradingContext,
  repoViewerUsername,
  usernamesLikelySame,
} from "../../lib/vcAcademicVisibility";
import {
  useVcCloseRepoMilestone,
  useVcPatchRepoMilestone,
  useVcReopenRepoMilestone,
  useVcRepoMilestoneByNumber,
  useVcRepoTasks,
} from "../../services/useApi";
import {
  subscribeCompleting,
  getCompletingSet,
} from "../../lib/completingTasksStore";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function decodeRouteSegment(raw) {
  if (raw == null || raw === "") return "";
  try {
    return decodeURIComponent(String(raw));
  } catch {
    return String(raw);
  }
}

function asNumber(raw) {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function progressValue(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function taskAssigneeUsername(task) {
  const assigned = task?.assignedTo ?? task?.assigned_to ?? task?.assignee;
  if (assigned && typeof assigned === "object") {
    return String(
      assigned.userName ??
        assigned.username ??
        assigned.user_name ??
        assigned.login ??
        "",
    ).trim();
  }
  return String(
    assigned ?? task?.assigneeUsername ?? task?.assignedToUsername ?? "",
  ).trim();
}

function taskBelongsToUser(task, username) {
  return (
    usernamesLikelySame(taskAssigneeUsername(task), username) ||
    usernamesLikelySame(task?.createdBy, username)
  );
}

function formatDate(value, locale) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function dateInputFromIso(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function isoFromDateInput(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function intOrNull(value) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function draftFromMilestone(m) {
  return {
    title: String(m.title ?? ""),
    description: String(m.description ?? ""),
    dueDate: dateInputFromIso(m.dueDate),
    maxScore: m.maxScore != null ? String(m.maxScore) : "",
    passingScore: m.passingScore != null ? String(m.passingScore) : "",
    requiredTasks: m.requiredTasks != null ? String(m.requiredTasks) : "",
    rubric: String(m.rubric ?? ""),
  };
}

function normalizeTaskStatus(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "open";
  if (raw === "in_progress" || raw === "in-progress") return "progress";
  if (raw === "in_review" || raw === "in-review") return "review";
  return raw;
}

function countTasksByStatus(list) {
  const counts = {
    total: list.length,
    open: 0,
    progress: 0,
    review: 0,
    completed: 0,
  };
  list.forEach((task) => {
    const status = normalizeTaskStatus(task?.status);
    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }
  });
  return counts;
}

function taskStatusTone(status) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "review":
      return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300";
    case "progress":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
    case "cancelled":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300";
  }
}

function StatusBadge({ label, tone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        tone,
      )}
    >
      {label}
    </span>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
      <div className="mt-0.5 text-muted dark:text-dark-muted">
        {createElement(icon, { className: "h-4 w-4", strokeWidth: 1.8 })}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted dark:text-dark-muted">
          {label}
        </p>
        <p className="mt-1 text-sm text-primary dark:text-dark-primary">{value}</p>
      </div>
    </div>
  );
}

export default function StudentRepoMilestoneDetail() {
  const { t, i18n } = useTranslation();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const canEditGradingForms = canEditIssueOrMilestoneGradingForms({
    isStudent,
    isTeacher,
    isAdmin,
  });
  const outletCtx = useOutletContext() ?? {};
  const {
    milestoneNumber: milestoneNumberParam,
    owner: ownerParam,
    repo: repoParam,
  } = useParams();
  const owner = outletCtx.owner ?? decodeRouteSegment(ownerParam);
  const repo = outletCtx.repo ?? decodeRouteSegment(repoParam);
  const repoBase = outletCtx.repoBase ?? "";
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: "",
    passingScore: "",
    requiredTasks: "",
    rubric: "",
  });

  const milestoneNumber = milestoneNumberParam;
  const {
    data: milestone,
    isLoading,
    isError,
    refetch,
  } = useVcRepoMilestoneByNumber(owner, repo, milestoneNumber, {
    notifyOnError: true,
  });

  const msKey =
    milestone?.number != null ? milestone.number : milestoneNumber;
  const { data: repoTasks = [] } = useVcRepoTasks(
    owner,
    repo,
    {},
    { enabled: Boolean(owner && repo), notifyOnError: false },
  );

  const [completingCounts, setCompletingCounts] = useState(() => new Map());

  useEffect(() => {
    function recompute(set) {
      const map = new Map();
      const s = set ?? getCompletingSet();
      for (const task of repoTasks) {
        if (!task) continue;
        if (!task?.milestoneNumber) continue;
        if (s.has(String(task.number))) {
          const m = Number(task.milestoneNumber);
          map.set(m, (map.get(m) || 0) + 1);
        }
      }
      setCompletingCounts(map);
    }
    const unsub = subscribeCompleting((s) => recompute(s));
    recompute();
    return unsub;
  }, [repoTasks]);

  const milestoneIdStr =
    milestone?.id != null ? String(milestone.id) : "";

  const canViewGrading = canViewMilestoneGradingContext(
    isStudent,
    user,
    milestone?.createdBy,
  );
  const currentUsername = repoViewerUsername(user);
  const canViewAllTasks =
    (typeof isTeacher === "function" && isTeacher()) ||
    (typeof isAdmin === "function" && isAdmin());
  const canManageMilestone =
    Boolean(milestone?.createdBy) &&
    usernamesLikelySame(currentUsername, milestone.createdBy);

  const tasks = useMemo(() => {
    if (msKey == null) return [];
    const mNum = Number(msKey);
    return repoTasks.filter((task) => {
      if (!canViewAllTasks && currentUsername) {
        if (!taskBelongsToUser(task, currentUsername)) return false;
      }
      if (Number.isFinite(mNum) && task?.milestoneNumber != null) {
        return Number(task.milestoneNumber) === mNum;
      }
      if (milestoneIdStr && task?.milestoneId != null) {
        return String(task.milestoneId) === milestoneIdStr;
      }
      return false;
    });
  }, [canViewAllTasks, currentUsername, repoTasks, milestoneIdStr, msKey]);

  const invalidateScope = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["vc", "repos", "milestone", owner, repo, milestoneNumber],
      }),
      queryClient.invalidateQueries({
        queryKey: ["vc", "repos", "milestones", owner, repo],
      }),
      queryClient.invalidateQueries({
        queryKey: ["vc", "repos", "tasks", owner, repo],
      }),
      queryClient.invalidateQueries({
        queryKey: ["vc", "repos", "task-dashboard", owner, repo],
      }),
      queryClient.invalidateQueries({
        queryKey: ["vc", "repos", "statistics", owner, repo],
      }),
    ]);
  };

  const patchMilestone = useVcPatchRepoMilestone({
    onSuccess: async () => {
      await invalidateScope();
      setEditOpen(false);
    },
  });

  const closeMilestoneMut = useVcCloseRepoMilestone({
    onSuccess: async () => {
      await invalidateScope();
      setCloseConfirmOpen(false);
    },
  });

  const reopenMilestoneMut = useVcReopenRepoMilestone({
    onSuccess: async () => {
      await invalidateScope();
    },
  });

  const status = String(milestone?.status ?? "open").toLowerCase();
  const completingCountForThis = completingCounts.get(Number(msKey)) || 0;
  let completion = 0;
  const taskCounts = countTasksByStatus(tasks);
  const totalTasks = taskCounts.total;
  const completedTasks = taskCounts.completed;
  const requiredTasks = asNumber(milestone?.requiredTasks);
  const completionTarget =
    requiredTasks != null && requiredTasks > 0 ? requiredTasks : totalTasks;
  let effectiveCompleted = completedTasks;
  if (completionTarget > 0) {
    effectiveCompleted = Math.min(
      completionTarget,
      completedTasks + Number(completingCountForThis || 0),
    );
    completion = Math.round((effectiveCompleted / completionTarget) * 100);
  } else {
    completion = progressValue(milestone?.completionPercentage);
  }
  const dueDate = formatDate(milestone?.dueDate, i18n.language);
  const mutatingLifecycle =
    closeMilestoneMut.isPending || reopenMilestoneMut.isPending;

  function openEditModal() {
    if (!milestone) return;
    setDraft(draftFromMilestone(milestone));
    setEditOpen(true);
  }

  async function submitPatch() {
    await patchMilestone.mutateAsync({
      owner,
      repo,
      milestoneNumber,
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      dueDate: isoFromDateInput(draft.dueDate),
      maxScore: canEditGradingForms
        ? intOrNull(draft.maxScore)
        : (milestone?.maxScore ?? null),
      passingScore: canEditGradingForms
        ? intOrNull(draft.passingScore)
        : (milestone?.passingScore ?? null),
      requiredTasks: intOrNull(draft.requiredTasks),
      rubric: canEditGradingForms
        ? draft.rubric.trim() || null
        : (milestone?.rubric != null && String(milestone.rubric).trim() !== ""
            ? String(milestone.rubric)
            : null),
    });
  }

  async function runCloseMilestone() {
    await closeMilestoneMut.mutateAsync({ owner, repo, milestoneNumber });
  }

  async function runReopenMilestone() {
    await reopenMilestoneMut.mutateAsync({ owner, repo, milestoneNumber });
  }

  if (!owner || !repo || milestoneNumber == null || milestoneNumber === "") {
    return <Navigate to=".." relative="path" replace />;
  }

  if (!isLoading && isError) {
    return (
      <div className="space-y-4">
        <Link
          to={repoBase ? `${repoBase}/tasks` : ".."}
          relative={repoBase ? undefined : "path"}
          className="inline-flex items-center gap-2 text-xs font-medium text-(--color-chart-blue-primary) dark:text-(--color-chart-blue-secondary)"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.8} />
          {t("studentRepo.tasks.milestoneDetail.back")}
        </Link>
        <p className="text-sm text-light-error-text dark:text-dark-error-text">
          {t("studentRepo.tasks.milestoneDetail.loadError")}
        </p>
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          {t("studentRepo.tasks.taskDetail.retry")}
        </Button>
      </div>
    );
  }

  if (!isLoading && milestone == null) {
    return <Navigate to=".." relative="path" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={repoBase ? `${repoBase}/tasks` : ".."}
          relative={repoBase ? undefined : "path"}
          className="inline-flex items-center gap-2 text-xs font-medium text-(--color-chart-blue-primary) transition-colors hover:underline dark:text-(--color-chart-blue-secondary)"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={1.8} />
          {t("studentRepo.tasks.milestoneDetail.back")}
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            icon={<PencilLine className="h-4 w-4" />}
            disabled={!milestone || isLoading || mutatingLifecycle || !canManageMilestone}
            onClick={openEditModal}
          >
            {t("studentRepo.tasks.milestoneDetail.editTitle")}
          </Button>
          {status !== "closed" ? (
            <Button
              type="button"
              variant="danger"
              icon={<Lock className="h-4 w-4" strokeWidth={1.8} />}
              disabled={
                !milestone || isLoading || mutatingLifecycle || patchMilestone.isPending || !canManageMilestone
              }
              onClick={() => setCloseConfirmOpen(true)}
            >
              {t("studentRepo.tasks.milestoneDetail.closeAction")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              icon={<RotateCcw className="h-4 w-4" strokeWidth={1.8} />}
              disabled={
                !milestone ||
                isLoading ||
                mutatingLifecycle ||
                patchMilestone.isPending ||
                !canManageMilestone
              }
              onClick={runReopenMilestone}
            >
              {t("studentRepo.tasks.milestoneDetail.reopenAction")}
            </Button>
          )}
        </div>
      </div>

      {isLoading || !milestone ? (
        <p className="text-sm text-muted dark:text-dark-muted">
          {t("studentRepo.tasks.milestoneDetail.loading")}
        </p>
      ) : (
        <>
          <div className="rounded-3xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-5 shadow-xs dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <MilestoneIcon
                    className="h-5 w-5 text-muted dark:text-dark-muted"
                    strokeWidth={1.6}
                  />
                  <h1 className="text-xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                    {milestone.title ||
                      t("studentRepo.tasks.milestones.untitled")}
                  </h1>
                  <StatusBadge
                    label={t(
                      status === "closed"
                        ? "studentRepo.tasks.milestones.closed"
                        : "studentRepo.tasks.milestones.open",
                    )}
                    tone={
                      status === "closed"
                        ? "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-500/20 dark:bg-zinc-500/10 dark:text-zinc-300"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    }
                  />
                </div>
                <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                  #{milestone.number ?? milestoneNumber}
                </p>
                {milestone.description ? (
                  <p className="mt-3 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {milestone.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted dark:text-dark-muted">
                <span>{t("studentRepo.tasks.milestones.progress")}</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-light-app-tertiary dark:bg-dark-app-tertiary">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <RepoOverviewStatCard
                icon={ListChecks}
                label={t("studentRepo.tasks.milestoneDetail.stats.total")}
                value={String(totalTasks)}
                palette={REPO_OVERVIEW_STAT_PALETTES[0]}
              />
              <RepoOverviewStatCard
                icon={Flag}
                label={t("studentRepo.tasks.milestoneDetail.stats.open")}
                value={String(taskCounts.open)}
                palette={REPO_OVERVIEW_STAT_PALETTES[1]}
              />
              <RepoOverviewStatCard
                icon={Gauge}
                label={t("studentRepo.tasks.milestoneDetail.stats.progress")}
                value={String(taskCounts.progress)}
                palette={REPO_OVERVIEW_STAT_PALETTES[2]}
              />
              <RepoOverviewStatCard
                icon={CheckCircle2}
                label={t("studentRepo.tasks.milestoneDetail.stats.completed")}
                value={String(effectiveCompleted)}
                palette={REPO_OVERVIEW_STAT_PALETTES[3]}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <DetailRow
                icon={CalendarDays}
                label={t("studentRepo.tasks.detail.dueLabel")}
                value={dueDate || t("studentRepo.tasks.detail.none")}
              />
              {canViewGrading ? (
                <>
                  <DetailRow
                    icon={Flag}
                    label={t("studentRepo.tasks.createMilestone.fields.maxScore")}
                    value={
                      milestone.maxScore != null
                        ? String(milestone.maxScore)
                        : t("studentRepo.tasks.detail.none")
                    }
                  />
                  <DetailRow
                    icon={CheckCircle2}
                    label={t(
                      "studentRepo.tasks.createMilestone.fields.passingScore",
                    )}
                    value={
                      milestone.passingScore != null
                        ? String(milestone.passingScore)
                        : t("studentRepo.tasks.detail.none")
                    }
                  />
                </>
              ) : null}
            </div>
          </div>

          <SettingsSectionCard
            icon={ListChecks}
            title={t("studentRepo.tasks.milestoneDetail.tasksInMilestone")}
            description={t("studentRepo.tasks.issues.subtitle")}
            contentClassName="space-y-3"
          >
            {!tasks.length ? (
              <p className="text-sm text-muted dark:text-dark-muted">
                {t("studentRepo.tasks.empty")}
              </p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => {
                  const st = normalizeTaskStatus(task?.status);
                  return (
                    <li key={task.id ?? task.number}>
                      <Link
                        to={`../issue/${encodeURIComponent(String(task.number))}`}
                        relative="path"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 transition-colors hover:border-(--color-light-input-border-focus) hover:bg-white dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-card-hover"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                              label={t(`studentRepo.tasks.status.${st}`)}
                              tone={taskStatusTone(st)}
                            />
                            <span className="truncate text-sm font-medium text-primary dark:text-dark-primary">
                              {task.title ||
                                t("studentRepo.tasks.unnamed", {
                                  index: task.number ?? "—",
                                })}
                            </span>
                            <span className="text-xs text-muted dark:text-dark-muted">
                              #{task.number}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted dark:text-dark-muted rtl:rotate-180" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </SettingsSectionCard>
        </>
      )}

      <GlobalModal
        open={editOpen}
        setOpen={setEditOpen}
        isClose
        title={t("studentRepo.tasks.milestoneDetail.editTitle")}
        subtitle={t("studentRepo.tasks.createMilestone.subtitle")}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setEditOpen(false)}
              disabled={patchMilestone.isPending}
            >
              {t("studentRepo.pulls.actions.cancel")}
            </Button>
            <Button
              onClick={submitPatch}
              loading={patchMilestone.isPending}
              disabled={!draft.title.trim()}
            >
              {t("studentRepo.tasks.milestoneDetail.saveButton")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            register={{}}
            label={t("studentRepo.tasks.createMilestone.fields.title")}
            value={draft.title}
            onChange={(e) =>
              setDraft((p) => ({ ...p, title: e.target.value }))
            }
          />
          <Field
            register={{}}
            label={t("studentRepo.tasks.createMilestone.fields.description")}
            value={draft.description}
            onChange={(e) =>
              setDraft((p) => ({ ...p, description: e.target.value }))
            }
          />
          <Field
            register={{}}
            type="date"
            label={t("studentRepo.tasks.createMilestone.fields.dueDate")}
            value={draft.dueDate}
            onChange={(e) =>
              setDraft((p) => ({ ...p, dueDate: e.target.value }))
            }
          />
          <p className="text-xs text-secondary dark:text-dark-secondary">
            {t("studentRepo.tasks.milestoneDetail.statusNote")}
          </p>
          <div
            className={cx(
              "grid gap-4",
              canEditGradingForms ? "md:grid-cols-3" : "md:grid-cols-1",
            )}
          >
            {canEditGradingForms ? (
              <>
                <Field
                  register={{}}
                  type="number"
                  label={t("studentRepo.tasks.createMilestone.fields.maxScore")}
                  value={draft.maxScore}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, maxScore: e.target.value }))
                  }
                />
                <Field
                  register={{}}
                  type="number"
                  label={t(
                    "studentRepo.tasks.createMilestone.fields.passingScore",
                  )}
                  value={draft.passingScore}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, passingScore: e.target.value }))
                  }
                />
              </>
            ) : null}
            <Field
              register={{}}
              type="number"
              label={t(
                "studentRepo.tasks.createMilestone.fields.requiredTasks",
              )}
              value={draft.requiredTasks}
              onChange={(e) =>
                setDraft((p) => ({ ...p, requiredTasks: e.target.value }))
              }
            />
          </div>
          {canEditGradingForms ? (
            <Field
              register={{}}
              label={t("studentRepo.tasks.createMilestone.fields.rubric")}
              value={draft.rubric}
              onChange={(e) =>
                setDraft((p) => ({ ...p, rubric: e.target.value }))
              }
            />
          ) : null}
        </div>
      </GlobalModal>

      <GlobalModal
        open={closeConfirmOpen}
        setOpen={setCloseConfirmOpen}
        isClose
        title={t("studentRepo.tasks.milestoneDetail.closeConfirmTitle")}
        subtitle={t("studentRepo.tasks.milestoneDetail.closeConfirmSubtitle")}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCloseConfirmOpen(false)}
              disabled={closeMilestoneMut.isPending}
            >
              {t("studentRepo.pulls.actions.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={closeMilestoneMut.isPending}
              onClick={runCloseMilestone}
            >
              {t("studentRepo.tasks.milestoneDetail.closeAction")}
            </Button>
          </>
        }
      />
    </div>
  );
}
