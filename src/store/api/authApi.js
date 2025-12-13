// src/store/auth/authApi.js
import axios from "axios";

export const loginApi = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
    data
  );
  return res.data;
};

export const signupApi = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
    data
  );
  return res.data;
};

export const forgotPasswordApi = async (email) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`,
    { email }
  );
  return res.data;
};

export const verifyOTPApi = async (email, otp) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`,
    { email, otp }
  );
  return res.data;
};

export const resetPasswordApi = async (email, otp, newPassword) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`,
    { email, otp, newPassword }
  );
  return res.data;
};
