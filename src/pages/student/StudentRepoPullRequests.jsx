import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  GitBranch,
  GitCompareArrows,
  GitMerge,
  GitPullRequest,
  Loader2,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from "react-router-dom";
import { gooeyToast } from "goey-toast";
import Button from "../../components/Button";
import ConflictResolver from "../../components/MergeConflict/ConflictResolver";
import Select from "../../components/Select";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { cn } from "../../lib/utils";
import {
  useVcMergePullRequest,
  useVcMergeConflicts,
  useVcCreatePullRequest,
  useVcRepoPullRequests,
  useVcRepositoryRefs,
  useSessionProfile,
} from "../../services/useApi";
import {
  fetchRepositoryCommitDiff,
  fetchRepositoryCompare,
} from "../../services/versionControlService";

function prTitle(pr) {
  return pr.title ?? pr.name ?? pr.subject ?? `#${pr.id ?? pr.number ?? ""}`;
}

function prStatusValue(pr) {
  const raw = pr?.status ?? pr?.state ?? "OPENED";
  return String(raw ?? "OPENED").trim().toUpperCase();
}

function prAuthorName(pr) {
  const author = pr?.author;
  if (!author || typeof author !== "object") return "—";
  const full = [author.firstName, author.lastName].filter(Boolean).join(" ").trim();
  return full || author.username || author.email || author.id || "—";
}

function prAuthorId(pr) {
  return String(pr?.author?.id ?? pr?.authorId ?? "").trim();
}

function prCreatedAt(pr) {
  return String(pr?.created_at ?? pr?.createdAt ?? "").trim();
}

