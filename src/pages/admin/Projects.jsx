import { CalendarDays, LayoutGrid, LayoutList, Users } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Field from "../../components/Field";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Select from "../../components/Select";
import StatusPill from "../../components/StatusPill";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import TableToolbar from "../../components/TableToolbar";
import FacultyProjectsRegistry from "../../components/FacultyProjectsRegistry";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

/**
 * Sample projects shaped like Version Control `Repository` payloads
 * (see `apiEndpoint.md` §5.2) plus UI-only fields until a list endpoint exists.
 */
const SEED_PROJECTS = [
  {
    id: "repo-1",
    ownerUsername: "sarah.johnson",
    repositoryName: "ai-student-analytics",
    description: "AI-powered student analytics dashboard and reporting.",
    visibility: "PUBLIC",
    createdAt: "2026-01-10T10:00:00Z",
    updatedAt: "2026-04-28T15:30:00Z",
    facultyDepartment: "Computer Science",
    leadDisplayName: "Dr. Sarah Johnson",
    laneStatus: "in_progress",
    progress: 78,
    tags: ["Research", "AI"],
    collaboratorInitials: ["SJ", "MC", "AK"],
    targetDate: "2026-06-01",
  },
  {
    id: "repo-2",
    ownerUsername: "michael.chen",
    repositoryName: "renewable-energy-lab",
    description: "Renewable energy lab instrumentation and datasets.",
    visibility: "PUBLIC",
    createdAt: "2025-09-05T09:00:00Z",
    updatedAt: "2026-03-12T11:00:00Z",
    facultyDepartment: "Engineering",
    leadDisplayName: "Prof. Michael Chen",
    laneStatus: "in_review",
    progress: 62,
    tags: ["Lab", "Energy"],
    collaboratorInitials: ["MC", "RP"],
    targetDate: "2026-05-20",
  },
  {
    id: "repo-3",
    ownerUsername: "aisha.khan",
    repositoryName: "biomedical-signals",
    description: "Biomedical signal processing pipeline and validation.",
    visibility: "PRIVATE",
    createdAt: "2024-02-14T08:00:00Z",
    updatedAt: "2025-11-02T16:45:00Z",
    facultyDepartment: "Medical Sciences",
    leadDisplayName: "Dr. Aisha Khan",
    laneStatus: "done",
    progress: 100,
    tags: ["Health", "Signal"],
    collaboratorInitials: ["AK", "HP", "FN", "BS"],
    targetDate: "2025-10-01",
  },
  {
    id: "repo-4",
    ownerUsername: "elena.rossi",
    repositoryName: "digital-humanities-archive",
    description: "Digital humanities archive and metadata tooling.",
    visibility: "PUBLIC",
    createdAt: "2025-11-20T12:00:00Z",
    updatedAt: "2026-04-01T09:15:00Z",
    facultyDepartment: "Arts & Humanities",
    leadDisplayName: "Prof. Elena Rossi",
    laneStatus: "todo",
    progress: 18,
    tags: ["Archive", "Metadata"],
    collaboratorInitials: ["ER", "AR"],
    targetDate: "2026-08-15",
  },
  {
    id: "repo-5",
    ownerUsername: "raj.patel",
    repositoryName: "quantum-simulations",
    description: "Quantum computing simulation notebooks and benchmarks.",
    visibility: "PUBLIC",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2026-02-10T14:00:00Z",
    facultyDepartment: "Physics",
    leadDisplayName: "Dr. Raj Patel",
    laneStatus: "stuck",
    progress: 45,
    tags: ["Quantum", "Compute"],
    collaboratorInitials: ["RP", "MC"],
    targetDate: "2026-12-31",
  },
  {
    id: "repo-6",
    ownerUsername: "faculty-board",
    repositoryName: "q4-budget-reporting",
    description: "Institutional Q4 budget reporting templates and checks.",
    visibility: "PRIVATE",
    createdAt: "2025-12-01T09:00:00Z",
    updatedAt: "2026-04-15T08:00:00Z",
    facultyDepartment: "Administration",
    leadDisplayName: "Finance Office",
    laneStatus: "in_progress",
    progress: 40,
    tags: ["Finance", "Report"],
    collaboratorInitials: ["FO", "SJ"],
    targetDate: "2026-05-01",
  },
  {
    id: "repo-7",
    ownerUsername: "web-guild",
    repositoryName: "saas-faculty-portal",
    description: "Faculty portal redesign: components, routing, and QA.",
    visibility: "PUBLIC",
    createdAt: "2026-02-18T11:30:00Z",
    updatedAt: "2026-04-29T18:20:00Z",
    facultyDepartment: "Computer Science",
    leadDisplayName: "Dr. Sarah Johnson",
    laneStatus: "in_review",
    progress: 88,
    tags: ["SaaS", "Web"],
    collaboratorInitials: ["SJ", "BS", "FN"],
    targetDate: "2026-07-10",
  },
  {
    id: "repo-8",
    ownerUsername: "library-it",
    repositoryName: "campus-dspace-integration",
    description: "DSpace integration and OAI harvest for campus libraries.",
    visibility: "PUBLIC",
    createdAt: "2023-10-10T10:00:00Z",
    updatedAt: "2024-06-01T12:00:00Z",
    facultyDepartment: "Library Sciences",
    leadDisplayName: "Campus Library IT",
    laneStatus: "done",
    progress: 100,
    tags: ["Library", "Integration"],
    collaboratorInitials: ["LI"],
    targetDate: "2024-05-30",
  },
];

