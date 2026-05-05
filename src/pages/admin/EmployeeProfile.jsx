import { Building2, IdCard } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  AdminProfileHighlightCard,
  AdminProfileMetricCard,
  AdminProfilePeerCompareCard,
  AdminProfileSemiGaugeCard,
  AdminProfileWorkloadDonutCard,
} from "../../components/admin/AdminProfileDashboard";
import AdminProfileGreenScope from "../../components/admin/AdminProfileGreenScope";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import { useEmployee, useVcRepositoriesForViewer, useVcUserActivity } from "../../services/useApi";
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

export default function EmployeeProfile() {
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
    data: employee,
    isLoading,
    isError,
    isFetching,
  } = useEmployee(id, { notifyOnError: false });

  const vcUsername = String(employee?.username ?? "").trim();
  const ownerKey = String(
    employee?.linkedApplicationUserId ??
      employee?.applicationUserId ??
      employee?.gatewayUserId ??
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

  const workloadSegments = useMemo(() => {
    const deptScore = employee?.department ? 42 : 12;
    const rankScore =
      typeof employee?.educationRank === "string" && employee.educationRank.trim()
        ? 28
        : 12;
    const tenureScore = employee?.joined ? 30 : 10;
    return [
      {
        key: "dept",
        label: t("adminPersonProfile.employee.segmentDept"),
        value: deptScore,
        color: "var(--color-blue-500)",
      },
      {
        key: "rank",
        label: t("adminPersonProfile.employee.segmentCredential"),
        value: rankScore,
        color: "var(--color-blue-300)",
      },
      {
        key: "tenure",
        label: t("adminPersonProfile.employee.segmentTenure"),
        value: tenureScore,
        color: "#c4b5fd",
      },
    ];
  }, [employee, t]);

  const aspectScore = useMemo(() => {
    const active = employee?.status === "active" ? 12 : 0;
    const base = 55 + active + Math.min(repos.length * 3 + buckets.pulls.length, 18);
    return Math.min(97, Math.max(46, base));
  }, [employee?.status, repos.length, buckets.pulls.length]);

  const peerCompare = useMemo(() => ({
    subject: aspectScore,
    peer: Math.min(
      94,
      Math.max(
        52,
        aspectScore + ((employee?.id?.length || 4) % 8) - 4,
      ),
    ),
  }), [aspectScore, employee?.id]);

  if (isLoading || (isFetching && !employee)) {
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

  if (isError || !employee?.id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 dark:bg-dark-shell md:p-8">
        <p className="text-lg font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("adminPersonProfile.employee.notFound")}
        </p>
        <Button variant="secondary" onClick={() => navigate("/admin/employee")}>
          {t("adminPersonProfile.backToEmployees")}
        </Button>
      </div>
    );
  }

  const fullName =
    `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
    t("studentProfile.na");
  const statusKey = (employee.status || "active").toLowerCase();

  return (
    <AdminProfileGreenScope>
      <div className="flex flex-1 flex-col overflow-hidden bg-light-app-bg dark:bg-dark-shell">
        <div className="flex flex-1 min-h-0 flex-col gap-4 overflow-y-auto p-4 md:flex-row md:gap-5 md:p-5">
          <aside className="flex w-full shrink-0 flex-col gap-4 md:max-w-[320px]">
            <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/admin/employee")}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-light-input-border) bg-(--color-light-app-secondary) text-muted transition-colors hover:bg-(--color-light-nav-hover-bg) dark:border-dark-input-border dark:bg-dark-shell dark:text-dark-muted dark:hover:bg-(--color-dark-card-hover)"
                  aria-label={t("adminPersonProfile.backToEmployees")}
                >
                  <Icon d={IC.chevLeft} className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mx-auto mb-4 flex w-fit flex-col items-center">
                <div className="rounded-3xl bg-gradient-to-br from-(--color-light-admin-profile-hero-from) to-(--color-light-admin-profile-hero-to) p-[2px] shadow-md dark:from-(--color-dark-admin-profile-hero-from) dark:to-(--color-dark-admin-profile-hero-to)">
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
                  {t("adminShared.roles.staff")}
                </span>
                <span className="rounded-full border border-(--color-light-card-border) px-3 py-1 text-[11px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:text-dark-secondary">
                  {t(`adminShared.status.${statusKey}`, statusKey)}
                </span>
              </div>
            {employee.department || employee.faculty ? (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {employee.department ? (
                  <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-2.5 py-1 text-[10px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-shell dark:text-dark-secondary">
                    {employee.department}
                  </span>
                ) : null}
                {employee.faculty ? (
                  <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-app-secondary) px-2.5 py-1 text-[10px] font-semibold text-secondary dark:border-(--color-dark-card-border) dark:bg-dark-shell dark:text-dark-secondary">
                    {employee.faculty}
                  </span>
                ) : null}
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center rounded-xl py-3"
                onClick={() => navigate(`/admin/employee/${employee.id}/edit`)}
              >
                {t("adminPersonProfile.editDetails")}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              {t("adminPersonProfile.employee.personnelCard")}
            </h2>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                  {t("adminPersonProfile.fields.employeeId")}
                </dt>
                <dd className="font-mono font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {employee.id}
                </dd>
              </div>
              {employee.facultyPosition ? (
                <div>
                  <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                    {t("adminPersonProfile.fields.position")}
                  </dt>
                  <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {employee.facultyPosition}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[10px] font-semibold text-muted dark:text-dark-muted">
                  {t("adminPersonProfile.fields.hireDate")}
                </dt>
                <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {formatDisplayDate(employee.joined, locale) ||
                    formatDisplayDate(employee.hireDate, locale) ||
                    t("studentProfile.na")}
                </dd>
              </div>
            </dl>
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
              label={t("adminPersonProfile.metrics.pushes")}
              value={buckets.pushes.length}
              suffix=""
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.readiness")}
              value={aspectScore}
            />
            <AdminProfileMetricCard
              label={t("adminPersonProfile.metrics.policies")}
              value={employee.status === "active" ? 94 : 58}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <AdminProfileSemiGaugeCard
              title={t("adminPersonProfile.employee.performanceGauge")}
              score={aspectScore}
            />
            <AdminProfileHighlightCard
              title={t("adminPersonProfile.employee.strengths")}
              badge={t("adminPersonProfile.charts.compliant")}
              items={[
                {
                  key: "dept",
                  Icon: Building2,
                  label: employee.department || t("studentProfile.na"),
                },
                {
                  key: "pos",
                  Icon: IdCard,
                  label:
                    employee.facultyPosition ||
                    t("adminPersonProfile.employee.noPosition"),
                },
                {
                  key: "vc",
                  label: t("adminPersonProfile.highlights.repositories", {
                    count: repos.length,
                  }),
                },
              ]}
            />
            <AdminProfilePeerCompareCard
              title={t("adminPersonProfile.charts.peerCompareOrg")}
              subjectLabel={t("adminPersonProfile.charts.you")}
              peerLabel={t("adminPersonProfile.charts.orgAverage")}
              subjectPct={peerCompare.subject}
              peerPct={peerCompare.peer}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <h2 className="mb-4 text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {t("adminPersonProfile.sections.publicRecord")}
              </h2>
              <div className="grid gap-3 text-xs md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="font-semibold text-muted dark:text-dark-muted">
                    {t("studentProfile.fields.email")}
                  </p>
                  <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {employee.email || t("studentProfile.na")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-muted dark:text-dark-muted">
                    {t("studentProfile.fields.phone")}
                  </p>
                  <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {employee.phone || t("studentProfile.na")}
                  </p>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="font-semibold text-muted dark:text-dark-muted">
                    {t("adminPersonProfile.fields.street")}
                  </p>
                  <p className="truncate font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {[employee.addressStreet, employee.addressCity, employee.addressProvince]
                      .filter(Boolean)
                      .join(", ") || t("studentProfile.na")}
                  </p>
                </div>
              </div>
            </div>
            <AdminProfileWorkloadDonutCard
              title={t("adminPersonProfile.employee.profileMix")}
              segments={workloadSegments}
            />
          </div>
        </main>
      </div>
    </div>
    </AdminProfileGreenScope>
  );
}
