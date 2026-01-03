import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useProfileStore = create((set, get) => ({
  // Profile data
  personalInfo: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  },
  addresses: [],
  orders: [],

  // UI state
  activeTab: "personal",
  loading: false,
  saving: false,
  ordersLoading: false,
  message: { type: "", text: "" },

  // New address form
  newAddress: {
    label: "Home",
    street: "",
    city: "",
    district: "",
    province: "",
    isDefault: false,
  },

  // Security form
  security: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  setLoading: (loading) => set({ loading }),

  setSaving: (saving) => set({ saving }),

  setMessage: (message) => set({ message }),

  clearMessage: () => set({ message: { type: "", text: "" } }),

  setPersonalInfo: (info) => set({ personalInfo: info }),

  updatePersonalInfoField: (field, value) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, [field]: value },
    })),

  setAddresses: (addresses) => set({ addresses }),

  setOrders: (orders) => set({ orders }),

  setNewAddress: (address) => set({ newAddress: address }),

  updateNewAddressField: (field, value) =>
    set((state) => ({
      newAddress: { ...state.newAddress, [field]: value },
    })),

  resetNewAddress: () =>
    set({
      newAddress: {
        label: "Home",
        street: "",
        city: "",
        district: "",
        province: "",
        isDefault: false,
      },
    }),

  setSecurity: (security) => set({ security }),

  updateSecurityField: (field, value) =>
    set((state) => ({
      security: { ...state.security, [field]: value },
    })),

  resetSecurity: () =>
    set({
      security: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    }),

  // Initialize from user data
  initFromUser: (user) => {
    if (user) {
      const names = user.fullName?.split(" ") || ["", ""];
      set({
        personalInfo: {
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          email: user.email || "",
          phone: user.phone || "",
          dateOfBirth: user.dateOfBirth || "",
          gender: user.gender || "",
        },
      });
    }
  },

  // API Actions
  fetchProfile: async (token) => {
    if (!token) return;
    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      const names = data.fullName?.split(" ") || ["", ""];
      set({
        personalInfo: {
          firstName: names[0] || "",
          lastName: names.slice(1).join(" ") || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          gender: data.gender || "",
        },
        addresses: data.addresses || [],
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async (token) => {
    if (!token) return;
    try {
      set({ ordersLoading: true });
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ orders: response.data });
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      set({ ordersLoading: false });
    }
  },

  savePersonalInfo: async (token, setUser, user) => {
    const { personalInfo } = get();
    try {
      set({ saving: true, message: { type: "", text: "" } });

      const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

      await axios.put(
        `${API_URL}/users/profile`,
        {
          fullName,
          phone: personalInfo.phone,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update auth store user
      if (setUser && user) {
        setUser({ ...user, fullName, token });
      }

      set({ message: { type: "success", text: "Profile updated successfully!" } });
      return { success: true };
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      set({ message: { type: "error", text: errorMsg } });
      return { success: false, message: errorMsg };
    } finally {
      set({ saving: false });
    }
  },

  saveAddress: async (token) => {
    const { newAddress } = get();
    try {
      set({ saving: true, message: { type: "", text: "" } });

      await axios.post(`${API_URL}/users/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });

      get().resetNewAddress();
      await get().fetchProfile(token);

      set({ message: { type: "success", text: "Address added successfully!" } });
      return { success: true };
    } catch (err) {
      console.error("Failed to add address:", err);
      const errorMsg = err.response?.data?.message || "Failed to add address";
      set({ message: { type: "error", text: errorMsg } });
      return { success: false, message: errorMsg };
    } finally {
      set({ saving: false });
    }
  },

  changePassword: async (token) => {
    const { security } = get();

    if (security.newPassword !== security.confirmPassword) {
      set({ message: { type: "error", text: "Passwords do not match" } });
      return { success: false, message: "Passwords do not match" };
    }

    try {
      set({ saving: true, message: { type: "", text: "" } });

      await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      get().resetSecurity();
      set({ message: { type: "success", text: "Password changed successfully!" } });
      return { success: true };
    } catch (err) {
      console.error("Failed to change password:", err);
      const errorMsg = err.response?.data?.message || "Failed to change password";
      set({ message: { type: "error", text: errorMsg } });
      return { success: false, message: errorMsg };
    } finally {
      set({ saving: false });
    }
  },

  clearProfile: () => {
    set({
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
      },
      addresses: [],
      orders: [],
      activeTab: "personal",
      message: { type: "", text: "" },
    });
  },
}));
