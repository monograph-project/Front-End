// @ts-ignore
import axiosInstance from "./axiosConfig";
import { authUsesCookieRefresh } from "../auth/httpCredentials";
import { ingestGatewayLoginPayload } from "../auth/sessionApply";
import {
  fetchCurrentGatewayUser,
  logoutLocalGateway,
} from "../auth/authService";
import {
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
  USERS,
  ROLES,
  PERMISSIONS,
  BLOG,
  BLOG_API_FILES,
  FILE,
  NOTIFICATIONS,
  VC_AUTH,
  VC,
} from "./RouteConfig";
function normalizeEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function normalizeLoginIdentifier(value) {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  return trimmed.includes("@") ? trimmed.toLowerCase() : trimmed;
}

/** Exported for toast / logging — parses axios error `response.data`. */
export function extractApiError(err, fallbackMessage = "Request failed.") {
  const body = err.response?.data;
  if (typeof body === "string") return body || fallbackMessage;
  if (body?.detail && typeof body.detail === "string") return body.detail;
  if (Array.isArray(body?.errors) && body.errors.length) {
    const parts = body.errors.map((e) =>
      typeof e === "string" ? e : e?.message || JSON.stringify(e),
    );
    return parts.join(" · ") || fallbackMessage;
  }
  return (
    body?.message ?? body?.error_description ?? err.message ?? fallbackMessage
  );
}

/**
 * Throw with `extractApiError`-style `message` plus HTTP metadata for localized toasts.
 * @param {unknown} err — Usually an Axios error from the `catch` clause
 * @param {string} fallbackMessage — English fallback for logging / non-i18n tooling
 * @param {string} [i18nKey] — Translation key such as `apiErrors.*`
 */
export function throwApiError(
  err,
  fallbackMessage = "Request failed.",
  i18nKey,
) {
  const message = extractApiError(err, fallbackMessage);
  const error = new Error(message);
  error.name = "ApiRequestError";
  if (i18nKey) error.i18nKey = i18nKey;
  if (err?.response) error.response = err.response;
  if (err?.response?.status != null) error.status = err.response.status;
  if (err?.code) error.code = err.code;
  throw error;
}

/** Client-side validation / pre-check before a request (localized via `i18nKey`). */
export function throwClientApiError(message, i18nKey) {
  const error = new Error(message);
  error.name = "ApiClientValidationError";
  if (i18nKey) error.i18nKey = i18nKey;
  throw error;
}

/** POST `/api/v1/auth/login` (resource-owner) */
export async function login(formData) {
  const username_or_email = normalizeLoginIdentifier(
    formData.email ?? formData.username_or_email,
  );
  const password = formData.password;
  const remember_me = Boolean(formData.remember_me);

  if (!username_or_email || !password) {
    throwClientApiError(
      "Email/username and password are required.",
      "apiErrors.validation.emailUsernamePasswordRequired",
    );
  }

  try {
    const { data } = await axiosInstance.post(AUTH.LOGIN, {
      username_or_email,
      password,
      remember_me,
    });
    return ingestGatewayLoginPayload(data);
  } catch (err) {
    throwApiError(err, "Login failed.", "apiErrors.login_failed");
  }
}

/** POST `/api/v1/auth/signup` */
export async function signup(formData) {
  const fullName = String(formData.fullName ?? "").trim();
  const email = normalizeEmail(formData.email);
  const password = formData.password;
  const phone_number = formData.phone_number || "";

  if (!fullName || !email || !password) {
    throwClientApiError(
      "Full name, email, and password are required.",
      "apiErrors.validation.fullNameEmailPasswordRequired",
    );
  }

  const nameParts = fullName.split(" ").filter(Boolean);
  const first_name = nameParts[0] ?? "";
  const last_name = nameParts.slice(1).join(" ") ?? "";
  const username =
    typeof formData.username === "string" && formData.username.trim().length > 0
      ? formData.username.trim().replace(/\s+/g, "_")
      : email.split("@")[0].replace(/[^a-z0-9]/gi, "");

  try {
    const { data } = await axiosInstance.post(AUTH.SIGNUP, {
      username,
      email,
      password,
      first_name,
      last_name,
      phone_number,
      terms_agreed: true,
      privacy_agreed: true,
    });
    return ingestGatewayLoginPayload(data);
  } catch (err) {
    throwApiError(err, "Signup failed.", "apiErrors.signup_failed");
  }
}

