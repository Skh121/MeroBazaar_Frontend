import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, KeyRound, Lock, Eye, EyeOff, Check, ArrowRight, ArrowLeft } from "lucide-react";
import { useForgotPassword, useVerifyOTP, useResetPassword } from "../../../hooks/useAuth";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();

  const forgotPassword = useForgotPassword();
  const verifyOTP = useVerifyOTP();
  const resetPassword = useResetPassword();

  const isPending = forgotPassword.isPending || verifyOTP.isPending || resetPassword.isPending;
  const apiError = forgotPassword.error || verifyOTP.error || resetPassword.error;

  const handleSendOTP = (e) => {
    e.preventDefault();
    setLocalError("");

    forgotPassword.mutate(email, {
      onSuccess: () => setStep(2),
    });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLocalError("");

    verifyOTP.mutate(
      { email, otp },
      { onSuccess: () => setStep(3) }
    );
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLocalError("");

    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }

    resetPassword.mutate(
      { email, otp, newPassword },
      { onSuccess: () => navigate("/login") }
    );
  };

  const handleResendOTP = () => {
    setLocalError("");
    forgotPassword.mutate(email);
  };

  const handleBack = () => {
    setLocalError("");
    forgotPassword.reset();
    verifyOTP.reset();
    if (step === 2) {
      setOtp("");
      setStep(1);
    }
  };

  const displayError = localError || (apiError && (apiError.response?.data?.message || "An error occurred"));

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((num, idx) => (
        <React.Fragment key={num}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${step > num
                ? "bg-merogreen text-white"
                : step === num
                  ? "bg-merogreen text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
          >
            {step > num ? <Check size={16} /> : num}
          </div>
          {idx < 2 && (
            <div
              className={`w-16 h-0.5 mx-1 transition-all ${
                step > num ? "bg-merogreen" : "bg-gray-200"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const StepIcon = ({ icon: Icon }) => (
    <div className="flex justify-center mb-4">
      <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-merogreen" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-merogreen">M</span>
            <span className="text-gray-800">ero</span>
            <span className="text-merogreen">B</span>
            <span className="text-gray-800">azaar</span>
          </Link>
        </div>

        <StepIndicator />

        {/* Error Message */}
        {displayError && (
          <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
            {displayError}
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <>
            <StepIcon icon={Mail} />
            <h2 className="text-xl font-semibold text-center mb-2">Forgot Password?</h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Enter your email address and we'll send you an OTP
            </p>

            <form onSubmit={handleSendOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition flex items-center justify-center gap-2
                  ${isPending ? "bg-green-400 cursor-not-allowed" : "bg-green-700"}`}
              >
                {isPending ? "Sending..." : "Send OTP"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-gray-500 hover:text-merogreen">
                Back to Login
              </Link>
            </div>
          </>
        )}

        {/* Step 2: Enter OTP */}
        {step === 2 && (
          <>
            <StepIcon icon={KeyRound} />
            <h2 className="text-xl font-semibold text-center mb-2">Enter OTP</h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              We've sent a 6-digit code to {email}
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  One-Time Password
                </label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm text-center tracking-widest font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || otp.length !== 6}
                className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition flex items-center justify-center gap-2
                  ${isPending || otp.length !== 6 ? "bg-green-400 cursor-not-allowed" : "bg-merogreen hover:bg-green-700"}`}
              >
                {isPending ? "Verifying..." : "Verify OTP"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleResendOTP}
                disabled={isPending}
                className="text-sm text-merogreen hover:text-green-700 font-medium py-2 px-4 rounded-lg border border-merogreen hover:bg-green-50 transition disabled:opacity-50"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <StepIcon icon={Lock} />
            <h2 className="text-xl font-semibold text-center mb-2">Reset Password</h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              Create a strong new password for your account
            </p>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 pr-12 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 pr-12 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-merogreen focus:border-transparent focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition flex items-center justify-center gap-2
                  ${isPending ? "bg-green-400 cursor-not-allowed" : "bg-merogreen hover:bg-green-700"}`}
              >
                {isPending ? "Resetting..." : "Reset Password"}
                {!isPending && <ArrowRight size={18} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
