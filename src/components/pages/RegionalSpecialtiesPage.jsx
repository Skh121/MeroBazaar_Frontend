import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Star,
  Heart,
  ShoppingCart,
  Loader2,
  Package,
  MapPin,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
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

// Nepal's provinces with their districts
const provinces = [
  { id: "all", name: "All Provinces" },
  { id: "Koshi Province", name: "Koshi Province" },
  { id: "Madhesh Province", name: "Madhesh Province" },
  { id: "Bagmati Province", name: "Bagmati Province" },
  { id: "Gandaki Province", name: "Gandaki Province" },
  { id: "Lumbini Province", name: "Lumbini Province" },
  { id: "Karnali Province", name: "Karnali Province" },
  { id: "Sudurpashchim Province", name: "Sudurpashchim" },
];

const PRODUCTS_PER_PAGE = 12;

const RegionalSpecialtiesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const token = useAuthStore((state) => state.token);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeProvince, setActiveProvince] = useState(searchParams.get("province") || "all");
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(null);
  const [insights, setInsights] = useState({
    mostPopular: null,
    trending: null,
    highDemand: null,
  });

  // Fetch wishlist on mount if logged in
  useEffect(() => {
    if (token) {
      fetchWishlist(token);
    }
  }, [token, fetchWishlist]);

  // Fetch products when filters change
  useEffect(() => {
    fetchRegionalProducts();
  }, [activeProvince, currentPage]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParams.get("search")) {
        setCurrentPage(1);
        fetchRegionalProducts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchRegionalProducts = async () => {
    setLoading(true);
    try {
      // Build query params for regional API
      const params = new URLSearchParams();
      params.append("limit", 100); // Fetch more for client-side filtering/pagination
      if (activeProvince !== "all") {
        params.append("province", activeProvince);
      }

      // Fetch regional products from API (now properly filtered by province on backend)
      const response = await axios.get(`${API_URL}/products/regional?${params.toString()}`);
      let fetchedProducts = response.data || [];

      // If no products found for the selected province, try getting all products and filter
      if (fetchedProducts.length === 0 && activeProvince !== "all") {
        const allProductsResponse = await axios.get(`${API_URL}/products?limit=100`);
        const allProducts = allProductsResponse.data.products || allProductsResponse.data || [];

        // Filter by province based on vendor's province
        fetchedProducts = allProducts.filter(
          (p) => p.vendor?.province === activeProvince
        );
      }

      // If still showing all provinces and need more products
      if (activeProvince === "all" && fetchedProducts.length < PRODUCTS_PER_PAGE) {
        const allProductsResponse = await axios.get(`${API_URL}/products?limit=50`);
        const allProducts = allProductsResponse.data.products || allProductsResponse.data || [];

        // Merge and dedupe
        const existingIds = new Set(fetchedProducts.map((p) => p._id));
        const additionalProducts = allProducts.filter((p) => !existingIds.has(p._id));
        fetchedProducts = [...fetchedProducts, ...additionalProducts];
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        fetchedProducts = fetchedProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.vendor?.district?.toLowerCase().includes(query) ||
            p.vendor?.province?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        );
      }

      // Calculate insights from products
      calculateInsights(fetchedProducts);

      // Paginate
      const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const paginatedProducts = fetchedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

      setProducts(paginatedProducts);
      setTotalProducts(fetchedProducts.length);

      // Update URL params
      const newParams = new URLSearchParams();
      if (activeProvince !== "all") newParams.set("province", activeProvince);
      if (searchQuery.trim()) newParams.set("search", searchQuery.trim());
      if (currentPage > 1) newParams.set("page", currentPage);
      setSearchParams(newParams);
    } catch (error) {
      console.error("Failed to fetch regional products:", error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateInsights = (products) => {
    if (!products.length) {
      setInsights({ mostPopular: null, trending: null, highDemand: null });
      return;
    }

    // Most popular by rating
    const sortedByRating = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    const mostPopular = sortedByRating[0];

    // Trending - has badge or high review count
    const trending = products.find((p) => p.badge === "Best Seller" || (p.reviewCount || 0) > 10);

    // High demand - random selection for demo
    const highDemand = products.find((p) => p.badge === "Limited" || p.stock < 20) || products[Math.floor(Math.random() * products.length)];

    setInsights({
      mostPopular: mostPopular ? `${mostPopular.vendor?.district || "Nepal"} ${mostPopular.name.split(" ").slice(0, 2).join(" ")}` : null,
      trending: trending ? `${trending.vendor?.district || "Local"} ${trending.category || "Products"}` : null,
      highDemand: highDemand ? `${highDemand.vendor?.district || "Nepal"} ${highDemand.name.split(" ")[0]}` : null,
    });
  };

  const handleProvinceChange = (provinceId) => {
    setActiveProvince(provinceId);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Group products by district
  const productsByDistrict = useMemo(() => {
    const grouped = {};
    products.forEach((product) => {
      const district = product.vendor?.district || "Other";
      const province = product.vendor?.province || "Unknown";
      const key = `${district}|${province}`;
      if (!grouped[key]) {
        grouped[key] = {
          district,
          province,
          products: [],
        };
      }
      grouped[key].products.push(product);
    });
    return Object.values(grouped);
  }, [products]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Regional Product Card
  const RegionalProductCard = ({ product }) => {
    const isTrending = product.badge === "Best Seller" || (product.reviewCount || 0) > 5;

    return (
      <div
        onClick={() => handleProductClick(product._id)}
        className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
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

          {/* District Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-merogreen text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {product.vendor?.district || "Nepal"}
            </span>
            {isTrending && (
              <span className="bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                <TrendingUp size={12} />
                Trending
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => handleToggleWishlist(e, product._id)}
            disabled={togglingWishlist === product._id}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            {togglingWishlist === product._id ? (
              <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
              <Heart
                size={16}
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
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>

          {/* Description */}
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
            {product.description || "Authentic regional product from Nepal"}
          </p>

          {/* Price Row */}
          <div className="flex items-center justify-between">
            <p className="text-merogreen font-semibold">Rs.{product.price}</p>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => handleToggleWishlist(e, product._id)}
                disabled={togglingWishlist === product._id}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {togglingWishlist === product._id ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : (
                  <Heart
                    size={16}
                    className={
                      isInWishlist(product._id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }
                  />
                )}
              </button>
              <button
                onClick={(e) => handleAddToCart(e, product._id)}
                disabled={addingToCart === product._id}
                className="p-2 rounded-full bg-merogreen/10 hover:bg-merogreen/20 transition-colors"
              >
                {addingToCart === product._id ? (
                  <Loader2 size={16} className="animate-spin text-merogreen" />
                ) : (
                  <ShoppingCart size={16} className="text-merogreen" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Regional Specialties of Nepal
            </h1>
            <p className="text-gray-500">Discover authentic products from every district</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md mx-auto">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by district or product..."
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen text-sm"
              />
            </div>
          </div>

          {/* Province Tabs */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {provinces.map((province) => (
                <button
                  key={province.id}
                  onClick={() => handleProvinceChange(province.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeProvince === province.id
                      ? "bg-merogreen text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {province.name}
                </button>
              ))}
            </div>
          </div>

          {/* Regional Insights */}
          {(insights.mostPopular || insights.trending || insights.highDemand) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-merogreen" />
                <span className="font-medium text-gray-800">Regional Insights</span>
              </div>
              <p className="text-sm text-gray-600">
                {insights.mostPopular && (
                  <span>
                    Most popular: <span className="font-medium text-gray-800">{insights.mostPopular}</span>
                  </span>
                )}
                {insights.mostPopular && insights.trending && <span className="mx-2">•</span>}
                {insights.trending && (
                  <span>
                    Trending: <span className="font-medium text-gray-800">{insights.trending}</span>
                  </span>
                )}
                {(insights.mostPopular || insights.trending) && insights.highDemand && (
                  <span className="mx-2">•</span>
                )}
                {insights.highDemand && (
                  <span>
                    High Demand: <span className="font-medium text-gray-800">{insights.highDemand}</span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={40} className="text-merogreen animate-spin" />
            </div>
          ) : productsByDistrict.length > 0 ? (
            <>
              {/* Products Grouped by District */}
              <div className="space-y-8">
                {productsByDistrict.map((group) => (
                  <div key={`${group.district}-${group.province}`}>
                    {/* District Header */}
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin size={18} className="text-merogreen" />
                      <h2 className="font-semibold text-gray-900">{group.district}</h2>
                      <span className="text-sm text-gray-500">({group.province})</span>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {group.products.map((product) => (
                        <RegionalProductCard key={product._id} product={product} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts)} of {totalProducts}{" "}
                    results
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={18} className="text-gray-600" />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === "number" && handlePageChange(page)}
                        disabled={page === "..."}
                        className={`min-w-9 h-9 rounded-lg text-sm font-medium transition ${
                          page === currentPage
                            ? "bg-merogreen text-white"
                            : page === "..."
                            ? "cursor-default text-gray-400"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <MapPin size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No products found</h2>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `No products match "${searchQuery}" in ${activeProvince === "all" ? "any province" : activeProvince}`
                  : `No regional specialties available ${activeProvince !== "all" ? `in ${activeProvince}` : ""} yet`}
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveProvince("all");
                }}
                className="inline-block px-6 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegionalSpecialtiesPage;
