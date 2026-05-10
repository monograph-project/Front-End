import { createElement } from "react";

/**
 * Repository metric tile — matches `StudentRepoStatistics` overview metrics.
 * Pass `children` to replace the default value + hint block (e.g. contributors “access” tile).
 */
export default function RepoOverviewStatCard({
  icon,
  label,
  value,
  hint,
  palette,
  children,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border p-4 shadow-xs transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-md ${palette.shell}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 opacity-95 transition-transform duration-500 ease-out group-hover:scale-x-100 ${palette.accent}`}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted dark:text-dark-muted">
            {label}
          </p>
          {children != null ? (
            <div className="mt-3">{children}</div>
          ) : (
            <>
              <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-primary dark:text-dark-primary">
                {value}
              </p>
              {hint ? (
                <p className="mt-1 max-w-[30ch] text-xs leading-relaxed text-secondary dark:text-dark-secondary">
                  {hint}
                </p>
              ) : null}
            </>
          )}
        </div>
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-transform duration-300 ease-out group-hover:scale-105 ${palette.icon}`}
        >
          {createElement(icon, { className: "size-5", strokeWidth: 1.75 })}
        </div>
      </div>
    </div>
  );
}
