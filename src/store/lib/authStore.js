// src/store/auth/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearToken, saveToken } from "../../utils/token";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (userData) => {
        // Sync token with localStorage for backward compatibility
        if (userData.token) {
          saveToken(userData.token);
        }
        set({
          user: {
            id: userData.id,
            fullName: userData.fullName,
            email: userData.email,
            role: userData.role,
            vendorData: userData.vendorData || null,
            phone: userData.phone || null,
            dateOfBirth: userData.dateOfBirth || null,
            gender: userData.gender || null,
            avatar: userData.avatar || null,
            createdAt: userData.createdAt || null,
          },
          token: userData.token,
        });
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      logout: () => {
        clearToken();
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Sync localStorage with Zustand state on app load
        if (state?.token) {
          saveToken(state.token);
        }
      },
    }
  )
);
