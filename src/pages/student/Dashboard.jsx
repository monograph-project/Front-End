import { useId, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpenText,
  CheckCircle2,
  Clock3,
  FolderGit2,
  GraduationCap,
  Layers3,
  Settings as SettingsIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  eachDayOfInterval,
  format,
  startOfDay,
  startOfWeek,
  subDays,
} from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useStudentActivityEpoch } from "../../context/StudentActivityContext";
import { useTheme } from "../../context/themContext";
import Button from "../../components/Button";
import { useLinkedStudentRecord } from "../../services/useApi";
import { readEngagementDailyMs } from "../../lib/studentEngagementStorage";

const SURFACE_CARD =
  "rounded-[1.5rem] border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";
const SOFT_PANEL =
  "rounded-[1.25rem] border border-(--color-light-card-border) bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary";
const CHART_COLORS = [
  "var(--color-chart-blue-primary)",
  "var(--color-chart-blue-secondary)",
  "var(--color-chart-warning)",
];

function minutesFromMs(ms) {
  return Math.round(ms / 60000);
}

function StatCard({ icon, title, value, hint }) {
  const Glyph = icon;

  return (
    <div className={`${SURFACE_CARD} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {title}
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-1 text-xs leading-5 text-secondary dark:text-dark-secondary">
            {hint}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary text-(--color-chart-blue-primary) dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-(--color-chart-blue-secondary)">
          <Glyph className="size-5" strokeWidth={1.9} aria-hidden />
        </span>
      </div>
    </div>
  );
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

function QuickLink({ to, icon, title, body }) {
  const Glyph = icon;

  return (
    <Link
      to={to}
      className={`${SOFT_PANEL} flex items-start justify-between gap-3 p-4 transition-colors hover:border-(--color-light-input-border-focus) dark:hover:border-(--color-dark-input-border-focus)`}
    >
      <div>
        <p className="text-sm font-semibold text-primary dark:text-dark-primary">
          {title}
        </p>
        <p className="mt-1 text-xs leading-5 text-secondary dark:text-dark-secondary">
          {body}
        </p>
      </div>
      <span className="mt-0.5 text-muted dark:text-dark-muted">
        <Glyph className="size-4" strokeWidth={1.9} aria-hidden />
      </span>
    </Link>
  );
}

export default function StudentDashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  useStudentActivityEpoch();
  const chartFillId = useId().replace(/:/g, "");

  const { data: student, isFetching } = useLinkedStudentRecord(user ?? null, {
    notifyOnError: false,
    enabled: Boolean(user),
  });

  const labelName =
    user?.fullName ||
    [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() ||
    user?.username ||
    user?.email ||
    "";

  const dailyMs = readEngagementDailyMs();

  const focusSeries = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, {
      weekday: "short",
    });
    const end = startOfDay(new Date());
    const start = subDays(end, 6);

    return eachDayOfInterval({ start, end }).map((date) => {
      const key = format(date, "yyyy-MM-dd");
      return {
        key,
        label: formatter.format(date),
        minutes: minutesFromMs(dailyMs[key] ?? 0),
      };
    });
  }, [dailyMs, i18n.language]);

  const weeklySeries = useMemo(() => {
    const end = startOfDay(new Date());
    const start = subDays(end, 27);
    const buckets = {};

    eachDayOfInterval({ start, end }).forEach((date) => {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const key = format(weekStart, "yyyy-MM-dd");
      buckets[key] = (buckets[key] ?? 0) + (dailyMs[format(date, "yyyy-MM-dd")] ?? 0);
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4)
      .map(([, value], index) => ({
        label: t("studentDashboard.performance.weekLabel", {
          count: index + 1,
        }),
        minutes: minutesFromMs(value),
      }));
  }, [dailyMs, t]);

  const performanceSeries = useMemo(
    () => [
      { name: t("studentDashboard.performance.courseLabel", { count: 1 }), value: 84 },
      { name: t("studentDashboard.performance.courseLabel", { count: 2 }), value: 91 },
      { name: t("studentDashboard.performance.courseLabel", { count: 3 }), value: 76 },
      { name: t("studentDashboard.performance.courseLabel", { count: 4 }), value: 88 },
      { name: t("studentDashboard.performance.courseLabel", { count: 5 }), value: 94 },
    ],
    [t],
  );

  const distributionSeries = useMemo(
    () => [
      {
        name: t("studentDashboard.distribution.focus"),
        value: 46,
      },
      {
        name: t("studentDashboard.distribution.collaboration"),
        value: 32,
      },
      {
        name: t("studentDashboard.distribution.review"),
        value: 22,
      },
    ],
    [t],
  );

  const totalFocusMinutes = focusSeries.reduce(
    (sum, item) => sum + item.minutes,
    0,
  );
  const activeDays = focusSeries.filter((item) => item.minutes > 0).length;
  const completionPercent = student?.id ? 78 : 46;
  const linkedState = student?.id
    ? t("studentDashboard.snapshot.linked")
    : isFetching
      ? t("studentDashboard.snapshot.loading")
      : t("studentDashboard.snapshot.pending");
  const chartTick = theme === "dark"
    ? "var(--color-dark-text-muted)"
    : "var(--color-light-text-muted)";
  const chartGrid = theme === "dark"
    ? "rgba(77, 153, 255, 0.18)"
    : "rgba(51, 133, 255, 0.16)";
  const chartRingRemainder = theme === "dark"
    ? "rgba(77, 153, 255, 0.16)"
    : "rgba(51, 133, 255, 0.12)";

  const metrics = [
    {
      icon: Clock3,
      title: t("studentDashboard.metrics.studyTime"),
      value: `${totalFocusMinutes}`,
      hint: t("studentDashboard.metrics.studyTimeHint"),
    },
    {
      icon: CheckCircle2,
      title: t("studentDashboard.metrics.activeDays"),
      value: `${activeDays}/7`,
      hint: t("studentDashboard.metrics.activeDaysHint"),
    },
    {
      icon: FolderGit2,
      title: t("studentDashboard.metrics.workspace"),
      value: "04",
      hint: t("studentDashboard.metrics.workspaceHint"),
    },
    {
      icon: BookOpenText,
      title: t("studentDashboard.metrics.deadlines"),
      value: "03",
      hint: t("studentDashboard.metrics.deadlinesHint"),
    },
  ];

  const priorities = [
    {
      title: t("studentDashboard.priorities.items.repositoryTitle"),
      body: t("studentDashboard.priorities.items.repositoryBody"),
      to: "/student/workspace",
    },
    {
      title: t("studentDashboard.priorities.items.reviewTitle"),
      body: t("studentDashboard.priorities.items.reviewBody"),
      to: "/student/notifications",
    },
    {
      title: t("studentDashboard.priorities.items.settingsTitle"),
      body: t("studentDashboard.priorities.items.settingsBody"),
      to: "/student/settings",
    },
  ];

  const agenda = [
    {
      day: t("studentDashboard.agenda.days.today"),
      title: t("studentDashboard.agenda.items.standupTitle"),
      time: t("studentDashboard.agenda.items.standupTime"),
    },
    {
      day: t("studentDashboard.agenda.days.tomorrow"),
      title: t("studentDashboard.agenda.items.commitTitle"),
      time: t("studentDashboard.agenda.items.commitTime"),
    },
    {
      day: t("studentDashboard.agenda.days.week"),
      title: t("studentDashboard.agenda.items.reportTitle"),
      time: t("studentDashboard.agenda.items.reportTime"),
    },
  ];

  return (
    <div className="relative flex-1 bg-light-app-bg p-4 pb-8 dark:bg-dark-card-bg md:p-5">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <section className={`${SURFACE_CARD} overflow-hidden p-4 md:p-5`}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem]">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
                    <GraduationCap
                      className="size-4 shrink-0"
                      strokeWidth={1.9}
                      aria-hidden
                    />
                    {t("studentDashboard.header.eyebrow")}
                  </p>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-primary dark:text-dark-primary">
                    {t("studentDashboard.header.title", { name: labelName })}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary dark:text-dark-secondary">
                    {t("studentDashboard.header.description")}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to="/student/workspace">
                      <Button
                        type="button"
                        variant="primary"
                        icon={<FolderGit2 strokeWidth={1.9} aria-hidden />}
                        className="gap-2"
                      >
                        {t("studentDashboard.quick.workspace")}
                      </Button>
                    </Link>
                    <Link to="/student/notifications">
                      <Button
                        type="button"
                        variant="secondary"
                        icon={<Bell strokeWidth={1.9} aria-hidden />}
                        className="gap-2"
                      >
                        {t("studentDashboard.quick.notifications")}
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
                        {student?.department || t("studentDashboard.snapshot.notAvailable")}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-(--color-light-card-bg) p-3 dark:bg-(--color-dark-card-bg)">
                      <p className="text-xs text-secondary dark:text-dark-secondary">
                        {t("studentDashboard.header.summaryCode")}
                      </p>
                      <p className="mt-1 font-mono text-sm text-primary dark:text-dark-primary">
                        {student?.code || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {metrics.map((item) => (
                <StatCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  value={item.value}
                  hint={item.hint}
                />
              ))}
            </section>

            <section className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,1fr)]">
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
                        content={<DashboardTooltip suffix={` ${t("studentDashboard.units.minutes")}`} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
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

              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <PanelHeading
                  eyebrow={t("studentDashboard.distribution.eyebrow")}
                  title={t("studentDashboard.distribution.title")}
                  body={t("studentDashboard.distribution.subtitle")}
                />
                <div className="mt-4 grid gap-4">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionSeries}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={54}
                          outerRadius={80}
                          paddingAngle={4}
                          stroke="none"
                        >
                          {distributionSeries.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DashboardTooltip suffix="%" />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid gap-2">
                    {distributionSeries.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-2xl bg-light-app-tertiary px-3 py-2.5 dark:bg-dark-app-tertiary"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <span className="text-sm text-primary dark:text-dark-primary">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-primary dark:text-dark-primary">
                          {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4 md:p-5`}>
              <PanelHeading
                eyebrow={t("studentDashboard.performance.eyebrow")}
                title={t("studentDashboard.performance.title")}
                body={t("studentDashboard.performance.subtitle")}
              />
              <div className="mt-5 h-72 w-full min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceSeries}
                    margin={{ top: 8, right: 8, left: -6, bottom: 0 }}
                    barSize={30}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke={chartGrid}
                      strokeDasharray="4 8"
                    />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tick={{
                        fill: chartTick,
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      tick={{
                        fill: chartTick,
                        fontSize: 11,
                      }}
                    />
                    <Tooltip content={<DashboardTooltip suffix="%" />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-chart-blue-primary)"
                      radius={[12, 12, 4, 4]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {weeklySeries.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-primary dark:text-dark-primary">
                      {item.minutes}
                    </p>
                    <p className="text-xs text-secondary dark:text-dark-secondary">
                      {t("studentDashboard.units.minutes")}
                    </p>
                  </div>
                ))}
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
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--color-light-card-bg) text-(--color-chart-blue-primary) dark:bg-(--color-dark-card-bg) dark:text-(--color-chart-blue-secondary)">
                      <GraduationCap
                        className="size-7"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    </span>
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
                      {student?.id ? String(student.id) : t("studentDashboard.snapshot.notAvailable")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-(--color-light-card-border) px-3 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("studentDashboard.snapshot.department")}
                    </p>
                    <p className="mt-1 text-sm text-primary dark:text-dark-primary">
                      {student?.department || t("studentDashboard.snapshot.notAvailable")}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-(--color-light-card-border) px-3 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("studentDashboard.snapshot.code")}
                    </p>
                    <p className="mt-1 font-mono text-sm text-primary dark:text-dark-primary">
                      {student?.code || "—"}
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
                  </div>
                </div>
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4`}>
              <PanelHeading
                eyebrow={t("studentDashboard.actions.eyebrow")}
                title={t("studentDashboard.actions.title")}
              />
              <div className="mt-4 grid gap-3">
                <QuickLink
                  to="/student/workspace"
                  icon={FolderGit2}
                  title={t("studentDashboard.cards.workspaceTitle")}
                  body={t("studentDashboard.cards.workspaceBody")}
                />
                <QuickLink
                  to="/student/notifications"
                  icon={Bell}
                  title={t("studentDashboard.actions.notificationsTitle")}
                  body={t("studentDashboard.actions.notificationsBody")}
                />
                <QuickLink
                  to="/student/settings"
                  icon={SettingsIcon}
                  title={t("studentDashboard.cards.settingsTitle")}
                  body={t("studentDashboard.cards.settingsBody")}
                />
              </div>
            </section>

            <section className={`${SURFACE_CARD} p-4`}>
              <PanelHeading
                eyebrow={t("studentDashboard.agenda.eyebrow")}
                title={t("studentDashboard.agenda.title")}
                body={t("studentDashboard.agenda.subtitle")}
              />
              <div className="mt-4 grid gap-3">
                {agenda.map((item) => (
                  <div
                    key={item.title}
                    className={`${SOFT_PANEL} flex items-start gap-3 p-4`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-(--color-light-card-bg) text-(--color-chart-blue-primary) dark:bg-(--color-dark-card-bg) dark:text-(--color-chart-blue-secondary)">
                      <Layers3 className="size-4" strokeWidth={1.9} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                        {item.day}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-secondary dark:text-dark-secondary">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
