import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useVendorLogin } from "../../../hooks/useAuth";

const VendorLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useVendorLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(
      { email, password },
      {
        onSuccess: () => {
          navigate("/vendor/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold">
              <span className="text-merogreen">M</span>
              <span className="text-gray-800">ero</span>
              <span className="text-merogreen">B</span>
              <span className="text-gray-800">azaar</span>
            </h1>
          </Link>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Welcome Back!</h2>
          <p className="text-gray-500 mt-1">Sign in to your vendor dashboard</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              {error.response?.data?.message || "Login failed"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="vendor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex justify-between items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-merogreen border-gray-300 rounded focus:ring-merogreen"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/vendor/forgot-password"
                className="text-sm text-merogreen hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition cursor-pointer
                ${isPending ? "bg-green-400 cursor-not-allowed" : "bg-merogreen hover:bg-green-700"}`}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/vendor/register"
              className="text-merogreen font-semibold hover:underline"
            >
              Register as Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPage;
