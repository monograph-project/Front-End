import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_ACTIVITY, DEFAULT_COURSES } from "../data/defaults";
import {
  LEGACY_ACTIVITY_KEY,
  LEGACY_COURSES_KEY,
  STORAGE_KEY,
} from "../design/tokens";
import {
  exportWorkspaceBackup,
  loadWorkspaceFromStorage,
  parseWorkspaceBackup,
} from "../utils/courseStorage";

describe("courseStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("loads migrated legacy payload", () => {
    window.localStorage.setItem(LEGACY_COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
    window.localStorage.setItem(LEGACY_ACTIVITY_KEY, JSON.stringify(DEFAULT_ACTIVITY));

    const result = loadWorkspaceFromStorage();

    expect(result.error).toBe("");
    expect(result.workspace.courses).toHaveLength(DEFAULT_COURSES.length);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeTruthy();
  });

  it("parses exported backups", () => {
    const backup = exportWorkspaceBackup({
      courses: DEFAULT_COURSES,
      activity: DEFAULT_ACTIVITY,
    });

    const parsed = parseWorkspaceBackup(backup);

    expect(parsed.courses[0].title).toBe(DEFAULT_COURSES[0].title);
    expect(parsed.activity[0].message).toBe(DEFAULT_ACTIVITY[0].message);
  });
});