/** POST `/api/v1/auth/google` */
export async function googleAuth(payload) {
  const id_token =
    typeof payload?.id_token === "string" ? payload.id_token : "";

  try {
    const { data } = await axiosInstance.post(AUTH.GOOGLE, {
      id_token,
      access_token: payload.access_token,
      device_id:
        payload.device_id ??
        `device_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    });
    return ingestGatewayLoginPayload(data);
  } catch (err) {
    throwApiError(
      err,
      "Google authentication failed.",
      "apiErrors.google_authentication_failed",
    );
  }
}

/** POST `/api/v1/auth/refresh-token` */
export async function refreshAuthToken(refresh_token) {
  const cookieMode = authUsesCookieRefresh();
  if (!cookieMode && !refresh_token) {
    throwClientApiError(
      "Refresh token is required.",
      "apiErrors.validation.refreshTokenRequired",
    );
  }

  try {
    const body = cookieMode ? {} : { refresh_token };
    const { data } = await axiosInstance.post(AUTH.REFRESH_TOKEN, body);
    return ingestGatewayLoginPayload(data);
  } catch (err) {
    throwApiError(
      err,
      "Token refresh failed.",
      "apiErrors.token_refresh_failed",
    );
  }
}

/** Clears SPA session and calls `/api/v1/auth/logout` when present. */
export async function logout() {
  await logoutLocalGateway();
}

/** GET `/api/v1/auth/me` — normalized profile + JWT-derived roles */
export async function fetchSessionProfile() {
  try {
    return await fetchCurrentGatewayUser();
  } catch (err) {
    throwApiError(err, "Unable to load session.");
  }
}

/** Map gateway / JSON variants into the flat list the admin table expects. */
function normalizeStudentRecord(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const firstName = raw.firstName ?? raw.first_name ?? "";
  const lastName = raw.lastName ?? raw.last_name ?? "";
  const deptNested =
    typeof raw.department === "object" && raw.department !== null
      ? raw.department
      : null;
  let departmentLabel =
    (typeof raw.department === "string" ? raw.department : "") ||
    deptNested?.name ||
    deptNested?.title ||
    raw.departmentName ||
    raw.department_name ||
    "";
  let departmentId = raw.departmentId ?? raw.department_id ?? "";
  if (!departmentId && deptNested?.id != null)
    departmentId = String(deptNested.id);

  let batchObj =
    typeof raw.batch === "object" && raw.batch !== null ? raw.batch : null;
  const batchIdFromRoot = raw.batchId ?? raw.batch_id;
  let batchId = "";
  if (batchObj?.id != null) batchId = String(batchObj.id);
  else if (typeof raw.batch === "string" && raw.batch.trim() !== "")
    batchId = String(raw.batch);
  else if (batchFromRoot(batchIdFromRoot)) batchId = String(batchIdFromRoot);

  const addr =
    typeof raw.address === "object" && raw.address !== null ? raw.address : {};

  let statusNorm = raw.status ?? "";
  if (typeof statusNorm === "string" && statusNorm.trim() !== "")
    statusNorm = statusNorm.trim().toUpperCase();

  return {
    ...raw,
    id: raw.id ?? raw.studentId ?? raw.student_id ?? "",
    firstName,
    lastName,
    username: raw.username ?? raw.userName ?? raw.user_name ?? "",
    fatherName: raw.fatherName ?? raw.father_name ?? "",
    grandFatherName: raw.grandFatherName ?? raw.grand_father_name ?? "",
    nationality: raw.nationality ?? "",
    gender: normalizeGender(raw.gender),
    dateOfBirth: toDateInputValue(raw.dateOfBirth ?? raw.date_of_birth),
    email: raw.email ?? "",
    phone: raw.phone ?? raw.phone_number ?? "",
    code: raw.code ?? raw.studentCode ?? raw.student_code ?? "",
    enrollmentDate: toDateInputValue(raw.enrollmentDate ?? raw.enrollment_date),
    kankorId: raw.kankorId ?? raw.kankor_id ?? "",
    semester: normalizeSemesterString(raw.semester),
    department: departmentLabel ? String(departmentLabel) : "",
    departmentId: departmentId != null ? String(departmentId) : "",
    status: statusNorm,
    batchId,
    batch:
      batchObj && typeof batchObj === "object" ? batchObj : (raw.batch ?? null),
    role: raw.role ?? "STUDENT",
    addressStreet: addr.street ?? raw.addressStreet ?? "",
    addressCity: addr.city ?? raw.addressCity ?? "",
    addressPostalCode:
      addr.postalCode ??
      addr.postal_code ??
      addr.zip ??
      raw.addressPostalCode ??
      "",
    addressProvince: addr.province ?? raw.addressProvince ?? "",
  };
}

function batchFromRoot(v) {
  return v != null && `${v}`.trim() !== "";
}

function toDateInputValue(v) {
  if (v == null || v === "") return "";
  const s = typeof v === "string" ? v : "";
  if (s.length >= 10) return s.slice(0, 10);
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function normalizeGender(v) {
  const s = `${v ?? ""}`.trim().toLowerCase();
  if (!s) return "";
  if (["male", "female", "other"].includes(s)) return s;
  if (s.startsWith("m")) return "male";
  if (s.startsWith("f")) return "female";
  return v != null ? String(v) : "";
}

/** Semester: API may send a number, string, or nested object (`code`, `name`, `academicYear`). */
function normalizeSemesterString(v) {
  if (v == null || v === "") return "";
  if (typeof v === "object") {
    if (v.code != null && String(v.code).trim() !== "") return String(v.code);
    if (v.name != null && String(v.name).trim() !== "") return String(v.name);
    const ayName = v.academicYear?.name;
    if (ayName != null && String(ayName).trim() !== "") return String(ayName);
    const ayId = v.academicYear?.id;
    if (ayId != null && String(ayId).trim() !== "") return String(ayId);
    return "";
  }
  const n = Number.parseInt(String(v).replace(/\D/g, ""), 10);
  if (Number.isFinite(n) && n >= 1 && n <= 8) return String(n);
  const s = `${v}`.trim();
  return s || "";
}

/* ─── Spring Data Pageable / PageResponse helpers ─────────────────────────── */

function serializeSpringQueryParams(params) {
  const usp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => {
        if (item != null && `${item}`.trim() !== "")
          usp.append(k, String(item));
      });
    } else {
      usp.append(k, String(v));
    }
  });
  return usp.toString();
}

/** Unwrap `{ data: Page }` vs direct `Page` payloads. */
function unwrapPagePayload(raw) {
  if (raw == null || typeof raw !== "object") return raw;
  const inner = raw.data ?? raw.result ?? raw.payload;
  const looksLikePage =
    inner &&
    typeof inner === "object" &&
    !Array.isArray(inner) &&
    (Array.isArray(inner.content) ||
      (Array.isArray(inner.data) &&
        ("totalElements" in inner ||
          typeof inner.page === "number" ||
          typeof inner.totalPages === "number")) ||
      "totalElements" in inner);
  if (looksLikePage) return inner;
  return raw;
}

/** Faculty `/api/*` lists may return a bare array or a Spring page envelope. */
function facultyListItems(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const page = unwrapPagePayload(data);
  if (page && typeof page === "object") {
    if (Array.isArray(page.content)) return page.content;
    if (Array.isArray(page.data)) return page.data;
    if (Array.isArray(page.items)) return page.items;
    if (Array.isArray(page.records)) return page.records;
  }
  return [];
}

/**
 * Normalize Spring `Page`/`PageResponse`-shaped JSON to a stable client shape.
 */
function normalizeSpringPage(raw, normalizeItem) {
  const page = unwrapPagePayload(raw);
  if (page == null || typeof page !== "object") {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 0,
    };
  }

  /* Prefer `data` when present — several faculty/student services use it instead of Spring's `content`. */
  const contentRaw = Array.isArray(page.data)
    ? page.data
    : Array.isArray(page.content)
      ? page.content
      : Array.isArray(page.records)
        ? page.records
        : Array.isArray(page.items)
          ? page.items
          : [];
  const norm = (v) =>
    typeof normalizeItem === "function" ? normalizeItem(v) : v;
  const content = (Array.isArray(contentRaw) ? contentRaw : [])
    .map(norm)
    .filter(Boolean);

  const totalElements = Number(
    page.totalElements ?? page.total ?? page.total_records ?? 0,
  );
  let size = Number(page.size ?? page.pageSize ?? page.limit ?? 0);
  if (!Number.isFinite(size) || size <= 0) {
    size = content.length > 0 ? content.length : 10;
  }
  let number = Number(
    page.number ?? page.page ?? page.pageNumber ?? page.currentPage ?? 0,
  );
  if (number < 0 || Number.isNaN(number)) number = 0;

  let totalPages = Number(page.totalPages ?? page.total_pages ?? 0);
  if (!Number.isFinite(totalPages) || totalPages < 0) totalPages = 0;
  if (totalPages === 0 && totalElements > 0 && size > 0) {
    totalPages = Math.max(1, Math.ceil(totalElements / size));
  }

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    first: Boolean(page.first ?? number === 0),
    last:
      Boolean(page.last) ||
      (totalPages > 0 && number >= totalPages - 1) ||
      totalElements === 0,
  };
}

function buildPageQueryBase(query) {
  const page = Math.max(0, Number(query?.page ?? 0) || 0);
  const size = Math.min(200, Math.max(1, Number(query?.size ?? 10) || 10));
  const params = { page, size };
  if (Array.isArray(query?.sort) && query.sort.length > 0)
    params.sort = query.sort.filter(Boolean);
  if (query?.search && `${query.search}`.trim())
    params.search = `${query.search}`.trim();
  if (query?.status != null && `${query.status}`.trim() !== "") {
    const st = `${query.status}`.trim();
    if (st.toLowerCase() !== "all") {
      params.status = st.toUpperCase();
    }
  }
  return params;
}

function normalizeStudentsList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload.map(normalizeStudentRecord).filter(Boolean);
  }
  if (typeof payload !== "object") return [];
  const nested =
    payload.content ??
    payload.students ??
    payload.items ??
    payload.data ??
    payload.records ??
    payload.results;
  if (Array.isArray(nested)) {
    return nested.map(normalizeStudentRecord).filter(Boolean);
  }
  return [];
}

