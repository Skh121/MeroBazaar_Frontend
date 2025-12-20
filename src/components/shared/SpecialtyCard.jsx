import React from "react";
import { MapPin, Heart, Package, ShoppingCart } from "lucide-react";

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
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden">
        <span className="absolute top-2 left-2 bg-merogreen text-white text-[10px] font-medium px-1.5 py-0.5 rounded z-10 flex items-center gap-1">
          <MapPin size={10} />
          {product.vendor?.district || "Nepal"}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Add to wishlist
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors z-10"
        >
          <Heart size={14} className="text-gray-400 hover:text-red-500" />
        </button>
        {product.images?.[0]?.url ? (
          <img
            src={getImageUrl(product.images[0].url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <Package size={32} className="text-gray-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">Rs.{product.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add to cart
            }}
            className="p-1.5 rounded-full bg-merogreen/10 hover:bg-green-100 transition-colors"
          >
            <ShoppingCart size={14} className="text-merogreen" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpecialtyCard;
