import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  Check,
  Building2,
  Mail,
  Phone,
  MapPin,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const ITEMS_PER_PAGE = 10;

const AdminVendorsContent = ({ token }) => {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });
  const [vendorsPage, setVendorsPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_URL}/admin/vendors`, config);
      const vendors = response.data;

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

  const handleApproveVendor = async (vendorId) => {
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/vendors/${vendorId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Vendor approved successfully");
      await fetchVendors();
      setShowVendorModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      toast.error("Failed to approve vendor. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectVendor = async (vendorId) => {
    try {
      setActionLoading(true);
      await axios.patch(
        `${API_URL}/admin/vendors/${vendorId}/reject`,
        { reason: "Application rejected by admin" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Vendor rejected");
      await fetchVendors();
      setShowVendorModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error("Failed to reject vendor:", error);
      toast.error("Failed to reject vendor. Please try again.");
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

  // Filter and paginate vendors
  const filteredVendors = allVendors.filter(
    (v) =>
      v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const vendorsTotalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const vendorsStartIndex = (vendorsPage - 1) * ITEMS_PER_PAGE;
  const paginatedVendors = filteredVendors.slice(
    vendorsStartIndex,
    vendorsStartIndex + ITEMS_PER_PAGE
  );

  // Pagination component
  const Pagination = ({ currentPage, totalPages, totalItems, startIndex, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of{" "}
          {totalItems} vendors
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
            .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
            .map((page, index, array) => (
              <span key={page}>
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
              </span>
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

  // Vendor Details Modal
  const VendorModal = () => {
    if (!selectedVendor) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={() => setShowVendorModal(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Vendor Application</h2>
            <button
              onClick={() => setShowVendorModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-merogreen/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-merogreen" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{selectedVendor.businessName}</h3>
                <p className="text-sm text-gray-500">{selectedVendor.category}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Owner Name</p>
                <p className="font-medium text-gray-800">{selectedVendor.ownerName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">PAN Number</p>
                <p className="font-medium text-gray-800">{selectedVendor.panNumber}</p>
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
              <p className="text-sm text-gray-600">{formatDate(selectedVendor.createdAt)}</p>
            </div>
          </div>

          {selectedVendor.status === "pending" && (
            <div className="flex gap-3 p-5 border-t bg-gray-50">
              <button
                onClick={() => handleRejectVendor(selectedVendor._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-600 font-medium hover:bg-red-50 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                Reject
              </button>
              <button
                onClick={() => handleApproveVendor(selectedVendor._id)}
                disabled={actionLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-merogreen text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="text-merogreen animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {showVendorModal && <VendorModal />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
          <p className="text-gray-500">Approve and manage vendor applications</p>
        </div>
        <button
          onClick={fetchVendors}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending Approvals</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Store size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
          <p className="text-sm text-gray-500">Active Vendors</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Store size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Vendors</p>
        </div>
      </div>

      {/* Pending Vendor Approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800">Pending Vendor Approvals</h3>
            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
              {pendingVendors.length} pending
            </span>
          </div>
        </div>

        {pendingVendors.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {pendingVendors.map((vendor) => (
              <div key={vendor._id} className="flex items-center justify-between p-5 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Store size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{vendor.businessName}</h4>
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
            <CheckCircle size={48} className="mx-auto mb-2 text-green-500 opacity-50" />
            <p>No pending vendor applications</p>
          </div>
        )}
      </div>

      {/* Active Vendors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Active Vendors</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVendorsPage(1);
                }}
                className="bg-transparent border-none outline-none ml-2 w-48 text-sm"
              />
            </div>
            <span className="text-sm text-gray-500">{filteredVendors.length} vendors</span>
          </div>
        </div>
        {paginatedVendors.length > 0 ? (
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{vendor.businessName}</p>
                          <p className="text-sm text-gray-500">{vendor.ownerName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{vendor.category}</td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {vendor.district}, {vendor.province}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {vendor.approvedAt ? formatDate(vendor.approvedAt) : "-"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => openVendorDetails(vendor)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={vendorsPage}
              totalPages={vendorsTotalPages}
              totalItems={filteredVendors.length}
              startIndex={vendorsStartIndex}
              onPageChange={setVendorsPage}
            />
          </>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Store size={48} className="mx-auto mb-2 opacity-30" />
            <p>No active vendors found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVendorsContent;
