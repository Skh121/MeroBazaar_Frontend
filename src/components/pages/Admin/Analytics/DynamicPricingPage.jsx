import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  RefreshCw,
  Loader2,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  Eye,
  ShoppingCart,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import { getAdminPricingSuggestions } from "../../../../store/api/analyticsApi";

const DynamicPricingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchPrices();
  }, [token, user, navigate]);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminPricingSuggestions(token);
      setSuggestions(data.suggestions || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError("Failed to load pricing suggestions");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
            High Priority
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
            Low
          </span>
        );
    }
  };

  const getDemandBadge = (trend) => {
    switch (trend) {
      case "high":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
            <TrendingUp size={12} /> High
          </span>
        );
      case "low":
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
            <TrendingDown size={12} /> Low
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
            Stable
          </span>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
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
            <h1 className="text-2xl font-bold text-gray-900">
              Dynamic Pricing
            </h1>
            <p className="text-gray-500">
              Price optimization suggestions based on sales data
            </p>
          </div>
        </div>
        <button
          onClick={fetchPrices}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={20} />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">
              {summary.totalProducts}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <p className="text-sm text-gray-500">Price Increase</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summary.priceIncreaseOpportunities}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-red-500" />
              <p className="text-sm text-gray-500">Price Decrease</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {summary.priceDecreaseRecommendations}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <p className="text-sm text-gray-500">High Priority</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.highPriorityCount}
            </p>
          </div>
        </div>
      )}

      {/* Pricing Table */}
      {suggestions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Pricing Suggestions Available
          </h3>
          <p className="text-gray-500">
            Pricing suggestions will appear here once there's enough sales data
            to analyze.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Suggested
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demand
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metrics
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suggestions.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.product?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.product?.vendor?.businessName ||
                              item.product?.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        Rs.
                        {item.product?.currentPrice?.toLocaleString() || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          item.suggestion?.adjustmentPercentage > 0
                            ? "text-green-600"
                            : item.suggestion?.adjustmentPercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        Rs.
                        {item.suggestion?.recommendedPrice?.toLocaleString() ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`font-medium ${
                          item.suggestion?.adjustmentPercentage > 0
                            ? "text-green-600"
                            : item.suggestion?.adjustmentPercentage < 0
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.suggestion?.adjustmentPercentage > 0 ? "+" : ""}
                        {item.suggestion?.adjustmentPercentage || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getDemandBadge(item.metrics?.demandTrend)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <ShoppingCart size={12} />
                          <span>{item.metrics?.totalSold || 0} sold</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{item.metrics?.views || 0} views</span>
                        </div>
                        <div>
                          <span>
                            {item.metrics?.conversionRate || 0}% conv.
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(item.suggestion?.priority)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs">
                        {item.suggestion?.reason ||
                          "No specific recommendation"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-green-50 rounded-xl p-6 border border-green-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign size={24} className="text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 mb-2">
              About Dynamic Pricing
            </h3>
            <p className="text-green-700 text-sm mb-3">
              Pricing suggestions are calculated based on sales velocity,
              inventory levels, conversion rates, and demand trends. High
              priority suggestions indicate significant opportunities or risks
              that should be addressed soon.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-900">
                  High Demand + Low Stock
                </p>
                <p className="text-green-600">Consider price increase</p>
              </div>
              <div>
                <p className="font-medium text-green-900">
                  Low Demand + High Stock
                </p>
                <p className="text-green-600">Consider price decrease</p>
              </div>
              <div>
                <p className="font-medium text-green-900">
                  High Views + Low Conversion
                </p>
                <p className="text-green-600">Price may be too high</p>
              </div>
              <div>
                <p className="font-medium text-green-900">High Conversion</p>
                <p className="text-green-600">Room for price increase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DynamicPricingPage;
