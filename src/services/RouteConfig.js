/**
 * All API paths use one base URL from `.env`: `VITE_API_BASE_URL` (e.g. http://localhost:8080).
 */

const stripSlash = (s) => String(s ?? "").replace(/\/$/, "");

const envApiBase = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = stripSlash(
  typeof envApiBase === "string" ? envApiBase : "",
);

const gw = (path) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Append query object to URL (skips null/undefined). */
export function withQuery(path, params = {}) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `${path}${path.includes("?") ? "&" : "?"}${s}` : path;
}

const REFRESH_SEGMENT =
  typeof import.meta.env.VITE_AUTH_REFRESH_PATH === "string" &&
  import.meta.env.VITE_AUTH_REFRESH_PATH.trim().length > 0
    ? import.meta.env.VITE_AUTH_REFRESH_PATH.trim().startsWith("/")
      ? import.meta.env.VITE_AUTH_REFRESH_PATH.trim()
      : `/${import.meta.env.VITE_AUTH_REFRESH_PATH.trim()}`
    : "/api/v1/auth/refresh-token";

/** Auth Service — `/api/v1/auth` */
export const AUTH = {
  LOGIN: gw("/api/v1/auth/login"),
  SIGNUP: gw("/api/v1/auth/signup"),
  GOOGLE: gw("/api/v1/auth/google"),
  REFRESH_TOKEN: gw(REFRESH_SEGMENT),
  LOGOUT: gw("/api/v1/auth/logout"),
  ME: gw("/api/v1/auth/me"),
  CHANGE_PASSWORD: (userId) => gw(`/api/v1/auth/change-password/${userId}`),
  FORGOT_PASSWORD: gw("/api/v1/auth/forgot-password"),
  RESET_PASSWORD: gw("/api/v1/auth/reset-password"),
  VERIFY_EMAIL: gw("/api/v1/auth/verify-email"),
  RESEND_VERIFICATION: gw("/api/v1/auth/resend-verification-email"),
};

