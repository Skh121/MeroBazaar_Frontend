import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useLogin } from "../../../hooks/useAuth";
import GoogleLoginButton from "../../shared/GoogleLoginButton";
import LoginImage from "../../../assets/images/login.png";
import LoginLogo from "../../../assets/images/LoginLogo.svg";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(
      { email, password },
      {
        onSuccess: (data) => {
          navigate(data.role === "admin" ? "/admin/dashboard" : "/");
        },
      }
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT IMAGE + GRADIENT */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={LoginImage}
          alt="Login Visual"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(1,102,48,0.85) 0%, rgba(0,130,54,0.7) 50%, rgba(0,0,0,0.3) 100%)",
          }}
        ></div>

        {/* Logo + overlay text */}
        <div className="absolute inset-0 flex flex-col p-10">
          {/* Logo at top */}
          <div>
            <img
              src={LoginLogo}
              alt="MeroBazaar Logo"
              className="h-10 drop-shadow-md"
            />
          </div>

          {/* Content positioned at ~40% from top */}
          <div className="text-white max-w-md mt-auto mb-[35%]">
            <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
            <p className="text-base opacity-90 leading-relaxed mb-8">
              Sign in to access your dashboard, manage orders, and explore
              personalized recommendations.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">🇳🇵</span>
                <div>
                  <p className="font-semibold text-base">
                    Authentic Nepali Products
                  </p>
                  <p className="text-sm opacity-80">
                    Sourced directly from local artisans
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">✨</span>
                <div>
                  <p className="font-semibold text-base">Tailored For You</p>
                  <p className="text-sm opacity-80">
                    Smart recommendations that match your interests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 lg:px-16 xl:px-24">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-1">Sign In</h2>
          <p className="text-gray-500 mb-8">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-merogreen font-medium hover:underline"
            >
              Create one
            </Link>
          </p>

          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              {error.response?.data?.message || "Login failed"}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  required
                  className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
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
            <div className="flex justify-between items-center pt-1">
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
                to="/forgot-password"
                className="text-sm text-merogreen hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition mt-2 cursor-pointer
                ${
                  isPending
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-merogreen hover:bg-green-700"
                }`}
            >
              {isPending ? "Processing..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Login */}
            <GoogleLoginButton />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
