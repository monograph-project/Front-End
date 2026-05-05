import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  BookMarked,
  ChevronDown,
  Copy,
  File,
  Folder,
  GitBranch,
  Link2,
} from "lucide-react";
import { gooeyToast } from "goey-toast";
import { useTranslation } from "react-i18next";
import Button from "../../components/Button";
import { cn } from "../../lib/utils";
import { useVcRepositoryTree } from "../../services/useApi";

function unwrapTreeNodes(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  const n =
    payload.tree ??
    payload.nodes ??
    payload.entries ??
    payload.children ??
    payload.items ??
    payload.data ??
    [];
  return Array.isArray(n) ? n : [];
}

function nodeLabel(entry) {
  return (
    entry.name ??
    entry.path ??
    entry.fileName ??
    entry.filename ??
    entry.key ??
    String(entry.sha ?? "")
  );
}

function nodeDir(entry) {
  return Boolean(
    entry.type === "directory" ||
      entry.type === "dir" ||
      entry.type === "tree" ||
      entry.isDirectory,
  );
}

function entryCommitMessage(entry) {
  const msg =
    entry.last_commit_message ??
    entry.last_commit_msg ??
    entry.lastCommitMessage ??
    entry.commit_message ??
    entry.commitMessage ??
    entry.message ??
    entry.commit?.message ??
    "";
  return typeof msg === "string" ? msg.trim() : "";
}

function entryCommittedDate(entry) {
  const raw =
    entry.commit?.created ??
    entry.commit?.timestamp ??
    entry.last_modified ??
    entry.lastModified ??
    entry.updated_at ??
    entry.updatedAt ??
    "";
  return typeof raw === "string" && raw ? raw : "";
}

function formatDisplayDate(raw, locale) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
}

