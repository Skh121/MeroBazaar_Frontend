import React from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import {
  Heart,
  BarChart3,
  Users,
  Leaf,
  Lightbulb,
  TrendingUp,
  Shield,
  CreditCard,
  MapPin,
} from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Authenticity",
    description:
      "We showcase genuine, traditionally-crafted Nepali products that tell stories of our heritage.",
    iconBg: "bg-green-50",
    iconColor: "text-merogreen",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Growth",
    description:
      "Our AI-powered insights help vendors understand demand trends and optimize their strategies.",
    iconBg: "bg-green-50",
    iconColor: "text-merogreen",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We prioritize the success of local vendors and fair compensation for artisans.",
    iconBg: "bg-green-50",
    iconColor: "text-merogreen",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "We support eco-friendly practices and help preserve traditional craftsmanship for future generations.",
    iconBg: "bg-green-50",
    iconColor: "text-merogreen",
  },
];

const features = [
  {
    icon: Lightbulb,
    title: "Smart Recommendations",
    description:
      "Recommendation suggests products based on your browsing and purchase history.",
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  {
    icon: TrendingUp,
    title: "Demand Forecasting",
    description:
      "Vendors get insights into future demand trends to stock products strategically.",
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  {
    icon: BarChart3,
    title: "Dynamic Pricing",
    description:
      "Real-time market analysis helps vendors find optimal price points for maximum sales.",
    iconBg: "bg-yellow-500",
    iconColor: "text-white",
  },
  {
    icon: MapPin,
    title: "Regional Insights",
    description:
      "Understand regional product preferences and performance across Nepal.",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
  },
  {
    icon: Shield,
    title: "Verified Sellers",
    description:
      "All vendors are verified to ensure authentic, high-quality Nepali products.",
    iconBg: "bg-green-500",
    iconColor: "text-white",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Multiple payment options with secure transactions and buyer protection.",
    iconBg: "bg-red-500",
    iconColor: "text-white",
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow bg-gray-50">
        {/* Header Section */}
        <section className="bg-white py-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
            <h1 className="text-3xl font-medium text-gray-900 mb-4">
              About MeroBazaar
            </h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Empowering local Nepali businesses, farmers, and artisans by
              connecting them directly with customers across Nepal
            </p>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Our Mission
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  MeroBazaar is dedicated to supporting Nepal's rich artisan
                  heritage and agricultural excellence. We believe that
                  authentic, long-shelf-life Nepali products deserve a place on
                  the global stage.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  By applying data-driven insights and technology, we empower
                  local businesses to understand their customers better,
                  optimize their pricing strategies, and grow sustainably.
                </p>
              </div>

              {/* Right Card */}
              <div
                className="rounded-2xl p-8 shadow-sm"
                style={{
                  background: "linear-gradient(to right, #CBFBF1, #FFEDD4)",
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-merogreen" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Supporting Local Communities
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Every purchase supports local farmers, artisans, and small
                    business owners, helping them build sustainable livelihoods
                    and preserve traditional crafts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-12 bg-white">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <h2 className="text-xl font-medium text-gray-900 text-center mb-10">
              Our Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 text-center"
                >
                  <div
                    className={`w-14 h-14 ${value.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <value.icon className={`w-7 h-7 ${value.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose MeroBazaar Section */}
        <section className="py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-10">
              Why Choose MeroBazaar?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 flex items-start gap-4 shadow-sm"
                >
                  <div
                    className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center shrink-0`}
                  >
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
