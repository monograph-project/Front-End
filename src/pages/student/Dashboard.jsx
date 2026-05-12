import { eachDayOfInterval, format, startOfDay, subDays } from "date-fns";
import {
  ArrowRight,
  FolderGit2,
} from "lucide-react";
import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Button from "../../components/Button";
import Avatar from "../../components/Avatar";
import AuthorDashboardSummary from "../../components/author/AuthorDashboardSummary";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/themContext";
import { resolveShellBasePath } from "../../lib/roles";
import {
  useFacultyProjectsByStudent,
  useFacultyProjectsByTeacher,
  useLinkedStudentRecord,
  useLinkedTeacherRecord,
  useSemester,
  useVcAccessibleRepositoriesForViewer,
  useVcUserActivity,
} from "../../services/useApi";
const SURFACE_CARD =
  "rounded-md  border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";
const SOFT_PANEL =
  "rounded-md border border-(--color-light-card-border) bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary";
function normalizeListPayload(payload, ...keys) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function getEventDate(event) {
  const raw =
    event?.createdAt ??
    event?.timestamp ??
    event?.time ??
    event?.date ??
    event?.occurredAt ??
    event?.updatedAt;
  const date = raw ? new Date(raw) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function getEventLabel(event) {
  return (
    event?.message ||
    event?.title ||
    event?.action ||
    event?.eventType ||
    event?.type ||
    event?.name ||
    "Repository activity"
  );
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function PanelHeading({ eyebrow, title, body, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-lg font-semibold text-primary dark:text-dark-primary">
          {title}
        </h2>
        {body ? (
          <p className="mt-1 text-sm leading-6 text-secondary dark:text-dark-secondary">
            {body}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

function DashboardTooltip({ active, label, payload, suffix = "" }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-3 py-2 shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
        {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          className="mt-1 flex items-center gap-2 text-xs text-primary dark:text-dark-primary"
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{`${entry.value}${suffix}`}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const chartFillId = useId().replace(/:/g, "");
  const location = useLocation();
  const { user } = useAuth();
  const shellBase = resolveShellBasePath(location.pathname, user?.role);
  const isTeacherShell = shellBase === "/teacher";
  const profilePath =
    shellBase === "/student" || shellBase === "/teacher"
      ? `${shellBase}/profile`
      : `${shellBase}/settings`;
  const { data: student, isFetching: studentFetching } = useLinkedStudentRecord(
    user ?? null,
    {
      notifyOnError: false,
      enabled: Boolean(user) && !isTeacherShell,
    },
  );
  const { data: teacher, isFetching: teacherFetching } = useLinkedTeacherRecord(user ?? null, {
    notifyOnError: false,
    enabled: Boolean(user) && isTeacherShell,
  });
  const linkedRecord = isTeacherShell ? teacher : student;
  const { data: semester } = useSemester(student?.semesterId, {
    enabled: Boolean(!isTeacherShell && student?.semesterId),
    notifyOnError: false,
  });
  const { data: studentProjectsPayload } = useFacultyProjectsByStudent(student?.id, {
    enabled: Boolean(!isTeacherShell && student?.id),
    notifyOnError: false,
  });
  const { data: teacherProjectsPayload } = useFacultyProjectsByTeacher(teacher?.id, {
    enabled: Boolean(isTeacherShell && teacher?.id),
    notifyOnError: false,
  });
  const activityUsername =
    linkedRecord?.username ||
    user?.username ||
    user?.user_name ||
    user?.preferred_username ||
    "";
  const ownerKey =
    linkedRecord?.linkedApplicationUserId ||
    linkedRecord?.applicationUserId ||
    linkedRecord?.gatewayUserId ||
    user?.id ||
    "";
  const { data: repositoriesPayload } = useVcAccessibleRepositoriesForViewer(ownerKey, {
    enabled: Boolean(ownerKey || activityUsername),
    activityUsernameFallback: activityUsername,
    notifyOnError: false,
  });
  const { data: activityPayload } = useVcUserActivity(activityUsername, {
    enabled: Boolean(activityUsername),
    notifyOnError: false,
  });

  const labelName =
    user?.fullName ||
    [linkedRecord?.firstName, linkedRecord?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user?.username ||
    user?.email ||
    "";

  const projects = useMemo(
    () =>
      normalizeListPayload(
        isTeacherShell ? teacherProjectsPayload : studentProjectsPayload,
        "projects",
      ),
    [isTeacherShell, studentProjectsPayload, teacherProjectsPayload],
  );
  const repositories = useMemo(
    () => normalizeListPayload(repositoriesPayload, "repositories", "repos"),
    [repositoriesPayload],
  );
  const activityEvents = useMemo(
    () => normalizeListPayload(activityPayload, "activities", "events"),
    [activityPayload],
  );

  const focusSeries = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
    });
    const end = startOfDay(new Date());
    const start = subDays(end, 6);
    const counts = new Map();
    activityEvents.forEach((event) => {
      const date = getEventDate(event);
      if (!date) return;
      const key = format(startOfDay(date), "yyyy-MM-dd");
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return eachDayOfInterval({ start, end }).map((date) => {
      const key = format(date, "yyyy-MM-dd");
      return {
        key,
        label: formatter.format(date),
        events: counts.get(key) ?? 0,
      };
    });
  }, [activityEvents, i18n.language]);

  const semesterDates = useMemo(() => {
    const startRaw =
      semester?.startDate ||
      semester?.academicYear?.startDate ||
      student?.semester?.startDate ||
      student?.academicYear?.startDate;
    const endRaw =
      semester?.endDate ||
      semester?.academicYear?.endDate ||
      student?.semester?.endDate ||
      student?.academicYear?.endDate;
    const start = startRaw ? new Date(startRaw) : null;
    const end = endRaw ? new Date(endRaw) : null;
    if (
      !start ||
      !end ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start.getTime() >= end.getTime()
    ) {
      return null;
    }
    return { start, end };
  }, [semester, student]);
  const semesterProgress = useMemo(() => {
    if (!semesterDates) {
      return { percent: 0, daysRemaining: null, label: "" };
    }
    const today = startOfDay(new Date());
    const start = startOfDay(semesterDates.start);
    const end = startOfDay(semesterDates.end);
    const total = Math.max(1, end.getTime() - start.getTime());
    const elapsed = today.getTime() - start.getTime();
    const daysRemaining = Math.max(
      0,
      Math.ceil((end.getTime() - today.getTime()) / 86400000),
    );
    return {
      percent: clampPercent((elapsed / total) * 100),
      daysRemaining,
      label: `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`,
    };
  }, [semesterDates]);
  const completionPercent = semesterProgress.percent;
  const isFetching = isTeacherShell ? teacherFetching : studentFetching;
  const linkedState = linkedRecord?.id
    ? t("studentDashboard.snapshot.linked")
    : isFetching
      ? t("studentDashboard.snapshot.loading")
      : t("studentDashboard.snapshot.pending");
  const chartTick =
    theme === "dark"
      ? "var(--color-dark-text-muted)"
      : "var(--color-light-text-muted)";
  const chartGrid =
    theme === "dark" ? "rgba(77, 153, 255, 0.18)" : "rgba(51, 133, 255, 0.16)";
  const chartRingRemainder =
    theme === "dark" ? "rgba(77, 153, 255, 0.16)" : "rgba(51, 133, 255, 0.12)";

  const priorities = [
      {
        title: t("studentDashboard.priorities.items.repositoryTitle"),
        body: `${repositories.length} repositories available from your account.`,
        to: `${shellBase}/workspace`,
      },
      {
        title: t("studentDashboard.priorities.items.reviewTitle"),
        body: `${projects.length} faculty projects are currently linked.`,
        to: `${shellBase}/projects`,
      },
      {
        title: t("studentDashboard.priorities.items.settingsTitle"),
        body: `${activityEvents.length} repository events are available for review.`,
        to: profilePath,
      },
  ];

  const recentActivities = useMemo(
    () =>
      activityEvents
        .slice()
        .sort((a, b) => (getEventDate(b)?.getTime() ?? 0) - (getEventDate(a)?.getTime() ?? 0))
        .slice(0, 4)
        .map((event, index) => {
          const date = getEventDate(event);
          return {
            id: event?.id ?? event?.uuid ?? `${index}-${getEventLabel(event)}`,
            time: date
              ? new Intl.DateTimeFormat(i18n.language, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(date)
              : t("studentDashboard.snapshot.notAvailable"),
            message: getEventLabel(event),
          };
        }),
    [activityEvents, i18n.language, t],
  );

  return (
    <div className="relative flex-1 bg-white p-4 pb-8 dark:bg-dark-card-bg md:p-5">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            <section className={`${SURFACE_CARD} overflow-hidden p-4 md:p-5`}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
                    <Link to={profilePath} className="inline-block">
                      <Avatar src={user?.photoUrl || linkedRecord?.profilePicture} />
                    </Link>
                    {t("studentDashboard.header.eyebrow")}
                  </p>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                    {t("studentDashboard.header.title", { name: labelName })}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary dark:text-dark-secondary">
                    {t("studentDashboard.header.description")}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to={`${shellBase}/workspace`}>
                      <Button
                        type="button"
                        variant="primary"
                        icon={<FolderGit2 strokeWidth={1.9} aria-hidden />}
                        className="gap-2"
                      >
                        {t("studentDashboard.quick.workspace")}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className={`${SOFT_PANEL} p-4`}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    {t("studentDashboard.header.summaryEyebrow")}
                  </p>
                  <div className="mt-4 grid gap-4">
                    <div>
                      <p className="text-xs text-secondary dark:text-dark-secondary">
                        {t("studentDashboard.header.summaryStatus")}
                      </p>
                      <p className="mt-1 text-xl font-semibold text-primary dark:text-dark-primary">
                        {linkedState}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-(--color-light-card-bg) p-3 dark:bg-(--color-dark-card-bg)">
                      <p className="text-xs text-secondary dark:text-dark-secondary">
                        {t("studentDashboard.header.summaryProgram")}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                        {linkedRecord?.department?.name ||
                          (typeof linkedRecord?.department === "string"
                            ? linkedRecord.department
                            : "") ||
                          t("studentDashboard.snapshot.notAvailable")}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-(--color-light-card-bg) p-3 dark:bg-(--color-dark-card-bg)">
                      <p className="text-xs text-secondary dark:text-dark-secondary">
                        {t("studentDashboard.header.summaryCode")}
                      </p>
                      <p className="mt-1 font-mono text-sm text-primary dark:text-dark-primary">
                        {linkedRecord?.code || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-5">
              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <PanelHeading
                  eyebrow={t("studentDashboard.momentum.eyebrow")}
                  title={t("studentDashboard.momentum.title")}
                  body={t("studentDashboard.momentum.subtitle")}
                />
                <div className="mt-5 h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={focusSeries}
                      margin={{ top: 10, right: 8, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={`student-focus-${chartFillId}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--color-chart-blue-primary)"
                            stopOpacity={0.32}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--color-chart-blue-primary)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        vertical={false}
                        stroke={chartGrid}
                        strokeDasharray="4 8"
                      />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{
                          fill: chartTick,
                          fontSize: 11,
                        }}
                      />
                      <YAxis
                        width={34}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{
                          fill: chartTick,
                          fontSize: 11,
                        }}
                      />
                      <Tooltip
                        content={
                          <DashboardTooltip
                            suffix=" events"
                          />
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="var(--color-chart-blue-primary)"
                        strokeWidth={2.5}
                        fill={`url(#student-focus-${chartFillId})`}
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "var(--color-chart-blue-primary)",
                          strokeWidth: 0,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4 md:p-5`}>
              <PanelHeading
                eyebrow={t("studentDashboard.priorities.eyebrow")}
                title={t("studentDashboard.priorities.title")}
                body={t("studentDashboard.priorities.subtitle")}
              />
              <div className="mt-5 grid gap-3">
                {priorities.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className={`${SOFT_PANEL} flex items-start justify-between gap-3 p-4 transition-colors hover:border-(--color-light-input-border-focus) dark:hover:border-(--color-dark-input-border-focus)`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-secondary dark:text-dark-secondary">
                        {item.body}
                      </p>
                    </div>
                    <ArrowRight
                      className="mt-0.5 size-4 shrink-0 text-muted dark:text-dark-muted"
                      strokeWidth={1.9}
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </section>

            <AuthorDashboardSummary />
          </div>

          <aside className="space-y-5">
            <section className={`${SURFACE_CARD} overflow-hidden`}>
              <div className="border-b border-light-divider px-4 py-4 dark:border-dark-divider">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                  {t("studentDashboard.snapshot.eyebrow")}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-primary dark:text-dark-primary">
                  {t("studentDashboard.snapshot.title")}
                </h2>
              </div>
              <div className="space-y-4 p-4">
                <div className={`${SOFT_PANEL} p-4`}>
                  <div className="flex items-center gap-3">
                    <Link to={profilePath} className="block">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-light-card-bg) dark:bg-(--color-dark-card-bg) overflow-hidden">
                        <Avatar src={user?.photoUrl || linkedRecord?.profilePicture} />
                      </span>
                    </Link>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-primary dark:text-dark-primary">
                        {labelName}
                      </p>
                      <p className="text-xs text-secondary dark:text-dark-secondary">
                        {linkedState}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-(--color-light-card-border) px-3 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("studentDashboard.snapshot.studentId")}
                    </p>
                    <p className="mt-1 font-mono text-sm text-primary dark:text-dark-primary">
                      {linkedRecord?.id
                        ? String(linkedRecord.id)
                        : t("studentDashboard.snapshot.notAvailable")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-(--color-light-card-border) px-3 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("studentDashboard.snapshot.department")}
                    </p>
                    <p className="mt-1 text-sm text-primary dark:text-dark-primary">
                      {linkedRecord?.department?.name ||
                        (typeof linkedRecord?.department === "string"
                          ? linkedRecord.department
                          : "") ||
                        t("studentDashboard.snapshot.notAvailable")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-(--color-light-card-border) px-3 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("studentDashboard.snapshot.code")}
                    </p>
                    <p className="mt-1 font-mono text-sm text-primary dark:text-dark-primary">
                      {linkedRecord?.code || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4`}>
              <PanelHeading
                eyebrow={t("studentDashboard.progress.eyebrow")}
                title={t("studentDashboard.progress.title")}
                body={t("studentDashboard.progress.subtitle")}
              />
              <div className="mt-4 grid place-items-center">
                <div className="relative h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: t("studentDashboard.progress.complete"),
                            value: completionPercent,
                          },
                          {
                            name: t("studentDashboard.progress.remaining"),
                            value: 100 - completionPercent,
                          },
                        ]}
                        dataKey="value"
                        innerRadius={62}
                        outerRadius={88}
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                      >
                        <Cell fill="var(--color-chart-blue-primary)" />
                        <Cell fill={chartRingRemainder} />
                      </Pie>
                      <Tooltip content={<DashboardTooltip suffix="%" />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                      {completionPercent}%
                    </span>
                    <span className="mt-1 text-xs text-secondary dark:text-dark-secondary">
                      {t("studentDashboard.progress.complete")}
                    </span>
                    {semesterProgress.daysRemaining != null ? (
                      <span className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                        {semesterProgress.daysRemaining} days left
                      </span>
                    ) : null}
                  </div>
                </div>
                {semesterProgress.label ? (
                  <p className="text-center text-xs text-secondary dark:text-dark-secondary">
                    {semesterProgress.label}
                  </p>
                ) : null}
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4`}>
              <PanelHeading
                eyebrow={t("studentDashboard.actions.eyebrow")}
                title={t("studentDashboard.actions.title")}
              />
              <div className="mt-4">
                <div className="relative ps-6">
                  <span className="absolute inset-y-0 start-[0.42rem] w-px bg-light-divider dark:bg-dark-divider" />
                  <div className="space-y-4">
                    {(recentActivities.length
                      ? recentActivities
                      : [
                          {
                            id: "empty",
                            time: t("studentDashboard.snapshot.notAvailable"),
                            message: "No repository activity has been recorded yet.",
                          },
                        ]).map((item) => (
                      <div key={item.id} className="relative min-w-0">
                        <span className="absolute -start-6 top-1.5 size-2 rounded-full bg-(--color-light-text-muted) dark:bg-(--color-dark-text-muted)" />
                        <p className="text-xs text-secondary dark:text-dark-secondary">
                          {item.time}
                        </p>
                        <p className="mt-1 truncate text-sm text-primary dark:text-dark-primary">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  to={`${shellBase}/notifications`}
                  className="mt-5 inline-flex text-xs font-medium text-(--color-chart-blue-primary) transition-colors hover:underline dark:text-(--color-chart-blue-secondary)"
                >
                  {t("studentDashboard.changelog.view")}
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
