// src/store/auth/authStore.js
import { create } from "zustand";
import { loginApi, signupApi } from "../api/authApi";
import { saveToken, clearToken } from "../../utils/token";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null });

      const data = await loginApi({ email, password });

      saveToken(data.token);

      set({
        user: {
          id: data._id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      });

      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Login failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (fullName, email, password) => {
    try {
      set({ loading: true, error: null });

      const data = await signupApi({ fullName, email, password });

      saveToken(data.token);

      set({
        user: {
          id: data._id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        },
        token: data.token,
      });

      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || "Signup failed" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    clearToken();
    set({ user: null, token: null });
  },
}));
