import { DEFAULT_ACTIVITY, DEFAULT_COURSES } from "../data/defaults";
import {
  LEGACY_ACTIVITY_KEY,
  LEGACY_COURSES_KEY,
  SCHEMA_VERSION,
  STORAGE_KEY,
} from "../design/tokens";
import { createId, safeNumber } from "./common";

const sanitizeCourse = (raw, index) => {
  const fallback = DEFAULT_COURSES[index % DEFAULT_COURSES.length];
  const candidate = raw && typeof raw === "object" ? raw : {};

  return {
    id: String(candidate.id || createId()),
    title: String(candidate.title || fallback.title || "Untitled course"),
    description: String(candidate.description || fallback.description || ""),
    instructor: String(candidate.instructor || fallback.instructor || "Unknown"),
    level: String(candidate.level || fallback.level || "Beginner"),
    status: ["published", "draft", "archived"].includes(candidate.status)
      ? candidate.status
      : fallback.status || "draft",
    lessons: safeNumber(candidate.lessons, fallback.lessons || 0),
    students: safeNumber(candidate.students, fallback.students || 0),
    tags: Array.isArray(candidate.tags)
      ? candidate.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
      : [],
    updatedAt: candidate.updatedAt ? String(candidate.updatedAt) : new Date().toISOString(),
  };
};

const sanitizeActivity = (raw, index) => {
  const fallback = DEFAULT_ACTIVITY[index % DEFAULT_ACTIVITY.length];
  const candidate = raw && typeof raw === "object" ? raw : {};

  return {
    id: String(candidate.id || createId()),
    message: String(candidate.message || fallback.message || "Course workspace updated."),
    createdAt: candidate.createdAt ? String(candidate.createdAt) : new Date().toISOString(),
  };
};

export const createWorkspacePayload = ({ courses, activity }) => ({
  version: SCHEMA_VERSION,
  updatedAt: new Date().toISOString(),
  courses: (courses || []).map(sanitizeCourse),
  activity: (activity || []).map(sanitizeActivity),
});

export const migrateWorkspacePayload = (raw) => {
  if (Array.isArray(raw)) {
    return createWorkspacePayload({ courses: raw, activity: DEFAULT_ACTIVITY });
  }

  if (!raw || typeof raw !== "object") {
    return createWorkspacePayload({ courses: DEFAULT_COURSES, activity: DEFAULT_ACTIVITY });
  }

  if (Array.isArray(raw.courses) && Array.isArray(raw.activity)) {
    return createWorkspacePayload({ courses: raw.courses, activity: raw.activity });
  }

  if (raw.version === 1 && Array.isArray(raw.courses)) {
    return createWorkspacePayload({
      courses: raw.courses,
      activity: Array.isArray(raw.activity) ? raw.activity : DEFAULT_ACTIVITY,
    });
  }

  return createWorkspacePayload({ courses: DEFAULT_COURSES, activity: DEFAULT_ACTIVITY });
};

const readLegacyWorkspace = () => {
  if (typeof window === "undefined") return null;

  const rawCourses = window.localStorage.getItem(LEGACY_COURSES_KEY);
  const rawActivity = window.localStorage.getItem(LEGACY_ACTIVITY_KEY);
  if (!rawCourses && !rawActivity) return null;

  const parsedCourses = rawCourses ? JSON.parse(rawCourses) : DEFAULT_COURSES;
  const parsedActivity = rawActivity ? JSON.parse(rawActivity) : DEFAULT_ACTIVITY;

  return migrateWorkspacePayload({
    version: 1,
    courses: parsedCourses,
    activity: parsedActivity,
  });
};

export const loadWorkspaceFromStorage = () => {
  if (typeof window === "undefined") {
    return {
      workspace: createWorkspacePayload({
        courses: DEFAULT_COURSES,
        activity: DEFAULT_ACTIVITY,
      }),
      error: "",
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { workspace: migrateWorkspacePayload(parsed), error: "" };
    }

    const migratedLegacy = readLegacyWorkspace();
    if (migratedLegacy) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedLegacy));
      return { workspace: migratedLegacy, error: "" };
    }

    return {
      workspace: createWorkspacePayload({
        courses: DEFAULT_COURSES,
        activity: DEFAULT_ACTIVITY,
      }),
      error: "",
    };
  } catch {
    return {
      workspace: createWorkspacePayload({
        courses: DEFAULT_COURSES,
        activity: DEFAULT_ACTIVITY,
      }),
      error: "Unable to parse saved workspace. Defaults were restored.",
    };
  }
};

export const persistWorkspaceToStorage = (workspace) => {
  if (typeof window === "undefined") return;
  const payload = createWorkspacePayload(workspace);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const resetWorkspaceStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_COURSES_KEY);
  window.localStorage.removeItem(LEGACY_ACTIVITY_KEY);
};

export const exportWorkspaceBackup = (workspace) => {
  const payload = {
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    workspace: createWorkspacePayload(workspace),
  };
  return JSON.stringify(payload, null, 2);
};

export const parseWorkspaceBackup = (text) => {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid backup file.");
  }

  if (!parsed.workspace) {
    throw new Error("Backup file is missing workspace data.");
  }

  return migrateWorkspacePayload(parsed.workspace);
};
