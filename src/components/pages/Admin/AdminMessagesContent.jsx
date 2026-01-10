import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Inbox,
  Loader2,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10;

const AdminMessagesContent = ({ token }) => {
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [contactStats, setContactStats] = useState({ unread: 0, read: 0, resolved: 0, total: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchContactMessages();
  }, []);

  const fetchContactMessages = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_URL}/contact`, config);
      const messages = response.data;

      const unread = messages.filter((m) => m.status === "unread").length;
      const read = messages.filter((m) => m.status === "read").length;
      const resolved = messages.filter((m) => m.status === "resolved").length;

      setContactMessages(messages);
      setContactStats({
        unread,
        read,
        resolved,
        total: messages.length,
      });
    } catch (error) {
      console.error("Failed to fetch contact messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveMessage = async (messageId) => {
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/contact/${messageId}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Message marked as resolved");
      await fetchContactMessages();
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to resolve message:", error);
      toast.error("Failed to resolve message. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      setActionLoading(true);
      await axios.delete(`${API_URL}/contact/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Message deleted successfully");
      await fetchContactMessages();
      setShowMessageModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Failed to delete message. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const openMessageDetails = async (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);

    if (message.status === "unread") {
      try {
        await axios.get(`${API_URL}/contact/${message._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchContactMessages();
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      unread: "bg-blue-100 text-blue-700",
      read: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return badges[status] || "bg-gray-100 text-gray-700";
  };

  // Filter and paginate messages
  const filteredMessages =
    filter === "all" ? contactMessages : contactMessages.filter((m) => m.status === filter);

  const totalPages = Math.ceil(filteredMessages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMessages = filteredMessages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredMessages.length)}{" "}
          of {filteredMessages.length} messages
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

  // Message Details Modal
  const MessageModal = () => {
    if (!selectedMessage) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={() => setShowMessageModal(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Contact Message</h2>
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

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{selectedMessage.fullName}</h3>
                <p className="text-sm text-gray-500">{selectedMessage.email}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Subject</p>
              <p className="font-medium text-gray-800">{selectedMessage.subject}</p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Message</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {selectedMessage.message}
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-500 uppercase mb-1">Received On</p>
              <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
            </div>
          </div>

          {selectedMessage.status !== "resolved" && (
            <div className="flex gap-3 p-5 border-t bg-gray-50">
              <button
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
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
    <div>
      {showMessageModal && <MessageModal />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contact Messages</h1>
          <p className="text-gray-500">Manage customer inquiries and feedback</p>
        </div>
        <button
          onClick={fetchContactMessages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Mail size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{contactStats.unread}</p>
          <p className="text-sm text-gray-500">Unread</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
            <Eye size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{contactStats.read}</p>
          <p className="text-sm text-gray-500">Read</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{contactStats.resolved}</p>
          <p className="text-sm text-gray-500">Resolved</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <MessageSquare size={20} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{contactStats.total}</p>
          <p className="text-sm text-gray-500">Total Messages</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Messages</h3>
          <div className="flex items-center gap-2">
            {["all", "unread", "read", "resolved"].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  filter === f
                    ? "bg-merogreen text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 size={32} className="mx-auto mb-2 text-merogreen animate-spin" />
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : paginatedMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Inbox size={48} className="mx-auto mb-2 opacity-30" />
            <p>No messages found</p>
          </div>
        ) : (
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
                            message.status === "unread" ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {message.fullName}
                        </h4>
                        {message.status === "unread" && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{message.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <Clock size={12} className="inline mr-1" />
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
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
            <Pagination />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessagesContent;
