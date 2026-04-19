import { Pencil, Trash2 } from "lucide-react";
import { memo } from "react";
import {
  CounterBadge,
  UiButton,
} from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";
import { formatRelativeDate } from "../utils/common";
import { getCourseStatusTone } from "../utils/statusTone";

export const CourseRow = memo(function CourseRow({
  course,
  palette,
  isDark,
  isDeleting,
  onEdit,
  onRequestDelete,
}) {
  return (
    <tr className={`${COURSE_SCALE.transition} ${palette.itemHover}`}>
      <td className="px-4 py-3 align-top">
        <p className={`${COURSE_SCALE.text.sm} font-semibold ${palette.blueLink}`}>{course.title}</p>
        <p className={`mt-1 ${COURSE_SCALE.text.xs} ${palette.muted}`}>{course.description}</p>
      </td>
      <td className={`px-4 py-3 ${COURSE_SCALE.text.sm} ${palette.text}`}>{course.instructor}</td>
      <td className="px-4 py-3">
        <span
          className={`${COURSE_SCALE.radius.sm} border px-2 py-0.5 ${COURSE_SCALE.text.xs} font-medium ${getCourseStatusTone(
            course.status,
            isDark
          )}`}
        >
          {course.status}
        </span>
      </td>
      <td className={`px-4 py-3 ${COURSE_SCALE.text.sm} ${palette.text}`}>{course.students}</td>
      <td className={`px-4 py-3 ${COURSE_SCALE.text.sm} ${palette.text}`}>{course.lessons}</td>
      <td className={`px-4 py-3 ${COURSE_SCALE.text.xs} ${palette.muted}`}>
        {formatRelativeDate(course.updatedAt)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
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
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {course.tags.slice(0, 2).map((tag) => (
            <CounterBadge key={`${course.id}-${tag}`} palette={palette}>
              {tag}
            </CounterBadge>
          ))}
          {course.tags.length > 2 ? (
            <CounterBadge palette={palette}>+{course.tags.length - 2}</CounterBadge>
          ) : null}
        </div>
      </td>
    </tr>
  );
});
