// src/store/auth/authApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const loginApi = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

export const signupApi = async (data) => {
  const res = await axios.post(`${API_URL}/signup`, data);
  return res.data;
};
