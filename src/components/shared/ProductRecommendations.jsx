import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Star, Heart, ShoppingCart, Sparkles } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "../../store/lib/authStore";
import { useCartStore } from "../../store/lib/cartStore";
import { useWishlistStore } from "../../store/lib/wishlistStore";
import { getRecommendations, getSimilarProducts, trackEvent } from "../../store/api/analyticsApi";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL?.replace("/api", "") || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const ProductRecommendations = ({
  type = "personalized", // "personalized", "similar", "popular"
  productId = null, // Required for "similar" type
  title = "Recommended for You",
  limit = 6,
  className = "",
}) => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);
  const [togglingWishlist, setTogglingWishlist] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, [token, type, productId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      let data;

      if (type === "similar" && productId) {
        data = await getSimilarProducts(productId, limit);
        setProducts(data.products || []);
      } else if (type === "personalized" && token) {
        data = await getRecommendations(token, limit, "hybrid");
        setProducts(data.products || []);
      } else {
        // Fallback to popular/featured products
        const response = await axios.get(`${API_URL}/products/featured`, {
          params: { limit },
        });
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      // Fallback to featured products
      try {
        const response = await axios.get(`${API_URL}/products/featured`, {
          params: { limit },
        });
        setProducts(response.data || []);
      } catch (e) {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product) => {
    // Track click event
    await trackEvent({
      eventType: "click",
      productId: product.id || product._id,
      category: product.category,
    });

    navigate(`/product/${product.id || product._id}`);
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }

    const productId = product.id || product._id;
    setAddingToCart(productId);

    // Track add to cart event
    await trackEvent({
      eventType: "add_to_cart",
      productId,
      category: product.category,
      price: product.price,
    });

    await addToCart(token, productId, 1);
    setAddingToCart(null);
  };

  const handleToggleWishlist = async (e, product) => {
    e.stopPropagation();
    if (!token) {
      navigate("/login");
      return;
    }

    const productId = product.id || product._id;
    setTogglingWishlist(productId);

    // Track wishlist event
    const isCurrentlyInWishlist = isInWishlist(productId);
    await trackEvent({
      eventType: isCurrentlyInWishlist ? "wishlist_remove" : "wishlist_add",
      productId,
      category: product.category,
    });

    await toggleWishlist(token, productId);
    setTogglingWishlist(null);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 size={32} className="animate-spin text-merogreen" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={20} className="text-merogreen" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const productId = product.id || product._id;
          const imageUrl = product.images?.[0]?.url
            ? getImageUrl(product.images[0].url)
            : null;

          return (
            <div
              key={productId}
              onClick={() => handleProductClick(product)}
              className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}

                {/* Wishlist button */}
                <button
                  onClick={(e) => handleToggleWishlist(e, product)}
                  disabled={togglingWishlist === productId}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition"
                >
                  {togglingWishlist === productId ? (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  ) : (
                    <Heart
                      size={14}
                      className={
                        isInWishlist(productId)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }
                    />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-1 mb-1">
                  {product.name}
                </h3>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{product.rating?.toFixed(1)}</span>
                  </div>
                )}

                {/* Price and Cart */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-merogreen text-sm">
                    Rs. {product.price}
                  </span>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={addingToCart === productId}
                    className="p-1.5 rounded-full bg-merogreen/10 hover:bg-merogreen/20 transition"
                  >
                    {addingToCart === productId ? (
                      <Loader2 size={14} className="animate-spin text-merogreen" />
                    ) : (
                      <ShoppingCart size={14} className="text-merogreen" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductRecommendations;
