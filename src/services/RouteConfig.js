const url = "http://localhost:5000";

export const ROUTES = {
  USER: {
    GETBYID: (id) => `${url}/users/${id}`,
    GETALL: `${url}/users`,
    DELETE: (id) => `${url}/users/${id}`,
    UPDATE: (id) => `${url}/users/${id}`,
    LOGIN: `${url}/login`,
    SIGNUP: `${url}/users`,
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

