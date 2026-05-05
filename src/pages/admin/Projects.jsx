import {
  Activity,
  Building2,
  CalendarDays,
  FolderGit2,
  Gauge,
  LayoutGrid,
  LayoutList,
  ListChecks,
  UserCircle2,
  Users,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import {
  DropdownMenuRoot,
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
import { useFacultyProjects } from "../../services/useApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const KANBAN_LANES = ["todo", "in_progress", "in_review", "done"];

function unwrapProjectRow(row) {
  return row?.json && typeof row.json === "object" ? row.json : row;
}

function personDisplayName(person) {
  if (!person) return "";
  return (
    [person.firstName, person.lastName].filter(Boolean).join(" ").trim() ||
    person.name ||
    person.username ||
    person.email ||
    String(person.id ?? "")
  );
}

function memberListFromGroup(group) {
  const members =
    group?.groupMember ?? group?.groupMembers ?? group?.members ?? [];
  return Array.isArray(members) ? members : [];
}

function memberInitials(member) {
  const label = personDisplayName(member);
  if (!label) return "";
  const parts = label.split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function normalizeProjectLane(project) {
  const status =
    project?.laneStatus ??
    project?.status ??
    project?.projectStatus ??
    project?.workflowStatus;
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (
    ["todo", "in_progress", "in_review", "done", "stuck"].includes(normalized)
  ) {
    return normalized;
  }
  if (
    project?.projectRepository?.repositoryName ||
    project?.projectRepository?.id
  ) {
    return "in_progress";
  }
  return "todo";
}

function normalizeProjectProgress(project, memberCount) {
  const raw =
    project?.progress ??
    project?.completion ??
    project?.progressPercent ??
    project?.percentage;
  const numeric = Number(raw);
  if (!Number.isNaN(numeric)) return Math.min(100, Math.max(0, numeric));
  if (project?.projectRepository?.repositoryName)
    return Math.min(85, 35 + memberCount * 10);
  return memberCount > 0 ? 20 : 0;
}

function normalizeProjectDate(project) {
  return (
    project?.updatedAt ??
    project?.createdAt ??
    project?.lastModifiedDate ??
    project?.lastModifiedAt ??
    project?.dateCreated ??
    null
  );
}

function academicYearLabel(academicYear) {
  if (!academicYear) return "";
  const direct =
    academicYear?.name ??
    academicYear?.label ??
    academicYear?.title ??
    academicYear?.year;
  if (String(direct ?? "").trim()) return String(direct).trim();

  const start = academicYear?.startDate
    ? new Date(academicYear.startDate).getFullYear()
    : Number.NaN;
  const end = academicYear?.endDate
    ? new Date(academicYear.endDate).getFullYear()
    : Number.NaN;
  if (!Number.isNaN(start) && !Number.isNaN(end)) return `${start}-${end}`;
  if (!Number.isNaN(start)) return String(start);
  if (!Number.isNaN(end)) return String(end);
  return "";
}

function projectYear(project, currentYear) {
  const academicYear =
    project?.academicYear ?? project?.source?.group?.academicYear;
  const academicYearName = academicYearLabel(academicYear);
  if (academicYearName) return academicYearName;

  const rawDate = project?.createdAt ?? project?.updatedAt;
  const time = rawDate ? new Date(rawDate).getTime() : Number.NaN;
  return Number.isNaN(time) ? String(currentYear) : String(new Date(time).getFullYear());
}

function normalizeProjectRecord(row) {
  const project = unwrapProjectRow(row);
  const group = project?.group ?? {};
  const repository = project?.projectRepository ?? {};
  const teacher = project?.teacher ?? {};
  const members = memberListFromGroup(group);
  const lead = personDisplayName(teacher);
  const repositoryName =
    repository?.repositoryName ??
    project?.repositoryName ??
    project?.projectName ??
    "untitled-project";
  const ownerUsername =
    repository?.owner ??
    repository?.ownerUsername ??
    teacher?.username ??
    teacher?.email ??
    "";
  const updatedAt = normalizeProjectDate(project);
  const createdAt = project?.createdAt ?? updatedAt;
  const visibility = String(repository?.visibility ?? "PRIVATE").toUpperCase();
  const memberNames = members.map(personDisplayName).filter(Boolean);
  const academicYear = group?.academicYear ?? null;
  return {
    source: project,
    id: String(project?.id ?? repository?.id ?? repositoryName),
    ownerUsername,
    repositoryName,
    description:
      repository?.description ??
      project?.description ??
      project?.projectName ??
      "—",
    visibility,
    createdAt,
    updatedAt,
    academicYear,
    academicYearLabel: academicYearLabel(academicYear),
    facultyDepartment: group?.name ?? "—",
    leadDisplayName: lead || "—",
    laneStatus: normalizeProjectLane(project),
    progress: normalizeProjectProgress(project, members.length),
    tags: [visibility, group?.name].filter(Boolean),
    collaboratorInitials: members.map(memberInitials).filter(Boolean),
    targetDate: project?.targetDate ?? project?.deadline ?? null,
    canOpenWorkspace: Boolean(ownerUsername && repository?.repositoryName),
    memberNames,
  };
}

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
  if (!initials?.length)
    return <span className="text-muted dark:text-dark-muted">—</span>;
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
      disabled={!project.canOpenWorkspace}
      onClick={() => onOpen(project)}
      className="flex w-full flex-col gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-3 text-left shadow-sm transition-colors hover:border-(--color-light-input-border-focus) disabled:cursor-not-allowed disabled:opacity-70 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus)"
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
        <CalendarDays
          className="size-3.5 shrink-0"
          strokeWidth={2}
          aria-hidden
        />
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
  const { data: facultyProjects = [] } = useFacultyProjects();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const currentYear = new Date().getFullYear();
  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : "en-US";

  const projects = useMemo(() => {
    const rows = Array.isArray(facultyProjects) ? facultyProjects : [];
    return rows.map(normalizeProjectRecord);
  }, [facultyProjects]);

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
    const years = new Set(projects.map((p) => projectYear(p, currentYear)));
    const sorted = [...years].sort((a, b) => String(b).localeCompare(String(a)));
    return [
      { value: "all", label: t("adminProjects.filters.yearAll") },
      ...sorted.map((y) => ({
        value: String(y),
        label:
          String(y) === String(currentYear)
            ? t("adminProjects.filters.thisYear", { year: y })
            : t("adminProjects.filters.yearOption", { year: y }),
      })),
    ];
  }, [projects, t, currentYear]);

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return projects.filter((p) => {
      const y = projectYear(p, currentYear);
      if (yearFilter !== "all" && String(y) !== yearFilter) return false;
      if (statusFilter !== "all" && p.laneStatus !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        p.source?.projectName,
        p.repositoryName,
        p.description,
        p.facultyDepartment,
        p.leadDisplayName,
        p.ownerUsername,
        ...p.memberNames,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [projects, debouncedSearch, statusFilter, yearFilter, currentYear]);

  const groupedByYear = useMemo(() => {
    const map = new Map();
    for (const p of filteredProjects) {
      const y = projectYear(p, currentYear);
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
    if (!p.canOpenWorkspace) return;
    navigate(
      `/admin/projects/${encodeURIComponent(p.ownerUsername)}/${encodeURIComponent(p.repositoryName)}`,
    );
  };

  const projectHeaderData = useMemo(
    () => [
      {
        title: "",
        tooltip: t("adminProjects.tableHints.selection"),
        icon: (
          <ListChecks
            className="size-3.5 shrink-0 opacity-70"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminProjects.table.team"),
        tooltip: t("adminProjects.tableHints.team"),
        icon: (
          <Users className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminProjects.table.project"),
        tooltip: t("adminProjects.tableHints.project"),
        icon: (
          <FolderGit2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminProjects.table.faculty"),
        tooltip: t("adminProjects.tableHints.faculty"),
        icon: (
          <Building2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminProjects.table.lead"),
        tooltip: t("adminProjects.tableHints.lead"),
        icon: (
          <UserCircle2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminProjects.table.status"),
        tooltip: t("adminProjects.tableHints.status"),
        icon: (
          <Activity className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminProjects.table.actions"),
        align: "center",
        tooltip: t("adminProjects.tableHints.actions"),
        icon: (
          <LayoutList
            className="size-3.5 shrink-0 opacity-80"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
    ],
    [t],
  );

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
      <div className="flex flex-col gap-4">
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
            onClick={() => navigate("/admin/projects/register")}
          >
            {t("adminProjects.actions.new")}
          </Button>
        </div>
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
          <TableHeader headerData={projectHeaderData} />
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableColumn
                  colSpan={projectHeaderData.length}
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
                      colSpan={projectHeaderData.length}
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
                          disabled={!project.canOpenWorkspace}
                          onClick={() => openWorkspace(project)}
                          className="text-left disabled:cursor-default"
                        >
                          <div className="line-clamp-1 text-sm font-semibold text-primary underline-offset-2 hover:underline dark:text-dark-primary">
                            {project.repositoryName.replace(/-/g, " ")}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted dark:text-dark-muted">
                            {project.canOpenWorkspace
                              ? `${project.ownerUsername}/${project.repositoryName}`
                              : (project.source?.projectName ?? "—")}
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
                            <DropdownItem
                              disabled={!project.canOpenWorkspace}
                              onClick={() => openWorkspace(project)}
                            >
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
                    window.GooeyToaster?.info?.(
                      t("adminProjects.toast.addTask"),
                    )
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
