const compareByUpdated = (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
const compareByTitle = (a, b) => a.title.localeCompare(b.title);
const compareByStudents = (a, b) => Number(a.students || 0) - Number(b.students || 0);

const sorters = {
  updated_desc: (a, b) => compareByUpdated(b, a),
  updated_asc: (a, b) => compareByUpdated(a, b),
  title_asc: (a, b) => compareByTitle(a, b),
  title_desc: (a, b) => compareByTitle(b, a),
  students_desc: (a, b) => compareByStudents(b, a),
  students_asc: (a, b) => compareByStudents(a, b),
};

export const filterAndSortCourses = ({
  courses,
  search = "",
  statusFilter = "all",
  sortBy = "updated_desc",
}) => {
  const query = search.trim().toLowerCase();
  const sorter = sorters[sortBy] || sorters.updated_desc;

  return courses
    .filter((course) => (statusFilter === "all" ? true : course.status === statusFilter))
    .filter((course) => {
      if (!query) return true;

      return (
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    })
    .sort(sorter);
};

export const paginateCourses = (courses, page, pageSize) => {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const totalItems = courses.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const start = (currentPage - 1) * safePageSize;
  const end = start + safePageSize;

  return {
    currentPage,
    totalPages,
    items: courses.slice(start, end),
    totalItems,
  };
};

export const buildActiveFilterChips = ({ search, statusFilter, sortBy }) => {
  const chips = [];

  if (search.trim()) {
    chips.push({ key: "search", label: `Search: ${search.trim()}` });
  }

  if (statusFilter !== "all") {
    chips.push({ key: "status", label: `Status: ${statusFilter}` });
  }

  if (sortBy !== "updated_desc") {
    chips.push({ key: "sort", label: `Sort: ${sortBy.replace("_", " ")}` });
  }

  return chips;
};

export const calculateCourseMetrics = (courses) => {
  const totalStudents = courses.reduce((sum, item) => sum + Number(item.students || 0), 0);
  const totalLessons = courses.reduce((sum, item) => sum + Number(item.lessons || 0), 0);
  const publishedCount = courses.filter((item) => item.status === "published").length;

  return {
    totalCourses: courses.length,
    totalStudents,
    totalLessons,
    publishedCount,
  };
};
