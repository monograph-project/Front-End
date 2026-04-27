import React, { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfWeek,
  format,
  getDate,
  getISODay,
  isSameYear,
  startOfWeek,
  startOfYear,
} from "date-fns";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  GitBranch,
  Info,
  LibraryBig,
  ScrollText,
  Target,
  Users,
} from "lucide-react";
import Select from "../../components/Select";
import {
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { cn } from "../../lib/utils";

const yearOptions = [2026, 2025, 2024, 2023];
const yearSelectOptions = yearOptions.map((year) => ({
  label: String(year),
  value: String(year),
}));
const weekdayTicks = [0, 2, 4];
const weekdayLabels = {
  0: "Mon",
  2: "Wed",
  4: "Fri",
};
const heatColors = [
  "var(--color-shell)",
  "rgba(22, 163, 74, 0.18)",
  "rgba(22, 163, 74, 0.36)",
  "rgba(22, 163, 74, 0.62)",
  "var(--color-success)",
];

const contributors = [
  {
    id: 1,
    name: "Amina Rahimi",
    role: "Frontend Developer",
    initials: "AR",
    completion: 91,
    tasksDone: 16,
    activeTasks: 2,
    reviewScore: 94,
    commits: 84,
    docsTouched: 6,
    note: "Strong UI delivery with consistent daily progress.",
    seed: 14,
  },
  {
    id: 2,
    name: "Bilal Sadiqi",
    role: "Backend Developer",
    initials: "BS",
    completion: 84,
    tasksDone: 14,
    activeTasks: 3,
    reviewScore: 88,
    commits: 67,
    docsTouched: 4,
    note: "Stable API work with good mid-month activity.",
    seed: 21,
  },
  {
    id: 3,
    name: "Farzana Noori",
    role: "QA Engineer",
    initials: "FN",
    completion: 76,
    tasksDone: 11,
    activeTasks: 4,
    reviewScore: 81,
    commits: 39,
    docsTouched: 8,
    note: "Testing activity is improving but still uneven.",
    seed: 9,
  },
  {
    id: 4,
    name: "Hamid Popal",
    role: "Project Coordinator",
    initials: "HP",
    completion: 69,
    tasksDone: 9,
    activeTasks: 5,
    reviewScore: 76,
    commits: 28,
    docsTouched: 11,
    note: "Coordination work is steady; execution follow-up needs focus.",
    seed: 6,
  },
];

const milestones = [
  {
    title: "Research framing approved",
    owner: "Faculty board",
    date: "2026-01-18",
    status: "done",
  },
  {
    title: "Literature review final draft",
    owner: "Research team",
    date: "2026-03-02",
    status: "done",
  },
  {
    title: "Prototype dashboard validation",
    owner: "Design and QA",
    date: "2026-04-28",
    status: "active",
  },
  {
    title: "Proposal defense preparation",
    owner: "Lead supervisor",
    date: "2026-05-12",
    status: "upcoming",
  },
];

const documentSections = [
  {
    key: "introduction",
    title: "Introduction",
    description:
      "Defines the problem space, the institutional context, and the reason the project matters now.",
    status: "Ready",
  },
  {
    key: "literature",
    title: "Literature review",
    description:
      "Summarizes related research, identifies gaps, and positions this work against prior studies.",
    status: "Updated",
  },
  {
    key: "objectives",
    title: "Objectives and questions",
    description:
      "Lists the core research objectives, working hypotheses, and measurable evaluation criteria.",
    status: "Ready",
  },
  {
    key: "methodology",
    title: "Methodology",
    description:
      "Covers data sources, implementation process, validation approach, and ethical controls.",
    status: "In review",
  },
  {
    key: "timeline",
    title: "Timeline and delivery plan",
    description:
      "Breaks down milestones, task ownership, and the expected order of research and development work.",
    status: "Ready",
  },
];

const proposalTabs = [
  { id: "overview", label: "Overview" },
  { id: "proposal", label: "Proposal" },
  { id: "documents", label: "Documents" },
  { id: "activity", label: "Activity" },
];

const proposalSections = [
  {
    title: "Introduction",
    body:
      "This project redesigns the faculty project workspace around contribution visibility, document structure, and academic project governance. The goal is to make research work easier to supervise and easier to evaluate.",
  },
  {
    title: "Problem statement",
    body:
      "Current project tracking focuses on progress percentages but hides the real work: document revisions, proposal maturity, research milestones, and contributor consistency across time.",
  },
  {
    title: "Objectives",
    body:
      "Build a workspace that combines project status, contribution tracking, proposal sections, and document readiness in one reviewable admin surface.",
  },
  {
    title: "Expected outcome",
    body:
      "A GitHub-like research workspace where admins and supervisors can review both implementation progress and the quality of academic documentation.",
  },
];

const repositoryActivity = [
  {
    file: "proposal/introduction.md",
    change: "Expanded background and faculty context",
    author: "Amina Rahimi",
    time: "2 hours ago",
  },
  {
    file: "proposal/literature-review.md",
    change: "Added four new references and comparison notes",
    author: "Bilal Sadiqi",
    time: "Yesterday",
  },
  {
    file: "docs/methodology.md",
    change: "Revised evaluation flow and sample selection",
    author: "Farzana Noori",
    time: "2 days ago",
  },
  {
    file: "planning/timeline.xlsx",
    change: "Updated milestone ownership and delivery dates",
    author: "Hamid Popal",
    time: "3 days ago",
  },
];

const getContributionValue = (date, contributor, year) => {
  const isoDay = getISODay(date);
  const seasonalShift = year % 9;
  const base =
    (getDate(date) * (contributor.id + 3) + contributor.seed + seasonalShift) %
    9;
  const weekdayBonus = isoDay <= 5 ? 1 : 0;
  const pulseBoost = getDate(date) % 11 === 0 ? 2 : 0;
  return Math.max(0, Math.min(10, base + weekdayBonus + pulseBoost - 1));
};

const getContributionLevel = (value) => {
  if (value === 0) return 0;
  if (value <= 2) return 1;
  if (value <= 4) return 2;
  if (value <= 7) return 3;
  return 4;
};

const buildYearCalendarData = (year, contributor) => {
  const yearDate = new Date(year, 0, 1);
  const yearStart = startOfYear(yearDate);
  const yearEnd = new Date(year, 11, 31);
  const calendarStart = startOfWeek(yearStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(yearEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const monthLabels = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    .map((monthDate) => ({
      value: Math.floor(
        eachDayOfInterval({
          start: calendarStart,
          end: monthDate,
        }).length / 7,
      ),
      label: format(monthDate, "MMM"),
    }))
    .filter(
      (item, index, arr) =>
        arr.findIndex((value) => value.value === item.value) === index,
    );

  const points = allDays.map((date, index) => {
    const weekIndex = Math.floor(index / 7);
    const weekday = getISODay(date) - 1;
    const inYear = isSameYear(date, yearDate);
    const contributionCount = inYear
      ? getContributionValue(date, contributor, year)
      : 0;
    const contributionLevel = getContributionLevel(contributionCount);

    return {
      x: weekIndex,
      y: weekday,
      z: 24,
      dateLabel: format(date, "EEEE, MMMM d, yyyy"),
      inYear,
      contributionCount,
      contributionLevel,
    };
  });

  return { points, monthLabels };
};

const getSpacedMonthLabels = (labels, minGap = 4) =>
  labels.filter((label, index) => {
    if (index === 0) return true;
    return label.value - labels[index - 1].value >= minGap;
  });

function ContributionCell({ cx, cy, payload }) {
  return (
    <rect
      x={cx - 4}
      y={cy - 4}
      rx={2}
      ry={2}
      width={8}
      height={8}
      fill={
        payload.inYear
          ? heatColors[payload.contributionLevel]
          : "var(--color-shell)"
      }
      stroke="var(--color-default)"
      opacity={payload.inYear ? 1 : 0.42}
    />
  );
}

function ContributionTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  if (!point.inYear) return null;

  return (
    <div className="rounded-md border border-default bg-card px-3 py-2 shadow-card dark:border-dark-default dark:bg-dark-card">
      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
        {point.contributionCount} contribution
        {point.contributionCount === 1 ? "" : "s"}
      </p>
      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
        {point.dateLabel}
      </p>
    </div>
  );
}

function SectionCard({ icon: Icon, title, value, note }) {
  return (
    <div className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
            {note}
          </p>
        </div>
        <div className="rounded-md bg-shell p-3 dark:bg-dark-shell">
          <Icon className="h-5 w-5 text-primary dark:text-dark-primary" />
        </div>
      </div>
    </div>
  );
}

function ProjectWorkspace() {
  const [selectedContributorId, setSelectedContributorId] = useState(
    contributors[0].id,
  );
  const [selectedYear, setSelectedYear] = useState(2026);
  const [activeTab, setActiveTab] = useState("overview");

  const selectedContributor =
    contributors.find((item) => item.id === selectedContributorId) ||
    contributors[0];

  const chartData = useMemo(
    () => buildYearCalendarData(selectedYear, selectedContributor),
    [selectedContributor, selectedYear],
  );
  const spacedMonthLabels = useMemo(
    () => getSpacedMonthLabels(chartData.monthLabels, 4),
    [chartData.monthLabels],
  );

  const totalContributions = chartData.points.reduce(
    (sum, point) => sum + point.contributionCount,
    0,
  );

  return (
    <div className="flex min-h-screen flex-1 overflow-y-auto bg-shell p-4 dark:bg-dark-shell md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-md border border-default bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:border-dark-default dark:bg-dark-shell dark:text-dark-muted">
                <GitBranch className="h-3.5 w-3.5" />
                Project workspace
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary">
                Faculty Portal Research Workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary dark:text-dark-secondary">
                A full academic project view that combines implementation
                activity, proposal structure, document readiness, and milestone
                tracking in one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:min-w-[360px]">
              <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                <p className="text-xs text-muted dark:text-dark-muted">
                  Project phase
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  Validation and proposal review
                </p>
              </div>
              <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                <p className="text-xs text-muted dark:text-dark-muted">
                  Completion
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  78%
                </p>
              </div>
              <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                <p className="text-xs text-muted dark:text-dark-muted">
                  Lead supervisor
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  Dr. Sarah Johnson
                </p>
              </div>
              <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                <p className="text-xs text-muted dark:text-dark-muted">
                  Repository sync
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  14 minutes ago
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SectionCard
            icon={FolderKanban}
            title="Active tasks"
            value="12"
            note="Current implementation, writing, and review tasks in progress."
          />
          <SectionCard
            icon={FileText}
            title="Documents tracked"
            value="18"
            note="Proposal files, methodology notes, appendices, and planning sheets."
          />
          <SectionCard
            icon={Users}
            title="Team members"
            value={contributors.length}
            note="Cross-functional contributors across engineering, QA, and coordination."
          />
          <SectionCard
            icon={CheckCircle2}
            title="Milestones met"
            value="2/4"
            note="Two milestones are complete and two are still active or upcoming."
          />
        </section>

        <section className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
          <div className="flex flex-wrap gap-2">
            {proposalTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "border border-default bg-shell text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:hover:bg-dark-card-2",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {activeTab === "overview" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-6">
              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Research scope
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-secondary dark:text-dark-secondary">
                  This project restructures academic project supervision around
                  contribution visibility, document maturity, and proposal
                  completeness. The workspace should help faculty monitor
                  progress not only by percentage, but by how the proposal,
                  methodology, and literature review evolve over time.
                </p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      Main objective
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      Build a GitHub-like research workspace with document
                      versioning, contribution maps, and proposal review.
                    </p>
                  </div>
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      Current focus
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      Finalizing validation workflows, improving academic
                      sections, and preparing the proposal for defense review.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Proposal sections
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {documentSections.map((section) => (
                    <div
                      key={section.key}
                      className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-primary dark:text-dark-primary">
                          {section.title}
                        </p>
                        <span className="rounded-md border border-default bg-card px-2.5 py-1 text-xs font-medium text-secondary dark:border-dark-default dark:bg-dark-card dark:text-dark-secondary">
                          {section.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                        {section.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Milestones
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.title}
                      className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-primary dark:text-dark-primary">
                          {milestone.title}
                        </p>
                        <span className="rounded-md border border-default bg-card px-2.5 py-1 text-xs font-medium text-secondary dark:border-dark-default dark:bg-dark-card dark:text-dark-secondary">
                          {milestone.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                        Owner: {milestone.owner}
                      </p>
                      <p className="mt-1 text-sm text-muted dark:text-dark-muted">
                        Due: {format(new Date(milestone.date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <LibraryBig className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Document readiness
                  </h2>
                </div>
                <p className="mt-4 text-sm leading-7 text-secondary dark:text-dark-secondary">
                  Proposal structure is nearly complete. Methodology remains the
                  main section under active review, while introduction,
                  literature review, objectives, and timeline are ready for
                  supervisory reading.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "proposal" && (
          <section className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary dark:text-dark-primary" />
              <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                Proposal view
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {proposalSections.map((section) => (
                <div
                  key={section.title}
                  className="rounded-md border border-default bg-shell p-5 dark:border-dark-default dark:bg-dark-shell"
                >
                  <h3 className="text-base font-semibold text-primary dark:text-dark-primary">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-secondary dark:text-dark-secondary">
                    {section.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "documents" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary dark:text-dark-primary" />
                <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                  Research documents
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {documentSections.map((section) => (
                  <div
                    key={section.key}
                    className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
                  >
                    <p className="font-semibold text-primary dark:text-dark-primary">
                      {section.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      {section.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary dark:text-dark-primary" />
                <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                  Recent document changes
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {repositoryActivity.map((item) => (
                  <div
                    key={item.file}
                    className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
                  >
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      {item.file}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      {item.change}
                    </p>
                    <p className="mt-2 text-xs text-muted dark:text-dark-muted">
                      {item.author} • {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === "activity" && (
          <section className="space-y-6">
            <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-md border border-default bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted dark:border-dark-default dark:bg-dark-shell dark:text-dark-muted">
                      <GitBranch className="h-3.5 w-3.5" />
                      Contribution activity
                    </div>
                    <p className="mt-4 text-2xl font-bold text-primary dark:text-dark-primary">
                      Team activity and document change rhythm
                    </p>
                    <p className="mt-2 text-sm leading-7 text-secondary dark:text-dark-secondary">
                      Member selection now lives above the chart, and the
                      horizontal scroll is isolated to the chart surface only so
                      the rest of the page stays fixed.
                    </p>
                  </div>

                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell lg:max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted dark:text-dark-muted">
                      Selected cycle
                    </p>
                    <div className="mt-3">
                      <Select
                        value={String(selectedYear)}
                        onChange={(value) => setSelectedYear(Number(value))}
                        options={yearSelectOptions}
                        placeholder="Select year"
                      />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      Switch years without affecting the rest of the workspace.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {contributors.map((person) => {
                    const isActive = person.id === selectedContributor.id;

                    return (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => setSelectedContributorId(person.id)}
                        className={cn(
                          "rounded-md border p-4 text-left transition-all duration-200",
                          isActive
                            ? "border-primary bg-shell shadow-[0_0_0_1px_rgba(10,10,10,0.06)] dark:border-dark-primary dark:bg-dark-shell"
                            : "border-default bg-card hover:border-primary/20 hover:bg-shell dark:border-dark-default dark:bg-dark-card dark:hover:border-dark-primary/30 dark:hover:bg-dark-shell",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white dark:bg-dark-primary dark:text-dark-shell">
                            {person.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primary dark:text-dark-primary">
                              {person.name}
                            </p>
                            <p className="text-xs text-muted dark:text-dark-muted">
                              {person.role}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-md border border-default bg-card px-2 py-2 text-center dark:border-dark-default dark:bg-dark-card">
                            <p className="text-[11px] text-muted dark:text-dark-muted">
                              Progress
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                              {person.completion}%
                            </p>
                          </div>
                          <div className="rounded-md border border-default bg-card px-2 py-2 text-center dark:border-dark-default dark:bg-dark-card">
                            <p className="text-[11px] text-muted dark:text-dark-muted">
                              Tasks
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                              {person.tasksDone}
                            </p>
                          </div>
                          <div className="rounded-md border border-default bg-card px-2 py-2 text-center dark:border-dark-default dark:bg-dark-card">
                            <p className="text-[11px] text-muted dark:text-dark-muted">
                              Docs
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                              {person.docsTouched}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Selected member
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                      {selectedContributor.name}
                    </p>
                  </div>
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Contributions
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {totalContributions}
                    </p>
                  </div>
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Commits
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {selectedContributor.commits}
                    </p>
                  </div>
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Review score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {selectedContributor.reviewScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-default bg-card dark:border-dark-default dark:bg-dark-card">
              <div className="flex flex-col gap-4 border-b border-default px-6 py-5 dark:border-dark-default lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary dark:text-dark-primary">
                    {totalContributions} contributions in {selectedYear}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {selectedContributor.name} contribution history for the full
                    year. Hover a square to inspect the exact day and count.
                  </p>
                </div>
                <div className="rounded-md border border-default bg-shell px-4 py-3 dark:border-dark-default dark:bg-dark-shell lg:max-w-sm">
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Contributor note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-primary dark:text-dark-primary">
                    {selectedContributor.note}
                  </p>
                </div>
              </div>

              <div className="px-6 py-5">
                <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-default pb-4 dark:border-dark-default">
                    <div>
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        Yearly contribution map
                      </p>
                      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                        Only this chart area scrolls horizontally.
                      </p>
                    </div>
                    <div className="rounded-md border border-default bg-card px-3 py-2 text-xs text-secondary dark:border-dark-default dark:bg-dark-card dark:text-dark-secondary">
                      Scroll sideways inside the chart if needed
                    </div>
                  </div>

                  <div className="mt-4 max-w-full overflow-hidden">
                    <div className="overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 [&_*:focus]:outline-none [&_*:focus-visible]:outline-none">
                      <div className="h-[230px] min-w-[980px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart
                            margin={{ top: 22, right: 18, bottom: 28, left: 10 }}
                          >
                            <XAxis
                              type="number"
                              dataKey="x"
                              ticks={spacedMonthLabels.map((item) => item.value)}
                              tickFormatter={(value) =>
                                spacedMonthLabels.find(
                                  (item) => item.value === value,
                                )?.label || ""
                              }
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "#999999" }}
                              height={28}
                              orientation="top"
                              interval={0}
                              tickMargin={6}
                            />
                            <YAxis
                              type="number"
                              dataKey="y"
                              domain={[0, 6]}
                              ticks={weekdayTicks}
                              reversed
                              tickFormatter={(value) => weekdayLabels[value]}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 11, fill: "#999999" }}
                              width={42}
                            />
                            <ZAxis type="number" dataKey="z" range={[24, 24]} />
                            <Tooltip
                              cursor={false}
                              content={<ContributionTooltip />}
                              wrapperStyle={{ outline: "none" }}
                            />
                            <Scatter
                              data={chartData.points}
                              shape={<ContributionCell />}
                            />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted dark:text-dark-muted">
                    <p>Less consistent</p>
                    <div className="flex items-center gap-2">
                      {heatColors.map((color, index) => (
                        <span
                          key={`${color}-${index}`}
                          className="h-4 w-4 rounded-md border border-default dark:border-dark-default"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p>More consistent</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted dark:text-dark-muted" />
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  Activity interpretation
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                Each block represents one day of work. The contribution view can
                reflect code commits, proposal edits, document updates, and task
                reviews tracked across the project repository.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProjectWorkspace;
