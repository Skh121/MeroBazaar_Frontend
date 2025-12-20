import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const token = localStorage.getItem("auth_token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber && token) {
      fetchOrder();
    }
  }, [orderNumber, token]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/orders/number/${orderNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder(response.data);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="text-center px-4">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-merogreen" strokeWidth={1.5} />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500 mb-4">Thank you for your purchase</p>

          {/* Total */}
          {order && (
            <>
              <p className="text-xl font-bold text-merogreen mb-4">
                Total: Rs.{order.total}
              </p>

              {/* Order Number */}
              <p className="text-gray-600 mb-2">
                Order Confirmation: {order.orderNumber}
              </p>
            </>
          )}

          <p className="text-gray-500 mb-8">
            You will receive an email confirmation shortly
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="px-8 py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold hover:bg-green-50 transition"
            >
              View Orders
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
