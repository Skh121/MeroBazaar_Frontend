import React from "react";
import { MapPin, Heart, Package, ShoppingCart, Star } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL.replace("/api", "")}${url}`;
};

const SpecialtyCard = ({ product, onClick }) => {
  return (
    <div
      onClick={() => onClick(product._id)}
      className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group cursor-pointer flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden w-full">
        <span className="absolute top-2 left-2 bg-merogreen text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10 flex items-center gap-1">
          <MapPin size={10} />
          {product.vendor?.district || "Nepal"}
        </span>
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
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add to wishlist
              }}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart size={20} className="text-gray-400 hover:text-red-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add to cart
              }}
              className="p-1.5 rounded-full bg-merogreen/10 hover:bg-green-100 transition-colors"
            >
              <ShoppingCart size={20} className="text-merogreen" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyCard;
