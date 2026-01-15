import axios from "axios";
import { useAuthStore } from "../store/lib/authStore";

// Setup axios interceptor to handle suspended accounts
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if the error is due to suspended account
      if (error.response?.status === 403 && error.response?.data?.suspended) {
        const reason =
          error.response.data.reason || "Your account has been suspended.";

        // Clear auth state and log out user
        useAuthStore.getState().logout();

        // Show alert to user
        alert(
          `Account Suspended: ${reason}\n\nYou have been logged out. Please contact support for assistance.`
        );

        // Redirect to login page
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );
};
