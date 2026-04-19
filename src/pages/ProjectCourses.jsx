import { AlertTriangle, Keyboard } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CounterBadge,
  InlineAlert,
  Panel,
  ToastStack,
  UiButton,
} from "../components/project-group/ProjectGroupPrimitives";
import { ActivityFeed } from "../features/project-courses/components/ActivityFeed";
import { ConfirmDialog } from "../features/project-courses/components/ConfirmDialog";
import { CourseModal } from "../features/project-courses/components/CourseModal";
import { CoursesFilters } from "../features/project-courses/components/CoursesFilters";
import { CoursesHeader } from "../features/project-courses/components/CoursesHeader";
import { CoursesList } from "../features/project-courses/components/CoursesList";
import { INITIAL_COURSE_FORM } from "../features/project-courses/data/defaults";
import {
  COURSE_SCALE,
  DEFAULT_PAGE_SIZE,
  SORT_OPTIONS,
  THEME_KEY,
  VIEW_OPTIONS,
  getCourseTheme,
} from "../features/project-courses/design/tokens";
import { useCoursesStore } from "../features/project-courses/hooks/useCoursesStore";
import { useDebouncedValue } from "../features/project-courses/hooks/useDebouncedValue";
import {
  buildActiveFilterChips,
  calculateCourseMetrics,
  filterAndSortCourses,
  paginateCourses,
} from "../features/project-courses/utils/courseFilters";
import { createId, sleep } from "../features/project-courses/utils/common";
import { validateCourseForm } from "../features/project-courses/utils/courseValidation";

const TABS = [
  { key: "courses", label: "Courses" },
  { key: "activity", label: "Activity" },
];

