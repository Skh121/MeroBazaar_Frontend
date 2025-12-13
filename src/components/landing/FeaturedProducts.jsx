import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, ArrowRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Himalayan Organic Honey",
    vendor: "Mountain Farms",
    price: 699,
    rating: 5.0,
    reviews: 24,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Himalayan Organic Honey",
    vendor: "Mountain Farms",
    price: 699,
    rating: 5.0,
    reviews: 24,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 3,
    name: "Himalayan Organic Honey",
    vendor: "Mountain Farms",
    price: 699,
    rating: 4.8,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 4,
    name: "Himalayan Organic Honey",
    vendor: "Mountain Farms",
    price: 699,
    rating: 4.9,
    reviews: 32,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop",
    badge: "Best Seller",
  },
];

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        {product.badge && (
          <span className="absolute top-3 left-3 bg-merogreen text-white text-xs font-medium px-2 py-1 rounded-md z-10">
            {product.badge}
          </span>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.vendor}</p>
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">Rs.{product.price}</span>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart size={18} className="text-gray-400 hover:text-red-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-green-100 transition-colors">
              <ShoppingCart size={18} className="text-gray-400 hover:text-merogreen" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Featured Products
          </h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-merogreen text-sm font-medium hover:underline"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