/** User Service — `/api/v1/users` */
export const USERS = {
  LIST: (params = {}) => gw(withQuery("/api/v1/users", params)),
  SEARCH: (search) =>
    gw(
      `/api/v1/users/search${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    ),
  CREATE: () => gw("/api/v1/users"),
  BY_ID: (id) => gw(`/api/v1/users/${id}`),
  BY_USERNAME: (username) =>
    gw(`/api/v1/users/by-username/${encodeURIComponent(username)}`),
  BY_EMAIL: (email) =>
    gw(`/api/v1/users/by-email/${encodeURIComponent(email)}`),
  AUTHOR: (id) => gw(`/api/v1/users/author/${id}`),
  CONTRIBUTOR: (id) => gw(`/api/v1/users/contributor/${id}`),
  WITH_ROLE: (id, roleName) =>
    gw(`/api/v1/users/${id}/${encodeURIComponent(roleName)}`),
  SUSPEND: (id) => gw(`/api/v1/users/${id}/suspend`),
  ACTIVATE: (id) => gw(`/api/v1/users/${id}/activate`),
  LOCK: (id, durationMinutes = 30) =>
    gw(`/api/v1/users/${id}/lock?durationMinutes=${durationMinutes}`),
  VERIFY_EMAIL: (id) => gw(`/api/v1/users/${id}/verify-email`),
  STATS_COUNT: () => gw("/api/v1/users/stats/count"),
};

/** Roles — `/api/v1/roles` */
export const ROLES = {
  LIST: () => gw("/api/v1/roles"),
  CREATE: () => gw("/api/v1/roles"),
  BY_NAME: (roleName) => gw(`/api/v1/roles/${encodeURIComponent(roleName)}`),
  STATS_COUNT: () => gw("/api/v1/roles/stats/count"),
  ASSIGN: (roleName, userId) =>
    gw(
      `/api/v1/roles/${encodeURIComponent(roleName)}/assign-to-user/${userId}`,
    ),
  REMOVE: (roleName, userId) =>
    gw(
      `/api/v1/roles/${encodeURIComponent(roleName)}/remove-from-user/${userId}`,
    ),
};

/** Permissions — `/api/v1/permissions` */
export const PERMISSIONS = {
  CREATE: () => gw("/api/v1/permissions"),
  BY_CLIENT: (clientId) =>
    gw(`/api/v1/permissions/client/${encodeURIComponent(clientId)}`),
  ASSIGN: (clientId, roleName, userId) =>
    gw(
      `/api/v1/permissions/client/${encodeURIComponent(clientId)}/role/${encodeURIComponent(roleName)}/assign-to-user/${encodeURIComponent(userId)}`,
    ),
  REMOVE: (clientId, roleName, userId) =>
    gw(
      `/api/v1/permissions/client/${encodeURIComponent(clientId)}/role/${encodeURIComponent(roleName)}/remove-from-user/${encodeURIComponent(userId)}`,
    ),
  DELETE_ROLE: (clientId, roleName) =>
    gw(
      `/api/v1/permissions/client/${encodeURIComponent(clientId)}/role/${encodeURIComponent(roleName)}`,
    ),
  STATS: (clientId) =>
    gw(
      `/api/v1/permissions/client/${encodeURIComponent(clientId)}/stats/count`,
    ),
};

/** Blog Service — `/api/v1/articles` */
export const BLOG = {
  ARTICLES: (params = {}) => gw(withQuery("/api/v1/articles", params)),
  ARTICLE_BY_ID: (articleId) => gw(`/api/v1/articles/${articleId}`),
  ARTICLES_BY_AUTHOR: (authorId, params = {}) =>
    gw(
      withQuery(`/api/v1/articles/authors/${encodeURIComponent(authorId)}`, {
        page: 0,
        pageSize: 20,
        ...params,
      }),
    ),
  AUTHORS_PUBLISHED: (authorId, params = {}) =>
    gw(
      withQuery(
        `/api/v1/articles/authors/${encodeURIComponent(authorId)}/published`,
        { page: 0, pageSize: 20, ...params },
      ),
    ),
  AUTHOR_ARTICLE: (authorId, articleId) =>
    gw(
      `/api/v1/articles/authors/${encodeURIComponent(authorId)}/articles/${encodeURIComponent(articleId)}`,
    ),
  CREATE_FOR_USER: (userId) =>
    gw(`/api/v1/articles/${encodeURIComponent(userId)}`),
  DRAFT_FOR_USER: (userId) =>
    gw(`/api/v1/articles/drafts/users/${encodeURIComponent(userId)}`),
  WITH_FILES_AUTHOR: (author) =>
    gw(`/api/v1/articles/with-files/author/${encodeURIComponent(author)}`),
  UPDATE_JSON: (articleId, authorId) =>
    gw(
      `/api/v1/articles/${encodeURIComponent(articleId)}/author/${encodeURIComponent(authorId)}`,
    ),
  UPDATE_WITH_FILE: (articleId, authorId) =>
    gw(
      `/api/v1/articles/with-file/${encodeURIComponent(articleId)}/author/${encodeURIComponent(authorId)}`,
    ),
  PUBLISH: (articleId, authorId) =>
    gw(
      `/api/v1/articles/publish/${encodeURIComponent(articleId)}/author/${encodeURIComponent(authorId)}`,
    ),
  DELETE: (articleId, authorId) =>
    gw(
      `/api/v1/articles/${encodeURIComponent(articleId)}/author/${encodeURIComponent(authorId)}`,
    ),
  COMMENTS: (articleId, params = {}) =>
    gw(
      withQuery(
        `/api/v1/articles/${encodeURIComponent(articleId)}/comments`,
        params,
      ),
    ),
  COMMENT_REPLY: (articleId, parentCommentId) =>
    gw(
      `/api/v1/articles/${encodeURIComponent(articleId)}/comments/${encodeURIComponent(parentCommentId)}/replies`,
    ),
  COMMENT_DELETE: (commentId) =>
    gw(`/api/v1/articles/comments/${encodeURIComponent(commentId)}`),
  LIKES: (articleId) =>
    gw(`/api/v1/articles/${encodeURIComponent(articleId)}/likes`),
  SHARES: (articleId) =>
    gw(`/api/v1/articles/${encodeURIComponent(articleId)}/shares`),
};

/** Blog binary uploads — `/api/v1/files/upload/...` */
export const BLOG_API_FILES = {
  UPLOAD_IMAGE: (userId, articleId) =>
    gw(
      `/api/v1/files/upload/image/${encodeURIComponent(userId)}/article/${encodeURIComponent(articleId)}`,
    ),
  UPLOAD_VIDEO: (userId, articleId) =>
    gw(
      `/api/v1/files/upload/video/${encodeURIComponent(userId)}/article/${encodeURIComponent(articleId)}`,
    ),
  DELETE_FILE: (fileId, articleId) =>
    gw(
      `/api/v1/files/${encodeURIComponent(fileId)}/author/${encodeURIComponent(articleId)}`,
    ),
};

/** File Service — `/file/...` on the same gateway as `VITE_API_BASE_URL`. */
export const FILE = {
  UNIVERSITY_LOGO: {
    POST: (id) => gw(`/file/university/logo/${encodeURIComponent(id)}`),
    GET: (id) => gw(`/file/university/logo/${encodeURIComponent(id)}`),
    DELETE: (id) => gw(`/file/university/logo/${encodeURIComponent(id)}`),
    DOWNLOAD: (id) =>
      gw(`/file/university/logo/${encodeURIComponent(id)}/download`),
  },
  FACULTY_LOGO: {
    POST: (id) => gw(`/file/faculty/logo/${encodeURIComponent(id)}`),
    GET: (id) => gw(`/file/faculty/logo/${encodeURIComponent(id)}`),
  },
  DEPARTMENT_LOGO: {
    POST: (id) => gw(`/file/department/logo/${encodeURIComponent(id)}`),
    GET: (id) => gw(`/file/department/logo/${encodeURIComponent(id)}`),
  },
  TEACHER_PROFILE: {
    POST: (id) => gw(`/file/teacher/profile/${encodeURIComponent(id)}`),
    GET: (id) => gw(`/file/teacher/profile/${encodeURIComponent(id)}`),
  },
  EMPLOYEE_PROFILE: {
    POST: () => gw(`/file/employee/profile`),
    GET: (id) =>
      id
        ? gw(`/file/employee/profile/${encodeURIComponent(id)}`)
        : gw(`/file/employee/profile`),
  },
  BLOG_UPLOAD: () => gw("/file/blog/upload"),
  BLOG_META: (fileId, ownerId) =>
    gw(
      `/file/blog/${encodeURIComponent(fileId)}/owner/${encodeURIComponent(ownerId)}`,
    ),
  BLOG_LIST_BY_ARTICLE: (articleId, userId) =>
    gw(
      `/file/blog/${encodeURIComponent(articleId)}/user/${encodeURIComponent(userId)}`,
    ),
  STUDENT_PROFILE: {
    POST: (id) => gw(`/file/student/profile/${encodeURIComponent(id)}`),
    GET: (id) => gw(`/file/student/profile/${encodeURIComponent(id)}`),
  },
};

/** Notifications — `/api/v1/notifications` */
export const NOTIFICATIONS = {
  ROOT: (params = {}) => gw(withQuery("/api/v1/notifications", params)),
  BY_ID: (id) => gw(`/api/v1/notifications/${encodeURIComponent(id)}`),
  RESEND: (id) => gw(`/api/v1/notifications/${encodeURIComponent(id)}/resend`),
  USER: (userId, params = {}) =>
    gw(
      withQuery(`/api/v1/notifications/user/${encodeURIComponent(userId)}`, {
        page: 0,
        size: 20,
        ...params,
      }),
    ),
  USER_BY_TYPE: (userId, type, params = {}) =>
    gw(
      withQuery(
        `/api/v1/notifications/user/${encodeURIComponent(userId)}/type/${encodeURIComponent(type)}`,
        { page: 0, size: 20, ...params },
      ),
    ),
  USER_BY_STATUS: (userId, status, params = {}) =>
    gw(
      withQuery(
        `/api/v1/notifications/user/${encodeURIComponent(userId)}/status/${encodeURIComponent(status)}`,
        { page: 0, size: 20, ...params },
      ),
    ),
  USER_UNREAD_COUNT: (userId) =>
    gw(`/api/v1/notifications/user/${encodeURIComponent(userId)}/unread-count`),
  BY_STATUS: (status, params = {}) =>
    gw(
      withQuery(
        `/api/v1/notifications/status/${encodeURIComponent(status)}`,
        params,
      ),
    ),
  BY_TYPE: (type, params = {}) =>
    gw(
      withQuery(
        `/api/v1/notifications/type/${encodeURIComponent(type)}`,
        params,
      ),
    ),
  BY_REFERENCE: (params) =>
    gw(withQuery(`/api/v1/notifications/reference`, params)),
  ADMIN_RETRY_FAILED: () => gw("/api/v1/notifications/admin/retry-failed"),
  ADMIN_CLEANUP: (daysOld = 30) =>
    gw(`/api/v1/notifications/admin/cleanup?daysOld=${daysOld}`),
  ADMIN_STATS: (params = {}) =>
    gw(withQuery("/api/v1/notifications/admin/stats", params)),
};

/**
 * Version control — mix of `/auth`, `/api/v1/repos`, `/repos/:owner/:repo`.
 * Extend as controllers ship.
 */
export const VC_AUTH = {
  REGISTER: gw("/auth/register"),
  LOGIN: gw("/auth/login"),
  REFRESH: gw("/auth/refresh"),
};

export const VC = {
  REPOS_CREATE: gw("/api/v1/repos"),
  REPO_DETAIL: (owner, repo) =>
    gw(
      `/api/v1/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    ),
  REPO_TREE: (owner, repo, params = {}) =>
    gw(
      withQuery(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/tree`,
        params,
      ),
    ),
  /** @param {string} pathSegment e.g. `src/App.java` (no leading slash) */
  REPO_CONTENTS: (owner, repo, pathSegment = "", params = {}) => {
    const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`;
    const suffix = pathSegment
      ? `/${pathSegment
          .split("/")
          .filter(Boolean)
          .map(encodeURIComponent)
          .join("/")}`
      : "";
    return gw(withQuery(`${base}${suffix}`, params));
  },
};

/** Student resource on the gateway (`VITE_API_BASE_URL`). */
export const STUDENT = {
  GETALL: gw("/api/student"),
  GETBYID: (id) => gw(`/api/student/${id}`),
  CREATE: gw("/api/student"),
  UPDATE: (id) => gw(`/api/student/${id}`),
  DELETE: (id) => gw(`/api/student/${id}`),
};

/** Departments on the gateway (`VITE_API_BASE_URL`). */
export const DEPARTMENT = {
  GETALL: gw("/api/department"),
  GETBYID: (id) => gw(`/api/department/${id}`),
  CREATE: gw("/api/department"),
  UPDATE: (id) => gw(`/api/department/${id}`),
  DELETE: (id) => gw(`/api/department/${id}`),
};

/** Batches (intake cohorts) — faculty service `/api/batch`. */
export const BATCH = {
  LIST: (params = {}) => gw(withQuery("/api/batch", params)),
  GETALL: gw("/api/batch"),
  GETBYID: (id) => gw(`/api/batch/${encodeURIComponent(id)}`),
  CREATE: gw("/api/batch"),
  UPDATE: (id) => gw(`/api/batch/${encodeURIComponent(id)}`),
  DELETE: (id) => gw(`/api/batch/${encodeURIComponent(id)}`),
};

/** Academic year — `/api/academic-year` */
export const ACADEMIC_YEAR = {
  LIST: (params = {}) => gw(withQuery("/api/academic-year", params)),
  BY_ID: (id) =>
    gw(`/api/academic-year/${encodeURIComponent(id)}`),
  CREATE: gw("/api/academic-year"),
  UPDATE: (id) =>
    gw(`/api/academic-year/${encodeURIComponent(id)}`),
  DELETE: (id) =>
    gw(`/api/academic-year/${encodeURIComponent(id)}`),
};

/** Semester — `/api/semester` */
export const SEMESTER = {
  LIST: (params = {}) => gw(withQuery("/api/semester", params)),
  BY_ID: (id) => gw(`/api/semester/${encodeURIComponent(id)}`),
  CREATE: gw("/api/semester"),
  UPDATE: (id) => gw(`/api/semester/${encodeURIComponent(id)}`),
  DELETE: (id) => gw(`/api/semester/${encodeURIComponent(id)}`),
};

/** Faculty project — `/api/project` */
export const FACULTY_PROJECT = {
  LIST: (params = {}) => gw(withQuery("/api/project", params)),
  BY_ID: (id) => gw(`/api/project/${encodeURIComponent(id)}`),
  CREATE: gw("/api/project"),
  UPDATE: (id) => gw(`/api/project/${encodeURIComponent(id)}`),
  DELETE: (id) => gw(`/api/project/${encodeURIComponent(id)}`),
};

/** Student group — `/api/group` */
export const FACULTY_GROUP = {
  LIST: (params = {}) => gw(withQuery("/api/group", params)),
  BY_ID: (id) => gw(`/api/group/${encodeURIComponent(id)}`),
  CREATE: gw("/api/group"),
  UPDATE: (id) => gw(`/api/group/${encodeURIComponent(id)}`),
  DELETE: (id) => gw(`/api/group/${encodeURIComponent(id)}`),
};

/** Faculty-service teachers (same gateway base as students unless proxied). */
export const TEACHER = {
  GETALL: gw("/api/teacher"),
  GETBYID: (id) => gw(`/api/teacher/${id}`),
  CREATE: gw("/api/teacher"),
  UPDATE: (id) => gw(`/api/teacher/${id}`),
  DELETE: (id) => gw(`/api/teacher/${id}`),
};

/** Faculty-service employees. */
export const EMPLOYEE = {
  GETALL: gw("/api/employee"),
  GETBYID: (id) => gw(`/api/employee/${id}`),
  CREATE: gw("/api/employee"),
  UPDATE: (id) => gw(`/api/employee/${id}`),
  DELETE: (id) => gw(`/api/employee/${id}`),
};

/**
 * Flat ROUTES alias for existing apiRoute imports.
 * Prefer AUTH/STUDENT/… in new code.
 */
export const ROUTES = {
  AUTH,
  STUDENT,
  DEPARTMENT,
  BATCH,
  ACADEMIC_YEAR,
  SEMESTER,
  FACULTY_PROJECT,
  FACULTY_GROUP,
  TEACHER,
  EMPLOYEE,
};
