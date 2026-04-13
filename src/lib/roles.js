/** Faculty / portal roles — extend as the API evolves */
export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  STAFF: "staff",
  DEAN: "dean",
  ADMIN: "admin",
  /** Read/write public stories (Medium-style); no faculty dashboard */
  USER: "user",
};

const DASHBOARD_PREFIX = {
  [ROLES.STUDENT]: "/student",
  [ROLES.TEACHER]: "/teacher",
  [ROLES.STAFF]: "/staff",
  [ROLES.DEAN]: "/dean",
  [ROLES.ADMIN]: "/admin",
};

export function getFacultyDashboardPath(role) {
  if (!role || role === ROLES.USER) return null;
  return DASHBOARD_PREFIX[role] ?? null;
}

export function postLoginPath(user) {
  const base = getFacultyDashboardPath(user?.role);
  return base ? `${base}/dashboard` : "/";
}

export function hasFacultyPortalAccess(role) {
  return Boolean(getFacultyDashboardPath(role));
}

/** Which dashboard widgets / copy to show */
export const DASHBOARD_VIEWS = {
  [ROLES.ADMIN]: "admin",
  [ROLES.DEAN]: "dean",
  [ROLES.STAFF]: "staff",
  [ROLES.TEACHER]: "teacher",
  [ROLES.STUDENT]: "student",
};

export function getDashboardView(role) {
  if (role === ROLES.USER) return "teacher";
  return DASHBOARD_VIEWS[role] ?? "teacher";
}
