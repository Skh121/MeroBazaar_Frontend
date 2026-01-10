import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import VendorProducts from "./VendorProducts";
import VendorAnalyticsContent from "./VendorAnalyticsContent";
import VendorSettings from "./VendorSettings";
import VendorDashboardContent from "./VendorDashboardContent";
import Logo from "../../../assets/images/Logo.svg";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  Truck,
} from "lucide-react";
import { useAuthStore } from "../../../store/lib/authStore";
import { useLogout } from "../../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/vendor/dashboard",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    path: "/vendor/products",
  },
  { id: "orders", label: "Orders", icon: ShoppingCart, path: "/vendor/orders" },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/vendor/analytics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/vendor/settings",
  },
];

const ORDERS_PER_PAGE = 10;

const VendorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const user = useAuthStore((state) => state.user);
  const token = localStorage.getItem("auth_token");
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Orders pagination logic
  const ordersTotalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const ordersStartIndex = (ordersCurrentPage - 1) * ORDERS_PER_PAGE;
  const ordersEndIndex = ordersStartIndex + ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(ordersStartIndex, ordersEndIndex);

  // Fetch orders and stats
  useEffect(() => {
    if (token) {
      fetchOrders();
      fetchStats();
    }
  }, [token]);

  const fetchOrders = async () => {
    try {
      console.log(
        "Fetching vendor orders with token:",
        token ? "present" : "missing"
      );
      const response = await axios.get(`${API_URL}/orders/vendor/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Vendor orders response:", response.data);
      setOrders(response.data);
    } catch (err) {
      console.error(
        "Failed to fetch orders:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/vendor/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);
      await axios.put(
        `${API_URL}/orders/vendor/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      console.error("Failed to update order:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Determine active menu item based on current path
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes("/products")) return "products";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const handleLogout = () => {
    logout();
    navigate("/vendor/login");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "pending":
      case "confirmed":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Sidebar Component
  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile ? "fixed inset-0 z-50" : "hidden lg:flex"}
        ${sidebarOpen ? "w-64" : "w-20"}
        flex-col bg-white border-r border-gray-200 transition-all duration-300`}
    >
      {mobile && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${
          mobile ? "relative z-10 w-64 h-full bg-white" : ""
        } flex flex-col h-full`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/vendor/dashboard" className="flex items-center">
            {sidebarOpen ? (
              <img src={Logo} alt="MeroBazaar" className="h-8 w-auto" />
            ) : (
              <img
                src={Logo}
                alt="MeroBazaar"
                className="h-8 w-8 object-contain"
              />
            )}
          </Link>
          {mobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-500"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeMenu;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition
                  ${
                    isActive
                      ? "bg-green-50 text-merogreen"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileMenuOpen && <Sidebar mobile />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-merogreen rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0) || "V"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || "Vendor"}
                </p>
                <p className="text-xs text-gray-500">Vendor</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeMenu === "products" ? (
            <VendorProducts />
          ) : activeMenu === "orders" ? (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                <p className="text-gray-500">Manage and track your orders</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="text-merogreen animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Order ID
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Customer
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Items
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Payment
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-5 py-4 text-sm font-medium text-gray-800">
                              {order.orderNumber}
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              {order.user?.fullName || "N/A"}
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-600">
                              {order.items.length} item(s)
                            </td>
                            <td className="px-5 py-4 text-sm font-medium text-gray-800">
                              Rs.{order.total}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  order.paymentStatus === "paid"
                                    ? "bg-green-100 text-green-700"
                                    : order.paymentStatus === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.orderStatus
                                )}`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                {order.orderStatus === "pending" ||
                                order.orderStatus === "confirmed" ? (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "processing")
                                    }
                                    disabled={updatingOrder === order._id}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                    title="Mark as Processing"
                                  >
                                    {updatingOrder === order._id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle size={16} />
                                    )}
                                  </button>
                                ) : order.orderStatus === "processing" ? (
                                  <button
                                    onClick={() =>
                                      updateOrderStatus(order._id, "shipped")
                                    }
                                    disabled={updatingOrder === order._id}
                                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50"
                                    title="Mark as Shipped"
                                  >
                                    {updatingOrder === order._id ? (
                                      <Loader2
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Truck size={16} />
                                    )}
                                  </button>
                                ) : null}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Orders Pagination */}
                  {ordersTotalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        Showing {ordersStartIndex + 1} to{" "}
                        {Math.min(ordersEndIndex, orders.length)} of{" "}
                        {orders.length} orders
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setOrdersCurrentPage((prev) =>
                              Math.max(prev - 1, 1)
                            )
                          }
                          disabled={ordersCurrentPage === 1}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from(
                          { length: ordersTotalPages },
                          (_, i) => i + 1
                        )
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === ordersTotalPages ||
                              Math.abs(page - ordersCurrentPage) <= 1
                          )
                          .map((page, index, array) => (
                            <React.Fragment key={page}>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span className="px-2 text-gray-400">...</span>
                              )}
                              <button
                                onClick={() => setOrdersCurrentPage(page)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                  ordersCurrentPage === page
                                    ? "bg-merogreen text-white"
                                    : "border border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          ))}
                        <button
                          onClick={() =>
                            setOrdersCurrentPage((prev) =>
                              Math.min(prev + 1, ordersTotalPages)
                            )
                          }
                          disabled={ordersCurrentPage === ordersTotalPages}
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : activeMenu === "analytics" ? (
            <VendorAnalyticsContent />
          ) : activeMenu === "settings" ? (
            <VendorSettings />
          ) : (
            <VendorDashboardContent />
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
