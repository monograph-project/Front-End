import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Clock, Eye, GitBranch, Globe, MapPin, Star } from "lucide-react";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";
import { useStudentActivityEpoch } from "../../context/StudentActivityContext";
import { useTheme } from "../../context/themContext";
import {
  useFacultyProjectsByStudent,
  useLinkedStudentRecord,
  useVcRepositoriesForViewer,
  useVcUserActivity,
} from "../../services/useApi";
import {
  buildPersonInitials,
  resolveProfilePhotoUrl,
} from "../../lib/profileMedia";
import { readEngagementDailyMs } from "../../lib/studentEngagementStorage";
import { bucketVcActivityEvents } from "../../utils/vcActivityBuckets";

const SURFACE_CARD =
  "rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg)  dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";
const SOFT_PANEL =
  "rounded-md border border-(--color-light-card-border) bg-light-app-tertiary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary";

function displayOrDash(value, fallback = "—") {
  if (value == null) return fallback;
  const text = String(value).trim();
  return text ? text : fallback;
}
const pinned = [
  {
    name: "student-portfolio",
    visibility: "Public",
    desc: "Portfolio and projects.",
    stars: 12,
  },
  {
    name: "course-notes",
    visibility: "Private",
    desc: "Personal course notes.",
    stars: 3,
  },
];

function formatDate(value, locale) {
  if (!value) return "";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return String(value);
  }
}

function formatMonthYear(value, locale) {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
    }).format(value);
  } catch {
    return "";
  }
}

