import { describe, expect, it } from "vitest";
import { DEFAULT_COURSES } from "../data/defaults";
import {
  buildActiveFilterChips,
  filterAndSortCourses,
  paginateCourses,
} from "../utils/courseFilters";

describe("filterAndSortCourses", () => {
  it("filters by status and search query", () => {
    const result = filterAndSortCourses({
      courses: DEFAULT_COURSES,
      statusFilter: "published",
      search: "node",
      sortBy: "updated_desc",
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("Node.js");
  });

  it("sorts by students ascending", () => {
    const result = filterAndSortCourses({
      courses: DEFAULT_COURSES,
      statusFilter: "all",
      search: "",
      sortBy: "students_asc",
    });

    const values = result.map((course) => course.students);
    expect(values).toEqual([0, 221, 390, 512]);
  });
});

describe("paginateCourses", () => {
  it("returns correct page metadata and items", () => {
    const result = paginateCourses(DEFAULT_COURSES, 2, 2);

    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.totalItems).toBe(4);
  });
});

describe("buildActiveFilterChips", () => {
  it("creates removable chips for active filters", () => {
    const chips = buildActiveFilterChips({
      search: "react",
      statusFilter: "draft",
      sortBy: "students_desc",
    });

    expect(chips.map((chip) => chip.key)).toEqual(["search", "status", "sort"]);
  });
});
