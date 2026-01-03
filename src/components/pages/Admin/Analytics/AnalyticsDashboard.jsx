import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Eye,
  ShoppingCart,
  RefreshCw,
  Loader2,
  ChevronRight,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import {
  getDashboardAnalytics,
  getCustomerSegments,
  recalculateSegments,
} from "../../../../store/api/analyticsApi";
import { BarChart, LineChart, PieChart, DonutChart, FunnelChart } from "../../../shared/Charts";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [segments, setSegments] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [token, user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, segmentsData] = await Promise.all([
        getDashboardAnalytics(token),
        getCustomerSegments(token, { limit: 100 }),
      ]);

      setAnalytics(analyticsData);
      setSegments(segmentsData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSegments = async () => {
    try {
      setRefreshing(true);
      await recalculateSegments(token);
      await fetchData();
    } catch (err) {
      console.error("Failed to refresh segments:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Process data for charts
  const eventCountsData = analytics?.eventCounts?.map((e) => ({
    name: e._id?.replaceAll("_", " ") || "Unknown",
    count: e.count,
  })) || [];

  const dailyTrendsData = analytics?.dailyTrends?.reduce((acc, item) => {
    const date = item._id?.date;
    if (!acc[date]) {
      acc[date] = { date, views: 0, cart_adds: 0, purchases: 0 };
    }
    if (item._id?.eventType === "view") acc[date].views = item.count;
    if (item._id?.eventType === "add_to_cart") acc[date].cart_adds = item.count;
    if (item._id?.eventType === "purchase") acc[date].purchases = item.count;
    return acc;
  }, {});

  const trendsArray = Object.values(dailyTrendsData || {}).slice(-14);

  const segmentDistData = segments?.distribution?.map((s) => ({
    name: s._id || "Unknown",
    count: s.count,
  })) || [];

  const funnelData = analytics?.conversionFunnel ? [
    { name: "Sessions", value: analytics.conversionFunnel.totalSessions || 0 },
    { name: "Viewed", value: analytics.conversionFunnel.viewedSessions || 0 },
    { name: "Added to Cart", value: analytics.conversionFunnel.cartSessions || 0 },
    { name: "Purchased", value: analytics.conversionFunnel.purchaseSessions || 0 },
  ] : [];

  // Calculate conversion rates
  const viewToCartRate = analytics?.conversionFunnel?.viewedSessions > 0
    ? ((analytics.conversionFunnel.cartSessions / analytics.conversionFunnel.viewedSessions) * 100).toFixed(1)
    : 0;

  const cartToPurchaseRate = analytics?.conversionFunnel?.cartSessions > 0
    ? ((analytics.conversionFunnel.purchaseSessions / analytics.conversionFunnel.cartSessions) * 100).toFixed(1)
    : 0;

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard" subtitle="ML-powered insights and customer analytics">
        <div className="flex items-center justify-center h-96">
          <Loader2 size={48} className="animate-spin text-merogreen" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">ML-powered insights and customer analytics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics?.conversionFunnel?.totalSessions?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users size={24} className="text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Product Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventCountsData.find((e) => e.name === "view")?.count?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Eye size={24} className="text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cart Additions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventCountsData.find((e) => e.name === "add to cart")?.count?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <ShoppingCart size={24} className="text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {eventCountsData.find((e) => e.name === "purchase")?.count?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <DollarSign size={24} className="text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Event Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Event Distribution</h3>
                <BarChart3 size={20} className="text-gray-400" />
              </div>
              <BarChart
                data={eventCountsData}
                xKey="name"
                yKey="count"
                width={450}
                height={250}
                color="#10b981"
              />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Conversion Funnel</h3>
                <Activity size={20} className="text-gray-400" />
              </div>
              <FunnelChart data={funnelData} width={450} height={200} />
              <div className="mt-4 flex justify-around text-sm">
                <div className="text-center">
                  <p className="text-gray-500">View → Cart</p>
                  <p className="font-semibold text-lg text-merogreen">{viewToCartRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Cart → Purchase</p>
                  <p className="font-semibold text-lg text-merogreen">{cartToPurchaseRate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Trends */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Daily Views Trend</h3>
                <TrendingUp size={20} className="text-gray-400" />
              </div>
              <LineChart
                data={trendsArray}
                xKey="date"
                yKey="views"
                width={450}
                height={250}
                color="#3b82f6"
              />
            </div>

            {/* Customer Segments */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Customer Segments</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefreshSegments}
                    disabled={refreshing}
                    className="text-sm text-merogreen hover:text-green-700 flex items-center gap-1"
                  >
                    <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                    Recalculate
                  </button>
                  <PieChartIcon size={20} className="text-gray-400" />
                </div>
              </div>
              <PieChart
                data={segmentDistData}
                nameKey="name"
                valueKey="count"
                width={250}
                height={250}
              />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top Viewed Products</h3>
              <Package size={20} className="text-gray-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Views</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Category</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.topViewedProducts?.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{item.product?.name || "Unknown"}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-gray-600">{item.views?.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-500">{item.product?.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-merogreen">Rs. {item.product?.price}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Segment Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Segment Analysis</h3>
              <button
                onClick={() => navigate("/admin/analytics/segments")}
                className="text-sm text-merogreen hover:text-green-700 flex items-center gap-1"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {segments?.distribution?.slice(0, 6).map((segment, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{segment._id}</span>
                    <span className="text-sm bg-merogreen/10 text-merogreen px-2 py-1 rounded">
                      {segment.count} customers
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Avg RFM Score: {segment.avgRfmScore?.toFixed(1) || "N/A"}</p>
                    <p>Avg Monetary: Rs. {segment.avgMonetary?.toFixed(0) || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <button
              onClick={() => navigate("/admin/analytics/forecasting")}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp size={24} className="text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Demand Forecasting</h4>
                  <p className="text-sm text-gray-500">Prophet-based predictions</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/analytics/pricing")}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <DollarSign size={24} className="text-green-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dynamic Pricing</h4>
                  <p className="text-sm text-gray-500">ML-powered price optimization</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/analytics/segments")}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Users size={24} className="text-purple-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Customer Segments</h4>
                  <p className="text-sm text-gray-500">RFM & K-Means analysis</p>
                </div>
              </div>
            </button>
          </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
