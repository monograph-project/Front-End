import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import {
  eachDayOfInterval,
  endOfWeek,
  endOfYear,
  format,
  startOfWeek,
  startOfYear,
} from "date-fns";
import {
  Activity,
  ArrowLeft,
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
import { Link } from "react-router-dom";
import Select from "../../components/Select";
import TableToolbar from "../../components/TableToolbar";
import { cn } from "../../lib/utils";

/** GitHub-style green ramp using theme chart success (see `index.css`). */
const HEAT_GREEN_FILLS = [
  "var(--color-light-app-tertiary)",
  "color-mix(in srgb, var(--color-chart-success) 14%, transparent)",
  "color-mix(in srgb, var(--color-chart-success) 28%, transparent)",
  "color-mix(in srgb, var(--color-chart-success) 45%, transparent)",
  "color-mix(in srgb, var(--color-chart-success) 62%, transparent)",
  "color-mix(in srgb, var(--color-chart-success) 78%, transparent)",
  "var(--color-chart-success)",
];

const WEEKDAY_ROW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function heatLevelIndex(count, max) {
  if (max <= 0 || count <= 0) return 0;
  const t = count / max;
  return Math.min(
    HEAT_GREEN_FILLS.length - 1,
    Math.floor(t * HEAT_GREEN_FILLS.length),
  );
}

/** Deterministic per-day count for this repository + contributor (demo until API exists). */
function repoDayContributionCount(owner, repo, contributorId, seed, day) {
  const iso = format(day, "yyyy-MM-dd");
  const key = `${owner}|${repo}|${contributorId}|${iso}|${seed}`;
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 13;
}

function buildRepoContributionYear(owner, repo, contributorId, seed, year) {
  const ys = startOfYear(new Date(year, 0, 1));
  const ye = endOfYear(new Date(year, 0, 1));
  const gridStart = startOfWeek(ys, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(ye, { weekStartsOn: 0 });
  const allDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks = [];
  for (let i = 0; i < allDays.length; i += 7) {
    const slice = allDays.slice(i, i + 7);
    if (slice.length === 7) weeks.push(slice);
  }

  const inYear = (d) => d.getFullYear() === year;
  let maxCount = 1;
  let totalContributions = 0;

  const weekColumns = weeks.map((week) =>
    week.map((day) => {
      if (!inYear(day)) {
        return { day, count: 0, inYear: false };
      }
      const count = repoDayContributionCount(
        owner,
        repo,
        contributorId,
        seed,
        day,
      );
      if (count > maxCount) maxCount = count;
      totalContributions += count;
      return { day, count, inYear: true };
    }),
  );

  return { weekColumns, maxCount, totalContributions };
}

/** Match admin `Projects.jsx` surfaces (tokens from `index.css`). */
const SURFACE_CARD =
  "rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";
const SURFACE_INSET =
  "rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary";
const SURFACE_BADGE =
  "inline-flex items-center gap-2 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted";
const PILL_STATUS =
  "inline-flex rounded-full border border-(--color-light-card-border) bg-(--color-light-input-bg) px-2.5 py-1 text-[11px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-dark-secondary";

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

const proposalTabDefs = [
  { id: "overview", label: "Overview", Icon: Target },
  { id: "proposal", label: "Proposal", Icon: BookOpen },
  { id: "documents", label: "Documents", Icon: FileText },
  { id: "activity", label: "Activity", Icon: Activity },
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

function SectionCard({ icon, title, value, note }) {
  const IconComp = icon;
  return (
    <div className={`${SURFACE_CARD} p-4 md:p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {title}
          </p>
          <p className="mt-3 text-2xl font-bold text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
            {note}
          </p>
        </div>
        <div
          className={`${SURFACE_INSET} flex shrink-0 items-center justify-center p-3`}
        >
          <IconComp className="size-5 text-primary dark:text-dark-primary" />
        </div>
      </div>
    </div>
  );
}

function ProjectWorkspace() {
  const { owner, repo } = useParams();
  const { t } = useTranslation();
  const displayOwner = owner ? decodeURIComponent(owner) : "";
  const displayRepo = repo ? decodeURIComponent(repo) : "";
  const [selectedContributorId, setSelectedContributorId] = useState(
    contributors[0].id,
  );
  const [contributionYear, setContributionYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [activeTab, setActiveTab] = useState("overview");

  const selectedContributor =
    contributors.find((item) => item.id === selectedContributorId) ||
    contributors[0];

  const repoPath =
    displayOwner && displayRepo
      ? `${displayOwner}/${displayRepo}`
      : t("adminProjectWorkspace.activity.repoPlaceholder");

  const contributionModel = useMemo(
    () =>
      buildRepoContributionYear(
        displayOwner || "owner",
        displayRepo || "repo",
        selectedContributor.id,
        selectedContributor.seed,
        contributionYear,
      ),
    [
      displayOwner,
      displayRepo,
      selectedContributor.id,
      selectedContributor.seed,
      contributionYear,
    ],
  );

  const { weekColumns, maxCount, totalContributions } = contributionModel;

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1].map((v) => ({
      value: String(v),
      label: String(v),
    }));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-card-bg">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Link
          to="/admin/projects"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary"
        >
          <ArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          {t("adminProjectWorkspace.backToProjects")}
        </Link>

        <section className={`${SURFACE_CARD} p-4 md:p-5`}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className={SURFACE_BADGE}>
                <GitBranch className="size-3.5 shrink-0" aria-hidden />
                {t("adminProjectWorkspace.badge.label")}
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-primary dark:text-dark-primary">
                {displayRepo
                  ? displayRepo.replace(/-/g, " ")
                  : t("adminProjectWorkspace.defaultTitle")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted dark:text-dark-muted">
                {displayOwner && displayRepo
                  ? t("adminProjectWorkspace.subtitle", {
                      owner: displayOwner,
                      repo: displayRepo,
                    })
                  : t("adminProjectWorkspace.defaultDescription")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 xl:min-w-[360px]">
              <div className={`${SURFACE_INSET} p-4`}>
                <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                  Project phase
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  Validation and proposal review
                </p>
              </div>
              <div className={`${SURFACE_INSET} p-4`}>
                <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                  Completion
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  78%
                </p>
              </div>
              <div className={`${SURFACE_INSET} p-4`}>
                <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                  Lead supervisor
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  Dr. Sarah Johnson
                </p>
              </div>
              <div className={`${SURFACE_INSET} p-4`}>
                <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                  Repository sync
                </p>
                <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  14 minutes ago
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

        <section className={`${SURFACE_CARD} overflow-hidden p-0`}>
          <TableToolbar className="rounded-none! border-0 border-b border-(--color-light-card-border) bg-(--color-light-card-bg)! dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)!">
            <TableToolbar.Row justify="start">
              <TableToolbar.ViewTabs
                value={activeTab}
                onValueChange={setActiveTab}
                tabs={proposalTabDefs.map((tab) => {
                  const TabGlyph = tab.Icon;
                  return {
                    id: tab.id,
                    label: tab.label,
                    icon: (
                      <TabGlyph
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ),
                  };
                })}
              />
            </TableToolbar.Row>
          </TableToolbar>
        </section>

        {activeTab === "overview" && (
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-6">
              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
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
                  <div className={`${SURFACE_INSET} p-4`}>
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      Main objective
                    </p>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      Build a GitHub-like research workspace with document
                      versioning, contribution maps, and proposal review.
                    </p>
                  </div>
                  <div className={`${SURFACE_INSET} p-4`}>
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

              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <div className="flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
                    Proposal sections
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {documentSections.map((section) => (
                    <div
                      key={section.key}
                      className={`${SURFACE_INSET} p-4`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-primary dark:text-dark-primary">
                          {section.title}
                        </p>
                        <span className={PILL_STATUS}>
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
              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
                    Milestones
                  </h2>
                </div>
                <div className="mt-4 space-y-3">
                  {milestones.map((milestone) => (
                    <div
                      key={milestone.title}
                      className={`${SURFACE_INSET} p-4`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="font-semibold text-primary dark:text-dark-primary">
                          {milestone.title}
                        </p>
                        <span className={PILL_STATUS}>
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

              <div className={`${SURFACE_CARD} p-4 md:p-5`}>
                <div className="flex items-center gap-2">
                  <LibraryBig className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
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
          <section className={`${SURFACE_CARD} p-4 md:p-5`}>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary dark:text-dark-primary" />
              <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
                Proposal view
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {proposalSections.map((section) => (
                <div
                  key={section.title}
                  className={`${SURFACE_INSET} p-4 md:p-5`}
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
            <div className={`${SURFACE_CARD} p-4 md:p-5`}>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary dark:text-dark-primary" />
                <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
                  Research documents
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {documentSections.map((section) => (
                  <div
                    key={section.key}
                    className={`${SURFACE_INSET} p-4`}
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

            <div className={`${SURFACE_CARD} p-4 md:p-5`}>
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary dark:text-dark-primary" />
                <h2 className="text-base font-semibold text-primary dark:text-dark-primary">
                  Recent document changes
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                {repositoryActivity.map((item) => (
                  <div
                    key={item.file}
                    className={`${SURFACE_INSET} p-4`}
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
            <div className={`${SURFACE_CARD} p-4 md:p-5`}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className={SURFACE_BADGE}>
                      <Activity
                        className="size-3.5 shrink-0"
                        aria-hidden
                      />
                      {t("adminProjectWorkspace.activity.badge")}
                    </div>
                    <p className="mt-4 text-2xl font-bold text-primary dark:text-dark-primary">
                      {t("adminProjectWorkspace.activity.title")}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-secondary dark:text-dark-secondary">
                      {t("adminProjectWorkspace.activity.subtitle")}
                    </p>
                  </div>

                  <div className={`${SURFACE_INSET} p-4 lg:max-w-md lg:shrink-0`}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                      {t("adminProjectWorkspace.activity.repoScope")}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                      {repoPath}
                    </p>
                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                        {t("adminProjectWorkspace.activity.referenceYear")}
                      </p>
                      <div className="mt-2 max-w-[200px]">
                        <Select
                          value={String(contributionYear)}
                          onChange={(v) => setContributionYear(Number(v))}
                          options={yearOptions}
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-muted dark:text-dark-muted">
                      {t("adminProjectWorkspace.activity.yearHint")}
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
                          "rounded-xl border p-4 text-left transition-colors duration-200",
                          isActive
                            ? "border-(--color-light-input-border-focus) bg-light-app-tertiary shadow-sm ring-2 ring-blue-500/15 dark:border-(--color-dark-input-border-focus) dark:bg-dark-app-tertiary dark:ring-blue-400/15"
                            : "border-(--color-light-card-border) bg-(--color-light-card-bg) hover:bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:bg-dark-app-tertiary",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-light-btn-primary-bg) text-sm font-semibold text-(--color-light-btn-primary-text) dark:bg-(--color-dark-btn-primary-bg) dark:text-(--color-dark-btn-primary-text)">
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
                          <div
                            className={`${SURFACE_INSET} px-2 py-2 text-center`}
                          >
                            <p className="text-[11px] text-muted dark:text-dark-muted">
                              Progress
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                              {person.completion}%
                            </p>
                          </div>
                          <div
                            className={`${SURFACE_INSET} px-2 py-2 text-center`}
                          >
                            <p className="text-[11px] text-muted dark:text-dark-muted">
                              Tasks
                            </p>
                            <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                              {person.tasksDone}
                            </p>
                          </div>
                          <div
                            className={`${SURFACE_INSET} px-2 py-2 text-center`}
                          >
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
                  <div className={`${SURFACE_INSET} p-4`}>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Selected member
                    </p>
                    <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                      {selectedContributor.name}
                    </p>
                  </div>
                  <div className={`${SURFACE_INSET} p-4`}>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Contributions
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {totalContributions}
                    </p>
                  </div>
                  <div className={`${SURFACE_INSET} p-4`}>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Commits
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {selectedContributor.commits}
                    </p>
                  </div>
                  <div className={`${SURFACE_INSET} p-4`}>
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

            <div className={`${SURFACE_CARD} overflow-hidden p-0`}>
              <div className="flex flex-col gap-4 border-b border-light-divider px-4 py-4 md:px-5 md:py-5 dark:border-dark-divider lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary dark:text-dark-primary">
                    {t("adminProjectWorkspace.activity.heatmapHeading", {
                      total: totalContributions,
                      year: contributionYear,
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {t("adminProjectWorkspace.activity.heatmapSubheading", {
                      name: selectedContributor.name,
                      repo: repoPath,
                    })}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} px-4 py-3 lg:max-w-sm`}>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.activity.contributorNote")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-primary dark:text-dark-primary">
                    {selectedContributor.note}
                  </p>
                </div>
              </div>

              <div className="px-4 py-4 md:px-5 md:py-5">
                <div className={`${SURFACE_INSET} p-4`}>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-light-divider pb-4 dark:border-dark-divider">
                    <div>
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {t("adminProjectWorkspace.activity.calendarTitle")}
                      </p>
                      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                        {t("adminProjectWorkspace.activity.chartHint", {
                          owner: displayOwner || "—",
                          repo: displayRepo || "—",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 max-w-full overflow-x-auto pb-1">
                    <div className="flex min-w-0 gap-2">
                      <div className="flex shrink-0 flex-col gap-[3px] pr-1">
                        {WEEKDAY_ROW_KEYS.map((key) => (
                          <span
                            key={key}
                            className="flex h-3 w-7 shrink-0 items-center text-[10px] font-medium text-muted dark:text-dark-muted"
                          >
                            {t(
                              `adminProjectWorkspace.activity.weekdaysShort.${key}`,
                            )}
                          </span>
                        ))}
                      </div>
                      <div className="flex min-w-0 gap-[3px]">
                        {weekColumns.map((week, wi) => (
                          <div
                            key={wi}
                            className="flex flex-col gap-[3px]"
                          >
                            {week.map((cell) => {
                              const level = cell.inYear
                                ? heatLevelIndex(cell.count, maxCount)
                                : 0;
                              const fill =
                                cell.inYear && level > 0
                                  ? HEAT_GREEN_FILLS[level]
                                  : undefined;
                              const title = cell.inYear
                                ? t(
                                    "adminProjectWorkspace.activity.tooltipContributions",
                                    {
                                      count: cell.count,
                                      date: format(cell.day, "MMM d, yyyy"),
                                      repo: repoPath,
                                    },
                                  )
                                : "";

                              return (
                                <button
                                  key={cell.day.toISOString()}
                                  type="button"
                                  title={title}
                                  aria-label={title}
                                  className={cn(
                                    "size-3 shrink-0 rounded-sm border transition-colors",
                                    cell.inYear
                                      ? "border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                                      : "border-transparent opacity-40 dark:opacity-30",
                                    cell.inYear &&
                                      level === 0 &&
                                      "bg-light-app-tertiary dark:bg-dark-app-tertiary",
                                  )}
                                  style={
                                    fill
                                      ? { backgroundColor: fill }
                                      : undefined
                                  }
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-xs text-muted dark:text-dark-muted">
                    <span>{t("adminProjectWorkspace.activity.legendLess")}</span>
                    <div className="flex flex-wrap items-center gap-1">
                      {HEAT_GREEN_FILLS.map((color, index) => (
                        <span
                          key={`heat-${String(index)}`}
                          className="size-3 rounded-sm border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                          style={{
                            backgroundColor:
                              index === 0
                                ? "var(--color-light-app-tertiary)"
                                : color,
                          }}
                        />
                      ))}
                    </div>
                    <span>
                      {t("adminProjectWorkspace.activity.legendMore")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${SURFACE_CARD} p-4 md:p-5`}>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted dark:text-dark-muted" />
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  {t("adminProjectWorkspace.activity.interpretTitle")}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                {t("adminProjectWorkspace.activity.interpretBody")}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default ProjectWorkspace;
