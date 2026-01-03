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
  CheckCircle,
} from "lucide-react";
import AdminLayout from "../../../layout/AdminLayout";
import { useAuthStore } from "../../../../store/lib/authStore";
import {
  getDynamicPrices,
  calculateDynamicPrice,
  applyDynamicPrice,
} from "../../../../store/api/analyticsApi";

const DynamicPricingPage = () => {
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(null);
  const [applying, setApplying] = useState(null);
  const [prices, setPrices] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      const data = await getDynamicPrices(token);
      setPrices(data.prices || data || []);
    } catch (err) {
      console.error("Failed to fetch prices:", err);
      setError("Failed to load dynamic pricing data");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePrice = async (productId) => {
    try {
      setCalculating(productId);
      setError(null);
      await calculateDynamicPrice(token, productId);
      await fetchPrices();
      setSuccess("Price calculated successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to calculate price:", err);
      setError("Failed to calculate dynamic price");
    } finally {
      setCalculating(null);
    }
  };

  const handleApplyPrice = async (productId, priceId) => {
    try {
      setApplying(priceId);
      setError(null);
      await applyDynamicPrice(token, productId, priceId);
      await fetchPrices();
      setSuccess("Price applied successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to apply price:", err);
      setError("Failed to apply dynamic price");
    } finally {
      setApplying(null);
    }
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case "increase":
        return (
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <TrendingUp size={12} /> Increase Price
          </span>
        );
      case "decrease":
        return (
          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
            <TrendingDown size={12} /> Decrease Price
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium">
            Maintain Price
          </span>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dynamic Pricing" subtitle="ML-powered price optimization">
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
            <h1 className="text-2xl font-bold text-gray-900">Dynamic Pricing</h1>
            <p className="text-gray-500">ML-powered price optimization</p>
          </div>
        </div>
        <button
          onClick={fetchPrices}
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

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {/* Pricing Table */}
      {prices.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pricing Data Available</h3>
          <p className="text-gray-500 mb-6">
            Dynamic pricing recommendations will appear here once calculated from product performance data.
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
                    Recommended
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map((price, index) => {
                  const currentPrice = price.basePrice || price.product?.price || 0;
                  const priceChange = price.recommendedPrice - currentPrice;
                  const priceChangePercent = currentPrice > 0 ? ((priceChange / currentPrice) * 100).toFixed(1) : 0;

                  return (
                    <tr key={price._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Package size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {price.product?.name || `Product ${price.productId}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {price.product?.category || "Uncategorized"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          Rs. {currentPrice?.toLocaleString() || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-merogreen">
                          Rs. {price.recommendedPrice?.toLocaleString() || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${getPriceChangeColor(priceChange)}`}>
                          {priceChange > 0 ? "+" : ""}
                          {priceChangePercent}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-merogreen rounded-full"
                              style={{ width: `${(price.confidence || 0.7) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {((price.confidence || 0.7) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRecommendationBadge(price.adjustmentPercentage > 0 ? "increase" : price.adjustmentPercentage < 0 ? "decrease" : "maintain")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCalculatePrice(price.product?._id)}
                            disabled={calculating === price.product?._id}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            {calculating === price.product?._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              "Recalculate"
                            )}
                          </button>
                          <button
                            onClick={() => handleApplyPrice(price.product?._id, price._id)}
                            disabled={applying === price._id || price.applied}
                            className="px-3 py-1.5 text-sm bg-merogreen text-white rounded-lg hover:bg-merogreen-dark transition disabled:opacity-50"
                          >
                            {applying === price._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : price.applied ? (
                              "Applied"
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            <h3 className="font-semibold text-green-900 mb-2">About Dynamic Pricing</h3>
            <p className="text-green-700 text-sm">
              Our dynamic pricing engine uses machine learning to analyze demand patterns, competitor prices,
              inventory levels, and market conditions. Recommendations are generated to maximize revenue while
              maintaining competitive positioning. Always review recommendations before applying.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DynamicPricingPage;
