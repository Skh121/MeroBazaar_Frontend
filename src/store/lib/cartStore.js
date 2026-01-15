import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import showToast from "../../utils/customToast";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export const useCartStore = create(
  persist(
    (set, get) => ({
      // Cart data
      cart: null,
      cartCount: 0,
      loading: false,
      updating: false,

      // Checkout state
      step: 1,
      shippingAddress: {
        fullName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postalCode: "",
      },
      paymentMethod: "esewa",
      placingOrder: false,

      // Actions
      setCart: (cart) => {
        set({
          cart,
          cartCount:
            cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        });
      },

      setCartCount: (count) => set({ cartCount: count }),

      setLoading: (loading) => set({ loading }),

      setUpdating: (updating) => set({ updating }),

      setStep: (step) => set({ step }),

      setShippingAddress: (address) => set({ shippingAddress: address }),

      updateShippingField: (field, value) =>
        set((state) => ({
          shippingAddress: { ...state.shippingAddress, [field]: value },
        })),

      setPaymentMethod: (method) => set({ paymentMethod: method }),

      setPlacingOrder: (placingOrder) => set({ placingOrder }),

      // API Actions
      fetchCart: async (token) => {
        if (!token) return;
        try {
          set({ loading: true });
          const response = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          get().setCart(response.data);
        } catch (err) {
          console.error("Failed to fetch cart:", err);
        } finally {
          set({ loading: false });
        }
      },

      fetchCartCount: async (token) => {
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/cart/count`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ cartCount: response.data.count || 0 });
        } catch (err) {
          console.error("Failed to fetch cart count:", err);
        }
      },

      addToCart: async (token, productId, quantity = 1) => {
        if (!token) {
          showToast.error(
            "Login Required",
            "Please login to add items to cart."
          );
          return { success: false, message: "Please login first" };
        }
        try {
          set({ updating: true });
          const response = await axios.post(
            `${API_URL}/cart/add`,
            { productId, quantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          get().setCart(response.data);
          showToast.success(
            "Added to Cart!",
            "Item has been added to your cart."
          );
          return { success: true };
        } catch (err) {
          console.error("Failed to add to cart:", err);
          const errorMsg =
            err.response?.data?.message || "Failed to add to cart";
          showToast.error("Cart Error", errorMsg);
          return {
            success: false,
            message: errorMsg,
          };
        } finally {
          set({ updating: false });
        }
      },

      updateQuantity: async (token, productId, newQuantity) => {
        if (!token) return;
        try {
          set({ updating: true });
          const response = await axios.put(
            `${API_URL}/cart/update`,
            { productId, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          get().setCart(response.data);
          return { success: true };
        } catch (err) {
          console.error("Failed to update quantity:", err);
          const errorMsg =
            err.response?.data?.message || "Failed to update quantity";
          showToast.error("Update Failed", errorMsg);
          return {
            success: false,
            message: errorMsg,
          };
        } finally {
          set({ updating: false });
        }
      },

      removeItem: async (token, productId) => {
        if (!token) return;
        try {
          set({ updating: true });
          const response = await axios.delete(
            `${API_URL}/cart/remove/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          get().setCart(response.data);
          showToast.success(
            "Item Removed",
            "Item has been removed from your cart."
          );
        } catch (err) {
          console.error("Failed to remove item:", err);
          showToast.error("Remove Failed", "Unable to remove item from cart.");
        } finally {
          set({ updating: false });
        }
      },

      clearCart: () => {
        set({
          cart: null,
          cartCount: 0,
          step: 1,
          shippingAddress: {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            postalCode: "",
          },
          paymentMethod: "esewa",
          placingOrder: false,
        });
      },

      // Initialize shipping from user data
      initShippingFromUser: (user) => {
        if (user) {
          set((state) => ({
            shippingAddress: {
              ...state.shippingAddress,
              fullName: user.fullName || "",
              email: user.email || "",
            },
          }));
        }
      },

      // Calculate totals
      getCartTotals: () => {
        const { cart } = get();
        const subtotal =
          cart?.items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) || 0;
        const shipping = subtotal >= 1000 ? 0 : 100;
        const tax = Math.round(subtotal * 0.05 * 100) / 100; // Round to 2 decimal places
        const total = Math.round((subtotal + shipping + tax) * 100) / 100; // Round to 2 decimal places
        return {
          subtotal: Math.round(subtotal * 100) / 100,
          shipping,
          tax,
          total,
        };
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        shippingAddress: state.shippingAddress,
        paymentMethod: state.paymentMethod,
      }),
    }
  )
);
