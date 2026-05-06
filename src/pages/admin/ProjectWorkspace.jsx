import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  Link2,
  ScrollText,
  Target,
  UserPlus,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../../components/Button";
import GlobalModal from "../../components/GlobalModal";
import SearchableSelect from "../../components/SearchableSelect";
import Select from "../../components/Select";
import TableToolbar from "../../components/TableToolbar";
import ProjectRepositoryDocsPanel from "../../components/project/ProjectRepositoryDocsPanel";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { cn } from "../../lib/utils";
import {
  useFacultyProject,
  useInviteFacultyProjectMembers,
  useRepositorySearch,
  useStudentSearch,
  useStudentsPage,
  useUpdateFacultyProject,
} from "../../services/useApi";

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

function unwrapProjectRow(row) {
  return row?.json && typeof row.json === "object" ? row.json : row;
}

function displayName(person, fallback = "-") {
  if (!person) return fallback;
  if (typeof person === "string") return person || fallback;
  const full = [person.firstName, person.lastName].filter(Boolean).join(" ").trim();
  return (
    full ||
    person.displayName ||
    person.userName ||
    person.username ||
    person.email ||
    (person.id != null ? String(person.id) : fallback)
  );
}

function studentIdValue(student) {
  const value =
    student?.id ??
    student?.studentId ??
    student?.student_id ??
    student?.uuid ??
    "";
  return value != null && value !== "" ? String(value) : "";
}

function studentToOption(student) {
  if (!student) return null;
  const id = studentIdValue(student);
  if (!id) return null;
  return {
    value: id,
    label: displayName(student, id),
    description:
      student?.email ??
      student?.code ??
      student?.department?.name ??
      student?.batch?.name ??
      undefined,
  };
}

function normalizeStudentOptions(page) {
  const list = Array.isArray(page?.content) ? page.content : [];
  return list.map(studentToOption).filter(Boolean);
}

function mergeOptions(...groups) {
  const merged = [];
  const seen = new Set();
  for (const group of groups) {
    for (const option of Array.isArray(group) ? group : []) {
      if (!option?.value || seen.has(option.value)) continue;
      seen.add(option.value);
      merged.push(option);
    }
  }
  return merged;
}

function memberListFromGroup(group) {
  const members = group?.groupMembers ?? group?.groupMember ?? group?.members ?? [];
  return Array.isArray(members) ? members : [];
}

function projectAcademicYearLabel(project) {
  const academicYear = project?.group?.academicYear;
  if (!academicYear) return "—";
  const direct =
    academicYear?.name ??
    academicYear?.label ??
    academicYear?.title ??
    academicYear?.year;
  if (String(direct ?? "").trim()) return String(direct).trim();
  const start = academicYear?.startDate ? new Date(academicYear.startDate).getFullYear() : Number.NaN;
  const end = academicYear?.endDate ? new Date(academicYear.endDate).getFullYear() : Number.NaN;
  if (!Number.isNaN(start) && !Number.isNaN(end)) return `${start}-${end}`;
  if (!Number.isNaN(start)) return String(start);
  return "—";
}

function repositoryRowToOption(row) {
  const id = row?.id ?? row?.repositoryId ?? row?.uuid ?? "";
  const owner = String(
    row?.ownerUsername ??
      row?.ownerUsername?.user_name ??
      row?.ownerUsername?.username ??
      row?.owner?.user_name ??
      row?.owner?.username ??
      row?.owner ??
      "",
  ).trim();
  const name = String(row?.repositoryName ?? row?.name ?? "").trim();
  const label = owner && name ? `${owner}/${name}` : name || owner || String(id || "");
  const value = id ? String(id) : `${owner}/${name}`.trim();
  if (!value || !label) return null;
  return {
    value,
    label,
    description: typeof row?.description === "string" ? row.description : undefined,
  };
}

function repositorySelectedFallbackOption(project, formRepoId, repoOptions = []) {
  const v = String(formRepoId ?? "").trim();
  if (!v) return null;
  const selectedFromOptions = (Array.isArray(repoOptions) ? repoOptions : []).find(
    (option) => option?.value === v,
  );
  if (selectedFromOptions) return selectedFromOptions;
  const nested = project?.projectRepository;
  const nestedId = nested?.id ?? nested?.repositoryId;
  if (nested && String(nestedId ?? "") === v) {
    const owner =
      nested.ownerUsername ??
      nested.owner?.username ??
      nested.owner?.user_name ??
      nested.owner ??
      "";
    const name = nested.repositoryName ?? nested.name ?? "";
    const label = owner && name ? `${owner}/${name}` : name || owner || v;
    return { value: v, label: String(label) };
  }
  return { value: v, label: v };
}

