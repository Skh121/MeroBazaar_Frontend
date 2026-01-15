import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart as RechartsBar,
  Bar,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  RefreshCw,
  Loader2,
  ChevronRight,
  Store,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import {
  getAdminDashboardStats,
  getAdminCustomerSegments,
} from "../../../../store/api/analyticsApi";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [segments, setSegments] = useState(null);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState(7);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [token, user, navigate, chartPeriod]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, segmentsData] = await Promise.all([
        getAdminDashboardStats(token, chartPeriod),
        getAdminCustomerSegments(token),
      ]);

      setStats(statsData);
      setSegments(segmentsData);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 100000) {
      return `Rs.${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `Rs.${(value / 1000).toFixed(1)}K`;
    }
    return `Rs.${value?.toFixed(0) || 0}`;
  };

  // Prepare segment data for pie chart
  const segmentChartData = segments?.segments
    ? Object.entries(segments.segments).map(([name, data]) => ({
        name,
        value: data.count,
        color: segments.segmentColors?.[name] || "#6B7280",
      }))
    : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-sm text-merogreen">
            Revenue: Rs.{payload[0]?.value?.toLocaleString()}
          </p>
          <p className="text-sm text-blue-500">
            Orders: {payload[0]?.payload?.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <AdminLayout>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Platform-wide insights and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={chartPeriod}
            onChange={(e) => setChartPeriod(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-merogreen"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
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
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.totalRevenue || 0)}
              </p>
              <div className="flex items-center mt-1">
                {stats?.revenueGrowth >= 0 ? (
                  <ArrowUpRight size={16} className="text-green-500" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    stats?.revenueGrowth >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {Math.abs(stats?.revenueGrowth || 0)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign size={24} className="text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOrders?.toLocaleString() || 0}
              </p>
              <div className="flex items-center mt-1">
                {stats?.ordersGrowth >= 0 ? (
                  <ArrowUpRight size={16} className="text-green-500" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    stats?.ordersGrowth >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {Math.abs(stats?.ordersGrowth || 0)}%
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <ShoppingCart size={24} className="text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalCustomers?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {segments?.totalCustomers || 0} with orders
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users size={24} className="text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Vendors</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalVendors?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {stats?.totalProducts || 0} products
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Store size={24} className="text-yellow-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.revenueChartData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) =>
                    `Rs.${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Order Status Distribution
            </h3>
            <Package size={20} className="text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={stats?.orderStatusData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {stats?.orderStatusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Customer Segments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Customer Segments</h3>
            <button
              onClick={() => navigate("/admin/analytics/segments")}
              className="text-sm text-merogreen hover:text-green-700 flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={segmentChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Top Selling Products
            </h3>
            <Package size={20} className="text-gray-400" />
          </div>
          <div className="overflow-y-auto max-h-64">
            <table className="w-full">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-500">
                    Product
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">
                    Sold
                  </th>
                  <th className="text-right py-2 px-2 text-sm font-medium text-gray-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.topProducts?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 px-2">
                      <span className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="text-gray-600 text-sm">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className="font-medium text-merogreen text-sm">
                        Rs.{item.revenue?.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Segment Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Customer Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-sm text-green-600">Champions</p>
            <p className="text-2xl font-bold text-green-700">
              {segments?.insights?.championsCount || 0}
            </p>
            <p className="text-xs text-green-500">High value customers</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-600">New Customers</p>
            <p className="text-2xl font-bold text-blue-700">
              {segments?.insights?.newCustomersCount || 0}
            </p>
            <p className="text-xs text-blue-500">Recent first purchase</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-sm text-red-600">At Risk</p>
            <p className="text-2xl font-bold text-red-700">
              {segments?.insights?.atRiskCount || 0}
            </p>
            <p className="text-xs text-red-500">Need re-engagement</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-sm text-purple-600">Avg Customer Value</p>
            <p className="text-2xl font-bold text-purple-700">
              Rs.{segments?.insights?.avgCustomerValue?.toFixed(0) || 0}
            </p>
            <p className="text-xs text-purple-500">Lifetime value</p>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate("/admin/analytics/forecasting")}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:shadow-md transition"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <TrendingUp size={24} className="text-blue-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Demand Forecasting
              </h4>
              <p className="text-sm text-gray-500">
                Sales predictions & stock alerts
              </p>
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
              <p className="text-sm text-gray-500">
                Price optimization suggestions
              </p>
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
              <p className="text-sm text-gray-500">RFM analysis & targeting</p>
            </div>
          </div>
        </button>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsDashboard;
