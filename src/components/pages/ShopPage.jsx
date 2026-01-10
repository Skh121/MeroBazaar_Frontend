import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Loader2,
  Package,
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
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

const categories = [
  { id: "all", name: "All Categories" },
  { id: "food-spices", name: "Food & Spices" },
  { id: "textiles", name: "Textiles" },
  { id: "handicrafts", name: "Handicrafts" },
  { id: "agriculture", name: "Agriculture" },
  { id: "dairy-cheese", name: "Dairy & Cheese" },
];

const ratings = [
  { id: "all", name: "All Ratings", value: 0 },
  { id: "5", name: "5 stars", value: 5 },
  { id: "4", name: "4 stars & up", value: 4 },
  { id: "3", name: "3 stars & up", value: 3 },
  { id: "2", name: "2 stars & up", value: 2 },
];

const PRODUCTS_PER_PAGE = 12;

const ShopPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const token = useAuthStore((state) => state.token);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist, fetchWishlist } = useWishlistStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });
  const [activeRating, setActiveRating] = useState(
    searchParams.get("rating") || "all"
  );
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Fetch wishlist on mount if logged in
  useEffect(() => {
    if (token) {
      fetchWishlist(token);
    }
  }, [token, fetchWishlist]);

  // Debounce search query - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products when debounced search or filters change
  useEffect(() => {
    setCurrentPage(1);

    // Update URL params
    const newParams = new URLSearchParams();
    if (activeCategory !== "all") newParams.set("category", activeCategory);
    if (debouncedSearch.trim()) newParams.set("search", debouncedSearch.trim());
    if (priceRange.min) newParams.set("minPrice", priceRange.min);
    if (priceRange.max) newParams.set("maxPrice", priceRange.max);
    if (activeRating !== "all") newParams.set("rating", activeRating);
    setSearchParams(newParams);

    fetchProductsWithSearch(debouncedSearch, 1);
  }, [debouncedSearch, activeCategory, activeRating]);

  // Fetch products when page changes (without resetting page)
  useEffect(() => {
    if (currentPage > 1) {
      fetchProductsWithSearch(debouncedSearch, currentPage);
    }
  }, [currentPage]);

  // Filter products by search query (matches anywhere in name)
  const filterBySearch = (products, query) => {
    if (!query || !query.trim()) return products;
    const searchLower = query.toLowerCase().trim();
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchLower)
    );
  };

  // Separate fetch function that accepts search query directly
  const fetchProductsWithSearch = async (query, page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (activeCategory !== "all") {
        params.append("category", activeCategory);
      }
      if (query) {
        params.append("search", query);
      }
      if (priceRange.min) {
        params.append("minPrice", priceRange.min);
      }
      if (priceRange.max) {
        params.append("maxPrice", priceRange.max);
      }
      if (activeRating !== "all") {
        params.append("minRating", activeRating);
      }
      params.append("page", page);
      params.append("limit", PRODUCTS_PER_PAGE * 3); // Fetch more to filter client-side

      const response = await axios.get(
        `${API_URL}/products?${params.toString()}`
      );

      let fetchedProducts = [];
      if (response.data.products) {
        fetchedProducts = response.data.products;
      } else if (Array.isArray(response.data)) {
        fetchedProducts = response.data;
      }

      // Apply search filter for partial matching
      const filteredProducts = filterBySearch(fetchedProducts, query);

      // Paginate filtered results
      const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
      const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + PRODUCTS_PER_PAGE
      );

      setProducts(paginatedProducts);
      setTotalProducts(filteredProducts.length);
      setTotalPages(
        Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1
      );
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    // useEffect will handle URL update and fetch
  };

  const handleRatingChange = (ratingId) => {
    setActiveRating(ratingId);
    // useEffect will handle URL update and fetch
  };

  const handlePriceFilter = () => {
    setCurrentPage(1);

    // Update URL params
    const newParams = new URLSearchParams();
    if (activeCategory !== "all") newParams.set("category", activeCategory);
    if (debouncedSearch.trim()) newParams.set("search", debouncedSearch.trim());
    if (priceRange.min) newParams.set("minPrice", priceRange.min);
    if (priceRange.max) newParams.set("maxPrice", priceRange.max);
    if (activeRating !== "all") newParams.set("rating", activeRating);
    setSearchParams(newParams);

    fetchProductsWithSearch(debouncedSearch, 1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    // Update URL params with new page
    const newParams = new URLSearchParams();
    if (activeCategory !== "all") newParams.set("category", activeCategory);
    if (debouncedSearch.trim()) newParams.set("search", debouncedSearch.trim());
    if (priceRange.min) newParams.set("minPrice", priceRange.min);
    if (priceRange.max) newParams.set("maxPrice", priceRange.max);
    if (activeRating !== "all") newParams.set("rating", activeRating);
    if (page > 1) newParams.set("page", page);
    setSearchParams(newParams);

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

  const handleClearFilters = () => {
    setActiveCategory("all");
    setActiveRating("all");
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());

    // Fetch all products without any filters
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append("page", 1);
        params.append("limit", PRODUCTS_PER_PAGE);

        const response = await axios.get(
          `${API_URL}/products?${params.toString()}`
        );

        if (response.data.products) {
          setProducts(response.data.products);
          setTotalProducts(
            response.data.total || response.data.products.length
          );
          setTotalPages(
            response.data.totalPages ||
              Math.ceil(
                (response.data.total || response.data.products.length) /
                  PRODUCTS_PER_PAGE
              )
          );
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalProducts(response.data.length);
          setTotalPages(Math.ceil(response.data.length / PRODUCTS_PER_PAGE));
        } else {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium text-gray-900 mb-2">
              Shop Products
            </h1>
            <p className="text-gray-500">
              Discover authentic Nepali products from local makers
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white rounded-lg p-5 shadow-sm">
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          activeCategory === category.id
                            ? "bg-merogreen text-white font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">
                    Price Range
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Min:</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                        placeholder="Rs0"
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Max:</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        placeholder="Rs6000"
                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      />
                    </div>
                    <button
                      onClick={handlePriceFilter}
                      className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Rating</h3>
                  <div className="space-y-2">
                    {ratings.map((rating) => (
                      <button
                        key={rating.id}
                        onClick={() => handleRatingChange(rating.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                          activeRating === rating.id
                            ? "bg-merogreen text-white font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {rating.id !== "all" && (
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < rating.value
                                    ? activeRating === rating.id
                                      ? "fill-white text-white"
                                      : "fill-yellow-400 text-yellow-400"
                                    : activeRating === rating.id
                                    ? "text-white/50"
                                    : "text-gray-300"
                                }
                              />
                            ))}
                          </div>
                        )}
                        <span>{rating.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar - Above main section only */}
              <div className="mb-6">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products or vendors..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Products Count & Active Filters */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <p className="text-gray-600">
                  <span className="font-medium">{totalProducts}</span> products
                  found
                </p>
                {debouncedSearch && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-merogreen/10 text-merogreen text-sm rounded-full">
                    Search: "{debouncedSearch}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={40} className="text-merogreen animate-spin" />
                </div>
              ) : products.length > 0 ? (
                <>
                  {/* Products Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col"
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden">
                          {product.badge && (
                            <span className="absolute top-2 left-2 bg-merogreen text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
                              {product.badge}
                            </span>
                          )}
                          <div className="relative h-48">
                            {product.images?.[0]?.url ? (
                              <img
                                src={getImageUrl(product.images[0].url)}
                                alt={product.name}
                                className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package size={32} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {product.description ||
                              "Finest Orthodox tea leaves known for their rich aroma."}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={
                                    i < Math.floor(product.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              ({product.reviewCount || 0})
                            </span>
                          </div>

                          {/* Price & Actions */}
                          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                            <div>
                              <span className="font-bold text-merogreen">
                                Rs.{product.price}
                              </span>
                              {product.comparePrice && (
                                <span className="text-sm text-gray-400 line-through ml-1">
                                  Rs.{product.comparePrice}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) =>
                                  handleToggleWishlist(e, product._id)
                                }
                                disabled={togglingWishlist === product._id}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                              >
                                {togglingWishlist === product._id ? (
                                  <Loader2
                                    size={18}
                                    className="animate-spin text-gray-400"
                                  />
                                ) : (
                                  <Heart
                                    size={18}
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
                                className="p-2 rounded-full bg-merogreen/10 hover:bg-green-100 transition-colors"
                              >
                                {addingToCart === product._id ? (
                                  <Loader2
                                    size={18}
                                    className="animate-spin text-merogreen"
                                  />
                                ) : (
                                  <ShoppingCart
                                    size={18}
                                    className="text-merogreen"
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={20} className="text-gray-600" />
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            typeof page === "number" && handlePageChange(page)
                          }
                          disabled={page === "..."}
                          className={`min-w-10 h-10 rounded-lg text-sm font-medium transition ${
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

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Package size={64} className="text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    No products found
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="inline-block px-6 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ShopPage;
