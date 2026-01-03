import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Customer Auth Pages
import SignupPage from "./components/pages/Auth/SignupPage.jsx";
import LoginPage from "./components/pages/Auth/LoginPage.jsx";
import ForgotPasswordPage from "./components/pages/Auth/ForgotPasswordPage.jsx";

// Landing Page
import LandingPage from "./components/pages/LandingPage.jsx";

// Static Pages
import AboutPage from "./components/pages/AboutPage.jsx";
import ContactPage from "./components/pages/ContactPage.jsx";

// Product Pages
import ProductDetails from "./components/pages/ProductDetails.jsx";
import ShopPage from "./components/pages/ShopPage.jsx";

// User Pages
import ProfilePage from "./components/pages/ProfilePage.jsx";
import CartPage from "./components/pages/CartPage.jsx";
import WishlistPage from "./components/pages/WishlistPage.jsx";
import OrderSuccessPage from "./components/pages/OrderSuccessPage.jsx";
import PaymentSuccessPage from "./components/pages/PaymentSuccessPage.jsx";
import PaymentFailurePage from "./components/pages/PaymentFailurePage.jsx";

// Vendor Pages
import VendorLoginPage from "./components/pages/Vendor/VendorLoginPage.jsx";
import VendorSignupPage from "./components/pages/Vendor/VendorSignupPage.jsx";
import VendorRegistrationSuccess from "./components/pages/Vendor/VendorRegistrationSuccess.jsx";
import VendorDashboard from "./components/pages/Vendor/VendorDashboard.jsx";

// Admin Pages
import AdminDashboard from "./components/pages/Admin/AdminDashboard.jsx";
import AnalyticsDashboard from "./components/pages/Admin/Analytics/AnalyticsDashboard.jsx";
import DemandForecastingPage from "./components/pages/Admin/Analytics/DemandForecastingPage.jsx";
import DynamicPricingPage from "./components/pages/Admin/Analytics/DynamicPricingPage.jsx";
import CustomerSegmentsPage from "./components/pages/Admin/Analytics/CustomerSegmentsPage.jsx";

// Protected Route Components
import { VendorRoute, AdminRoute } from "./components/auth/ProtectedRoute.jsx";

// Customer Home placeholder
const CustomerHome = () => (
  <div className="text-center p-10 bg-white shadow-lg m-10 rounded-xl">
    <h1 className="text-4xl font-bold text-merogreen">Welcome, Customer!</h1>
    <p className="text-gray-600 mt-4">
      Login successful. You are viewing the customer dashboard.{" "}
      <Link to="/" className="text-merogreen hover:underline font-semibold">
        Go to Landing Page
      </Link>
    </p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Authentication Routes (Customer & Admin use same login) */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Main Landing/Home Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Static Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Customer Routes */}
          <Route path="/customer/home" element={<CustomerHome />} />

          {/* Shop Routes */}
          <Route path="/shop" element={<ShopPage />} />

          {/* Product Routes */}
          <Route path="/product/:id" element={<ProductDetails />} />

          {/* User Profile Routes */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Cart & Wishlist Routes */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route
            path="/order-success/:orderNumber"
            element={<OrderSuccessPage />}
          />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />

          {/* Vendor Public Routes */}
          <Route path="/vendor/login" element={<VendorLoginPage />} />
          <Route path="/vendor/register" element={<VendorSignupPage />} />
          <Route
            path="/vendor/registration-success"
            element={<VendorRegistrationSuccess />}
          />

          {/* Vendor Protected Routes */}
          <Route
            path="/vendor/dashboard"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/products"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/orders"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/analytics"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />
          <Route
            path="/vendor/settings"
            element={
              <VendorRoute>
                <VendorDashboard />
              </VendorRoute>
            }
          />

          {/* Admin login redirects to main login */}
          <Route
            path="/admin/login"
            element={<Navigate to="/login" replace />}
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/vendors"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/customers"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <AdminRoute>
                <AnalyticsDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics/forecasting"
            element={
              <AdminRoute>
                <DemandForecastingPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics/pricing"
            element={
              <AdminRoute>
                <DynamicPricingPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/analytics/segments"
            element={
              <AdminRoute>
                <CustomerSegmentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
