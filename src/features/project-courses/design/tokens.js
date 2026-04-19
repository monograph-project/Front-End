export const COURSE_SCALE = {
  space: {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
  },
  radius: {
    sm: "rounded-md",
    md: "rounded-lg",
  },
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
  },
  text: {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    xxl: "text-2xl",
  },
  transition: "transition-all duration-150 ease-out",
  focus:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6feb] focus-visible:ring-offset-2",
};

const lightTheme = {
  page: "bg-[#f6f8fa] text-[#1f2328]",
  panel: "bg-white",
  panelMuted: "bg-[#f6f8fa]",
  border: "border-[#d0d7de]",
  text: "text-[#24292f]",
  muted: "text-[#57606a]",
  input:
    "border-[#d0d7de] bg-white text-[#24292f] placeholder:text-[#656d76] focus:border-[#0969da]",
  primaryBtn: "border-transparent bg-[#1f883d] text-white hover:bg-[#1a7f37]",
  secondaryBtn: "border-[#d0d7de] bg-white text-[#24292f] hover:bg-[#f3f4f6]",
  redBtn: "border-[#d1242f3d] bg-[#ffebe9] text-[#cf222e] hover:bg-[#ffd7d5]",
  ghostBtn: "border-transparent bg-transparent text-[#57606a] hover:bg-[#f3f4f6]",
  tabActive: "border-[#d0d7de] bg-white text-[#24292f]",
  tabIdle: "border-transparent text-[#57606a] hover:bg-[#f3f4f6]",
  itemHover: "hover:bg-[#f3f4f6]",
  badge: "bg-[#eaeef2] text-[#57606a]",
  blueLink: "text-[#0969da]",
  overlay: "bg-black/55",
  modalCard: "bg-white",
};

const darkTheme = {
  page: "bg-[#0d1117] text-[#e6edf3]",
  panel: "bg-[#161b22]",
  panelMuted: "bg-[#0d1117]",
  border: "border-[#30363d]",
  text: "text-[#e6edf3]",
  muted: "text-[#8b949e]",
  input:
    "border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#1f6feb]",
  primaryBtn: "border-transparent bg-[#238636] text-white hover:bg-[#2ea043]",
  secondaryBtn: "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]",
  redBtn: "border-[#f85149]/40 bg-[#da3633]/20 text-[#ff7b72] hover:bg-[#f85149]/25",
  ghostBtn: "border-transparent bg-transparent text-[#8b949e] hover:bg-[#21262d]",
  tabActive: "border-[#30363d] bg-[#161b22] text-[#e6edf3]",
  tabIdle: "border-transparent text-[#8b949e] hover:bg-[#21262d]",
  itemHover: "hover:bg-[#21262d]",
  badge: "bg-[#21262d] text-[#8b949e]",
  blueLink: "text-[#58a6ff]",
  overlay: "bg-black/70",
  modalCard: "bg-[#161b22]",
};

export const getCourseTheme = (theme) => (theme === "dark" ? darkTheme : lightTheme);

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "updated_asc", label: "Oldest updated" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" },
  { value: "students_desc", label: "Most students" },
  { value: "students_asc", label: "Least students" },
];

export const VIEW_OPTIONS = [
  { value: "table", label: "Table" },
  { value: "grid", label: "Grid" },
];

export const LEVEL_OPTIONS = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const PAGE_SIZE_OPTIONS = [6, 9, 12];

export const DEFAULT_PAGE_SIZE = 6;

export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = "project-courses-workspace";
export const THEME_KEY = "project-courses-theme";
export const LEGACY_COURSES_KEY = "project-courses-v1";
export const LEGACY_ACTIVITY_KEY = "project-courses-activity-v1";
