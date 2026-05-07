import React from "react";
import { useTranslation } from "react-i18next";
import Button from "../Button";

function blockChoiceFor(segment, blockChoices) {
  return (
    blockChoices?.[segment.id] ?? {
      resolution: "SOURCE",
      customContent: String(segment?.sourceChunk ?? ""),
    }
  );
}

function resolvedPreview(segment, choice) {
  const resolution = String(choice?.resolution ?? "SOURCE").toUpperCase();
  if (resolution === "TARGET") return String(segment?.targetChunk ?? "");
  if (resolution === "BOTH") {
    return [segment?.targetChunk, segment?.sourceChunk].filter(Boolean).join("\n");
  }
  if (resolution === "CUSTOM") return String(choice?.customContent ?? "");
  return String(segment?.sourceChunk ?? "");
}

export default function ConflictMarkerViewer({
  conflict,
  blockChoices,
  onPickResolution,
  onEditCustom,
}) {
  const { t } = useTranslation();
  const segments = Array.isArray(conflict?.segments) ? conflict.segments : [];

  return (
    <div className="space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      {segments.map((segment, index) => {
        if (String(segment?.type ?? "").toUpperCase() === "PLAIN") {
          return (
            <pre
              key={segment?.id ?? `plain-${index}`}
              className="overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 font-mono text-[11px] text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)"
            >
              {segment?.content || " "}
            </pre>
          );
        }

        const choice = blockChoiceFor(segment, blockChoices);
        const preview = resolvedPreview(segment, choice);
        const resolution = String(choice?.resolution ?? "SOURCE").toUpperCase();

        return (
          <article
            key={segment?.id ?? `conflict-${index}`}
            className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                  Conflict block {index + 1}
                </span>
                <span className="text-muted dark:text-dark-muted">
                  source {segment?.sourceStartLine ?? "—"}-{segment?.sourceEndLine ?? "—"}
                </span>
                <span className="text-muted dark:text-dark-muted">
                  target {segment?.targetStartLine ?? "—"}-{segment?.targetEndLine ?? "—"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {t("mergeConflict.source")}
                </h4>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 font-mono text-[11px] text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
                  {segment?.sourceChunk || t("mergeConflict.empty")}
                </pre>
              </div>
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {t("mergeConflict.target")}
                </h4>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 font-mono text-[11px] text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
                  {segment?.targetChunk || t("mergeConflict.empty")}
                </pre>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["SOURCE", t("mergeConflict.strategy.source")],
                ["TARGET", t("mergeConflict.strategy.target")],
                ["BOTH", t("mergeConflict.strategy.both")],
                ["CUSTOM", t("mergeConflict.strategy.custom")],
              ].map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={resolution === value ? "primary" : "secondary"}
                  onClick={() => onPickResolution?.(segment, value)}
                >
                  {label}
                </Button>
              ))}
            </div>

            {resolution === "CUSTOM" ? (
              <textarea
                rows={10}
                value={String(choice?.customContent ?? "")}
                onChange={(event) =>
                  onEditCustom?.(segment, event.target.value)
                }
                spellCheck={false}
                className="w-full resize-y rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-2 font-mono text-xs text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
              />
            ) : null}

            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                Resolved preview
              </h4>
              <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-mono text-[11px] text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                {preview || " "}
              </pre>
            </div>
          </article>
        );
      })}
    </div>
  );
}
