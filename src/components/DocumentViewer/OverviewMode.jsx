import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import Button from "../Button";
import DocumentViewerLoading from "../vcShared/DocumentViewerLoading";
import { extractDocxPlainText } from "../../services/documentRenderingService";
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
 * Heavy Syncfusion controls (hosted Word / Sheet / annotated PDF APIs) attach cleanly once
 * `VITE_SYNCFUSION_DOC_EDITOR_SERVICE_URL`, `VITE_SYNCFUSION_SPREADSHEET_SERVICE_URL`, or
 * `VITE_SYNCFUSION_PDF_SERVICE_URL` point at your Gateway web services matching Syncfusion demos.
 *
 * Until then we prefer lossless previews: browser PDF iframe, DOCX plaintext extraction, and downloads via `file-saver`.
 *
 * @param {{ fileBytes: Uint8Array, filePath: string, fileType: string }} props
 */
export default function OverviewMode({ fileBytes, filePath, fileType }) {
  const { t } = useTranslation();

  const [plainDocxLoading, setPlainDocxLoading] = useState(false);
  const [plainDocx, setPlainDocx] = useState("");

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
          const text = await extractDocxPlainText(fileBytes);
          if (!cancelled) setPlainDocx(text ?? "");
        } catch {
          if (!cancelled) setPlainDocx("");
        } finally {
          if (!cancelled) setPlainDocxLoading(false);
        }
      } else if (!cancelled) {
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
      <div className="overflow-hidden rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <iframe
          title={filePath}
          src={blobUrl ?? undefined}
          className="h-[560px] w-full rounded-2xl"
        />
      </div>
    );
  }

  if (isImageExtension(ext)) {
    return (
      <div className="flex justify-center rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
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
      <div className="space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <p className="text-xs text-muted dark:text-dark-muted">
          {t("documentViewer.overview.docxFallbackHint")}
        </p>
        {plainDocxLoading ? (
          <DocumentViewerLoading />
        ) : (
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl border border-light-divider bg-(--color-light-input-bg) p-3 text-xs text-(--color-light-text-primary) dark:border-dark-divider dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
            {plainDocx || t("documentViewer.overview.emptyPreview")}
          </pre>
        )}
        <Button type="button" variant="secondary" onClick={onDownload}>
          {t("documentViewer.overview.download")}
        </Button>
      </div>
    );
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    return (
      <div className="space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
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
      <pre className="max-h-[560px] overflow-auto rounded-2xl border border-(--color-light-card-border) bg-(--color-light-input-bg) p-4 text-xs text-(--color-light-text-primary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary)">
        <code>{textMaybe}</code>
      </pre>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-(--color-light-card-border) bg-(--color-light-card-bg) p-4 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
      <p className="text-sm text-muted dark:text-dark-muted">
        {t("documentViewer.overview.binaryFallback")}
      </p>
      <Button type="button" variant="secondary" onClick={onDownload}>
        {t("documentViewer.overview.download")}
      </Button>
    </div>
  );
}