export default function StudentRepoCode() {
  const { t, i18n } = useTranslation();
  const ctx = useOutletContext();
  const { owner, repo, repositoryMeta, repoBase } = ctx ?? {};

  const branch =
    repositoryMeta?.default_branch ??
    repositoryMeta?.defaultBranch ??
    repositoryMeta?.defaultBranchName ??
    "main";
  const branchCount =
    repositoryMeta?.branches_count ?? repositoryMeta?.branchCount ?? null;
  const tagCount =
    repositoryMeta?.tags_count ?? repositoryMeta?.releases_count ?? null;
  const commitTotal =
    repositoryMeta?.commits_count ??
    repositoryMeta?.commit_count ??
    repositoryMeta?.CommitsCount ??
    null;

  const [fileFilter, setFileFilter] = useState("");

  const q = useVcRepositoryTree(owner, repo, {}, { notifyOnError: false });
  const raw = unwrapTreeNodes(q.data);

  const rows = useMemo(() => {
    const list = [...raw];
    list.sort((a, b) => {
      const da = nodeDir(a) ? 0 : 1;
      const db = nodeDir(b) ? 0 : 1;
      if (da !== db) return da - db;
      return nodeLabel(a).localeCompare(nodeLabel(b), i18n.language);
    });

    const f = fileFilter.trim().toLowerCase();
    if (!f) return list;
    return list.filter((e) =>
      nodeLabel(e).toLowerCase().includes(f),
    );
  }, [raw, fileFilter, i18n.language]);

  const headlineCommit = useMemo(() => {
    const withMsg = [...raw].sort((a, b) =>
      entryCommitMessage(b).localeCompare(entryCommitMessage(a)),
    );
    const pick = withMsg.find((e) => entryCommitMessage(e));
    if (!pick) return null;
    return {
      message: entryCommitMessage(pick),
      date: entryCommittedDate(pick),
      sha:
        pick.commit?.id?.slice?.(0, 7) ??
        pick.sha?.slice?.(0, 7) ??
        pick.commit_id?.slice?.(0, 7) ??
        "",
    };
  }, [raw]);

  const cloneUrl =
    typeof repositoryMeta?.cloneUrl === "string"
      ? repositoryMeta.cloneUrl.trim()
      : typeof repositoryMeta?.clone_url === "string"
        ? repositoryMeta.clone_url.trim()
        : "";

  async function copyClone() {
    if (!cloneUrl) {
      gooeyToast.info(t("studentRepo.code.cloneUnavailable"));
      return;
    }
    try {
      await navigator.clipboard.writeText(cloneUrl);
      gooeyToast.success(t("studentRepo.code.cloneCopied"));
    } catch {
      gooeyToast.error(t("studentRepo.code.cloneCopyFailed"));
    }
  }

  const aboutText =
    repositoryMeta?.description ||
    t("studentRepo.about.emptyAbout");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_min(18rem,max(18rem,20%))] lg:gap-8">
      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between md:gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              type="button"
              disabled
              className="inline-flex h-8 max-w-[min(100%,14rem)] shrink-0 items-center gap-1.5 rounded-xl border border-(--color-light-input-border) bg-light-app-tertiary px-3 text-xs font-semibold text-primary opacity-90 dark:border-dark-input-border dark:bg-dark-app-tertiary dark:text-dark-primary"
              title={t("studentRepo.code.branchSwitcherHint")}
            >
              <GitBranch className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={2} aria-hidden />
              <span className="min-w-0 truncate font-mono">{branch}</span>
              <ChevronDown className="size-3.5 shrink-0 text-muted dark:text-dark-muted" strokeWidth={2} aria-hidden />
            </button>
            <span className="text-xs text-muted dark:text-dark-muted">
              {t("studentRepo.code.branchMetaLine", {
                branches: branchCount != null ? String(branchCount) : "—",
                tags: tagCount != null ? String(tagCount) : "—",
              })}
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:justify-end lg:max-w-[28rem]">
            <label htmlFor="repo-go-to-file" className="sr-only">
              {t("studentRepo.code.goToFileAria")}
            </label>
            <input
              id="repo-go-to-file"
              type="search"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder={t("studentRepo.code.goToFilePlaceholder")}
              className="h-8 min-w-[10rem] flex-1 rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-1.5 text-xs text-(--color-light-text-primary) outline-none placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="tertiary"
              className="h-8 min-h-8 px-3 text-xs"
              disabled
            >
              {t("studentRepo.code.addFile")}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!cloneUrl}
              onClick={copyClone}
              icon={<Copy className="size-4 shrink-0" strokeWidth={2} aria-hidden />}
              className="h-8 min-h-8 gap-1.5 px-3 text-xs"
            >
              {t("studentRepo.code.codeButton")}
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-t-xl border border-b-0 border-(--color-light-card-border) bg-light-app-tertiary px-4 py-2.5 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
          {headlineCommit ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-(--color-light-card-bg) text-[10px] font-semibold uppercase text-secondary dark:bg-(--color-dark-card-bg) dark:text-dark-secondary">
                {(owner ?? "").slice(0, 2)}
              </span>
              <span className="font-semibold text-primary dark:text-dark-primary">
                {(owner ?? "").split?.(/[/@]/)[0] ?? owner}
              </span>
              <span className="min-w-0 flex-1 truncate text-secondary dark:text-dark-secondary">
                {headlineCommit.message}
              </span>
              <span className="font-mono text-[11px] text-muted dark:text-dark-muted">
                {headlineCommit.sha || "—"}
              </span>
              <span className="text-muted dark:text-dark-muted">
                {formatDisplayDate(headlineCommit.date, i18n.language)}
              </span>
              {commitTotal != null ? (
                <span className="ms-auto shrink-0 text-[11px] font-semibold text-muted dark:text-dark-muted">
                  {t("studentRepo.code.commitTotal", { count: commitTotal })}
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted dark:text-dark-muted">
              {!q.isLoading
                ? t("studentRepo.code.latestCommitUnavailable")
                : t("studentRepo.code.loading")}
            </p>
          )}
        </div>

        {q.isLoading && (
          <p className="mt-6 text-sm text-muted dark:text-dark-muted">{t("studentRepo.code.loading")}</p>
        )}

        {!q.isLoading && !raw.length && (
          <div className="rounded-b-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <p className="text-sm leading-relaxed text-secondary dark:text-dark-secondary">
              {t("studentRepo.code.empty")}
            </p>
          </div>
        )}

        {!q.isLoading && raw.length ? (
          <>
            <div className="sr-only">{t("studentRepo.code.tableCaption")}</div>
            <div
              role="grid"
              className="overflow-hidden rounded-b-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
              aria-hidden={false}
            >
              <div
                role="row"
                className="hidden border-b border-light-divider bg-light-app-tertiary px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted dark:border-dark-divider dark:bg-dark-app-tertiary dark:text-dark-muted md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem]"
              >
                <span role="columnheader">{t("studentRepo.code.col.name")}</span>
                <span role="columnheader">{t("studentRepo.code.col.message")}</span>
                <span role="columnheader" className="text-end md:text-start">
                  {t("studentRepo.code.col.age")}
                </span>
              </div>
              <div className="divide-y divide-light-divider dark:divide-dark-divider">
                {rows.map((entry, i) => {
                  const nm = nodeLabel(entry) || `entry-${i}`;
                  const dir = nodeDir(entry);
                  const msg = entryCommitMessage(entry) || "—";
                  const whenRaw = entryCommittedDate(entry);
                  return (
                    <div
                      key={`${nm}-${i}`}
                      role="row"
                      className="grid grid-cols-1 gap-1 px-4 py-2.5 text-sm md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem] md:items-center md:gap-2"
                    >
                      <div role="gridcell" className="flex min-w-0 items-center gap-2 md:gap-2.5">
                        {dir ? (
                          <Folder className="size-4 shrink-0 text-accent dark:text-accent" strokeWidth={2} aria-hidden />
                        ) : (
                          <File className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={2} aria-hidden />
                        )}
                        <span className="min-w-0 truncate font-mono text-[13px] font-semibold text-primary dark:text-dark-primary">
                          {nm}
                        </span>
                      </div>
                      <div role="gridcell" className="min-w-0 md:order-none">
                        <span className="line-clamp-2 text-xs leading-snug text-secondary dark:text-dark-secondary md:line-clamp-1 md:truncate">
                          {msg}
                        </span>
                      </div>
                      <div role="gridcell" className="text-xs text-muted dark:text-dark-muted md:text-[13px]">
                        {formatDisplayDate(whenRaw, i18n.language)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>

    
    </div>
  );
}
