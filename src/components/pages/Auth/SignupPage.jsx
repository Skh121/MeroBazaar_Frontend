import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useSignup } from "../../../hooks/useAuth";
import GoogleLoginButton from "../../shared/GoogleLoginButton";
import SignupLogo from "../../../assets/images/SignupLogo.svg";
import SignupImage from "../../../assets/images/signup.png";
import {
  signupSchema,
  validateForm,
  getFirstError,
} from "../../../utils/validationSchemas";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [localError, setLocalError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const { mutate: signup, isPending, error } = useSignup();

  const clearFieldError = (field) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");

    // Validate with Zod
    const validation = validateForm(signupSchema, {
      fullName,
      email,
      password,
      confirmPassword,
      agreed,
    });

    if (!validation.success) {
      setFormErrors(validation.errors);
      const firstError = getFirstError(validation.errors);
      setLocalError(firstError);
      return;
    }

    signup(
      { fullName, email, password },
      {
        onSuccess: (data) => {
          navigate(data.role === "admin" ? "/admin/dashboard" : "/login");
        },
      }
    );
  };

  const displayError =
    localError || (error && (error.response?.data?.message || "Signup failed"));

  return (
    <div className="flex h-screen overflow-hidden">
      {/* LEFT IMAGE + GRADIENT */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src={SignupImage}
          alt="Signup visual"
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
              src={SignupLogo}
              alt="MeroBazaar Logo"
              className="h-10 drop-shadow-md cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Content positioned at ~40% from top */}
          <div className="text-white max-w-md mt-auto mb-[35%]">
            <h1 className="text-3xl font-bold mb-3">Join MeroBazaar</h1>
            <p className="text-base opacity-90 leading-relaxed mb-8">
              Create an account and start exploring authentic Nepali products
              with personalized recommendations.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <span className="text-lg">🎁</span>
                <div>
                  <p className="font-semibold text-base">Exclusive Deals</p>
                  <p className="text-sm opacity-80">
                    Directly from the Official Vendors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="font-semibold text-base">Fast Checkout</p>
                  <p className="text-sm opacity-80">
                    Save items, address & payment details
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
          <h2 className="text-2xl font-semibold mb-2">Create Account</h2>

          {/* Error & Loading */}
          {displayError && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              {displayError}
            </div>
          )}
          {isPending && (
            <div className="p-3 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-lg">
              Creating account...
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    clearFieldError("fullName");
                  }}
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm ${
                    formErrors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.fullName}
                </p>
              )}
            </div>

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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearFieldError("email");
                  }}
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm ${
                    formErrors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm ${
                    formErrors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError("confirmPassword");
                  }}
                  autoComplete="off"
                  required
                  className={`w-full pl-10 pr-12 py-2.5 rounded-lg border focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm ${
                    formErrors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start pt-1">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="h-4 w-4 mt-0.5 text-merogreen border-gray-300 rounded focus:ring-merogreen shrink-0"
              />
              <label className="ml-2 text-sm text-gray-500">
                I agree to the{" "}
                <a
                  href="#"
                  className="text-merogreen hover:underline font-medium"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-merogreen hover:underline font-medium"
                >
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isPending || !agreed}
              className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition mt-1
                ${
                  isPending || !agreed
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-merogreen hover:bg-green-700"
                }`}
            >
              {isPending ? "Processing..." : "Create Account"}
            </button>

            {/* Divider */}
            <div className="flex items-center mb-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google Signup */}
            <GoogleLoginButton />
          </form>
          <p className="text-gray-500 mb-6 text-center my-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-merogreen font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
