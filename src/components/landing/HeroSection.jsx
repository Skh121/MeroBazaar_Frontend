import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Truck } from "lucide-react";
import HeroImage from "../../assets/images/hero.png";

const HeroSection = () => {
  return (
    <section
      className="py-8 lg:py-8"
      style={{ background: "linear-gradient(to right, #FFFBEB 0%, #FFF7ED 50%, #F0FDF4 100%)" }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 h-full flex flex-col justify-around gap-1">
            <h1 className="text-4xl lg:text-6xl font-semibold leading-tight">
              Discover Nepal's{" "}
              <span className="text-merogreen">Finest Local Products</span>
            </h1>

            <p className="mt-4 text-gray-600 text-base lg:text-lg leading-relaxed">
              Connect directly with authentic vendors across all 77 districts.
              From Himalayan handicrafts to Terai's fresh produce. Experience
              Nepal's diversity delivered to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="bg-merogreen text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Start Shopping
              </Link>
              <Link
                to="/vendor/register"
                className="border-2 border-merogreen text-merogreen px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
              >
                Become a Vendor
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5 text-merogreen" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">100% Authentic</p>
                  <p className="text-gray-500 text-xs">Verified Sources</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-merogreen" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Fast Delivery</p>
                  <p className="text-gray-500 text-xs">All 77 Districts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative">
              {/* Mountain decoration */}
              <svg
                className="absolute -top-4 -right-4 w-full h-auto text-gray-100 -z-10"
                viewBox="0 0 400 200"
                fill="currentColor"
              >
                <path d="M0,200 L100,80 L150,120 L200,40 L280,100 L320,60 L400,200 Z" />
              </svg>

              <img
                src={HeroImage}
                alt="Authentic Nepali Products"
                className="w-full h-auto rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