export async function getStudents() {
  try {
    const { data } = await axiosInstance.get(
      STUDENTS.GETALL
     );
    return normalizeStudentsList(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load students.",
      "apiErrors.failed_to_load_students",
    );
  }
}

export async function getStudentsPage(query = {}) {
  try {
    const params = buildPageQueryBase(query);
    const qs = serializeSpringQueryParams(params);
    const url = qs ? `${STUDENT.GETALL}?${qs}` : STUDENT.GETALL;
    const { data } = await axiosInstance.get(url);
    return normalizeSpringPage(data, normalizeStudentRecord);
  } catch (err) {
    if (err?.response?.status === 404) {
      return normalizeSpringPage(null, normalizeStudentRecord);
    }
    throwApiError(
      err,
      "Failed to load students.",
      "apiErrors.failed_to_load_students",
    );
  }
}

export async function getStudentById(id) {
  try {
    const { data } = await axiosInstance.get(STUDENT.GETBYID(id));
    return normalizeStudentRecord(data);
  } catch (err) {
    throwApiError(
      err,
      "Failed to load student.",
      "apiErrors.failed_to_load_student",
    );
  }
}

export async function getBatches() {
  try {
    const { data } = await axiosInstance.get(BATCH.GETALL);
    return normalizeBatchesList(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load batches.",
      "apiErrors.failed_to_load_batches",
    );
  }
}

export async function getBatchById(id) {
  if (id == null || String(id).trim() === "") {
    throwClientApiError("Batch id is required.");
  }
  try {
    const { data } = await axiosInstance.get(BATCH.GETBYID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load batch.",
      "apiErrors.failed_to_load_batch",
    );
  }
}

function normalizeBatchesList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.batches)) return payload.batches;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
}

export async function createStudent(studentData) {
  try {
    const { data } = await axiosInstance.post(STUDENT.CREATE, studentData);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create student.",
      "apiErrors.failed_to_create_student",
    );
  }
}

export async function updateStudent(id, studentData) {
  try {
    const { data } = await axiosInstance.put(STUDENT.UPDATE(id), studentData);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update student.",
      "apiErrors.failed_to_update_student",
    );
  }
}

export async function deleteStudent(id) {
  try {
    await axiosInstance.delete(STUDENT.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete student.",
      "apiErrors.failed_to_delete_student",
    );
  }
}

/* ─── Teachers (faculty service) ───────────────────────────────────────────── */

function normalizeTeacherRecord(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const addr =
    typeof raw.address === "object" && raw.address != null ? raw.address : {};
  const deptNested =
    typeof raw.department === "object" && raw.department != null
      ? raw.department
      : null;
  let departmentLabel =
    (typeof raw.department === "string" ? raw.department : "") ||
    deptNested?.name ||
    deptNested?.faculty?.name ||
    "";
  let departmentId = raw.departmentId ?? raw.department_id ?? "";
  if (!departmentId && deptNested?.id != null)
    departmentId = String(deptNested.id);

  return {
    ...raw,
    id: raw.id ?? raw.teacherId ?? "",
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    username: raw.userName ?? raw.username ?? raw.user_name ?? "",
    fatherName: raw.fatherName ?? raw.father_name ?? "",
    grandFatherName: raw.grandFatherName ?? raw.grand_father_name ?? "",
    dateOfBirth: toDateInputValue(raw.dateOfBirth ?? raw.date_of_birth),
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    role: raw.role ?? "TEACHER",
    educationRank: raw.educationRank ?? raw.education_rank ?? "",
    enrollmentDate: toDateInputValue(raw.enrollmentDate ?? raw.enrollment_date),
    department:
      departmentLabel != null && String(departmentLabel).trim() !== ""
        ? String(departmentLabel)
        : "",
    departmentId: departmentId != null ? String(departmentId) : "",
    addressStreet: addr.street ?? raw.addressStreet ?? raw.address_street ?? "",
    addressCity: addr.city ?? raw.addressCity ?? "",
    addressPostalCode:
      addr.postalCode ??
      addr.postal_code ??
      addr.zip ??
      raw.addressPostalCode ??
      "",
    addressProvince:
      addr.province ?? raw.addressProvince ?? raw.address_province ?? "",
    joined: toDateInputValue(raw.enrollmentDate ?? raw.enrollment_date),
    status: raw.status ? String(raw.status).toLowerCase() : "active",
  };
}

function normalizeTeachersList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload.map(normalizeTeacherRecord).filter(Boolean);
  }
  const nested =
    payload.content ??
    payload.teachers ??
    payload.items ??
    payload.data ??
    payload.records;
  if (Array.isArray(nested)) {
    return nested.map(normalizeTeacherRecord).filter(Boolean);
  }
  return [];
}

export async function getTeachers() {
  try {
    const { data } = await axiosInstance.get(TEACHER.GETALL);
    console.log(data);
    return normalizeTeachersList(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load teachers.",
      "apiErrors.failed_to_load_teachers",
    );
  }
}

export async function getTeachersPage(query = {}) {
  try {
    const params = buildPageQueryBase(query);
    const qs = serializeSpringQueryParams(params);
    const url = qs ? `${TEACHER.GETALL}?${qs}` : TEACHER.GETALL;
    const { data } = await axiosInstance.get(url);
    return normalizeSpringPage(data, normalizeTeacherRecord);
  } catch (err) {
    if (err?.response?.status === 404) {
      return normalizeSpringPage(null, normalizeTeacherRecord);
    }
    throwApiError(
      err,
      "Failed to load teachers.",
      "apiErrors.failed_to_load_teachers",
    );
  }
}

export async function getTeacherById(id) {
  try {
    const { data } = await axiosInstance.get(TEACHER.GETBYID(id));
    return normalizeTeacherRecord(data);
  } catch (err) {
    throwApiError(
      err,
      "Failed to load teacher.",
      "apiErrors.failed_to_load_teacher",
    );
  }
}

export async function createTeacher(body) {
  try {
    const { data } = await axiosInstance.post(TEACHER.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create teacher.",
      "apiErrors.failed_to_create_teacher",
    );
  }
}

export async function updateTeacher(id, body) {
  try {
    const { data } = await axiosInstance.put(TEACHER.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update teacher.",
      "apiErrors.failed_to_update_teacher",
    );
  }
}

export async function deleteTeacherRecord(id) {
  try {
    await axiosInstance.delete(TEACHER.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete teacher.",
      "apiErrors.failed_to_delete_teacher",
    );
  }
}

