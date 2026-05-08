import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import { renderAsync as renderDocxAsync } from "docx-preview";
import Button from "../Button";
import DocumentViewerLoading from "../vcShared/DocumentViewerLoading";
import {
  extractDocxHtml,
  extractDocxPlainText,
} from "../../services/documentRenderingService";
import {
  getFileExtension,
  isImageExtension,
  isLikelyTextExtension,
  tryDecodeUtf8,
} from "../../utils/binaryFileHandlers";

function isZipMagic(bytes) {
  return bytes?.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

/**
 * Renders gateway file bytes across common MIME shapes. Embed this in admin / teacher / student routes.
 *
 * DOCX files use a read-only document renderer so repository content displays directly from the fetched bytes.
 *
 * @param {{ fileBytes: Uint8Array, filePath: string, fileType: string }} props
 */
export default function OverviewMode({
  fileBytes,
  filePath,
  fileType,
  embedded = false,
}) {
  const { t } = useTranslation();

  const [plainDocxLoading, setPlainDocxLoading] = useState(false);
  const [plainDocx, setPlainDocx] = useState("");
  const [docxHtml, setDocxHtml] = useState("");

  const ext = fileType || getFileExtension(filePath);

  const blobUrl = useMemo(() => {
    if (!fileBytes?.length) return null;
    return URL.createObjectURL(new Blob([fileBytes]));
  }, [fileBytes]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    let cancelled = false;
    async function extract() {
      if ((ext === "docx" || ext === "doc") && fileBytes?.length && isZipMagic(fileBytes)) {
        setPlainDocxLoading(true);
        try {
          const [html, text] = await Promise.all([
            extractDocxHtml(fileBytes),
            extractDocxPlainText(fileBytes),
          ]);
          if (!cancelled) {
            setDocxHtml(html ?? "");
            setPlainDocx(text ?? "");
          }
        } catch {
          if (!cancelled) {
            setDocxHtml("");
            setPlainDocx("");
          }
        } finally {
          if (!cancelled) setPlainDocxLoading(false);
        }
      } else if (!cancelled) {
        setDocxHtml("");
        setPlainDocx("");
      }
    }
    extract();
    return () => {
      cancelled = true;
    };
  }, [ext, fileBytes]);

  const onDownload = () => {
    if (!fileBytes?.length) return;
    const name = String(filePath).split("/").pop() || "download.bin";
    saveAs(new Blob([fileBytes]), name);
  };

  if (!fileBytes?.length) return null;

  const textMaybe = tryDecodeUtf8(fileBytes);

  if (ext === "pdf") {
    return (
      <div
        className={embedded
          ? "overflow-hidden"
          : "overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"}
      >
        <iframe
          title={filePath}
          src={blobUrl ?? undefined}
          className={embedded ? "h-[560px] w-full" : "h-[560px] w-full rounded-2xl"}
        />
      </div>
    );
  }

  if (isImageExtension(ext)) {
    return (
      <div
        className={embedded
          ? "flex justify-center p-4"
          : "flex justify-center rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"}
      >
        {blobUrl ? (
          <img
            src={blobUrl}
            alt={filePath}
            className="max-h-[560px] w-auto max-w-full rounded-xl border border-light-divider object-contain dark:border-dark-divider"
          />
        ) : null}
      </div>
    );
  }

  if (ext === "docx" || ext === "doc") {
    return (
      <ReadonlyDocxPreview
        embedded={embedded}
        fileBytes={fileBytes}
        filePath={filePath}
        onDownload={onDownload}
        fallbackLoading={plainDocxLoading}
        fallbackHtml={docxHtml}
        fallbackText={plainDocx}
      />
    );
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    return (
      <div
        className={embedded
          ? "space-y-3 p-4"
          : "space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"}
      >
        <p className="text-sm text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
          {t("documentViewer.overview.sheetFallback")}
        </p>
        <Button type="button" variant="secondary" onClick={onDownload}>
          {t("documentViewer.overview.download")}
        </Button>
      </div>
    );
  }

  if (isLikelyTextExtension(ext) && textMaybe != null) {
    return (
      <pre
        className={embedded
          ? "max-h-[560px] overflow-auto bg-(--color-light-input-bg) p-4 text-xs text-(--color-light-text-primary) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)"
          : "max-h-[560px] overflow-auto rounded-2xl border border-(--color-light-card-border) bg-(--color-light-input-bg) p-4 text-xs text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)"}
      >
        <code>{textMaybe}</code>
      </pre>
    );
  }

  return (
    <div
      className={embedded
        ? "space-y-3 p-4"
        : "space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"}
    >
      <p className="text-sm text-muted dark:text-dark-muted">
        {t("documentViewer.overview.binaryFallback")}
      </p>
      <Button type="button" variant="secondary" onClick={onDownload}>
        {t("documentViewer.overview.download")}
      </Button>
    </div>
  );
}

function ReadonlyDocxPreview({
  embedded,
  fileBytes,
  filePath,
  onDownload,
  fallbackLoading,
  fallbackHtml,
  fallbackText,
}) {
  const { t } = useTranslation();
  const previewHostRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const host = previewHostRef.current;
      if (!host || !fileBytes?.length) return;

      setLoading(true);
      setLoadError("");
      host.innerHTML = "";

      try {
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

        if (!cancelled) {
          setLoading(false);
          if (!host.textContent?.trim() && !host.querySelector(".docx")) {
            setLoadError("Document renderer returned an empty preview.");
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(String(error?.message ?? "Failed to render document."));
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
      if (previewHostRef.current) {
        previewHostRef.current.innerHTML = "";
      }
    };
  }, [fileBytes, filePath]);

  return (
    <div
      className={embedded
        ? "space-y-3 p-0"
        : "space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)"}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-xs text-muted dark:text-dark-muted">Document preview</p>
          <p className="mt-1 text-sm font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
            {filePath}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onDownload}>
            Download docx
          </Button>
        </div>
      </div>

      {loading ? <DocumentViewerLoading /> : null}

      {!loadError ? (
        <div className="px-4 pb-4">
          <div
            ref={previewHostRef}
            className={embedded
              ? "docx-render-shell max-h-[560px] overflow-auto rounded-xl bg-white p-4 shadow-inner"
              : "docx-render-shell max-h-[720px] overflow-auto rounded-xl bg-white p-4 shadow-inner"}
          />
        </div>
      ) : fallbackLoading ? (
        <DocumentViewerLoading />
      ) : (
        <div className="px-4 pb-4">
          <p className="mb-3 text-xs text-muted dark:text-dark-muted">
            {t("documentViewer.overview.docxFallbackHint")}
          </p>
          <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">{loadError}</p>
          <div className="max-h-[520px] overflow-auto rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 dark:border-dark-divider dark:bg-(--color-dark-input-bg)">
            {fallbackHtml ? (
              <div
                className="vc-docx-preview prose prose-sm max-w-none text-(--color-light-text-primary) dark:prose-invert dark:text-(--color-dark-text-primary) [&_p]:my-0 [&_p+P]:mt-3 [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-light-divider [&_td]:px-3 [&_td]:py-2 dark:[&_td]:border-dark-divider [&_.vc-docx-empty]:opacity-40 [&_.vc-docx-strike]:line-through [&_.vc-docx-underline]:underline"
                dangerouslySetInnerHTML={{ __html: fallbackHtml }}
              />
            ) : (
              <pre className="whitespace-pre-wrap text-xs text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                {fallbackText || t("documentViewer.overview.emptyPreview")}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
