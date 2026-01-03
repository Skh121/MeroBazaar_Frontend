import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useWishlistStore = create((set, get) => ({
  // Wishlist data
  wishlist: null,
  wishlistCount: 0,
  loading: false,
  activeCategory: "All Items",

  // Actions
  setWishlist: (wishlist) => {
    set({
      wishlist,
      wishlistCount: wishlist?.products?.length || 0,
    });
  },

  setWishlistCount: (count) => set({ wishlistCount: count }),

  setLoading: (loading) => set({ loading }),

  setActiveCategory: (category) => set({ activeCategory: category }),

  // API Actions
  fetchWishlist: async (token) => {
    if (!token) return;
    try {
      set({ loading: true });
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().setWishlist(response.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      set({ loading: false });
    }
  },

  fetchWishlistCount: async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/wishlist/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ wishlistCount: response.data.count || 0 });
    } catch (err) {
      console.error("Failed to fetch wishlist count:", err);
    }
  },

  addToWishlist: async (token, productId) => {
    if (!token) return { success: false, message: "Please login first" };
    try {
      const response = await axios.post(
        `${API_URL}/wishlist`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      get().setWishlist(response.data);
      return { success: true };
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to add to wishlist",
      };
    }
  },

  removeFromWishlist: async (token, productId) => {
    if (!token) return;
    try {
      const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      get().setWishlist(response.data);
      return { success: true };
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to remove from wishlist",
      };
    }
  },

  toggleWishlist: async (token, productId) => {
    const { wishlist } = get();
    const isInWishlist = wishlist?.products?.some((p) => p._id === productId);

    if (isInWishlist) {
      return get().removeFromWishlist(token, productId);
    } else {
      return get().addToWishlist(token, productId);
    }
  },

  isInWishlist: (productId) => {
    const { wishlist } = get();
    return wishlist?.products?.some((p) => p._id === productId) || false;
  },

  clearWishlist: () => {
    set({
      wishlist: null,
      wishlistCount: 0,
      activeCategory: "All Items",
    });
  },

  // Get filtered products
  getFilteredProducts: () => {
    const { wishlist, activeCategory } = get();
    if (activeCategory === "All Items") {
      return wishlist?.products || [];
    }
    return wishlist?.products?.filter((p) => p.category === activeCategory) || [];
  },
}));