/* ─── Employees (faculty service) ─────────────────────────────────────────── */

function normalizeEmployeeRecord(raw) {
  if (raw == null || typeof raw !== "object") return null;
  const addr =
    typeof raw.address === "object" && raw.address != null ? raw.address : {};
  const deptNested =
    typeof raw.department === "object" && raw.department != null
      ? raw.department
      : null;
  const facultyNested =
    typeof raw.faculty === "object" && raw.faculty != null ? raw.faculty : null;
  const departmentLabel =
    (typeof raw.department === "string" ? raw.department : "") ||
    deptNested?.name ||
    (typeof raw.faculty === "string" ? raw.faculty : "") ||
    facultyNested?.name ||
    (raw.departmentName ?? "");
  const facultyLabel =
    (typeof raw.faculty === "string" ? raw.faculty : "") ||
    facultyNested?.name ||
    "";

  return {
    ...raw,
    id: raw.id ?? raw.employeeId ?? "",
    firstName: raw.firstName ?? raw.first_name ?? "",
    lastName: raw.lastName ?? raw.last_name ?? "",
    username: raw.userName ?? raw.username ?? raw.user_name ?? "",
    fatherName: raw.fatherName ?? raw.father_name ?? "",
    grandFatherName: raw.grandFatherName ?? raw.grand_father_name ?? "",
    email: raw.email ?? "",
    phone: raw.phone ?? "",
    faculty: facultyLabel ? String(facultyLabel) : "",
    department: departmentLabel ? String(departmentLabel) : "",
    role: raw.role ?? "EMPLOYEE",
    educationRank: raw.educationRank ?? raw.education_rank ?? "",
    facultyPosition: raw.facultyPosition ?? raw.faculty_position ?? "",
    hireDate: toDateInputValue(raw.hireDate ?? raw.hire_date),
    addressStreet: addr.street ?? raw.addressStreet ?? raw.address_street ?? "",
    addressCity: addr.city ?? raw.addressCity ?? "",
    addressPostalCode:
      addr.postalCode ??
      addr.postal_code ??
      addr.zip ??
      raw.addressPostalCode ??
      "",
    addressProvince:
      addr.province ?? raw.addressProvince ?? raw.address_province ?? "",
    joined: toDateInputValue(raw.hireDate ?? raw.hire_date),
    status: raw.status ? String(raw.status).toLowerCase() : "active",
  };
}

function normalizeEmployeesList(payload) {
  if (payload == null) return [];
  if (Array.isArray(payload)) {
    return payload.map(normalizeEmployeeRecord).filter(Boolean);
  }
  const nested =
    payload.content ??
    payload.employees ??
    payload.items ??
    payload.data ??
    payload.records;
  if (Array.isArray(nested)) {
    return nested.map(normalizeEmployeeRecord).filter(Boolean);
  }
  return [];
}

export async function getEmployees() {
  try {
    const { data } = await axiosInstance.get(EMPLOYEE.GETALL);
    console.log(data);
    return normalizeEmployeesList(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load employees.",
      "apiErrors.failed_to_load_employees",
    );
  }
}

export async function getEmployeesPage(query = {}) {
  try {
    const params = buildPageQueryBase(query);
    const qs = serializeSpringQueryParams(params);
    const url = qs ? `${EMPLOYEE.GETALL}?${qs}` : EMPLOYEE.GETALL;
    const { data } = await axiosInstance.get(url);
    return normalizeSpringPage(data, normalizeEmployeeRecord);
  } catch (err) {
    if (err?.response?.status === 404) {
      return normalizeSpringPage(null, normalizeEmployeeRecord);
    }
    throwApiError(
      err,
      "Failed to load employees.",
      "apiErrors.failed_to_load_employees",
    );
  }
}

export async function getEmployeeById(id) {
  try {
    const { data } = await axiosInstance.get(EMPLOYEE.GETBYID(id));
    return normalizeEmployeeRecord(data);
  } catch (err) {
    throwApiError(
      err,
      "Failed to load employee.",
      "apiErrors.failed_to_load_employee",
    );
  }
}

export async function createEmployee(body) {
  try {
    const { data } = await axiosInstance.post(EMPLOYEE.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create employee.",
      "apiErrors.failed_to_create_employee",
    );
  }
}

export async function updateEmployee(id, body) {
  try {
    const { data } = await axiosInstance.put(EMPLOYEE.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update employee.",
      "apiErrors.failed_to_update_employee",
    );
  }
}

export async function deleteEmployeeRecord(id) {
  try {
    await axiosInstance.delete(EMPLOYEE.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete employee.",
      "apiErrors.failed_to_delete_employee",
    );
  }
}

function normalizeDepartmentRecord(raw) {
  if (raw == null || typeof raw !== "object") return null;

  const headNested =
    typeof raw.head === "object" && raw.head !== null ? raw.head : null;
  const facultyNested =
    typeof raw.faculty === "object" && raw.faculty !== null ? raw.faculty : null;

  const statusRaw = raw.status ?? raw.state ?? raw.departmentStatus ?? "";
  const createdRaw =
    raw.created ??
    raw.createdAt ??
    raw.created_at ??
    raw.createdDate ??
    raw.created_date ??
    raw.creationDate ??
    null;

  return {
    ...raw,
    id: raw.id ?? raw.departmentId ?? raw.department_id ?? raw.uuid ?? "",
    code: raw.code ?? raw.departmentCode ?? raw.department_code ?? "",
    name:
      raw.name ??
      raw.title ??
      raw.departmentName ??
      raw.department_name ??
      "",
    head:
      (typeof raw.head === "string" ? raw.head : "") ||
      headNested?.email ||
      headNested?.name ||
      headNested?.fullName ||
      raw.headEmail ||
      raw.headName ||
      raw.head_name ||
      raw.dean ||
      raw.deanEmail ||
      "",
    status:
      typeof statusRaw === "string" && statusRaw.trim() !== ""
        ? statusRaw.trim().toLowerCase()
        : "inactive",
    created: createdRaw,
    facultyName:
      raw.facultyName ??
      raw.faculty_name ??
      facultyNested?.name ??
      facultyNested?.title ??
      "",
  };
}

function normalizeDepartmentsList(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload.map(normalizeDepartmentRecord).filter(Boolean);
  }
  if (typeof payload !== "object") return [];

  const nested =
    payload.content ??
    payload.departments ??
    payload.items ??
    payload.data ??
    payload.records ??
    payload.results;

  if (Array.isArray(nested)) {
    return nested.map(normalizeDepartmentRecord).filter(Boolean);
  }

  return [];
}

export async function getDepartments() {
  try {
    const { data } = await axiosInstance.get(DEPARTMENT.GETALL);
    return normalizeDepartmentsList(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load departments.",
      "apiErrors.failed_to_load_departments",
    );
  }
}

