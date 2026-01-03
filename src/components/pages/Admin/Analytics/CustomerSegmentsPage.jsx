import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Star,
  TrendingUp,
  AlertTriangle,
  Crown,
  Heart,
  UserMinus,
  UserCheck,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import { getCustomerSegments, recalculateSegments } from "../../../../store/api/analyticsApi";
import { DonutChart, BarChart } from "../../../shared/Charts";

const CustomerSegmentsPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [segments, setSegments] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchSegments();
  }, [token, user, navigate]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerSegments(token, { limit: 100 });
      setSegments(data.segmentSummary || data.summary || null);
      setCustomers(data.customers || data || []);
    } catch (err) {
      console.error("Failed to fetch segments:", err);
      setError("Failed to load customer segments");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      setError(null);
      await recalculateSegments(token);
      await fetchSegments();
    } catch (err) {
      console.error("Failed to recalculate segments:", err);
      setError("Failed to recalculate segments");
    } finally {
      setRecalculating(false);
    }
  };

  const getSegmentIcon = (segment) => {
    switch (segment?.toLowerCase()) {
      case "champions":
      case "champion":
        return <Crown size={20} className="text-yellow-500" />;
      case "loyal":
      case "loyal customers":
        return <Heart size={20} className="text-red-500" />;
      case "at risk":
      case "at_risk":
        return <AlertTriangle size={20} className="text-orange-500" />;
      case "lost":
      case "churned":
        return <UserMinus size={20} className="text-gray-500" />;
      default:
        return <UserCheck size={20} className="text-blue-500" />;
    }
  };

  const getSegmentColor = (segment) => {
    switch (segment?.toLowerCase()) {
      case "champions":
      case "champion":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "loyal":
      case "loyal customers":
        return "bg-red-50 border-red-200 text-red-800";
      case "at risk":
      case "at_risk":
        return "bg-orange-50 border-orange-200 text-orange-800";
      case "lost":
      case "churned":
        return "bg-gray-50 border-gray-200 text-gray-800";
      case "potential":
      case "potential loyalists":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-green-50 border-green-200 text-green-800";
    }
  };

  const getChartColor = (segment) => {
    switch (segment?.toLowerCase()) {
      case "champions":
      case "champion":
        return "#EAB308";
      case "loyal":
      case "loyal customers":
        return "#EF4444";
      case "at risk":
      case "at_risk":
        return "#F97316";
      case "lost":
      case "churned":
        return "#6B7280";
      case "potential":
      case "potential loyalists":
        return "#3B82F6";
      default:
        return "#10B981";
    }
  };

  // Process segments data for charts
  const segmentChartData = segments
    ? Object.entries(segments).map(([name, data]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        value: data.count || data,
        color: getChartColor(name),
      }))
    : [];

  const rfmChartData = segments
    ? Object.entries(segments).map(([name, data]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        avgRfm: data.avgRfmScore?.toFixed(1) || 0,
        avgMonetary: Math.round(data.avgMonetary || 0),
      }))
    : [];

  if (loading) {
    return (
      <AdminLayout title="Customer Segments" subtitle="RFM & K-Means clustering analysis">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-merogreen" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/analytics")}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Segments</h1>
            <p className="text-gray-500">RFM & K-Means clustering analysis</p>
          </div>
        </div>
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-merogreen-dark transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={recalculating ? "animate-spin" : ""} />
          {recalculating ? "Recalculating..." : "Recalculate Segments"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Segment Overview */}
      {segments && Object.keys(segments).length > 0 ? (
        <>
          {/* Segment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Object.entries(segments).map(([name, data]) => (
              <div
                key={name}
                onClick={() => setSelectedSegment(selectedSegment === name ? null : name)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  selectedSegment === name
                    ? "ring-2 ring-merogreen"
                    : "hover:shadow-md"
                } ${getSegmentColor(name)}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  {getSegmentIcon(name)}
                  <h3 className="font-semibold capitalize">
                    {name.replace(/_/g, " ")}
                  </h3>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{data.count || data}</p>
                  <p className="text-sm opacity-75">customers</p>
                  {data.avgRfmScore && (
                    <p className="text-sm">
                      Avg RFM: <span className="font-medium">{data.avgRfmScore.toFixed(1)}</span>
                    </p>
                  )}
                  {data.avgMonetary && (
                    <p className="text-sm">
                      Avg Value: <span className="font-medium">Rs. {data.avgMonetary.toFixed(0)}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Distribution Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Segment Distribution</h3>
              <div className="h-64">
                <DonutChart
                  data={segmentChartData}
                  dataKey="value"
                  nameKey="name"
                />
              </div>
            </div>

            {/* RFM Scores Chart */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Average RFM Scores by Segment</h3>
              <div className="h-64">
                <BarChart
                  data={rfmChartData}
                  xKey="name"
                  bars={[{ dataKey: "avgRfm", color: "#10B981", name: "Avg RFM Score" }]}
                />
              </div>
            </div>
          </div>

          {/* Customer Table */}
          {customers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  {selectedSegment
                    ? `${selectedSegment.replace(/_/g, " ")} Customers`
                    : "All Customers"}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Segment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        RFM Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Recency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Frequency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Monetary
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers
                      .filter((c) => !selectedSegment || c.segment === selectedSegment)
                      .slice(0, 20)
                      .map((customer, index) => (
                        <tr key={customer._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users size={14} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {customer.user?.fullName || customer.fullName || "Unknown"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {customer.user?.email || customer.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium border ${getSegmentColor(
                                customer.segment
                              )}`}
                            >
                              {customer.segment?.replace(/_/g, " ") || "Unknown"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Star size={14} className="text-yellow-500" />
                              <span className="font-medium">{customer.rfmScore?.toFixed(1) || "N/A"}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {customer.recencyScore?.toFixed(0) || customer.recency || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {customer.frequencyScore?.toFixed(0) || customer.frequency || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            Rs. {customer.monetaryValue?.toLocaleString() || customer.monetary?.toLocaleString() || "0"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Segment Data Available</h3>
          <p className="text-gray-500 mb-6">
            Customer segments will appear here once calculated. Click "Recalculate Segments" to generate
            segments based on customer behavior.
          </p>
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-merogreen-dark transition disabled:opacity-50"
          >
            {recalculating ? "Calculating..." : "Calculate Segments Now"}
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-purple-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Users size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">About Customer Segmentation</h3>
            <p className="text-purple-700 text-sm mb-3">
              Customer segments are calculated using RFM (Recency, Frequency, Monetary) analysis combined
              with K-Means clustering. This helps identify your most valuable customers and those at risk of churning.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-purple-900">Champions</p>
                <p className="text-purple-600">Best customers, high RFM</p>
              </div>
              <div>
                <p className="font-medium text-purple-900">Loyal</p>
                <p className="text-purple-600">Frequent buyers</p>
              </div>
              <div>
                <p className="font-medium text-purple-900">At Risk</p>
                <p className="text-purple-600">Haven't purchased recently</p>
              </div>
              <div>
                <p className="font-medium text-purple-900">Lost</p>
                <p className="text-purple-600">Inactive customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomerSegmentsPage;
