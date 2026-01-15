import { useMutation, useQuery } from "@tanstack/react-query";
import showToast from "../utils/customToast";
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

// Helper to build full avatar URL from relative path
const buildAvatarUrl = (avatar) => {
  if (!avatar) return null;
  // If already a full URL (Google avatar or already processed), return as-is
  if (avatar.startsWith("http")) return avatar;
  // Build full URL from relative path
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
    "http://localhost:5000";
  return `${baseUrl}${avatar}`;
};

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
        avatar: buildAvatarUrl(data.avatar),
        authProvider: data.authProvider,
        token: data.token,
      });
      showToast.success("Login Successful!", `Welcome back, ${data.fullName}!`);
    },
    onError: (error) => {
      showToast.error(
        "Login Failed",
        error.response?.data?.message || "Unable to sign in. Please try again."
      );
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: (userData) => signupApi(userData),
    onSuccess: () => {
      showToast.success(
        "Account Created!",
        "Your account has been created. Please login to continue."
      );
    },
    onError: (error) => {
      showToast.error(
        "Signup Failed",
        error.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email) => forgotPasswordApi(email),
    onSuccess: () => {
      showToast.success(
        "OTP Sent!",
        "Please check your email for the verification code."
      );
    },
    onError: (error) => {
      showToast.error(
        "Failed to Send OTP",
        error.response?.data?.message || "Unable to send OTP. Please try again."
      );
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: ({ email, otp }) => verifyOTPApi(email, otp),
    onSuccess: () => {
      showToast.success(
        "OTP Verified!",
        "Your verification code has been confirmed."
      );
    },
    onError: (error) => {
      showToast.error(
        "Invalid OTP",
        error.response?.data?.message || "The verification code is incorrect."
      );
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ email, otp, newPassword }) =>
      resetPasswordApi(email, otp, newPassword),
    onSuccess: () => {
      showToast.success(
        "Password Reset!",
        "Your password has been reset successfully."
      );
    },
    onError: (error) => {
      showToast.error(
        "Reset Failed",
        error.response?.data?.message ||
          "Unable to reset password. Please try again."
      );
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
        avatar: buildAvatarUrl(data.avatar),
        authProvider: data.authProvider,
        token: data.token,
      });
      if (data.isLinked) {
        showToast.success(
          "Account Linked!",
          "Your Google account has been linked successfully."
        );
      } else if (data.isNewUser) {
        showToast.success(
          "Account Created!",
          "Your account has been created with Google."
        );
      } else {
        showToast.success(
          "Login Successful!",
          `Welcome back, ${data.fullName}!`
        );
      }
    },
    onError: (error) => {
      showToast.error(
        "Google Sign-in Failed",
        error.response?.data?.message || "Unable to sign in with Google."
      );
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
      showToast.success(
        "Login Successful!",
        "Welcome to your vendor dashboard."
      );
    },
    onError: (error) => {
      showToast.error(
        "Login Failed",
        error.response?.data?.message || "Unable to sign in. Please try again."
      );
    },
  });
};

export const useVendorSignup = () => {
  return useMutation({
    mutationFn: (vendorData) => vendorSignupApi(vendorData),
    onSuccess: () => {
      showToast.success(
        "Registration Submitted!",
        "Your vendor registration has been submitted for review."
      );
    },
    onError: (error) => {
      showToast.error(
        "Registration Failed",
        error.response?.data?.message ||
          "Unable to submit registration. Please try again."
      );
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
      showToast.success("Login Successful!", "Welcome to the admin dashboard.");
    },
    onError: (error) => {
      showToast.error(
        "Login Failed",
        error.response?.data?.message || "Unable to sign in. Please try again."
      );
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
      showToast.success(
        "Vendor Approved!",
        "The vendor has been approved successfully."
      );
    },
    onError: (error) => {
      showToast.error(
        "Approval Failed",
        error.response?.data?.message ||
          "Unable to approve vendor. Please try again."
      );
    },
  });
};

export const useRejectVendor = () => {
  const token = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: (vendorId) => rejectVendorApi(vendorId, token),
    onSuccess: () => {
      showToast.success(
        "Vendor Rejected",
        "The vendor application has been rejected."
      );
    },
    onError: (error) => {
      showToast.error(
        "Rejection Failed",
        error.response?.data?.message ||
          "Unable to reject vendor. Please try again."
      );
    },
  });
};
