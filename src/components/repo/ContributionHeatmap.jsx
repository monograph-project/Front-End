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
    "#dcfce7",
    "#86efac",
    "#22c55e",
    "#15803d",
  ];
  const dark = [
    "var(--color-dark-app-tertiary)",
    "rgba(34,197,94,0.18)",
    "rgba(34,197,94,0.38)",
    "rgba(34,197,94,0.68)",
    "rgba(21,128,61,0.95)",
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
                  const details = cell?.details ?? {};
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
                        <span className="block">{label}</span>
                        <span className="mt-1 block font-medium text-secondary dark:text-dark-secondary">
                          {details.commits ?? 0} commits · {details.pushes ?? 0} pushes · {details.tasks ?? 0} tasks
                        </span>
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
