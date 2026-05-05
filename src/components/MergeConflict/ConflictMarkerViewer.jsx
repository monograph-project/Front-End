import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { detectConflictBlocks } from "../../services/diffService";

/** Three-column snapshot for merge inspection (admin dashboards, educator tooling, coursework reviews). */
export default function ConflictMarkerViewer({ conflict }) {
  const { t } = useTranslation();
  const source = String(conflict?.sourceContent ?? conflict?.ours ?? "");
  const target = String(conflict?.targetContent ?? conflict?.theirs ?? "");

  const markerCount = useMemo(
    () => detectConflictBlocks(source).length,
    [source],
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <article className="space-y-2 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("mergeConflict.source")}
        </h4>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 font-mono text-[11px] text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
          {source || t("mergeConflict.empty")}
        </pre>
      </article>
      <article className="space-y-2 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("mergeConflict.target")}
        </h4>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 font-mono text-[11px] text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
          {target || t("mergeConflict.empty")}
        </pre>
      </article>

      {markerCount > 0 ?
        <p className="md:col-span-2 rounded-2xl border border-dashed border-light-divider bg-(--color-light-input-bg)/40 px-4 py-2 text-[11px] text-muted dark:border-dark-divider dark:bg-(--color-dark-input-bg)/30 dark:text-dark-muted">
          {t("mergeConflict.markerSummary", { count: markerCount })}
        </p>
      : null}
    </div>
  );
}
