import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Copy, Download, File, Folder, GitBranch } from "lucide-react";
import { saveAs } from "file-saver";
import { gooeyToast } from "goey-toast";
import { useTranslation } from "react-i18next";
import Button from "../Button";
import DocumentViewerContainer from "../DocumentViewer/DocumentViewerContainer";
import Select from "../Select";
import { cn } from "../../lib/utils";
import {
  useVcRepositoryCommits,
  useVcRepositoryRefs,
  useVcRepositoryTree,
} from "../../services/useApi";
import { tryDecodeUtf8 } from "../../utils/binaryFileHandlers";
import { fetchRepositoryBlobPayload } from "../../services/versionControlService";

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
    entry.path?.split?.("/").pop() ??
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

function joinPath(prefix, name) {
  const p = String(prefix ?? "").replace(/^\/+|\/+$/g, "");
  const n = String(name ?? "").replace(/^\/+/, "");
  if (!p) return n;
  if (!n) return p;
  return `${p}/${n}`;
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

function refsHeadBranch(payload) {
  const head =
    typeof payload?.HEAD === "string"
      ? payload.HEAD.trim()
      : typeof payload?.head === "string"
        ? payload.head.trim()
        : "";
  if (/^refs\/heads\//i.test(head)) return head.replace(/^refs\/heads\//i, "");
  const sym = /^ref:\s*refs\/heads\/(.+)$/i.exec(head);
  if (sym) return String(sym[1]).trim();
  if (/^[a-z0-9_.-]+$/i.test(head) && !head.includes("/")) return head;
  return "";
}

/** @returns {Array<{ value: string, label: string }>} */
function branchOptionsFromRefsPayload(payload) {
  const refs = payload?.refs;
  const map =
    refs && typeof refs === "object" && !Array.isArray(refs)
      ? refs
      : payload?.Branches ??
        payload?.branches ??
        {};
  /** @type {Array<{ value: string, label: string }>} */
  const opts = [];
  for (const k of Object.keys(map)) {
    const m = /^refs\/heads\/(.+)$/i.exec(String(k));
    if (m) opts.push({ value: m[1], label: m[1] });
  }
  opts.sort((a, b) => a.label.localeCompare(b.label));
  return opts;
}

/**
 * Advanced Git-like Code tab wired to VC `api/v1` browse APIs + raw object blobs (`/objects/{sha}`).
 *
 * Blob bytes are inflated client-side (`vicObjectFormat`), which matches how the Java service stores MinIO payloads.
 *
 * @param {{ owner?: string; repo?: string; repositoryMeta?: Record<string, unknown> | null }} props
 */
export default function GithubRepoCodeBrowser({
  owner,
  repo,
  repositoryMeta,
}) {
  const { t, i18n } = useTranslation();
  const o = typeof owner === "string" ? owner.trim() : "";
  const r = typeof repo === "string" ? repo.trim() : "";
  const metaDefaultBranch =
    repositoryMeta?.default_branch ??
    repositoryMeta?.defaultBranch ??
    repositoryMeta?.defaultBranchName ??
    "main";

  const { data: refsPayload } = useVcRepositoryRefs(o, r, {
    enabled: Boolean(o && r),
    notifyOnError: false,
  });

  const branchOpts = useMemo(
    () => branchOptionsFromRefsPayload(refsPayload ?? {}),
    [refsPayload],
  );

  const headBranch = refsHeadBranch(refsPayload ?? {});

  const [ref, setRef] = useState(String(metaDefaultBranch || "main"));
  useEffect(() => {
    if (branchOpts.some((x) => x.value === ref)) return;
    const next =
      branchOpts.some((x) => x.value === headBranch)
        ? headBranch
        : branchOpts[0]?.value ??
          metaDefaultBranch ??
          "main";
    setRef(String(next));
  }, [
    branchOpts,
    headBranch,
    metaDefaultBranch,
    ref,
  ]);

  const [treePath, setTreePath] = useState("");
  const [selected, setSelected] = useState(
    /** @type {null | { path: string, sha?: string }} */ (null),
  );
  const [fileFilter, setFileFilter] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);

  const treeParams = useMemo(() => ({ ref, path: treePath }), [ref, treePath]);
  const treeQuery = useVcRepositoryTree(o, r, treeParams, {
    enabled: Boolean(o && r && ref),
    notifyOnError: false,
  });
  const rawList = unwrapTreeNodes(treeQuery.data);

  const rows = useMemo(() => {
    const list = [...rawList];
    list.sort((a, b) => {
      const da = nodeDir(a) ? 0 : 1;
      const db = nodeDir(b) ? 0 : 1;
      if (da !== db) return da - db;
      return nodeLabel(a).localeCompare(nodeLabel(b), i18n.language);
    });

    const f = fileFilter.trim().toLowerCase();
    if (!f) return list;
    const fullPaths = list.map((e) => pathForRow(e));
    return list.filter((entry, ix) =>
      fullPaths[ix].toLowerCase().includes(f),
    );
    function pathForRow(entry) {
      const nm = nodeLabel(entry);
      return typeof entry.path === "string" && entry.path.trim()
        ? entry.path.trim().replace(/^\/+/, "")
        : joinPath(treePath, nm);
    }
  }, [rawList, fileFilter, i18n.language, treePath]);

  function pathForEntry(entry, nameOverride) {
    const nm = nameOverride ?? nodeLabel(entry);
    return typeof entry.path === "string" && entry.path.trim()
      ? entry.path.trim().replace(/^\/+/, "")
      : joinPath(treePath, nm);
  }

  const crumbs = useMemo(() => {
    const root = [{ label: t("studentRepo.browser.rootSegment"), path: "" }];
    if (!treePath) return root;
    const segs = treePath.split("/").filter(Boolean);
    return root.concat(
      segs.map((segment, idx) => ({
        label: segment,
        path: segs.slice(0, idx + 1).join("/"),
      })),
    );
  }, [t, treePath]);

  const headlineCommit = useMemo(() => {
    const withMsg = [...rawList].sort((a, b) =>
      entryCommitMessage(b).localeCompare(entryCommitMessage(a)),
    );
    const pick = withMsg.find((e) => entryCommitMessage(e));
    if (!pick) return null;
    const ph = pick.commit?.id ?? pick.sha ?? pick.commit_id ?? "";
    return {
      message: entryCommitMessage(pick),
      date: entryCommittedDate(pick),
      sha: typeof ph === "string" ? ph.slice(0, 7) : "",
    };
  }, [rawList]);

  const cloneUrl =
    typeof repositoryMeta?.cloneUrl === "string"
      ? repositoryMeta.cloneUrl.trim()
      : typeof repositoryMeta?.clone_url === "string"
        ? repositoryMeta.clone_url.trim()
        : "";
  const commitTotal =
    repositoryMeta?.commits_count ??
    repositoryMeta?.commit_count ??
    repositoryMeta?.CommitsCount ??
    null;
  const branchCount =
    repositoryMeta?.branches_count ?? repositoryMeta?.branchCount ?? null;
  const tagCount =
    repositoryMeta?.tags_count ?? repositoryMeta?.releases_count ?? null;

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

  const commitsQ = useVcRepositoryCommits(
    o,
    r,
    {
      path: selected?.path ?? "",
      ref,
      limit: 50,
    },
    {
      enabled: Boolean(
        o &&
          r &&
          ref &&
          historyOpen &&
          selected?.path &&
          !String(selected.path).endsWith("/"),
      ),
      notifyOnError: false,
    },
  );
  const historyRows = Array.isArray(commitsQ.data) ? commitsQ.data : [];

  const branchSelectOptions = useMemo(() => {
    if (branchOpts.length) return branchOpts;
    return [{ value: String(ref), label: String(ref) }];
  }, [branchOpts, ref]);

  /** When raw panel needs bytes decode (placeholder — DocumentViewer owns bytes internally). Raw uses separate fetch UX: show helper text */

  function onPickEntry(entry) {
    const full = pathForEntry(entry);
    if (nodeDir(entry)) {
      setTreePath(full);
      setSelected(null);
      setRawOpen(false);
      setHistoryOpen(false);
      return;
    }
    const sha =
      typeof entry.sha === "string"
        ? entry.sha.trim()
        : typeof entry.objectId === "string"
          ? entry.objectId.trim()
          : typeof entry.id === "string" && /^[a-f0-9]{7,}$/i.test(entry.id)
            ? entry.id.trim()
          : "";
    setSelected({ path: full, sha: sha || undefined });
    setRawOpen(false);
    setHistoryOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="w-full min-w-[10rem] max-w-[220px] sm:w-52">
            <Select
              value={ref}
              onChange={setRef}
              options={branchSelectOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              placeholder={t("studentRepo.browser.branchPlaceholder")}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
            <GitBranch className="size-4 shrink-0" strokeWidth={2} aria-hidden />
            <span>
              {t("studentRepo.browser.branchCounts", {
                branches:
                  branchCount != null ?
                    String(branchCount)
                  : branchOpts.length ? String(branchOpts.length)
                  : "—",
                tags: tagCount != null ? String(tagCount) : "—",
              })}
            </span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 lg:max-w-md">
          <label htmlFor="repo-file-find" className="sr-only">
            {t("studentRepo.browser.findFileAria")}
          </label>
          <input
            id="repo-file-find"
            type="search"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder={t("studentRepo.browser.findFilePlaceholder")}
            className="h-9 min-w-[10rem] flex-1 rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-1.5 text-xs text-(--color-light-text-primary) outline-none placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="tertiary"
            className="h-9 min-h-9 px-3 text-xs"
            disabled
          >
            {t("studentRepo.browser.addFileDisabled")}
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!cloneUrl}
            onClick={copyClone}
            icon={<Copy className="size-4 shrink-0" strokeWidth={2} aria-hidden />}
            className="h-9 min-h-9 gap-1.5 px-3 text-xs"
          >
            {t("studentRepo.browser.code")}
          </Button>
        </div>
      </div>

      {/* Latest commit ribbon */}
      <div className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-2.5 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
        {headlineCommit ?
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-(--color-light-card-bg) text-[11px] font-semibold uppercase text-secondary dark:bg-(--color-dark-card-bg) dark:text-dark-secondary">
              {(o ?? "").slice(0, 2)}
            </span>
            <span className="font-semibold text-primary dark:text-dark-primary">
              {(o ?? "").split?.(/[/@]/)[0] ?? o}
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
            {commitTotal != null ?
              <span className="ms-auto shrink-0 text-[11px] font-semibold text-muted dark:text-dark-muted">
                {t("studentRepo.code.commitTotal", { count: commitTotal })}
              </span>
            : null}
          </div>
        : <p className="text-xs leading-relaxed text-muted dark:text-dark-muted">
            {!treeQuery.isLoading
              ? t("studentRepo.browser.commitRibbonEmpty")
              : t("studentRepo.browser.commitRibbonLoading")}
          </p>}
      </div>

      {/* Breadcrumbs */}
      <nav
        className="flex flex-wrap items-center gap-1 text-xs font-medium text-muted dark:text-dark-muted"
        aria-label={t("studentRepo.browser.treePathAria")}
      >
        {crumbs.map((c, idx) => (
          <span key={`${c.path}-${idx}`} className="inline-flex items-center gap-1">
            {idx ?
              <ChevronRight className="size-3 shrink-0 opacity-70" aria-hidden />
            : null}
            <button
              type="button"
              className={cn(
                "rounded px-1 py-0.5 transition-colors hover:bg-light-app-tertiary hover:text-primary dark:hover:bg-dark-app-tertiary dark:hover:text-dark-primary",
                c.path === treePath
                  ? "font-semibold text-primary dark:text-dark-primary"
                  : "",
              )}
              onClick={() => {
                setTreePath(c.path);
                setSelected(null);
                setHistoryOpen(false);
                setRawOpen(false);
              }}
            >
              {c.label}
            </button>
          </span>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <section className="min-w-0">
          {treeQuery.isFetching && rawList.length ?
            null
          : null}

          {!treeQuery.isLoading && rawList.length === 0 ?
            <div className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <p className="text-sm text-secondary dark:text-dark-secondary">
                {t("studentRepo.browser.treeEmpty")}
              </p>
            </div>
          : null}

          {treeQuery.isLoading && !rawList.length ?
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("studentRepo.browser.treeLoading")}
            </p>
          : null}

          {!!rawList.length && (
            <div className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <div
                className={cn(
                  "hidden border-b border-light-divider bg-light-app-tertiary px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem] dark:border-dark-divider dark:bg-dark-app-tertiary dark:text-dark-muted",
                )}
              >
                <span>{t("studentRepo.code.col.name")}</span>
                <span>{t("studentRepo.code.col.message")}</span>
                <span className="md:text-start">{t("studentRepo.code.col.age")}</span>
              </div>
              <div className="divide-y divide-light-divider dark:divide-dark-divider">
                {rows.map((entry, i) => {
                  const nm = nodeLabel(entry) || `entry-${i}`;
                  const dir = nodeDir(entry);
                  const msg = entryCommitMessage(entry) || "—";
                  const whenRaw = entryCommittedDate(entry);
                  const full = pathForEntry(entry, nm);
                  const sel = selected?.path === full;

                  return (
                    <button
                      key={`${full}-${i}`}
                      type="button"
                      onClick={() => onPickEntry({ ...entry, path: entry.path })}
                      className={cn(
                        "grid w-full grid-cols-1 gap-1 px-4 py-2.5 text-left text-sm transition-colors md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_8rem] md:items-center md:gap-2",
                        sel
                          ? "bg-light-app-secondary/80 dark:bg-dark-app-secondary/80"
                          : "hover:bg-light-app-secondary/50 dark:hover:bg-dark-app-secondary/50",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {dir ?
                          <Folder
                            className="size-4 shrink-0 text-(--color-chart-warning)"
                            strokeWidth={2}
                            aria-hidden
                          />
                        : <File className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={2} aria-hidden />}
                        <span className="min-w-0 truncate font-mono text-[13px] font-semibold text-primary dark:text-dark-primary">
                          {nm}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="line-clamp-2 text-xs leading-snug text-secondary dark:text-dark-secondary md:line-clamp-1 md:truncate">
                          {msg}
                        </span>
                      </div>
                      <div className="text-xs text-muted md:text-[13px] dark:text-dark-muted">
                        {formatDisplayDate(whenRaw, i18n.language)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* File viewer */}
        <section className="min-w-0 space-y-3">
          {!selected?.path ?
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-6 text-center text-sm text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
              {t("studentRepo.browser.pickFile")}
            </div>
          : <>
              <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <File className="size-4 shrink-0 text-muted dark:text-dark-muted" aria-hidden />
                    <h2 className="truncate font-mono text-sm font-semibold text-primary dark:text-dark-primary">
                      {selected.path.split("/").pop()}
                    </h2>
                  </div>
                  <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-muted dark:text-dark-muted">
                    {selected.path}
                  </p>
                  {selected.sha ?
                    <p className="mt-2 font-mono text-[11px] text-muted dark:text-dark-muted">
                      {t("studentRepo.browser.blobHint", {
                        sha: selected.sha.slice(0, 12),
                      })}
                    </p>
                  : <p className="mt-2 text-[11px] text-(--color-light-error-text) dark:text-(--color-dark-error-text)">
                      {t("studentRepo.browser.missingSha")}
                    </p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={rawOpen ? "primary" : "secondary"}
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setRawOpen((x) => !x);
                      if (!rawOpen) setHistoryOpen(false);
                    }}
                  >
                    {t("studentRepo.browser.raw")}
                  </Button>
                  <Button
                    type="button"
                    variant={historyOpen ? "primary" : "secondary"}
                    className="h-8 px-3 text-xs"
                    onClick={() => {
                      setHistoryOpen((x) => !x);
                      if (!historyOpen) setRawOpen(false);
                    }}
                  >
                    {t("studentRepo.browser.history")}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-8 gap-2 px-3 text-xs"
                    disabled={!selected.sha && !selected.path}
                    icon={<Download className="size-3.5 shrink-0" aria-hidden />}
                    onClick={async () => {
                      gooeyToast.info(t("studentRepo.browser.downloadHint"));
                      try {
                        if (!selected?.sha || !selected?.path) return;
                        const bytes = await fetchRepositoryBlobPayload(
                          o,
                          r,
                          selected.sha.trim(),
                        );
                        const nm =
                          selected.path.split("/").filter(Boolean).pop() ||
                          "download.bin";
                        saveAs(new Blob([bytes]), nm);
                      } catch {
                        gooeyToast.error(t("studentRepo.browser.downloadFailed"));
                      }
                    }}
                  >
                    {t("studentRepo.browser.download")}
                  </Button>
                </div>
              </header>

              {historyOpen ?
                <div className="max-h-[min(50vh,420px)] space-y-2 overflow-y-auto rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    {t("studentRepo.browser.historyHeading")}
                  </p>
                  {commitsQ.isLoading ?
                    <p className="text-xs text-muted dark:text-dark-muted">
                      {t("studentRepo.browser.historyLoading")}
                    </p>
                  : historyRows.length ?
                    <ul className="space-y-2">
                      {historyRows.map((row, ix) => {
                        const sha = row.sha ?? row.id ?? row.commitSha ?? `h-${ix}`;
                        const msg =
                          row.message ?? row.subject ?? row.commitMessage ?? "";
                        const authorRow = row.author ?? row.authorName ?? "";
                        return (
                          <li
                            key={String(sha)}
                            className="rounded-xl border border-(--color-light-card-border) bg-light-app-secondary/40 px-3 py-2 text-xs dark:border-(--color-dark-card-border) dark:bg-dark-app-secondary/30"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted dark:text-dark-muted">
                              <span>{String(sha).slice(0, 12)}</span>
                              <span>{authorRow ? String(authorRow) : "—"}</span>
                            </div>
                            <p className="mt-2 text-sm font-semibold leading-snug text-primary dark:text-dark-primary">
                              {msg || "—"}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  : <p className="text-xs text-muted dark:text-dark-muted">
                      {t("studentRepo.browser.historyEmpty")}
                    </p>}
                </div>
              : null}

              {/* Blame/overview lives in shared viewer */}
              {!selected.sha ?
                <div className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                  <p className="text-sm text-muted dark:text-dark-muted">
                    {t("studentRepo.browser.noBlobShaBody")}
                  </p>
                </div>
              : rawOpen ?
                <RawSnippetPanel owner={o} repo={r} blobSha={selected.sha} />
              : <DocumentViewerContainer
                  owner={o}
                  repo={r}
                  filePath={selected.path}
                  branch={ref}
                  blobSha={selected.sha}
                />}
            </>
          }
        </section>
      </div>
    </div>
  );
}

/**
 * Lightweight raw panel: decompress object and show UTF‑8 preview when printable.
 *
 * Full fidelity “Raw” downloads use the toolbar save action.
 *
 * @param {{ owner: string; repo: string; blobSha: string }} props
 */
function RawSnippetPanel({ owner, repo, blobSha }) {
  const { t } = useTranslation();
  const [text, setText] = useState(
    /** @type {null | string | "binary"} */ (null),
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const bytes = await fetchRepositoryBlobPayload(
          owner,
          repo,
          blobSha.trim(),
        );
        const maybe = tryDecodeUtf8(bytes);
        if (!cancelled) setText(maybe == null ? "binary" : maybe);
      } catch (e) {
        if (!cancelled)
          setErr(String(e?.message ?? t("studentRepo.browser.rawLoadFailed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blobSha, owner, repo, t]);

  if (loading) {
    return (
      <p className="text-xs text-muted dark:text-dark-muted">
        {t("studentRepo.browser.rawLoading")}
      </p>
    );
  }
  if (err) {
    return (
      <div className="rounded-xl border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-xs text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
        {err}
      </div>
    );
  }
  if (text === "binary") {
    return (
      <p className="text-sm text-muted dark:text-dark-muted">
        {t("studentRepo.browser.rawBinary")}
      </p>
    );
  }

  return (
    <pre className="max-h-[min(60vh,640px)] overflow-auto rounded-xl border border-(--color-light-card-border) bg-(--color-light-input-bg) p-4 font-mono text-xs text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
      <code>{text ?? ""}</code>
    </pre>
  );
}
