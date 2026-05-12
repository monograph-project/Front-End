import { useTheme } from "../../context/themContext";

export default function ContributionHeatmap({
  weeks,
  max = 1,
  valueLabel = "contributions",
  emptyLabel = "No contributions",
  xAxisLabel = "Weeks",
  yAxisLabel = "Weekday",
}) {
  const { theme } = useTheme();
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const light = [
    "var(--color-light-app-tertiary)",
    "var(--color-light-badge-bg)",
    "var(--color-blue-200)",
    "var(--color-blue-400)",
    "var(--color-blue-600)",
  ];
  const dark = [
    "var(--color-dark-app-tertiary)",
    "var(--color-dark-badge-bg)",
    "var(--color-dark-btn-tertiary-border)",
    "var(--color-chart-blue-secondary)",
    "var(--color-dark-badge-text)",
  ];
  const palette = theme === "dark" ? dark : light;

  return (
    <div className="max-w-full overflow-x-auto py-2">
      <div className="min-w-max">
        <div className="mb-2 grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
          <span>{yAxisLabel}</span>
          <span className="text-center">{xAxisLabel}</span>
        </div>
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2">
          <div className="grid grid-rows-7 gap-1 text-[10px] leading-3 text-muted dark:text-dark-muted">
            {dayLabels.map((label) => (
              <span key={label} className="h-3">
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            {(Array.isArray(weeks) ? weeks : []).map((col, index) => (
              <div key={index} className="flex flex-col gap-1">
                {Array.from({ length: 7 }).map((_, rowIndex) => {
                  const cell = col[rowIndex];
                  const value = cell?.value ?? 0;
                  const intensity = Math.round((value / Math.max(1, max)) * 4);
                  const label = cell?.key
                    ? `${cell.key}: ${value} ${valueLabel}`
                    : emptyLabel;
                  return (
                    <span
                      key={rowIndex}
                      className="group relative h-3 w-3 rounded-[4px] border border-white/10"
                      aria-label={label}
                      style={{
                        backgroundColor: palette[intensity] ?? palette[0],
                      }}
                    >
                      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden min-w-36 -translate-x-1/2 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-2 py-1 text-center text-[10px] font-semibold text-primary shadow-md group-hover:block dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-primary">
                        {label}
                      </span>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
