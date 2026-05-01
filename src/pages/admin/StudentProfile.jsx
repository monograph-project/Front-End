import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import { useStudent } from "../../services/useApi";

function formatDisplayDate(isoOrDate) {
  if (isoOrDate == null || isoOrDate === "") return "";
  try {
    const d = new Date(isoOrDate);
    if (Number.isNaN(d.getTime())) {
      const s = String(isoOrDate);
      return s.length >= 10 ? s.slice(0, 10) : s;
    }
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return String(isoOrDate);
  }
}

function displayOrDash(v, fallback) {
  if (v == null) return fallback;
  const s = `${v}`.trim();
  return s !== "" ? s : fallback;
}

const GENDER_I18N = {
  male: "studentForm.options.genderMale",
  female: "studentForm.options.genderFemale",
  other: "studentForm.options.genderOther",
};

function ProfileSection({ icon, title, children }) {
  return (
    <section className="card p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
        {icon}
        {title}
      </h2>
      <div className="divide-y divide-(--color-light-divider) dark:divide-(--color-dark-divider)">
        {children}
      </div>
    </section>
  );
}

function ProfileField({ label, value }) {
  const { t } = useTranslation();
  const display = displayOrDash(value, null);
  return (
    <div className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-start sm:gap-4">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
        {label}
      </span>
      <span className="text-sm font-medium break-words text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
        {display ?? t("studentProfile.na")}
      </span>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    data: student,
    isLoading,
    isError,
    isFetching,
  } = useStudent(id, { notifyOnError: false });

  if (isLoading || (isFetching && !student)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-light-app-bg p-6 dark:bg-dark-shell md:p-8">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-(--color-light-card-border) border-t-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:border-t-(--color-dark-text-primary)"
          aria-hidden
        />
        <p className="text-sm text-muted dark:text-dark-muted">
          {t("studentProfile.loading")}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 text-center dark:bg-dark-shell md:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-light-error-bg dark:bg-dark-error-bg">
          <Icon
            d={IC.x}
            className="h-6 w-6 text-light-error-text dark:text-dark-error-text"
          />
        </div>
        <p className="max-w-sm text-sm text-secondary dark:text-dark-secondary">
          {t("studentProfile.loadError")}
        </p>
        <Button variant="secondary" onClick={() => navigate("/admin/student")}>
          {t("studentProfile.backToList")}
        </Button>
      </div>
    );
  }

  if (!student || !student.id) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 dark:bg-dark-shell md:p-8">
        <p className="text-lg font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("studentProfile.notFound")}
        </p>
        <Button variant="secondary" onClick={() => navigate("/admin/student")}>
          {t("studentProfile.backToList")}
        </Button>
      </div>
    );
  }

  const fullName =
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    t("studentProfile.na");
  const batch =
    student.batch && typeof student.batch === "object" ? student.batch : null;
  const academicYear =
    batch?.academicYear && typeof batch.academicYear === "object"
      ? batch.academicYear
      : null;

  const statusKey = (student.status || "active").toLowerCase();
  const statusClass =
    statusKey === "active"
      ? "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
      : statusKey === "pending"
        ? "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
        : statusKey === "suspended"
          ? "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
          : "bg-muted text-muted-foreground";

  const g = (student.gender || "").toLowerCase();
  const genderLabel = GENDER_I18N[g] ? t(GENDER_I18N[g]) : displayOrDash(student.gender, "");

  return (
    <div className="flex-1 overflow-y-auto bg-light-app-bg p-4 dark:bg-dark-shell md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/student")}
              className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) text-muted transition-colors hover:bg-(--color-light-nav-hover-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-muted dark:hover:bg-(--color-dark-card-hover)"
              aria-label={t("studentProfile.backToList")}
            >
              <Icon d={IC.chevLeft} className="h-5 w-5" />
            </button>
            <Avatar
              src=""
              name={fullName}
              size="lg"
              className="shrink-0 ring-2 ring-(--color-light-card-border) dark:ring-(--color-dark-card-border)"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary) md:text-2xl">
                  {fullName}
                </h1>
                <span
                  className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}
                >
                  {t(`adminShared.status.${statusKey}`, statusKey)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted dark:text-dark-muted">
                {t("studentProfile.fields.studentId")}:{" "}
                <span className="font-mono text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {student.id}
                </span>
              </p>
              {student.username ? (
                <p className="mt-0.5 text-sm text-secondary dark:text-dark-secondary">
                  @{student.username}
                </p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => navigate(`/admin/student/${student.id}/edit`)}
            className="shrink-0 self-start sm:self-auto"
          >
            {t("studentProfile.edit")}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ProfileSection
            icon={<Icon d={IC.idcard} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.identity")}
          >
            <ProfileField
              label={t("studentProfile.fields.fullName")}
              value={fullName}
            />
            <ProfileField
              label={t("studentProfile.fields.fatherName")}
              value={student.fatherName}
            />
            <ProfileField
              label={t("studentProfile.fields.grandFatherName")}
              value={student.grandFatherName}
            />
            <ProfileField
              label={t("studentProfile.fields.gender")}
              value={genderLabel}
            />
            <ProfileField
              label={t("studentProfile.fields.dateOfBirth")}
              value={formatDisplayDate(student.dateOfBirth)}
            />
            <ProfileField
              label={t("studentProfile.fields.nationality")}
              value={student.nationality}
            />
          </ProfileSection>

          <ProfileSection
            icon={<Icon d={IC.info} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.contact")}
          >
            <ProfileField
              label={t("studentProfile.fields.email")}
              value={student.email}
            />
            <ProfileField
              label={t("studentProfile.fields.phone")}
              value={student.phone}
            />
          </ProfileSection>

          <ProfileSection
            icon={<Icon d={IC.company} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.address")}
          >
            <ProfileField
              label={t("studentProfile.fields.street")}
              value={student.addressStreet}
            />
            <ProfileField
              label={t("studentProfile.fields.city")}
              value={student.addressCity}
            />
            <ProfileField
              label={t("studentProfile.fields.province")}
              value={student.addressProvince}
            />
            <ProfileField
              label={t("studentProfile.fields.postalCode")}
              value={student.addressPostalCode}
            />
          </ProfileSection>

          <ProfileSection
            icon={<Icon d={IC.academic} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.academic")}
          >
            <ProfileField
              label={t("studentProfile.fields.department")}
              value={student.department}
            />
            <ProfileField
              label={t("studentProfile.fields.semester")}
              value={
                student.semester
                  ? t(`studentForm.options.semester${student.semester}`)
                  : ""
              }
            />
            <ProfileField
              label={t("studentProfile.fields.enrollmentDate")}
              value={formatDisplayDate(student.enrollmentDate)}
            />
            <ProfileField
              label={t("studentProfile.fields.kankorId")}
              value={student.kankorId}
            />
            <ProfileField
              label={t("studentProfile.fields.studentCode")}
              value={student.code}
            />
            <ProfileField
              label={t("studentProfile.fields.role")}
              value={student.role}
            />
          </ProfileSection>
        </div>

        {batch ? (
          <ProfileSection
            icon={<Icon d={IC.calendar} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.batch")}
          >
            <ProfileField label={t("studentForm.fields.batch.label")} value={batch.name} />
            <ProfileField
              label={t("studentProfile.batch.type")}
              value={batch.type}
            />
            <ProfileField
              label={t("studentProfile.batch.year")}
              value={batch.year}
            />
            <ProfileField
              label={t("studentProfile.fields.status")}
              value={
                batch.isActive
                  ? t("studentProfile.batch.active")
                  : t("studentProfile.batch.inactive")
              }
            />
            <ProfileField
              label={t("studentProfile.batch.period")}
              value={
                formatDisplayDate(batch.startDate) && formatDisplayDate(batch.endDate)
                  ? `${formatDisplayDate(batch.startDate)} — ${formatDisplayDate(batch.endDate)}`
                  : ""
              }
            />
            <ProfileField
              label={t("studentProfile.batch.description")}
              value={batch.description}
            />
            {academicYear ? (
              <>
                <ProfileField
                  label={t("studentProfile.batch.academicYear")}
                  value={academicYear.name}
                />
                <ProfileField
                  label={t("studentProfile.batch.calendar")}
                  value={academicYear.calendarType}
                />
                <ProfileField
                  label={t("studentProfile.batch.periodSolar")}
                  value={
                    formatDisplayDate(academicYear.startDate) &&
                    formatDisplayDate(academicYear.endDate)
                      ? `${formatDisplayDate(academicYear.startDate)} — ${formatDisplayDate(academicYear.endDate)}`
                      : ""
                  }
                />
              </>
            ) : null}
          </ProfileSection>
        ) : student.batchId ? (
          <ProfileSection
            icon={<Icon d={IC.calendar} className="h-4 w-4 opacity-80" />}
            title={t("studentProfile.sections.batch")}
          >
            <ProfileField
              label={t("studentForm.fields.batch.label")}
              value={student.batchId}
            />
          </ProfileSection>
        ) : null}
      </div>
    </div>
  );
}
