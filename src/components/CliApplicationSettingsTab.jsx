import { FileArchive, Upload } from "lucide-react";
import { useState } from "react";
import SettingsSectionCard from "./SettingsSectionCard";
import { useUploadVicExecutable } from "../services/useApi";

export default function CliApplicationSettingsTab() {
  const [vicFile, setVicFile] = useState(null);
  const uploadVicExecutable = useUploadVicExecutable({
    onSuccess: () => setVicFile(null),
  });

  const submitVicExecutable = () => {
    if (!vicFile) return;
    uploadVicExecutable.mutate({ file: vicFile });
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={FileArchive}
        title="CLI application"
        description="Upload the Windows vic.exe file that public documentation users can download."
        action={
          <button
            type="button"
            onClick={submitVicExecutable}
            disabled={!vicFile || uploadVicExecutable.isPending}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-primary dark:text-dark-shell"
          >
            <Upload className="h-4 w-4" />
            {uploadVicExecutable.isPending ? "Uploading" : "Upload vic.exe"}
          </button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-(--color-light-input-border) bg-(--color-light-input-bg) p-5 text-center transition-colors hover:border-(--color-light-input-border-focus) dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:hover:border-(--color-dark-input-border-focus)">
            <Upload className="size-8 text-muted dark:text-dark-muted" strokeWidth={1.8} />
            <span className="mt-3 text-sm font-semibold text-primary dark:text-dark-primary">
              {vicFile?.name || "Choose vic.exe"}
            </span>
            <span className="mt-1 text-xs text-muted dark:text-dark-muted">
              Only Windows executable files are accepted.
            </span>
            <input
              type="file"
              accept=".exe,application/octet-stream"
              onChange={(event) => setVicFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </label>

          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-sm font-semibold text-primary dark:text-dark-primary">
              Public download target
            </p>
            <p className="mt-2 text-xs leading-5 text-secondary dark:text-dark-secondary">
              The backend stores the latest upload as{" "}
              <span className="font-mono">latest/vic.exe</span> in the
              cli-applications bucket. The Documentation page downloads this
              file as <span className="font-mono">vic.exe</span>.
            </p>
          </div>
        </div>
      </SettingsSectionCard>
    </div>
  );
}
