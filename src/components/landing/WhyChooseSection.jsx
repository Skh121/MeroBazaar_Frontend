import React from "react";
import { Flag, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Flag,
    title: "Authentically Nepali",
    description:
      "100% authentic products sourced directly from local producers and businesses.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Insights",
    description:
      "Smart recommendations and fresh tips based on preferences, P2D management needs, and market trends.",
  },
  {
    icon: Users,
    title: "Support Local",
    description:
      "Directly empower farmers, artisans, and small businesses across all 77 districts.",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="bg-gray-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-10">
          Why Choose MeroBazaar?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-merogreen" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
