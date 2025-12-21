import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  User,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  ChevronLeft,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { useVendorSignup } from "../../../hooks/useAuth";
import Logo from "../../../assets/images/Logo.svg";

const STEPS = [
  { id: 1, title: "Business Information", icon: Building2 },
  { id: 2, title: "Owner Information", icon: User },
  { id: 3, title: "Location", icon: MapPin },
  { id: 4, title: "Security", icon: Lock },
];

const CATEGORIES = [
  "Electronics",
  "Clothing & Fashion",
  "Food & Beverages",
  "Home & Garden",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books & Stationery",
  "Handicrafts",
  "Agriculture",
  "Other",
];

const PROVINCES = [
  "Province 1",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const VendorSignupPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    businessName: "",
    category: "",
    panNumber: "",
    phone: "",
    ownerName: "",
    email: "",
    province: "",
    district: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();
  const { mutate: signup, isPending, error } = useVendorSignup();

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    setLocalError("");
    switch (step) {
      case 1:
        if (
          !formData.businessName ||
          !formData.category ||
          !formData.panNumber ||
          !formData.phone
        ) {
          setLocalError("Please fill all required fields");
          return false;
        }
        if (formData.panNumber.length < 9) {
          setLocalError("PAN Number must be at least 9 digits");
          return false;
        }
        return true;
      case 2:
        if (!formData.ownerName || !formData.email) {
          setLocalError("Please fill all required fields");
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          setLocalError("Please enter a valid email address");
          return false;
        }
        return true;
      case 3:
        if (!formData.province || !formData.district || !formData.address) {
          setLocalError("Please fill all required fields");
          return false;
        }
        return true;
      case 4:
        if (!formData.password || !formData.confirmPassword) {
          setLocalError("Please fill all required fields");
          return false;
        }
        if (formData.password.length < 8) {
          setLocalError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setLocalError("Passwords do not match");
          return false;
        }
        if (!agreed) {
          setLocalError("You must agree to the Terms & Conditions");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setLocalError("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    signup(formData, {
      onSuccess: () => {
        navigate("/vendor/registration-success");
      },
    });
  };

  const displayError =
    localError ||
    (error && (error.response?.data?.message || "Registration failed"));

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <img src={Logo} alt="MeroBazaar" className="h-10 mx-auto" />
          </Link>
          <h2 className="text-xl font-semibold text-gray-800 mt-3">
            Become a Vendor
          </h2>
          <p className="text-gray-500 text-sm">
            Join Nepal's leading marketplace
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                        ${isCompleted ? "bg-merogreen text-white" : ""}
                        ${
                          isCurrent
                            ? "bg-merogreen text-white ring-4 ring-green-100"
                            : ""
                        }
                        ${
                          !isCompleted && !isCurrent
                            ? "bg-gray-200 text-gray-500"
                            : ""
                        }`}
                    >
                      {isCompleted ? (
                        <Check size={18} />
                      ) : (
                        <StepIcon size={18} />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block ${
                        isCurrent
                          ? "text-merogreen font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 sm:w-20 h-0.5 mx-2 ${
                        currentStep > step.id ? "bg-merogreen" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              {displayError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-merogreen" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Business Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Himalayan Farms"
                      value={formData.businessName}
                      onChange={(e) =>
                        updateFormData("businessName", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        updateFormData("category", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PAN Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="123456789"
                        value={formData.panNumber}
                        onChange={(e) =>
                          updateFormData(
                            "panNumber",
                            e.target.value.replace(/\D/g, "")
                          )
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        placeholder="+977 98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) =>
                          updateFormData("phone", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Owner Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-merogreen" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Owner Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Ram Bahadur"
                        value={formData.ownerName}
                        onChange={(e) =>
                          updateFormData("ownerName", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          updateFormData("email", e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-merogreen" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) =>
                        updateFormData("province", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                    >
                      <option value="">Select province</option>
                      {PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Kathmandu"
                      value={formData.district}
                      onChange={(e) =>
                        updateFormData("district", e.target.value)
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Street, Ward"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Security */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-merogreen" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Security
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Min 8 characters"
                        value={formData.password}
                        onChange={(e) =>
                          updateFormData("password", e.target.value)
                        }
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateFormData("confirmPassword", e.target.value)
                        }
                        className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPass ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Why Join Section */}
                <div className="bg-green-50 rounded-lg p-4 mt-6">
                  <h4 className="font-medium text-gray-800 mb-3">
                    Why Join MeroBazaar?
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-merogreen" />
                      <span className="text-sm text-gray-600">
                        Reach all provinces
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-merogreen" />
                      <span className="text-sm text-gray-600">Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-merogreen" />
                      <span className="text-sm text-gray-600">
                        Easy dashboard
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-merogreen" />
                      <span className="text-sm text-gray-600">
                        Secure payments
                      </span>
                    </div>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start pt-2">
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
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-merogreen hover:underline font-medium"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
              ) : (
                <Link
                  to="/vendor/login"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Back to Login
                </Link>
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-merogreen text-white font-medium hover:bg-green-700 transition"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition
                    ${
                      isPending
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-merogreen hover:bg-green-700"
                    }`}
                >
                  {isPending ? "Creating Account..." : "Create Account"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorSignupPage;
