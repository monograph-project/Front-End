import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  Ellipsis,
  Eye,
  File,
  Folder,
  GitBranch,
  GitFork,
  Link2,
  Package,
  Pencil,
  Search,
  Star,
} from "lucide-react";
import { saveAs } from "file-saver";
import { gooeyToast } from "goey-toast";
import { useTranslation } from "react-i18next";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "../Button";
import OverviewMode from "../DocumentViewer/OverviewMode";
import Select from "../Select";
import { cn } from "../../lib/utils";
import {
  useVcRepositoryCommits,
  useVcRepositoryContents,
  useVcRepositoryRefs,
  useVcRepositoryTree,
} from "../../services/useApi";
import { tryDecodeUtf8 } from "../../utils/binaryFileHandlers";
import {
  fetchFileBlame,
  fetchRepositoryBlobPayload,
} from "../../services/versionControlService";

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

function extractTextFromContentsResponse(data) {
  if (!data || typeof data !== "object") return null;
  if (data.encoding === "base64" && typeof data.content === "string") {
    try {
      const bin = atob(String(data.content).replace(/\s/g, ""));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
      return tryDecodeUtf8(bytes);
    } catch {
      return null;
    }
  }
  if (typeof data.content === "string") return data.content;
  return null;
}

function extractBytesFromContentsResponse(data) {
  if (!data || typeof data !== "object") return null;
  if (data.encoding === "base64" && typeof data.content === "string") {
    try {
      const bin = atob(String(data.content).replace(/\s/g, ""));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
      return bytes;
    } catch {
      return null;
    }
  }
  if (typeof data.content === "string") {
    return new TextEncoder().encode(data.content);
  }
  return null;
}