export async function getDepartmentById(id) {
  try {
    const { data } = await axiosInstance.get(DEPARTMENT.GETBYID(id));
    return normalizeDepartmentRecord(data);
  } catch (err) {
    throwApiError(
      err,
      "Failed to load department.",
      "apiErrors.failed_to_load_department",
    );
  }
}

export async function createDepartment(departmentData) {
  try {
    const { data } = await axiosInstance.post(
      DEPARTMENT.CREATE,
      departmentData,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create department.",
      "apiErrors.failed_to_create_department",
    );
  }
}

export async function updateDepartment(id, departmentData) {
  try {
    const { data } = await axiosInstance.put(
      DEPARTMENT.UPDATE(id),
      departmentData,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update department.",
      "apiErrors.failed_to_update_department",
    );
  }
}

export async function deleteDepartment(id) {
  try {
    await axiosInstance.delete(DEPARTMENT.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete department.",
      "apiErrors.failed_to_delete_department",
    );
  }
}

/* ─── Academic year (`/api/academic-year`) ───────────────────────────────── */

export async function getAcademicYears(query = {}) {
  try {
    const { data } = await axiosInstance.get(ACADEMIC_YEAR.LIST(query));
    return facultyListItems(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load academic years.",
      "apiErrors.failed_to_load_academic_years",
    );
  }
}

export async function getAcademicYearById(id) {
  if (id == null || String(id).trim() === "") {
    throwClientApiError("Academic year id is required.");
  }
  try {
    const { data } = await axiosInstance.get(ACADEMIC_YEAR.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load academic year.",
      "apiErrors.failed_to_load_academic_year",
    );
  }
}

export async function createAcademicYear(body) {
  try {
    const { data } = await axiosInstance.post(ACADEMIC_YEAR.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create academic year.",
      "apiErrors.failed_to_create_academic_year",
    );
  }
}

export async function updateAcademicYear(id, body) {
  try {
    const { data } = await axiosInstance.put(ACADEMIC_YEAR.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update academic year.",
      "apiErrors.failed_to_update_academic_year",
    );
  }
}

export async function deleteAcademicYear(id) {
  try {
    await axiosInstance.delete(ACADEMIC_YEAR.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete academic year.",
      "apiErrors.failed_to_delete_academic_year",
    );
  }
}

/* ─── Semester (`/api/semester`) ───────────────────────────────────────────── */

export async function getSemesters(query = {}) {
  try {
    const { data } = await axiosInstance.get(SEMESTER.LIST(query));
    return facultyListItems(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load semesters.",
      "apiErrors.failed_to_load_semesters",
    );
  }
}

export async function getSemesterById(id) {
  try {
    const { data } = await axiosInstance.get(SEMESTER.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load semester.",
      "apiErrors.failed_to_load_semester",
    );
  }
}

export async function createSemester(body) {
  try {
    const { data } = await axiosInstance.post(SEMESTER.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create semester.",
      "apiErrors.failed_to_create_semester",
    );
  }
}

export async function updateSemester(id, body) {
  try {
    const { data } = await axiosInstance.put(SEMESTER.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update semester.",
      "apiErrors.failed_to_update_semester",
    );
  }
}

export async function deleteSemester(id) {
  try {
    await axiosInstance.delete(SEMESTER.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete semester.",
      "apiErrors.failed_to_delete_semester",
    );
  }
}

/* ─── Faculty project (`/api/project`) ────────────────────────────────────── */

export async function getFacultyProjects(query = {}) {
  try {
    const { data } = await axiosInstance.get(FACULTY_PROJECT.LIST(query));
    return facultyListItems(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load projects.",
      "apiErrors.failed_to_load_faculty_projects",
    );
  }
}

export async function getFacultyProjectById(id) {
  try {
    const { data } = await axiosInstance.get(FACULTY_PROJECT.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load project.",
      "apiErrors.failed_to_load_faculty_project",
    );
  }
}

export async function createFacultyProject(body) {
  try {
    const { data } = await axiosInstance.post(FACULTY_PROJECT.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create project.",
      "apiErrors.failed_to_create_faculty_project",
    );
  }
}

export async function updateFacultyProject(id, body) {
  try {
    const { data } = await axiosInstance.put(FACULTY_PROJECT.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update project.",
      "apiErrors.failed_to_update_faculty_project",
    );
  }
}

export async function deleteFacultyProject(id) {
  try {
    await axiosInstance.delete(FACULTY_PROJECT.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete project.",
      "apiErrors.failed_to_delete_faculty_project",
    );
  }
}

/* ─── Faculty group (`/api/group`) ─────────────────────────────────────────── */

export async function getFacultyGroups(query = {}) {
  try {
    const { data } = await axiosInstance.get(FACULTY_GROUP.LIST(query));
    return facultyListItems(data);
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throwApiError(
      err,
      "Failed to load groups.",
      "apiErrors.failed_to_load_faculty_groups",
    );
  }
}

export async function getFacultyGroupById(id) {
  try {
    const { data } = await axiosInstance.get(FACULTY_GROUP.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load group.",
      "apiErrors.failed_to_load_faculty_group",
    );
  }
}

export async function createFacultyGroup(body) {
  try {
    const { data } = await axiosInstance.post(FACULTY_GROUP.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create group.",
      "apiErrors.failed_to_create_faculty_group",
    );
  }
}

export async function updateFacultyGroup(id, body) {
  try {
    const { data } = await axiosInstance.put(FACULTY_GROUP.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update group.",
      "apiErrors.failed_to_update_faculty_group",
    );
  }
}

export async function deleteFacultyGroup(id) {
  try {
    await axiosInstance.delete(FACULTY_GROUP.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete group.",
      "apiErrors.failed_to_delete_faculty_group",
    );
  }
}

/* ─── Batch CUD (`/api/batch`) — read helpers exist above ──────────────────── */

export async function createBatch(body) {
  try {
    const { data } = await axiosInstance.post(BATCH.CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create batch.",
      "apiErrors.failed_to_create_batch",
    );
  }
}

export async function updateBatch(id, body) {
  try {
    const { data } = await axiosInstance.put(BATCH.UPDATE(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update batch.",
      "apiErrors.failed_to_update_batch",
    );
  }
}

export async function deleteBatch(id) {
  try {
    await axiosInstance.delete(BATCH.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete batch.",
      "apiErrors.failed_to_delete_batch",
    );
  }
}

export async function forgotPassword(email) {
  if (!email) {
    throwClientApiError(
      "Email is required.",
      "apiErrors.validation.emailRequired",
    );
  }

  try {
    const { data } = await axiosInstance.post(AUTH.FORGOT_PASSWORD, {
      email,
    });
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Forgot password request failed.",
      "apiErrors.forgot_password_request_failed",
    );
  }
}

export async function resetPassword(formData) {
  const { reset_token, new_password, confirm_password } = formData;
  if (!reset_token || !new_password || new_password !== confirm_password) {
    throwClientApiError(
      "Invalid reset token or passwords do not match.",
      "apiErrors.validation.invalidResetTokenOrPasswordMismatch",
    );
  }

  try {
    const { data } = await axiosInstance.post(AUTH.RESET_PASSWORD, formData);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Password reset failed.",
      "apiErrors.password_reset_failed",
    );
  }
}

