import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  tryDecodeUtf8,
} from "../../utils/binaryFileHandlers";

function hashHue(input) {
  let hash = 0;
  const s = String(input ?? "");
  for (let i = 0; i < s.length; i++)
    hash = (hash << 5) - hash + s.charCodeAt(i);
  return Math.abs(hash) % 360;
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

/**
 * @param {{ blameData: any[], fileBytes: Uint8Array }} props
 */
export default function BlameMode({ blameData, fileBytes }) {
  const { t } = useTranslation();
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [selectedCommit, setSelectedCommit] = useState(null);

  const decoded = tryDecodeUtf8(fileBytes ?? new Uint8Array());
  const text = decoded ?? "";
  const lines = decoded != null ? text.split("\n") : [];

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

  if (decoded == null) {
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
