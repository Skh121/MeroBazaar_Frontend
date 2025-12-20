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

// Vendor Auth APIs
export const vendorLoginApi = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/auth/login`,
    data
  );
  return res.data;
};

export const vendorSignupApi = async (data) => {
  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/vendor/auth/register`,
    data
  );
  return res.data;
};

// Admin Auth API
export const adminLoginApi = async (data) => {
  // Fixed admin credentials check (for now)
  const ADMIN_USERNAME = "admin@merobazaar.com";
  const ADMIN_PASSWORD = "admin123";

  if (data.email === ADMIN_USERNAME && data.password === ADMIN_PASSWORD) {
    return {
      _id: "admin_001",
      fullName: "System Admin",
      email: ADMIN_USERNAME,
      role: "admin",
      token: "admin_token_" + Date.now(),
    };
  }
  throw { response: { data: { message: "Invalid admin credentials" } } };
};

// Admin Vendor Management APIs
export const getVendorsApi = async (token) => {
  const res = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL}/admin/vendors`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const approveVendorApi = async (vendorId, token) => {
  const res = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/vendors/${vendorId}/approve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const rejectVendorApi = async (vendorId, token) => {
  const res = await axios.patch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/vendors/${vendorId}/reject`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};