export async function verifyEmail(verification_token) {
  if (!verification_token) {
    throwClientApiError(
      "Verification token is required.",
      "apiErrors.validation.verificationTokenRequired",
    );
  }

  try {
    const { data } = await axiosInstance.post(AUTH.VERIFY_EMAIL, {
      verification_token,
    });
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Email verification failed.",
      "apiErrors.email_verification_failed",
    );
  }
}

export async function resendVerificationEmail(email) {
  if (!email) {
    throwClientApiError(
      "Email is required.",
      "apiErrors.validation.emailRequired",
    );
  }

  try {
    const { data } = await axiosInstance.post(AUTH.RESEND_VERIFICATION, {
      email,
    });
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Resend verification failed.",
      "apiErrors.resend_verification_failed",
    );
  }
}

export async function changePassword(userId, formData) {
  const { current_password, new_password, confirm_password } = formData;
  if (!current_password || !new_password || new_password !== confirm_password) {
    throwClientApiError(
      "Invalid passwords.",
      "apiErrors.validation.invalidPasswords",
    );
  }

  try {
    const { data } = await axiosInstance.post(
      AUTH.CHANGE_PASSWORD(userId),
      formData,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Change password failed.",
      "apiErrors.change_password_failed",
    );
  }
}

/* ─── Users ───────────────────────────────────────────────────────────────── */

export async function listUsers(params = {}) {
  try {
    const { data } = await axiosInstance.get(USERS.LIST(params));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load users.",
      "apiErrors.failed_to_load_users",
    );
  }
}

export async function searchUsers(search) {
  try {
    const { data } = await axiosInstance.get(USERS.SEARCH(search || ""));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to search users.",
      "apiErrors.failed_to_search_users",
    );
  }
}

export async function createUser(body) {
  try {
    const { data } = await axiosInstance.post(USERS.CREATE(), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create user.",
      "apiErrors.failed_to_create_user",
    );
  }
}