function buildProjectUpdatePayload(project, extra = {}) {
  return {
    projectName: project?.projectName ?? "",
    group: String(project?.group?.id ?? project?.group ?? ""),
    teacher: String(project?.teacher?.id ?? project?.teacher ?? ""),
    ...extra,
  };
}

function contributorSeedFromId(id) {
  return String(id ?? "")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

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
  const { id, owner, repo } = useParams();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const proposalTabDefs = useMemo(
    () => [
      { id: "overview", label: t("adminProjectWorkspace.tabs.overview"), Icon: Target },
      { id: "proposal", label: t("adminProjectWorkspace.tabs.proposal"), Icon: BookOpen },
      { id: "documents", label: t("adminProjectWorkspace.tabs.documents"), Icon: FileText },
      { id: "activity", label: t("adminProjectWorkspace.tabs.activity"), Icon: Activity },
    ],
    [t],
  );
  const urlOwner = owner ? decodeURIComponent(owner) : "";
  const urlRepo = repo ? decodeURIComponent(repo) : "";
  const [selectedContributorId, setSelectedContributorId] = useState(
    contributors[0]?.id ?? 1,
  );
  const [contributionYear, setContributionYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [connectRepoOpen, setConnectRepoOpen] = useState(false);
  const [inviteSearchTerm, setInviteSearchTerm] = useState("");
  const [selectedInvitees, setSelectedInvitees] = useState([]);
  const [repoSearchTerm, setRepoSearchTerm] = useState("");
  const [selectedRepoId, setSelectedRepoId] = useState("");

  const debouncedInviteSearchTerm = useDebouncedValue(inviteSearchTerm, 300);
  const debouncedRepoSearchTerm = useDebouncedValue(repoSearchTerm, 300);

  const { data: projectResponse, isLoading: projectLoading } = useFacultyProject(id, {
    enabled: Boolean(id),
    notifyOnError: true,
  });
  const project = useMemo(() => unwrapProjectRow(projectResponse), [projectResponse]);

  const { data: studentPage } = useStudentsPage(
    { page: 0, pageSize: 500, notifyOnError: false },
    { staleTime: 60_000 },
  );
  const { data: searchedStudents = [], isFetching: isSearchingInvitees } = useStudentSearch(
    debouncedInviteSearchTerm,
    {
      enabled: debouncedInviteSearchTerm.length > 0,
      staleTime: 30_000,
      notifyOnError: false,
    },
  );
  const { data: repoHits = [], isFetching: repoSearchBusy } = useRepositorySearch(
    debouncedRepoSearchTerm,
    { notifyOnError: false },
  );

  const inviteProjectMembers = useInviteFacultyProjectMembers({
    toastSuccess: "adminProjectWorkspace.invite.success",
    toastError: "apiErrors.failed_to_update_faculty_project",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculty-projects"] });
      await queryClient.invalidateQueries({ queryKey: ["faculty-projects", "detail", id] });
      setInviteOpen(false);
      setSelectedInvitees([]);
      setInviteSearchTerm("");
    },
  });

  const connectRepository = useUpdateFacultyProject({
    toastSuccess: "adminProjectWorkspace.repository.success",
    toastError: "apiErrors.failed_to_update_faculty_project",
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["faculty-projects"] });
      await queryClient.invalidateQueries({ queryKey: ["faculty-projects", "detail", id] });
      setConnectRepoOpen(false);
      setSelectedRepoId("");
      setRepoSearchTerm("");
    },
  });

  const projectMembers = useMemo(() => memberListFromGroup(project?.group), [project]);
  const inviteeOptions = useMemo(
    () => normalizeStudentOptions(studentPage),
    [studentPage],
  );
  const searchedInviteeOptions = useMemo(
    () => searchedStudents.map(studentToOption).filter(Boolean),
    [searchedStudents],
  );
  const selectedInviteeOptions = useMemo(() => {
    const byId = new Map();
    projectMembers.forEach((member) => {
      const option = studentToOption(member);
      if (option) byId.set(option.value, option);
    });
    inviteeOptions.forEach((option) => byId.set(option.value, option));
    searchedInviteeOptions.forEach((option) => byId.set(option.value, option));
    return selectedInvitees.map((inviteeId) => byId.get(inviteeId)).filter(Boolean);
  }, [inviteeOptions, projectMembers, searchedInviteeOptions, selectedInvitees]);
  const existingMemberIds = useMemo(
    () => new Set(projectMembers.map((member) => studentIdValue(member)).filter(Boolean)),
    [projectMembers],
  );
  const inviteSelectOptions = useMemo(() => {
    const filteredBase = mergeOptions(searchedInviteeOptions, inviteeOptions).filter(
      (option) => !existingMemberIds.has(option.value),
    );
    return mergeOptions(selectedInviteeOptions, filteredBase);
  }, [existingMemberIds, inviteeOptions, searchedInviteeOptions, selectedInviteeOptions]);

  const repoSearchOptions = useMemo(
    () => repoHits.map(repositoryRowToOption).filter(Boolean),
    [repoHits],
  );
  const selectedRepoFallback = repositorySelectedFallbackOption(
    project,
    selectedRepoId,
    repoSearchOptions,
  );
  const repoSelectOptions = useMemo(
    () => mergeOptions(selectedRepoFallback ? [selectedRepoFallback] : [], repoSearchOptions),
    [repoSearchOptions, selectedRepoFallback],
  );

  const workspaceContributors = useMemo(() => {
    if (!projectMembers.length) return contributors;
    return projectMembers.map((member, index) => {
      const initials = displayName(member, "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
      return {
        id: studentIdValue(member) || `member-${index}`,
        name: displayName(member),
        role: member?.department?.name ?? member?.batch?.name ?? t("adminProjectWorkspace.team.memberRole"),
        initials: initials || "ST",
        completion: Math.min(95, 62 + index * 7),
        tasksDone: 6 + index * 2,
        activeTasks: Math.max(1, 3 - (index % 3)),
        reviewScore: Math.min(98, 76 + index * 5),
        commits: 18 + index * 9,
        docsTouched: 2 + index,
        note: t("adminProjectWorkspace.team.memberNote", { name: displayName(member) }),
        seed: contributorSeedFromId(studentIdValue(member) || index),
      };
    });
  }, [projectMembers, t]);

  const selectedContributor =
    workspaceContributors.find((item) => item.id === selectedContributorId) ||
    workspaceContributors[0];

  const displayOwner =
    project?.projectRepository?.owner ??
    project?.projectRepository?.ownerUsername ??
    urlOwner;
  const displayRepo =
    project?.projectRepository?.repositoryName ??
    urlRepo;
  const leadSupervisor = displayName(project?.teacher);
  const academicYearLabel = projectAcademicYearLabel(project);
  const hasAssignedRepository = Boolean(project?.projectRepository?.repositoryName);
  const groupName = project?.group?.name ?? "—";

  const repoPath =
    displayOwner && displayRepo
      ? `${displayOwner}/${displayRepo}`
      : t("adminProjectWorkspace.activity.repoPlaceholder");

  const contributionModel = useMemo(
    () =>
      buildRepoContributionYear(
        displayOwner || "owner",
        displayRepo || "repo",
        selectedContributor?.id,
        selectedContributor?.seed,
        contributionYear,
      ),
    [
      displayOwner,
      displayRepo,
      selectedContributor?.id,
      selectedContributor?.seed,
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

  const connectRepositorySubmit = () => {
    const repoId = String(selectedRepoId ?? "").trim();
    if (!repoId || !id || !project) return;
    connectRepository.mutate({
      id,
      ...buildProjectUpdatePayload(project, { projectRepository: repoId }),
    });
  };

  const inviteMembersSubmit = () => {
    if (!id || !selectedInvitees.length) return;
    inviteProjectMembers.mutate({
      id,
      invitations: selectedInvitees,
    });
  };

  if (id && projectLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-light-app-bg p-4 dark:bg-dark-card-bg">
        <p className="text-sm text-muted dark:text-dark-muted">
          {t("adminProjectWorkspace.loading")}
        </p>
      </div>
    );
  }

  if (id && !projectLoading && !project) {
    return (
      <div className="flex flex-1 items-center justify-center bg-light-app-bg p-4 dark:bg-dark-card-bg">
        <p className="text-sm text-muted dark:text-dark-muted">
          {t("adminProjectWorkspace.notFound")}
        </p>
      </div>
    );
  }

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
                  : project?.projectName
                    ? project.projectName.replace(/-/g, " ")
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

            <div className="flex w-full max-w-[26rem] flex-col gap-3 xl:min-w-[360px]">
              <div className="grid grid-cols-2 gap-3">
                <div className={`${SURFACE_INSET} p-4`}>
                  <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.summary.academicYear")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {academicYearLabel}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} p-4`}>
                  <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.summary.teamMembers")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {projectMembers.length}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} p-4`}>
                  <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.summary.leadSupervisor")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {leadSupervisor}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} p-4`}>
                  <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.summary.repositoryState")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {hasAssignedRepository
                      ? t("adminProjectWorkspace.summary.repositoryConnected")
                      : t("adminProjectWorkspace.summary.repositoryMissing")}
                  </p>
                </div>
              </div>

              <div className={`${SURFACE_INSET} flex flex-col gap-3 p-4`}>
                <div>
                  <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.summary.projectGroup")}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {groupName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    className="gap-2"
                    icon={ <UserPlus className="size-4" aria-hidden />}
                    onClick={() => setInviteOpen(true)}
                  >
                   
                    {t("adminProjectWorkspace.actions.inviteMembers")}
                  </Button>
                  {!hasAssignedRepository ? (
                    <Button
                      icon={<Link2 className="size-4" aria-hidden />}
                      type="button"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => setConnectRepoOpen(true)}
                    >
                      
                      {t("adminProjectWorkspace.actions.connectRepository")}
                    </Button>
                  ) : null}
                </div>
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
            value={projectMembers.length}
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
          <section className="flex flex-col gap-4">
            <ProjectRepositoryDocsPanel
              owner={displayOwner ?? ""}
              repo={displayRepo ?? ""}
            />
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
                  {workspaceContributors.map((person) => {
                    const isActive = person.id === selectedContributor?.id;

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
                      {selectedContributor?.name ?? "—"}
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
                      {selectedContributor?.commits ?? 0}
                    </p>
                  </div>
                  <div className={`${SURFACE_INSET} p-4`}>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Review score
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {selectedContributor?.reviewScore ?? 0}%
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
                      name: selectedContributor?.name ?? "—",
                      repo: repoPath,
                    })}
                  </p>
                </div>
                <div className={`${SURFACE_INSET} px-4 py-3 lg:max-w-sm`}>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.activity.contributorNote")}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-primary dark:text-dark-primary">
                    {selectedContributor?.note ?? "—"}
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

        <GlobalModal
          variant="sheet"
          open={inviteOpen}
          setOpen={setInviteOpen}
          title={t("adminProjectWorkspace.invite.title")}
          subtitle={t("adminProjectWorkspace.invite.subtitle")}
          isClose
          footer={
            <>
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setInviteOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={
                  !selectedInvitees.length || inviteProjectMembers.isPending
                }
                onClick={inviteMembersSubmit}
              >
                {inviteProjectMembers.isPending
                  ? t("adminProjects.form.project.actions.submitting")
                  : t("adminProjectWorkspace.invite.submit")}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold text-muted dark:text-dark-muted">
                {t("adminProjectWorkspace.invite.search")}
              </p>
              <SearchableSelect
                multiple
                value={selectedInvitees}
                onValueChange={setSelectedInvitees}
                options={inviteSelectOptions}
                placeholder={t("adminProjectWorkspace.invite.search")}
                searchPlaceholder={t("adminProjectWorkspace.invite.search")}
                searchValue={inviteSearchTerm}
                onSearchChange={setInviteSearchTerm}
                loading={isSearchingInvitees}
                clearSearchOnOpen={false}
                className="min-h-8 bg-(--color-light-card-bg) dark:bg-(--color-dark-card-bg)"
              />
              <p className="mt-2 text-[11px] text-muted dark:text-dark-muted">
                {t("adminProjectWorkspace.invite.hint")}
              </p>
            </div>

            <div className={`${SURFACE_INSET} p-4`}>
              <p className="text-[11px] font-semibold text-muted dark:text-dark-muted">
                {t("adminProjectWorkspace.invite.selected")}
              </p>
              <div className="mt-3 space-y-2">
                {selectedInviteeOptions.length ? (
                  selectedInviteeOptions.map((option) => (
                    <div
                      key={option.value}
                      className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-3 py-2 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                    >
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {option.label}
                      </p>
                      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                        {option.description || option.value}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted dark:text-dark-muted">
                    {t("adminProjectWorkspace.empty.noStudentsFound")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </GlobalModal>

        <GlobalModal
          variant="sheet"
          open={connectRepoOpen}
          setOpen={setConnectRepoOpen}
          title={t("adminProjectWorkspace.repository.title")}
          subtitle={t("adminProjectWorkspace.repository.subtitle")}
          isClose
          footer={
            <>
              <Button
                type="button"
                variant="tertiary"
                onClick={() => setConnectRepoOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!String(selectedRepoId ?? "").trim() || connectRepository.isPending}
                onClick={connectRepositorySubmit}
              >
                {connectRepository.isPending
                  ? t("adminProjects.form.project.actions.submitting")
                  : t("adminProjectWorkspace.repository.submit")}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold text-muted dark:text-dark-muted">
                {t("adminProjectWorkspace.repository.search")}
              </p>
              <SearchableSelect
                value={selectedRepoId}
                onValueChange={setSelectedRepoId}
                options={repoSelectOptions}
                placeholder={t("adminProjectWorkspace.repository.search")}
                searchPlaceholder={t("adminProjectWorkspace.repository.search")}
                searchValue={repoSearchTerm}
                onSearchChange={setRepoSearchTerm}
                loading={repoSearchBusy}
                clearable
                clearSearchOnOpen={false}
                className="min-h-8 bg-(--color-light-card-bg) dark:bg-(--color-dark-card-bg)"
              />
              <p className="mt-2 text-[11px] text-muted dark:text-dark-muted">
                {t("adminProjectWorkspace.repository.hint")}
              </p>
            </div>
          </div>
        </GlobalModal>
      </div>
    </div>
  );
}

export default ProjectWorkspace;
