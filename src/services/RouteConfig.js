const url = import.meta.env.URL;

export const ROUTES = {
  USER: {
    GETBYID: (id) => `${url}/user/${id}`,
    GETALL: `${url}/user`,
    DELETE: (id) => `${url}/user/${id}`,
    UPDATE: (id) => `${url}/user/${id}`,
    LOGIN: `${url}/user`,
    SIGNUP: `${url}/user`,
  },
};