export async function getUserById(id) {
  try {
    const { data } = await axiosInstance.get(USERS.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to load user.", "apiErrors.failed_to_load_user");
  }
}

export async function updateUser(id, body) {
  try {
    const { data } = await axiosInstance.put(USERS.BY_ID(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update user.",
      "apiErrors.failed_to_update_user",
    );
  }
}

export async function deleteUser(id) {
  try {
    await axiosInstance.delete(USERS.BY_ID(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete user.",
      "apiErrors.failed_to_delete_user",
    );
  }
}

export async function getUserByUsername(username) {
  try {
    const { data } = await axiosInstance.get(USERS.BY_USERNAME(username));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to load user.", "apiErrors.failed_to_load_user");
  }
}

export async function getUserByEmail(email) {
  try {
    const { data } = await axiosInstance.get(USERS.BY_EMAIL(email));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to load user.", "apiErrors.failed_to_load_user");
  }
}

export async function getUserAuthorProfile(id) {
  try {
    const { data } = await axiosInstance.get(USERS.AUTHOR(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load author profile.",
      "apiErrors.failed_to_load_author_profile",
    );
  }
}

export async function getUserContributorProfile(id) {
  try {
    const { data } = await axiosInstance.get(USERS.CONTRIBUTOR(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load contributor.",
      "apiErrors.failed_to_load_contributor",
    );
  }
}

export async function addRoleToUser(id, roleName) {
  try {
    const { data } = await axiosInstance.post(USERS.WITH_ROLE(id, roleName));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to add role.", "apiErrors.failed_to_add_role");
  }
}

export async function suspendUser(id) {
  try {
    const { data } = await axiosInstance.post(USERS.SUSPEND(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to suspend user.",
      "apiErrors.failed_to_suspend_user",
    );
  }
}

export async function activateUser(id) {
  try {
    const { data } = await axiosInstance.post(USERS.ACTIVATE(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to activate user.",
      "apiErrors.failed_to_activate_user",
    );
  }
}

export async function lockUser(id, durationMinutes = 30) {
  try {
    const { data } = await axiosInstance.post(USERS.LOCK(id, durationMinutes));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to lock user.", "apiErrors.failed_to_lock_user");
  }
}

export async function verifyUserEmailByAdmin(id) {
  try {
    const { data } = await axiosInstance.post(USERS.VERIFY_EMAIL(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to verify email.",
      "apiErrors.failed_to_verify_email",
    );
  }
}

export async function postUsersStatsCount(body = {}) {
  try {
    const { data } = await axiosInstance.post(USERS.STATS_COUNT(), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load user statistics.",
      "apiErrors.failed_to_load_user_statistics",
    );
  }
}

/* ─── Roles ───────────────────────────────────────────────────────────────── */

export async function listRoles() {
  try {
    const { data } = await axiosInstance.get(ROLES.LIST());
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load roles.",
      "apiErrors.failed_to_load_roles",
    );
  }
}

export async function createRole(body) {
  try {
    const { data } = await axiosInstance.post(ROLES.CREATE(), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create role.",
      "apiErrors.failed_to_create_role",
    );
  }
}

export async function updateRole(roleName, body) {
  try {
    const { data } = await axiosInstance.put(ROLES.BY_NAME(roleName), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update role.",
      "apiErrors.failed_to_update_role",
    );
  }
}

export async function deleteRole(roleName) {
  try {
    await axiosInstance.delete(ROLES.BY_NAME(roleName));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete role.",
      "apiErrors.failed_to_delete_role",
    );
  }
}

export async function getRolesStatsCount() {
  try {
    const { data } = await axiosInstance.get(ROLES.STATS_COUNT());
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load role statistics.",
      "apiErrors.failed_to_load_role_statistics",
    );
  }
}

export async function assignRoleToUser(roleName, userId) {
  try {
    const { data } = await axiosInstance.post(ROLES.ASSIGN(roleName, userId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to assign role.",
      "apiErrors.failed_to_assign_role",
    );
  }
}

export async function removeRoleFromUser(roleName, userId) {
  try {
    const { data } = await axiosInstance.delete(ROLES.REMOVE(roleName, userId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to remove role.",
      "apiErrors.failed_to_remove_role",
    );
  }
}

/* ─── Permissions ─────────────────────────────────────────────────────────── */

export async function createPermission(body) {
  try {
    const { data } = await axiosInstance.post(PERMISSIONS.CREATE(), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create permission.",
      "apiErrors.failed_to_create_permission",
    );
  }
}

export async function getPermissionsByClient(clientId) {
  try {
    const { data } = await axiosInstance.get(PERMISSIONS.BY_CLIENT(clientId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load permissions.",
      "apiErrors.failed_to_load_permissions",
    );
  }
}

export async function assignPermissionRoleToUser(clientId, roleName, userId) {
  try {
    const { data } = await axiosInstance.post(
      PERMISSIONS.ASSIGN(clientId, roleName, userId),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to assign permission.",
      "apiErrors.failed_to_assign_permission",
    );
  }
}

export async function removePermissionRoleFromUser(clientId, roleName, userId) {
  try {
    const { data } = await axiosInstance.delete(
      PERMISSIONS.REMOVE(clientId, roleName, userId),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to remove permission.",
      "apiErrors.failed_to_remove_permission",
    );
  }
}

export async function deleteClientRoleBundle(clientId, roleName) {
  try {
    await axiosInstance.delete(PERMISSIONS.DELETE_ROLE(clientId, roleName));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete client role.",
      "apiErrors.failed_to_delete_client_role",
    );
  }
}

export async function getPermissionClientStats(clientId) {
  try {
    const { data } = await axiosInstance.get(PERMISSIONS.STATS(clientId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load permission stats.",
      "apiErrors.failed_to_load_permission_stats",
    );
  }
}

/* ─── Blog articles & engagement ──────────────────────────────────────────── */

export async function getArticles(params = {}) {
  try {
    const { data } = await axiosInstance.get(BLOG.ARTICLES(params));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load articles.",
      "apiErrors.failed_to_load_articles",
    );
  }
}

export async function getArticleById(articleId) {
  try {
    const { data } = await axiosInstance.get(BLOG.ARTICLE_BY_ID(articleId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load article.",
      "apiErrors.failed_to_load_article",
    );
  }
}

export async function createArticleForUser(userId, body) {
  try {
    const { data } = await axiosInstance.post(
      BLOG.CREATE_FOR_USER(userId),
      body,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create article.",
      "apiErrors.failed_to_create_article",
    );
  }
}

export async function createDraftForUser(userId, body) {
  try {
    const { data } = await axiosInstance.post(
      BLOG.DRAFT_FOR_USER(userId),
      body,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to save draft.",
      "apiErrors.failed_to_save_draft",
    );
  }
}

export async function createArticleWithMultipart(authorUserId, formData) {
  try {
    const { data } = await axiosInstance.post(
      BLOG.WITH_FILES_AUTHOR(authorUserId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create article with files.",
      "apiErrors.failed_to_create_article_with_files",
    );
  }
}

export async function updateArticleJson(articleId, authorId, body) {
  try {
    const { data } = await axiosInstance.put(
      BLOG.UPDATE_JSON(articleId, authorId),
      body,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update article.",
      "apiErrors.failed_to_update_article",
    );
  }
}

export async function updateArticleWithFile(articleId, authorId, formData) {
  try {
    const { data } = await axiosInstance.put(
      BLOG.UPDATE_WITH_FILE(articleId, authorId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to update article.",
      "apiErrors.failed_to_update_article",
    );
  }
}

export async function publishArticle(articleId, authorId, body) {
  try {
    const { data } = await axiosInstance.patch(
      BLOG.PUBLISH(articleId, authorId),
      body,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to publish article.",
      "apiErrors.failed_to_publish_article",
    );
  }
}

export async function deleteArticle(articleId, authorId) {
  try {
    await axiosInstance.delete(BLOG.DELETE(articleId, authorId));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete article.",
      "apiErrors.failed_to_delete_article",
    );
  }
}

export async function getArticlesByAuthor(authorId, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      BLOG.ARTICLES_BY_AUTHOR(authorId, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load author articles.",
      "apiErrors.failed_to_load_author_articles",
    );
  }
}

export async function getPublishedArticlesByAuthor(authorId, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      BLOG.AUTHORS_PUBLISHED(authorId, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load published articles.",
      "apiErrors.failed_to_load_published_articles",
    );
  }
}

export async function getAuthorArticleDetail(authorId, articleId) {
  try {
    const { data } = await axiosInstance.get(
      BLOG.AUTHOR_ARTICLE(authorId, articleId),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load article.",
      "apiErrors.failed_to_load_article",
    );
  }
}

export async function postArticleComment(articleId, body) {
  try {
    const { data } = await axiosInstance.post(BLOG.COMMENTS(articleId), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to post comment.",
      "apiErrors.failed_to_post_comment",
    );
  }
}

export async function getArticleComments(articleId, params = {}) {
  try {
    const { data } = await axiosInstance.get(BLOG.COMMENTS(articleId, params));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load comments.",
      "apiErrors.failed_to_load_comments",
    );
  }
}

export async function postArticleCommentReply(
  articleId,
  parentCommentId,
  body,
) {
  try {
    const { data } = await axiosInstance.post(
      BLOG.COMMENT_REPLY(articleId, parentCommentId),
      body,
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to post reply.",
      "apiErrors.failed_to_post_reply",
    );
  }
}

export async function deleteArticleComment(commentId) {
  try {
    await axiosInstance.delete(BLOG.COMMENT_DELETE(commentId));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete comment.",
      "apiErrors.failed_to_delete_comment",
    );
  }
}

export async function likeArticle(articleId) {
  try {
    const { data } = await axiosInstance.post(BLOG.LIKES(articleId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to like article.",
      "apiErrors.failed_to_like_article",
    );
  }
}

export async function unlikeArticle(articleId) {
  try {
    await axiosInstance.delete(BLOG.LIKES(articleId));
  } catch (err) {
    throwApiError(
      err,
      "Failed to remove like.",
      "apiErrors.failed_to_remove_like",
    );
  }
}

export async function shareArticle(articleId, body) {
  try {
    const { data } = await axiosInstance.post(BLOG.SHARES(articleId), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to record share.",
      "apiErrors.failed_to_record_share",
    );
  }
}

export async function uploadArticleImage(userId, articleId, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      BLOG_API_FILES.UPLOAD_IMAGE(userId, articleId),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload image.",
      "apiErrors.failed_to_upload_image",
    );
  }
}

export async function uploadArticleVideo(userId, articleId, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      BLOG_API_FILES.UPLOAD_VIDEO(userId, articleId),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload video.",
      "apiErrors.failed_to_upload_video",
    );
  }
}

export async function deleteBlogApiFile(fileId, articleId) {
  try {
    await axiosInstance.delete(BLOG_API_FILES.DELETE_FILE(fileId, articleId));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete file.",
      "apiErrors.failed_to_delete_file",
    );
  }
}

/* ─── Static file gateway (`/file/...`) ───────────────────────────────────── */

export async function postUniversityLogo(id, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      FILE.UNIVERSITY_LOGO.POST(id),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload university logo.",
      "apiErrors.failed_to_upload_university_logo",
    );
  }
}

export async function getUniversityLogoUrl(id) {
  try {
    const { data } = await axiosInstance.get(FILE.UNIVERSITY_LOGO.GET(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load university logo.",
      "apiErrors.failed_to_load_university_logo",
    );
  }
}

export async function deleteUniversityLogo(id) {
  try {
    await axiosInstance.delete(FILE.UNIVERSITY_LOGO.DELETE(id));
  } catch (err) {
    throwApiError(
      err,
      "Failed to delete university logo.",
      "apiErrors.failed_to_delete_university_logo",
    );
  }
}

export async function downloadUniversityLogoBlob(id) {
  try {
    const { data } = await axiosInstance.get(
      FILE.UNIVERSITY_LOGO.DOWNLOAD(id),
      {
        responseType: "blob",
      },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to download logo.",
      "apiErrors.failed_to_download_logo",
    );
  }
}

export async function postFacultyLogo(id, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(FILE.FACULTY_LOGO.POST(id), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload faculty logo.",
      "apiErrors.failed_to_upload_faculty_logo",
    );
  }
}

