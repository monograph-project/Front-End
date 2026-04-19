import { useCallback, useEffect, useState } from "react";
import { DEFAULT_ACTIVITY, DEFAULT_COURSES } from "../data/defaults";
import {
  exportWorkspaceBackup,
  loadWorkspaceFromStorage,
  parseWorkspaceBackup,
  persistWorkspaceToStorage,
  resetWorkspaceStorage,
} from "../utils/courseStorage";
import { createId } from "../utils/common";

export function useCoursesStore() {
  const [initialState] = useState(() => loadWorkspaceFromStorage());
  const [courses, setCourses] = useState(initialState.workspace.courses);
  const [activity, setActivity] = useState(initialState.workspace.activity);
  const [storageError, setStorageError] = useState(initialState.error);

  useEffect(() => {
    persistWorkspaceToStorage({ courses, activity });
  }, [courses, activity]);

  const pushActivity = useCallback((message) => {
    setActivity((prev) => [
      {
        id: createId(),
        message,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  const reload = useCallback(() => {
    const next = loadWorkspaceFromStorage();
    setCourses(next.workspace.courses);
    setActivity(next.workspace.activity);
    setStorageError(next.error);
    return next;
  }, []);

  const reset = useCallback(() => {
    resetWorkspaceStorage();
    setCourses(DEFAULT_COURSES);
    setActivity(DEFAULT_ACTIVITY);
    setStorageError("");
  }, []);

  const exportBackup = useCallback(() => {
    return exportWorkspaceBackup({ courses, activity });
  }, [courses, activity]);

  const importBackup = useCallback((text) => {
    const parsed = parseWorkspaceBackup(text);
    setCourses(parsed.courses);
    setActivity(parsed.activity);
    setStorageError("");
    return parsed;
  }, []);

  return {
    courses,
    setCourses,
    activity,
    setActivity,
    storageError,
    setStorageError,
    pushActivity,
    reload,
    reset,
    exportBackup,
    importBackup,
  };
}
