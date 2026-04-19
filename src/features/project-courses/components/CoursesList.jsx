import { ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { memo } from "react";
import {
  EmptyState,
  Panel,
  UiButton,
} from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";
import { CourseCard } from "./CourseCard";
import { CourseRow } from "./CourseRow";

export const CoursesList = memo(function CoursesList({
  palette,
  isDark,
  viewMode,
  items,
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  deletingId,
  onEdit,
  onRequestDelete,
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        palette={palette}
        icon={GraduationCap}
        title="No courses match your current filters"
        description="Try another search/filter, or create a new course."
      />
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === "grid" ? (
        <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-3`}>
          {items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              palette={palette}
              isDark={isDark}
              isDeleting={deletingId === course.id}
              onEdit={onEdit}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : (
        <Panel palette={palette} className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-collapse">
            <thead className={`${palette.panelMuted}`}>
              <tr className={`${palette.border} border-b`}>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Course</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Instructor</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Status</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Students</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Lessons</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Updated</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Actions</th>
                <th className={`px-4 py-2 text-left ${COURSE_SCALE.text.xs} ${palette.muted}`}>Tags</th>
              </tr>
            </thead>
            <tbody>
              {items.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  palette={palette}
                  isDark={isDark}
                  isDeleting={deletingId === course.id}
                  onEdit={onEdit}
                  onRequestDelete={onRequestDelete}
                />
              ))}
            </tbody>
          </table>
        </Panel>
      )}

      <Panel palette={palette} className="p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>
            Showing {items.length} of {totalItems} courses
          </p>
          <div className="flex items-center gap-2">
            <UiButton
              palette={palette}
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              iconSize={12}
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Prev
            </UiButton>
            <span className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>
              Page {currentPage} of {totalPages}
            </span>
            <UiButton
              palette={palette}
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconSize={12}
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </UiButton>
          </div>
        </div>
      </Panel>
    </div>
  );
});
