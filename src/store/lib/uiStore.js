import { create } from "zustand";

export const useUIStore = create((set, get) => ({
  // Notification state
  notification: null,

  // Modal states
  modals: {},

  // Loading states for various operations
  loadingStates: {},

  // Actions
  showNotification: (message, type = "info", duration = 3000) => {
    set({ notification: { message, type, id: Date.now() } });

    if (duration > 0) {
      setTimeout(() => {
        const { notification } = get();
        if (notification?.id === get().notification?.id) {
          set({ notification: null });
        }
      }, duration);
    }
  },

  hideNotification: () => set({ notification: null }),

  showSuccess: (message, duration = 3000) => {
    get().showNotification(message, "success", duration);
  },

  showError: (message, duration = 5000) => {
    get().showNotification(message, "error", duration);
  },

  showWarning: (message, duration = 4000) => {
    get().showNotification(message, "warning", duration);
  },

  showInfo: (message, duration = 3000) => {
    get().showNotification(message, "info", duration);
  },

  // Modal management
  openModal: (modalId, data = null) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: { isOpen: true, data } },
    }));
  },

  closeModal: (modalId) => {
    set((state) => ({
      modals: { ...state.modals, [modalId]: { isOpen: false, data: null } },
    }));
  },

  isModalOpen: (modalId) => {
    return get().modals[modalId]?.isOpen || false;
  },

  getModalData: (modalId) => {
    return get().modals[modalId]?.data || null;
  },

  // Loading state management
  setLoading: (key, isLoading) => {
    set((state) => ({
      loadingStates: { ...state.loadingStates, [key]: isLoading },
    }));
  },

  isLoading: (key) => {
    return get().loadingStates[key] || false;
  },

  // Clear all UI state
  clearAll: () => {
    set({
      notification: null,
      modals: {},
      loadingStates: {},
    });
  },
}));
