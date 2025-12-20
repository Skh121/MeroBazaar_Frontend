import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/lib/authStore";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  // Check if user is authenticated
  if (!token || !user) {
    // Determine redirect path based on intended destination
    if (location.pathname.startsWith("/vendor")) {
      return <Navigate to="/vendor/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith("/admin")) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === "vendor") {
      return <Navigate to="/vendor/dashboard" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/customer/home" replace />;
  }

  return children;
};

export const VendorRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["vendor"]}>
      {children}
    </ProtectedRoute>
  );
};

export const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      {children}
    </ProtectedRoute>
  );
};

export const CustomerRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
