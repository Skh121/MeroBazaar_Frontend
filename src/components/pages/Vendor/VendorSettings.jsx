import { useState, useEffect } from "react";
import axios from "axios";
import showToast from "../../../utils/customToast";
import {
  User,
  Store,
  MapPin,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Building2,
  FileText,
  Shield,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// Nepal's provinces
const provinces = [
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

// Business categories
const categories = [
  "Food & Spices",
  "Textiles",
  "Handicrafts",
  "Agriculture",
  "Dairy & Cheese",
  "Others",
];

const VendorSettings = () => {
  const token = localStorage.getItem("auth_token");

  // Profile state
  const [profile, setProfile] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    category: "",
    panNumber: "",
    province: "",
    district: "",
    address: "",
    status: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/vendor/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      showToast.error("Load Failed", "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await axios.put(
        `${API_URL}/vendor/profile`,
        {
          businessName: profile.businessName,
          ownerName: profile.ownerName,
          phone: profile.phone,
          category: profile.category,
          province: profile.province,
          district: profile.district,
          address: profile.address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      showToast.success(
        "Profile Updated!",
        "Your profile has been updated successfully."
      );
    } catch (error) {
      showToast.error(
        "Update Failed",
        error.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast.error("Password Mismatch", "New passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast.error(
        "Invalid Password",
        "Password must be at least 6 characters."
      );
      return;
    }

    setSaving(true);

    try {
      await axios.put(
        `${API_URL}/vendor/password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast.success(
        "Password Changed!",
        "Your password has been changed successfully."
      );
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast.error(
        "Change Failed",
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Store Profile", icon: Store },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="text-merogreen animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">
          Manage your store profile and security settings
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-merogreen text-merogreen bg-green-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="p-6">
            {/* Account Status Badge */}
            <div className="mb-6 flex items-center gap-3">
              <span className="text-sm text-gray-500">Account Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : profile.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {profile.status?.charAt(0).toUpperCase() +
                  profile.status?.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Business Info */}
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Building2 size={18} className="text-merogreen" />
                  Business Information
                </h3>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business Name
                  </label>
                  <div className="relative">
                    <Store
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="businessName"
                      value={profile.businessName}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Your business name"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Owner Name
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      name="ownerName"
                      value={profile.ownerName}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Owner's full name"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Business Category
                  </label>
                  <select
                    name="category"
                    value={profile.category}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PAN Number (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    PAN Number
                  </label>
                  <div className="relative">
                    <FileText
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={profile.panNumber}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    PAN number cannot be changed. Contact support if needed.
                  </p>
                </div>
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-5">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MapPin size={18} className="text-merogreen" />
                  Contact & Location
                </h3>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Province
                  </label>
                  <select
                    name="province"
                    value={profile.province}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen bg-white"
                  >
                    <option value="">Select province</option>
                    {provinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={profile.district}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                    placeholder="Your district"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={profile.address}
                    onChange={handleProfileChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen resize-none"
                    placeholder="Your full address"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="max-w-md">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Lock size={18} className="text-merogreen" />
                Change Password
              </h3>

              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-merogreen/20 focus:border-merogreen"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {passwords.confirmPassword &&
                    passwords.newPassword !== passwords.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        Passwords do not match
                      </p>
                    )}
                </div>
              </div>

              {/* Change Password Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={
                    saving ||
                    !passwords.currentPassword ||
                    !passwords.newPassword
                  }
                  className="flex items-center gap-2 px-6 py-2.5 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Change Password
                    </>
                  )}
                </button>
              </div>

              {/* Security Tips */}
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-800 mb-2">
                  Security Tips
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Use a strong, unique password</li>
                  <li>• Don't share your password with anyone</li>
                  <li>• Change your password regularly</li>
                  <li>• Avoid using common words or personal info</li>
                </ul>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VendorSettings;
