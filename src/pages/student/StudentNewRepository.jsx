import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookMarked, Globe2, Lock, Slash } from "lucide-react";
import { gooeyToast } from "goey-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Field from "../../components/Field";
import Select from "../../components/Select";
import { useVcCreateRepository } from "../../services/useApi";
import { cn } from "../../lib/utils";

const DESC_MAX = 350;
/** Radix Select forbids `<Select.Item value="">` — use this sentinel then strip on submit */
const NONE_OPTION_VALUE = "__none__";

const ADJECTIVES = [
  "supreme",
  "bright",
  "quiet",
  "lucky",
  "swift",
  "gentle",
  "cosmic",
  "stellar",
  "crisp",
  "noble",
  "crimson",
];

const NOUNS = [
  "succotash",
  "notebook",
  "horizon",
  "stream",
  "orchid",
  "harbor",
  "ember",
  "canvas",
  "vector",
  "bridge",
  "compass",
  "ledger",
];

function generateRepoSuggestion() {
  const i = Math.floor(Math.random() * ADJECTIVES.length);
  const j = Math.floor(Math.random() * NOUNS.length);
  return `${ADJECTIVES[i]}-${NOUNS[j]}`;
}

function ownerInitials(username) {
  const u = String(username ?? "").trim();
  if (!u) return "??";
  const parts = u.split(/[._\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase().slice(0, 2);
  }
  return u.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "GH";
}

function slugRepoName(raw) {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function StepRail({ step, children, last }) {
  return (
    <div className="flex gap-5 md:gap-8">
      <div className="flex shrink-0 flex-col items-center">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-full border border-(--color-light-card-border) bg-light-app-tertiary text-sm font-bold text-primary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-primary"
          aria-hidden
        >
          {step}
        </span>
        {!last ? (
          <div
            className="mt-3 w-px flex-1 min-h-10 bg-light-divider dark:bg-dark-divider"
            aria-hidden
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1 space-y-4 pb-2">{children}</div>
    </div>
  );
}

function OwnerBadge({ username }) {
  const u = String(username ?? "").trim();
  return (
    <div
      className="pointer-events-none flex h-8 w-full items-center gap-2.5 rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3 py-1.5 dark:border-dark-input-border dark:bg-(--color-dark-input-bg)"
      title={u}
      aria-hidden={false}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/18 text-[10px] font-bold uppercase text-primary dark:bg-[rgba(0,102,255,0.22)] dark:text-dark-primary">
        {ownerInitials(u)}
      </span>
      <span className="min-w-0 truncate font-mono text-xs font-medium text-primary dark:text-dark-primary">
        {u || "—"}
      </span>
    </div>
  );
}

function ToggleSwitch({ checked, onCheckedChange, id }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10.5 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 dark:focus-visible:ring-blue-400/25",
        checked
          ? "bg-[color-mix(in_srgb,var(--color-chart-success)_92%,transparent)] dark:bg-[color-mix(in_srgb,var(--color-chart-success)_88%,transparent)]"
          : "border border-(--color-light-input-border) bg-(--color-light-input-bg) dark:border-dark-input-border dark:bg-(--color-dark-input-bg)",
      )}
    >
      <span
        className={cn(
          "pointer-events-none mt-0.5 inline-block size-5 rounded-full bg-(--color-light-card-bg) shadow-sm ring-1 ring-black/10 transition-[transform] dark:bg-(--color-dark-card-bg)",
          checked ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

function ConfigRow({ title, help, aboutLabel, onAbout, trailing }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-4 py-3.5 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) sm:flex-row sm:items-center sm:justify-between md:px-5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-primary dark:text-dark-primary">{title}</span>
          {aboutLabel ? (
            <button
              type="button"
              onClick={onAbout}
              className="text-[11px] font-semibold text-primary underline-offset-4 hover:underline dark:text-dark-primary"
            >
              {aboutLabel}
            </button>
          ) : null}
        </div>
        {help ? (
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-secondary dark:text-dark-secondary">
            {help}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:ps-6">{trailing}</div>
    </div>
  );
}

export default function StudentNewRepository() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  /** Auto-injected from the signed-in gateway user — never selectable */
  const owner =
    typeof user?.username === "string" && user.username.trim().length > 0
      ? user.username.trim()
      : typeof user?.user_name === "string"
        ? user.user_name.trim()
        : "";

  const suggestedName = useMemo(() => generateRepoSuggestion(), []);
  const [repositoryName, setRepositoryName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [addReadme, setAddReadme] = useState(false);
  const [gitignore, setGitignore] = useState(NONE_OPTION_VALUE);
  const [license, setLicense] = useState(NONE_OPTION_VALUE);

  const createRepo = useVcCreateRepository({
    onSuccess: (data) => {
      const rn =
        data?.repositoryName ??
        data?.repository_name ??
        slugRepoName(repositoryName);
      gooeyToast.success(t("studentNewRepo.success"));
      const own = encodeURIComponent(owner);
      navigate(
        `/student/repository/${own}/${encodeURIComponent(String(rn ?? "").trim())}`,
        { replace: true },
      );
    },
  });

  const slugPreview = slugRepoName(repositoryName);

  const gitignoreOptions = useMemo(
    () => [
      { value: NONE_OPTION_VALUE, label: t("studentNewRepo.optNone") },
      { value: "Node", label: "Node" },
      { value: "Python", label: "Python" },
      { value: "Java", label: "Java" },
      { value: "VisualStudio", label: "VisualStudio" },
    ],
    [t],
  );

  const licenseOptions = useMemo(
    () => [
      { value: NONE_OPTION_VALUE, label: t("studentNewRepo.licenseNone") },
      { value: "mit", label: "MIT License" },
      { value: "apache-2.0", label: "Apache License 2.0" },
      { value: "gpl-3.0", label: "GNU GPLv3" },
    ],
    [t],
  );

  const visOptions = [
    {
      value: "PUBLIC",
      label: `${t("studentNewRepo.vis.public")}`,
      icon: Globe2,
    },
    {
      value: "PRIVATE",
      label: t("studentNewRepo.vis.private"),
      icon: Lock,
    },
  ];

  const visSelectOptions = visOptions.map((o) => ({
    value: o.value,
    label: o.label,
  }));

  const VisIcon =
    visibility === "PRIVATE" ? Lock : Globe2;

  const submit = () => {
    const rn = slugRepoName(repositoryName);
    if (!owner) {
      gooeyToast.error(t("studentNewRepo.needUsername"));
      return;
    }
    if (!rn) {
      gooeyToast.error(t("studentNewRepo.nameInvalid"));
      return;
    }

    const body = {
      user_name: owner,
      repository_name: rn,
      description: description.trim().slice(0, DESC_MAX) || "",
      repository_visibility: visibility,
    };

    if (addReadme) body.include_readme = true;
    if (gitignore !== NONE_OPTION_VALUE && gitignore.trim()) {
      body.gitignore_template = gitignore.trim();
    }
    if (license !== NONE_OPTION_VALUE && license.trim()) {
      body.license_template = license.trim();
    }

    createRepo.mutate(body);
  };

  return (
    <div className="min-h-screen flex-1 bg-light-app-bg dark:bg-dark-shell">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-light-divider pb-6 dark:border-dark-divider">
          <Link
            to="/student/workspace"
            className="text-xs font-semibold text-primary underline-offset-4 hover:underline dark:text-dark-primary"
          >
            ← {t("studentNewRepo.back")}
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-3xl font-normal rtl:font-persian tracking-tight text-primary dark:text-dark-primary md:text-4xl">
            {t("studentNewRepo.title")}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-secondary dark:text-dark-secondary">
            {t("studentNewRepo.intro")}{" "}
            <button
              type="button"
              onClick={() =>
                gooeyToast.info(t("studentNewRepo.importToast"))
              }
              className="font-semibold text-primary underline-offset-4 hover:underline dark:text-dark-primary"
            >
              {t("studentNewRepo.importCta")}
            </button>
          </p>
          <p className="text-[11px] text-muted dark:text-dark-muted">
            {t("studentNewRepo.requiredNote")}
          </p>
        </header>

        <div className="mt-10 space-y-12">
          {/* Step 1 — General */}
          <StepRail step={1} last={false}>
            <h2 className="text-xl font-semibold text-primary dark:text-dark-primary md:text-2xl">
              {t("studentNewRepo.stepGeneral")}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="mb-3 text-[11px] font-semibold text-muted dark:text-dark-muted">
                  {t("studentNewRepo.repoNameRowLabel")}{" "}
                  <span className="text-light-error-text dark:text-dark-error-text">*</span>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
                  <div className="w-full shrink-0 sm:w-[min(42%,14rem)]">
                    
                    <OwnerBadge username={owner} />
                  </div>
                  <div className=" items-center  pb-6 text-lg font-semibold text-muted opacity-75 flex-row flex dark:text-dark-muted">
                    <Slash className="size-5 shrink-0" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="block  text-[11px] font-semibold text-transparent sm:hidden">
                      &nbsp;
                    </span>
                    <input
                      type="text"
                      autoCapitalize="off"
                      spellCheck={false}
                      aria-required
                      placeholder={t("studentNewRepo.namePlaceholder")}
                      value={repositoryName}
                      onChange={(e) => setRepositoryName(e.target.value)}
                      className="h-8 w-full rounded-xl border px-3.5 py-1.5 font-mono text-xs outline-none transition-colors border-(--color-light-input-border) bg-(--color-light-input-bg) text-(--color-light-text-primary) placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                    />
                    
                  </div>
                </div>
                
              </div>

              <Field label={t("studentNewRepo.description")} register={{}}>
                <textarea
                  maxLength={DESC_MAX}
                  rows={5}
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value.slice(0, DESC_MAX))
                  }
                  placeholder={t("studentNewRepo.descriptionPlaceholder")}
                  className="w-full resize-y rounded-xl border px-3.5 py-2.5 text-xs outline-none transition-colors min-h-22 border-(--color-light-input-border) bg-(--color-light-input-bg) text-(--color-light-text-primary) placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                />
              </Field>
              <div className="flex justify-end">
                <p className="text-[11px] text-muted dark:text-dark-muted">
                  {t("studentNewRepo.descriptionCounter", {
                    count: description.length,
                    max: DESC_MAX,
                  })}
                </p>
              </div>
            </div>
          </StepRail>

          {/* Step 2 — Configuration */}
          <StepRail step={2} last>
            <h2 className="text-xl font-semibold text-primary dark:text-dark-primary md:text-2xl">
              {t("studentNewRepo.stepConfig")}
            </h2>

            <div className="space-y-3">
              <ConfigRow
                title={
                  <span className="inline-flex items-center gap-1">
                    <span>{t("studentNewRepo.visibilityLabel")}</span>
                    <span aria-hidden className="text-light-error-text dark:text-dark-error-text">
                      *
                    </span>
                  </span>
                }
                help={t("studentNewRepo.visibilityHelp")}
                trailing={
                  <div className="flex items-center gap-2">
                    <VisIcon className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={2} aria-hidden />
                    <div className="w-[min(100%,12rem)]">
                      <Select
                        value={visibility}
                        onChange={(v) => setVisibility(v)}
                        options={visSelectOptions}
                      />
                    </div>
                  </div>
                }
              />

              <div className="flex flex-wrap justify-end gap-2 border-t border-light-divider pt-6 dark:border-dark-divider">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/student/workspace")}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                icon={<BookMarked className="me-2 size-4 shrink-0" strokeWidth={2} aria-hidden />}
                  type="button"
                  variant="primary"
                  disabled={createRepo.isPending || !owner}
                  onClick={submit}
                  className="min-w-44"
                >
                  
                  {t("studentNewRepo.submit")}
                </Button>
              </div>
            </div>
          </StepRail>
        </div>
      </div>
    </div>
  );
}