function formatBytes(size) {
  const num = Number(size ?? 0);
  if (!Number.isFinite(num) || num <= 0) return "0 B";
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(2)} KB`;
  return `${(num / (1024 * 1024)).toFixed(2)} MB`;
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
    entry.last_commit_date ??
    entry.lastCommitDate ??
    entry.commit?.created ??
    entry.commit?.timestamp ??
    entry.commit?.date ??
    entry.last_modified ??
    entry.lastModified ??
    entry.updated_at ??
    entry.updatedAt ??
    "";
  return typeof raw === "string" && raw ? raw : "";
}

function entryCommitSha(entry) {
  const raw =
    entry.last_commit_sha ??
    entry.lastCommitSha ??
    entry.commit_sha ??
    entry.commitSha ??
    entry.commit?.sha ??
    entry.commit?.id ??
    entry.commit_id ??
    entry.sha ??
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function entryCommitAuthor(entry) {
  const raw =
    entry.last_commit_author ??
    entry.lastCommitAuthor ??
    entry.commit_author ??
    entry.commitAuthor ??
    entry.author ??
    entry.authorName ??
    entry.commit?.author ??
    entry.commit?.userName ??
    entry.commit?.authorName ??
    "";
  return typeof raw === "string" ? raw.trim() : "";
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

function formatAbsoluteTime(raw, locale) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function commitRowSha(row) {
  const raw = row?.sha ?? row?.id ?? row?.commitSha ?? row?.commit ?? "";
  return typeof raw === "string" ? raw.trim() : "";
}

function commitRowMessage(row) {
  const raw = row?.message ?? row?.subject ?? row?.commitMessage ?? "";
  return typeof raw === "string" ? raw.trim() : "";
}

function commitRowAuthor(row) {
  const raw =
    row?.author ??
    row?.authorName ??
    row?.committer ??
    row?.userName ??
    row?.username ??
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function commitRowTimestamp(row) {
  const raw =
    row?.timestamp ??
    row?.date ??
    row?.committedDate ??
    row?.createdAt ??
    row?.created_at ??
    "";
  return typeof raw === "string" ? raw : "";
}

function blameLineNumber(row) {
  const n = Number(
    row?.lineNumber ?? row?.line ?? row?.line_no ?? row?.lineNo ?? row?.lineIdx,
  );
  if (!Number.isFinite(n)) return -1;
  return Math.max(1, n);
}

function blameCommitSha(row) {
  const raw = row?.commit ?? row?.commitSha ?? row?.sha ?? row?.revision ?? "";
  return typeof raw === "string" ? raw.trim() : "";
}

function blameCommitMessage(row) {
  const raw = row?.commitMessage ?? row?.message ?? row?.subject ?? "";
  return typeof raw === "string" ? raw.trim() : "";
}

function blameCommitAuthor(row) {
  const raw =
    row?.author ??
    row?.authorName ??
    row?.userName ??
    row?.username ??
    row?.committer ??
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function blameCommitTimestamp(row) {
  const raw =
    row?.timestamp ?? row?.date ?? row?.time ?? row?.committedDate ?? "";
  return typeof raw === "string" ? raw : "";
}

function initialsFromName(value) {
  const parts = String(value ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase?.() ?? "")
    .join("");
}

function truncateMiddle(value, max = 72) {
  const text = String(value ?? "");
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
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
      : (payload?.Branches ?? payload?.branches ?? {});
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

function iconGhostButtonClass({ compact = false } = {}) {
  return cn(
    "inline-flex items-center justify-center rounded-md border border-white/16 bg-white/[0.03] text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-45",
    compact ? "h-8 w-8" : "h-9 w-9",
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

export default function GithubRepoCodeBrowser({ owner, repo, repositoryMeta }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const outletContext = useOutletContext() ?? {};
  const o = typeof owner === "string" ? owner.trim() : "";
  const r = typeof repo === "string" ? repo.trim() : "";
  const repoBase =
    typeof outletContext.repoBase === "string" ? outletContext.repoBase : "";
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
    const next = branchOpts.some((x) => x.value === headBranch)
      ? headBranch
      : (branchOpts[0]?.value ?? metaDefaultBranch ?? "main");
    setRef(String(next));
  }, [branchOpts, headBranch, metaDefaultBranch, ref]);

  const [treePath, setTreePath] = useState("");
  const [selected, setSelected] = useState(
    /** @type {null | { path: string, sha?: string }} */ (null),
  );
  const [fileFilter, setFileFilter] = useState("");
  const [activeView, setActiveView] = useState(
    /** @type {"code" | "blame" | "raw"} */ ("code"),
  );
  const treeParams = useMemo(() => ({ ref, path: treePath }), [ref, treePath]);
  const treeQuery = useVcRepositoryTree(o, r, treeParams, {
    enabled: Boolean(o && r && ref),
    notifyOnError: false,
  });
  const rawList = unwrapTreeNodes(treeQuery.data);

  const pathForEntry = useCallback((entry, nameOverride) => {
    const nm = nameOverride ?? nodeLabel(entry);
    return typeof entry.path === "string" && entry.path.trim()
      ? entry.path.trim().replace(/^\/+/, "")
      : joinPath(treePath, nm);
  }, [treePath]);

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
  }, [rawList, fileFilter, i18n.language, pathForEntry]);

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
  const branchCount =
    repositoryMeta?.branches_count ?? repositoryMeta?.branchCount ?? null;
  const tagCount =
    repositoryMeta?.tags_count ?? repositoryMeta?.releases_count ?? null;
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
    repositoryMeta?.homepage ??
    repositoryMeta?.website ??
    repositoryMeta?.html_url ??
    "";
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
        selected?.path &&
        !String(selected.path).endsWith("/"),
      ),
      notifyOnError: false,
    },
  );
  const historyRows = Array.isArray(commitsQ.data) ? commitsQ.data : [];

  const selectedContentsQ = useVcRepositoryContents(
    o,
    r,
    selected?.path ?? "",
    { ref },
    {
      enabled: Boolean(o && r && ref && selected?.path),
      notifyOnError: false,
    },
  );

  const selectedText = useMemo(
    () => extractTextFromContentsResponse(selectedContentsQ.data),
    [selectedContentsQ.data],
  );
  const selectedBytes = useMemo(
    () => extractBytesFromContentsResponse(selectedContentsQ.data),
    [selectedContentsQ.data],
  );

  const fileMeta = useMemo(() => {
    const text = String(selectedText ?? "");
    const lines = text ? text.split(/\r?\n/).length : 0;
    const loc = text
      ? text
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter(Boolean).length
      : 0;
    const bytes =
      selectedContentsQ.data?.size ??
      selectedContentsQ.data?.content?.length ??
      new TextEncoder().encode(text).length;
    return { lines, loc, bytes };
  }, [selectedContentsQ.data, selectedText]);

  const selectedPath = selected?.path ?? "";
  const selectedEntry = selectedPath
    ? rows.find((entry) => pathForEntry(entry) === selectedPath) ?? null
    : null;
  const selectedLatestCommit = historyRows[0] ?? null;
  const selectedHeaderCommit = {
    message:
      commitRowMessage(selectedLatestCommit) ||
      entryCommitMessage(selectedEntry ?? {}) ||
      headlineCommit?.message ||
      "",
    sha:
      commitRowSha(selectedLatestCommit) ||
      entryCommitSha(selectedEntry ?? {}) ||
      "",
    author:
      commitRowAuthor(selectedLatestCommit) ||
      entryCommitAuthor(selectedEntry ?? {}) ||
      "",
    timestamp:
      commitRowTimestamp(selectedLatestCommit) ||
      entryCommittedDate(selectedEntry ?? {}) ||
      headlineCommit?.date ||
      "",
  };

  const branchSelectOptions = useMemo(() => {
    if (branchOpts.length) return branchOpts;
    return [{ value: String(ref), label: String(ref) }];
  }, [branchOpts, ref]);

  const openHistoryPage = useCallback(() => {
    if (!repoBase || !selected?.path) return;
    const search = new URLSearchParams({
      path: selected.path,
      ref,
    });
    navigate(`${repoBase}/history?${search.toString()}`);
  }, [navigate, ref, repoBase, selected?.path]);

  function onPickEntry(entry) {
    const full = pathForEntry(entry);
    if (nodeDir(entry)) {
      setTreePath(full);
      setSelected(null);
      setActiveView("code");
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
    setActiveView("code");
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
      value: topics.length
        ? String(topics.length)
        : t("studentRepo.about.none"),
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
      value:
        repositoryMeta?.visibility ??
        repositoryMeta?.repository_visibility ??
        "—",
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
                count:
                  branchCount != null
                    ? String(branchCount)
                    : String(branchOpts.length || 0),
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
          <button
            type="button"
            className={darkButtonClass({ disabled: true })}
            disabled
          >
            {t("studentRepo.browser.addFileDisabled")}
            <ChevronDown className="h-4 w-4" strokeWidth={1.7} aria-hidden />
          </button>
          <button
            type="button"
            className={darkButtonClass({ green: true, disabled: !cloneUrl })}
            disabled={!cloneUrl}
            onClick={copyClone}
          >
            <CodeIcon />
            {t("studentRepo.browser.code")}
            <ChevronDown className="h-4 w-4" strokeWidth={1.7} aria-hidden />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-6",
          selected?.path
            ? "xl:grid-cols-[300px_minmax(0,1fr)]"
            : "lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]",
        )}
      >
        <section
          className={cn(
            "min-w-0 space-y-4",
            selected?.path ? "xl:col-span-2" : "",
          )}
        >
          {selected?.path ? (
            <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="min-w-0">
                <div className="overflow-hidden rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                  <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
                    <p className="text-xl font-semibold text-primary dark:text-dark-primary">
                      Files
                    </p>
                  </div>
                  <nav
                    className="border-b border-(--color-light-card-border) px-4 py-2 text-xs font-medium text-muted dark:border-(--color-dark-card-border) dark:text-dark-muted"
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
                              setActiveView("code");
                            }}
                          >
                            {c.label}
                          </button>
                        </span>
                      ))}
                    </div>
                  </nav>

                  <div className="max-h-[70vh] overflow-y-auto">
                    {treeQuery.isLoading && !rawList.length ? (
                      <div className="px-4 py-6 text-sm text-muted dark:text-dark-muted">
                        {t("studentRepo.browser.treeLoading")}
                      </div>
                    ) : null}

                    {!treeQuery.isLoading && !rawList.length ? (
                      <div className="px-4 py-6 text-sm text-muted dark:text-dark-muted">
                        {t("studentRepo.browser.treeEmpty")}
                      </div>
                    ) : null}

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
                              <Folder className="size-4 shrink-0 text-(--color-chart-warning)" strokeWidth={1.9} aria-hidden />
                            ) : (
                              <File className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={1.9} aria-hidden />
                            )}
                            <span className="min-w-0 truncate text-sm font-semibold text-primary dark:text-dark-primary">
                              {nm}
                            </span>
                          </div>
                          <span className="truncate text-sm text-secondary dark:text-dark-secondary">
                            {msg}
                          </span>
                          <span className="text-right text-sm text-muted dark:text-dark-muted">
                            {formatRelativeTime(whenRaw, locale)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              <section className="min-w-0 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <button
                    type="button"
                    className="text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)"
                    onClick={() => {
                      setSelected(null);
                      setActiveView("code");
                    }}
                  >
                    {r}
                  </button>
                  <span className="text-muted dark:text-dark-muted">/</span>
                  <span className="truncate text-primary dark:text-dark-primary">
                    {selected.path}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] text-white shadow-[0_18px_50px_rgba(0,0,0,.24)]">
                  <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-4 text-sm">
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-xs font-semibold uppercase text-white">
                      {initialsFromName(selectedHeaderCommit.author || o)}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-white/88">
                          {selectedHeaderCommit.author || ((o ?? "").split?.(/[/@]/)[0] || o)}
                          </span>
                          <span className="min-w-0 truncate text-sm text-white/84">
                            {selectedHeaderCommit.message || "—"}
                          </span>
                        </div>
                    </div>
                    <div className="ms-auto flex flex-wrap items-center gap-3 text-sm text-white/70">
                      <span className="font-mono">{selectedHeaderCommit.sha.slice(0, 7) || "—"}</span>
                      <span>{formatRelativeTime(selectedHeaderCommit.timestamp, locale)}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-white/80"
                        onClick={openHistoryPage}
                      >
                        <HistoryIcon />
                        {t("studentRepo.browser.history")}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.04] px-3 py-2.5">
                    <div className="flex items-center rounded-lg border border-white/14 bg-white/[0.04] p-1">
                      <button
                        type="button"
                        className={cn(
                          "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                          activeView === "code"
                            ? "bg-white/[0.12] text-white"
                            : "text-white/72 hover:text-white",
                        )}
                        onClick={() => {
                          setActiveView("code");
                        }}
                      >
                        {t("studentRepo.tabs.code")}
                      </button>
                      <button
                        type="button"
                        className={cn(
                          "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                          activeView === "blame"
                            ? "bg-white/[0.12] text-white"
                            : "text-white/72 hover:text-white",
                        )}
                        onClick={() => {
                          setActiveView("blame");
                        }}
                      >
                        Blame
                      </button>
                    </div>

                    <div className="text-sm text-white/70">
                      {fileMeta.lines} lines ({fileMeta.loc} loc) • {formatBytes(fileMeta.bytes)}
                    </div>

                    <div className="ms-auto flex items-center gap-2">
                      {activeView === "blame" ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-full border border-white/16 px-3 py-1.5 text-sm text-white/86 transition-colors hover:bg-white/[0.08]"
                          onClick={openHistoryPage}
                        >
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/14 bg-white/[0.08] text-[11px] font-semibold">
                            {initialsFromName(selectedHeaderCommit.author || o)}
                          </span>
                          Contributors
                          <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/16 px-1.5 text-xs">
                            {selectedHeaderCommit.author ? 1 : 0}
                          </span>
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
                          activeView === "raw"
                            ? "border-white/18 bg-white/[0.12] text-white"
                            : "border-white/14 bg-transparent text-white/72 hover:bg-white/[0.08] hover:text-white",
                        )}
                        onClick={() => {
                          setActiveView("raw");
                        }}
                      >
                        {t("studentRepo.browser.raw")}
                      </button>
                      <button
                        type="button"
                        className={iconGhostButtonClass()}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(selected.path);
                            gooeyToast.success(t("studentRepo.code.cloneCopied"));
                          } catch {
                            gooeyToast.error(t("studentRepo.code.cloneCopyFailed"));
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={iconGhostButtonClass()}
                        disabled={!selected?.sha}
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
                        <Download className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={iconGhostButtonClass()}
                        disabled
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      </button>
                      <button
                        type="button"
                        className={iconGhostButtonClass()}
                      >
                        <Ellipsis className="h-4 w-4" strokeWidth={1.7} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0d1117] p-0">
                    {!selected.sha ? (
                      <div className="p-4">
                        <p className="text-sm text-white/60">
                          {t("studentRepo.browser.noBlobShaBody")}
                        </p>
                      </div>
                    ) : activeView === "raw" ? (
                      <RawSnippetPanel owner={o} repo={r} blobSha={selected.sha} />
                    ) : activeView === "blame" ? (
                      <RepositoryBlamePanel
                        owner={o}
                        repo={r}
                        filePath={selected.path}
                        branch={ref}
                        fileText={selectedText}
                        locale={locale}
                        onOpenHistory={openHistoryPage}
                      />
                    ) : (
                      <RepositoryCodePanel
                        filePath={selected.path}
                        fileBytes={selectedBytes}
                      />
                    )}
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              {headlineCommit ? (
                <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-(--color-light-card-border) bg-light-app-tertiary text-xs font-semibold uppercase text-primary dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-primary">
                    {(o ?? "").slice(0, 2)}
                  </span>
                  <span className="font-semibold text-primary dark:text-dark-primary">
                    {(o ?? "").split?.(/[/@]/)[0] ?? o}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-secondary dark:text-dark-secondary">
                    {headlineCommit.message}
                  </span>
                  <span className="font-mono text-xs text-muted dark:text-dark-muted">
                    {headlineCommit.sha || "—"}
                  </span>
                  <span className="text-sm text-muted dark:text-dark-muted">
                    {formatRelativeTime(headlineCommit.date, locale)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary dark:text-dark-primary">
                    <HistoryIcon />
                    {t("studentRepo.code.commitTotal", { count: commitTotal ?? 0 })}
                  </span>
                </div>
              ) : (
                <p className="px-4 py-3 text-sm text-muted dark:text-dark-muted">
                  {!treeQuery.isLoading ? t("studentRepo.browser.commitRibbonEmpty") : t("studentRepo.browser.commitRibbonLoading")}
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
                          setActiveView("code");
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
                    return (
                      <button
                        key={`${full}-${i}`}
                        type="button"
                        onClick={() => onPickEntry({ ...entry, path: entry.path })}
                        className="grid w-full grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_110px] items-center gap-3 border-b border-(--color-light-card-border) px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-(--color-light-card-hover) dark:border-(--color-dark-card-border) dark:hover:bg-(--color-dark-card-hover)"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {dir ? (
                            <Folder className="size-4 shrink-0 text-(--color-chart-warning)" strokeWidth={1.9} aria-hidden />
                          ) : (
                            <File className="size-4 shrink-0 text-muted dark:text-dark-muted" strokeWidth={1.9} aria-hidden />
                          )}
                          <span className="min-w-0 truncate text-sm font-semibold text-primary dark:text-dark-primary">
                            {nm}
                          </span>
                        </div>
                        <span className="truncate text-sm text-secondary dark:text-dark-secondary">
                          {msg}
                        </span>
                        <span className="text-right text-sm text-muted dark:text-dark-muted">
                          {formatRelativeTime(whenRaw, locale)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {!selected?.path ? (
          <aside className="min-w-0" aria-label={t("studentRepo.sidebar.aria")}>
            <div className="space-y-6">
              <section className="border-b border-(--color-light-card-border) pb-6 dark:border-(--color-dark-card-border)">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold text-primary dark:text-dark-primary">
                    {t("studentRepo.about.title")}
                  </h2>
                  <button
                    type="button"
                    className="text-muted transition-colors hover:text-primary dark:text-dark-muted dark:hover:text-dark-primary"
                  >
                    <Ellipsis className="h-5 w-5" strokeWidth={1.7} aria-hidden />
                  </button>
                </div>
                <p className="text-sm leading-6 text-secondary dark:text-dark-secondary">
                  {aboutText}
                </p>
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
                    <li key={item.key}>{sidebarRow(item)}</li>
                  ))}
                </ul>
              </section>

              <section className="border-b border-(--color-light-card-border) pb-6 dark:border-(--color-dark-card-border)">
                <h3 className="text-xl font-semibold text-primary dark:text-dark-primary">
                  {t("studentRepo.releases.title")}
                </h3>
                <p className="mt-4 text-sm text-muted dark:text-dark-muted">
                  {t("studentRepo.releases.empty")}
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-(--color-chart-blue-primary) hover:underline dark:text-(--color-chart-blue-secondary)"
                >
                  {t("studentRepo.releases.create")}
                </button>
              </section>

              <section>
                <h3 className="text-xl font-semibold text-primary dark:text-dark-primary">
                  {t("studentRepo.packages.title")}
                </h3>
                <p className="mt-4 text-sm text-muted dark:text-dark-muted">
                  {t("studentRepo.packages.empty")}
                </p>
              </section>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 text-muted dark:text-dark-muted"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.75 4.25h4.1l5.15 5.15-2.6 2.6L4.25 6.85v-4.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="5.2" cy="5.2" r="0.9" fill="currentColor" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="m5.5 4.5-3 3 3 3M10.5 4.5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-4 w-4 text-muted dark:text-dark-muted"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.75 8a5.25 5.25 0 1 0 1.57-3.74L2.75 5.75M2.75 2.75v3h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RepositoryCodePanel({ filePath, fileBytes }) {
  if (fileBytes?.length) {
    return (
      <OverviewMode
        fileBytes={fileBytes}
        filePath={filePath}
        fileType=""
      />
    );
  }
  return (
    <div className="rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 text-sm text-muted dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-muted">
      Preview is unavailable for this file response. Use `Raw` or `Download`.
    </div>
  );
}

function RepositoryBlamePanel({
  owner,
  repo,
  filePath,
  branch,
  fileText,
  locale,
  onOpenHistory,
}) {
  const { t } = useTranslation();
  const [blameRows, setBlameRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredGroup, setHoveredGroup] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!owner || !repo || !filePath || fileText == null) {
        setBlameRows([]);
        setError("");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const rows = await fetchFileBlame(owner, repo, filePath, branch);
        if (!cancelled) setBlameRows(Array.isArray(rows) ? rows : []);
      } catch (err) {
        if (!cancelled) {
          setBlameRows([]);
          setError(String(err?.message ?? t("documentViewer.blame.binary")));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [branch, filePath, fileText, owner, repo, t]);

  const lines = useMemo(
    () => (typeof fileText === "string" ? fileText.split(/\r?\n/) : []),
    [fileText],
  );

  const blameByLine = useMemo(() => {
    const map = new Map();
    blameRows.forEach((row) => {
      const lineNumber = blameLineNumber(row);
      if (lineNumber > 0) map.set(lineNumber, row);
    });
    return map;
  }, [blameRows]);

  const groups = useMemo(() => {
    if (!lines.length) return [];
    const grouped = [];
    let current = null;
    lines.forEach((content, index) => {
      const lineNumber = index + 1;
      const blame = blameByLine.get(lineNumber) ?? null;
      const sha = blameCommitSha(blame);
      const key = `${sha || "unknown"}-${lineNumber}`;
      const row = {
        lineNumber,
        content,
        sha,
        author: blameCommitAuthor(blame),
        message: blameCommitMessage(blame),
        timestamp: blameCommitTimestamp(blame),
      };
      if (
        !current ||
        current.sha !== row.sha ||
        current.author !== row.author ||
        current.message !== row.message ||
        current.timestamp !== row.timestamp
      ) {
        current = {
          key,
          sha: row.sha,
          author: row.author,
          message: row.message,
          timestamp: row.timestamp,
          lines: [row],
        };
        grouped.push(current);
      } else {
        current.lines.push(row);
      }
    });
    return grouped;
  }, [blameByLine, lines]);

  const contributorNames = useMemo(() => {
    const set = new Set();
    groups.forEach((group) => {
      if (group.author) set.add(group.author);
    });
    return Array.from(set);
  }, [groups]);

  const [minTs, maxTs] = useMemo(() => {
    const stamps = groups
      .map((group) => new Date(group.timestamp).getTime())
      .filter((value) => Number.isFinite(value));
    if (!stamps.length) return [0, 0];
    return [Math.min(...stamps), Math.max(...stamps)];
  }, [groups]);

  const contributorCount = contributorNames.length || 0;

  if (fileText == null) {
    return (
      <div className="rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 text-sm text-muted dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-muted">
        {t("documentViewer.blame.binary")}
      </div>
    );
  }

  if (loading) {
    return (
      <p className="px-4 py-4 text-sm text-white/60">
        {t("studentRepo.browser.historyLoading")}
      </p>
    );
  }

  if (error) {
    return (
      <div className="m-4 rounded-md border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-sm text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
        {error}
      </div>
    );
  }

  return (
    <div className="overflow-hidden border-t border-white/10 bg-[#0d1117] text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-white/72">
          <span>Older</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 10 }).map((_, index) => {
              const ratio = index / 9;
              return (
                <span
                  key={index}
                  className="h-3 w-3 rounded-[2px]"
                  style={{
                    backgroundColor: `hsla(34, 88%, ${22 + ratio * 40}%, .95)`,
                  }}
                />
              );
            })}
          </div>
          <span>Newer</span>
        </div>

        <div className="flex items-center gap-3">
          {contributorNames.slice(0, 1).map((name) => (
            <span
              key={name}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xs font-semibold text-white"
              title={name}
            >
              {initialsFromName(name)}
            </span>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/86 transition-colors hover:bg-white/[0.08]"
            onClick={onOpenHistory}
          >
            Contributors
            <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-white/15 px-1.5 text-xs">
              {contributorCount}
            </span>
          </button>
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
          Line Ownership
        </p>
      </div>

      <div>
        {!groups.length ? (
          <p className="px-4 py-4 text-xs text-white/60">
            {t("studentRepo.browser.historyEmpty")}
          </p>
        ) : (
          groups.map((group) => {
            const ts = new Date(group.timestamp).getTime();
            const ratio =
              Number.isFinite(ts) && maxTs > minTs ? (ts - minTs) / (maxTs - minTs) : 0.45;
            const bg = `hsla(34, 88%, ${20 + ratio * 38}%, ${hoveredGroup === group.key ? 0.26 : 0.14})`;
            const accent = `hsla(29, 92%, ${28 + ratio * 42}%, .96)`;
            return (
              <div
                key={group.key}
                className="grid border-b border-white/10 md:grid-cols-[minmax(280px,34%)_minmax(0,1fr)]"
                onMouseEnter={() => setHoveredGroup(group.key)}
                onMouseLeave={() => setHoveredGroup("")}
              >
                <div className="border-r border-white/10 px-0" style={{ backgroundColor: bg }}>
                  <div className="grid h-full grid-cols-[4px_minmax(0,1fr)]">
                    <span style={{ backgroundColor: accent }} />
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/20 text-[10px] font-semibold">
                          {initialsFromName(group.author)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/70">
                            <span>{formatRelativeTime(group.timestamp, locale)}</span>
                            <span className="truncate">{group.author || "—"}</span>
                          </div>
                          <button
                            type="button"
                            className="mt-1 block max-w-full truncate text-left text-[12px] font-medium text-white/88 transition-colors hover:text-white/80"
                            title={group.message || "—"}
                            onClick={onOpenHistory}
                          >
                            {truncateMiddle(group.message || "—", 44)}
                          </button>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-white/62">
                            <button
                              type="button"
                              className="font-mono transition-colors hover:text-white"
                              title={group.sha || ""}
                              onClick={async () => {
                                if (!group.sha) return;
                                try {
                                  await navigator.clipboard.writeText(group.sha);
                                  gooeyToast.success("Commit SHA copied.");
                                } catch {
                                  gooeyToast.error("Could not copy commit SHA.");
                                }
                              }}
                            >
                              {group.sha ? group.sha.slice(0, 7) : "—"}
                            </button>
                            <button
                              type="button"
                              className={iconGhostButtonClass({ compact: true })}
                              title="Copy SHA"
                              onClick={async () => {
                                if (!group.sha) return;
                                try {
                                  await navigator.clipboard.writeText(group.sha);
                                  gooeyToast.success("Commit SHA copied.");
                                } catch {
                                  gooeyToast.error("Could not copy commit SHA.");
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 overflow-x-auto">
                  {group.lines.map((line) => (
                    <div
                      key={`${group.key}-${line.lineNumber}`}
                      className={cn(
                        "grid grid-cols-[64px_minmax(0,1fr)] border-b border-white/6 font-mono text-[11px] leading-6 last:border-b-0",
                        hoveredGroup === group.key ? "bg-white/[0.03]" : "",
                      )}
                    >
                      <div className="select-none px-3 text-right text-white/38">
                        {line.lineNumber}
                      </div>
                      <pre className="m-0 px-4 text-white/90">
                        <code>{line.content || " "}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
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
      <div className="rounded-md border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-xs text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
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
    <pre className="max-h-[min(60vh,640px)] overflow-auto rounded-md border border-(--color-light-card-border) bg-(--color-light-input-bg) p-4 font-mono text-xs text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
      <code>{text ?? ""}</code>
    </pre>
  );
}