export default function ProjectCourses() {
  const {
    courses,
    setCourses,
    activity,
    storageError,
    setStorageError,
    pushActivity,
    reload,
    reset,
    exportBackup,
    importBackup,
  } = useCoursesStore();

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  });
  const [activeTab, setActiveTab] = useState("courses");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0].value);
  const [viewMode, setViewMode] = useState(VIEW_OPTIONS[0].value);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(INITIAL_COURSE_FORM);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [touched, setTouched] = useState({});
  const [toasts, setToasts] = useState([]);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [pending, setPending] = useState({
    reload: false,
    save: false,
    deleteId: null,
    import: false,
  });

  const importInputRef = useRef(null);
  const searchRef = useRef(null);
  const debouncedSearch = useDebouncedValue(search, 260);
  const isDark = theme === "dark";
  const palette = getCourseTheme(theme);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "info", title, message, actionLabel, onAction }) => {
      const id = createId();
      setToasts((prev) => [...prev, { id, type, title, message, actionLabel, onAction }]);
      setTimeout(() => dismissToast(id), 3600);
    },
    [dismissToast]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isModifier = event.metaKey || event.ctrlKey;
      const target = event.target;
      const tagName =
        target && typeof target === "object" && "tagName" in target ? target.tagName : "";
      const isTypingField =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        Boolean(
          target &&
            typeof target === "object" &&
            "isContentEditable" in target &&
            target.isContentEditable
        );

      if (isModifier && key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (isModifier && key === "n") {
        event.preventDefault();
        setEditingCourse(null);
        setForm(INITIAL_COURSE_FORM);
        setTouched({});
        setSubmitAttempted(false);
        setShowModal(true);
        return;
      }

      if (isModifier && event.shiftKey && key === "l") {
        event.preventDefault();
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
        return;
      }

      if (key === "escape" && showModal) {
        setShowModal(false);
      }

      if (isTypingField) return;
      if (key === "1") setActiveTab("courses");
      if (key === "2") setActiveTab("activity");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showModal]);

  const metrics = useMemo(() => calculateCourseMetrics(courses), [courses]);

  const filteredCourses = useMemo(
    () =>
      filterAndSortCourses({
        courses,
        search: debouncedSearch,
        statusFilter,
        sortBy,
      }),
    [courses, debouncedSearch, statusFilter, sortBy]
  );

  const pagination = useMemo(
    () => paginateCourses(filteredCourses, page, pageSize),
    [filteredCourses, page, pageSize]
  );

  const activeChips = useMemo(
    () => buildActiveFilterChips({ search, statusFilter, sortBy }),
    [search, statusFilter, sortBy]
  );

  const validation = useMemo(() => validateCourseForm(form), [form]);
  const visibleErrors = useMemo(() => {
    const entries = Object.entries(validation.errors).filter(
      ([key]) => submitAttempted || touched[key]
    );
    return Object.fromEntries(entries);
  }, [validation.errors, submitAttempted, touched]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sortBy, pageSize]);

  useEffect(() => {
    if (pagination.currentPage !== page) {
      setPage(pagination.currentPage);
    }
  }, [pagination.currentPage, page]);

  const openCreateModal = useCallback(() => {
    setEditingCourse(null);
    setForm(INITIAL_COURSE_FORM);
    setTouched({});
    setSubmitAttempted(false);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((course) => {
    setEditingCourse(course);
    setForm({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      level: course.level,
      status: course.status,
      lessons: course.lessons,
      students: course.students,
      tags: course.tags.join(", "),
    });
    setTouched({});
    setSubmitAttempted(false);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => setShowModal(false), []);

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const handleSaveCourse = useCallback(async () => {
    setSubmitAttempted(true);
    if (!validation.isValid) return;

    setPending((prev) => ({ ...prev, save: true }));
    await sleep(160);

    const normalized = {
      ...validation.normalized,
      updatedAt: new Date().toISOString(),
    };

    if (editingCourse) {
      const previous = editingCourse;
      setCourses((prev) =>
        prev.map((course) => (course.id === editingCourse.id ? { ...course, ...normalized } : course))
      );
      pushActivity(`Course updated: ${normalized.title}`);
      pushToast({
        type: "success",
        title: "Course updated",
        message: normalized.title,
        actionLabel: "Undo",
        onAction: (toastId) => {
          setCourses((prev) =>
            prev.map((course) => (course.id === previous.id ? previous : course))
          );
          pushActivity(`Undo update: ${previous.title}`);
          dismissToast(toastId);
        },
      });
    } else {
      const newCourse = { id: createId(), ...normalized };
      setCourses((prev) => [newCourse, ...prev]);
      pushActivity(`Course created: ${normalized.title}`);
      pushToast({
        type: "success",
        title: "Course created",
        message: normalized.title,
      });
    }

    setPending((prev) => ({ ...prev, save: false }));
    setShowModal(false);
  }, [
    validation,
    editingCourse,
    setCourses,
    pushActivity,
    pushToast,
    dismissToast,
  ]);

  const requestDeleteCourse = useCallback((course) => {
    setConfirmTarget(course);
  }, []);

  const confirmDeleteCourse = useCallback(async () => {
    if (!confirmTarget) return;
    const target = confirmTarget;
    const previousIndex = courses.findIndex((course) => course.id === target.id);
    if (previousIndex < 0) return;

    setPending((prev) => ({ ...prev, deleteId: target.id }));
    await sleep(120);
    setCourses((prev) => prev.filter((course) => course.id !== target.id));
    setPending((prev) => ({ ...prev, deleteId: null }));
    setConfirmTarget(null);
    pushActivity(`Course removed: ${target.title}`);
    pushToast({
      type: "success",
      title: "Course removed",
      message: target.title,
      actionLabel: "Undo",
      onAction: (toastId) => {
        setCourses((prev) => {
          const next = [...prev];
          next.splice(previousIndex, 0, target);
          return next;
        });
        pushActivity(`Undo delete: ${target.title}`);
        dismissToast(toastId);
      },
    });
  }, [confirmTarget, courses, setCourses, pushActivity, pushToast, dismissToast]);

  const handleReload = useCallback(async () => {
    setPending((prev) => ({ ...prev, reload: true }));
    await sleep(180);
    const next = reload();
    setPending((prev) => ({ ...prev, reload: false }));

    if (next.error) {
      setStorageError(next.error);
      pushToast({
        type: "error",
        title: "Reload warning",
        message: "Saved data was invalid. Default data is active.",
      });
      return;
    }

    pushToast({
      type: "success",
      title: "Workspace reloaded",
      message: "Latest saved data loaded.",
    });
  }, [reload, setStorageError, pushToast]);

  const handleExport = useCallback(() => {
    const json = exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `project-courses-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);

    pushToast({
      type: "success",
      title: "Backup exported",
      message: "JSON backup has been downloaded.",
    });
  }, [exportBackup, pushToast]);

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setPending((prev) => ({ ...prev, import: true }));
      try {
        const text = await file.text();
        importBackup(text);
        setStorageError("");
        pushToast({
          type: "success",
          title: "Backup imported",
          message: `${file.name} applied successfully.`,
        });
      } catch {
        pushToast({
          type: "error",
          title: "Import failed",
          message: "The selected file is not a valid backup.",
        });
      } finally {
        setPending((prev) => ({ ...prev, import: false }));
        event.target.value = "";
      }
    },
    [importBackup, setStorageError, pushToast]
  );

  const handleRemoveChip = useCallback((chipKey) => {
    if (chipKey === "search") setSearch("");
    if (chipKey === "status") setStatusFilter("all");
    if (chipKey === "sort") setSortBy("updated_desc");
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setSortBy("updated_desc");
  }, []);

  return (
    <div className={`min-h-screen ${palette.page}`}>
      <ToastStack toasts={toasts} palette={palette} onDismiss={dismissToast} />

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFile}
        className="hidden"
        aria-label="Import course backup"
      />

      <CoursesHeader
        palette={palette}
        isDark={isDark}
        metrics={metrics}
        search={search}
        onSearchChange={(event) => setSearch(event.target.value)}
        searchRef={searchRef}
        onThemeToggle={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
        onReload={handleReload}
        isReloading={pending.reload || pending.import}
        onCreate={openCreateModal}
        onExport={handleExport}
        onImportClick={handleImportClick}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
        {storageError ? (
          <InlineAlert
            palette={palette}
            title="Workspace recovery mode"
            description={storageError}
            actionLabel="Reset Storage"
            onAction={() => {
              reset();
              setStorageError("");
              pushToast({
                type: "success",
                title: "Storage reset",
                message: "Workspace reset to default data.",
              });
            }}
            className="mb-4"
          />
        ) : null}

        <nav className={`mt-1 border-b ${palette.border}`}>
          <ul className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tab.key === "courses" ? courses.length : activity.length;
              return (
                <li key={tab.key}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`${COURSE_SCALE.transition} flex items-center gap-2 rounded-t-md border border-b-0 px-3 py-2 ${COURSE_SCALE.text.sm} font-medium ${
                      isActive ? palette.tabActive : palette.tabIdle
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{tab.label}</span>
                    <CounterBadge palette={palette}>{count}</CounterBadge>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {activeTab === "courses" ? (
          <section className="mt-4 space-y-4">
            <CoursesFilters
              palette={palette}
              statusFilter={statusFilter}
              sortBy={sortBy}
              viewMode={viewMode}
              pageSize={pageSize}
              activeChips={activeChips}
              onStatusChange={setStatusFilter}
              onSortChange={setSortBy}
              onViewChange={setViewMode}
              onPageSizeChange={setPageSize}
              onRemoveChip={handleRemoveChip}
              onClearAll={clearAllFilters}
            />

            <CoursesList
              palette={palette}
              isDark={isDark}
              viewMode={viewMode}
              items={pagination.items}
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              deletingId={pending.deleteId}
              onEdit={openEditModal}
              onRequestDelete={requestDeleteCourse}
            />
          </section>
        ) : (
          <section className="mt-4">
            <ActivityFeed palette={palette} isDark={isDark} activity={activity} />
          </section>
        )}

        <Panel palette={palette} className={`mt-4 border ${palette.border} ${palette.panelMuted} px-4 py-3`}>
          <p
            className={`mb-2 inline-flex items-center gap-2 ${COURSE_SCALE.text.xs} font-semibold uppercase tracking-wide ${palette.muted}`}
          >
            <Keyboard size={13} />
            Keyboard Support
          </p>
          <p className={`${COURSE_SCALE.text.xs} ${palette.muted}`}>
            Ctrl/Cmd+K search, Ctrl/Cmd+N new course, Ctrl/Cmd+Shift+L theme, 1/2 switch tabs.
          </p>
        </Panel>
      </div>

      <CourseModal
        isOpen={showModal}
        palette={palette}
        form={form}
        errors={visibleErrors}
        isValid={validation.isValid}
        isSubmitting={pending.save}
        isEditMode={Boolean(editingCourse)}
        onChange={handleFormChange}
        onClose={closeModal}
        onSubmit={handleSaveCourse}
      />

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        palette={palette}
        title="Delete course"
        description={
          confirmTarget
            ? `This will permanently remove "${confirmTarget.title}". You can still undo immediately after deletion.`
            : ""
        }
        confirmLabel="Delete"
        isPending={Boolean(confirmTarget) && pending.deleteId === confirmTarget.id}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={confirmDeleteCourse}
      />

      {storageError ? (
        <div className="fixed bottom-4 left-4 z-40">
          <UiButton palette={palette} variant="secondary" icon={AlertTriangle} onClick={handleReload}>
            Recover data
          </UiButton>
        </div>
      ) : null}
    </div>
  );
}
