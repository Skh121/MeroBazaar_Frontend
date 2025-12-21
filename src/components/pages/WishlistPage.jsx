import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Loader2, Package } from "lucide-react";
import axios from "axios";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_URL.replace("/api", "")}${url}`;
};

const categories = [
  "All Items",
  "Food & Spices",
  "Textiles",
  "Handicrafts",
  "Agriculture",
  "Dairy & Cheese",
  "Others",
];

const WishlistPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await axios.delete(`${API_URL}/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data);
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const addToCart = async (productId) => {
    try {
      setAddingToCart(productId);
      await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Added to cart!");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      alert(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const filteredProducts =
    activeCategory === "All Items"
      ? wishlist?.products
      : wishlist?.products?.filter((p) => p.category === activeCategory);

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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Header */}
          <h1 className="text-2xl font-medium text-gray-800 mb-6 text-center">
            My Favorites
          </h1>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-start gap-8 mb-8">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeCategory === category
                    ? "bg-merogreen text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-merogreen"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Wishlist Items */}
          {!filteredProducts?.length ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto">
              <Heart size={64} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeCategory === "All Items"
                  ? "Your wishlist is empty"
                  : `No items in ${activeCategory}`}
              </h2>
              <p className="text-gray-500 mb-6">
                Save your favorite products here for later.
              </p>
              <Link
                to="/shop"
                className="inline-block px-6 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-12">
              {filteredProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col justify-between"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden w-full">
                    <Link to={`/product/${product._id}`}>
                      <div className="relative h-42">
                        {product.images?.[0] ? (
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
                    </Link>
                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:bg-red-50 transition-colors z-10"
                    >
                      <Heart size={18} className="fill-red-500 text-red-500" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <p className="text-xs text-merogreen font-medium uppercase mb-0.5">
                      {product.category}
                    </p>
                    <Link to={`/product/${product._id}`}>
                      <h3 className="font-medium text-gray-900 text-md mb-1 line-clamp-1 hover:text-merogreen transition">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-1.5">
                      by {product.vendor?.businessName || "MeroBazaar"}
                    </p>

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

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-bold text-merogreen text-md">
                        Rs.{product.price}
                      </span>
                      {product.comparePrice && (
                        <span className="text-md text-gray-400 line-through">
                          Rs.{product.comparePrice}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => addToCart(product._id)}
                      disabled={
                        addingToCart === product._id || product.stock <= 0
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToCart === product._id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={16} />
                      )}
                      {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
