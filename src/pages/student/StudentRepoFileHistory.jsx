import { diffLines } from "diff";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { useVcRepositoryCommits } from "../../services/useApi";
import {
  fetchRepositoryBlobPayload,
  fetchRepositoryCompare,
} from "../../services/versionControlService";
import { tryDecodeUtf8 } from "../../utils/binaryFileHandlers";

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

function commitRowParentSha(row) {
  const direct =
    row?.parentSha ??
    row?.parent_sha ??
    row?.parent ??
    row?.baseSha ??
    row?.base_sha ??
    "";
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const parents = row?.parents;
  if (Array.isArray(parents) && parents.length) {
    const first = parents[0];
    if (typeof first === "string") return first.trim();
    const nested = first?.sha ?? first?.id ?? first?.commitSha ?? "";
    return typeof nested === "string" ? nested.trim() : "";
  }
  return "";
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

async function fetchBlobUtf8BySha(owner, repo, blobSha) {
  const sha = String(blobSha ?? "").trim();
  if (!sha) return "";
  const bytes = await fetchRepositoryBlobPayload(owner, repo, sha);
  return tryDecodeUtf8(bytes);
}

function normalizeDiffRows(oldText, newText) {
  const parts = diffLines(oldText ?? "", newText ?? "");
  const rows = [];
  let oldLine = 1;
  let newLine = 1;
  parts.forEach((part) => {
    const rawLines = String(part.value ?? "").split("\n");
    const lines = rawLines.at(-1) === "" ? rawLines.slice(0, -1) : rawLines;
    lines.forEach((line) => {
      if (part.added) {
        rows.push({ type: "added", oldLine: null, newLine, content: line });
        newLine += 1;
      } else if (part.removed) {
        rows.push({ type: "removed", oldLine, newLine: null, content: line });
        oldLine += 1;
      } else {
        rows.push({ type: "context", oldLine, newLine, content: line });
        oldLine += 1;
        newLine += 1;
      }
    });
  });
  return rows;
}

export default function StudentRepoFileHistory() {
  const { t, i18n } = useTranslation();
  const { owner, repo, repoBase } = useOutletContext() ?? {};
  const locale = i18n.language || undefined;
  const [params, setParams] = useSearchParams();
  const ref = params.get("ref") || "main";
  const filePath = params.get("path") || "";
  const [selectedCommit, setSelectedCommit] = useState("");
  const [compareData, setCompareData] = useState(null);
  const [compareBusy, setCompareBusy] = useState(false);
  const [compareErr, setCompareErr] = useState("");

  const commitsQ = useVcRepositoryCommits(
    owner,
    repo,
    {
      path: filePath,
      ref,
      limit: 50,
    },
    {
      enabled: Boolean(owner && repo && ref),
      notifyOnError: false,
    },
  );

  const commits = Array.isArray(commitsQ.data) ? commitsQ.data : [];

  useEffect(() => {
    if (!commits.length) {
      setSelectedCommit("");
      return;
    }
    if (commits.some((row) => commitRowSha(row) === selectedCommit)) return;
    setSelectedCommit(commitRowSha(commits[0]) || "");
  }, [commits, selectedCommit]);

  const selectedCommitRow =
    commits.find((row) => commitRowSha(row) === selectedCommit) ?? null;

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!owner || !repo || !selectedCommitRow) {
        setCompareData(null);
        setCompareErr("");
        return;
      }
      const parentSha = commitRowParentSha(selectedCommitRow);
      if (!parentSha) {
        setCompareData({ files: [] });
        setCompareErr("");
        return;
      }
      setCompareBusy(true);
      setCompareErr("");
      try {
        const data = await fetchRepositoryCompare(owner, repo, parentSha, selectedCommit);
        if (!cancelled) setCompareData(data ?? { files: [] });
      } catch (error) {
        if (!cancelled) {
          setCompareData(null);
          setCompareErr(String(error?.message ?? "Could not load commit changes."));
        }
      } finally {
        if (!cancelled) setCompareBusy(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [owner, repo, selectedCommit, selectedCommitRow]);

  const files = useMemo(() => {
    const list = Array.isArray(compareData?.files) ? compareData.files : [];
    return list.map((row, index) => ({
      key: String(row?.path ?? row?.filePath ?? row?.filename ?? `file-${index}`),
      path: String(row?.path ?? row?.filePath ?? row?.filename ?? `file-${index}`),
      status: String(row?.status ?? "modified"),
      baseSha: String(row?.baseSha ?? row?.base_sha ?? "").trim(),
      headSha: String(row?.headSha ?? row?.head_sha ?? "").trim(),
    }));
  }, [compareData]);

  const [expandedFile, setExpandedFile] = useState("");
  const [diffCache, setDiffCache] = useState({});

  useEffect(() => {
    if (!files.length) {
      setExpandedFile("");
      return;
    }
    if (files.some((file) => file.key === expandedFile)) return;
    setExpandedFile(files[0].key);
  }, [files, expandedFile]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      const file = files.find((item) => item.key === expandedFile);
      if (!file || diffCache[file.key]?.rows) return;
      setDiffCache((current) => ({
        ...current,
        [file.key]: { loading: true, rows: [], error: "" },
      }));
      try {
        const [beforeText, afterText] = await Promise.all([
          file.status === "added" ? Promise.resolve("") : fetchBlobUtf8BySha(owner, repo, file.baseSha),
          file.status === "deleted" ? Promise.resolve("") : fetchBlobUtf8BySha(owner, repo, file.headSha),
        ]);
        if (cancelled) return;
        setDiffCache((current) => ({
          ...current,
          [file.key]: {
            loading: false,
            rows: normalizeDiffRows(beforeText ?? "", afterText ?? ""),
            error: "",
          },
        }));
      } catch (error) {
        if (cancelled) return;
        setDiffCache((current) => ({
          ...current,
          [file.key]: {
            loading: false,
            rows: [],
            error: String(error?.message ?? "Could not load file diff."),
          },
        }));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [diffCache, expandedFile, files, owner, repo]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-primary dark:text-dark-primary">
            {t("studentRepo.browser.historyHeading")}
          </h2>
          <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
            {filePath ? `File: ${filePath}` : "Repository-wide history"}
          </p>
        </div>
        <button
          type="button"
          className="rounded-md border border-(--color-light-card-border) px-3 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-(--color-light-card-hover) hover:text-primary dark:border-(--color-dark-card-border) dark:text-dark-secondary dark:hover:bg-(--color-dark-card-hover) dark:hover:text-dark-primary"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.delete("path");
            setParams(next, { replace: true });
          }}
        >
          All file commits
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
            <p className="text-sm font-semibold text-primary dark:text-dark-primary">
              Commits
            </p>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {commitsQ.isLoading ? (
              <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                {t("studentRepo.browser.historyLoading")}
              </p>
            ) : !commits.length ? (
              <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                {t("studentRepo.browser.historyEmpty")}
              </p>
            ) : (
              commits.map((row, index) => {
                const sha = commitRowSha(row) || `commit-${index}`;
                const active = sha === selectedCommit;
                return (
                  <button
                    key={`${sha}-${index}`}
                    type="button"
                    onClick={() => setSelectedCommit(sha)}
                    className={cn(
                      "w-full border-b border-(--color-light-card-border) px-4 py-3 text-left transition-colors dark:border-(--color-dark-card-border)",
                      active
                        ? "bg-(--color-light-card-hover) dark:bg-(--color-dark-card-hover)"
                        : "hover:bg-(--color-light-card-hover) dark:hover:bg-(--color-dark-card-hover)",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-muted dark:text-dark-muted">
                      <span className="font-mono">{sha.slice(0, 12)}</span>
                      <span>{formatRelativeTime(commitRowTimestamp(row), locale)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                      {commitRowMessage(row) || "—"}
                    </p>
                    <p className="mt-1 text-xs text-secondary dark:text-dark-secondary">
                      {commitRowAuthor(row) || "—"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
              <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                Commit Details
              </p>
            </div>
            {!selectedCommitRow ? (
              <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                Select a commit.
              </p>
            ) : (
              <div className="px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted dark:text-dark-muted">
                  <span className="font-mono">{selectedCommit.slice(0, 12)}</span>
                  <span>{formatAbsoluteTime(commitRowTimestamp(selectedCommitRow), locale)}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-primary dark:text-dark-primary">
                  {commitRowMessage(selectedCommitRow) || "—"}
                </h3>
                <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
                  {commitRowAuthor(selectedCommitRow) || "—"}
                </p>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
            <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
              <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                Changed Files
              </p>
            </div>
            {compareBusy ? (
              <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                Loading files…
              </p>
            ) : compareErr ? (
              <p className="px-4 py-4 text-sm text-light-error-text dark:text-dark-error-text">
                {compareErr}
              </p>
            ) : !files.length ? (
              <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                No changed files returned for this commit.
              </p>
            ) : (
              <div className="space-y-3 p-4">
                {files.map((file) => {
                  const diffState = diffCache[file.key] ?? { loading: false, rows: [], error: "" };
                  return (
                    <section
                      key={file.key}
                      className="overflow-hidden rounded-lg border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFile(file.key)}
                        className="flex w-full items-center justify-between gap-3 bg-light-app-tertiary px-4 py-3 text-left dark:bg-dark-app-tertiary"
                      >
                        <div>
                          <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                            {file.path}
                          </p>
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted dark:text-dark-muted">
                            {file.status}
                          </p>
                        </div>
                      </button>
                      {expandedFile === file.key ? (
                        diffState.loading ? (
                          <p className="px-4 py-4 text-sm text-muted dark:text-dark-muted">
                            Loading changes…
                          </p>
                        ) : diffState.error ? (
                          <p className="px-4 py-4 text-sm text-light-error-text dark:text-dark-error-text">
                            {diffState.error}
                          </p>
                        ) : (
                          <div className="overflow-auto">
                            {diffState.rows.map((diffRow, index) => {
                              const isAdded = diffRow.type === "added";
                              const isRemoved = diffRow.type === "removed";
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
                                    {diffRow.oldLine ?? ""}
                                  </span>
                                  <span className="px-2 text-right opacity-70">
                                    {diffRow.newLine ?? ""}
                                  </span>
                                  <span className="px-1 text-center">
                                    {isAdded ? "+" : isRemoved ? "-" : " "}
                                  </span>
                                  <pre className="m-0 px-2">
                                    <code>{diffRow.content || " "}</code>
                                  </pre>
                                </div>
                              );
                            })}
                          </div>
                        )
                      ) : null}
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
