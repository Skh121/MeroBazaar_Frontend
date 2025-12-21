import React from "react";
import { Link } from "react-router-dom";

// Import category images
import foodsImg from "../../assets/images/category/foods.png";
import textilesImg from "../../assets/images/category/textiles.png";
import handicraftsImg from "../../assets/images/category/handicrafts.png";
import agricultureImg from "../../assets/images/category/agriculture.png";
import dairyImg from "../../assets/images/category/dairy.png";

const categories = [
  {
    name: "Food & Spices",
    image: foodsImg,
    href: "/shop?category=food-spices",
  },
  {
    name: "Textiles",
    image: textilesImg,
    href: "/shop?category=textiles",
  },
  {
    name: "Handicrafts",
    image: handicraftsImg,
    href: "/shop?category=handicrafts",
  },
  {
    name: "Agriculture",
    image: agricultureImg,
    href: "/shop?category=agriculture",
  },
  {
    name: "Dairy & Cheese",
    image: dairyImg,
    href: "/shop?category=dairy-cheese",
  },
];

const CategoriesSection = () => {
  return (
    <section className="bg-white py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-base font-semibold text-gray-800 mb-5">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.href}
              className="flex flex-col items-center justify-center py-10 px-8 border-t border-gray-100 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 flex items-center justify-center mb-3">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-merogreen transition-colors text-center">
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
