import axiosInstance from "./axiosConfig";
import { ROUTES as API_URL } from "./RouteConfig";

export const login = async (formData) => {
  try {
    const response = await axiosInstance.post(API_URL.USER.LOGIN, formData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};

export const signup = async (formData) => {
  try {
    const response = await axiosInstance.post(API_URL.USER.SIGNUP, formData);
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message);
  }
};
