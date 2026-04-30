const url = "http://localhost:5000";

export const ROUTES = {
  USER: {
    GETBYID: (id) => `${url}/users/${id}`,
    GETALL: `${url}/users`,
    DELETE: (id) => `${url}/users/${id}`,
    UPDATE: (id) => `${url}/users/${id}`,
    LOGIN: `${url}/auth/login`,
    SIGNUP: `${url}/auth/signup`,
  },
  AUTH: {
    LOGIN: `${url}/auth/login`,
    SIGNUP: `${url}/auth/signup`,
    GOOGLE: `${url}/auth/google`,
    REFRESH_TOKEN: `${url}/auth/refresh-token`,
    LOGOUT: `${url}/auth/logout`,
    CHANGE_PASSWORD: (userId) => `${url}/auth/change-password/${userId}`,
    FORGOT_PASSWORD: `${url}/auth/forgot-password`,
    RESET_PASSWORD: `${url}/auth/reset-password`,
    VERIFY_EMAIL: `${url}/auth/verify-email`,
    RESEND_VERIFICATION: `${url}/auth/resend-verification-email`,
  },
  STUDENT: {
    GETBYID: (id) => `${url}/students/${id}`,
    GETALL: `${url}/students`,
    CREATE: `${url}/students`,
    UPDATE: (id) => `${url}/students/${id}`,
    DELETE: (id) => `${url}/students/${id}`,
  },
  DEPARTMENT: {
    GETBYID: (id) => `${url}/departments/${id}`,
    GETALL: `${url}/departments`,
    CREATE: `${url}/departments`,
    UPDATE: (id) => `${url}/departments/${id}`,
    DELETE: (id) => `${url}/departments/${id}`,
  },
};
