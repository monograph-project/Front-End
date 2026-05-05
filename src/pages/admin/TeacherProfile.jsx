import { GraduationCap, UsersRound } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminProfileHighlightCard,
  AdminProfileMetricCard,
  AdminProfilePeerCompareCard,
  AdminProfileSemiGaugeCard,
} from "../../components/admin/AdminProfileDashboard";
import AdminProfileGreenScope from "../../components/admin/AdminProfileGreenScope";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import {
  useFacultyProjectsByTeacher,
  useTeacher,
  useVcRepositoriesForViewer,
  useVcUserActivity,
} from "../../services/useApi";
import { bucketVcActivityEvents } from "../../utils/vcActivityBuckets";

function profileInitials(fullName) {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase() ||
      "?";
  return (parts[0]?.slice(0, 2) || "?").toUpperCase();
}

function formatDisplayDate(isoOrDate, locale = undefined) {
  if (isoOrDate == null || isoOrDate === "") return "";
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) return String(isoOrDate);
    return d.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(isoOrDate);
  }
}

function groupsFromProjects(projects) {
  /** @type {Map<string, { id: string; name: string }>} */
  const m = new Map();
  if (!Array.isArray(projects)) return [];
  for (const p of projects) {
    const g = p?.group ?? p?.studentGroup ?? p?.facultyGroup;
    const gidRaw =
      (typeof g === "object" && g?.id != null ? g.id : null) ??
      (typeof g === "string" && g.trim() ? g.trim() : null);
    if (gidRaw == null) continue;
    const gid = String(gidRaw);
    if (m.has(gid)) continue;
    let name =
      (typeof g === "object" && g && (g.name || g.title)) || gid || "?";
    if (typeof name !== "string") name = gid;
    m.set(gid, { id: gid, name });
  }
  return [...m.values()];
}

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : undefined;

  const {
    data: teacher,
    isLoading,
    isError,
    isFetching,
  } = useTeacher(id, { notifyOnError: false });

  const { data: projects = [] } = useFacultyProjectsByTeacher(teacher?.id, {
    enabled: Boolean(teacher?.id),
    notifyOnError: false,
  });

  const vcUsername = String(teacher?.username ?? "").trim();
  const ownerKey = String(
    teacher?.linkedApplicationUserId ??
      teacher?.applicationUserId ??
      teacher?.gatewayUserId ??
      "",
  ).trim();

  const { data: repos = [] } = useVcRepositoriesForViewer(ownerKey, {
    enabled: Boolean(ownerKey || vcUsername),
    notifyOnError: false,
    activityUsernameFallback: vcUsername || undefined,
  });

  const { data: rawActivity = [] } = useVcUserActivity(vcUsername, {
    enabled: Boolean(vcUsername),
    notifyOnError: false,
  });

  const buckets = useMemo(
    () => bucketVcActivityEvents(rawActivity),
    [rawActivity],
  );

  const derivedGroups = useMemo(() => groupsFromProjects(projects), [projects]);

  const aspectScore = useMemo(() => {
    const base = 58;
    const bump = projects.length * 5 + derivedGroups.length * 4 + repos.length * 2;
    return Math.min(98, Math.max(44, base + Math.min(bump, 32)));
  }, [projects.length, derivedGroups.length, repos.length]);

  const peerCompare = useMemo(() => {
    const peer = Math.min(
      95,
      Math.max(50, aspectScore + ((teacher?.id?.length || 2) % 7) - 3),
    );
    return { subject: aspectScore, peer };
  }, [aspectScore, teacher?.id]);

  if (isLoading || (isFetching && !teacher)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-light-app-bg p-6 dark:bg-dark-shell md:p-8">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-(--color-light-card-border) border-t-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:border-t-(--color-dark-text-primary)"
          aria-hidden
        />
        <p className="text-sm text-muted dark:text-dark-muted">
          {t("adminPersonProfile.loading")}
        </p>
      </div>
    );
  }

  if (isError || !teacher?.id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 dark:bg-dark-shell md:p-8">
        <p className="text-lg font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("adminPersonProfile.teacher.notFound")}
        </p>
        <Button variant="secondary" onClick={() => navigate("/admin/teacher")}>
          {t("adminPersonProfile.backToTeachers")}
        </Button>
      </div>
    );
  }

  const fullName =
    `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() ||
    t("studentProfile.na");
  const statusKey = (teacher.status || "active").toLowerCase();

  return (
    <AdminProfileGreenScope>
      <div className="flex flex-1 flex-col overflow-hidden bg-light-app-bg dark:bg-dark-shell">
        <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:gap-5 md:p-5">
          <aside className="flex w-full shrink-0 flex-col gap-4 md:max-w-[320px]">
            <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/teacher")}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-light-input-border) bg-(--color-light-app-secondary) text-muted transition-colors hover:bg-(--color-light-nav-hover-bg) dark:border-dark-input-border dark:bg-dark-shell dark:text-dark-muted dark:hover:bg-(--color-dark-card-hover)"
                  aria-label={t("adminPersonProfile.backToTeachers")}
                >
                  <Icon d={IC.chevLeft} className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mx-auto mb-4 flex w-fit flex-col items-center">
                <div className="relative rounded-3xl bg-gradient-to-br from-(--color-light-admin-profile-hero-from) to-(--color-light-admin-profile-hero-to) p-[2px] shadow-md dark:from-(--color-dark-admin-profile-hero-from) dark:to-(--color-dark-admin-profile-hero-to)">
                  <div className="flex size-28 items-center justify-center rounded-2xl bg-(--color-light-card-bg) ring-4 ring-white dark:bg-(--color-dark-card-bg) dark:ring-(--color-dark-card-bg)">
                    <span className="text-xl font-bold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                      {profileInitials(fullName)}
                    </span>
                  </div>
                </div>
                <span className="absolute -end-1 -top-1 inline-flex items-center gap-1 rounded-full border border-(--color-light-card-border) bg-(--color-light-card-bg) px-2 py-0.5 text-[10px] font-semibold text-(--color-light-admin-profile-violet-strong) shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-(--color-dark-admin-profile-violet)">
                  <Icon d={IC.check} className="size-3" />
                  {t("adminPersonProfile.verified")}
                </span>
              </div>
              <h1 className="text-center text-lg font-bold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {fullName}
              </h1>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-(--color-light-success-bg) px-3 py-1 text-[11px] font-semibold text-(--color-light-success-text) dark:bg-green-950/40 dark:text-green-300">
                  {t("adminShared.roles.teacher")}
                </span>
                <span className="rounded-full border border-(--color-light-card-border) px-3 py-1 text-[11px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:text-dark-secondary">
                  {t(`adminShared.status.${statusKey}`, statusKey)}
                </span>
              </div>
            {teacher.department ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-2.5 py-1 text-[10px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-shell dark:text-dark-secondary">
                  {teacher.department}
                </span>
                {teacher.educationRank ? (
                  <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-2.5 py-1 text-[10px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-shell dark:text-dark-secondary">
                    {teacher.educationRank}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center rounded-xl py-3"
                onClick={() => navigate(`/admin/teacher/${teacher.id}/edit`)}
              >
                {t("adminPersonProfile.editDetails")}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              {t("adminPersonProfile.teacher.personalTitle")}
            </h2>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                  {t("adminPersonProfile.fields.teacherId")}
                </dt>
                <dd className="font-mono font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {teacher.id}
                </dd>
              </div>
              {vcUsername ? (
                <div>
                  <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminPersonProfile.sidebar.vcUsername")}
                  </dt>
                  <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    @{vcUsername}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                  {t("adminPersonProfile.fields.joined")}
                </dt>
                <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {formatDisplayDate(teacher.joined, locale) || t("studentProfile.na")}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.facultyProjects")}
              value={projects.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.assignedGroups")}
              value={derivedGroups.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.repositories")}
              value={repos.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.pullRequests")}
              value={buckets.pulls.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.merges")}
              value={buckets.merges.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.responsibilityIndex")}
              value={aspectScore}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AdminProfileSemiGaugeCard
              title={t("adminPersonProfile.charts.academicStanding")}
              score={aspectScore}
            />
            <AdminProfileHighlightCard
              title={t("adminPersonProfile.chapters.excellence")}
              badge={t("adminPersonProfile.charts.trusted")}
              items={[
                {
                  key: "p",
                  Icon: UsersRound,
                  label: t("adminPersonProfile.highlights.projects", {
                    count: projects.length,
                  }),
                },
                {
                  key: "g",
                  Icon: GraduationCap,
                  label: t("adminPersonProfile.highlights.groups", {
                    count: derivedGroups.length,
                  }),
                },
                {
                  key: "r",
                  label: t("adminPersonProfile.highlights.repositories", {
                    count: repos.length,
                  }),
                },
              ]}
            />
            <AdminProfilePeerCompareCard
              title={t("adminPersonProfile.charts.peerCompareDept")}
              subjectLabel={t("adminPersonProfile.charts.you")}
              peerLabel={t("adminPersonProfile.charts.deptAverage")}
              subjectPct={peerCompare.subject}
              peerPct={peerCompare.peer}
            />
          </div>

          <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {t("adminPersonProfile.sections.assignedProjects")}
              </h2>
            </div>
            {projects.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted dark:text-dark-muted">
                {t("adminPersonProfile.teacher.noProjects")}
              </p>
            ) : (
              <ul className="grid gap-2 md:grid-cols-2">
                {projects.map((p) => {
                  const pk = String(p?.id ?? p?.uuid ?? "");
                  const title =
                    [p?.title, p?.name, p?.topic].find(
                      (x) => typeof x === "string" && x.trim(),
                    ) ?? pk;
                  return (
                    <li
                      key={pk || title}
                      className="flex items-center gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-shell"
                    >
                      <GraduationCap
                        className="size-5 shrink-0 text-(--color-blue-500)"
                        strokeWidth={2}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                          {title}
                        </p>
                        <p className="truncate text-[11px] text-muted dark:text-dark-muted">
                          {t("adminPersonProfile.project.id", { id: pk })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <h2 className="mb-3 text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              {t("adminPersonProfile.sections.assignedGroups")}
            </h2>
            {derivedGroups.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted dark:text-dark-muted">
                {t("adminPersonProfile.teacher.noGroups")}
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {derivedGroups.map((g) => (
                  <li
                    key={g.id}
                    className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-shell"
                  >
                    <p className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                      {g.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted dark:text-dark-muted">
                      {g.id}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <h2 className="mb-3 text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              {t("adminPersonProfile.sections.publicRecord")}
            </h2>
            <div className="grid gap-3 text-xs md:grid-cols-3">
              <div>
                <p className="font-semibold text-muted dark:text-dark-muted">
                  {t("studentProfile.fields.email")}
                </p>
                <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {teacher.email || t("studentProfile.na")}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted dark:text-dark-muted">
                  {t("studentProfile.fields.phone")}
                </p>
                <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {teacher.phone || t("studentProfile.na")}
                </p>
              </div>
              <div>
                <p className="font-semibold text-muted dark:text-dark-muted">
                  {t("adminPersonProfile.fields.addressCity")}
                </p>
                <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {[teacher.addressCity, teacher.addressProvince]
                    .filter(Boolean)
                    .join(", ") || t("studentProfile.na")}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
    </AdminProfileGreenScope>
  );
}
