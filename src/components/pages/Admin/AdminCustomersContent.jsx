import { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  ShoppingCart,
  DollarSign,
  Calendar,
  Eye,
  Ban,
  Trash2,
  X,
  CheckCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 15;

const AdminCustomersContent = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Modal states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [currentPage]);

  useEffect(() => {
    // Debounce search
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchCustomers();
    }, 500);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery || undefined,
        },
      });
      setCustomers(response.data.customers || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalCustomers(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `Rs.${(value || 0).toLocaleString()}`;
  };

  // View customer details
  const handleViewCustomer = async (customer) => {
    try {
      setActionLoading(true);
      const response = await axios.get(
        `${API_URL}/admin/customers/${customer._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedCustomer(response.data);
      setViewModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      alert("Failed to load customer details");
    } finally {
      setActionLoading(false);
    }
  };

  // Suspend customer
  const handleSuspendCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/customers/${selectedCustomer._id}/suspend`,
        { reason: suspendReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuspendModalOpen(false);
      setSuspendReason("");
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to suspend customer:", error);
      alert(error.response?.data?.message || "Failed to suspend customer");
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate customer
  const handleReactivateCustomer = async (customer) => {
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/customers/${customer._id}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomers();
    } catch (error) {
      console.error("Failed to reactivate customer:", error);
      alert(error.response?.data?.message || "Failed to reactivate customer");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    if (!selectedCustomer) return;
    try {
      setActionLoading(true);
      await axios.delete(`${API_URL}/admin/customers/${selectedCustomer._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      alert(error.response?.data?.message || "Failed to delete customer");
    } finally {
      setActionLoading(false);
    }
  };

  // Open suspend modal
  const openSuspendModal = (customer) => {
    setSelectedCustomer(customer);
    setSuspendModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setDeleteModalOpen(true);
  };

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to{" "}
          {Math.min(startIndex + ITEMS_PER_PAGE, totalCustomers)} of{" "}
          {totalCustomers} customers
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
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
              <span key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-merogreen text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              </span>
            ))}
          <button
            onClick={() =>
              setCurrentPage(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Customer Management
          </h1>
          <p className="text-gray-500">View and manage platform customers</p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Users size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalCustomers}</p>
          <p className="text-sm text-gray-500">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <ShoppingCart size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)}
          </p>
          <p className="text-sm text-gray-500">Total Orders (This Page)</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(
              customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
            )}
          </p>
          <p className="text-sm text-gray-500">Total Spent (This Page)</p>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Customers</h3>
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none ml-2 w-64 text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2
              size={32}
              className="mx-auto mb-2 text-merogreen animate-spin"
            />
            <p className="text-gray-500">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-2 opacity-30" />
            <p>No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {customer.fullName?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {customer.fullName || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {customer._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-gray-400" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            customer.status === "suspended"
                              ? "bg-red-50 text-red-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {customer.status === "suspended" ? (
                            <>
                              <Ban size={12} />
                              Suspended
                            </>
                          ) : (
                            <>
                              <CheckCircle size={12} />
                              Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          <ShoppingCart size={14} />
                          {customer.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-800">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(customer.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewCustomer(customer)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          {/* Suspend/Reactivate Button */}
                          {customer.status === "suspended" ? (
                            <button
                              onClick={() => handleReactivateCustomer(customer)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Reactivate Customer"
                              disabled={actionLoading}
                            >
                              <CheckCircle size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => openSuspendModal(customer)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Suspend Customer"
                            >
                              <Ban size={18} />
                            </button>
                          )}
                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(customer)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Customer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination />
          </>
        )}
      </div>

      {/* View Customer Modal */}
      {viewModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Customer Details
              </h3>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-merogreen rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {selectedCustomer.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-gray-800">
                    {selectedCustomer.fullName}
                  </h4>
                  <p className="text-gray-500">{selectedCustomer.email}</p>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mt-2 ${
                      selectedCustomer.status === "suspended"
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    {selectedCustomer.status === "suspended" ? (
                      <>
                        <Ban size={12} />
                        Suspended
                      </>
                    ) : (
                      <>
                        <CheckCircle size={12} />
                        Active
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Contact & Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Phone size={16} />
                    <span className="text-sm">Phone</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {selectedCustomer.phone || "Not provided"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar size={16} />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <p className="font-medium text-gray-800">
                    {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <ShoppingCart size={16} />
                    <span className="text-sm">Total Orders</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700">
                    {selectedCustomer.totalOrders || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <DollarSign size={16} />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(selectedCustomer.totalSpent)}
                  </p>
                </div>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses &&
                selectedCustomer.addresses.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Addresses
                    </h5>
                    <div className="space-y-2">
                      {selectedCustomer.addresses.map((address, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <MapPin size={16} className="text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                              {address.label}
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {[
                                address.street,
                                address.city,
                                address.district,
                                address.province,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Recent Orders */}
              {selectedCustomer.recentOrders &&
                selectedCustomer.recentOrders.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3">
                      Recent Orders
                    </h5>
                    <div className="space-y-2">
                      {selectedCustomer.recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              Order #{order._id?.slice(-8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-800">
                              {formatCurrency(order.total)}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                order.orderStatus === "delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.orderStatus === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Suspend Reason if suspended */}
              {selectedCustomer.status === "suspended" &&
                selectedCustomer.suspendReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-700 mb-1">
                      <AlertTriangle size={16} />
                      <span className="font-medium">Suspension Reason</span>
                    </div>
                    <p className="text-sm text-red-600">
                      {selectedCustomer.suspendReason}
                    </p>
                    <p className="text-xs text-red-500 mt-1">
                      Suspended on: {formatDate(selectedCustomer.suspendedAt)}
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Customer Modal */}
      {suspendModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Suspend Customer
              </h3>
              <button
                onClick={() => {
                  setSuspendModalOpen(false);
                  setSelectedCustomer(null);
                  setSuspendReason("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="text-orange-500" size={24} />
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedCustomer.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspending this customer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSuspendModalOpen(false);
                    setSelectedCustomer(null);
                    setSuspendReason("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendCustomer}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Ban size={18} />
                  )}
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Customer Modal */}
      {deleteModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md m-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">
                Delete Customer
              </h3>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedCustomer(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="text-red-500" size={24} />
                <div>
                  <p className="font-medium text-gray-800">
                    {selectedCustomer.fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this customer? This action
                cannot be undone and will permanently remove all customer data.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedCustomer(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Trash2 size={18} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersContent;
