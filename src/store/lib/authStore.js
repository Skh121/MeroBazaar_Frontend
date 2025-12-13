// src/store/auth/authStore.js
import { create } from "zustand";
import { clearToken } from "../../utils/token";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  setUser: (userData) => {
    set({
      user: {
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
      },
      token: userData.token,
    });
  },

  logout: () => {
    clearToken();
    set({ user: null, token: null });
  },
}));