function prCreatedAtMs(pr) {
  const raw = prCreatedAt(pr);
  const value = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(value) ? value : 0;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function prSourceBranch(pr) {
  return String(pr?.source_branch ?? pr?.sourceBranch ?? "").trim();
}

function prTargetBranch(pr) {
  return String(pr?.target_branch ?? pr?.targetBranch ?? "").trim();
}

function prSourceHash(pr) {
  return String(pr?.source_hash ?? pr?.sourceHash ?? "").trim();
}

function prTargetHash(pr) {
  return String(pr?.target_hash ?? pr?.targetHash ?? "").trim();
}

function isLikelySha(value) {
  const text = String(value ?? "").trim();
  return /^[a-f0-9]{7,40}$/i.test(text);
}

function normalizeBranchLabel(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/^refs\/heads\//i.test(text)) {
    return text.replace(/^refs\/heads\//i, "").trim();
  }
  if (/^ref:\s*refs\/heads\//i.test(text)) {
    return text.replace(/^ref:\s*refs\/heads\//i, "").trim();
  }
  return text;
}

function shortSha(value) {
  const text = String(value ?? "").trim();
  if (!isLikelySha(text)) return text;
  return text.slice(0, 8);
}

function branchCandidates(pr, kind) {
  const source = kind === "source";
  return [
    source ? pr?.source_branch : pr?.target_branch,
    source ? pr?.sourceBranch : pr?.targetBranch,
    source ? pr?.source_hash : pr?.target_hash,
    source ? pr?.sourceHash : pr?.targetHash,
    source ? pr?.sourceRef : pr?.targetRef,
    source ? pr?.head : pr?.base,
    source ? pr?.headBranch : pr?.baseBranch,
    source ? pr?.compareBranch : pr?.baseBranchName,
  ]
    .map(normalizeBranchLabel)
    .filter(Boolean);
}

function readableSourceBranch(pr) {
  const candidates = branchCandidates(pr, "source");
  const readable = candidates.find((value) => !isLikelySha(value));
  if (readable) return readable;
  return "";
}

function readableTargetBranch(pr) {
  const candidates = branchCandidates(pr, "target");
  const readable = candidates.find((value) => !isLikelySha(value));
  if (readable) return readable;
  return "";
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

function prStatusMeta(pr) {
  const status = prStatusValue(pr);
  switch (status) {
    case "MERGED":
    case "MERGE":
      return {
        label: "Merged",
        className:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/12 dark:text-purple-300",
        icon: GitMerge,
      };
    case "CLOSED":
      return {
        label: "Closed",
        className:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/12 dark:text-red-300",
        icon: XCircle,
      };
    case "DRAFT":
      return {
        label: "Draft",
        className:
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-500/20 dark:bg-slate-500/12 dark:text-slate-300",
        icon: CircleDot,
      };
    case "READY_FOR_REVIEW":
      return {
        label: "Ready for review",
        className:
          "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/12 dark:text-sky-300",
        icon: CheckCircle2,
      };
    case "CONFLICTING":
    case "CONFLICTED":
      return {
        label: "Conflicting",
        className:
          "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300",
        icon: AlertTriangle,
      };
    case "OPENED":
    default:
      return {
        label: "Open",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-300",
        icon: GitPullRequest,
      };
  }
}

function prMergeMessage(pr) {
  const status = prStatusValue(pr);
  if (status === "MERGED" || status === "MERGE") {
    return {
      tone: "merged",
      label: "This pull request has already been merged into the base branch.",
    };
  }
  if (status === "CLOSED") {
    return {
      tone: "closed",
      label: "This pull request was closed without merging.",
    };
  }
  if (status === "DRAFT") {
    return {
      tone: "draft",
      label: "This pull request is still in draft and is not ready to merge yet.",
    };
  }
  if (status === "CONFLICTING" || status === "CONFLICTED") {
    return {
      tone: "conflict",
      label: "This branch has conflicts that must be resolved before it can be merged.",
    };
  }
  if (status === "READY_FOR_REVIEW") {
    return {
      tone: "ready",
      label: "This pull request is ready for review and can be merged when you approve it.",
    };
  }
  return {
    tone: "mergeable",
    label: "This branch has no conflicts with the base branch and is ready to merge.",
  };
}

function mergeMessageClass(tone) {
  switch (tone) {
    case "merged":
      return "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/12 dark:text-purple-200";
    case "closed":
      return "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-500/20 dark:bg-slate-500/12 dark:text-slate-200";
    case "draft":
      return "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/12 dark:text-sky-200";
    case "conflict":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-200";
    case "ready":
      return "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/12 dark:text-blue-200";
    case "mergeable":
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-200";
  }
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
    const match = /^refs\/heads\/(.+)$/i.exec(String(k));
    if (match) opts.push({ value: match[1], label: match[1] });
  }
  opts.sort((a, b) => a.label.localeCompare(b.label));
  return opts;
}

function normalizeCompareFiles(raw) {
  const files = raw?.files ?? raw?.changedFiles ?? raw?.changed_files ?? [];
  return Array.isArray(files) ? files : [];
}

function normalizePatchFilePath(raw) {
  const text = String(raw ?? "").trim();
  return text.replace(/^a\//, "").replace(/^b\//, "");
}

function splitUnifiedDiffByFile(diffText) {
  const text = String(diffText ?? "");
  if (!text.trim()) return new Map();

  const sections = text.split(/^diff --git /m).filter(Boolean);
  const map = new Map();

  sections.forEach((section) => {
    const chunk = section.startsWith("a/") ? `diff --git ${section}` : section;
    const lines = chunk.split("\n");
    let path = "";
    for (const line of lines) {
      if (line.startsWith("+++ ")) {
        path = normalizePatchFilePath(line.slice(4));
        if (path === "/dev/null") path = "";
      } else if (!path && line.startsWith("--- ")) {
        const candidate = normalizePatchFilePath(line.slice(4));
        if (candidate !== "/dev/null") path = candidate;
      }
    }
    if (!path) {
      const header = /^diff --git a\/(.+?) b\/(.+)$/.exec(lines[0] ?? "");
      path = normalizePatchFilePath(header?.[2] ?? header?.[1] ?? "");
    }
    if (path) map.set(path, chunk);
  });

  return map;
}

function normalizePatchRows(patchText) {
  const patch = String(patchText ?? "");
  if (!patch.trim()) return [];

  const lines = patch.split("\n");
  const rows = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (match) {
        oldLine = Number(match[1]);
        newLine = Number(match[2]);
      }
      continue;
    }
    if (
      line.startsWith("diff ") ||
      line.startsWith("index ") ||
      line.startsWith("--- ") ||
      line.startsWith("+++ ") ||
      line.startsWith("\\ No newline")
    ) {
      continue;
    }

    if (line.startsWith("+")) {
      rows.push({
        type: "added",
        oldLine: null,
        newLine,
        content: line.slice(1),
      });
      newLine += 1;
      continue;
    }
    if (line.startsWith("-")) {
      rows.push({
        type: "removed",
        oldLine,
        newLine: null,
        content: line.slice(1),
      });
      oldLine += 1;
      continue;
    }

    const content = line.startsWith(" ") ? line.slice(1) : line;
    rows.push({
      type: "context",
      oldLine,
      newLine,
      content,
    });
    oldLine += 1;
    newLine += 1;
  }

  return rows;
}

function summarizePatchRows(rows) {
  return rows.reduce(
    (acc, row) => {
      if (row.type === "added") acc.additions += 1;
      if (row.type === "removed") acc.deletions += 1;
      return acc;
    },
    { additions: 0, deletions: 0 },
  );
}

function fileChangeCount(row, kind) {
  const raw =
    kind === "add"
      ? row?.additions ?? row?.linesAdded ?? row?.insertions
      : row?.deletions ?? row?.linesDeleted ?? row?.removals;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function PullRequestConflictPanel({
  owner,
  repo,
  prId,
  active,
  onResolved,
}) {
  const {
    data: conflicts = [],
    isLoading,
  } = useVcMergeConflicts(owner, repo, prId, {
    enabled: active,
    notifyOnError: false,
  });

  if (!active) return null;

  return (
    <>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-200">
        Merge conflicts were detected for this pull request.
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-lg border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-2 text-xs text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading conflicts
        </div>
      ) : null}

      {!isLoading && conflicts.length ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-primary dark:text-dark-primary">
            Conflicted files
          </p>
          {conflicts.map((conflict, conflictIndex) => (
            <div
              key={`${prId}-conflict-${conflict.path ?? conflict.filePath ?? conflictIndex}`}
              className="rounded-lg border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-2 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
            >
              <p className="text-xs font-semibold text-primary dark:text-dark-primary">
                {conflict.path ||
                  conflict.filePath ||
                  `Conflict ${conflictIndex + 1}`}
              </p>
              <p className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                {conflict.binary
                  ? "Binary conflict"
                  : "Source and target both changed this file. The conflicting text is shown below."}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <ConflictResolver
        owner={owner}
        repo={repo}
        prNumber={prId}
        onResolved={onResolved}
      />
    </>
  );
}

function PullRequestCard({
  pr,
  owner,
  repo,
  locale,
  activePrId,
  setActivePrId,
  mergePr,
  mergingPrId,
  onMerge,
  refetch,
}) {
  const prId = String(pr.id ?? pr.number ?? pr.uuid ?? "");
  const active = activePrId === prId;
  const sourceBranch = readableSourceBranch(pr);
  const targetBranch = readableTargetBranch(pr);
  const createdAt = prCreatedAt(pr);
  const sourceHash = prSourceHash(pr);
  const targetHash = prTargetHash(pr);
  const baseStatus = prStatusValue(pr);
  const isOpenish = ["OPENED", "READY_FOR_REVIEW"].includes(baseStatus);
  const {
    data: liveConflicts = [],
    isLoading: conflictsLoading,
  } = useVcMergeConflicts(owner, repo, prId, {
    enabled: Boolean(owner && repo && prId && isOpenish),
    notifyOnError: false,
    retry: false,
  });
  const hasLiveConflicts = Array.isArray(liveConflicts) && liveConflicts.length > 0;
  const effectiveStatus =
    hasLiveConflicts && !["CONFLICTING", "CONFLICTED", "MERGED", "MERGE", "CLOSED"].includes(baseStatus)
      ? "CONFLICTING"
      : baseStatus;
  const derivedPr = { ...pr, status: effectiveStatus };
  const statusMeta = prStatusMeta(derivedPr);
  const mergeMessage = prMergeMessage(derivedPr);
  const StatusIcon = statusMeta.icon;
  const description = pr.description ?? pr.summary ?? pr.body ?? "";
  const isConflicting = ["CONFLICTING", "CONFLICTED"].includes(effectiveStatus);
  const mergeBusy = mergingPrId === prId;

  return (
    <article
      key={prId}
      className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                statusMeta.className,
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
              {statusMeta.label}
            </span>
            <p className="min-w-0 truncate text-sm font-semibold text-primary dark:text-dark-primary">
              {prTitle(pr)}
            </p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-card-bg) px-2 py-0.5 font-medium text-secondary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-secondary">
              {sourceBranch || "Source branch"}
            </span>
            <span className="text-muted dark:text-dark-muted">→</span>
            <span className="rounded-full border border-(--color-light-card-border) bg-(--color-light-card-bg) px-2 py-0.5 font-medium text-secondary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-secondary">
              {targetBranch || "Target branch"}
            </span>
          </div>
        </div>

        <div className="text-right text-[11px] text-muted dark:text-dark-muted">
          <p>{formatRelativeTime(createdAt, locale)}</p>
          <p className="mt-1">{formatAbsoluteTime(createdAt, locale)}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-secondary dark:text-dark-secondary">
        <span>by {prAuthorName(pr)}</span>
        {isConflicting ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/12 dark:text-amber-300">
            Needs conflict resolution
          </span>
        ) : null}
        {conflictsLoading && isOpenish ? (
          <span className="rounded-full bg-slate-50 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-500/12 dark:text-slate-300">
            Checking conflicts…
          </span>
        ) : null}
      </div>

      {description ? (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-secondary dark:text-dark-secondary">
          {description}
        </p>
      ) : null}

      <div
        className={cn(
          "mt-4 rounded-lg border px-3 py-2 text-xs font-medium",
          mergeMessageClass(mergeMessage.tone),
        )}
      >
        {mergeMessage.label}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isOpenish && !isConflicting ? (
          <Button
            type="button"
            loading={mergeBusy && mergePr.isPending}
            disabled={mergePr.isPending && !mergeBusy}
            onClick={() => onMerge(prId)}
          >
            Merge pull request
          </Button>
        ) : null}
        {isConflicting ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setActivePrId(prId)}
          >
            Resolve conflicts
          </Button>
        ) : null}
        {isOpenish && !isConflicting ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
            Ready to merge
          </span>
        ) : null}
        <button
          type="button"
          className="rounded-md border border-(--color-light-card-border) px-2.5 py-1 text-[11px] font-medium text-secondary transition-colors hover:bg-(--color-light-card-hover) hover:text-primary dark:border-(--color-dark-card-border) dark:text-dark-secondary dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary"
          onClick={() =>
            setActivePrId((current) =>
              current === prId ? "" : prId,
            )
          }
        >
          {active ? "Hide details" : "Show details"}
        </button>
      </div>

      {active ? (
        <div className="mt-4 space-y-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-2 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                Compare
              </p>
              <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                {(sourceBranch || "Source branch")} → {(targetBranch || "Target branch")}
              </p>
            </div>
            <div className="rounded-lg border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-2 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                {statusMeta.label}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted dark:text-dark-muted">
            <GitBranch className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Source hash: {shortSha(sourceHash) || "—"}</span>
            <span>•</span>
            <span>Target hash: {shortSha(targetHash) || "—"}</span>
          </div>

          {(isConflicting || hasLiveConflicts) ? (
            <PullRequestConflictPanel
              owner={owner}
              repo={repo}
              prId={prId}
              active={active}
              onResolved={async () => {
                await refetch();
              }}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function StudentRepoPullRequests() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { owner, repo, repoBase, repositoryMeta } = useOutletContext() ?? {};
  const locale = i18n.language || undefined;
  const [params, setParams] = useSearchParams();
  const createMode = params.get("create") === "1";
  const defaultBranch =
    repositoryMeta?.default_branch ??
    repositoryMeta?.defaultBranch ??
    repositoryMeta?.defaultBranchName ??
    "main";

  const { data = [], isLoading, refetch } = useVcRepoPullRequests(owner, repo, {
    notifyOnError: false,
  });
  const { data: sessionUser } = useSessionProfile({
    notifyOnError: false,
  });
  const { data: refsPayload } = useVcRepositoryRefs(owner, repo, {
    notifyOnError: false,
    enabled: Boolean(owner && repo),
  });
  const createPr = useVcCreatePullRequest({
    showErrorToast: false,
  });
  const mergePr = useVcMergePullRequest({
    showErrorToast: true,
  });

  const branchOpts = useMemo(
    () => branchOptionsFromRefsPayload(refsPayload ?? {}),
    [refsPayload],
  );
  const headBranch = refsHeadBranch(refsPayload ?? {});

  const [baseRef, setBaseRef] = useState(
    params.get("base") || String(defaultBranch || "main"),
  );
  const [headRef, setHeadRef] = useState(params.get("head") || headBranch || "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [compareState, setCompareState] = useState({
    loading: false,
    error: "",
    files: [],
    patchMap: new Map(),
  });
  const [expandedFile, setExpandedFile] = useState("");
  const [activePrId, setActivePrId] = useState(params.get("pr") || "");
  const [mergingPrId, setMergingPrId] = useState("");

  useEffect(() => {
    if (!branchOpts.length) return;
    if (!branchOpts.some((row) => row.value === baseRef)) {
      setBaseRef(String(defaultBranch || branchOpts[0]?.value || "main"));
    }
    if (!headRef && headBranch) {
      setHeadRef(headBranch);
    } else if (headRef && !branchOpts.some((row) => row.value === headRef)) {
      setHeadRef(String(headBranch || branchOpts[0]?.value || ""));
    }
  }, [baseRef, branchOpts, defaultBranch, headBranch, headRef]);

  useEffect(() => {
    if (!createMode) return;
    const next = new URLSearchParams(params);
    if (baseRef) next.set("base", baseRef);
    if (headRef) next.set("head", headRef);
    setParams(next, { replace: true });
  }, [baseRef, createMode, headRef, params, setParams]);

  useEffect(() => {
    if (createMode) return;
    const prParam = params.get("pr") || "";
    setActivePrId(prParam);
  }, [createMode, params]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!createMode || !owner || !repo || !baseRef || !headRef || baseRef === headRef) {
        setCompareState({ loading: false, error: "", files: [], patchMap: new Map() });
        return;
      }
      setCompareState((current) => ({
        ...current,
        loading: true,
        error: "",
      }));
      try {
        const [compare, rawDiff] = await Promise.all([
          fetchRepositoryCompare(owner, repo, baseRef, headRef),
          fetchRepositoryCommitDiff(owner, repo, baseRef, headRef),
        ]);
        if (cancelled) return;
        const diffText =
          typeof rawDiff === "string"
            ? rawDiff
            : typeof rawDiff?.diff === "string"
              ? rawDiff.diff
              : typeof rawDiff?.patch === "string"
                ? rawDiff.patch
                : "";
        const patchMap = splitUnifiedDiffByFile(diffText);
        const files = normalizeCompareFiles(compare).map((row, index) => ({
          key: `${row?.path ?? index}`,
          path: String(row?.path ?? `file-${index}`),
          status: String(row?.status ?? "modified"),
          additions: fileChangeCount(row, "add"),
          deletions: fileChangeCount(row, "delete"),
          patch: patchMap.get(String(row?.path ?? "")) || "",
        }));
        if (!cancelled) {
          setCompareState({
            loading: false,
            error: "",
            files,
            patchMap,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setCompareState({
            loading: false,
            error: String(error?.message ?? "Failed to load branch comparison."),
            files: [],
            patchMap: new Map(),
          });
        }
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [baseRef, createMode, headRef, owner, repo]);

  useEffect(() => {
    if (!createMode) return;
    if (title.trim()) return;
    if (!headRef || !baseRef) return;
    setTitle(`Merge ${headRef} into ${baseRef}`);
  }, [baseRef, createMode, headRef, title]);

  useEffect(() => {
    if (!compareState.files.length) {
      setExpandedFile("");
      return;
    }
    if (compareState.files.some((file) => file.key === expandedFile)) return;
    setExpandedFile(compareState.files[0].key);
  }, [compareState.files, expandedFile]);

  const changeSummary = useMemo(() => {
    return compareState.files.reduce(
      (acc, file) => {
        const rows = normalizePatchRows(file.patch);
        const rowSummary = summarizePatchRows(rows);
        acc.files += 1;
        acc.additions += file.additions ?? rowSummary.additions;
        acc.deletions += file.deletions ?? rowSummary.deletions;
        return acc;
      },
      { files: 0, additions: 0, deletions: 0 },
    );
  }, [compareState.files]);

  const prSummary = useMemo(() => {
    return (data ?? []).reduce(
      (acc, pr) => {
        const status = prStatusValue(pr);
        acc.total += 1;
        if (["OPENED", "READY_FOR_REVIEW"].includes(status)) acc.open += 1;
        if (["CONFLICTING", "CONFLICTED"].includes(status)) acc.conflicting += 1;
        if (status === "MERGED" || status === "MERGE") acc.merged += 1;
        if (status === "CLOSED") acc.closed += 1;
        if (status === "DRAFT") acc.draft += 1;
        return acc;
      },
      { total: 0, open: 0, conflicting: 0, merged: 0, closed: 0, draft: 0 },
    );
  }, [data]);

  const canSubmit =
    createMode &&
    owner &&
    repo &&
    baseRef &&
    headRef &&
    baseRef !== headRef &&
    title.trim().length > 0 &&
    String(sessionUser?.id ?? "").trim().length > 0 &&
    !createPr.isPending;

  async function findCreatedPullRequest() {
    const expectedTitle = title.trim();
    const expectedSource = String(headRef ?? "").trim();
    const expectedTarget = String(baseRef ?? "").trim();
    const expectedAuthorId = String(sessionUser?.id ?? "").trim();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const refreshed = await refetch();
      const rows = Array.isArray(refreshed?.data) ? refreshed.data : data;
      const fallback = [...(rows ?? [])]
        .filter((pr) => {
          const titleMatches = prTitle(pr) === expectedTitle;
          const sourceMatches = readableSourceBranch(pr) === expectedSource;
          const targetMatches = readableTargetBranch(pr) === expectedTarget;
          const authorMatches =
            (expectedAuthorId && prAuthorId(pr) === expectedAuthorId) ||
            prAuthorName(pr) === prAuthorName({ author: sessionUser });
          return titleMatches && sourceMatches && targetMatches && authorMatches;
        })
        .sort((a, b) => prCreatedAtMs(b) - prCreatedAtMs(a))[0];

      if (fallback) {
        return fallback;
      }

      if (attempt < 2) {
        await wait(500);
      }
    }

    return null;
  }

  async function onSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    try {
      const created = await createPr.mutateAsync({
        owner,
        repo,
        title: title.trim(),
        description: body.trim() || title.trim(),
        sourceBranch: headRef,
        targetBranch: baseRef,
        author: String(sessionUser?.id ?? "").trim(),
      });
      await refetch();
      const prId = created?.number ?? created?.id ?? created?.pullRequestId ?? "";
      const next = new URLSearchParams();
      if (prId) next.set("pr", String(prId));
      navigate(
        `${repoBase}/pull-requests${next.toString() ? `?${next.toString()}` : ""}`,
        { replace: true },
      );
    } catch (error) {
      const fallback = await findCreatedPullRequest();
      if (fallback) {
        gooeyToast.success("Pull request created");
        const prId = fallback?.number ?? fallback?.id ?? fallback?.pullRequestId ?? "";
        const next = new URLSearchParams();
        if (prId) next.set("pr", String(prId));
        navigate(
          `${repoBase}/pull-requests${next.toString() ? `?${next.toString()}` : ""}`,
          { replace: true },
        );
        return;
      }

      gooeyToast.error(String(error?.message ?? "Failed to create pull request."));
    }
  }

  async function onMerge(prId) {
    if (!owner || !repo || !prId) return;
    setMergingPrId(String(prId));
    try {
      await mergePr.mutateAsync({
        owner,
        repo,
        prNumber: prId,
      });
      const next = new URLSearchParams(params);
      next.set("pr", String(prId));
      setParams(next, { replace: true });
    } catch {
      // error already normalized
    } finally {
      setMergingPrId("");
    }
  }

  return (
    <div className="space-y-5">
      <SettingsSectionCard
        title={t("studentRepo.pulls.title")}
        description={t("studentRepo.pulls.subtitle")}
        icon={GitPullRequest}
        action={
          createMode ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`${repoBase}/pull-requests`)}
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() =>
                navigate(
                  `${repoBase}/pull-requests?create=1&base=${encodeURIComponent(
                    defaultBranch,
                  )}&head=${encodeURIComponent(headBranch || "")}`,
                )
              }
            >
              New Pull Request
            </Button>
          )
        }
      >
        {createMode ? (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Select
                label="Base branch"
                value={baseRef}
                onChange={setBaseRef}
                options={branchOpts}
                placeholder="Select base branch"
              />
              <Select
                label="Compare branch"
                value={headRef}
                onChange={setHeadRef}
                options={branchOpts}
                placeholder="Select compare branch"
              />
            </div>

            <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
              <div className="flex flex-wrap items-center gap-2 text-sm text-primary dark:text-dark-primary">
                <GitCompareArrows className="h-4 w-4" strokeWidth={1.8} aria-hidden />
                <span className="font-semibold">{baseRef || "base"}</span>
                <span className="text-muted dark:text-dark-muted">← into ←</span>
                <span className="font-semibold">{headRef || "compare"}</span>
              </div>
              <p className="mt-2 text-xs text-secondary dark:text-dark-secondary">
                Review the changes between these branches, then create the pull request.
              </p>
              {baseRef && headRef && baseRef === headRef ? (
                <p className="mt-2 text-xs text-(--color-light-error-text) dark:text-(--color-dark-error-text)">
                  Base and compare branches must be different.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-10 w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3 text-sm text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                  placeholder="Add a title for this pull request"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                  Description
                </label>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3 py-2 text-sm text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                  placeholder="Describe what this pull request changes"
                />
              </div>
            </div>

            <div className="rounded-xl border border-(--color-light-card-border) dark:border-(--color-dark-card-border)">
              <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  <span>Changes</span>
                  <span className="rounded-full border border-(--color-light-card-border) px-2 py-0.5 text-[10px] dark:border-(--color-dark-card-border)">
                    {changeSummary.files} file{changeSummary.files === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
                    +{changeSummary.additions}
                  </span>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-700 dark:bg-red-500/12 dark:text-red-300">
                    -{changeSummary.deletions}
                  </span>
                </div>
              </div>

              {compareState.loading ? (
                <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                  Loading branch diff…
                </p>
              ) : compareState.error ? (
                <p className="px-4 py-4 text-sm text-(--color-light-error-text) dark:text-(--color-dark-error-text)">
                  {compareState.error}
                </p>
              ) : !compareState.files.length ? (
                <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                  No differences found between these branches.
                </p>
              ) : (
                <div className="space-y-3 p-4">
                  {compareState.files.map((file) => {
                    const rows = normalizePatchRows(file.patch);
                    const rowSummary = summarizePatchRows(rows);
                    const additions = file.additions ?? rowSummary.additions;
                    const deletions = file.deletions ?? rowSummary.deletions;
                    return (
                      <section
                        key={file.key}
                        className="overflow-hidden rounded-lg border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                      >
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 bg-light-app-tertiary px-4 py-3 text-left dark:bg-dark-app-tertiary"
                          onClick={() =>
                            setExpandedFile((current) =>
                              current === file.key ? "" : file.key,
                            )
                          }
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-primary dark:text-dark-primary">
                              {file.path}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="uppercase tracking-wide text-muted dark:text-dark-muted">
                                {file.status}
                              </span>
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
                                +{additions}
                              </span>
                              <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-700 dark:bg-red-500/12 dark:text-red-300">
                                -{deletions}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-muted dark:text-dark-muted">
                            {expandedFile === file.key ? "Hide" : "Show"}
                          </span>
                        </button>
                        {expandedFile === file.key ? (
                          <div className="overflow-auto border-t border-(--color-light-card-border) dark:border-(--color-dark-card-border)">
                            <div className="grid grid-cols-[48px_48px_24px_minmax(0,1fr)] bg-light-app-tertiary px-0 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted dark:bg-dark-app-tertiary dark:text-dark-muted">
                              <span className="px-2 text-right">Old</span>
                              <span className="px-2 text-right">New</span>
                              <span className="px-1 text-center"></span>
                              <span className="px-2">Content</span>
                            </div>
                            {rows.map((row, index) => {
                              const isAdded = row.type === "added";
                              const isRemoved = row.type === "removed";
                              return (
                                <div
                                  key={`${file.key}-${index}`}
                                  className={cn(
                                    "grid grid-cols-[48px_48px_24px_minmax(0,1fr)] border-t border-(--color-light-card-border) font-mono text-[10px] leading-6 dark:border-(--color-dark-card-border)",
                                    isAdded
                                      ? "bg-green-500/12 text-green-800 dark:text-green-200"
                                      : isRemoved
                                        ? "bg-red-500/12 text-red-800 dark:text-red-200"
                                        : "text-secondary dark:text-dark-secondary",
                                  )}
                                >
                                  <span className="px-2 text-right opacity-70">
                                    {row.oldLine ?? ""}
                                  </span>
                                  <span className="px-2 text-right opacity-70">
                                    {row.newLine ?? ""}
                                  </span>
                                  <span className="px-1 text-center">
                                    {isAdded ? "+" : isRemoved ? "-" : " "}
                                  </span>
                                  <pre className="m-0 px-2">
                                    <code>{row.content || " "}</code>
                                  </pre>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`${repoBase}/pull-requests`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createPr.isPending} disabled={!canSubmit}>
                Create Pull Request
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
                  Total
                </p>
                <p className="mt-2 text-2xl font-semibold text-primary dark:text-dark-primary">
                  {prSummary.total}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/12">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  Open
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-800 dark:text-emerald-200">
                  {prSummary.open}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/20 dark:bg-amber-500/12">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Conflicting
                </p>
                <p className="mt-2 text-2xl font-semibold text-amber-800 dark:text-amber-200">
                  {prSummary.conflicting}
                </p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-500/20 dark:bg-purple-500/12">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                  Merged
                </p>
                <p className="mt-2 text-2xl font-semibold text-purple-800 dark:text-purple-200">
                  {prSummary.merged}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-500/20 dark:bg-slate-500/12">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  Closed / Draft
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-800 dark:text-slate-200">
                  {prSummary.closed + prSummary.draft}
                </p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.pulls.loading")}</p>
            ) : !data.length ? (
              <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.pulls.empty")}</p>
            ) : (
              <div className="space-y-2">
                {(data ?? []).map((pr) => (
                  <PullRequestCard
                    key={String(pr.id ?? pr.number ?? pr.uuid ?? prTitle(pr))}
                    pr={pr}
                    owner={owner}
                    repo={repo}
                    locale={locale}
                    activePrId={activePrId}
                    setActivePrId={setActivePrId}
                    mergePr={mergePr}
                    mergingPrId={mergingPrId}
                    onMerge={onMerge}
                    refetch={refetch}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </SettingsSectionCard>
    </div>
  );
}
