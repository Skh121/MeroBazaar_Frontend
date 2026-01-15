import { create } from "zustand";
import axios from "axios";
import showToast from "../../utils/customToast";

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
  uploadingAvatar: false,
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

      const fullName =
        `${personalInfo.firstName} ${personalInfo.lastName}`.trim();

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

      showToast.success(
        "Profile Updated!",
        "Your profile has been updated successfully."
      );
      return { success: true };
    } catch (err) {
      console.error("Failed to update profile:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      showToast.error("Update Failed", errorMsg);
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

      showToast.success(
        "Address Added!",
        "Your address has been added successfully."
      );
      return { success: true };
    } catch (err) {
      console.error("Failed to add address:", err);
      const errorMsg = err.response?.data?.message || "Failed to add address";
      showToast.error("Add Address Failed", errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      set({ saving: false });
    }
  },

  changePassword: async (token) => {
    const { security } = get();

    if (security.newPassword !== security.confirmPassword) {
      showToast.error(
        "Password Mismatch",
        "New password and confirm password do not match."
      );
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
      showToast.success(
        "Password Changed!",
        "Your password has been changed successfully."
      );
      return { success: true };
    } catch (err) {
      console.error("Failed to change password:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to change password";
      showToast.error("Password Change Failed", errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      set({ saving: false });
    }
  },

  uploadAvatar: async (token, file, updateUser) => {
    try {
      set({ uploadingAvatar: true, message: { type: "", text: "" } });

      const formData = new FormData();
      formData.append("avatar", file);

      const response = await axios.post(`${API_URL}/users/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Build full avatar URL
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ||
        "http://localhost:5000";
      const avatarUrl = `${baseUrl}${response.data.avatar}`;

      // Update auth store with new avatar
      if (updateUser) {
        updateUser({ avatar: avatarUrl });
      }

      showToast.success(
        "Avatar Updated!",
        "Your profile picture has been updated."
      );
      return { success: true, avatar: avatarUrl };
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to upload profile picture";
      showToast.error("Upload Failed", errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      set({ uploadingAvatar: false });
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
