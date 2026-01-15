import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import { getAdminDemandForecasts } from "../../../../store/api/analyticsApi";

const DemandForecastingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchForecasts();
  }, [token, user, navigate]);

  const fetchForecasts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDemandForecasts(token);
      setForecasts(data.forecasts || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch forecasts:", err);
      setError("Failed to load demand forecasts");
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp size={16} className="text-green-500" />;
      case "decreasing":
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <span className="text-gray-400">—</span>;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing":
        return "text-green-600 bg-green-50 border-green-200";
      case "decreasing":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStockStatusBadge = (status) => {
    switch (status) {
      case "adequate":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <CheckCircle size={12} /> Adequate
          </span>
        );
      case "low":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <AlertCircle size={12} /> Low Stock
          </span>
        );
      case "critical":
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertTriangle size={12} /> Critical
          </span>
        );
      default:
        return null;
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
              Demand Forecasting
            </h1>
            <p className="text-gray-500">
              Sales predictions based on order history
            </p>
          </div>
        </div>
        <button
          onClick={fetchForecasts}
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
              <p className="text-sm text-gray-500">Increasing Trend</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {summary.increasingTrend}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-red-500" />
              <p className="text-sm text-gray-500">Decreasing Trend</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {summary.decreasingTrend}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-yellow-500" />
              <p className="text-sm text-gray-500">Low Stock Alerts</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {summary.lowStockAlerts}
            </p>
          </div>
        </div>
      )}

      {/* Forecasts Grid */}
      {forecasts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Forecasts Available
          </h3>
          <p className="text-gray-500">
            Demand forecasts will appear here once there's enough order history
            to analyze.
          </p>
        </div>
      ) : (
        <>
          {/* Selected Product Detail */}
          {selectedProduct && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedProduct.product?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedProduct.product?.vendor?.businessName ||
                        "Unknown Vendor"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              {/* Forecast Chart */}
              {selectedProduct.forecast &&
                selectedProduct.forecast.length > 0 && (
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedProduct.forecast}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(date) =>
                            new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value, name) => [
                            value,
                            name === "predictedQuantity"
                              ? "Predicted Sales"
                              : name,
                          ]}
                          labelFormatter={(date) =>
                            new Date(date).toLocaleDateString()
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="predictedQuantity"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{ fill: "#10B981" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

              {/* Historical Data */}
              {selectedProduct.historicalData &&
                selectedProduct.historicalData.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Historical Sales (Last 30 Days)
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedProduct.historicalData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            tickFormatter={(date) =>
                              new Date(date).toLocaleDateString("en-US", {
                                day: "numeric",
                              })
                            }
                          />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="quantity"
                            stroke="#3B82F6"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Product Forecasts</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Trend
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Avg Daily
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      14-Day Forecast
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forecasts.map((forecast, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedProduct(forecast)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {forecast.product?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {forecast.product?.category}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTrendColor(
                            forecast.trend
                          )}`}
                        >
                          {getTrendIcon(forecast.trend)}
                          {forecast.trend === "insufficient_data"
                            ? "No Data"
                            : `${forecast.trendPercentage > 0 ? "+" : ""}${
                                forecast.trendPercentage
                              }%`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {forecast.avgDailySales || 0}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {forecast.totalForecastDemand || 0} units
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {forecast.currentStock || 0}
                      </td>
                      <td className="px-6 py-4">
                        {getStockStatusBadge(forecast.stockStatus)}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        Rs.{forecast.totalRevenue?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              About Demand Forecasting
            </h3>
            <p className="text-blue-700 text-sm">
              Demand forecasts are calculated from actual order history using
              moving averages and trend analysis. Products with increasing
              trends and low stock should be restocked soon. Click on any
              product to see detailed historical data and 14-day predictions.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DemandForecastingPage;
