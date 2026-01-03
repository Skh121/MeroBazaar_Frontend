import React, { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Minus,
  Plus,
  X,
  ShoppingCart,
  Check,
  Loader2,
  Package,
} from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuthStore } from "../../store/lib/authStore";
import { useCartStore } from "../../store/lib/cartStore";
import { useTracking } from "../../hooks/useTracking";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL?.replace("/api", "") || "http://localhost:5000";
const ESEWA_PAYMENT_URL = import.meta.env.VITE_ESEWA_PAYMENT_URL;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const CartPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  // Tracking hook
  const { trackRemoveFromCart } = useTracking();

  // Cart store
  const {
    cart,
    loading,
    updating,
    step,
    shippingAddress,
    paymentMethod,
    placingOrder,
    setStep,
    setShippingAddress,
    setPaymentMethod,
    setPlacingOrder,
    fetchCart,
    updateQuantity,
    removeItem,
    initShippingFromUser,
    getCartTotals,
  } = useCartStore();

  const [esewaPaymentData, setEsewaPaymentData] = React.useState(null);
  const esewaFormRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCart(token);
  }, [token, fetchCart, navigate]);

  useEffect(() => {
    if (user) {
      initShippingFromUser(user);
    }
  }, [user, initShippingFromUser]);

  // Submit eSewa form when payment data is ready
  useEffect(() => {
    if (esewaPaymentData && esewaFormRef.current) {
      esewaFormRef.current.submit();
    }
  }, [esewaPaymentData]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const result = await updateQuantity(token, productId, newQuantity);
    if (!result.success) {
      alert(result.message);
    }
  };

  const handleRemoveItem = async (productId) => {
    // Track remove from cart event for analytics
    trackRemoveFromCart(productId);
    await removeItem(token, productId);
  };

  const handlePlaceOrder = async () => {
    try {
      setPlacingOrder(true);

      // Step 1: Create the order
      const orderResponse = await axios.post(
        `${API_URL}/orders`,
        { shippingAddress, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order = orderResponse.data;

      // Step 2: Handle payment based on method
      if (paymentMethod === "esewa") {
        // Store order ID for failure handling
        localStorage.setItem("pending_order_id", order._id);

        // Initiate eSewa payment
        const paymentResponse = await axios.post(
          `${API_URL}/payment/esewa/initiate`,
          { orderId: order._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (paymentResponse.data.success) {
          // Set payment data to trigger form submission
          setEsewaPaymentData(paymentResponse.data.paymentData);
        } else {
          throw new Error("Failed to initiate payment");
        }
      } else {
        // Cash on Delivery - go directly to success page
        navigate(`/order-success/${order.orderNumber}`);
      }
    } catch (err) {
      console.error("Failed to place order:", err);
      alert(err.response?.data?.message || "Failed to place order");
      setPlacingOrder(false);
    }
  };

  const handleShippingChange = (field, value) => {
    setShippingAddress({ ...shippingAddress, [field]: value });
  };

  // Calculate totals using store method
  const { subtotal, shipping, tax, total } = getCartTotals();

  const steps = [
    { number: 1, label: "Cart" },
    { number: 2, label: "Shipping" },
    { number: 3, label: "Payment" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={48} className="text-merogreen animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <h1 className="text-2xl font-medium text-gray-800 mb-6 text-center">
            Shopping Cart
          </h1>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step > s.number
                        ? "bg-merogreen text-white"
                        : step === s.number
                        ? "bg-merogreen text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step > s.number ? <Check size={20} /> : s.number}
                  </div>
                  <span
                    className={`ml-2 font-medium ${
                      step >= s.number ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-0.5 mx-4 ${
                      step > s.number ? "bg-merogreen" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Cart Items */}
          {step === 1 && (
            <>
              {!cart?.items?.length ? (
                <div className="flex items-center justify-center">
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
                    <ShoppingCart
                      size={64}
                      className="text-gray-300 mx-auto mb-4"
                    />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Your cart is empty
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Add some products to your cart to get started.
                    </p>
                    <Link
                      to="/shop"
                      className="inline-block px-6 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Cart Items */}
                  <div className="lg:col-span-2 space-y-4">
                    {cart.items.map((item) => (
                      <div
                        key={item.product._id}
                        className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
                      >
                        {/* Product Image */}
                        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.product.images?.[0] ? (
                            <img
                              src={getImageUrl(item.product.images[0].url)}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={32} className="text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {item.product.vendor?.businessName ||
                                  "MeroBazaar"}
                              </p>
                              <p className="text-merogreen font-semibold mt-1">
                                Rs.{item.price}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product._id)}
                              className="text-gray-400 hover:text-red-500 transition"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product._id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || updating}
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-10 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleUpdateQuantity(
                                    item.product._id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.quantity >= item.product.stock ||
                                  updating
                                }
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Item Total */}
                            <p className="font-semibold text-gray-800">
                              Rs.{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Order Summary
                      </h2>

                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">Rs.{subtotal}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span
                            className={
                              shipping === 0
                                ? "text-merogreen font-medium"
                                : "font-medium"
                            }
                          >
                            {shipping === 0 ? "FREE" : `Rs.${shipping}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tax (5%)</span>
                          <span className="font-medium">Rs.{tax}</span>
                        </div>
                        <div className="border-t pt-3 flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-merogreen text-lg">
                            Rs.{total}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setStep(2)}
                        className="w-full mt-6 py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition"
                      >
                        Proceed to Checkout
                      </button>

                      <Link
                        to="/shop"
                        className="block w-full mt-3 py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold text-center hover:bg-green-50 transition"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                  Shipping Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) =>
                        handleShippingChange("fullName", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={shippingAddress.email}
                        onChange={(e) =>
                          handleShippingChange("email", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          handleShippingChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                        placeholder="+977 9800000000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) =>
                        handleShippingChange("address", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          handleShippingChange("city", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                        placeholder="Kathmandu"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          handleShippingChange("postalCode", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                        placeholder="44600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold hover:bg-green-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={
                      !shippingAddress.fullName ||
                      !shippingAddress.email ||
                      !shippingAddress.phone ||
                      !shippingAddress.address ||
                      !shippingAddress.city ||
                      !shippingAddress.postalCode
                    }
                    className="flex-1 py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "esewa"
                        ? "border-merogreen bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="esewa"
                      checked={paymentMethod === "esewa"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-merogreen"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">Esewa</p>
                      <p className="text-sm text-gray-500">
                        Pay securely with Esewa
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "cod"
                        ? "border-merogreen bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-merogreen"
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-800">
                        Cash on Delivery
                      </p>
                      <p className="text-sm text-gray-500">
                        Pay when you receive
                      </p>
                    </div>
                  </label>
                </div>

                {/* Order Summary */}
                <div className="mt-8">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">Rs.{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span
                        className={
                          shipping === 0
                            ? "text-merogreen font-medium"
                            : "font-medium"
                        }
                      >
                        {shipping === 0 ? "FREE" : `Rs.${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (5%)</span>
                      <span className="font-medium">Rs.{tax}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-merogreen text-lg">
                        Rs.{total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold hover:bg-green-50 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-1 py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Hidden eSewa Payment Form */}
      {esewaPaymentData && (
        <form
          ref={esewaFormRef}
          action={ESEWA_PAYMENT_URL}
          method="POST"
          style={{ display: "none" }}
        >
          <input type="hidden" name="amount" value={esewaPaymentData.amount} />
          <input
            type="hidden"
            name="tax_amount"
            value={esewaPaymentData.tax_amount}
          />
          <input
            type="hidden"
            name="total_amount"
            value={esewaPaymentData.total_amount}
          />
          <input
            type="hidden"
            name="transaction_uuid"
            value={esewaPaymentData.transaction_uuid}
          />
          <input
            type="hidden"
            name="product_code"
            value={esewaPaymentData.product_code}
          />
          <input
            type="hidden"
            name="product_service_charge"
            value={esewaPaymentData.product_service_charge}
          />
          <input
            type="hidden"
            name="product_delivery_charge"
            value={esewaPaymentData.product_delivery_charge}
          />
          <input
            type="hidden"
            name="success_url"
            value={esewaPaymentData.success_url}
          />
          <input
            type="hidden"
            name="failure_url"
            value={esewaPaymentData.failure_url}
          />
          <input
            type="hidden"
            name="signed_field_names"
            value={esewaPaymentData.signed_field_names}
          />
          <input
            type="hidden"
            name="signature"
            value={esewaPaymentData.signature}
          />
        </form>
      )}
    </div>
  );
};

export default CartPage;
