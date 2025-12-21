import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Menu, X, User, LogOut } from "lucide-react";
import axios from "axios";
import Logo from "../../assets/images/Logo.svg";
import { useAuthStore } from "../../store/lib/authStore";
import { useLogout } from "../../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useLogout();

  const navLinks = [
    { name: "Shop", href: "/shop" },
    { name: "Recommendations", href: "/recommendations" },
    { name: "About", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  // Fetch cart and wishlist counts
  useEffect(() => {
    if (user && token) {
      fetchCounts();
    } else {
      setCartCount(0);
      setWishlistCount(0);
    }
  }, [user, token]);

  const fetchCounts = async () => {
    const authToken = localStorage.getItem("auth_token");
    if (!authToken) return;

    try {
      const [cartRes, wishlistRes] = await Promise.all([
        axios.get(`${API_URL}/cart/count`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`${API_URL}/wishlist/count`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);
      setCartCount(cartRes.data.count || 0);
      setWishlistCount(wishlistRes.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setCartCount(0);
    setWishlistCount(0);
    navigate("/");
  };

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-[74px]">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="MeroBazaar" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-gray-600 hover:text-merogreen transition-colors text-md font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/wishlist"
              className="relative text-gray-600 hover:text-merogreen transition-colors"
            >
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              className="relative text-gray-600 hover:text-merogreen transition-colors"
            >
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-merogreen text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User Avatar or Sign Up Button */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-merogreen text-white font-semibold text-sm hover:bg-green-700 transition-colors overflow-hidden"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(user.fullName)
                  )}
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50">
                    {/* User Info */}
                    <div className="px-4 pb-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-800">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={18} className="text-gray-500" />
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/signup"
                className="hidden md:inline-flex bg-merogreen text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Sign Up
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-600 hover:text-merogreen transition-colors text-sm font-medium px-2 py-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="border-t pt-3 mt-2">
                    <div className="px-2 py-1 mb-2">
                      <p className="font-semibold text-gray-800">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-gray-600 hover:text-merogreen transition-colors text-sm font-medium px-2 py-1"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors text-sm font-medium px-2 py-1 w-full"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/signup"
                  className="bg-merogreen text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
