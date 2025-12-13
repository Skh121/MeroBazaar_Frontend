import React from "react";
import { Link } from "react-router-dom";
import { Utensils, Shirt, Palette, Wheat, MilkOff } from "lucide-react";

const categories = [
  {
    name: "Food & Spices",
    icon: Utensils,
    href: "/shop?category=food-spices",
  },
  {
    name: "Textiles",
    icon: Shirt,
    href: "/shop?category=textiles",
  },
  {
    name: "Handicrafts",
    icon: Palette,
    href: "/shop?category=handicrafts",
  },
  {
    name: "Agriculture",
    icon: Wheat,
    href: "/shop?category=agriculture",
  },
  {
    name: "Dairy & Cheese",
    icon: MilkOff,
    href: "/shop?category=dairy-cheese",
  },
];

const CategoriesSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 hover:border-merogreen border-2 border-transparent transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <category.icon className="w-6 h-6 text-gray-600 group-hover:text-merogreen transition-colors" />
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-merogreen transition-colors text-center">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