function formatStatus(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function StatPill({ value, label }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-lg font-bold text-primary dark:text-dark-primary">
        {value}
      </div>
      <div className="text-xs text-secondary dark:text-dark-secondary">
        {label}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href = "" }) {
  const content = href ? (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="break-all text-sm font-medium text-(--color-chart-blue-primary) transition-colors hover:underline dark:text-(--color-chart-blue-secondary)"
    >
      {value}
    </a>
  ) : (
    <p className="break-words text-sm font-medium text-primary dark:text-dark-primary">
      {value}
    </p>
  );

  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted dark:text-dark-muted"
        strokeWidth={1.9}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-xs text-secondary dark:text-dark-secondary">
          {label}
        </p>
        <div className="mt-1 min-w-0">{content}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showMore, setShowMore] = useState(false);
  const activityEpoch = useStudentActivityEpoch();

  const {
    data: student,
    isLoading,
    isError,
  } = useLinkedStudentRecord(user, {
    notifyOnError: false,
    enabled: Boolean(user),
  });

  const hasStudentRecord = Boolean(student?.id);
  const showUnlinkedNotice = !isLoading && (isError || !hasStudentRecord);
  const locale = i18n.language || undefined;

  const labelName =
    user?.fullName ||
    [student?.firstName, student?.lastName].filter(Boolean).join(" ").trim() ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim() ||
    user?.username ||
    user?.user_name ||
    user?.email ||
    t("studentProfile.na");

  const username = displayOrDash(
    student?.username || user?.username || user?.user_name,
    t("studentProfile.na"),
  );
  const photoUrl = useMemo(
    () => resolveProfilePhotoUrl(student ?? user ?? {}),
    [student, user],
  );
  const initials = useMemo(
    () => buildPersonInitials(student ?? user ?? {}, user?.email),
    [student, user],
  );

  const ownerKey = String(
    student?.linkedApplicationUserId ?? user?.id ?? "",
  ).trim();
  const vcUsername = String(student?.username ?? user?.username ?? "").trim();
  const joinedDate =
    formatDate(user?.createdAt || user?.created_at, locale) ||
    t("studentProfile.na");
  const location = [student?.addressCity, student?.addressProvince]
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .join(", ");
  const statusLabel = formatStatus(student?.status) || t("studentProfile.na");
  const semesterLabel = student?.semester
    ? t(`studentForm.options.semester${student.semester}`)
    : t("studentProfile.na");
  const headline = [
    student?.department,
    semesterLabel !== t("studentProfile.na") ? semesterLabel : "",
  ]
    .filter(Boolean)
    .join(" • ");

  const { data: repos = [] } = useVcRepositoriesForViewer(ownerKey, {
    enabled: Boolean(ownerKey || vcUsername),
    notifyOnError: false,
    activityUsernameFallback: vcUsername || undefined,
  });

  const { data: rawActivity = [] } = useVcUserActivity(vcUsername, {
    enabled: Boolean(vcUsername),
    notifyOnError: false,
  });

  const { data: facultyProjects = [] } = useFacultyProjectsByStudent(
    student?.id,
    {
      enabled: Boolean(student?.id),
      notifyOnError: false,
    },
  );

  const buckets = useMemo(
    () => bucketVcActivityEvents(rawActivity),
    [rawActivity],
  );
  const dailyMs = useMemo(() => readEngagementDailyMs(), [activityEpoch]);

  const totalContributions = useMemo(() => {
    return Object.values(dailyMs).reduce(
      (sum, value) => sum + Math.round((value ?? 0) / 60000),
      0,
    );
  }, [dailyMs]);

  const weeks = useMemo(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - 364);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      days.push({ key, value: Math.round((dailyMs[key] ?? 0) / 60000) });
    }

    const cols = [];
    for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
    return cols;
  }, [dailyMs]);

  const repositories = [
    {
      id: 1,
      name: "student-portfolio",
      description:
        "A comprehensive portfolio website showcasing projects and skills.",
      visibility: "Public",
      stars: 12,
      forks: 4,
      language: "TypeScript",
      updatedAt: "2 days ago",
    },
    {
      id: 2,
      name: "course-notes",
      description:
        "Personal notes and summaries from computer science courses.",
      visibility: "Private",
      stars: 3,
      forks: 0,
      language: "Markdown",
      updatedAt: "1 week ago",
    },
    {
      id: 3,
      name: "react-components-library",
      description:
        "Reusable React components for building modern web applications.",
      visibility: "Public",
      stars: 28,
      forks: 7,
      language: "TypeScript",
      updatedAt: "3 days ago",
    },
    {
      id: 4,
      name: "data-structures-js",
      description:
        "Implementation of common data structures and algorithms in JavaScript.",
      visibility: "Public",
      stars: 15,
      forks: 3,
      language: "JavaScript",
      updatedAt: "1 month ago",
    },
    {
      id: 5,
      name: "machine-learning-experiments",
      description:
        "Experiments and learning projects with machine learning models.",
      visibility: "Private",
      stars: 2,
      forks: 1,
      language: "Python",
      updatedAt: "2 weeks ago",
    },
    {
      id: 6,
      name: "web-scraper-tool",
      description: "Tool for scraping and processing web data efficiently.",
      visibility: "Public",
      stars: 8,
      forks: 2,
      language: "Python",
      updatedAt: "5 days ago",
    },
  ];
  const visibilityColor = (visibility) => {
    if (visibility === "Private") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    return "bg-green-50 text-green-700 border-green-200";
  };

  const languageColor = (language) => {
    const colors = {
      TypeScript: { dot: "#3178c6", label: "TypeScript" },
      JavaScript: { dot: "#f7df1e", label: "JavaScript" },
      Python: { dot: "#3776ab", label: "Python" },
      Markdown: { dot: "#083fa1", label: "Markdown" },
    };
    return colors[language] || { dot: "#858585", label: language };
  };

  const heatmapMax = Math.max(1, ...weeks.flat().map((day) => day?.value ?? 0));
  const getIntensityStyle = (value) => {
    const intensity = Math.round((value / heatmapMax) * 4);
    const light = [
      "var(--color-light-app-tertiary)",
      "var(--color-light-badge-bg)",
      "var(--color-blue-200)",
      "var(--color-blue-400)",
      "var(--color-blue-600)",
    ];
    const dark = [
      "var(--color-dark-app-tertiary)",
      "var(--color-dark-badge-bg)",
      "var(--color-dark-btn-tertiary-border)",
      "var(--color-chart-blue-secondary)",
      "var(--color-dark-badge-text)",
    ];
    return {
      backgroundColor:
        (theme === "dark" ? dark : light)[intensity] ||
        (theme === "dark" ? dark[0] : light[0]),
    };
  };

  const pinnedItems = useMemo(() => {
    if (repos.length > 0) {
      return repos.slice(0, 2).map((repo, index) => ({
        key: String(repo?.id ?? repo?.name ?? index),
        name:
          repo?.name ||
          repo?.repoName ||
          repo?.full_name ||
          repo?.fullName ||
          t("studentSelfProfile.pinned.repositoryFallback", {
            count: index + 1,
          }),
        visibility: repo?.private
          ? t("studentSelfProfile.visibility.private")
          : t("studentSelfProfile.visibility.public"),
        desc:
          repo?.description ||
          t("studentSelfProfile.pinned.repositoryDescriptionFallback"),
        stars: Number(
          repo?.stars ?? repo?.stargazers_count ?? repo?.stargazersCount ?? 0,
        ),
      }));
    }

    return facultyProjects.slice(0, 2).map((project, index) => ({
      key: String(project?.id ?? index),
      name:
        project?.title ||
        project?.name ||
        project?.topic ||
        t("studentSelfProfile.pinned.projectFallback", { count: index + 1 }),
      visibility: t("studentSelfProfile.visibility.academic"),
      desc:
        project?.description ||
        project?.department?.name ||
        project?.departmentName ||
        t("studentSelfProfile.pinned.projectDescriptionFallback"),
      stars: 0,
    }));
  }, [facultyProjects, repos, t]);

  const allContributionRows = useMemo(
    () =>
      [...buckets.pushes, ...buckets.pulls, ...buckets.merges].sort(
        (a, b) => (b.at || 0) - (a.at || 0),
      ),
    [buckets],
  );

  const contributionRows = useMemo(
    () =>
      showMore
        ? allContributionRows.slice(0, 8)
        : allContributionRows.slice(0, 4),
    [allContributionRows, showMore],
  );

  const leftBadges = [
    student?.department,
    semesterLabel !== t("studentProfile.na") ? semesterLabel : "",
    statusLabel !== t("studentProfile.na") ? statusLabel : "",
  ].filter(Boolean);

  if (isLoading) {
    return (
      <div className="relative flex-1 bg-light-app-bg p-4 pb-8 dark:bg-dark-card-bg md:p-5">
        <div
          className={`${SURFACE_CARD} mx-auto max-w-7xl p-6 text-sm text-secondary dark:text-dark-secondary`}
        >
          {t("studentProfile.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 bg-white p-4 pb-8 dark:bg-dark-card-bg md:p-5">
      <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
        {showUnlinkedNotice ? (
          <section className="rounded-[1.25rem] border border-(--color-light-warning-border) bg-(--color-light-warning-bg) px-4 py-3 text-sm text-(--color-light-warning-text) dark:border-(--color-dark-warning-border) dark:bg-(--color-dark-warning-bg) dark:text-(--color-dark-warning-text)">
            {t("studentSelfProfile.unlinkedNotice")}
          </section>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="min-w-0">
            <div className={`${SURFACE_CARD} min-w-0 p-5 md:p-6`}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-(--color-light-card-border) dark:border-(--color-dark-card-border)">
                  <Avatar
                    src={photoUrl}
                    alt={labelName}
                    initials={initials}
                    sizeClass="flex h-32 w-32 items-center justify-center rounded-full text-3xl"
                  />
                </div>

                <h1 className="break-words text-2xl font-bold text-primary dark:text-dark-primary">
                  {labelName}
                </h1>
                <p className="mt-2 break-all text-sm text-secondary dark:text-dark-secondary">
                  @{username}
                </p>
                <p className="mt-3 text-sm text-primary dark:text-dark-primary">
                  {headline || t("studentSelfProfile.header.subtitle")}
                </p>

                <Link to="/student/settings" className="mt-5 w-full">
                  <Button type="button" variant="primary" fullWidth>
                    {t("studentSelfProfile.actions.editProfile")}
                  </Button>
                </Link>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <StatPill
                    value={String(repos.length)}
                    label={t("studentSelfProfile.stats.repositories")}
                  />
                  <div className="text-secondary dark:text-dark-secondary">
                    ·
                  </div>
                  <StatPill
                    value={String(facultyProjects.length)}
                    label={t("studentSelfProfile.stats.projects")}
                  />
                </div>

                <div className="mt-8 w-full space-y-4 text-left">
                  <InfoRow
                    icon={MapPin}
                    label={t("studentSelfProfile.info.location")}
                    value={location || t("studentProfile.na")}
                  />
                  <InfoRow
                    icon={Globe}
                    label={t("studentSelfProfile.info.repositoryUsername")}
                    value={vcUsername || t("studentProfile.na")}
                  />
                  <InfoRow
                    icon={Clock}
                    label={t("studentSelfProfile.info.memberSince")}
                    value={joinedDate}
                  />
                </div>

                <div className="mt-8 flex max-w-full flex-wrap justify-center gap-2">
                  {leftBadges.map((badge) => (
                    <span
                      key={badge}
                      className="badge max-w-full break-words text-center"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            <section className={`${SURFACE_CARD} p-4`}>
              <p className="text-sm text-primary dark:text-dark-primary">
                {t("studentSelfProfile.achievement.banner", {
                  count: totalContributions,
                })}
              </p>
            </section>

            <section className={`${SURFACE_CARD} min-w-0 p-4 md:p-5`}>
              <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                {t("studentSelfProfile.pinned.title")}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {pinnedItems.length === 0 ? (
                  <div
                    className={`${SOFT_PANEL} p-4 text-sm text-secondary dark:text-dark-secondary sm:col-span-2`}
                  >
                    {t("studentSelfProfile.pinned.empty")}
                  </div>
                ) : (
                  pinnedItems.map((item) => (
                    <div
                      key={item.key}
                      className="min-w-0 rounded-[1.15rem] border border-(--color-light-card-border) p-4 dark:border-(--color-dark-card-border)"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-primary dark:text-dark-primary">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs text-secondary dark:text-dark-secondary">
                            {item.visibility}
                          </p>
                          <p className="mt-2 break-words text-xs leading-5 text-secondary dark:text-dark-secondary">
                            {item.desc}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 text-secondary dark:text-dark-secondary">
                          <Star
                            className="size-4"
                            strokeWidth={1.9}
                            aria-hidden
                          />
                          <span className="text-sm">{item.stars}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className={`${SURFACE_CARD} min-w-0 p-4 md:p-5`}>
              <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                {t("studentSelfProfile.heatmap.title", {
                  count: totalContributions,
                })}
              </h2>
              <div className="mt-4 max-w-full overflow-x-auto py-2">
                <div className="flex min-w-max gap-1">
                  {weeks.map((col, index) => (
                    <div key={index} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, rowIndex) => {
                        const cell = col[rowIndex];
                        const value = cell?.value ?? 0;
                        return (
                          <div
                            key={rowIndex}
                            title={`${cell?.key || ""}: ${value} ${t("studentSelfProfile.activity.minutes")}`}
                            className="h-3 w-3 rounded-[4px] border border-white/10"
                            style={getIntensityStyle(value)}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className={`${SURFACE_CARD} min-w-0 p-4 md:p-5`}>
              <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                {t("studentSelfProfile.activityFeed.title")}
              </h2>

              <div className="mt-6 space-y-6">
                <div className="border-s-2 border-light-divider ps-4 dark:border-dark-divider">
                  <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {formatMonthYear(new Date(), locale)}
                  </p>
                  <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
                    {t("studentSelfProfile.heatmap.title", {
                      count: totalContributions,
                    })}
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {contributionRows.length === 0 ? (
                      <div
                        className={`${SOFT_PANEL} p-4 text-sm text-secondary dark:text-dark-secondary sm:col-span-2`}
                      >
                        {t("studentSelfProfile.activityFeed.empty")}
                      </div>
                    ) : (
                      contributionRows.map((item) => (
                        <div
                          key={item.id}
                          className="min-w-0 rounded-[1.15rem] border border-(--color-light-card-border) p-4 dark:border-(--color-dark-card-border)"
                        >
                          <p className="break-words text-sm font-semibold text-primary dark:text-dark-primary">
                            {item.label}
                          </p>
                          <p className="mt-2 break-all text-xs leading-5 text-secondary dark:text-dark-secondary">
                            {displayOrDash(
                              item.repo,
                              t("studentSelfProfile.recent.noRepository"),
                            )}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {allContributionRows.length > 4 ? (
                <div className="mt-6 text-center">
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => setShowMore((current) => !current)}
                  >
                    {showMore
                      ? t("studentSelfProfile.actions.showLess")
                      : t("studentSelfProfile.actions.showMore")}
                  </Button>
                </div>
              ) : null}
            </section>
            <div className="rounded-xl border border-[#e4e8ef] bg-white p-6 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <h3 className="text-lg font-semibold text-[#0a1224] dark:text-dark-text-primary">
                Repositories
              </h3>

              <div className="mt-4 space-y-3">
                {repositories.map((repo) => {
                  const lang = languageColor(repo.language);
                  return (
                    <div
                      key={repo.id}
                      className="rounded-lg border border-[#e4e8ef] bg-white p-4 transition-colors hover:border-[#cfd7e6] hover:bg-[#f7f8fa] dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-app-tertiary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Repo Name & Visibility */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="cursor-pointer text-sm font-semibold text-[#0a1224] hover:text-[#0066ff] dark:text-dark-text-primary dark:hover:text-(--color-chart-blue-secondary)">
                              {repo.name}
                            </h4>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${visibilityColor(repo.visibility)}`}
                            >
                              {repo.visibility}
                            </span>
                          </div>

                          {/* Description */}
                          <p className="mt-2 line-clamp-2 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
                            {repo.description}
                          </p>

                          {/* Footer: Language, Stars, Forks, Updated */}
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#5f6f87] dark:text-dark-text-secondary">
                            {repo.language && (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="inline-block w-2 h-2 rounded-full"
                                  style={{ backgroundColor: lang.dot }}
                                />
                                <span>{repo.language}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              <span>{repo.stars}</span>
                            </div>

                            <div className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3" />
                              <span>{repo.forks}</span>
                            </div>

                            <span className="text-[#98a2b3] dark:text-dark-text-muted">
                              Updated {repo.updatedAt}
                            </span>
                          </div>
                        </div>

                        {/* Right Side: Eye Icon */}
                        <div className="flex-shrink-0">
                          <Eye className="h-4 w-4 cursor-pointer text-[#98a2b3] hover:text-[#0a1224] dark:text-dark-text-muted dark:hover:text-dark-text-primary" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {repositories.length > 6 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="rounded-lg border border-[#e4e8ef] px-6 py-2 text-sm font-medium text-[#0066ff] transition-colors hover:bg-[#edf4ff] dark:border-(--color-dark-card-border) dark:text-(--color-chart-blue-secondary) dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-dark-app-tertiary"
                  >
                    {showMore
                      ? "Show less repositories"
                      : "Show more repositories"}
                  </button>
                </div>
              )}
            </div>
            <div className="rounded-xl border border-[#e4e8ef] bg-white p-6 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <h3 className="text-lg font-semibold text-[#0a1224] dark:text-dark-text-primary">
                Contribution activity
              </h3>

              <div className="mt-6 space-y-6">
                <div
                  className="border-s-2 border-[#e4e8ef] ps-4 dark:border-dark-divider"
                >
                  <p className="text-sm font-semibold text-[#0a1224] dark:text-dark-text-primary">
                    May 2026
                  </p>
                  <p className="mt-1 text-sm text-[#5f6f87] dark:text-dark-text-secondary">
                    {totalContributions} contributions in the last year
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {pinned.map((p) => (
                      <div
                        key={p.name}
                        className="rounded-lg border border-[#e4e8ef] bg-white p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
                      >
                        <p className="text-sm font-semibold text-[#0a1224] dark:text-dark-text-primary">
                          {p.name}
                        </p>
                        <p className="mt-2 text-xs text-[#5f6f87] dark:text-dark-text-secondary">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
