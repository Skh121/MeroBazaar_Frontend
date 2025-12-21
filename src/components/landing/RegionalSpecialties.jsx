import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import SpecialtyCard from "../shared/SpecialtyCard";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const RegionalSpecialties = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegionalProducts();
  }, []);

  const fetchRegionalProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/products/regional?limit=4`);
      setProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch regional products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <section className="bg-white py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Discover Regional Specialties
          </h2>
          <Link
            to="/districts"
            className="flex items-center gap-1 text-merogreen text-sm font-medium hover:underline"
          >
            Explore All Districts
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="text-merogreen animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-12">
            {products.map((product) => (
              <SpecialtyCard
                key={product._id}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">
              No regional specialties available yet
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Discover unique products from different regions of Nepal!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default RegionalSpecialties;
