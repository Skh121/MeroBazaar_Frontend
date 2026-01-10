import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  DollarSign,
  Store,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowUpRight,
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
} from "recharts";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AdminDashboardContent = ({ token }) => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 10000000) {
      return `NPR ${(value / 10000000).toFixed(1)}Cr`;
    } else if (value >= 100000) {
      return `NPR ${(value / 100000).toFixed(1)}L`;
    } else if (value >= 1000) {
      return `NPR ${(value / 1000).toFixed(1)}K`;
    }
    return `NPR ${value?.toLocaleString() || 0}`;
  };

  const formatChartValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value;
  };

  // Custom tooltip for revenue chart
  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-sm text-merogreen">
            Revenue: NPR {payload[0]?.value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="text-merogreen animate-spin" />
      </div>
    );
  }

  const { stats, revenueTrend, regionalDistribution, topVendors } = dashboardData || {};

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Platform Overview</h1>
        <p className="text-gray-500">Monitor MeroBazaar marketplace performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-merogreen" />
            </div>
            {stats?.revenueGrowth !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stats?.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats?.revenueGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stats?.revenueGrowth >= 0 ? "+" : ""}{stats?.revenueGrowth}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats?.totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Platform-wide revenue</p>
        </div>

        {/* Active Vendors */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Store size={20} className="text-blue-600" />
            </div>
            {stats?.newVendorsThisMonth > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp size={14} />
                +{stats?.newVendorsThisMonth}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Vendors</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.activeVendors || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Registered vendors</p>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-orange-500" />
            </div>
            {stats?.newCustomersThisMonth > 0 && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp size={14} />
                +{stats?.newCustomersThisMonth?.toLocaleString()}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalCustomers?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Active users</p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-purple-600" />
            </div>
            {stats?.ordersGrowth !== 0 && (
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stats?.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {stats?.ordersGrowth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {stats?.ordersGrowth >= 0 ? "+" : ""}{stats?.ordersGrowth}%
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{stats?.totalOrders?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-400 mt-1">This month</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Platform Revenue Trend</h3>
            <p className="text-sm text-gray-500">Monthly revenue and order volume</p>
          </div>

          {revenueTrend?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenueTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9CA3AF"
                    tickFormatter={formatChartValue}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenueTrend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">No revenue data available</p>
            </div>
          )}

          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-3 h-3 bg-merogreen rounded-full" />
              Revenue (NPR)
            </div>
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Regional Distribution</h3>
            <p className="text-sm text-gray-500">Sales by region</p>
          </div>

          {regionalDistribution?.length > 0 ? (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionalDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {regionalDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `NPR ${value?.toLocaleString()} (${props.payload.percentage}%)`,
                        props.payload.name,
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {regionalDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-600 truncate">{item.name}</span>
                    <span className="text-gray-400 ml-auto">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-400">No regional data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Vendors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800">Top Performing Vendors</h3>
            <p className="text-sm text-gray-500">Based on revenue and growth</p>
          </div>
          <Link
            to="/admin/vendors"
            className="text-sm text-merogreen font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        {topVendors?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topVendors.map((vendor, index) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-700"
                            : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{vendor.businessName}</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="font-medium text-gray-800">
                        NPR {vendor.revenue?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-600">{vendor.orders}</td>
                    <td className="px-5 py-4 text-center text-gray-600">{vendor.products}</td>
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          vendor.growth >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {vendor.growth >= 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                        {vendor.growth >= 0 ? "+" : ""}{vendor.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Store size={48} className="mx-auto mb-2 opacity-30" />
            <p>No vendor performance data yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardContent;
