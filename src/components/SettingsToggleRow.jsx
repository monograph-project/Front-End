import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";

export default function SettingsToggleRow({
  title,
  description,
  checked,
  onChange,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-default bg-shell px-4 py-4 transition-colors hover:border-primary/20 dark:border-dark-default dark:bg-dark-shell dark:hover:border-dark-primary/20">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-primary dark:text-dark-primary">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-secondary dark:text-dark-secondary">
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={cn(
            "hidden text-[11px] font-semibold uppercase tracking-[0.14em] sm:inline",
            checked
              ? "text-primary dark:text-dark-primary"
              : "text-muted dark:text-dark-muted",
          )}
        >
          {checked
            ? t("settings.shared.toggle.on")
            : t("settings.shared.toggle.off")}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-pressed={checked}
          onClick={onChange}
          className={cn(
            "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2 focus-visible:ring-offset-shell dark:focus-visible:ring-dark-primary/30 dark:focus-visible:ring-offset-dark-shell",
            checked
              ? "border-primary bg-primary shadow-[0_0_0_1px_rgba(0,0,0,0.02)] dark:border-dark-primary dark:bg-dark-primary"
              : "border-default bg-card dark:border-dark-default dark:bg-dark-card",
          )}
        >
          <span
            className={cn(
              "inline-block h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.14)] transition-transform duration-200 dark:bg-dark-shell",
              checked ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>
    </div>
  );
}
