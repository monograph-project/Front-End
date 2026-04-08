import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === "401") {
      window.location.href = "/signup";
    }

    return Promise.reject(error);
  },
);
export default axiosInstance;
