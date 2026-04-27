import axiosInstance from "./axiosConfig";
import { ROUTES as API_URL } from "./RouteConfig";

function normalizeEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

/**
 * Login via backend API POST /api/v1/auth/login
 */
export const login = async (formData) => {
  const username_or_email = normalizeEmail(
    formData.email || formData.username_or_email,
  );
  const password = formData.password;
  const remember_me = formData.remember_me || false;

  if (!username_or_email || !password) {
    throw new Error("Email/username and password are required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.LOGIN, {
      username_or_email,
      password,
      remember_me,
    });

    return data; // {access_token, refresh_token, user, ...}
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Login failed";
    throw new Error(msg);
  }
};

/**
 * Signup via backend API POST /api/v1/auth/signup
 * Maps fullName -> first_name + last_name, generates username from email
 */
export const signup = async (formData) => {
  const fullName = String(formData.fullName ?? "").trim();
  const email = normalizeEmail(formData.email);
  const password = formData.password;
  // const role = formData.role || "user"; // unused
  const phone_number = formData.phone_number || "";

  if (!fullName || !email || !password) {
    throw new Error("Full name, email, and password are required.");
  }

  if (password.length < 8) {
    throw new Error(
      "Password must be at least 8 characters with uppercase, number, special char.",
    );
  }

  // Derive first_name, last_name, username
  const nameParts = fullName.split(" ").filter(Boolean);
  const first_name = nameParts[0] || "";
  const last_name = nameParts.slice(1).join(" ") || "";
  const username = email.split("@")[0].replace(/[^a-z0-9]/gi, "");

  const payload = {
    username,
    email,
    password,
    first_name,
    last_name,
    phone_number,
    terms_agreed: true,
    privacy_agreed: true,
  };

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.SIGNUP, payload);
    return data; // {access_token, refresh_token, user, ...}
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Signup failed";
    throw new Error(msg);
  }
};

/**
 * Google OAuth login POST /api/v1/auth/google
 */
export const googleAuth = async (formData) => {
  const { id_token, device_id } = formData;
  if (!id_token) {
    throw new Error("Google ID token is required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.GOOGLE, {
      id_token,
      device_id:
        device_id ||
        `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Google auth failed";
    throw new Error(msg);
  }
};

/**
 * Refresh token POST /api/v1/auth/refresh-token
 */
export const refreshToken = async (refresh_token) => {
  if (!refresh_token) {
    throw new Error("Refresh token is required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.REFRESH_TOKEN, {
      refresh_token,
    });
    return data;
  } catch (err) {
    const msg =
      err.response?.data?.message || err.message || "Token refresh failed";
    throw new Error(msg);
  }
};

/**
 * Logout POST /api/v1/auth/logout
 */
export const logout = async () => {
  try {
    await axiosInstance.post(API_URL.AUTH.LOGOUT);
  } catch (err) {
    // Logout always succeeds on client, ignore server errors
    console.warn(
      "Logout server error:",
      err.response?.data?.message || err.message,
    );
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

// Department API functions
export const getDepartments = async () => {
  try {
    const response = await axiosInstance.get(API_URL.DEPARTMENT.GETALL);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const getDepartmentById = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.DEPARTMENT.GETBYID(id));
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const createDepartment = async (departmentData) => {
  try {
    const response = await axiosInstance.post(
      API_URL.DEPARTMENT.CREATE,
      departmentData,
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const updateDepartment = async (id, departmentData) => {
  try {
    const response = await axiosInstance.put(
      API_URL.DEPARTMENT.UPDATE(id),
      departmentData,
    );
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const deleteDepartment = async (id) => {
  try {
    await axiosInstance.delete(API_URL.DEPARTMENT.DELETE(id));
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

/**
 * Forgot password POST /api/v1/auth/forgot-password
 */
export const forgotPassword = async (email) => {
  if (!email) {
    throw new Error("Email is required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.FORGOT_PASSWORD, { email });
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Forgot password failed";
    throw new Error(msg);
  }
};

/**
 * Reset password POST /api/v1/auth/reset-password
 */
export const resetPassword = async (formData) => {
  const { reset_token, new_password, confirm_password } = formData;
  if (!reset_token || !new_password || new_password !== confirm_password) {
    throw new Error("Invalid reset token or passwords don't match.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.RESET_PASSWORD, formData);
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Reset password failed";
    throw new Error(msg);
  }
};

/**
 * Verify email POST /api/v1/auth/verify-email
 */
export const verifyEmail = async (verification_token) => {
  if (!verification_token) {
    throw new Error("Verification token is required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.VERIFY_EMAIL, { verification_token });
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Email verification failed";
    throw new Error(msg);
  }
};

/**
 * Resend verification email POST /api/v1/auth/resend-verification-email
 */
export const resendVerificationEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.RESEND_VERIFICATION, { email });
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Resend verification failed";
    throw new Error(msg);
  }
};

/**
 * Change password POST /api/v1/auth/change-password/{userId}
 */
export const changePassword = async (userId, formData) => {
  const { current_password, new_password, confirm_password } = formData;
  if (!current_password || !new_password || new_password !== confirm_password) {
    throw new Error("Invalid passwords.");
  }

  try {
    const { data } = await axiosInstance.post(API_URL.AUTH.CHANGE_PASSWORD(userId), formData);
    return data;
  } catch (err) {
    const msg = err.response?.data?.message || err.message || "Change password failed";
    throw new Error(msg);
  }
};
