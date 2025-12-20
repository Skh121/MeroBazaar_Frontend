import { useMutation, useQuery } from "@tanstack/react-query";
import {
  loginApi,
  signupApi,
  forgotPasswordApi,
  verifyOTPApi,
  resetPasswordApi,
  vendorLoginApi,
  vendorSignupApi,
  adminLoginApi,
  getVendorsApi,
  approveVendorApi,
  rejectVendorApi,
} from "../store/api/authApi";
import { saveToken, clearToken } from "../utils/token";
import { useAuthStore } from "../store/lib/authStore";

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials) => loginApi(credentials),
    onSuccess: (data) => {
      saveToken(data.token);
      setUser({
        id: data._id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        token: data.token,
      });
    },
  });
};

export const useSignup = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (userData) => signupApi(userData),
    onSuccess: (data) => {
      saveToken(data.token);
      setUser({
        id: data._id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        token: data.token,
      });
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => forgotPasswordApi(email),
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }) => verifyOTPApi(email, otp),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, newPassword }) =>
      resetPasswordApi(email, otp, newPassword),
  });
};

export const useLogout = () => {
  const logout = useAuthStore((state) => state.logout);

  return () => {
    clearToken();
    logout();
  };
};

// Vendor Auth Hooks
export const useVendorLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials) => vendorLoginApi(credentials),
    onSuccess: (data) => {
      saveToken(data.token);
      setUser({
        id: data._id,
        fullName: data.businessName || data.ownerName,
        email: data.email,
        role: "vendor",
        token: data.token,
        vendorData: data,
      });
    },
  });
};

export const useVendorSignup = () => {
  return useMutation({
    mutationFn: (vendorData) => vendorSignupApi(vendorData),
  });
};

// Admin Auth Hooks
export const useAdminLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials) => adminLoginApi(credentials),
    onSuccess: (data) => {
      saveToken(data.token);
      setUser({
        id: data._id,
        fullName: data.fullName,
        email: data.email,
        role: "admin",
        token: data.token,
      });
    },
  });
};

// Admin Vendor Management Hooks
export const useGetVendors = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["vendors"],
    queryFn: () => getVendorsApi(token),
    enabled: !!token,
  });
};

export const useApproveVendor = () => {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (vendorId) => approveVendorApi(vendorId, token),
  });
};

export const useRejectVendor = () => {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (vendorId) => rejectVendorApi(vendorId, token),
  });
};
