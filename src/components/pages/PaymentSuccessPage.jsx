import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Get the encoded data from URL (eSewa returns data in query params)
    const encodedData = searchParams.get("data");

    if (!encodedData) {
      setStatus("error");
      setMessage("No payment data received");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/payment/esewa/verify`,
        { encodedData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStatus("success");
        setMessage("Payment successful!");
        setOrderNumber(response.data.order.orderNumber);
      } else {
        setStatus("error");
        setMessage(response.data.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatus("error");
      setMessage(error.response?.data?.message || "Failed to verify payment");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-4">
          {status === "verifying" && (
            <>
              <Loader2
                size={64}
                className="text-merogreen mx-auto mb-4 animate-spin"
              />
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-500">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle size={64} className="text-merogreen mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-500 mb-6">{message}</p>
              {orderNumber && (
                <p className="text-sm text-gray-600 mb-6">
                  Order Number:{" "}
                  <span className="font-semibold">{orderNumber}</span>
                </p>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/order-success/${orderNumber}`)}
                  className="w-full py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  View Order Details
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold hover:bg-green-50 transition"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-800 mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-gray-500 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Return to Cart
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
