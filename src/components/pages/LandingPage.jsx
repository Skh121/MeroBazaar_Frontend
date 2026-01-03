import React, { useEffect } from "react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import HeroSection from "../landing/HeroSection";
import CategoriesSection from "../landing/CategoriesSection";
import FeaturedProducts from "../landing/FeaturedProducts";
import RegionalSpecialties from "../landing/RegionalSpecialties";
import WhyChooseSection from "../landing/WhyChooseSection";
import { useAuthStore } from "../../store/lib/authStore";
import { useWishlistStore } from "../../store/lib/wishlistStore";

const LandingPage = () => {
  const token = useAuthStore((state) => state.token);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);

  useEffect(() => {
    if (token) {
      fetchWishlist(token);
    }
  }, [token, fetchWishlist]);

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