export async function getFacultyLogoUrl(id) {
  try {
    const { data } = await axiosInstance.get(FILE.FACULTY_LOGO.GET(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load faculty logo.",
      "apiErrors.failed_to_load_faculty_logo",
    );
  }
}

export async function postDepartmentLogo(id, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      FILE.DEPARTMENT_LOGO.POST(id),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload department logo.",
      "apiErrors.failed_to_upload_department_logo",
    );
  }
}

export async function getDepartmentLogoUrl(id) {
  try {
    const { data } = await axiosInstance.get(FILE.DEPARTMENT_LOGO.GET(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load department logo.",
      "apiErrors.failed_to_load_department_logo",
    );
  }
}

export async function postTeacherProfilePicture(id, file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      FILE.TEACHER_PROFILE.POST(id),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload teacher profile.",
      "apiErrors.failed_to_upload_teacher_profile",
    );
  }
}

export async function getTeacherProfilePictureUrl(id) {
  try {
    const { data } = await axiosInstance.get(FILE.TEACHER_PROFILE.GET(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load teacher profile.",
      "apiErrors.failed_to_load_teacher_profile",
    );
  }
}

export async function postEmployeeProfilePicture(file) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await axiosInstance.post(
      FILE.EMPLOYEE_PROFILE.POST(),
      fd,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload employee profile.",
      "apiErrors.failed_to_upload_employee_profile",
    );
  }
}

export async function uploadBlogFileMultipart(file, ownerId, articleId) {
  try {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("ownerId", ownerId);
    fd.append("article", articleId);
    const { data } = await axiosInstance.post(FILE.BLOG_UPLOAD(), fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to upload blog file.",
      "apiErrors.failed_to_upload_blog_file",
    );
  }
}

export async function getBlogFileMeta(fileId, ownerId) {
  try {
    const { data } = await axiosInstance.get(FILE.BLOG_META(fileId, ownerId));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load file metadata.",
      "apiErrors.failed_to_load_file_metadata",
    );
  }
}

export async function listBlogFilesForArticle(articleId, userId) {
  try {
    const { data } = await axiosInstance.get(
      FILE.BLOG_LIST_BY_ARTICLE(articleId, userId),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to list blog files.",
      "apiErrors.failed_to_list_blog_files",
    );
  }
}

/* ─── Notifications ───────────────────────────────────────────────────────── */

export async function createNotification(body) {
  try {
    const { data } = await axiosInstance.post(NOTIFICATIONS.ROOT(), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to send notification.",
      "apiErrors.failed_to_send_notification",
    );
  }
}

export async function resendNotification(id, body) {
  try {
    const { data } = await axiosInstance.post(NOTIFICATIONS.RESEND(id), body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to resend notification.",
      "apiErrors.failed_to_resend_notification",
    );
  }
}

export async function getNotificationById(id) {
  try {
    const { data } = await axiosInstance.get(NOTIFICATIONS.BY_ID(id));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notification.",
      "apiErrors.failed_to_load_notification",
    );
  }
}

export async function listNotificationsRoot(params = {}) {
  try {
    const { data } = await axiosInstance.get(NOTIFICATIONS.ROOT(params));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function listUserNotifications(userId, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.USER(userId, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function listUserNotificationsByType(userId, type, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.USER_BY_TYPE(userId, type, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function listUserNotificationsByStatus(
  userId,
  status,
  params = {},
) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.USER_BY_STATUS(userId, status, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function getUserNotificationUnreadCount(userId) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.USER_UNREAD_COUNT(userId),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load unread count.",
      "apiErrors.failed_to_load_unread_count",
    );
  }
}

export async function listNotificationsByStatusGlobally(status, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.BY_STATUS(status, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function listNotificationsByTypeGlobally(type, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.BY_TYPE(type, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function listNotificationsByReference(params) {
  try {
    const { data } = await axiosInstance.get(
      NOTIFICATIONS.BY_REFERENCE(params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notifications.",
      "apiErrors.failed_to_load_notifications",
    );
  }
}

export async function adminRetryFailedNotifications() {
  try {
    const { data } = await axiosInstance.post(
      NOTIFICATIONS.ADMIN_RETRY_FAILED(),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to trigger retry.",
      "apiErrors.failed_to_trigger_retry",
    );
  }
}

export async function adminCleanupNotifications(daysOld = 30) {
  try {
    const { data } = await axiosInstance.delete(
      NOTIFICATIONS.ADMIN_CLEANUP(daysOld),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to cleanup notifications.",
      "apiErrors.failed_to_cleanup_notifications",
    );
  }
}

export async function adminNotificationStatistics(params = {}) {
  try {
    const { data } = await axiosInstance.get(NOTIFICATIONS.ADMIN_STATS(params));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load notification stats.",
      "apiErrors.failed_to_load_notification_stats",
    );
  }
}

/* ─── Version control (subset) ────────────────────────────────────────────── */

export async function vcRegister(body) {
  try {
    const { data } = await axiosInstance.post(VC_AUTH.REGISTER, body);
    return data;
  } catch (err) {
    throwApiError(err, "Registration failed.", "apiErrors.registration_failed");
  }
}

export async function vcLogin(body) {
  try {
    const { data } = await axiosInstance.post(VC_AUTH.LOGIN, body);
    return data;
  } catch (err) {
    throwApiError(err, "VC login failed.", "apiErrors.vc_login_failed");
  }
}

export async function vcRefresh(body) {
  try {
    const { data } = await axiosInstance.post(VC_AUTH.REFRESH, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Token refresh failed.",
      "apiErrors.token_refresh_failed",
    );
  }
}

export async function vcCreateRepository(body) {
  try {
    const { data } = await axiosInstance.post(VC.REPOS_CREATE, body);
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to create repository.",
      "apiErrors.failed_to_create_repository",
    );
  }
}

export async function vcGetRepository(owner, repo) {
  try {
    const { data } = await axiosInstance.get(VC.REPO_DETAIL(owner, repo));
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load repository.",
      "apiErrors.failed_to_load_repository",
    );
  }
}

export async function vcGetRepositoryTree(owner, repo, params = {}) {
  try {
    const { data } = await axiosInstance.get(VC.REPO_TREE(owner, repo, params));
    return data;
  } catch (err) {
    throwApiError(err, "Failed to load tree.", "apiErrors.failed_to_load_tree");
  }
}

export async function vcGetRepositoryContents(owner, repo, path, params = {}) {
  try {
    const { data } = await axiosInstance.get(
      VC.REPO_CONTENTS(owner, repo, path, params),
    );
    return data;
  } catch (err) {
    throwApiError(
      err,
      "Failed to load contents.",
      "apiErrors.failed_to_load_contents",
    );
  }
}
