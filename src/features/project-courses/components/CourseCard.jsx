import { BookOpen, Clock3, Pencil, Trash2, Users } from "lucide-react";
import { memo } from "react";
import {
  CounterBadge,
  UiButton,
} from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";
import { formatRelativeDate } from "../utils/common";
import { getCourseStatusTone } from "../utils/statusTone";

export const CourseCard = memo(function CourseCard({
  course,
  palette,
  isDark,
  isDeleting,
  onEdit,
  onRequestDelete,
}) {
  return (
    <article
      className={`${COURSE_SCALE.transition} ${COURSE_SCALE.radius.md} border p-4 ${palette.border} ${palette.panel} ${palette.itemHover}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={`${COURSE_SCALE.text.sm} font-semibold ${palette.blueLink}`}>{course.title}</h3>
        <span
          className={`${COURSE_SCALE.radius.sm} border px-2 py-0.5 ${COURSE_SCALE.text.xs} font-medium ${getCourseStatusTone(
            course.status,
            isDark
          )}`}
        >
          {course.status}
        </span>
        <CounterBadge palette={palette}>{course.level}</CounterBadge>
      </div>

      <p className={`mt-2 ${COURSE_SCALE.text.sm} ${palette.muted}`}>{course.description}</p>

      <div className={`mt-3 flex flex-wrap items-center gap-4 ${COURSE_SCALE.text.xs} ${palette.muted}`}>
        <span className="inline-flex items-center gap-1">
          <Users size={13} />
          {course.students} students
        </span>
        <span className="inline-flex items-center gap-1">
          <BookOpen size={13} />
          {course.lessons} lessons
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock3 size={13} />
          Updated {formatRelativeDate(course.updatedAt)}
        </span>
      </div>

      <div className={`mt-3 flex flex-wrap gap-2`}>
        {course.tags.map((tag) => (
          <CounterBadge key={`${course.id}-${tag}`} palette={palette}>
            {tag}
          </CounterBadge>
        ))}
      </div>

      <div className={`mt-4 flex items-center gap-2`}>
        <UiButton
          palette={palette}
          variant="secondary"
          size="sm"
          icon={Pencil}
          iconSize={12}
          onClick={() => onEdit(course)}
          className={COURSE_SCALE.transition}
        >
          Edit
        </UiButton>
        <UiButton
          palette={palette}
          variant="danger"
          size="sm"
          icon={Trash2}
          iconSize={12}
          onClick={() => onRequestDelete(course)}
          disabled={isDeleting}
          className={COURSE_SCALE.transition}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </UiButton>
      </div>
    </article>
  );
});
