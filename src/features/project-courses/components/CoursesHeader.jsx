import { Download, Moon, Plus, RefreshCcw, Search, Sun, Upload } from "lucide-react";
import { Panel, UiButton, UiInput } from "../../../components/project-group/ProjectGroupPrimitives";
import { COURSE_SCALE } from "../design/tokens";

export function CoursesHeader({
  palette,
  isDark,
  metrics,
  search,
  onSearchChange,
  searchRef,
  onThemeToggle,
  onReload,
  isReloading,
  onCreate,
  onExport,
  onImportClick,
}) {
  const ThemeIcon = isDark ? Sun : Moon;

  return (
    <>
      <div className={`border-b ${palette.border} ${palette.panel}`}>
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <p className={`${COURSE_SCALE.text.sm} ${palette.muted}`}>
            Learning / <span className={`font-medium ${palette.text}`}>Project Courses</span>
          </p>

          <div className={`flex items-center ${COURSE_SCALE.space[2]}`}>
            <UiButton
              palette={palette}
              variant="secondary"
              icon={ThemeIcon}
              onClick={onThemeToggle}
              title="Toggle theme (Ctrl/Cmd+Shift+L)"
              className={COURSE_SCALE.transition}
            >
              {isDark ? "Light" : "Dark"}
            </UiButton>
            <UiButton
              palette={palette}
              variant="secondary"
              icon={RefreshCcw}
              onClick={onReload}
              disabled={isReloading}
              className={COURSE_SCALE.transition}
            >
              {isReloading ? "Reloading..." : "Reload"}
            </UiButton>
            <UiButton
              palette={palette}
              variant="secondary"
              icon={Download}
              onClick={onExport}
              className={COURSE_SCALE.transition}
            >
              Export JSON
            </UiButton>
            <UiButton
              palette={palette}
              variant="secondary"
              icon={Upload}
              onClick={onImportClick}
              className={COURSE_SCALE.transition}
            >
              Import JSON
            </UiButton>
            <UiButton
              palette={palette}
              variant="primary"
              icon={Plus}
              onClick={onCreate}
              className={COURSE_SCALE.transition}
            >
              New course
            </UiButton>
          </div>
        </div>
      </div>

      <Panel palette={palette} className="p-5">
        <div className={`flex flex-wrap items-start justify-between ${COURSE_SCALE.space[4]}`}>
          <div>
            <h1 className={`${COURSE_SCALE.text.xxl} font-semibold tracking-tight ${palette.text}`}>
              Course Management
            </h1>
            <p className={`mt-1 ${COURSE_SCALE.text.sm} ${palette.muted}`}>
              GitHub-style course workspace with reusable components and complete UX states.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <UiInput
              ref={searchRef}
              palette={palette}
              icon={Search}
              value={search}
              onChange={onSearchChange}
              placeholder="Search courses"
              aria-label="Search courses"
            />
          </div>
        </div>

        <div className={`mt-4 grid grid-cols-2 ${COURSE_SCALE.space[3]} sm:grid-cols-4`}>
          <div className={`${COURSE_SCALE.radius.sm} border p-3 ${palette.border} ${palette.panelMuted}`}>
            <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>Courses</p>
            <p className={`mt-1 ${COURSE_SCALE.text.xl} font-semibold ${palette.text}`}>
              {metrics.totalCourses}
            </p>
          </div>
          <div className={`${COURSE_SCALE.radius.sm} border p-3 ${palette.border} ${palette.panelMuted}`}>
            <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>Published</p>
            <p className={`mt-1 ${COURSE_SCALE.text.xl} font-semibold ${palette.text}`}>
              {metrics.publishedCount}
            </p>
          </div>
          <div className={`${COURSE_SCALE.radius.sm} border p-3 ${palette.border} ${palette.panelMuted}`}>
            <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>Students</p>
            <p className={`mt-1 ${COURSE_SCALE.text.xl} font-semibold ${palette.text}`}>
              {metrics.totalStudents}
            </p>
          </div>
          <div className={`${COURSE_SCALE.radius.sm} border p-3 ${palette.border} ${palette.panelMuted}`}>
            <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>Lessons</p>
            <p className={`mt-1 ${COURSE_SCALE.text.xl} font-semibold ${palette.text}`}>
              {metrics.totalLessons}
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
