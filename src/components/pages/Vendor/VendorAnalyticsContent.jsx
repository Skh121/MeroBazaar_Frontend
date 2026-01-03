import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Eye,
  ShoppingCart,
  RefreshCw,
  Loader2,
  Package,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../../../store/lib/authStore";
import { getVendorAnalytics, getVendorDynamicPrices, calculateVendorDynamicPrice } from "../../../store/api/analyticsApi";
import { LineChart, BarChart } from "../../shared/Charts";

const VendorAnalyticsContent = () => {
  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [prices, setPrices] = useState([]);
  const [calculatingPrice, setCalculatingPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, pricesData] = await Promise.all([
        getVendorAnalytics(token),
        getVendorDynamicPrices(token, { isActive: true }),
      ]);

      setAnalytics(analyticsData);
      setPrices(pricesData.prices || []);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePrice = async (productId) => {
    try {
      setCalculatingPrice(productId);
      await calculateVendorDynamicPrice(token, productId);
      const pricesData = await getVendorDynamicPrices(token, { isActive: true });
      setPrices(pricesData.prices || []);
    } catch (err) {
      console.error("Failed to calculate price:", err);
    } finally {
      setCalculatingPrice(null);
    }
  };

  // Process data for charts
  const dailyTrends = analytics?.dailyTrends?.map((d) => ({
    date: d._id?.date,
    views: d.views || 0,
    cartAdds: d.cartAdds || 0,
    purchases: d.purchases || 0,
  })) || [];

  // Aggregate product stats
  const productStats = {};
  analytics?.productStats?.forEach((stat) => {
    const productId = stat._id?.product?.toString();
    if (!productStats[productId]) {
      productStats[productId] = { views: 0, cartAdds: 0, purchases: 0 };
    }
    if (stat._id?.eventType === "view") productStats[productId].views = stat.count;
    if (stat._id?.eventType === "add_to_cart") productStats[productId].cartAdds = stat.count;
    if (stat._id?.eventType === "purchase") productStats[productId].purchases = stat.count;
  });

  const totalViews = Object.values(productStats).reduce((sum, p) => sum + p.views, 0);
  const totalCartAdds = Object.values(productStats).reduce((sum, p) => sum + p.cartAdds, 0);
  const totalPurchases = Object.values(productStats).reduce((sum, p) => sum + p.purchases, 0);

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
          <p className="text-gray-500">Track your product performance and optimize pricing</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalCartAdds.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{totalPurchases.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign size={24} className="text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Trends */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Daily Performance (Last 30 Days)</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <LineChart
            data={dailyTrends}
            xKey="date"
            yKey="views"
            width={450}
            height={250}
            color="#10b981"
          />
        </div>

        {/* Conversion Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Conversion Overview</h3>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
          <BarChart
            data={[
              { name: "Views", count: totalViews },
              { name: "Cart Adds", count: totalCartAdds },
              { name: "Purchases", count: totalPurchases },
            ]}
            xKey="name"
            yKey="count"
            width={450}
            height={250}
            color="#3b82f6"
          />
          <div className="mt-4 flex justify-around text-sm">
            <div className="text-center">
              <p className="text-gray-500">View → Cart Rate</p>
              <p className="font-semibold text-lg text-merogreen">
                {totalViews > 0 ? ((totalCartAdds / totalViews) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Cart → Purchase Rate</p>
              <p className="font-semibold text-lg text-merogreen">
                {totalCartAdds > 0 ? ((totalPurchases / totalCartAdds) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Pricing Recommendations */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Dynamic Pricing Recommendations</h3>
          <DollarSign size={20} className="text-gray-400" />
        </div>

        {prices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Current Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Recommended</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Change</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Reason</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {price.product?.name || "Unknown"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-gray-600">Rs. {price.basePrice}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-medium text-merogreen">
                        Rs. {price.recommendedPrice}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-sm font-medium ${
                          price.adjustmentPercentage > 0
                            ? "text-green-600"
                            : price.adjustmentPercentage < 0
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {price.adjustmentPercentage > 0 ? "+" : ""}
                        {price.adjustmentPercentage?.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {price.adjustmentReason?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleCalculatePrice(price.product?._id)}
                        disabled={calculatingPrice === price.product?._id}
                        className="text-sm text-merogreen hover:text-green-700"
                      >
                        {calculatingPrice === price.product?._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          "Recalculate"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No pricing recommendations yet.</p>
            <p className="text-sm">Recommendations will appear as your products gain more traction.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorAnalyticsContent;
