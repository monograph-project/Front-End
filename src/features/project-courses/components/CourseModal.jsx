import { Loader2, Plus } from "lucide-react";
import { useRef } from "react";
import { Panel, UiButton, UiInput } from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE, LEVEL_OPTIONS } from "../design/tokens";
import { useFocusTrap } from "../hooks/useFocusTrap";

const InputError = ({ message }) =>
  message ? <p className="mt-1 text-xs text-[#f85149]">{message}</p> : null;

export function CourseModal({
  isOpen,
  palette,
  form,
  errors,
  isValid,
  isSubmitting,
  isEditMode,
  onChange,
  onClose,
  onSubmit,
}) {
  const containerRef = useRef(null);

  useFocusTrap({
    isOpen,
    containerRef,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${palette.overlay}`}
      onClick={onClose}
      aria-hidden="false"
    >
      <Panel
        palette={palette}
        className={`w-full max-w-2xl ${palette.modalCard}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-modal-title"
        ref={containerRef}
      >
        <div className={`border-b px-5 py-4 ${palette.border}`}>
          <h2 id="course-modal-title" className={`${COURSE_SCALE.text.lg} font-semibold ${palette.text}`}>
            {isEditMode ? "Edit course" : "Create course"}
          </h2>
          <p className={`mt-1 ${COURSE_SCALE.text.sm} ${palette.muted}`}>
            Complete course details with proper validations and metadata.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className={`grid gap-3 px-5 py-4 sm:grid-cols-2`}
        >
          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Title
            <UiInput
              palette={palette}
              className="mt-1"
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Course title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "course-error-title" : undefined}
            />
            <InputError message={errors.title} />
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Instructor
            <UiInput
              palette={palette}
              className="mt-1"
              value={form.instructor}
              onChange={(event) => onChange("instructor", event.target.value)}
              placeholder="Instructor name"
              aria-invalid={Boolean(errors.instructor)}
              aria-describedby={errors.instructor ? "course-error-instructor" : undefined}
            />
            <InputError message={errors.instructor} />
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Level
            <select
              value={form.level}
              onChange={(event) => onChange("level", event.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Status
            <select
              value={form.status}
              onChange={(event) => onChange("status", event.target.value)}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Lessons
            <UiInput
              palette={palette}
              className="mt-1"
              type="number"
              min={1}
              max={300}
              value={form.lessons}
              onChange={(event) => onChange("lessons", event.target.value)}
              aria-invalid={Boolean(errors.lessons)}
            />
            <InputError message={errors.lessons} />
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text}`}>
            Students
            <UiInput
              palette={palette}
              className="mt-1"
              type="number"
              min={0}
              max={100000}
              value={form.students}
              onChange={(event) => onChange("students", event.target.value)}
              aria-invalid={Boolean(errors.students)}
            />
            <InputError message={errors.students} />
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text} sm:col-span-2`}>
            Description
            <textarea
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              rows={3}
              className={`mt-1 w-full rounded-md border px-3 py-2 ${COURSE_SCALE.text.sm} ${COURSE_SCALE.focus} ${palette.input}`}
              placeholder="Describe what students will learn."
              aria-invalid={Boolean(errors.description)}
            />
            <InputError message={errors.description} />
          </label>

          <label className={`block ${COURSE_SCALE.text.sm} font-medium ${palette.text} sm:col-span-2`}>
            Tags (comma separated)
            <UiInput
              palette={palette}
              className="mt-1"
              value={form.tags}
              onChange={(event) => onChange("tags", event.target.value)}
              placeholder="react, frontend, state-management"
              aria-invalid={Boolean(errors.tags)}
            />
            <InputError message={errors.tags} />
          </label>

          <div className={`col-span-full flex justify-end gap-2 border-t pt-4 ${palette.border}`}>
            <UiButton
              palette={palette}
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </UiButton>
            <UiButton
              palette={palette}
              variant="primary"
              type="submit"
              disabled={!isValid || isSubmitting}
              icon={isSubmitting ? Loader2 : Plus}
            >
              {isSubmitting ? "Saving..." : isEditMode ? "Save changes" : "Create course"}
            </UiButton>
          </div>
        </form>
      </Panel>
    </div>
  );
}
