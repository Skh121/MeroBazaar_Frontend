import React, { useState } from "react";
import { Heart, ShoppingCart, Star, Package, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTracking } from "../../hooks/useTracking";
import { useAuthStore } from "../../store/lib/authStore";
import { useCartStore } from "../../store/lib/cartStore";
import { useWishlistStore } from "../../store/lib/wishlistStore";
import showToast from "../../utils/customToast";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = API_URL?.replace("/api", "") || "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  // Ensure url starts with /
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
};

const ProductCard = ({ product, onClick }) => {
  const navigate = useNavigate();
  const { trackProductClick, trackAddToCart, trackWishlistAdd } = useTracking();
  const token = useAuthStore((state) => state.token);
  const { addToCart } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [addingToCart, setAddingToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  const handleClick = () => {
    // Track product click for analytics
    trackProductClick(product._id, product.category);
    onClick(product._id);
  };

  const handleQuickAddToCart = async (e) => {
    e.stopPropagation();

    if (!token) {
      showToast.error("Login Required", "Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    const result = await addToCart(token, product._id, 1);
    setAddingToCart(false);

    if (result.success) {
      // Track cart addition for analytics
      trackAddToCart(product._id, product.category, product.price, 1);
      // Toast is handled by cartStore
    }
  };

  const handleQuickWishlist = async (e) => {
    e.stopPropagation();

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
    // Track wishlist add event (only when adding, not removing)
    if (!isWishlisted) {
      trackWishlistAdd(product._id, product.category);
    }
    setTogglingWishlist(false);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden w-full">
        {product.badge && (
          <span className="absolute top-2 left-2 bg-merogreen text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10">
            {product.badge}
          </span>
        )}
        <div className="relative h-55">
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
      <div className="p-3">
        <p className="text-sm text-gray-500 mb-0.5">
          {product.vendor?.businessName || "MeroBazaar"}
        </p>
        <h3 className="font-medium text-gray-900 text-md mb-1.5 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
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

        {/* Divider */}
        <hr className="border-t border-[#f3f4f6] mb-2" />

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-merogreen text-md">
              Rs.{product.price}
            </span>
            {product.comparePrice && (
              <span className="text-md text-gray-400 line-through ml-1">
                Rs.{product.comparePrice}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleQuickWishlist}
              disabled={togglingWishlist}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {togglingWishlist ? (
                <Loader2 size={20} className="animate-spin text-gray-400" />
              ) : (
                <Heart
                  size={20}
                  className={
                    isWishlisted
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 hover:text-red-500"
                  }
                />
              )}
            </button>
            <button
              onClick={handleQuickAddToCart}
              disabled={addingToCart}
              className="p-1.5 rounded-full bg-merogreen/10 hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 size={20} className="animate-spin text-merogreen" />
              ) : (
                <ShoppingCart size={20} className="text-merogreen" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
