import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  loginApi,
  signupApi,
  forgotPasswordApi,
  verifyOTPApi,
  resetPasswordApi,
  googleAuthApi,
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
      toast.success(`Welcome back, ${data.fullName}!`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
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
      toast.success("Account created successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Signup failed");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => forgotPasswordApi(email),
    onSuccess: () => {
      toast.success("OTP sent to your email");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }) => verifyOTPApi(email, otp),
    onSuccess: () => {
      toast.success("OTP verified successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Invalid OTP");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, newPassword }) =>
      resetPasswordApi(email, otp, newPassword),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reset password");
    },
  });
};

export const useGoogleAuth = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credential) => googleAuthApi(credential),
    onSuccess: (data) => {
      saveToken(data.token);
      setUser({
        id: data._id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        avatar: data.avatar,
        authProvider: data.authProvider,
        token: data.token,
      });
      if (data.isLinked) {
        toast.success("Google account linked successfully!");
      } else if (data.isNewUser) {
        toast.success("Account created with Google!");
      } else {
        toast.success(`Welcome back, ${data.fullName}!`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Google sign-in failed");
    },
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
      toast.success("Welcome to your vendor dashboard!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Vendor login failed");
    },
  });
};

export const useVendorSignup = () => {
  return useMutation({
    mutationFn: (vendorData) => vendorSignupApi(vendorData),
    onSuccess: () => {
      toast.success("Registration submitted successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
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
      toast.success("Welcome, Admin!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Admin login failed");
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
    onSuccess: () => {
      toast.success("Vendor approved successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to approve vendor");
    },
  });
};

export const useRejectVendor = () => {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (vendorId) => rejectVendorApi(vendorId, token),
    onSuccess: () => {
      toast.success("Vendor rejected");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to reject vendor");
    },
  });
};
