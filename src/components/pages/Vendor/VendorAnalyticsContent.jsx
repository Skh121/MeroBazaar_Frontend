import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  RefreshCw,
  Loader2,
  Package,
  DollarSign,
  Calendar,
  Users,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAuthStore } from "../../../store/lib/authStore";
import {
  getVendorAnalytics,
  getVendorCustomerSegments,
  getVendorDemandForecasts,
  getVendorPricingSuggestions,
} from "../../../store/api/analyticsApi";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "segments", label: "Customer Segments", icon: Users },
  { id: "forecasts", label: "Demand Forecasting", icon: TrendingUp },
  { id: "pricing", label: "Dynamic Pricing", icon: DollarSign },
];

const VendorAnalyticsContent = () => {
  const token = useAuthStore((state) => state.token);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [segments, setSegments] = useState(null);
  const [forecasts, setForecasts] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      switch (activeTab) {
        case "overview":
          const analyticsData = await getVendorAnalytics(token);
          setAnalytics(analyticsData);
          break;
        case "segments":
          const segmentsData = await getVendorCustomerSegments(token);
          setSegments(segmentsData);
          break;
        case "forecasts":
          const forecastsData = await getVendorDemandForecasts(token);
          setForecasts(forecastsData);
          break;
        case "pricing":
          const pricingData = await getVendorPricingSuggestions(token);
          setPricing(pricingData);
          break;
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  // Process overview data for charts
  const dailyTrends =
    analytics?.dailyTrends?.map((d) => ({
      date: d._id?.date,
      views: d.views || 0,
      cartAdds: d.cartAdds || 0,
      purchases: d.purchases || 0,
    })) || [];

  const productStats = {};
  analytics?.productStats?.forEach((stat) => {
    const productId = stat._id?.product?.toString();
    if (!productStats[productId]) {
      productStats[productId] = { views: 0, cartAdds: 0, purchases: 0 };
    }
    if (stat._id?.eventType === "view")
      productStats[productId].views = stat.count;
    if (stat._id?.eventType === "add_to_cart")
      productStats[productId].cartAdds = stat.count;
    if (stat._id?.eventType === "purchase")
      productStats[productId].purchases = stat.count;
  });

  const totalViews = Object.values(productStats).reduce(
    (sum, p) => sum + p.views,
    0
  );
  const totalCartAdds = Object.values(productStats).reduce(
    (sum, p) => sum + p.cartAdds,
    0
  );
  const totalPurchases = Object.values(productStats).reduce(
    (sum, p) => sum + p.purchases,
    0
  );

  const renderOverviewTab = () => (
    <div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.totalProducts || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Product Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalViews.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Eye size={24} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cart Additions</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCartAdds.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <ShoppingCart size={24} className="text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Purchases</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalPurchases.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Daily Performance (Last 30 Days)
            </h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          {dailyTrends.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#9CA3AF"
                  />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="#10B981"
                    fill="url(#colorViews)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Conversion Funnel</h3>
            <Target size={20} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Views", count: totalViews, fill: "#10B981" },
                  { name: "Cart Adds", count: totalCartAdds, fill: "#F59E0B" },
                  { name: "Purchases", count: totalPurchases, fill: "#3B82F6" },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-around text-sm">
            <div className="text-center">
              <p className="text-gray-500">View to Cart</p>
              <p className="font-semibold text-lg text-merogreen">
                {totalViews > 0
                  ? ((totalCartAdds / totalViews) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Cart to Purchase</p>
              <p className="font-semibold text-lg text-merogreen">
                {totalCartAdds > 0
                  ? ((totalPurchases / totalCartAdds) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSegmentsTab = () => {
    if (!segments) return null;

    const pieData = Object.entries(segments.segments || {}).map(
      ([name, data]) => ({
        name,
        value: data.count,
        color: segments.segmentColors?.[name] || "#6B7280",
      })
    );

    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {segments.totalCustomers || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Champions</p>
                <p className="text-2xl font-bold text-green-600">
                  {segments.insights?.championsCount || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {segments.insights?.atRiskCount || 0}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle size={24} className="text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Customer Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  Rs.
                  {Math.round(
                    segments.insights?.avgCustomerValue || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign size={24} className="text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Segment Distribution Pie Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              Customer Segment Distribution
            </h3>
            {pieData.length > 0 ? (
              <>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} customers`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                      <span className="font-medium text-gray-800 ml-auto">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-400">No customer data yet</p>
              </div>
            )}
          </div>

          {/* Segment Insights */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              Segment Insights
            </h3>
            <div className="space-y-4">
              {Object.entries(segments.segments || {}).map(([name, data]) => (
                <div key={name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            segments.segmentColors?.[name] || "#6B7280",
                        }}
                      />
                      <span className="font-medium text-gray-800">{name}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {data.count} customers
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Revenue</span>
                    <span className="font-medium">
                      Rs.{Math.round(data.totalRevenue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Avg. Value</span>
                    <span className="font-medium">
                      Rs.{Math.round(data.avgOrderValue).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Top Customers</h3>
          </div>
          {segments.customers?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Segment
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Orders
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Total Spent
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Last Order
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {segments.customers.slice(0, 10).map((customer, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {customer.user?.fullName || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.user?.email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="px-2.5 py-1 rounded-full text-xs font-medium text-white"
                          style={{
                            backgroundColor:
                              segments.segmentColors?.[customer.segment] ||
                              "#6B7280",
                          }}
                        >
                          {customer.segment}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">
                        {customer.totalOrders}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-800">
                        Rs.{Math.round(customer.totalSpent).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-500">
                        {customer.daysSinceLastOrder} days ago
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No customer data yet
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderForecastsTab = () => {
    if (!forecasts) return null;

    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Products Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {forecasts.summary?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trending Up</p>
                <p className="text-2xl font-bold text-green-600">
                  {forecasts.summary?.increasingTrend || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trending Down</p>
                <p className="text-2xl font-bold text-red-600">
                  {forecasts.summary?.decreasingTrend || 0}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown size={24} className="text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Stock Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {forecasts.summary?.lowStockAlerts || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle size={24} className="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Forecasts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">
              Product Demand Forecasts (14-Day)
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Based on historical sales patterns and trends
            </p>
          </div>

          {forecasts.forecasts?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Trend
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Avg. Daily
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      14-Day Forecast
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Current Stock
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Stock Status
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Confidence
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forecasts.forecasts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Rs.{item.product?.price}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {item.trend === "increasing" ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm">
                              <ArrowUpRight size={16} />+{item.trendPercentage}%
                            </span>
                          ) : item.trend === "decreasing" ? (
                            <span className="flex items-center gap-1 text-red-600 text-sm">
                              <ArrowDownRight size={16} />
                              {item.trendPercentage}%
                            </span>
                          ) : item.trend === "insufficient_data" ? (
                            <span className="text-gray-400 text-sm">
                              No data
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500 text-sm">
                              <Minus size={16} />
                              Stable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">
                        {item.avgDailySales || 0} units
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-gray-800">
                        {item.totalForecastDemand || 0} units
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">
                        {item.currentStock || 0}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.stockStatus === "adequate"
                              ? "bg-green-100 text-green-700"
                              : item.stockStatus === "low"
                              ? "bg-yellow-100 text-yellow-700"
                              : item.stockStatus === "critical"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.stockStatus || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.confidence >= 70
                                  ? "bg-green-500"
                                  : item.confidence >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${item.confidence || 0}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs text-gray-500">
                            {item.confidence || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No forecast data available yet.</p>
              <p className="text-sm">
                Forecasts will appear as you get more sales.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPricingTab = () => {
    if (!pricing) return null;

    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Products Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pricing.summary?.totalProducts || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package size={24} className="text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Price Increase Opp.</p>
                <p className="text-2xl font-bold text-green-600">
                  {pricing.summary?.priceIncreaseOpportunities || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ArrowUpRight size={24} className="text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Price Decrease Rec.</p>
                <p className="text-2xl font-bold text-red-600">
                  {pricing.summary?.priceDecreaseRecommendations || 0}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <ArrowDownRight size={24} className="text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Potential Revenue</p>
                <p className="text-2xl font-bold text-merogreen">
                  Rs.
                  {(
                    pricing.summary?.potentialMonthlyRevenue || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <DollarSign size={24} className="text-merogreen" />
              </div>
            </div>
          </div>
        </div>

        {/* High Priority Alerts */}
        {pricing.summary?.highPriorityCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-yellow-600" size={24} />
              <div>
                <p className="font-medium text-yellow-800">
                  {pricing.summary.highPriorityCount} High Priority Pricing
                  Recommendations
                </p>
                <p className="text-sm text-yellow-700">
                  These products need immediate attention based on demand and
                  inventory levels.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Suggestions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">
              Dynamic Pricing Suggestions
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Recommendations based on demand, conversion rates, and stock
              levels
            </p>
          </div>

          {pricing.suggestions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Current Price
                    </th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Suggested
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Change
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Demand
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pricing.suggestions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Stock: {item.product?.stock} | Views:{" "}
                          {item.metrics?.views}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-600">
                        Rs.{item.product?.currentPrice?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-merogreen">
                        Rs.{item.suggestion?.recommendedPrice?.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {item.suggestion?.adjustmentPercentage !== 0 ? (
                          <span
                            className={`flex items-center justify-center gap-1 text-sm font-medium ${
                              item.suggestion?.adjustmentPercentage > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {item.suggestion?.adjustmentPercentage > 0 ? (
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownRight size={16} />
                            )}
                            {item.suggestion?.adjustmentPercentage > 0
                              ? "+"
                              : ""}
                            {item.suggestion?.adjustmentPercentage}%
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No change
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            item.metrics?.demandTrend === "high"
                              ? "bg-green-100 text-green-700"
                              : item.metrics?.demandTrend === "low"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.metrics?.demandTrend || "stable"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.suggestion?.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : item.suggestion?.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.suggestion?.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-xs">
                        {item.suggestion?.reason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No pricing suggestions available yet.</p>
              <p className="text-sm">
                Suggestions will appear as your products gain more traction.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={48} className="animate-spin text-merogreen" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-500">Insights to grow your business</p>
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-merogreen text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "segments" && renderSegmentsTab()}
      {activeTab === "forecasts" && renderForecastsTab()}
      {activeTab === "pricing" && renderPricingTab()}
    </div>
  );
};

export default VendorAnalyticsContent;
