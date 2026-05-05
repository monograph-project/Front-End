import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { html } from "diff2html/lib-esm/diff2html.js";
import "diff2html/bundles/css/diff2html.min.css";
import { fetchPullRequestFileDiff } from "../../services/versionControlService";
import { generateUnifiedDiff } from "../../services/diffService";
import Button from "../Button";
import DocumentViewerLoading from "../vcShared/DocumentViewerLoading";

/**
 * @param {{
 *   owner: string,
 *   repo: string,
 *   prNumber: string|number,
 *   fileIndex: number,
 *   filePath?: string,
 *   status?: string,
 * }} props
 */
export default function DiffViewer({
  owner,
  repo,
  prNumber,
  fileIndex,
  filePath,
  status,
}) {
  const { t } = useTranslation();
  const hostRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const [unified, setUnified] = useState("");
  const [viewMode, setViewMode] = useState(
    /** @type {"split" | "unified"} */ ("split"),
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorKey(null);
      setUnified("");
      try {
        const data = await fetchPullRequestFileDiff(
          owner,
          repo,
          prNumber,
          fileIndex,
        );
        const path =
          String(data.filePath ?? data.filename ?? filePath ?? "change.txt");

        const st = String(status ?? data.status ?? "").toLowerCase();

        let oldContent =
          data.oldContent != null ?
            String(data.oldContent)
          : String(data.baseContent ?? "");

        let newContent =
          data.newContent != null ?
            String(data.newContent)
          : String(data.headContent ?? "");

        if (
          ["added", "a", "create", "created", "create mode"].includes(st)
        ) {
          oldContent = "";
        } else if (
          ["deleted", "d", "remove", "removed", "deleted file"].includes(st)
        ) {
          newContent = "";
        }

        const patch = generateUnifiedDiff(oldContent, newContent, path);
        if (!cancelled) setUnified(patch ?? "");
      } catch {
        if (!cancelled) setErrorKey("pullRequests.diff.failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [owner, repo, prNumber, fileIndex, filePath, status]);

  useEffect(() => {
    if (!hostRef.current || !unified) return;
    const format = viewMode === "split" ? "side-by-side" : "line-by-line";
    const out = html(unified, {
      drawFileList: false,
      matching: "lines",
      outputFormat: format,
    });
    hostRef.current.innerHTML = out ?? "";
  }, [unified, viewMode]);

  return (
    <div className="vc-diff-viewer rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-light-divider px-4 py-3 dark:border-dark-divider">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {status ?
            <span className="rounded-full border border-light-divider bg-(--color-light-input-bg) px-3 py-0.5 font-mono uppercase tracking-wide dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
              {status}
            </span>
          : null}
          <span className="truncate font-normal text-muted dark:text-dark-muted">
            {filePath}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={viewMode === "split" ? "primary" : "secondary"}
            onClick={() => setViewMode("split")}
          >
            {t("pullRequests.diff.split")}
          </Button>
          <Button
            type="button"
            variant={viewMode === "unified" ? "primary" : "secondary"}
            onClick={() => setViewMode("unified")}
          >
            {t("pullRequests.diff.unified")}
          </Button>
        </div>
      </div>
      <div className="p-2">
        {loading ?
          <DocumentViewerLoading className="min-h-48" />
        : errorKey ?
          <div className="rounded-xl border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-xs text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
            {t(errorKey)}
          </div>
        : unified ?
          <div
            ref={hostRef}
            className="overflow-auto [&_.d2h-files-diff]:rounded-xl [&_.d2h-files-diff]:border [&_.d2h-files-diff]:border-light-divider dark:[&_.d2h-files-diff]:border-dark-divider [&_.d2h-file-wrapper]:overflow-hidden [&_.d2h-file-wrapper]:rounded-xl"
          />
        : <div className="text-sm text-muted dark:text-dark-muted">
            {t("pullRequests.diff.none")}
          </div>}
      </div>
    </div>
  );
}
