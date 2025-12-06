import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import SignupPage from "./components/pages/Auth/SignupPage.jsx";
import LoginPage from "./components/pages/Auth/LoginPage.jsx";

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
const LandingPage = () => (
  <div className="text-center p-10 bg-white shadow-lg m-10 rounded-xl">
    <h1 className="text-4xl font-bold text-gray-800">
      MeroBazaar - Find Authentic Nepali Products
    </h1>
    <p className="text-gray-600 mt-4">
      Visit{" "}
      <Link
        to="/login"
        className="text-merogreen hover:underline font-semibold"
      >
        Login
      </Link>{" "}
      or{" "}
      <Link
        to="/signup"
        className="text-merogreen hover:underline font-semibold"
      >
        Signup
      </Link>{" "}
      to continue.
    </p>
  </div>
);

/**
 * Main application component handling all routing.
 */
function App() {
  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Main Landing/Home Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authenticated/Role-Based Routes */}
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
