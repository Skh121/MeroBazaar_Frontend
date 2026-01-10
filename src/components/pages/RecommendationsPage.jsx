import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  Package,
  TrendingUp,
  Snowflake,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuthStore } from "../../store/lib/authStore";
import { useCartStore } from "../../store/lib/cartStore";
import { useWishlistStore } from "../../store/lib/wishlistStore";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL?.replace("/api", "") || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();

  const [activeTab, setActiveTab] = useState("forYou");
  const [forYouProducts, setForYouProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [seasonalProducts, setSeasonalProducts] = useState([]);
  const [currentSeason, setCurrentSeason] = useState("Winter");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(null);

  // Fetch wishlist on mount if logged in
  useEffect(() => {
    if (token) {
      fetchWishlist(token);
    }
  }, [token, fetchWishlist]);

  // Fetch initial recommendations
  useEffect(() => {
    fetchRecommendations(activeTab);
  }, [token]);

  // Fetch when tab changes
  useEffect(() => {
    // Only fetch if we don't have data for this tab
    const hasData =
      (activeTab === "forYou" && forYouProducts.length > 0) ||
      (activeTab === "trending" && trendingProducts.length > 0) ||
      (activeTab === "seasonal" && seasonalProducts.length > 0);

    if (!hasData) {
      fetchRecommendations(activeTab);
    }
  }, [activeTab]);

  const fetchRecommendations = async (tab) => {
    const isInitialLoad = loading;
    if (!isInitialLoad) setTabLoading(true);

    try {
      let response;

      switch (tab) {
        case "forYou":
          if (token) {
            // Logged in - get personalized recommendations
            response = await axios.get(`${API_URL}/analytics/recommendations`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { limit: 12, type: "forYou" },
            });
          } else {
            // Guest - get trending as fallback for "For You"
            response = await axios.get(`${API_URL}/analytics/recommendations/trending`, {
              params: { limit: 12 },
            });
          }

          if (response.data.success && response.data.recommendations) {
            const products = response.data.recommendations.map((rec) => ({
              ...(rec.product || rec),
              recommendationReason: rec.reason || "Recommended for you",
            }));
            setForYouProducts(products);
          }
          break;

        case "trending":
          // Public endpoint - works for both logged in and guests
          response = await axios.get(`${API_URL}/analytics/recommendations/trending`, {
            params: { limit: 12 },
          });

          if (response.data.success && response.data.recommendations) {
            const products = response.data.recommendations.map((rec) => ({
              ...(rec.product || rec),
              recommendationReason: rec.reason || "Recently trending",
            }));
            setTrendingProducts(products);
          }
          break;

        case "seasonal":
          // Public endpoint - works for both logged in and guests
          response = await axios.get(`${API_URL}/analytics/recommendations/seasonal`, {
            params: { limit: 12 },
          });

          if (response.data.success && response.data.recommendations) {
            const season = response.data.season || "Winter";
            setCurrentSeason(season);
            const products = response.data.recommendations.map((rec) => ({
              ...(rec.product || rec),
              seasonBadge: rec.season || season,
            }));
            setSeasonalProducts(products);
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to fetch ${tab} recommendations:`, error);

      // Fallback to products API if analytics fails
      try {
        const fallbackResponse = await axios.get(`${API_URL}/products?limit=12`);
        const products = fallbackResponse.data.products || fallbackResponse.data || [];

        if (tab === "forYou") {
          setForYouProducts(
            products.map((p, i) => ({
              ...p,
              recommendationReason: ["Based on your interest", "Popular choice", "Recommended"][
                i % 3
              ],
            }))
          );
        } else if (tab === "trending") {
          setTrendingProducts(
            products.map((p) => ({ ...p, recommendationReason: "Recently trending" }))
          );
        } else if (tab === "seasonal") {
          const month = new Date().getMonth();
          let season = "Winter";
          if (month >= 2 && month <= 4) season = "Spring";
          else if (month >= 5 && month <= 7) season = "Summer";
          else if (month >= 8 && month <= 10) season = "Autumn";
          setCurrentSeason(season);
          setSeasonalProducts(products.map((p) => ({ ...p, seasonBadge: season })));
        }
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }
    setAddingToCart(productId);
    await addToCart(token, productId, 1);
    setAddingToCart(null);
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }
    setTogglingWishlist(productId);
    await toggleWishlist(token, productId);
    setTogglingWishlist(null);
  };

  const tabs = [
    { id: "forYou", label: "For You", icon: Sparkles },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "seasonal", label: "Seasonal", icon: Snowflake },
  ];

  const getCurrentProducts = () => {
    switch (activeTab) {
      case "forYou":
        return forYouProducts;
      case "trending":
        return trendingProducts;
      case "seasonal":
        return seasonalProducts;
      default:
        return forYouProducts;
    }
  };

  // Product Card Component for For You & Trending tabs
  const RecommendationCard = ({ product }) => (
    <div
      onClick={() => handleProductClick(product._id)}
      className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        {product.images?.[0]?.url ? (
          <img
            src={getImageUrl(product.images[0].url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => handleToggleWishlist(e, product._id)}
          disabled={togglingWishlist === product._id}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
        >
          {togglingWishlist === product._id ? (
            <Loader2 size={18} className="animate-spin text-gray-400" />
          ) : (
            <Heart
              size={18}
              className={
                isInWishlist(product._id)
                  ? "fill-red-500 text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }
            />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Recommendation Reason Tag */}
        {product.recommendationReason && (
          <p className="text-xs text-gray-500 mb-1">{product.recommendationReason}</p>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || "4.5"}</span>
        </div>

        {/* Price */}
        <p className="text-merogreen font-semibold mb-3">Rs.{product.price}</p>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => handleAddToCart(e, product._id)}
          disabled={addingToCart === product._id}
          className="w-full bg-merogreen text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-70"
        >
          {addingToCart === product._id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );

  // Seasonal Product Card - with season badge
  const SeasonalCard = ({ product }) => (
    <div
      onClick={() => handleProductClick(product._id)}
      className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        {product.images?.[0]?.url ? (
          <img
            src={getImageUrl(product.images[0].url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Season Badge */}
        {product.seasonBadge && (
          <span className="inline-block bg-merogreen text-white text-xs font-medium px-2.5 py-1 rounded-full mb-2">
            {product.seasonBadge}
          </span>
        )}

        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || "4.5"}</span>
        </div>

        {/* Price */}
        <p className="text-merogreen font-semibold mb-3">Rs.{product.price}</p>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => handleAddToCart(e, product._id)}
          disabled={addingToCart === product._id}
          className="w-full bg-merogreen text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-70"
        >
          {addingToCart === product._id ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );

  const isLoadingContent = loading || tabLoading;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium text-gray-900 mb-2">Your Recommendations</h1>
            <p className="text-gray-500">
              {user
                ? "Personalized suggestions based on your browsing and purchase history"
                : "Discover trending products and seasonal picks"}
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id ? "text-merogreen" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-merogreen rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Login prompt for "For You" tab when not logged in */}
          {activeTab === "forYou" && !user && (
            <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-merogreen" size={24} />
                <p className="text-gray-700">
                  <span className="font-medium">Sign in</span> to get personalized recommendations
                  based on your browsing history
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 bg-merogreen text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Content */}
          {isLoadingContent ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={40} className="text-merogreen animate-spin" />
            </div>
          ) : getCurrentProducts().length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getCurrentProducts().map((product) =>
                activeTab === "seasonal" ? (
                  <SeasonalCard key={product._id} product={product} />
                ) : (
                  <RecommendationCard key={product._id} product={product} />
                )
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No recommendations yet</h2>
              <p className="text-gray-500 mb-6">
                {!user
                  ? "Sign in to get personalized recommendations based on your preferences"
                  : "Browse more products to help us understand your preferences better"}
              </p>
              <button
                onClick={() => navigate(user ? "/shop" : "/login")}
                className="inline-block px-6 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                {user ? "Browse Products" : "Sign In"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RecommendationsPage;
