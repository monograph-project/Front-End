import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { renderAsync as renderDocxAsync } from "docx-preview";
import DocumentViewerLoading from "../vcShared/DocumentViewerLoading";
import OverviewMode from "./OverviewMode";
import {
  getFileExtension,
  tryDecodeUtf8,
} from "../../utils/binaryFileHandlers";

function hashHue(input) {
  let hash = 0;
  const s = String(input ?? "");
  for (let i = 0; i < s.length; i++)
    hash = (hash << 5) - hash + s.charCodeAt(i);
  return Math.abs(hash) % 360;
}

function isZipMagic(bytes) {
  return bytes?.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

function lineIndexFrom(row) {
  const n = Number(
    row.lineNumber ?? row.line ?? row.line_no ?? row.lineNo ?? row.lineIdx,
  );
  if (!Number.isFinite(n)) return -1;
  return Math.max(0, n - 1);
}

function commitId(row) {
  return row?.commit ?? row?.commitSha ?? row?.sha ?? row?.revision ?? "";
}

function buildDocumentCommitGroups(rows) {
  const items = Array.isArray(rows) ? rows : [];
  const groups = [];
  let current = null;
  let lineNumber = 1;

  items.forEach((row, index) => {
    const commit = commitId(row);
    const author = row?.author ?? row?.userName ?? "";
    const message = row?.message ?? row?.commitMessage ?? row?.subject ?? "";
    const timestamp = row?.timestamp ?? row?.date ?? "";
    const kind = row?.kind ?? "segment";
    const text = typeof row?.text === "string" ? row.text : "";
    const lines = text.split(/\r?\n/);
    if (!lines.length) lines.push("");

    const shouldStart =
      !current ||
      current.commit !== commit ||
      current.author !== author ||
      current.message !== message ||
      current.timestamp !== timestamp;

    if (shouldStart) {
      current = {
        key: `${commit || "document"}-${index}-${lineNumber}`,
        commit,
        author,
        message,
        timestamp,
        kind,
        page: row?.page ?? null,
        lines: [],
      };
      groups.push(current);
    }

    lines.forEach((line) => {
      current.lines.push({
        lineNumber,
        code: line || "\u00a0",
      });
      lineNumber += 1;
    });
  });

  return groups;
}

function normalizeDocText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function shortCommit(row) {
  return String(commitId(row) ?? "").slice(0, 8);
}

function DocumentSegmentBlameList({
  groups,
  selectedCommit,
  onSelectCommit,
  hoveredSegmentId,
  onHoverSegment,
  formatTs,
  t,
}) {
  return (
    <div className="overflow-x-auto">
      {groups.map((row, index) => {
        const commit = row.commit;
        const selected = selectedCommit && commit === selectedCommit;
        const hovered = hoveredSegmentId === row.key;
        const hue = hashHue(commit || row.key || index);
        return (
          <div
            key={row.key || `${commit}-${index}`}
            className="grid border-b border-light-divider md:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] dark:border-dark-divider"
            onMouseEnter={() => onHoverSegment(row.key || `${index}`)}
            onMouseLeave={() => onHoverSegment(null)}
          >
            <div
              className={`border-r border-light-divider px-3 py-3 dark:border-dark-divider ${
                selected
                  ? "ring-2 ring-inset ring-(--color-light-input-border-focus) dark:ring-(--color-dark-input-border-focus)"
                  : ""
              }`}
              style={{
                backgroundColor: hovered
                  ? `hsla(${hue}, 72%, 75%, .35)`
                  : `hsla(${hue}, 70%, 70%, .18)`,
              }}
              onClick={() => onSelectCommit(commit || null)}
            >
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted dark:text-dark-muted">
                <span className="rounded-full border border-light-divider px-2 py-0.5 font-mono dark:border-dark-divider">
                  {(row.shortSha || commit || "").slice(0, 8)}
                </span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/12 dark:text-amber-300">
                  {row.kind || "segment"}
                </span>
              </div>
              <div className="mt-2 font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {row.author || t("documentViewer.na")}
              </div>
              <div className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                {formatTs(row.timestamp)}
              </div>
              <div className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                {row.message || t("documentViewer.na")}
              </div>
            </div>

            <div className="px-4 py-3">
              <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted dark:text-dark-muted">
                {row.kind || "segment"}
                {row.page != null ? ` • Page ${row.page}` : ""}
              </div>
              <div className="overflow-hidden rounded-xl border border-light-divider dark:border-dark-divider">
                {row.lines.map((line) => (
                  <div
                    key={`${row.key}-${line.lineNumber}`}
                    className="grid grid-cols-[48px_minmax(0,1fr)] border-b border-light-divider font-mono text-[11px] leading-6 last:border-b-0 dark:border-dark-divider"
                  >
                    <div className="select-none px-2.5 text-right text-muted dark:text-dark-muted">
                      {line.lineNumber}
                    </div>
                    <pre className="m-0 overflow-x-auto px-3 py-0 text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                      <code>{line.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sameCommitMeta(a, b) {
  if (!a || !b) return false;
  return (
    commitId(a) === commitId(b) &&
    String(a?.author ?? a?.userName ?? "") ===
      String(b?.author ?? b?.userName ?? "") &&
    String(a?.message ?? a?.commitMessage ?? a?.subject ?? "") ===
      String(b?.message ?? b?.commitMessage ?? b?.subject ?? "") &&
    String(a?.timestamp ?? a?.date ?? "") ===
      String(b?.timestamp ?? b?.date ?? "")
  );
}

/**
 * @param {{
 *   blameData: any[],
 *   fileBytes: Uint8Array,
 *   filePath?: string,
 *   fallbackMeta?: {
 *     commitSha?: string,
 *     author?: string,
 *     message?: string,
 *     timestamp?: string,
 *   } | null
 * }} props
 */
export default function BlameMode({
  blameData,
  fileBytes,
  filePath = "",
  fallbackMeta = null,
}) {
  const { t } = useTranslation();
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [hoveredSegmentId, setHoveredSegmentId] = useState(null);
  const [docRenderLoading, setDocRenderLoading] = useState(false);
  const [docRenderError, setDocRenderError] = useState("");
  const previewHostRef = useRef(null);

  const decoded = tryDecodeUtf8(fileBytes ?? new Uint8Array());
  const text = decoded ?? "";
  const lines = decoded != null ? text.split("\n") : [];
  const ext = getFileExtension(filePath);
  const isDocumentSegmentMode = Array.isArray(blameData)
    && blameData.some(
      (row) =>
        row
        && typeof row === "object"
        && row.orderIndex != null
        && typeof row.text === "string"
        && row.lineNumber == null,
    );

  const blameByLine = useMemo(() => {
    const acc = {};
    const arr = Array.isArray(blameData) ? blameData : [];
    arr.forEach((row) => {
      const idx = lineIndexFrom(row);
      if (idx >= 0) acc[idx] = row;
    });
    return acc;
  }, [blameData]);

  const blameRows = Array.isArray(blameData) ? blameData : [];
  const resolvedMeta =
    blameRows.find((row) => commitId(row) === selectedCommit) ?? null;

  const formatTs = (ts) => {
    if (!ts) return t("documentViewer.na");
    const d =
      typeof ts === "number" ?
        new Date(ts)
      : new Date(String(ts));
    if (Number.isNaN(d.getTime()))
      return t("documentViewer.na");
    try {
      return format(d, "PPp");
    } catch {
      return d.toISOString();
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function renderDocxBlame() {
      if (!isDocumentSegmentMode || ext !== "docx" || !fileBytes?.length) {
        setDocRenderError("");
        setDocRenderLoading(false);
        return;
      }

      const host = previewHostRef.current;
      if (!host) return;

      setDocRenderLoading(true);
      setDocRenderError("");
      host.innerHTML = "";

      try {
        if (!isZipMagic(fileBytes)) {
          throw new Error("The stored DOCX bytes are incomplete or invalid.");
        }

        const blob = new Blob([fileBytes], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        await renderDocxAsync(blob, host, undefined, {
          className: "docx-preview-host",
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          experimental: true,
          inWrapper: true,
          useBase64URL: true,
          renderChanges: false,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          renderComments: true,
        });

        if (cancelled) return;

        const blocks = Array.from(
          host.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, tr"),
        );
        let searchFrom = 0;
        const rows = Array.isArray(blameData) ? blameData : [];

        rows.forEach((row, index) => {
          const targetText = normalizeDocText(row?.text);
          if (!targetText) return;

          let matched = null;
          for (let i = searchFrom; i < blocks.length; i += 1) {
            const block = blocks[i];
            const blockText = normalizeDocText(block.textContent);
            if (!blockText) continue;
            if (
              blockText === targetText ||
              blockText.includes(targetText) ||
              targetText.includes(blockText)
            ) {
              matched = block;
              searchFrom = i + 1;
              break;
            }
          }

          if (!matched) return;

          const anchor =
            matched.tagName.toLowerCase() === "tr"
              ? matched.querySelector("td, th") || matched
              : matched;

          anchor.style.position = "relative";
          anchor.style.paddingInlineStart = "14rem";
          anchor.style.minHeight = "2rem";
          anchor.style.scrollMarginTop = "1rem";
          anchor.setAttribute("data-blame-id", row?.id || `doc-row-${index}`);
          anchor.setAttribute("data-blame-commit", commitId(row));

          const isGroupStart = !sameCommitMeta(rows[index - 1], row);
          const isGroupEnd = !sameCommitMeta(row, rows[index + 1]);
          const activeCommit = commitId(row);
          const selected = selectedCommit && activeCommit === selectedCommit;

          anchor.style.borderInlineStart = isGroupStart
            ? "2px solid rgba(148,163,184,.45)"
            : "2px solid transparent";
          anchor.style.background = selected
            ? "rgba(241,245,249,.88)"
            : "transparent";
          anchor.style.paddingBlock = isGroupStart ? "0.4rem" : "0.18rem";
          if (isGroupEnd) {
            anchor.style.marginBottom = "0.25rem";
          }

          if (!isGroupStart) {
            const connector = document.createElement("div");
            connector.setAttribute("aria-hidden", "true");
            connector.style.position = "absolute";
            connector.style.left = "0.95rem";
            connector.style.top = "0";
            connector.style.bottom = "0";
            connector.style.width = "11.75rem";
            connector.style.borderLeft = "1px solid rgba(148,163,184,.35)";
            connector.style.pointerEvents = "none";
            anchor.prepend(connector);
            return;
          }

          const panel = document.createElement("button");
          panel.type = "button";
          panel.title = `${row?.author || ""} ${row?.message ? "• " + row.message : ""}`.trim();
          panel.style.position = "absolute";
          panel.style.left = "0.75rem";
          panel.style.top = "0.2rem";
          panel.style.zIndex = "3";
          panel.style.width = "12rem";
          panel.style.maxWidth = "12rem";
          panel.style.textAlign = "left";
          panel.style.border = selected
            ? "1px solid rgba(14,116,144,.55)"
            : "1px solid rgba(148,163,184,.35)";
          panel.style.borderRadius = "10px";
          panel.style.padding = "0.45rem 0.55rem";
          panel.style.background = selected
            ? "rgba(240,249,255,.98)"
            : "rgba(248,250,252,.96)";
          panel.style.boxShadow = "0 1px 2px rgba(15,23,42,.06)";
          panel.style.cursor = "pointer";
          panel.style.overflow = "hidden";

          const metaRow = document.createElement("div");
          metaRow.style.display = "flex";
          metaRow.style.alignItems = "center";
          metaRow.style.justifyContent = "space-between";
          metaRow.style.gap = "0.35rem";
          metaRow.style.marginBottom = "0.28rem";

          const shaPill = document.createElement("span");
          shaPill.textContent = shortCommit(row) || "—";
          shaPill.style.display = "inline-flex";
          shaPill.style.alignItems = "center";
          shaPill.style.border = "1px solid rgba(148,163,184,.45)";
          shaPill.style.borderRadius = "999px";
          shaPill.style.padding = "0.15rem 0.45rem";
          shaPill.style.fontSize = "10px";
          shaPill.style.lineHeight = "1.2";
          shaPill.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, monospace";
          shaPill.style.background = "rgba(255,251,235,.96)";
          shaPill.style.color = "rgb(146,64,14)";

          const timeText = document.createElement("span");
          timeText.textContent = formatTs(row?.timestamp);
          timeText.style.fontSize = "10px";
          timeText.style.lineHeight = "1.2";
          timeText.style.color = "rgb(100,116,139)";
          timeText.style.maxWidth = "5rem";
          timeText.style.whiteSpace = "nowrap";
          timeText.style.overflow = "hidden";
          timeText.style.textOverflow = "ellipsis";

          metaRow.appendChild(shaPill);
          metaRow.appendChild(timeText);

          const authorText = document.createElement("div");
          authorText.textContent = row?.author || t("documentViewer.na");
          authorText.style.fontSize = "11px";
          authorText.style.lineHeight = "1.25";
          authorText.style.fontWeight = "600";
          authorText.style.color = "rgb(15,23,42)";
          authorText.style.marginBottom = "0.2rem";
          authorText.style.whiteSpace = "nowrap";
          authorText.style.overflow = "hidden";
          authorText.style.textOverflow = "ellipsis";

          const messageText = document.createElement("div");
          messageText.textContent =
            row?.message || row?.commitMessage || row?.subject || t("documentViewer.na");
          messageText.style.fontSize = "10px";
          messageText.style.lineHeight = "1.25";
          messageText.style.color = "rgb(71,85,105)";
          messageText.style.display = "-webkit-box";
          messageText.style.webkitLineClamp = "2";
          messageText.style.webkitBoxOrient = "vertical";
          messageText.style.overflow = "hidden";

          panel.appendChild(metaRow);
          panel.appendChild(authorText);
          panel.appendChild(messageText);

          if (isGroupEnd) {
            const tail = document.createElement("div");
            tail.setAttribute("aria-hidden", "true");
            tail.style.position = "absolute";
            tail.style.left = "0.95rem";
            tail.style.top = "calc(100% + 0.1rem)";
            tail.style.height = "0.45rem";
            tail.style.borderLeft = "1px solid rgba(148,163,184,.35)";
            panel.appendChild(tail);
          }

          panel.addEventListener("mouseenter", () => {
            setHoveredSegmentId(row?.id || `doc-row-${index}`);
          });
          panel.addEventListener("mouseleave", () => {
            setHoveredSegmentId(null);
          });
          panel.addEventListener("click", () => {
            setSelectedCommit(commitId(row) || null);
          });

          anchor.prepend(panel);
        });

        setDocRenderLoading(false);
      } catch (error) {
        if (!cancelled) {
          setDocRenderError(
            String(
              error?.message ??
                "The DOCX layout preview could not be rendered.",
            ),
          );
          setDocRenderLoading(false);
        }
      }
    }

    renderDocxBlame();
    return () => {
      cancelled = true;
      if (previewHostRef.current) {
        previewHostRef.current.innerHTML = "";
      }
    };
  }, [blameData, ext, fileBytes, isDocumentSegmentMode]);

  if (isDocumentSegmentMode) {
    const rows = Array.isArray(blameData) ? blameData : [];
    if (ext === "docx") {
      const groups = buildDocumentCommitGroups(rows);
      return (
        <div className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <header className="border-b border-light-divider px-5 py-4 dark:border-dark-divider">
            <h3 className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              Document blame
            </h3>
            <p className="mt-1 text-xs text-muted dark:text-dark-muted">
              The original document layout is preserved and ownership is grouped beside matching document blocks like a blame gutter.
            </p>
          </header>

          {docRenderLoading ? <DocumentViewerLoading /> : null}
          {docRenderError ? (
            <div className="mx-4 my-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
              The original DOCX layout preview could not be rendered
              {docRenderError ? `: ${docRenderError}` : "."} Showing extracted
              document ownership instead.
            </div>
          ) : null}

          {!docRenderError ? (
            <div className="px-4 pb-4">
              <div
                ref={previewHostRef}
                className="docx-render-shell vc-docx-blame-shell max-h-[720px] overflow-auto rounded-none bg-white p-4"
              />
            </div>
          ) : (
            <DocumentSegmentBlameList
              groups={groups}
              selectedCommit={selectedCommit}
              onSelectCommit={setSelectedCommit}
              hoveredSegmentId={hoveredSegmentId}
              onHoverSegment={setHoveredSegmentId}
              formatTs={formatTs}
              t={t}
            />
          )}

          {selectedCommit && resolvedMeta ? (
            <footer className="border-t border-light-divider bg-(--color-light-input-bg) px-5 py-4 text-xs dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
              <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {t("documentViewer.blame.detailsTitle")}
              </h4>
              <dl className="mt-2 space-y-1 text-muted dark:text-dark-muted">
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.sha")}
                  </dt>
                  <dd className="font-mono text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {selectedCommit}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.author")}
                  </dt>
                  <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {resolvedMeta.author || resolvedMeta.userName || t("documentViewer.na")}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.date")}
                  </dt>
                  <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {formatTs(resolvedMeta.timestamp ?? resolvedMeta.date)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.message")}
                  </dt>
                  <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {resolvedMeta.commitMessage ||
                      resolvedMeta.message ||
                      resolvedMeta.subject ||
                      t("documentViewer.na")}
                  </dd>
                </div>
              </dl>
            </footer>
          ) : null}
        </div>
      );
    }

    const groups = buildDocumentCommitGroups(rows);
    return (
      <div className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <header className="border-b border-light-divider px-5 py-4 dark:border-dark-divider">
          <h3 className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
            Document blame
          </h3>
          <p className="mt-1 text-xs text-muted dark:text-dark-muted">
            Ownership is tracked per extracted document segment instead of raw text lines.
          </p>
        </header>

        <div className="overflow-x-auto">
          {groups.map((row, index) => {
            const commit = row.commit;
            const selected = selectedCommit && commit === selectedCommit;
            const hovered = hoveredSegmentId === row.key;
            const hue = hashHue(commit || row.key || index);
            return (
              <div
                key={row.key || `${commit}-${index}`}
                className="grid border-b border-light-divider md:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] dark:border-dark-divider"
                onMouseEnter={() => setHoveredSegmentId(row.key || `${index}`)}
                onMouseLeave={() => setHoveredSegmentId(null)}
              >
                <div
                  className={`border-r border-light-divider px-3 py-3 dark:border-dark-divider ${selected ? "ring-2 ring-inset ring-(--color-light-input-border-focus) dark:ring-(--color-dark-input-border-focus)" : ""}`}
                  style={{
                    backgroundColor: hovered
                      ? `hsla(${hue}, 72%, 75%, .35)`
                      : `hsla(${hue}, 70%, 70%, .18)`,
                  }}
                  onClick={() => setSelectedCommit(commit || null)}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted dark:text-dark-muted">
                    <span className="rounded-full border border-light-divider px-2 py-0.5 font-mono dark:border-dark-divider">
                      {(row.shortSha || commit || "").slice(0, 8)}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/12 dark:text-amber-300">
                      {row.kind || "segment"}
                    </span>
                  </div>
                  <div className="mt-2 font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {row.author || t("documentViewer.na")}
                  </div>
                  <div className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                    {formatTs(row.timestamp)}
                  </div>
                  <div className="mt-1 text-[11px] text-muted dark:text-dark-muted">
                    {row.message || t("documentViewer.na")}
                  </div>
                </div>

                <div className="px-4 py-3">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.14em] text-muted dark:text-dark-muted">
                    {row.kind || "segment"}
                    {row.page != null ? ` • Page ${row.page}` : ""}
                  </div>
                  <div className="overflow-hidden rounded-xl border border-light-divider dark:border-dark-divider">
                    {row.lines.map((line) => (
                      <div
                        key={`${row.key}-${line.lineNumber}`}
                        className="grid grid-cols-[48px_minmax(0,1fr)] border-b border-light-divider font-mono text-[11px] leading-6 last:border-b-0 dark:border-dark-divider"
                      >
                        <div className="select-none px-2.5 text-right text-muted dark:text-dark-muted">
                          {line.lineNumber}
                        </div>
                        <pre className="m-0 overflow-x-auto px-3 py-0 text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                          <code>{line.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (decoded == null) {
    if (ext === "docx" || ext === "pdf") {
      return (
        <div className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
          <header className="border-b border-light-divider px-5 py-4 dark:border-dark-divider">
            <h3 className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              Document blame
            </h3>
            <p className="mt-1 text-xs text-muted dark:text-dark-muted">
              Document blame metadata is unavailable for this revision, so the original document preview is shown instead.
            </p>
          </header>
          {fallbackMeta ? (
            <div className="border-b border-light-divider bg-(--color-light-input-bg) px-5 py-4 text-xs dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
              <div className="grid gap-3 md:grid-cols-4">
                <div>
                  <p className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.sha")}
                  </p>
                  <p className="mt-1 font-mono text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {fallbackMeta.commitSha || t("documentViewer.na")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.author")}
                  </p>
                  <p className="mt-1 text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {fallbackMeta.author || t("documentViewer.na")}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.date")}
                  </p>
                  <p className="mt-1 text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {formatTs(fallbackMeta.timestamp)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                    {t("documentViewer.blame.message")}
                  </p>
                  <p className="mt-1 text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                    {fallbackMeta.message || t("documentViewer.na")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          <OverviewMode
            fileBytes={fileBytes}
            filePath={filePath}
            fileType={ext}
            embedded
          />
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-light-divider bg-(--color-light-card-bg) p-6 text-sm text-muted dark:border-dark-divider dark:bg-(--color-dark-card-bg) dark:text-dark-muted">
        {t("documentViewer.blame.binary")}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <header className="border-b border-light-divider px-5 py-4 dark:border-dark-divider">
        <h3 className="text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("documentViewer.blame.title")}
        </h3>
        <p className="mt-1 text-xs text-muted dark:text-dark-muted">
          {t("documentViewer.blame.hint")}
        </p>
      </header>

      <div className="flex max-h-[560px] overflow-auto border-light-divider dark:border-dark-divider">
        <div className="sticky left-0 z-[1] min-w-[148px] border-r border-light-divider bg-(--color-light-input-bg) dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
          {lines.map((_, index) => {
            const blame = blameByLine[index];
            const commit = commitId(blame);
            const hovered = hoveredLineIndex === index;
            const hue = blame ? hashHue(commit) : 210;
            return (
              <div
                key={`a-${index}`}
                role="presentation"
                className={`cursor-pointer border-b border-light-divider px-3 py-1 text-[11px] transition-colors hover:opacity-90 dark:border-dark-divider ${selectedCommit && commit === selectedCommit ? "ring-2 ring-inset ring-(--color-light-input-border-focus) dark:ring-(--color-dark-input-border-focus)" : ""}`}
                style={{
                  minHeight: 28,
                  backgroundColor:
                    hovered ?
                      `hsla(${hue}, 72%, 75%, .35)`
                    : blame ?
                      `hsla(${hue}, 70%, 70%, .55)`
                    : "transparent",
                }}
                onMouseEnter={() => setHoveredLineIndex(index)}
                onMouseLeave={() => setHoveredLineIndex(null)}
                onClick={() =>
                  blame ? setSelectedCommit(commit || null) : undefined
                }
                title={
                  blame ?
                    `${String(blame.author ?? blame.userName ?? t("documentViewer.na"))} · ${formatTs(blame.timestamp ?? blame.date ?? blame.time ?? blame.committedDate)} · ${commit?.slice?.(0, 7) ?? ""}`
                  : undefined
                }
              >
                {blame ?
                  <>
                    <div className="font-semibold truncate text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                      {blame.author || blame.userName || t("documentViewer.na")}
                    </div>
                    <div className="truncate font-mono text-[10px] text-muted dark:text-dark-muted">
                      {(commit ?? "").slice(0, 7)}
                    </div>
                  </>
                : null}
              </div>
            );
          })}
        </div>

        <div className="min-w-[56px] border-r border-light-divider bg-(--color-light-input-bg) text-right dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
          {lines.map((_, index) => (
            <div
              key={`n-${index}`}
              role="presentation"
              className="border-b border-light-divider px-2 py-1 font-mono text-[11px] text-muted tabular-nums dark:border-dark-divider dark:text-dark-muted"
              style={{ minHeight: 28 }}
              onMouseEnter={() => setHoveredLineIndex(index)}
              onMouseLeave={() => setHoveredLineIndex(null)}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {lines.map((line, index) => {
            const hovered = hoveredLineIndex === index;
            return (
              <div
                key={`c-${index}`}
                role="presentation"
                className={`border-b border-light-divider px-4 py-1 dark:border-dark-divider ${hovered ? "bg-(--color-light-input-bg) dark:bg-(--color-dark-input-bg)" : ""}`}
                style={{ minHeight: 28 }}
                onMouseEnter={() => setHoveredLineIndex(index)}
                onMouseLeave={() => setHoveredLineIndex(null)}
              >
                <pre className="m-0 whitespace-pre-wrap break-all font-mono text-[11px] text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  <code>{line || "\u00a0"}</code>
                </pre>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCommit && resolvedMeta ?
        <footer className="border-t border-light-divider bg-(--color-light-input-bg) px-5 py-4 text-xs dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
          <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
            {t("documentViewer.blame.detailsTitle")}
          </h4>
          <dl className="mt-2 space-y-1 text-muted dark:text-dark-muted">
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                {t("documentViewer.blame.sha")}
              </dt>
              <dd className="font-mono text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {selectedCommit}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                {t("documentViewer.blame.author")}
              </dt>
              <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {resolvedMeta.author || resolvedMeta.userName || t("documentViewer.na")}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                {t("documentViewer.blame.date")}
              </dt>
              <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {formatTs(resolvedMeta.timestamp ?? resolvedMeta.date)}
              </dd>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <dt className="font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                {t("documentViewer.blame.message")}
              </dt>
              <dd className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {resolvedMeta.commitMessage ||
                  resolvedMeta.message ||
                  resolvedMeta.subject ||
                  t("documentViewer.na")}
              </dd>
            </div>
          </dl>
        </footer>
      : null}
    </div>
  );
}
