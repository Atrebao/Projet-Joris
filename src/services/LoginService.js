import axiosInstance from "./axios";

export const loginUser = async (credentials) => {
  return await axiosInstance.post("/auth/signin", credentials);
};
  