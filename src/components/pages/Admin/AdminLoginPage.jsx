import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useAdminLogin } from "../../../hooks/useAuth";

const AdminLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useAdminLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(
      { email, password },
      {
        onSuccess: () => {
          navigate("/admin/dashboard");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-merogreen rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-1">MeroBazaar Management Console</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
              {error.response?.data?.message || "Invalid credentials"}
            </div>
          )}

          {/* Demo Credentials Info */}
          <div className="p-3 mb-4 text-sm bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-800">Demo Credentials:</p>
            <p className="text-blue-700 mt-1">
              Email: <code className="bg-blue-100 px-1 rounded">admin@merobazaar.com</code>
            </p>
            <p className="text-blue-700">
              Password: <code className="bg-blue-100 px-1 rounded">admin123</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  placeholder="admin@merobazaar.com"
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3 rounded-lg text-white font-medium text-base shadow-sm transition cursor-pointer
                ${isPending ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:bg-slate-800"}`}
            >
              {isPending ? "Signing In..." : "Sign In to Admin Panel"}
            </button>
          </form>

          {/* Back Link */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-500 hover:text-merogreen transition"
            >
              Back to MeroBazaar Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-sm mt-6">
          Protected admin area. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
