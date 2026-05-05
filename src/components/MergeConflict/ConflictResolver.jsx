import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchMergeConflicts,
  resolveMergeConflict,
} from "../../services/versionControlService";
import Button from "../Button";
import DocumentViewerLoading from "../vcShared/DocumentViewerLoading";
import ConflictMarkerViewer from "./ConflictMarkerViewer";
import ResolutionStrategy from "./ResolutionStrategy";

function buildMergedDraft(strategy, conflict, textarea) {
  const source = String(conflict?.sourceContent ?? conflict?.ours ?? "");
  const target = String(conflict?.targetContent ?? conflict?.theirs ?? "");
  if (strategy === "both") return [source, target].filter(Boolean).join("\n");
  return String(textarea ?? "");
}

/**
 * @param {{ owner: string, repo: string, prNumber: number|string, onResolved?: () => void }} props
 */
export default function ConflictResolver({ owner, repo, prNumber, onResolved }) {
  const { t } = useTranslation();

  const [conflicts, setConflicts] = useState([]);
  const [strategy, setStrategy] = useState(
    /** @type {"source" | "target" | "both" | "custom"} */ ("source"),
  );
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMergeConflicts(owner, repo, prNumber);
      const list = Array.isArray(data) ? data : [];
      setConflicts(list);
    } catch (e) {
      setConflicts([]);
      setError(String(e?.message ?? t("mergeConflict.loadFailed")));
    } finally {
      setLoading(false);
    }
  }, [owner, repo, prNumber, t]);

  useEffect(() => {
    reload();
  }, [reload]);

  const current = conflicts[0] ?? null;

  useEffect(() => {
    if (!current) {
      setDraft("");
      return;
    }
    if (strategy === "target")
      setDraft(String(current.targetContent ?? current.theirs ?? ""));
    else if (strategy === "source")
      setDraft(String(current.sourceContent ?? current.ours ?? ""));
    else if (strategy === "both") {
      const head = String(current.sourceContent ?? current.ours ?? "");
      const tail = String(current.targetContent ?? current.theirs ?? "");
      setDraft([head, tail].filter(Boolean).join("\n"));
    } else setDraft(String(current.sourceContent ?? current.ours ?? ""));
  }, [strategy, current]);

  async function emitResolution(skip) {
    if (!current) return;
    let resolution = "";
    /** @type {string|undefined} */
    let customContent;

    if (skip) resolution = "SKIP";
    else if (strategy === "source") resolution = "SOURCE";
    else if (strategy === "target") resolution = "TARGET";
    else {
      resolution = "CUSTOM";
      customContent = buildMergedDraft(strategy, current, draft);
    }

    setBusy(true);
    setError(null);
    try {
      await resolveMergeConflict(owner, repo, prNumber, {
        filePath: current.filePath ?? current.filename ?? current.path ?? "",
        resolution,
        ...(resolution === "CUSTOM" ?
          {
            customContent,
          }
        : {}),
      });

      const data = await fetchMergeConflicts(owner, repo, prNumber);
      const list = Array.isArray(data) ? data : [];
      setConflicts(list);

      if (!list.length && typeof onResolved === "function") onResolved();
    } catch (e) {
      setError(String(e?.message ?? t("mergeConflict.resolveFailed")));
    } finally {
      setBusy(false);
    }
  }

  if (!owner || !repo || prNumber === "" || prNumber == null) {
    return (
      <div className="rounded-2xl border border-light-divider bg-(--color-light-card-bg) p-6 text-sm text-muted dark:border-dark-divider dark:bg-(--color-dark-card-bg) dark:text-dark-muted">
        {t("mergeConflict.invalid")}
      </div>
    );
  }

  if (loading) return <DocumentViewerLoading />;

  if (!conflicts.length) {
    if (error) {
      return (
        <div className="space-y-3 rounded-2xl border border-(--color-light-error-border) bg-(--color-light-error-bg) p-4 text-sm text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
          <p>{error}</p>
          <Button type="button" variant="secondary" onClick={() => reload()}>
            {t("mergeConflict.reload")}
          </Button>
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-8 text-center text-sm font-semibold text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-(--color-dark-text-primary)">
        {t("mergeConflict.allClear")}
      </div>
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-5 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("mergeConflict.title")}
        </h3>
        <p className="text-xs text-muted dark:text-dark-muted">
          {t("mergeConflict.progress", {
            current: 1,
            total: conflicts.length,
          })}
        </p>
        <p className="text-[11px] font-semibold text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
          {current?.filePath || current?.filename || t("mergeConflict.naFile")}
        </p>
      </header>

      {error ?
        <p className="rounded-xl border border-(--color-light-error-border) bg-(--color-light-error-bg) px-4 py-2 text-xs text-(--color-light-error-text) dark:border-(--color-dark-error-border) dark:bg-(--color-dark-error-bg) dark:text-(--color-dark-error-text)">
          {error}
        </p>
      : null}

      {current ?
        <>
          <ConflictMarkerViewer conflict={current} />

          <section className="space-y-3 rounded-2xl border border-light-divider bg-(--color-light-input-bg)/40 p-4 dark:border-dark-divider dark:bg-(--color-dark-input-bg)/20">
            <h4 className="text-[11px] font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              {t("mergeConflict.strategyLabel")}
            </h4>
            <ResolutionStrategy value={strategy} onChange={setStrategy} />
          </section>

          {strategy === "custom" || strategy === "both" ?
            <label className="flex flex-col gap-2 text-[11px] font-semibold text-primary dark:text-dark-primary">
              {t("mergeConflict.editorLabel")}
              <textarea
                rows={12}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                spellCheck={false}
                className="w-full resize-y rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-2 text-xs text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
                placeholder={t("mergeConflict.editorPlaceholder")}
              />
            </label>
          : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              disabled={busy}
              onClick={() => emitResolution(false)}
            >
              {t("mergeConflict.resolve")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => emitResolution(true)}
            >
              {t("mergeConflict.skip")}
            </Button>
          </div>
        </>
      : null}
    </div>
  );
}
