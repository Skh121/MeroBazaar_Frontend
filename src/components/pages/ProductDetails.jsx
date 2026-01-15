import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  RefreshCw,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Send,
  User,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuthStore } from "../../store/lib/authStore";
import { useCartStore } from "../../store/lib/cartStore";
import { useWishlistStore } from "../../store/lib/wishlistStore";
import { useTracking } from "../../hooks/useTracking";
import showToast from "../../utils/customToast";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL?.replace("/api", "") || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Auth store
  const token = useAuthStore((state) => state.token);

  // Cart store
  const { addToCart } = useCartStore();

  // Wishlist store
  const { toggleWishlist, isInWishlist, fetchWishlist, wishlist } =
    useWishlistStore();

  // Tracking hook (product views tracked server-side, only need cart/wishlist tracking)
  const { trackAddToCart, trackWishlistAdd } = useTracking();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Check if product is in wishlist
  const isWishlisted = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts();
    }
    if (product?._id) {
      fetchReviews();
      // Note: Product views are now tracked server-side in productRoutes.js
      // No need for frontend tracking here (prevents duplicate counts)
    }
  }, [product]);

  // Fetch wishlist on mount if logged in
  useEffect(() => {
    if (token && !wishlist) {
      fetchWishlist(token);
    }
  }, [token, wishlist, fetchWishlist]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      // Include auth header if logged in (for analytics tracking)
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};
      const response = await axios.get(`${API_URL}/products/${id}`, config);
      setProduct(response.data);
    } catch (err) {
      console.error("Failed to fetch product:", err);
      setError("Product not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: {
          category: product.category,
          limit: 4,
        },
      });
      // Filter out current product
      const filtered =
        response.data.products?.filter((p) => p._id !== id) || [];
      setRelatedProducts(filtered.slice(0, 4));
    } catch (err) {
      console.error("Failed to fetch related products:", err);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await axios.get(`${API_URL}/products/${id}/reviews`);
      setReviews(response.data.reviews || response.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      // Set empty reviews if endpoint doesn't exist
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    try {
      setSubmittingReview(true);
      if (!token) {
        showToast.error("Login Required", "Please login to submit a review");
        navigate("/login");
        return;
      }

      await axios.post(`${API_URL}/products/${id}/reviews`, newReview, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
      fetchProduct(); // Refresh product to get updated rating
      showToast.success("Review Submitted", "Thank you for your review!");
    } catch (err) {
      console.error("Failed to submit review:", err);
      showToast.error(
        "Failed",
        err.response?.data?.message || "Failed to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      showToast.error("Login Required", "Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(token, product._id, quantity);
    setAddingToCart(false);

    if (result.success) {
      // Track add to cart event for analytics
      trackAddToCart(product._id, product.category, product.price, quantity);
      // Toast is handled by cartStore
    }
    // Error toast is already handled by cartStore
  };

  const handleBuyNow = async () => {
    if (!token) {
      showToast.error("Login Required", "Please login to proceed");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(token, product._id, quantity);
    setAddingToCart(false);

    if (result.success) {
      // Track cart addition for analytics
      trackAddToCart(product._id, product.category, product.price, quantity);
      navigate("/cart");
    }
    // Error toast is already handled by cartStore
  };

  const handleToggleWishlist = async () => {
    if (!token) {
      showToast.error(
        "Login Required",
        "Please login to add items to wishlist"
      );
      navigate("/login");
      return;
    }

    setTogglingWishlist(true);
    await toggleWishlist(token, product._id);
    // Track wishlist add event for analytics (only if adding, not removing)
    if (!isWishlisted) {
      trackWishlistAdd(product._id, product.category);
    }
    setTogglingWishlist(false);
  };

  // Generate product details from description or defaults
  const getProductDetails = () => {
    const details = [];
    if (product.features && Array.isArray(product.features)) {
      return product.features;
    }
    // Default details based on category
    if (product.category === "Food & Spices" || product.category === "food") {
      details.push("100% Pure and Organic");
      details.push("No Added Preservatives");
      details.push("Raw and Unprocessed");
    }
    if (product.weight || product.unit) {
      details.push(`Weight: ${product.weight || ""} ${product.unit || ""}`);
    }
    if (product.origin) {
      details.push(`Origin: ${product.origin}`);
    }
    return details;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={48} className="text-merogreen animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Package size={64} className="text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition"
          >
            <ArrowLeft size={18} />
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb Navigation */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-gray-500 hover:text-merogreen transition"
            >
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link
              to="/shop"
              className="text-gray-500 hover:text-merogreen transition"
            >
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <Link
                  to={`/shop?category=${encodeURIComponent(product.category)}`}
                  className="text-gray-500 hover:text-merogreen transition"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Details Section */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:max-w-[1180px]">
            {/* Product Images */}
            <div className="space-y-4 ">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                {product.badge && (
                  <span className="absolute top-4 left-4 bg-merogreen text-white text-sm font-medium px-3 py-1 rounded-lg z-10">
                    {product.badge}
                  </span>
                )}
                {product.images?.length > 0 ? (
                  <img
                    src={getImageUrl(product.images[selectedImageIndex]?.url)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={96} className="text-gray-300" />
                  </div>
                )}

                {/* Image Navigation */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === 0 ? product.images.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition shadow"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((prev) =>
                          prev === product.images.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition shadow"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImageIndex === index
                          ? "border-merogreen"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={getImageUrl(image.url)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              {/* Category */}
              <p className="text-gray-500 text-sm">{product.category}</p>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < Math.floor(product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">
                  {product.rating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-500">
                  ({product.reviewCount || reviews.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-merogreen">
                  Rs.{product.price}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    Rs.{product.comparePrice}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <p
                className={`text-sm font-medium ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} available)`
                  : "Out of Stock"}
              </p>

              {/* Seller Info */}
              {product.vendor && (
                <div className="py-3 border-t border-b border-gray-100">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Sold by</span>
                    <Link
                      to={`/vendor/${product.vendor._id}`}
                      className="text-gray-800 font-medium hover:text-merogreen transition"
                    >
                      {product.vendor.businessName || "MeroBazaar Vendor"}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm text-gray-600">
                      {product.vendor.rating?.toFixed(1) || "4.9"} Seller Rating
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 py-2">
                  <span className="text-gray-700">Quantity</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-merogreen text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={20} />
                  )}
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0 || addingToCart}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-merogreen text-merogreen rounded-lg font-semibold hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  className={`p-3 border-2 rounded-lg transition ${
                    isWishlisted
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {togglingWishlist ? (
                    <Loader2 size={20} className="animate-spin text-gray-400" />
                  ) : (
                    <Heart
                      size={20}
                      className={
                        isWishlisted
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400"
                      }
                    />
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-3">
                  <Truck size={24} className="text-merogreen mb-2" />
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <Shield size={24} className="text-merogreen mb-2" />
                  <span className="text-xs text-gray-600">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center p-3">
                  <RefreshCw size={24} className="text-merogreen mb-2" />
                  <span className="text-xs text-gray-600">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div className="mt-12 border-t">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 text-base font-medium border-b-2 transition ${
                  activeTab === "description"
                    ? "border-merogreen text-merogreen"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 text-base font-medium border-b-2 transition ${
                  activeTab === "reviews"
                    ? "border-merogreen text-merogreen"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Reviews ({product.reviewCount || reviews.length || 0})
              </button>
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {activeTab === "description" ? (
                <div className="space-y-6">
                  {/* Description Text */}
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Product Details List */}
                  {getProductDetails().length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4">
                        Product Details
                      </h3>
                      <ul className="space-y-2">
                        {getProductDetails().map((detail, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-gray-600"
                          >
                            <span className="text-merogreen mt-1">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Write Review Form */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Write a Review
                    </h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Rating Selection */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Your Rating
                        </label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewReview({ ...newReview, rating: star })
                              }
                              className="p-1"
                            >
                              <Star
                                size={24}
                                className={
                                  star <= newReview.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300 hover:text-yellow-400"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) =>
                            setNewReview({
                              ...newReview,
                              comment: e.target.value,
                            })
                          }
                          placeholder="Share your experience with this product..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview || !newReview.comment.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                        Submit Review
                      </button>
                    </form>
                  </div>

                  {/* Reviews List */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Customer Reviews
                    </h3>

                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2
                          size={32}
                          className="text-merogreen animate-spin"
                        />
                      </div>
                    ) : reviews.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>
                          No reviews yet. Be the first to review this product!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {reviews.map((review, index) => (
                          <div
                            key={review._id || index}
                            className="border-b border-gray-100 pb-6 last:border-0"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <User size={20} className="text-gray-500" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-800">
                                    {review.user?.fullName || "Anonymous"}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    {review.createdAt
                                      ? new Date(
                                          review.createdAt
                                        ).toLocaleDateString()
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={14}
                                      className={
                                        i < (review.rating || 0)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }
                                    />
                                  ))}
                                </div>
                                <p className="text-gray-600">
                                  {review.comment}
                                </p>
                                {review.helpful !== undefined && (
                                  <button className="flex items-center gap-1 mt-2 text-sm text-gray-500 hover:text-merogreen">
                                    <ThumbsUp size={14} />
                                    Helpful ({review.helpful || 0})
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct._id}
                    to={`/product/${relatedProduct._id}`}
                    className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {relatedProduct.images?.[0] ? (
                        <img
                          src={getImageUrl(relatedProduct.images[0].url)}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={48} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">
                        {relatedProduct.vendor?.businessName || "MeroBazaar"}
                      </p>
                      <h3 className="font-medium text-gray-800 mb-2 line-clamp-1 group-hover:text-merogreen transition">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-2">
                        <Star
                          size={14}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="text-sm text-gray-600">
                          {relatedProduct.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                      <p className="font-bold text-merogreen">
                        Rs.{relatedProduct.price}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetails;
