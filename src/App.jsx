import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import SignupPage from "./components/pages/Auth/SignupPage.jsx";
import LoginPage from "./components/pages/Auth/LoginPage.jsx";
import ForgotPasswordPage from "./components/pages/Auth/ForgotPasswordPage.jsx";
import LandingPage from "./components/pages/LandingPage.jsx";

// These are where users are sent after successful login/signup
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
const AdminDashboard = () => (
  <div className="text-center p-10 bg-white shadow-lg m-10 rounded-xl">
    <h1 className="text-4xl font-bold text-red-700">Welcome, Admin!</h1>
    <p className="text-gray-600 mt-4">
      Login successful. Full system control panel access granted.{" "}
      <Link to="/" className="text-merogreen hover:underline font-semibold">
        Go to Landing Page
      </Link>
    </p>
  </div>
);

/**
 * Main application component handling all routing.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Main Landing/Home Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated/Role-Based Routes */}
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
