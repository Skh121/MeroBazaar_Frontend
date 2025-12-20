import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Truck } from "lucide-react";
import HeroImage from "../../assets/images/hero.png";

const HeroSection = () => {
  return (
    <section
      className="min-h-[calc(100vh-5rem)] flex items-center py-8 lg:py-0"
      style={{
        background:
          "linear-gradient(to right, #FFFBEB 0%, #FFF7ED 50%, #F0FDF4 100%)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full py-6 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="order-2 lg:order-1 h-full flex flex-col justify-around gap-1 lg:gap-0">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium leading-tight">
              Discover Nepal's{" "}
              <span className="lg:hidden text-merogreen">
                Finest Local Products
              </span>
              <br className="hidden lg:block" />
              <span className="hidden lg:inline text-merogreen">
                Finest Local
              </span>
              <br className="hidden lg:block" />
              <span className="hidden lg:inline text-merogreen">Products</span>
            </h1>

            <p className="mt-4 lg:mt-6 text-gray-600 text-base lg:text-lg leading-relaxed lg:max-w-xl">
              <span className="lg:hidden">
                Connect directly with authentic vendors across all 77 districts.
                From Himalayan handicrafts to Terai's fresh produce. Experience
                Nepal's diversity delivered to your doorstep.
              </span>
              <span className="hidden lg:inline">
                Connect directly with authentic vendors
                <br />
                across all 77 districts.
                <br />
                From{" "}
                <span className="font-semibold">
                  Himalayan handicrafts to Terai's fresh produce.
                </span>
                <br />
                Experience Nepal's diversity delivered to your doorstep.
              </span>
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
                  <p className="font-semibold text-gray-900 text-sm">
                    100% Authentic
                  </p>
                  <p className="text-gray-500 text-xs">Verified Sources</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Truck className="w-5 h-5 text-merogreen" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Fast Delivery
                  </p>
                  <p className="text-gray-500 text-xs">All 77 Districts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="order-1 lg:order-2 relative lg:flex lg:items-center lg:justify-center lg:py-10">
            <div className="relative lg:max-w-xl lg:mx-auto">
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
                className="w-full h-auto lg:aspect-16/10 rounded-2xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
