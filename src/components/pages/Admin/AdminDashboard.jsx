import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Ban,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  MessageSquare,
  Inbox,
  Package,
  Truck,
} from "lucide-react";
import { useAuthStore } from "../../../store/lib/authStore";
import { useLogout } from "../../../hooks/useAuth";
import axios from "axios";

const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  { id: "vendors", label: "Vendors", icon: Store, path: "/admin/vendors" },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    path: "/admin/customers",
  },
  { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    path: "/admin/messages",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });

  // Contact messages state
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [contactStats, setContactStats] = useState({ unread: 0, total: 0 });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // Pagination state
  const [ordersPage, setOrdersPage] = useState(1);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active menu based on path
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes("/orders")) return "orders";
    if (path.includes("/vendors")) return "vendors";
    if (path.includes("/customers")) return "customers";
    if (path.includes("/messages")) return "messages";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const API_URL = import.meta.env.VITE_API_BASE_URL;

  // Pagination calculations
  const ordersTotalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const ordersStartIndex = (ordersPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(
    ordersStartIndex,
    ordersStartIndex + ITEMS_PER_PAGE
  );

  const vendorsTotalPages = Math.ceil(allVendors.length / ITEMS_PER_PAGE);
  const vendorsStartIndex = (vendorsPage - 1) * ITEMS_PER_PAGE;
  const paginatedVendors = allVendors.slice(
    vendorsStartIndex,
    vendorsStartIndex + ITEMS_PER_PAGE
  );

  const messagesTotalPages = Math.ceil(contactMessages.length / ITEMS_PER_PAGE);
  const messagesStartIndex = (messagesPage - 1) * ITEMS_PER_PAGE;
  const paginatedMessages = contactMessages.slice(
    messagesStartIndex,
    messagesStartIndex + ITEMS_PER_PAGE
  );

  // Pagination component
  const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    itemName,
  }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
          {totalItems} {itemName}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (page) =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-merogreen text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Fetch vendors and contact messages on component mount
  useEffect(() => {
    fetchVendors();
    fetchContactMessages();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeMenu === "orders" || activeMenu === "dashboard") {
      fetchOrders();
      fetchOrderStats();
    }
  }, [activeMenu]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderStats(response.data);
    } catch (err) {
      console.error("Failed to fetch order stats:", err);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      setUpdatingOrder(orderId);
      await axios.put(
        `${API_URL}/orders/admin/${orderId}/status`,
        { orderStatus, paymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      fetchOrderStats();
    } catch (err) {
      console.error("Failed to update order:", err);
      alert(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getOrderStatusColor = (status) => {
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

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Fetch all vendors
      const response = await axios.get(`${API_URL}/admin/vendors`, config);
      const vendors = response.data;

      // Separate pending and approved vendors
      const pending = vendors.filter((v) => v.status === "pending");
      const approved = vendors.filter((v) => v.status === "approved");

      setPendingVendors(pending);
      setAllVendors(approved);
      setStats({
        pending: pending.length,
        approved: approved.length,
        total: vendors.length,
      });
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_URL}/contact`, config);
      const messages = response.data;

      // Get unread messages
      const unread = messages.filter((m) => m.status === "unread");

      setContactMessages(messages);
      setContactStats({
        unread: unread.length,
        total: messages.length,
      });
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
    }
  };

  const handleResolveMessage = async (messageId) => {
    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(`${API_URL}/contact/${messageId}/resolve`, {}, config);
      await fetchContactMessages();
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to resolve message:", error);
      alert("Failed to resolve message. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.delete(`${API_URL}/contact/${messageId}`, config);
      await fetchContactMessages();
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openMessageDetails = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    // Mark as read if unread
    if (message.status === "unread") {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        await axios.get(`${API_URL}/contact/${message._id}`, config);
        fetchContactMessages();
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleApproveVendor = async (vendorId) => {
    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(
        `${API_URL}/admin/vendors/${vendorId}/approve`,
        {},
        config
      );

      // Refresh vendors list
      await fetchVendors();
      setShowVendorModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      alert("Failed to approve vendor. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    try {
      setActionLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      await axios.patch(
        `${API_URL}/admin/vendors/${vendorId}/reject`,
        { reason: "Application rejected by admin" },
        config
      );

      // Refresh vendors list
      await fetchVendors();
      setShowVendorModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error("Failed to reject vendor:", error);
      alert("Failed to reject vendor. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openVendorDetails = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Sidebar Component
  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile ? "fixed inset-0 z-50" : "hidden lg:flex"}
        ${sidebarOpen ? "w-64" : "w-20"}
        flex-col bg-slate-900 transition-all duration-300`}
    >
      {mobile && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${
          mobile ? "relative z-10 w-64 h-full bg-slate-900" : ""
        } flex flex-col h-full`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <Link to="/admin/dashboard" className="flex items-center">
            {sidebarOpen ? (
              <div>
                <h1 className="text-lg font-bold text-white">MeroBazaar</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            ) : (
              <span className="text-2xl font-bold text-merogreen">M</span>
            )}
          </Link>
          {mobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400"
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
                      ? "bg-merogreen text-white"
                      : "text-slate-300 hover:bg-slate-800"
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
        <div className="p-3 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  // Vendor Details Modal
  const VendorModal = () => {
    if (!selectedVendor) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setShowVendorModal(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Vendor Application
            </h2>
            <button
              onClick={() => setShowVendorModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Business Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-merogreen/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-merogreen" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedVendor.businessName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedVendor.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  Owner Name
                </p>
                <p className="font-medium text-gray-800">
                  {selectedVendor.ownerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">
                  PAN Number
                </p>
                <p className="font-medium text-gray-800">
                  {selectedVendor.panNumber}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-gray-400" />
                <span className="text-sm">{selectedVendor.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-gray-400" />
                <span className="text-sm">{selectedVendor.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-gray-400" />
                <span className="text-sm">
                  {selectedVendor.district}, {selectedVendor.province}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Address</p>
              <p className="text-sm text-gray-600">{selectedVendor.address}</p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Applied On</p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedVendor.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {selectedVendor.status === "pending" && (
            <div className="flex gap-3 p-5 border-t bg-gray-50">
              <button
                onClick={() => handleRejectVendor(selectedVendor._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <XCircle size={18} />
                )}
                Reject
              </button>
              <button
                onClick={() => handleApproveVendor(selectedVendor._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-merogreen text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Message Details Modal
  const MessageModal = () => {
    if (!selectedMessage) return null;

    const getStatusBadge = (status) => {
      const badges = {
        unread: "bg-blue-100 text-blue-700",
        read: "bg-yellow-100 text-yellow-700",
        resolved: "bg-green-100 text-green-700",
      };
      return badges[status] || "bg-gray-100 text-gray-700";
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setShowMessageModal(false)}
        />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Contact Message
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                  selectedMessage.status
                )}`}
              >
                {selectedMessage.status}
              </span>
            </div>
            <button
              onClick={() => setShowMessageModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Sender Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedMessage.fullName}
                </h3>
                <p className="text-sm text-gray-500">{selectedMessage.email}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Subject</p>
              <p className="font-medium text-gray-800">
                {selectedMessage.subject}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Message</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {selectedMessage.message}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">
                Received On
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedMessage.createdAt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          {selectedMessage.status !== "resolved" && (
            <div className="flex gap-3 p-5 border-t bg-gray-50">
              <button
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <XCircle size={18} />
                )}
                Delete
              </button>
              <button
                onClick={() => handleResolveMessage(selectedMessage._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-merogreen text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Mark Resolved
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileMenuOpen && <Sidebar mobile />}

      {/* Vendor Modal */}
      {showVendorModal && <VendorModal />}

      {/* Message Modal */}
      {showMessageModal && <MessageModal />}

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

            {/* Search */}
            <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors, orders..."
                className="bg-transparent border-none outline-none ml-2 w-64 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
              {(stats.pending > 0 || contactStats.unread > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeMenu === "orders" ? (
            /* Orders Section */
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Orders Management
                </h1>
                <p className="text-gray-500">
                  View and manage all platform orders
                </p>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <ShoppingCart size={20} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStats?.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                    <Clock size={20} className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStats?.pendingOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {orderStats?.completedOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <DollarSign size={20} className="text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    Rs.{orderStats?.totalRevenue || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">All Orders</h3>
                  <button
                    onClick={fetchOrders}
                    className="text-sm text-merogreen font-medium hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="p-8 text-center">
                    <Loader2
                      size={32}
                      className="mx-auto mb-2 text-merogreen animate-spin"
                    />
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <ShoppingCart
                      size={48}
                      className="mx-auto mb-2 opacity-30"
                    />
                    <p>No orders found</p>
                  </div>
                ) : (
                  <>
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
                              <td className="px-5 py-4">
                                <p className="text-sm text-gray-800">
                                  {order.user?.fullName || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {order.user?.email || ""}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {order.items?.length || 0} item(s)
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
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
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
                                <div className="flex items-center gap-1">
                                  {order.orderStatus === "shipped" && (
                                    <button
                                      onClick={() =>
                                        updateOrderStatus(
                                          order._id,
                                          "delivered"
                                        )
                                      }
                                      disabled={updatingOrder === order._id}
                                      className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                                      title="Mark as Delivered"
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
                                  )}
                                  {order.paymentStatus === "pending" &&
                                    order.paymentMethod === "cod" && (
                                      <button
                                        onClick={() =>
                                          updateOrderStatus(
                                            order._id,
                                            null,
                                            "paid"
                                          )
                                        }
                                        disabled={updatingOrder === order._id}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                        title="Mark as Paid"
                                      >
                                        {updatingOrder === order._id ? (
                                          <Loader2
                                            size={16}
                                            className="animate-spin"
                                          />
                                        ) : (
                                          <DollarSign size={16} />
                                        )}
                                      </button>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={ordersPage}
                      totalPages={ordersTotalPages}
                      totalItems={orders.length}
                      startIndex={ordersStartIndex}
                      endIndex={ordersStartIndex + ITEMS_PER_PAGE}
                      onPageChange={setOrdersPage}
                      itemName="orders"
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Dashboard Content */
            <>
              {/* Page Title */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  Admin Dashboard
                </h1>
                <p className="text-gray-500">
                  Manage vendors, orders, and monitor platform performance.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock size={20} className="text-yellow-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.pending}
                  </p>
                  <p className="text-sm text-gray-500">Pending Approvals</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Store size={20} className="text-green-600" />
                    </div>
                    <span className="flex items-center text-sm font-medium text-green-600">
                      <TrendingUp size={14} />
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.approved}
                  </p>
                  <p className="text-sm text-gray-500">Active Vendors</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-500">Total Vendors</p>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare size={20} className="text-blue-600" />
                    </div>
                    {contactStats.unread > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {contactStats.unread}
                  </p>
                  <p className="text-sm text-gray-500">Unread Messages</p>
                </div>
              </div>

              {/* Pending Vendor Approvals */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      Pending Vendor Approvals
                    </h3>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                      {pendingVendors.length} pending
                    </span>
                  </div>
                  <button
                    onClick={fetchVendors}
                    className="text-sm text-merogreen font-medium hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2
                      size={32}
                      className="mx-auto mb-2 text-merogreen animate-spin"
                    />
                    <p className="text-gray-500">Loading vendors...</p>
                  </div>
                ) : pendingVendors.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {pendingVendors.map((vendor) => (
                      <div
                        key={vendor._id}
                        className="flex items-center justify-between p-5 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Store size={24} className="text-gray-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {vendor.businessName}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {vendor.ownerName} • {vendor.category}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              <Clock size={12} className="inline mr-1" />
                              Applied on {formatDate(vendor.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openVendorDetails(vendor)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Eye size={16} className="inline mr-1" />
                            View
                          </button>
                          <button
                            onClick={() => handleRejectVendor(vendor._id)}
                            disabled={actionLoading}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Reject"
                          >
                            <Ban size={18} />
                          </button>
                          <button
                            onClick={() => handleApproveVendor(vendor._id)}
                            disabled={actionLoading}
                            className="p-2 text-merogreen hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <CheckCircle
                      size={48}
                      className="mx-auto mb-2 text-green-500 opacity-50"
                    />
                    <p>No pending vendor applications</p>
                  </div>
                )}
              </div>

              {/* Active Vendors Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">
                    Active Vendors
                  </h3>
                  <span className="text-sm text-gray-500">
                    {allVendors.length} vendors
                  </span>
                </div>
                {allVendors.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Vendor
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Location
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Approved On
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedVendors.map((vendor) => (
                            <tr key={vendor._id} className="hover:bg-gray-50">
                              <td className="px-5 py-4">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {vendor.businessName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {vendor.ownerName}
                                  </p>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {vendor.category}
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {vendor.district}, {vendor.province}
                              </td>
                              <td className="px-5 py-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  {vendor.status}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-sm text-gray-600">
                                {vendor.approvedAt
                                  ? formatDate(vendor.approvedAt)
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={vendorsPage}
                      totalPages={vendorsTotalPages}
                      totalItems={allVendors.length}
                      startIndex={vendorsStartIndex}
                      endIndex={vendorsStartIndex + ITEMS_PER_PAGE}
                      onPageChange={setVendorsPage}
                      itemName="vendors"
                    />
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Store size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No active vendors yet</p>
                  </div>
                )}
              </div>

              {/* Contact Messages Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800">
                      Contact Messages
                    </h3>
                    {contactStats.unread > 0 && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {contactStats.unread} unread
                      </span>
                    )}
                  </div>
                  <button
                    onClick={fetchContactMessages}
                    className="text-sm text-merogreen font-medium hover:underline"
                  >
                    Refresh
                  </button>
                </div>

                {contactMessages.length > 0 ? (
                  <>
                    <div className="divide-y divide-gray-100">
                      {paginatedMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer ${
                            message.status === "unread" ? "bg-blue-50/50" : ""
                          }`}
                          onClick={() => openMessageDetails(message)}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                message.status === "unread"
                                  ? "bg-blue-100"
                                  : message.status === "resolved"
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Mail
                                size={20}
                                className={`${
                                  message.status === "unread"
                                    ? "text-blue-600"
                                    : message.status === "resolved"
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`font-medium ${
                                    message.status === "unread"
                                      ? "text-gray-900"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {message.fullName}
                                </h4>
                                {message.status === "unread" && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {message.subject}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                <Clock size={12} className="inline mr-1" />
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                message.status === "unread"
                                  ? "bg-blue-100 text-blue-700"
                                  : message.status === "read"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {message.status}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openMessageDetails(message);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination
                      currentPage={messagesPage}
                      totalPages={messagesTotalPages}
                      totalItems={contactMessages.length}
                      startIndex={messagesStartIndex}
                      endIndex={messagesStartIndex + ITEMS_PER_PAGE}
                      onPageChange={setMessagesPage}
                      itemName="messages"
                    />
                  </>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Inbox size={48} className="mx-auto mb-2 opacity-30" />
                    <p>No contact messages yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
