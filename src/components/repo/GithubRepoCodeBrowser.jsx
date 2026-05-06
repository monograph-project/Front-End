import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Download,
  Ellipsis,
  Eye,
  File,
  Folder,
  GitBranch,
  GitFork,
  Link2,
  Package,
  Search,
  Star,
} from "lucide-react";
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

function formatRelativeTime(raw, locale) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = d.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units = [
    [1000 * 60 * 60 * 24 * 365, "year"],
    [1000 * 60 * 60 * 24 * 30, "month"],
    [1000 * 60 * 60 * 24 * 7, "week"],
    [1000 * 60 * 60 * 24, "day"],
    [1000 * 60 * 60, "hour"],
    [1000 * 60, "minute"],
  ];
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [ms, unit] of units) {
    if (abs >= ms || unit === "minute") {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }
  return "just now";
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

function branchOptionsFromRefsPayload(payload) {
  const refs = payload?.refs;
  const map =
    refs && typeof refs === "object" && !Array.isArray(refs)
      ? refs
      : payload?.Branches ??
        payload?.branches ??
        {};
  const opts = [];
  for (const k of Object.keys(map)) {
    const m = /^refs\/heads\/(.+)$/i.exec(String(k));
    if (m) opts.push({ value: m[1], label: m[1] });
  }
  opts.sort((a, b) => a.label.localeCompare(b.label));
  return opts;
}

function countOrZero(v) {
  if (v == null) return "0";
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : String(n);
}

function darkButtonClass({ green = false, disabled = false } = {}) {
  return cn(
    "inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition-colors",
    green
      ? "btn-primary border-transparent"
      : "border-(--color-light-card-border) bg-(--color-light-card-bg) text-secondary hover:border-(--color-light-input-border) hover:bg-(--color-light-card-hover) hover:text-primary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-secondary dark:hover:border-(--color-dark-input-border-focus) dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary",
    disabled && "cursor-not-allowed opacity-55",
  );
}

function sidebarRow({ icon: Icon, label, value, href = "" }) {
  const content = href ? (
    <a
      href={href}
      className="break-all text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)"
    >
      {value}
    </a>
  ) : (
    <span>{value}</span>
  );

  return (
    <li className="flex items-start gap-3 text-sm text-secondary dark:text-dark-secondary">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-muted dark:text-dark-muted"
        strokeWidth={1.7}
        aria-hidden
      />
      <span className="min-w-0 break-words">
        <span className="me-1 text-muted dark:text-dark-muted">{label}</span>
        {content}
      </span>
    </li>
  );
}

export default function GithubRepoCodeBrowser({
  owner,
  repo,
  repositoryMeta,
}) {
  const { t, i18n } = useTranslation();
  const o = typeof owner === "string" ? owner.trim() : "";
  const r = typeof repo === "string" ? repo.trim() : "";
  const locale = i18n.language || undefined;
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
        : branchOpts[0]?.value ?? metaDefaultBranch ?? "main";
    setRef(String(next));
  }, [branchOpts, headBranch, metaDefaultBranch, ref]);

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

  function pathForEntry(entry, nameOverride) {
    const nm = nameOverride ?? nodeLabel(entry);
    return typeof entry.path === "string" && entry.path.trim()
      ? entry.path.trim().replace(/^\/+/, "")
      : joinPath(treePath, nm);
  }

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
    const fullPaths = list.map((e) => pathForEntry(e));
    return list.filter((entry, ix) => fullPaths[ix].toLowerCase().includes(f));
  }, [rawList, fileFilter, i18n.language, treePath]);

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
    const pick = [...rawList].find((e) => entryCommitMessage(e));
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
  const branchCount = repositoryMeta?.branches_count ?? repositoryMeta?.branchCount ?? null;
  const tagCount = repositoryMeta?.tags_count ?? repositoryMeta?.releases_count ?? null;
  const starCount =
    repositoryMeta?.stars_count ??
    repositoryMeta?.starsCount ??
    repositoryMeta?.stars ??
    repositoryMeta?.stargazers_count ??
    0;
  const forkCount =
    repositoryMeta?.forks_count ??
    repositoryMeta?.forksCount ??
    repositoryMeta?.forks ??
    0;
  const watchCount =
    repositoryMeta?.watchers_count ??
    repositoryMeta?.subscriptions_count ??
    repositoryMeta?.watch_count ??
    0;
  const topics = Array.isArray(repositoryMeta?.topics)
    ? repositoryMeta.topics.filter(Boolean)
    : [];
  const aboutText =
    repositoryMeta?.description || t("studentRepo.about.emptyAbout");
  const homepage =
    repositoryMeta?.homepage ?? repositoryMeta?.website ?? repositoryMeta?.html_url ?? "";
  const lastActivityRaw =
    repositoryMeta?.updatedAt ??
    repositoryMeta?.updated_at ??
    repositoryMeta?.pushedAt ??
    repositoryMeta?.pushed_at ??
    headlineCommit?.date ??
    "";

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

  const aboutRows = [
    {
      key: "activity",
      icon: Activity,
      label: t("studentRepo.about.activity"),
      value: formatRelativeTime(lastActivityRaw, locale),
    },
    {
      key: "custom-properties",
      icon: Link2,
      label: t("studentRepo.about.customProperties"),
      value: topics.length ? String(topics.length) : t("studentRepo.about.none"),
    },
    {
      key: "stars",
      icon: Star,
      label: t("studentRepo.about.stars"),
      value: countOrZero(starCount),
    },
    {
      key: "watching",
      icon: Eye,
      label: t("studentRepo.about.watching"),
      value: countOrZero(watchCount),
    },
    {
      key: "forks",
      icon: GitFork,
      label: t("studentRepo.about.forks"),
      value: countOrZero(forkCount),
    },
    {
      key: "audit-log",
      icon: Package,
      label: t("studentRepo.about.auditLog"),
      value: repositoryMeta?.visibility ?? repositoryMeta?.repository_visibility ?? "—",
    },
  ];

  return (
    <div className="space-y-5 text-secondary dark:text-dark-secondary">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="w-full min-w-[10rem] max-w-[220px] sm:w-52">
            <Select
              value={ref}
              onChange={setRef}
              className="[&_.inline-flex]:h-10 [&_.inline-flex]:rounded-md [&_.inline-flex]:border-(--color-light-card-border) [&_.inline-flex]:bg-(--color-light-card-bg) [&_.inline-flex]:text-primary dark:[&_.inline-flex]:border-(--color-dark-card-border) dark:[&_.inline-flex]:bg-(--color-dark-card-bg) dark:[&_.inline-flex]:text-dark-primary"
              options={branchSelectOptions}
              placeholder={t("studentRepo.browser.branchPlaceholder")}
            />
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary dark:text-dark-secondary">
            <span className="inline-flex items-center gap-2">
              <GitBranch
                className="h-4 w-4 text-muted dark:text-dark-muted"
                strokeWidth={1.7}
                aria-hidden
              />
              {t("studentRepo.browser.branches", {
                count: branchCount != null ? String(branchCount) : String(branchOpts.length || 0),
              })}
            </span>
            <span className="inline-flex items-center gap-2 text-muted dark:text-dark-muted">
              <TagIcon />
              {t("studentRepo.browser.tags", {
                count: tagCount != null ? String(tagCount) : "0",
              })}
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2">
          <label htmlFor="repo-file-find" className="sr-only">
            {t("studentRepo.browser.findFileAria")}
          </label>
          <div className="relative min-w-[16rem] flex-1 xl:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-dark-muted"
              strokeWidth={1.7}
              aria-hidden
            />
            <input
              id="repo-file-find"
              type="search"
              value={fileFilter}
              onChange={(e) => setFileFilter(e.target.value)}
              placeholder={t("studentRepo.browser.findFilePlaceholder")}
              className="h-10 w-full rounded-md border border-(--color-light-input-border) bg-(--color-light-input-bg) pl-9 pr-3 text-sm text-(--color-light-text-primary) outline-none transition-colors placeholder:text-(--color-light-input-placeholder) focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:placeholder:text-(--color-dark-input-placeholder) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
              autoComplete="off"
            />
          </div>
          <button type="button" className={darkButtonClass({ disabled: true })} disabled>
            {t("studentRepo.browser.addFileDisabled")}
            <ChevronDown className="h-4 w-4" strokeWidth={1.7} aria-hidden />
          </button>
          <button type="button" className={darkButtonClass({ green: true, disabled: !cloneUrl })} disabled={!cloneUrl} onClick={copyClone}>
            <CodeIcon />
            {t("studentRepo.browser.code")}
            <ChevronDown className="h-4 w-4" strokeWidth={1.7} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 space-y-4">
          <div className="overflow-hidden rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            {headlineCommit ? (
              <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--color-light-card-border) bg-light-app-tertiary text-xs font-semibold uppercase text-primary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-primary">
                  {(o ?? "").slice(0, 2)}
                </span>
                <span className="font-semibold text-primary dark:text-dark-primary">{(o ?? "").split?.(/[/@]/)[0] ?? o}</span>
                <span className="min-w-0 flex-1 truncate text-secondary dark:text-dark-secondary">
                  {headlineCommit.message}
                </span>
                <span className="font-mono text-xs text-muted dark:text-dark-muted">{headlineCommit.sha || "—"}</span>
                <span className="text-sm text-muted dark:text-dark-muted">{formatRelativeTime(headlineCommit.date, locale)}</span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-dark-primary">
                  <HistoryIcon />
                  {t("studentRepo.code.commitTotal", { count: commitTotal ?? 0 })}
                </span>
                <button type="button" className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-(--color-light-card-hover) hover:text-primary dark:text-dark-muted dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary">
                  <Ellipsis className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                </button>
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-muted dark:text-dark-muted">
                {!treeQuery.isLoading
                  ? t("studentRepo.browser.commitRibbonEmpty")
                  : t("studentRepo.browser.commitRibbonLoading")}
              </p>
            )}

            <nav
              className="border-t border-(--color-light-card-border) px-4 py-2 text-xs font-medium text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted"
              aria-label={t("studentRepo.browser.treePathAria")}
            >
              <div className="flex flex-wrap items-center gap-1">
                {crumbs.map((c, idx) => (
                  <span key={`${c.path}-${idx}`} className="inline-flex items-center gap-1">
                    {idx ? <ChevronRight className="size-3 shrink-0 opacity-70" aria-hidden /> : null}
                    <button
                      type="button"
                      className={cn(
                        "rounded px-1 py-0.5 transition-colors hover:bg-(--color-light-card-hover) hover:text-primary dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary",
                        c.path === treePath ? "font-semibold text-primary dark:text-dark-primary" : "",
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
              </div>
            </nav>

            {!treeQuery.isLoading && rawList.length === 0 ? (
              <div className="border-t border-(--color-light-card-border) px-4 py-6 text-sm text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted">
                {t("studentRepo.browser.treeEmpty")}
              </div>
            ) : null}

            {treeQuery.isLoading && !rawList.length ? (
              <div className="border-t border-(--color-light-card-border) px-4 py-6 text-sm text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted">
                {t("studentRepo.browser.treeLoading")}
              </div>
            ) : null}

            {!!rawList.length && (
              <div className="border-t border-(--color-light-card-border) dark:border-(--color-dark-card-border)">
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
                        "grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px] items-center gap-3 border-b border-(--color-light-card-border) px-4 py-3 text-left transition-colors last:border-b-0 dark:border-(--color-dark-card-border)",
                        sel
                          ? "bg-(--color-light-card-hover) dark:bg-(--color-dark-card-hover)"
                          : "hover:bg-(--color-light-card-hover) dark:hover:bg-(--color-dark-card-hover)",
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {dir ? (
                          <Folder className="size-4 shrink-0 text-(--color-chart-warning) dark:text-(--color-chart-warning)" strokeWidth={1.9} aria-hidden />
                        ) : (
                          <File className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={1.9} aria-hidden />
                        )}
                        <span className="min-w-0 truncate text-sm font-semibold text-primary dark:text-dark-primary">
                          {nm}
                        </span>
                      </div>
                      <span className="truncate text-sm text-secondary dark:text-dark-secondary">{msg}</span>
                      <span className="text-right text-sm text-muted dark:text-dark-muted">
                        {formatRelativeTime(whenRaw, locale)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selected?.path ? (
            <section className="space-y-3">
              <header className="rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <File className="size-4 shrink-0 text-muted dark:text-dark-muted" aria-hidden />
                      <h2 className="truncate font-mono text-sm font-semibold text-primary dark:text-dark-primary">
                        {selected.path.split("/").pop()}
                      </h2>
                    </div>
                    <p className="mt-1 break-all font-mono text-xs text-muted dark:text-dark-muted">{selected.path}</p>
                    {selected.sha ? (
                      <p className="mt-2 font-mono text-xs text-muted dark:text-dark-muted">
                        {t("studentRepo.browser.blobHint", { sha: selected.sha.slice(0, 12) })}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-(--color-light-error-text) dark:text-(--color-dark-error-text)">{t("studentRepo.browser.missingSha")}</p>
                    )}
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
                          const bytes = await fetchRepositoryBlobPayload(o, r, selected.sha.trim());
                          const nm = selected.path.split("/").filter(Boolean).pop() || "download.bin";
                          saveAs(new Blob([bytes]), nm);
                        } catch {
                          gooeyToast.error(t("studentRepo.browser.downloadFailed"));
                        }
                      }}
                    >
                      {t("studentRepo.browser.download")}
                    </Button>
                  </div>
                </div>
              </header>

              {historyOpen ? (
                <div className="max-h-[min(50vh,420px)] space-y-2 overflow-y-auto rounded-md border border-(--color-light-card-border) bg-(--color-light-app-bg) p-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-app-secondary)">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                    {t("studentRepo.browser.historyHeading")}
                  </p>
                  {commitsQ.isLoading ? (
                    <p className="text-xs text-muted dark:text-dark-muted">{t("studentRepo.browser.historyLoading")}</p>
                  ) : historyRows.length ? (
                    <ul className="space-y-2">
                      {historyRows.map((row, ix) => {
                        const sha = row.sha ?? row.id ?? row.commitSha ?? `h-${ix}`;
                        const msg = row.message ?? row.subject ?? row.commitMessage ?? "";
                        const authorRow = row.author ?? row.authorName ?? "";
                        return (
                          <li
                            key={String(sha)}
                            className="rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) px-3 py-2 text-xs dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"
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
                  ) : (
                    <p className="text-xs text-muted dark:text-dark-muted">{t("studentRepo.browser.historyEmpty")}</p>
                  )}
                </div>
              ) : null}

              {!selected.sha ? (
                <div className="rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                  <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.browser.noBlobShaBody")}</p>
                </div>
              ) : rawOpen ? (
                <RawSnippetPanel owner={o} repo={r} blobSha={selected.sha} />
              ) : (
                <DocumentViewerContainer
                  owner={o}
                  repo={r}
                  filePath={selected.path}
                  branch={ref}
                  blobSha={selected.sha}
                />
              )}
            </section>
          ) : null}
        </section>

        <aside className="min-w-0" aria-label={t("studentRepo.sidebar.aria")}>
          <div className="space-y-6">
            <section className="border-b border-(--color-light-card-border) pb-6 dark:border-(--color-dark-card-border)">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-semibold text-primary dark:text-dark-primary">{t("studentRepo.about.title")}</h2>
                <button type="button" className="text-muted transition-colors hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary">
                  <Ellipsis className="h-5 w-5" strokeWidth={1.7} aria-hidden />
                </button>
              </div>
              <p className="text-sm leading-6 text-secondary dark:text-dark-secondary">{aboutText}</p>
              {homepage ? (
                <a
                  href={String(homepage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)"
                >
                  <Link2 className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                  {String(homepage)}
                </a>
              ) : null}
              <ul className="mt-5 space-y-4">
                {aboutRows.map((item) => (
                  <li key={item.key}>
                    {sidebarRow(item)}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-b border-(--color-light-card-border) pb-6 dark:border-(--color-dark-card-border)">
              <h3 className="text-xl font-semibold text-primary dark:text-dark-primary">{t("studentRepo.releases.title")}</h3>
              <p className="mt-4 text-sm text-muted dark:text-dark-muted">{t("studentRepo.releases.empty")}</p>
              <button type="button" className="mt-2 text-sm font-medium text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)">
                {t("studentRepo.releases.create")}
              </button>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-primary dark:text-dark-primary">{t("studentRepo.packages.title")}</h3>
              <p className="mt-4 text-sm text-muted dark:text-dark-muted">{t("studentRepo.packages.empty")}</p>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-muted dark:text-dark-muted" fill="none" aria-hidden>
      <path d="M2.75 4.25h4.1l5.15 5.15-2.6 2.6L4.25 6.85v-4.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="5.2" cy="5.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="m5.5 4.5-3 3 3 3M10.5 4.5l3 3-3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 text-muted dark:text-dark-muted" fill="none" aria-hidden>
      <path d="M2.75 8a5.25 5.25 0 1 0 1.57-3.74L2.75 5.75M2.75 2.75v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
        const bytes = await fetchRepositoryBlobPayload(owner, repo, blobSha.trim());
        const maybe = tryDecodeUtf8(bytes);
        if (!cancelled) setText(maybe == null ? "binary" : maybe);
      } catch (e) {
        if (!cancelled) setErr(String(e?.message ?? t("studentRepo.browser.rawLoadFailed")));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [blobSha, owner, repo, t]);

  if (loading) {
    return <p className="text-xs text-muted dark:text-dark-muted">{t("studentRepo.browser.rawLoading")}</p>;
  }
  if (err) {
    return (
      <div className="rounded-md border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-xs text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
        {err}
      </div>
    );
  }
  if (text === "binary") {
    return <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.browser.rawBinary")}</p>;
  }

  return (
    <pre className="max-h-[min(60vh,640px)] overflow-auto rounded-md border border-(--color-light-card-border) bg-(--color-light-input-bg) p-4 font-mono text-xs text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
      <code>{text ?? ""}</code>
    </pre>
  );
}
