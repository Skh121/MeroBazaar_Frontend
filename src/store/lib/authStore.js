// src/store/auth/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearToken } from "../../utils/token";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (userData) => {
        set({
          user: {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            vendorData: userData.vendorData || null,
          },
          token: userData.token,
        });
      },

      logout: () => {
        clearToken();
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
