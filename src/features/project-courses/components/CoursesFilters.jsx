import { Grid3X3, List, X } from "lucide-react";
import {
  Panel,
  UiButton,
} from "../../../components/project-group/ProjectGroupPrimitives";
import {
  COURSE_SCALE,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  STATUS_OPTIONS,
} from "../design/tokens";

export function CoursesFilters({
  palette,
  statusFilter,
  sortBy,
  viewMode,
  pageSize,
  activeChips,
  onStatusChange,
  onSortChange,
  onViewChange,
  onPageSizeChange,
  onRemoveChip,
  onClearAll,
}) {
  return (
    <Panel palette={palette} className="p-3">
      <div className={`flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between`}>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${COURSE_SCALE.text.sm} ${palette.muted}`} htmlFor="course-status-filter">
            Status
          </label>
          <select
            id="course-status-filter"
            value={statusFilter}
            onChange={(event) => onStatusChange(event.target.value)}
            className={`${COURSE_SCALE.radius.sm} border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className={`${COURSE_SCALE.text.sm} ${palette.muted}`} htmlFor="course-sort-filter">
            Sort
          </label>
          <select
            id="course-sort-filter"
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className={`${COURSE_SCALE.radius.sm} border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className={`${COURSE_SCALE.text.sm} ${palette.muted}`} htmlFor="course-page-size">
            Page size
          </label>
          <select
            id="course-page-size"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className={`${COURSE_SCALE.radius.sm} border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <UiButton
            palette={palette}
            variant={viewMode === "table" ? "primary" : "secondary"}
            size="sm"
            icon={List}
            onClick={() => onViewChange("table")}
            className={COURSE_SCALE.transition}
            aria-pressed={viewMode === "table"}
          >
            Table
          </UiButton>
          <UiButton
            palette={palette}
            variant={viewMode === "grid" ? "primary" : "secondary"}
            size="sm"
            icon={Grid3X3}
            onClick={() => onViewChange("grid")}
            className={COURSE_SCALE.transition}
            aria-pressed={viewMode === "grid"}
          >
            Grid
          </UiButton>
        </div>
      </div>

      {activeChips.length ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemoveChip(chip.key)}
              className={`${COURSE_SCALE.transition} inline-flex items-center gap-1 rounded-full border px-2 py-1 ${COURSE_SCALE.text.xs} ${palette.badge}`}
              aria-label={`Remove ${chip.label} filter`}
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
          <UiButton
            palette={palette}
            size="sm"
            variant="ghost"
            onClick={onClearAll}
            className={COURSE_SCALE.transition}
          >
            Clear all
          </UiButton>
        </div>
      ) : null}
    </Panel>
  );
}
