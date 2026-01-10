import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  DollarSign,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10;

const AdminOrdersContent = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/orders/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
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
      toast.success(orderStatus ? `Order marked as ${orderStatus}` : "Payment status updated");
      fetchOrders();
      fetchOrderStats();
    } catch (err) {
      console.error("Failed to update order:", err);
      toast.error(err.response?.data?.message || "Failed to update order");
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

  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, orders.length)} of{" "}
          {orders.length} orders
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
            .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
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
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
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
          <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
          <p className="text-gray-500">View and manage all platform orders</p>
        </div>
        <button
          onClick={() => {
            fetchOrders();
            fetchOrderStats();
          }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <ShoppingCart size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{orderStats?.totalOrders || 0}</p>
          <p className="text-sm text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{orderStats?.pendingOrders || 0}</p>
          <p className="text-sm text-gray-500">Pending Orders</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{orderStats?.completedOrders || 0}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            Rs.{(orderStats?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">Total Revenue</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Orders</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="mx-auto mb-2 text-merogreen animate-spin" />
            <p className="text-gray-500">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-30" />
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
                        <p className="text-sm text-gray-800">{order.user?.fullName || "N/A"}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || ""}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-800">
                        Rs.{order.total?.toLocaleString()}
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
                              onClick={() => updateOrderStatus(order._id, "delivered")}
                              disabled={updatingOrder === order._id}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                              title="Mark as Delivered"
                            >
                              {updatingOrder === order._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckCircle size={16} />
                              )}
                            </button>
                          )}
                          {order.orderStatus === "processing" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "shipped")}
                              disabled={updatingOrder === order._id}
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50"
                              title="Mark as Shipped"
                            >
                              {updatingOrder === order._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Truck size={16} />
                              )}
                            </button>
                          )}
                          {(order.orderStatus === "pending" || order.orderStatus === "confirmed") && (
                            <button
                              onClick={() => updateOrderStatus(order._id, "processing")}
                              disabled={updatingOrder === order._id}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                              title="Mark as Processing"
                            >
                              {updatingOrder === order._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Package size={16} />
                              )}
                            </button>
                          )}
                          {order.paymentStatus === "pending" && order.paymentMethod === "cod" && (
                            <button
                              onClick={() => updateOrderStatus(order._id, null, "paid")}
                              disabled={updatingOrder === order._id}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                              title="Mark as Paid"
                            >
                              {updatingOrder === order._id ? (
                                <Loader2 size={16} className="animate-spin" />
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
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersContent;
