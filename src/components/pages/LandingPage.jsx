import React from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import HeroSection from "../landing/HeroSection";
import CategoriesSection from "../landing/CategoriesSection";
import FeaturedProducts from "../landing/FeaturedProducts";
import RegionalSpecialties from "../landing/RegionalSpecialties";
import WhyChooseSection from "../landing/WhyChooseSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="grow">
        <HeroSection />
        <CategoriesSection />
        <FeaturedProducts />
        <RegionalSpecialties />
        <WhyChooseSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
