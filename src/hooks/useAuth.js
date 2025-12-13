import { useMutation } from "@tanstack/react-query";
import {
  loginApi,
  signupApi,
  forgotPasswordApi,
  verifyOTPApi,
  resetPasswordApi,
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
