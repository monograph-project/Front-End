import { useDeferredValue, useMemo, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  CirclePlus,
  CalendarDays,
  CheckCircle2,
  CircleDot,
  ClipboardList,
  Filter,
  Flag,
  Gauge,
  ListChecks,
  Milestone as MilestoneIcon,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { gooeyToast } from "goey-toast";
import {
  addCompleting,
  removeCompleting,
  getCompletingSet,
} from "../../lib/completingTasksStore";
import Button from "../../components/Button";
import Field from "../../components/Field";
import GlobalModal from "../../components/GlobalModal";
import SearchableSelect from "../../components/SearchableSelect";
import Select from "../../components/Select";
import RepoOverviewStatCard from "../../components/repo/RepoOverviewStatCard";
import { REPO_OVERVIEW_STAT_PALETTES } from "../../components/repo/repoOverviewStatPalettes";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { useAuth } from "../../context/AuthContext";
import {
  canEditIssueOrMilestoneGradingForms,
  repoViewerUsername,
  usernamesLikelySame,
} from "../../lib/vcAcademicVisibility";
import {
  useVcCreateRepoMilestone,
  useVcCreateRepoTask,
  useVcRepoMilestones,
  useVcRepoTaskDashboard,
  useVcRepoTasks,
} from "../../services/useApi";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(raw) {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
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

function progressValue(value) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
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

function normalizeTaskStatus(value) {
  const raw = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!raw) return "open";
  if (raw === "in_progress" || raw === "in-progress") return "progress";
  if (raw === "in_review" || raw === "in-review") return "review";
  return raw;
}

function containsIgnoreCase(source, needleLower) {
  return source != null && String(source).toLowerCase().includes(needleLower);
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

function countTasksByStatus(list) {
  const counts = {
    total: list.length,
    open: 0,
    progress: 0,
    review: 0,
    completed: 0,
    cancelled: 0,
  };
  list.forEach((task) => {
    const status = normalizeTaskStatus(task?.status);
    if (Object.prototype.hasOwnProperty.call(counts, status)) {
      counts[status] += 1;
    }
  });
  return counts;
}

function milestoneTaskCounts(tasks, milestone) {
  const milestoneNumber = Number(milestone?.number);
  const milestoneId =
    milestone?.id != null && milestone?.id !== "" ? String(milestone.id) : "";
  const list = tasks.filter((task) => {
    if (Number.isFinite(milestoneNumber) && task?.milestoneNumber != null) {
      return Number(task.milestoneNumber) === milestoneNumber;
    }
    return milestoneId && task?.milestoneId != null
      ? String(task.milestoneId) === milestoneId
      : false;
  });
  return countTasksByStatus(list);
}

function withDerivedMilestoneProgress(milestone, tasks) {
  const counts = milestoneTaskCounts(tasks, milestone);
  const requiredTasks = asNumber(milestone?.requiredTasks);
  const completionTarget =
    requiredTasks != null && requiredTasks > 0 ? requiredTasks : counts.total;
  const completionPercentage =
    completionTarget > 0
      ? Math.round(
          (Math.min(counts.completed, completionTarget) / completionTarget) *
            100,
        )
      : progressValue(milestone?.completionPercentage);

  return {
    ...milestone,
    totalTasks: counts.total,
    openTasks: counts.open,
    inProgressTasks: counts.progress,
    inReviewTasks: counts.review,
    completedTasks: counts.completed,
    completionPercentage,
  };
}

/** Client-side task search aligned with VC `TaskService` list filtering. */
function taskMatchesDeferredSearch(task, searchRaw) {
  const needle = String(searchRaw ?? "")
    .trim()
    .toLowerCase();
  if (!needle) return true;
  return (
    containsIgnoreCase(task?.title, needle) ||
    containsIgnoreCase(task?.description, needle) ||
    containsIgnoreCase(task?.createdBy, needle) ||
    containsIgnoreCase(task?.reviewedBy, needle) ||
    containsIgnoreCase(task?.reviewComments, needle) ||
    containsIgnoreCase(task?.submissionBranch, needle) ||
    containsIgnoreCase(task?.submissionCommit, needle) ||
    containsIgnoreCase(task?.submissionUrl, needle) ||
    (task?.assignedTo != null &&
      (containsIgnoreCase(
        task.assignedTo.userName ?? task.assignedTo.username,
        needle,
      ) ||
        containsIgnoreCase(task.assignedTo.firstName, needle) ||
        containsIgnoreCase(task.assignedTo.email, needle))) ||
    (Array.isArray(task?.labels) &&
      task.labels.some((lab) => containsIgnoreCase(String(lab), needle)))
  );
}

function filterRepoTasksForStudentView(list, filters) {
  const {
    deferredSearch,
    statusFilter,
    milestoneFilter,
    scopeFilter,
    currentUsername,
  } = filters;

  return list.filter((task) => {
    if (scopeFilter === "mine" && currentUsername) {
      if (!taskBelongsToUser(task, currentUsername)) return false;
    }
    if (milestoneFilter !== "all") {
      const m = Number(milestoneFilter);
      if (!Number.isFinite(m) || Number(task?.milestoneNumber) !== m)
        return false;
    }
    if (statusFilter !== "all") {
      if (normalizeTaskStatus(task?.status) !== statusFilter) return false;
    }
    if (!taskMatchesDeferredSearch(task, deferredSearch)) return false;
    return true;
  });
}

function normalizePriority(value) {
  return (
    String(value ?? "medium")
      .trim()
      .toLowerCase() || "medium"
  );
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

function priorityTone(priority) {
  switch (priority) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/10 dark:text-slate-300";
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

function MilestoneCard({ milestone, locale, t, to, completingCount = 0 }) {
  const status = String(milestone?.status ?? "open").toLowerCase();
  const dueDate = formatDate(milestone?.dueDate, locale);
  const totalTasks = asNumber(milestone?.totalTasks) ?? 0;
  const completedTasks = asNumber(milestone?.completedTasks) ?? 0;
  const openTasks = asNumber(milestone?.openTasks) ?? 0;
  const requiredTasks = asNumber(milestone?.requiredTasks);
  const completionTarget =
    requiredTasks != null && requiredTasks > 0 ? requiredTasks : totalTasks;
  let completion = 0;
  let effectiveCompleted = completedTasks;
  if (completionTarget > 0) {
    effectiveCompleted = Math.min(
      completionTarget,
      completedTasks + Number(completingCount || 0),
    );
    completion = Math.round((effectiveCompleted / completionTarget) * 100);
  } else {
    completion = progressValue(milestone?.completionPercentage);
  }

  return (
    <Link
      to={to}
      relative="path"
      className={cx(
        "group block rounded-2xl border p-4 text-left transition-all",
        "border-(--color-light-card-border) bg-(--color-light-card-bg) hover:border-(--color-light-input-border-focus) hover:bg-white dark:border-(--color-dark-card-border) dark:bg-dark-card-bg dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-card-hover",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-primary dark:text-dark-primary">
              {milestone?.title || t("studentRepo.tasks.milestones.untitled")}
            </span>
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
            {milestone?.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-secondary dark:text-dark-secondary">
              {milestone.description}
            </p>
          ) : null}
        </div>
        <span className="rounded-full border border-(--color-light-card-border) px-2 py-1 text-[10px] font-semibold text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted">
          #{milestone?.number ?? "—"}
        </span>
      </div>

      <div className="mt-4">
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

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-secondary dark:text-dark-secondary">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted dark:text-dark-muted" />
          {dueDate || t("studentRepo.tasks.detail.none")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ListChecks className="h-3.5 w-3.5 text-muted dark:text-dark-muted" />
          {t("studentRepo.tasks.milestones.openTasks", { count: openTasks })}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-muted dark:text-dark-muted" />
          {t("studentRepo.tasks.milestones.completedTasks", {
            count: effectiveCompleted,
            total: completionTarget,
          })}
        </span>
      </div>
    </Link>
  );
}

function TaskListItem({
  task,
  milestoneMap,
  locale,
  t,
  to,
  onComplete,
  canComplete,
  isCompleting,
}) {
  const status = normalizeTaskStatus(task?.status);
  const priority = normalizePriority(task?.priority);
  const dueDate = formatDate(task?.dueDate, locale);
  const milestone = milestoneMap.get(task?.milestoneNumber);
  const title =
    task?.title ||
    t("studentRepo.tasks.unnamed", { index: task?.number ?? "—" });
  const commentsCount = asNumber(task?.commentsCount) ?? 0;

  return (
    <Link
      to={to}
      relative="path"
      className={cx(
        "block w-full rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-4 py-4 text-left transition-all hover:border-(--color-light-input-border-focus) hover:bg-white dark:border-(--color-dark-card-border) dark:bg-dark-card-bg dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-card-hover",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={t(`studentRepo.tasks.status.${status}`)}
              tone={taskStatusTone(status)}
            />
            <span className="text-sm font-semibold text-primary dark:text-dark-primary">
              {title}
            </span>
            <span className="text-xs text-muted dark:text-dark-muted">
              #{task?.number ?? "—"}
            </span>
          </div>

          {task?.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-secondary dark:text-dark-secondary">
              {task.description}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-secondary dark:text-dark-secondary">
            <span>
              {t("studentRepo.tasks.detail.createdBy", {
                user: task?.createdBy || "—",
              })}
            </span>
            {task?.assignedTo?.userName ? (
              <span>
                {t("studentRepo.tasks.detail.assignee", {
                  user: task.assignedTo.userName,
                })}
              </span>
            ) : (
              <span>{t("studentRepo.tasks.detail.unassigned")}</span>
            )}
            {dueDate ? (
              <span>
                {t("studentRepo.tasks.detail.due", { date: dueDate })}
              </span>
            ) : null}
            <span>
              {t("studentRepo.tasks.detail.comments", { count: commentsCount })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {milestone ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-2.5 py-1 text-[11px] font-medium text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary">
              <MilestoneIcon className="h-3.5 w-3.5" />
              {milestone.title}
            </span>
          ) : null}
          <StatusBadge
            label={t(`studentRepo.tasks.priority.${priority}`)}
            tone={priorityTone(priority)}
          />
          {canComplete &&
          normalizeTaskStatus(task?.status) === "review" &&
          task?.linkedPrId ? (
            <Button
              type="button"
              variant="secondary"
              loading={Boolean(isCompleting)}
              disabled={Boolean(isCompleting)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onComplete && onComplete(task?.number, task?.linkedPrId);
              }}
            >
              {t("studentRepo.tasks.actions.complete")}
            </Button>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function FilterToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  milestoneFilter,
  setMilestoneFilter,
  scopeFilter,
  setScopeFilter,
  statusOptions,
  milestoneOptions,
  scopeOptions,
  t,
}) {
  return (
    <div className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary p-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.25fr)_minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(180px,0.8fr)]">
        <Field
          register={{}}
          label={t("studentRepo.tasks.filters.searchLabel")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t("studentRepo.tasks.filters.searchPlaceholder")}
        />

        <Select
          label={t("studentRepo.tasks.filters.statusLabel")}
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          placeholder={t("studentRepo.tasks.filters.statusPlaceholder")}
        />

        <Field label={t("studentRepo.tasks.filters.milestoneLabel")}>
          <SearchableSelect
            value={milestoneFilter}
            onChange={setMilestoneFilter}
            options={milestoneOptions}
            placeholder={t("studentRepo.tasks.filters.milestonePlaceholder")}
            searchPlaceholder={t("studentRepo.tasks.filters.milestoneSearch")}
            clearable={false}
          />
        </Field>

        <Select
          label={t("studentRepo.tasks.filters.scopeLabel")}
          value={scopeFilter}
          onChange={setScopeFilter}
          options={scopeOptions}
          placeholder={t("studentRepo.tasks.filters.scopePlaceholder")}
        />
      </div>
    </div>
  );
}

const MODAL_TEXTAREA =
  "min-h-28 w-full resize-y rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-2 text-sm text-(--color-light-text-primary) outline-none transition placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15";

function CreateFlowSection({ step, title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-dark-card-bg">
      <div className="flex gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary text-xs font-bold text-primary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-primary"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-primary dark:text-dark-primary">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-xs leading-5 text-secondary dark:text-dark-secondary">
                {subtitle}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

function decodeRouteSegment(raw) {
  if (raw == null || raw === "") return "";
  try {
    return decodeURIComponent(String(raw));
  } catch {
    return String(raw);
  }
}

export default function StudentRepoTasks() {
  const { t, i18n } = useTranslation();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const canEditGradingForms = canEditIssueOrMilestoneGradingForms({
    isStudent,
    isTeacher,
    isAdmin,
  });
  const queryClient = useQueryClient();
  const outletCtx = useOutletContext() ?? {};
  const { owner: ownerParam, repo: repoParam } = useParams();
  const owner = outletCtx.owner ?? decodeRouteSegment(ownerParam);
  const repo = outletCtx.repo ?? decodeRouteSegment(repoParam);

  const [milestoneState, setMilestoneState] = useState("open");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [milestoneFilter, setMilestoneFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState(() =>
    (typeof isTeacher === "function" && isTeacher()) ||
    (typeof isAdmin === "function" && isAdmin())
      ? "all"
      : "mine",
  );
  const [createMilestoneOpen, setCreateMilestoneOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState({
    title: "",
    description: "",
    dueDate: "",
    maxScore: "",
    passingScore: "",
    requiredTasks: "",
  });
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    description: "",
    milestoneNumber: "none",
    priority: "medium",
    labels: [],
    dueDate: "",
    estimatedHours: "",
    maxScore: "",
  });
  const deferredSearch = useDeferredValue(search);
  const [completing, setCompleting] = useState(() => new Set());

  const { data: dashboard, isFetching: dashboardLoading } =
    useVcRepoTaskDashboard(owner, repo, { notifyOnError: false });

  /** No query params: backend may not bind optional filters; open/closed tabs filter client-side. */
  const { data: milestones = [], isFetching: milestonesLoading } =
    useVcRepoMilestones(
      owner,
      repo,
      { state: "all" },
      { notifyOnError: false },
    );

  const currentUsername = repoViewerUsername(user);
  const canViewAllTasks =
    (typeof isTeacher === "function" && isTeacher()) ||
    (typeof isAdmin === "function" && isAdmin());
  const canManageRepoTasks =
    (currentUsername && usernamesLikelySame(currentUsername, owner)) ||
    (typeof isTeacher === "function" && isTeacher()) ||
    (typeof isAdmin === "function" && isAdmin());
  const effectiveScopeFilter = canViewAllTasks ? scopeFilter : "mine";

  const invalidateTaskDomain = async () => {
    await Promise.all([
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

  async function handleCompleteTask(taskNumber, pullRequestId) {
    const key = String(taskNumber);
    setCompleting((prev) => {
      const s = new Set(prev);
      s.add(key);
      return s;
    });
    addCompleting(key);
    try {
      const res = await fetch(
        `/api/v1/task/repos/${owner}/${repo}/tasks/${taskNumber}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pullRequestId }),
        },
      );
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || res.statusText || "Failed to complete task");
      }
      gooeyToast.success(
        t("studentRepo.tasks.toasts.completeSuccess", { number: taskNumber }) ||
          "Task completed",
      );
      await invalidateTaskDomain();
    } catch (err) {
      console.error("Failed to complete task", err);
      gooeyToast.error(
        t("studentRepo.tasks.toasts.completeError") ||
          String(err?.message || err),
      );
    } finally {
      setCompleting((prev) => {
        const s = new Set(prev);
        s.delete(key);
        return s;
      });
      removeCompleting(key);
    }
  }

  const createMilestoneMutation = useVcCreateRepoMilestone({
    onSuccess: async () => {
      await invalidateTaskDomain();
      setCreateMilestoneOpen(false);
      setMilestoneDraft({
        title: "",
        description: "",
        dueDate: "",
        maxScore: "",
        passingScore: "",
        requiredTasks: "",
      });
    },
  });

  const createTaskMutation = useVcCreateRepoTask({
    onSuccess: async () => {
      await invalidateTaskDomain();
      setCreateTaskOpen(false);
      setTaskDraft({
        title: "",
        description: "",
        milestoneNumber: "none",
        priority: "medium",
        labels: [],
        dueDate: "",
        estimatedHours: "",
        maxScore: "",
      });
    },
  });

  const { data: allRepoTasks = [], isFetching: tasksLoading } = useVcRepoTasks(
    owner,
    repo,
    {},
    { notifyOnError: false },
  );

  const completingCounts = useMemo(() => {
    const map = new Map();
    const global = getCompletingSet();
    const lookups = global.size ? global : completing;
    const progressTasks =
      effectiveScopeFilter === "mine" && currentUsername
        ? allRepoTasks.filter((task) => taskBelongsToUser(task, currentUsername))
        : allRepoTasks;
    for (const task of progressTasks) {
      if (!task) continue;
      if (!task?.milestoneNumber) continue;
      if (lookups.has(String(task.number))) {
        const m = Number(task.milestoneNumber);
        map.set(m, (map.get(m) || 0) + 1);
      }
    }
    return map;
  }, [allRepoTasks, completing, currentUsername, effectiveScopeFilter]);

  const taskScopeForProgress = useMemo(() => {
    if (
      !canViewAllTasks &&
      effectiveScopeFilter === "mine" &&
      currentUsername
    ) {
      return allRepoTasks.filter((task) => taskBelongsToUser(task, currentUsername));
    }
    return allRepoTasks;
  }, [allRepoTasks, canViewAllTasks, currentUsername, effectiveScopeFilter]);

  const tasks = useMemo(
    () =>
      filterRepoTasksForStudentView(allRepoTasks, {
        deferredSearch,
        statusFilter,
        milestoneFilter,
        scopeFilter: effectiveScopeFilter,
        currentUsername,
      }),
    [
      allRepoTasks,
      currentUsername,
      deferredSearch,
      effectiveScopeFilter,
      milestoneFilter,
      statusFilter,
    ],
  );

  const milestoneCounts = useMemo(() => {
    const scopedMilestones = milestones.map((item) =>
      withDerivedMilestoneProgress(item, taskScopeForProgress),
    );
    const open = scopedMilestones.filter(
      (item) => String(item?.status ?? "open").toLowerCase() !== "closed",
    ).length;
    const closed = scopedMilestones.length - open;
    return { open, closed };
  }, [milestones, taskScopeForProgress]);

  const visibleMilestones = useMemo(
    () =>
      milestones
        .map((item) => withDerivedMilestoneProgress(item, taskScopeForProgress))
        .filter((item) =>
          milestoneState === "closed"
            ? String(item?.status ?? "").toLowerCase() === "closed"
            : String(item?.status ?? "open").toLowerCase() !== "closed",
        ),
    [milestoneState, milestones, taskScopeForProgress],
  );

  const milestoneMap = useMemo(() => {
    const map = new Map();
    milestones
      .map((item) => withDerivedMilestoneProgress(item, taskScopeForProgress))
      .forEach((item) => {
        if (item?.number != null) map.set(item.number, item);
      });
    return map;
  }, [milestones, taskScopeForProgress]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: t("studentRepo.tasks.filters.statusAll") },
      { value: "open", label: t("studentRepo.tasks.status.open") },
      { value: "progress", label: t("studentRepo.tasks.status.progress") },
      { value: "review", label: t("studentRepo.tasks.status.review") },
      { value: "completed", label: t("studentRepo.tasks.status.completed") },
      { value: "cancelled", label: t("studentRepo.tasks.status.cancelled") },
    ],
    [t],
  );

  const milestoneOptions = useMemo(
    () => [
      { value: "all", label: t("studentRepo.tasks.filters.milestoneAll") },
      ...milestones.map((item) => ({
        value: String(item.number),
        label: `#${item.number} · ${item.title || t("studentRepo.tasks.milestones.untitled")}`,
      })),
    ],
    [milestones, t],
  );

  const milestoneCreateOptions = useMemo(
    () => [
      { value: "none", label: t("studentRepo.tasks.detail.none") },
      ...milestones.map((item) => ({
        value: String(item.number),
        label: `#${item.number} · ${item.title || t("studentRepo.tasks.milestones.untitled")}`,
      })),
    ],
    [milestones, t],
  );

  const scopeOptions = useMemo(() => {
    const mine = { value: "mine", label: t("studentRepo.tasks.filters.scopeMine") };
    if (!canViewAllTasks) return [mine];
    return [
      { value: "all", label: t("studentRepo.tasks.filters.scopeAll") },
      mine,
    ];
  }, [canViewAllTasks, t]);

  const priorityOptions = useMemo(
    () => [
      { value: "low", label: t("studentRepo.tasks.priority.low") },
      { value: "medium", label: t("studentRepo.tasks.priority.medium") },
      { value: "high", label: t("studentRepo.tasks.priority.high") },
      { value: "critical", label: t("studentRepo.tasks.priority.critical") },
    ],
    [t],
  );

  const labelOptions = useMemo(
    () =>
      ["BUG", "DOCUMENTATION", "DUPLICATE", "INVALID", "QUESTION"].map(
        (value) => ({
          value,
          label: value,
          searchText: value,
        }),
      ),
    [],
  );

  const summaryTiles = useMemo(() => {
    const scopedCounts = countTasksByStatus(taskScopeForProgress);
    const useBackendDashboard =
      !canViewAllTasks &&
      effectiveScopeFilter === "mine" &&
      asNumber(dashboard?.totalTasks) != null;
    const totalTasks = useBackendDashboard
      ? asNumber(dashboard?.totalTasks) ?? 0
      : scopedCounts.total;
    return [
      {
        key: "total",
        icon: ClipboardList,
        label: t("studentRepo.tasks.statTotal"),
        value: totalTasks,
        hint: t("studentRepo.tasks.summary.totalHint"),
        paletteIndex: 0,
      },
      {
        key: "open",
        icon: CircleDot,
        label: t("studentRepo.tasks.statOpen"),
        value: useBackendDashboard
          ? asNumber(dashboard?.openTasks) ?? 0
          : scopedCounts.open,
        hint: t("studentRepo.tasks.summary.openHint"),
        paletteIndex: 1,
      },
      {
        key: "progress",
        icon: Gauge,
        label: t("studentRepo.tasks.statInProgress"),
        value: useBackendDashboard
          ? asNumber(dashboard?.inProgressTasks) ?? 0
          : scopedCounts.progress,
        hint: t("studentRepo.tasks.summary.progressHint"),
        paletteIndex: 2,
      },
      {
        key: "review",
        icon: ListChecks,
        label: t("studentRepo.tasks.statInReview"),
        value: useBackendDashboard
          ? asNumber(dashboard?.inReviewTasks) ?? 0
          : scopedCounts.review,
        hint: t("studentRepo.tasks.summary.reviewHint"),
        paletteIndex: 3,
      },
      {
        key: "completed",
        icon: CheckCircle2,
        label: t("studentRepo.tasks.statCompleted"),
        value: useBackendDashboard
          ? asNumber(dashboard?.completedTasks) ?? 0
          : scopedCounts.completed,
        hint: t("studentRepo.tasks.summary.completedHint"),
        paletteIndex: 0,
      },
    ];
  }, [canViewAllTasks, dashboard, effectiveScopeFilter, taskScopeForProgress, t]);

  const isLoading = dashboardLoading || milestonesLoading || tasksLoading;

  /** Milestone picked in the task modal — used for `milestoneId` alongside `milestoneNumber`. */
  const draftTaskMilestone = useMemo(() => {
    if (taskDraft.milestoneNumber === "none") return null;
    return (
      milestones.find(
        (m) => String(m?.number) === String(taskDraft.milestoneNumber),
      ) ?? null
    );
  }, [milestones, taskDraft.milestoneNumber]);

  async function submitMilestone() {
    if (!canManageRepoTasks) return;
    await createMilestoneMutation.mutateAsync({
      owner,
      repo,
      title: milestoneDraft.title.trim(),
      description: milestoneDraft.description.trim() || null,
      dueDate: isoFromDateInput(milestoneDraft.dueDate),
      maxScore: intOrNull(milestoneDraft.maxScore),
      passingScore: intOrNull(milestoneDraft.passingScore),
      requiredTasks: intOrNull(milestoneDraft.requiredTasks),
      ...(currentUsername ? { createdBy: currentUsername } : {}),
    });
  }

  async function submitTask() {
    if (!canManageRepoTasks) return;
    await createTaskMutation.mutateAsync({
      owner,
      repo,
      username: currentUsername,
      title: taskDraft.title.trim(),
      description: taskDraft.description.trim() || null,
      milestoneNumber:
        taskDraft.milestoneNumber !== "none"
          ? intOrNull(taskDraft.milestoneNumber)
          : null,
      ...(draftTaskMilestone?.id ? { milestoneId: draftTaskMilestone.id } : {}),
      priority: String(taskDraft.priority || "medium").toUpperCase(),
      labels: asArray(taskDraft.labels).map((item) =>
        String(item).toUpperCase(),
      ),
      dueDate: isoFromDateInput(taskDraft.dueDate),
      estimatedHours: intOrNull(taskDraft.estimatedHours),
      maxScore: intOrNull(taskDraft.maxScore),
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {summaryTiles.map((card) => (
          <RepoOverviewStatCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={card.value}
            hint={card.hint}
            palette={
              REPO_OVERVIEW_STAT_PALETTES[
                card.paletteIndex % REPO_OVERVIEW_STAT_PALETTES.length
              ]
            }
          />
        ))}
      </div>

      <SettingsSectionCard
        icon={MilestoneIcon}
        title={t("studentRepo.tasks.milestones.title")}
        description={t("studentRepo.tasks.milestones.subtitle")}
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="inline-flex rounded-full border border-(--color-light-card-border) bg-light-app-tertiary p-1 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
              {["open", "closed"].map((value) => {
                const active = milestoneState === value;
                const count = milestoneCounts[value] ?? 0;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMilestoneState(value)}
                    className={cx(
                      "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "bg-white text-primary shadow-xs dark:bg-dark-card-bg dark:text-dark-primary"
                        : "text-muted hover:text-secondary dark:text-dark-muted dark:hover:text-dark-secondary",
                    )}
                  >
                    {t(`studentRepo.tasks.milestones.${value}`)} ({count})
                  </button>
                );
              })}
            </div>
            <Button
              icon={<CirclePlus />}
              onClick={() => setCreateMilestoneOpen(true)}
              disabled={!canManageRepoTasks}
            >
              {t("studentRepo.tasks.actions.newMilestone")}
            </Button>
          </div>
        }
        contentClassName="space-y-5"
      >
        {isLoading ? (
          <p className="text-sm text-muted dark:text-dark-muted">
            {t("studentRepo.tasks.loading")}
          </p>
        ) : visibleMilestones.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {visibleMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id ?? milestone.number}
                milestone={milestone}
                locale={i18n.language}
                t={t}
                to={`milestone/${encodeURIComponent(String(milestone.number))}`}
                completingCount={completingCounts.get(Number(milestone.number)) || 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted dark:text-dark-muted">
            {t("studentRepo.tasks.milestones.empty")}
          </p>
        )}
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={ClipboardList}
        title={t("studentRepo.tasks.issues.title")}
        description={t("studentRepo.tasks.issues.subtitle")}
        action={
          <Button
            icon={<CirclePlus />}
            onClick={() => setCreateTaskOpen(true)}
            disabled={!currentUsername || !canManageRepoTasks}
            title={
              !currentUsername
                ? t("studentRepo.tasks.authRequiredUsername")
                : undefined
            }
          >
            {t("studentRepo.tasks.actions.newTask")}
          </Button>
        }
        contentClassName="space-y-5"
      >
        <FilterToolbar
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          milestoneFilter={milestoneFilter}
          setMilestoneFilter={setMilestoneFilter}
          scopeFilter={effectiveScopeFilter}
          setScopeFilter={setScopeFilter}
          statusOptions={statusOptions}
          milestoneOptions={milestoneOptions}
          scopeOptions={scopeOptions}
          t={t}
        />

        <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
          <Filter className="h-3.5 w-3.5" />
          {t("studentRepo.tasks.filters.showing", { count: tasks.length })}
        </div>

        {!isLoading && !tasks.length ? (
          <div className="rounded-2xl border border-dashed border-(--color-light-card-border) bg-light-app-tertiary px-5 py-8 text-center dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-sm font-medium text-primary dark:text-dark-primary">
              {t("studentRepo.tasks.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskListItem
                key={task.id ?? task.number}
                task={task}
                milestoneMap={milestoneMap}
                locale={i18n.language}
                t={t}
                to={`issue/${encodeURIComponent(String(task.number))}`}
                onComplete={handleCompleteTask}
                canComplete={
                  canEditGradingForms ||
                  (currentUsername && currentUsername === String(owner))
                }
              />
            ))}
          </div>
        )}
      </SettingsSectionCard>

      <GlobalModal
        open={createMilestoneOpen}
        setOpen={setCreateMilestoneOpen}
        isClose
        title={t("studentRepo.tasks.createMilestone.title")}
        subtitle={t("studentRepo.tasks.createMilestone.subtitle")}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCreateMilestoneOpen(false)}
              disabled={createMilestoneMutation.isPending}
            >
              {t("studentRepo.pulls.actions.cancel")}
            </Button>
            <Button
              onClick={submitMilestone}
              loading={createMilestoneMutation.isPending}
              disabled={!milestoneDraft.title.trim()}
            >
              {t("studentRepo.tasks.createMilestone.submit")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <CreateFlowSection
            step={1}
            title={t("studentRepo.tasks.createMilestone.sections.identity")}
            subtitle={t(
              "studentRepo.tasks.createMilestone.sections.identityHint",
            )}
          >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
              <Field
                register={{}}
                label={t("studentRepo.tasks.createMilestone.fields.title")}
                value={milestoneDraft.title}
                onChange={(e) =>
                  setMilestoneDraft((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder={t(
                  "studentRepo.tasks.createMilestone.placeholders.title",
                )}
              />
              <Field
                register={{}}
                type="date"
                label={t("studentRepo.tasks.createMilestone.fields.dueDate")}
                value={milestoneDraft.dueDate}
                onChange={(e) =>
                  setMilestoneDraft((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
            <Field
              label={t("studentRepo.tasks.createMilestone.fields.description")}
            >
              <textarea
                value={milestoneDraft.description}
                onChange={(e) =>
                  setMilestoneDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t(
                  "studentRepo.tasks.createMilestone.placeholders.description",
                )}
                rows={5}
                className={MODAL_TEXTAREA}
              />
            </Field>
          </CreateFlowSection>

          <CreateFlowSection
            step={2}
            title={t("studentRepo.tasks.createMilestone.sections.grading")}
            subtitle={t(
              "studentRepo.tasks.createMilestone.sections.gradingHint",
            )}
          >
            <div
              className={cx(
                "grid gap-4",
                canEditGradingForms ? "sm:grid-cols-3" : "sm:grid-cols-1",
              )}
            >
              {canEditGradingForms ? (
                <>
                  <Field
                    register={{}}
                    label={t(
                      "studentRepo.tasks.createMilestone.fields.maxScore",
                    )}
                    type="number"
                    value={milestoneDraft.maxScore}
                    onChange={(e) =>
                      setMilestoneDraft((prev) => ({
                        ...prev,
                        maxScore: e.target.value,
                      }))
                    }
                    placeholder="100"
                  />
                  <Field
                    register={{}}
                    label={t(
                      "studentRepo.tasks.createMilestone.fields.passingScore",
                    )}
                    type="number"
                    value={milestoneDraft.passingScore}
                    onChange={(e) =>
                      setMilestoneDraft((prev) => ({
                        ...prev,
                        passingScore: e.target.value,
                      }))
                    }
                    placeholder="60"
                  />
                </>
              ) : null}
              <Field
                register={{}}
                label={t(
                  "studentRepo.tasks.createMilestone.fields.requiredTasks",
                )}
                type="number"
                value={milestoneDraft.requiredTasks}
                onChange={(e) =>
                  setMilestoneDraft((prev) => ({
                    ...prev,
                    requiredTasks: e.target.value,
                  }))
                }
                placeholder="3"
              />
            </div>
          </CreateFlowSection>
        </div>
      </GlobalModal>

      <GlobalModal
        open={createTaskOpen}
        setOpen={setCreateTaskOpen}
        isClose
        title={t("studentRepo.tasks.createTask.title")}
        subtitle={t("studentRepo.tasks.createTask.subtitle")}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setCreateTaskOpen(false)}
              disabled={createTaskMutation.isPending}
            >
              {t("studentRepo.pulls.actions.cancel")}
            </Button>
            <Button
              onClick={submitTask}
              loading={createTaskMutation.isPending}
              disabled={!taskDraft.title.trim() || !currentUsername}
            >
              {t("studentRepo.tasks.createTask.submit")}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <CreateFlowSection
            step={1}
            title={t("studentRepo.tasks.createTask.sections.identity")}
            subtitle={t("studentRepo.tasks.createTask.sections.identityHint")}
          >
            <Field
              register={{}}
              label={t("studentRepo.tasks.createTask.fields.title")}
              value={taskDraft.title}
              onChange={(e) =>
                setTaskDraft((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder={t("studentRepo.tasks.createTask.placeholders.title")}
            />
            <Field label={t("studentRepo.tasks.createTask.fields.description")}>
              <textarea
                value={taskDraft.description}
                onChange={(e) =>
                  setTaskDraft((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t(
                  "studentRepo.tasks.createTask.placeholders.description",
                )}
                rows={5}
                className={MODAL_TEXTAREA}
              />
            </Field>
          </CreateFlowSection>

          <CreateFlowSection
            step={2}
            title={t("studentRepo.tasks.createTask.sections.planning")}
            subtitle={t("studentRepo.tasks.createTask.sections.planningHint")}
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={t("studentRepo.tasks.createTask.fields.milestone")}>
                <SearchableSelect
                  value={taskDraft.milestoneNumber}
                  onChange={(value) =>
                    setTaskDraft((prev) => ({
                      ...prev,
                      milestoneNumber: value,
                    }))
                  }
                  options={milestoneCreateOptions}
                  placeholder={t(
                    "studentRepo.tasks.filters.milestonePlaceholder",
                  )}
                  searchPlaceholder={t(
                    "studentRepo.tasks.filters.milestoneSearch",
                  )}
                  clearable={false}
                />
              </Field>
              <Select
                label={t("studentRepo.tasks.createTask.fields.priority")}
                value={taskDraft.priority}
                onChange={(value) =>
                  setTaskDraft((prev) => ({ ...prev, priority: value }))
                }
                options={priorityOptions}
              />
            </div>
            <div
              className={cx(
                "grid gap-4",
                canEditGradingForms ? "sm:grid-cols-3" : "sm:grid-cols-2",
              )}
            >
              <Field
                register={{}}
                type="date"
                label={t("studentRepo.tasks.createTask.fields.dueDate")}
                value={taskDraft.dueDate}
                onChange={(e) =>
                  setTaskDraft((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
              <Field
                register={{}}
                type="number"
                label={t("studentRepo.tasks.createTask.fields.estimatedHours")}
                value={taskDraft.estimatedHours}
                onChange={(e) =>
                  setTaskDraft((prev) => ({
                    ...prev,
                    estimatedHours: e.target.value,
                  }))
                }
                placeholder="8"
              />
              {canEditGradingForms ? (
                <Field
                  register={{}}
                  type="number"
                  label={t("studentRepo.tasks.createTask.fields.maxScore")}
                  value={taskDraft.maxScore}
                  onChange={(e) =>
                    setTaskDraft((prev) => ({
                      ...prev,
                      maxScore: e.target.value,
                    }))
                  }
                  placeholder="20"
                />
              ) : null}
            </div>
          </CreateFlowSection>

          <CreateFlowSection
            step={3}
            title={t("studentRepo.tasks.createTask.sections.metadata")}
            subtitle={t("studentRepo.tasks.createTask.sections.metadataHint")}
          >
            <Field label={t("studentRepo.tasks.createTask.fields.labels")}>
              <SearchableSelect
                multiple
                value={taskDraft.labels}
                onChange={(value) =>
                  setTaskDraft((prev) => ({
                    ...prev,
                    labels: Array.isArray(value) ? value : [],
                  }))
                }
                options={labelOptions}
                placeholder={t(
                  "studentRepo.tasks.createTask.placeholders.labels",
                )}
                searchPlaceholder={t(
                  "studentRepo.tasks.createTask.placeholders.searchLabels",
                )}
              />
            </Field>
          </CreateFlowSection>

        </div>
      </GlobalModal>
    </div>
  );
}
