import axiosInstance from "./axiosConfig";
import { ROUTES as API_URL } from "./RouteConfig";

export const login = async (formData) => {
  try {
    const { data: users } = await axiosInstance.get(API_URL.USER.GETALL);
    const user = users.find(
      (u) => u.email === formData.email && u.password === formData.password,
    );
    if (!user) {
      throw new Error("Invalid credentials");
    }
    return { user, token: "fake-jwt-" + user.id };
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
