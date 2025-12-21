import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Notify backend about the failure
    const notifyFailure = async () => {
      const token = localStorage.getItem("auth_token");
      const orderId = localStorage.getItem("pending_order_id");

      if (token && orderId) {
        try {
          await axios.post(
            `${API_URL}/payment/esewa/failure`,
            { orderId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (error) {
          console.error("Failed to notify payment failure:", error);
        }
      }

      // Clear the pending order ID
      localStorage.removeItem("pending_order_id");
    };

    notifyFailure();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-4">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-500 mb-6">
            Your payment was not completed. This could be due to:
          </p>
          <ul className="text-sm text-gray-500 text-left mb-6 space-y-2">
            <li>• Payment was cancelled</li>
            <li>• Insufficient balance</li>
            <li>• Transaction timeout</li>
            <li>• Technical issues</li>
          </ul>
          <p className="text-sm text-gray-600 mb-6">
            Don't worry, no amount has been deducted from your account.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/cart")}
              className="w-full py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Go to Home
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailurePage;
