import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Package } from "lucide-react";
import axios from "axios";
import ProductCard from "../shared/ProductCard";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/featured?limit=8`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-merogreen animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">No products available yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back soon for amazing products!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
