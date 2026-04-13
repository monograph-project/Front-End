import axiosInstance from "./axiosConfig";
import { ROUTES as API_URL } from "./RouteConfig";

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

/**
 * Simulated login against json-server `users` collection.
 * Uses GET /users?email=… then verifies password (json-server filter).
 */
export const login = async (formData) => {
  const email = normalizeEmail(formData.email);
  const password = formData.password;

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  try {
    const { data } = await axiosInstance.get(API_URL.USER.GETALL, {
      params: { email },
    });

    const list = Array.isArray(data) ? data : [];
    const user = list.find(
      (u) => normalizeEmail(u.email) === email && u.password === password,
    );

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const { password: _p, ...safeUser } = user;
    return { user: safeUser, token: `fake-jwt-${user.id}` };
  } catch (err) {
    if (err.message === "Invalid email or password.") {
      throw err;
    }
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Cannot reach the server. Start json-server (npm run server).";
    throw new Error(msg);
  }
};

/**
 * Register a new user via POST /users. Checks duplicate email with GET /users?email=…
 */
export const signup = async (formData) => {
  const fullName = String(formData.fullName ?? "").trim();
  const email = normalizeEmail(formData.email);
  const password = formData.password;
  const role = formData.role || "user";

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }

  try {
    const { data: existing } = await axiosInstance.get(API_URL.USER.GETALL, {
      params: { email },
    });

    if (Array.isArray(existing) && existing.length > 0) {
      throw new Error("An account with this email already exists.");
    }

    const payload = {
      fullName,
      email,
      password,
      role,
    };

    const { data } = await axiosInstance.post(API_URL.USER.SIGNUP, payload);
    const { password: _p, ...safeUser } = data;
    return safeUser;
  } catch (err) {
    if (
      err.message === "An account with this email already exists." ||
      err.message.startsWith("Full name") ||
      err.message.startsWith("Password must")
    ) {
      throw err;
    }
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Cannot reach the server. Start json-server (npm run server).";
    throw new Error(msg);
  }
};

export const getStudents = async () => {
  try {
    const response = await axiosInstance.get(API_URL.STUDENT.GETALL);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getStudentById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.STUDENT.GETBYID(id));
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const createStudent = async (studentData) => {
  try {
    const response = await axiosInstance.post(
      API_URL.STUDENT.CREATE,
      studentData,
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const updateStudent = async (id, studentData) => {
  try {
    const response = await axiosInstance.put(
      API_URL.STUDENT.UPDATE(id),
      studentData,
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const deleteStudent = async (id) => {
  try {
    await axiosInstance.delete(API_URL.STUDENT.DELETE(id));
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
