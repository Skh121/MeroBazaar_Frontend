import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import LogoFooter from "../../assets/images/Logo_footer.svg";

const Footer = () => {
  const shopLinks = [
    { name: "All Products", href: "/shop" },
    { name: "Food & Spices", href: "/shop?category=food-spices" },
    { name: "Handicrafts", href: "/shop?category=handicrafts" },
    { name: "Textiles", href: "/shop?category=textiles" },
  ];

  const featureLinks = [
    { name: "Recommendations", href: "/recommendations" },
    { name: "Market Insights", href: "/insights" },
    { name: "Become a Vendor", href: "/vendor/register" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "/help" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={LogoFooter} alt="MeroBazaar" className="h-10 w-auto" />
            </Link>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Connecting Nepal's authentic sellers with conscious buyers.
              Empowering local businesses through technology.
            </p>

            {/* Contact Info */}
            <div className="space-y-2">
              <a
                href="mailto:support@merobazaar.com"
                className="flex items-center gap-2 text-sm hover:text-merogreen transition-colors"
              >
                <Mail size={16} />
                support@merobazaar.com
              </a>
              <a
                href="tel:+977-9812345678"
                className="flex items-center gap-2 text-sm hover:text-merogreen transition-colors"
              >
                <Phone size={16} />
                +977-9812345678
              </a>
              <p className="flex items-center gap-2 text-sm">
                <MapPin size={16} />
                Kathmandu, Nepal
              </p>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-merogreen transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              {featureLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-merogreen transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm hover:text-merogreen transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} MeroBazaar. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-merogreen transition-colors"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-merogreen transition-colors"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-merogreen transition-colors"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
