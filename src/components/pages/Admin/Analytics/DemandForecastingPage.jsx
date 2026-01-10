import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  ArrowLeft,
  Calendar,
  Package,
  AlertTriangle,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import {
  getDemandForecasts,
  generateForecast,
} from "../../../../store/api/analyticsApi";
import { LineChart } from "../../../shared/Charts";

const DemandForecastingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [forecasts, setForecasts] = useState([]);
  const [error, setError] = useState(null);

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
      const data = await getDemandForecasts(token);
      setForecasts(data.forecasts || data || []);
    } catch (err) {
      console.error("Failed to fetch forecasts:", err);
      setError("Failed to load demand forecasts");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateForecast = async (productId) => {
    try {
      setGenerating(true);
      await generateForecast(token, productId, 30);
      await fetchForecasts();
    } catch (err) {
      console.error("Failed to generate forecast:", err);
      setError("Failed to generate forecast");
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50";
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <AdminLayout
        title="Demand Forecasting"
        subtitle="Prophet-based demand predictions"
      >
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
            <p className="text-gray-500">Prophet-based demand predictions</p>
          </div>
        </div>
        <button
          onClick={fetchForecasts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-merogreen-dark transition disabled:opacity-50"
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

      {/* Forecasts Grid */}
      {forecasts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Forecasts Available
          </h3>
          <p className="text-gray-500 mb-6">
            Demand forecasts will appear here once generated from product sales
            data.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forecasts.map((forecast, index) => (
            <div
              key={forecast._id || index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Package size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {forecast.product?.name ||
                        `Product ${forecast.productId}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      <Calendar size={12} className="inline mr-1" />
                      {forecast.forecastDays || 30} day forecast
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
                    forecast.confidence || 0.7
                  )}`}
                >
                  {((forecast.confidence || 0.7) * 100).toFixed(0)}% confidence
                </span>
              </div>

              {/* Forecast Chart */}
              {forecast.predictions && forecast.predictions.length > 0 && (
                <div className="h-48 mb-4">
                  <LineChart
                    data={forecast.predictions.slice(0, 14).map((p) => ({
                      date: formatDate(p.date),
                      predicted: Math.round(p.predicted || p.yhat || 0),
                      lower: Math.round(p.lower || p.yhat_lower || 0),
                      upper: Math.round(p.upper || p.yhat_upper || 0),
                    }))}
                    xKey="date"
                    lines={[
                      {
                        dataKey: "predicted",
                        color: "#10B981",
                        name: "Predicted",
                      },
                      {
                        dataKey: "lower",
                        color: "#94A3B8",
                        name: "Lower Bound",
                        strokeDasharray: "5 5",
                      },
                      {
                        dataKey: "upper",
                        color: "#94A3B8",
                        name: "Upper Bound",
                        strokeDasharray: "5 5",
                      },
                    ]}
                  />
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Avg Daily</p>
                  <p className="font-semibold text-gray-900">
                    {forecast.avgDaily?.toFixed(0) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Peak Day</p>
                  <p className="font-semibold text-gray-900">
                    {forecast.peakDemand?.toFixed(0) || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trend</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    {forecast.trend === "up" ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingUp
                        size={14}
                        className="text-red-500 rotate-180"
                      />
                    )}
                    {forecast.trend || "Stable"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
              Our demand forecasting uses Prophet, a time-series forecasting
              model developed by Meta. It analyzes historical sales patterns,
              seasonality, and trends to predict future demand. Use these
              insights to optimize inventory levels and prevent stockouts.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DemandForecastingPage;