const KANBAN_LANES = ["todo", "in_progress", "in_review", "done"];

function projectLaneToPillVariant(lane) {
  switch (lane) {
    case "todo":
      return "neutral";
    case "in_progress":
      return "warning";
    case "in_review":
      return "info";
    case "done":
      return "success";
    case "stuck":
      return "error";
    default:
      return "neutral";
  }
}

function ProgressBar({ value }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div className="flex min-w-[6rem] flex-col gap-1">
      <div className="flex items-center justify-between text-[10px] font-semibold text-muted dark:text-dark-muted">
        <span />
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-light-app-tertiary dark:bg-dark-app-tertiary">
        <div
          className="h-full max-w-full rounded-full bg-(--color-success) transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TeamAvatars({ initials }) {
  if (!initials?.length) return <span className="text-muted dark:text-dark-muted">—</span>;
  const shown = initials.slice(0, 4);
  return (
    <div className="flex -space-x-2">
      {shown.map((ini, i) => (
        <span
          key={`${ini}-${i}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-(--color-light-card-bg) bg-accent/15 text-[10px] font-semibold text-primary dark:border-(--color-dark-card-bg) dark:bg-[rgba(0,102,255,0.22)] dark:text-dark-primary"
          title={ini}
        >
          {ini}
        </span>
      ))}
    </div>
  );
}

function KanbanCard({ project, onOpen, locale }) {
  const due = project.targetDate
    ? new Date(project.targetDate).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <button
      type="button"
      onClick={() => onOpen(project)}
      className="flex w-full flex-col gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-3 text-left shadow-sm transition-colors hover:border-(--color-light-input-border-focus) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus)"
    >
      <div className="flex flex-wrap gap-1">
        {project.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-light-app-tertiary px-2 py-0.5 text-[10px] font-semibold text-secondary dark:bg-dark-app-tertiary dark:text-dark-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold text-primary dark:text-dark-primary">
          {project.repositoryName.replace(/-/g, " ")}
        </p>
        <p className="mt-1 line-clamp-2 text-xs text-muted dark:text-dark-muted">
          {project.description}
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted dark:text-dark-muted">
        <CalendarDays className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        <span>{due}</span>
      </div>
      <ProgressBar value={project.progress} />
      <div className="flex items-center justify-between border-t border-light-divider pt-2 dark:border-dark-divider">
        <div className="flex items-center gap-1 text-xs text-muted dark:text-dark-muted">
          <Users className="size-3.5" strokeWidth={2} aria-hidden />
          <span>{project.collaboratorInitials?.length ?? 0}</span>
        </div>
        <TeamAvatars initials={project.collaboratorInitials} />
      </div>
    </button>
  );
}

export default function Projects() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [projects, setProjects] = useState(SEED_PROJECTS);
  
  const currentYear = new Date().getFullYear();

  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : "en-US";

  const statusOptions = useMemo(
    () => [
      { value: "all", label: t("adminShared.filters.allStatus") },
      { value: "todo", label: t("adminProjects.projectStatus.todo") },
      {
        value: "in_progress",
        label: t("adminProjects.projectStatus.in_progress"),
      },
      {
        value: "in_review",
        label: t("adminProjects.projectStatus.in_review"),
      },
      { value: "done", label: t("adminProjects.projectStatus.done") },
      { value: "stuck", label: t("adminProjects.projectStatus.stuck") },
    ],
    [t],
  );

  const yearOptions = useMemo(() => {
    const years = new Set(
      projects.map((p) => new Date(p.createdAt).getFullYear()),
    );
    const sorted = [...years].sort((a, b) => b - a);
    return [
      { value: "all", label: t("adminProjects.filters.yearAll") },
      ...sorted.map((y) => ({
        value: String(y),
        label:
          y === currentYear
            ? t("adminProjects.filters.thisYear", { year: y })
            : t("adminProjects.filters.yearOption", { year: y }),
      })),
    ];
  }, [projects, t, currentYear]);

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return projects.filter((p) => {
      const y = new Date(p.createdAt).getFullYear();
      if (yearFilter !== "all" && String(y) !== yearFilter) return false;
      if (statusFilter !== "all" && p.laneStatus !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p.repositoryName,
        p.description,
        p.facultyDepartment,
        p.leadDisplayName,
        p.ownerUsername,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, debouncedSearch, statusFilter, yearFilter]);

  const groupedByYear = useMemo(() => {
    const map = new Map();
    for (const p of filteredProjects) {
      const y = new Date(p.createdAt).getFullYear();
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(p);
    }
    const years = [...map.keys()].sort((a, b) => b - a);
    return years.map((year) => ({
      year,
      heading:
        year === currentYear
          ? t("adminProjects.groups.thisYear", { year })
          : t("adminProjects.groups.priorYear", { year }),
      items: map.get(year),
    }));
  }, [filteredProjects, currentYear, t]);

  const kanbanBuckets = useMemo(() => {
    const buckets = Object.fromEntries(KANBAN_LANES.map((id) => [id, []]));
    for (const p of filteredProjects) {
      if (p.laneStatus === "stuck") {
        buckets.in_progress.push(p);
        continue;
      }
      if (buckets[p.laneStatus]) buckets[p.laneStatus].push(p);
      else buckets.todo.push(p);
    }
    return buckets;
  }, [filteredProjects]);

  const openWorkspace = (p) => {
    navigate(
      `/admin/projects/${encodeURIComponent(p.ownerUsername)}/${encodeURIComponent(p.repositoryName)}`,
    );
  };

  const setProjectLane = (id, lane) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, laneStatus: lane } : p)),
    );
  };

  const headerData = useMemo(
    () => [
      { title: "" },
      { title: t("adminProjects.table.team") },
      { title: t("adminProjects.table.project") },
      { title: t("adminProjects.table.faculty") },
      { title: t("adminProjects.table.lead") },
      { title: t("adminProjects.table.status") },
      { title: t("adminProjects.table.progress") },
      { title: t("adminProjects.table.updated") },
      { title: t("adminProjects.table.actions"), align: "center" },
    ],
    [t],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
      <FacultyProjectsRegistry />

      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-primary dark:text-dark-primary">
            {t("adminProjects.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminProjects.header.subtitle")}
          </p>
          <p className="mt-1 text-sm text-muted dark:text-dark-muted">
            {t("adminProjects.header.description", {
              count: filteredProjects.length,
            })}
          </p>
        </div>
        <Button
          icon={<Icon d={IC.plus} className="size-4" />}
          onClick={() =>
            window.GooeyToaster?.info?.(t("adminProjects.toast.newPending"))
          }
        >
          {t("adminProjects.actions.new")}
        </Button>
      </div>

      {viewMode === "list" ? (
        <Table
          toolbar={
            <TableToolbar>
              <TableToolbar.Row
                justify="between"
                className="items-stretch gap-3 sm:items-center"
              >
                <TableToolbar.ViewTabs
                  value={viewMode}
                  onValueChange={setViewMode}
                  tabs={[
                    {
                      id: "list",
                      label: t("adminProjects.toolbar.list"),
                      icon: (
                        <LayoutList
                          className="size-3.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ),
                    },
                    {
                      id: "kanban",
                      label: t("adminProjects.toolbar.kanban"),
                      icon: (
                        <LayoutGrid
                          className="size-3.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ),
                    },
                  ]}
                />
              </TableToolbar.Row>
              <TableToolbar.Row justify="start" className="gap-2">
                <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                  <Field
                    id="projects-search"
                    placeholder={t("adminProjects.filters.searchPlaceholder")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    iconD={IC.search}
                  />
                </div>
                <div className="w-full shrink-0 sm:w-44">
                  <Select
                    options={yearOptions}
                    value={yearFilter}
                    onValueChange={setYearFilter}
                  />
                </div>
                <div className="w-full shrink-0 sm:w-48">
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  />
                </div>
              </TableToolbar.Row>
            </TableToolbar>
          }
        >
          <TableHeader headerData={headerData} />
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableColumn
                  colSpan={headerData.length}
                  className="py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-light-app-tertiary dark:bg-dark-app-tertiary">
                      <Icon
                        d={IC.folder}
                        className="size-8 text-muted dark:text-dark-muted"
                      />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-primary dark:text-dark-primary">
                        {t("adminProjects.empty.title")}
                      </h3>
                      <p className="text-sm text-muted dark:text-dark-muted">
                        {debouncedSearch ||
                        statusFilter !== "all" ||
                        yearFilter !== "all"
                          ? t("adminProjects.empty.filtered")
                          : t("adminProjects.empty.default")}
                      </p>
                    </div>
                  </div>
                </TableColumn>
              </TableRow>
            ) : (
              groupedByYear.map((group) => (
                <Fragment key={group.year}>
                  <TableRow>
                    <TableColumn
                      colSpan={headerData.length}
                      className="bg-light-app-tertiary py-2 dark:bg-dark-app-tertiary"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary dark:text-dark-secondary">
                        {group.heading}
                      </span>
                    </TableColumn>
                  </TableRow>
                  {group.items.map((project) => (
                    <TableRow key={project.id}>
                    <TableColumn className="w-10">
                      <Checkbox />
                    </TableColumn>
                    <TableColumn>
                      <TeamAvatars initials={project.collaboratorInitials} />
                    </TableColumn>
                    <TableColumn>
                      <button
                        type="button"
                        onClick={() => openWorkspace(project)}
                        className="text-left"
                      >
                        <div className="line-clamp-1 text-sm font-semibold text-primary underline-offset-2 hover:underline dark:text-dark-primary">
                          {project.repositoryName.replace(/-/g, " ")}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-muted dark:text-dark-muted">
                          {project.ownerUsername}/{project.repositoryName}
                        </div>
                        <div className="mt-1 line-clamp-1 text-xs text-muted dark:text-dark-muted">
                          {project.description}
                        </div>
                      </button>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="inline-flex max-w-[14rem] rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-2.5 py-1 text-[11px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-secondary">
                        {project.facultyDepartment}
                      </span>
                    </TableColumn>
                    <TableColumn className="text-sm font-medium text-primary dark:text-dark-primary">
                      {project.leadDisplayName}
                    </TableColumn>
                    <TableColumn>
                      <DropdownMenuRoot>
                        <DropdownTrigger asChild>
                          <button type="button" className="inline-flex">
                            <StatusPill
                              variant={projectLaneToPillVariant(
                                project.laneStatus,
                              )}
                            >
                              {t(
                                `adminProjects.projectStatus.${project.laneStatus}`,
                              )}
                            </StatusPill>
                          </button>
                        </DropdownTrigger>
                        <DropdownContent>
                          {["todo", "in_progress", "in_review", "done"].map(
                            (lane) => (
                              <DropdownItem
                                key={lane}
                                onClick={() =>
                                  setProjectLane(project.id, lane)
                                }
                              >
                                {t(`adminProjects.projectStatus.${lane}`)}
                              </DropdownItem>
                            ),
                          )}
                          <DropdownSeparator />
                          <DropdownItem
                            onClick={() =>
                              setProjectLane(project.id, "stuck")
                            }
                          >
                            {t("adminProjects.projectStatus.stuck")}
                          </DropdownItem>
                        </DropdownContent>
                      </DropdownMenuRoot>
                    </TableColumn>
                    <TableColumn>
                      <ProgressBar value={project.progress} />
                    </TableColumn>
                    <TableColumn className="whitespace-nowrap text-xs text-muted dark:text-dark-muted">
                      {new Date(project.updatedAt).toLocaleString(locale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </TableColumn>
                    <TableColumn className="text-center">
                      <DropdownMenuRoot>
                        <DropdownTrigger showArrow={false}>
                          <Icon
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                            className="mx-auto size-5 text-muted dark:text-dark-muted"
                          />
                        </DropdownTrigger>
                        <DropdownContent align="end">
                          <DropdownItem onClick={() => openWorkspace(project)}>
                            {t("adminProjects.actions.openWorkspace")}
                          </DropdownItem>
                          <DropdownItem>
                            {t("adminProjects.actions.edit")}
                          </DropdownItem>
                          <DropdownSeparator />
                          <DropdownItem variant="danger">
                            {t("adminShared.actions.archive")}
                          </DropdownItem>
                        </DropdownContent>
                      </DropdownMenuRoot>
                    </TableColumn>
                  </TableRow>
                  ))}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      ) : (
        <div className="flex flex-col gap-4">
          <TableToolbar>
            <TableToolbar.Row
              justify="between"
              className="items-stretch gap-3 sm:items-center"
            >
              <TableToolbar.ViewTabs
                value={viewMode}
                onValueChange={setViewMode}
                tabs={[
                  {
                    id: "list",
                    label: t("adminProjects.toolbar.list"),
                    icon: (
                      <LayoutList
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ),
                  },
                  {
                    id: "kanban",
                    label: t("adminProjects.toolbar.kanban"),
                    icon: (
                      <LayoutGrid
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                        aria-hidden
                      />
                    ),
                  },
                ]}
              />
            </TableToolbar.Row>
            <TableToolbar.Row justify="start" className="gap-2">
              <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                <Field
                  id="projects-search-kanban"
                  placeholder={t("adminProjects.filters.searchPlaceholder")}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  iconD={IC.search}
                />
              </div>
              <div className="w-full shrink-0 sm:w-44">
                <Select
                  options={yearOptions}
                  value={yearFilter}
                  onValueChange={setYearFilter}
                />
              </div>
              <div className="w-full shrink-0 sm:w-48">
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                />
              </div>
            </TableToolbar.Row>
          </TableToolbar>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {KANBAN_LANES.map((lane) => (
              <section
                key={lane}
                className="flex min-h-[280px] flex-col gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {t(`adminProjects.kanban.${lane}`)}
                  </h2>
                  <span className="rounded-full bg-light-app-tertiary px-2 py-0.5 text-[11px] font-semibold text-secondary dark:bg-dark-app-tertiary dark:text-dark-secondary">
                    {kanbanBuckets[lane]?.length ?? 0}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
                  {(kanbanBuckets[lane] ?? []).map((project) => (
                    <KanbanCard
                      key={project.id}
                      project={project}
                      onOpen={openWorkspace}
                      locale={locale}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full rounded-xl border border-dashed border-(--color-light-input-border) py-2 text-xs font-semibold text-muted transition-colors hover:border-(--color-light-input-border-focus) hover:text-primary dark:border-dark-input-border dark:hover:border-(--color-dark-input-border-focus) dark:hover:text-dark-primary"
                  onClick={() =>
                    window.GooeyToaster?.info?.(t("adminProjects.toast.addTask"))
                  }
                >
                  {t("adminProjects.kanban.addTask")}
                </button>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
