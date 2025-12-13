import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ArrowRight, Heart } from "lucide-react";

const specialties = [
  {
    id: 1,
    name: "Nepal Tea Leaves (Ilam)",
    description: "Finest Orthodox tea leaves grown in the misty hills of eastern Nepal.",
    district: "Ilam",
    province: "Province 1",
    price: 450,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    name: "Nepal Tea Leaves (Ilam)",
    description: "Finest Orthodox tea leaves grown in the misty hills of eastern Nepal.",
    district: "Ilam",
    province: "Province 1",
    price: 450,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    name: "Nepal Tea Leaves (Ilam)",
    description: "Finest Orthodox tea leaves grown in the misty hills of eastern Nepal.",
    district: "Ilam",
    province: "Province 1",
    price: 450,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=250&fit=crop",
  },
  {
    id: 4,
    name: "Nepal Tea Leaves (Ilam)",
    description: "Finest Orthodox tea leaves grown in the misty hills of eastern Nepal.",
    district: "Ilam",
    province: "Province 1",
    price: 450,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=250&fit=crop",
  },
];

const SpecialtyCard = ({ specialty }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <span className="absolute top-3 left-3 bg-merogreen text-white text-xs font-medium px-2 py-1 rounded-md z-10 flex items-center gap-1">
          <MapPin size={12} />
          {specialty.district}
        </span>
        <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-colors z-10">
          <Heart size={16} className="text-gray-400 hover:text-red-500" />
        </button>
        <img
          src={specialty.image}
          alt={specialty.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1">
          {specialty.name}
        </h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {specialty.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">Rs.{specialty.price}</span>
          <button className="text-merogreen text-xs font-medium hover:underline flex items-center gap-1">
            View Details
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const RegionalSpecialties = () => {
  return (
    <section className="bg-white py-12">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {specialties.map((specialty) => (
            <SpecialtyCard key={specialty.id} specialty={specialty} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RegionalSpecialties;
