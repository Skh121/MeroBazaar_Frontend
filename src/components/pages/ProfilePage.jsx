import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Lock,
  Camera,
  Mail,
  Phone,
  Save,
  Loader2,
  ChevronDown,
  ShoppingBag,
  Package,
  Eye,
} from "lucide-react";
import Navbar from "../layout/Navbar";
import Footer from "../layout/Footer";
import { useAuthStore } from "../../store/lib/authStore";
import { useProfileStore } from "../../store/lib/profileStore";

const ProfilePage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  // Profile store
  const {
    personalInfo,
    addresses,
    orders,
    activeTab,
    loading,
    saving,
    ordersLoading,
    message,
    newAddress,
    security,
    setActiveTab,
    updatePersonalInfoField,
    updateNewAddressField,
    updateSecurityField,
    initFromUser,
    fetchProfile,
    fetchOrders,
    savePersonalInfo,
    saveAddress,
    changePassword,
  } = useProfileStore();

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      initFromUser(user);
      fetchProfile(token);
    }
  }, [user, token, initFromUser, fetchProfile]);

  // Fetch orders when orders tab is selected
  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      fetchOrders(token);
    }
  }, [activeTab, orders.length, token, fetchOrders]);

  const handlePersonalInfoChange = (e) => {
    updatePersonalInfoField(e.target.name, e.target.value);
  };

  const handleSavePersonalInfo = async () => {
    await savePersonalInfo(token, setUser, user);
  };

  const handleSaveAddress = async () => {
    await saveAddress(token);
  };

  const handleChangePassword = async () => {
    await changePassword(token);
  };

  // Get user initials
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format member since date
  const getMemberSince = () => {
    if (user?.createdAt) {
      const date = new Date(user.createdAt);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return "January 2024";
  };

  const tabs = [
    { id: "personal", label: "Personal Information", icon: User },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "security", label: "Security", icon: Lock },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-merogreen text-white flex items-center justify-center text-3xl font-bold">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(user.fullName)
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-merogreen rounded-full flex items-center justify-center text-white shadow-lg hover:bg-green-700 transition">
                      <Camera size={16} />
                    </button>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-gray-800 text-center">
                    {user.fullName}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Member since {getMemberSince()}
                  </p>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        activeTab === tab.id
                          ? "bg-green-50 text-merogreen border border-merogreen"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>

                {/* Save Button */}
                <button
                  onClick={
                    activeTab === "personal"
                      ? handleSavePersonalInfo
                      : activeTab === "addresses"
                      ? handleSaveAddress
                      : handleChangePassword
                  }
                  disabled={saving}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-merogreen text-white rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Save All Changes
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                {/* Message */}
                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                {/* Personal Information Tab */}
                {activeTab === "personal" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Personal Information
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Update your personal details and contact information
                    </p>

                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2
                          size={32}
                          className="text-merogreen animate-spin"
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={personalInfo.firstName}
                              onChange={handlePersonalInfoChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={personalInfo.lastName}
                              onChange={handlePersonalInfoChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="email"
                              name="email"
                              value={personalInfo.email}
                              disabled
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                          </div>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                              type="tel"
                              name="phone"
                              value={personalInfo.phone}
                              onChange={handlePersonalInfoChange}
                              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="+977 9812345678"
                            />
                          </div>
                        </div>

                        {/* Date of Birth & Gender */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={personalInfo.dateOfBirth}
                              onChange={handlePersonalInfoChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Gender
                            </label>
                            <div className="relative">
                              <select
                                name="gender"
                                value={personalInfo.gender}
                                onChange={handlePersonalInfoChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent appearance-none"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">
                                  Prefer not to say
                                </option>
                              </select>
                              <ChevronDown
                                size={18}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      My Orders
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Track and manage your orders
                    </p>

                    {ordersLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2
                          size={32}
                          className="text-merogreen animate-spin"
                        />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package
                          size={48}
                          className="text-gray-300 mx-auto mb-4"
                        />
                        <p className="text-gray-500">
                          You haven't placed any orders yet
                        </p>
                        <button
                          onClick={() => navigate("/")}
                          className="mt-4 px-6 py-2 bg-merogreen text-white rounded-lg hover:bg-green-700 transition"
                        >
                          Start Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {order.orderNumber}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.orderStatus === "delivered"
                                      ? "bg-green-100 text-green-700"
                                      : order.orderStatus === "shipped"
                                      ? "bg-purple-100 text-purple-700"
                                      : order.orderStatus === "processing"
                                      ? "bg-blue-100 text-blue-700"
                                      : order.orderStatus === "cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {order.orderStatus.charAt(0).toUpperCase() +
                                    order.orderStatus.slice(1)}
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    order.paymentStatus === "paid"
                                      ? "bg-green-100 text-green-700"
                                      : order.paymentStatus === "failed"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {order.paymentStatus === "paid"
                                    ? "Paid"
                                    : order.paymentStatus === "failed"
                                    ? "Payment Failed"
                                    : "Payment Pending"}
                                </span>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg"
                                >
                                  <span className="text-sm text-gray-700">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                              {order.items.length > 3 && (
                                <span className="text-sm text-gray-500 px-3 py-1.5">
                                  +{order.items.length - 3} more
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                              <p className="font-semibold text-merogreen">
                                Rs.{order.total}
                              </p>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/order-success/${order.orderNumber}`
                                  )
                                }
                                className="flex items-center gap-1 text-sm text-merogreen hover:underline"
                              >
                                <Eye size={16} />
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Addresses Tab */}
                {activeTab === "addresses" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Addresses
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Manage your delivery addresses
                    </p>

                    {/* Existing Addresses */}
                    {addresses.length > 0 && (
                      <div className="space-y-4 mb-8">
                        {addresses.map((address, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-800">
                                {address.label}
                              </span>
                              {address.isDefault && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm">
                              {address.street}, {address.city},{" "}
                              {address.district}, {address.province}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add New Address */}
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-800 mb-4">
                        Add New Address
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Label
                            </label>
                            <select
                              value={newAddress.label}
                              onChange={(e) =>
                                updateNewAddressField("label", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                            >
                              <option value="Home">Home</option>
                              <option value="Work">Work</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              value={newAddress.street}
                              onChange={(e) =>
                                updateNewAddressField("street", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="Enter street address"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) =>
                                updateNewAddressField("city", e.target.value)
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="Enter city"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              District
                            </label>
                            <input
                              type="text"
                              value={newAddress.district}
                              onChange={(e) =>
                                updateNewAddressField(
                                  "district",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                              placeholder="Enter district"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Province
                            </label>
                            <select
                              value={newAddress.province}
                              onChange={(e) =>
                                updateNewAddressField(
                                  "province",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                            >
                              <option value="">Select Province</option>
                              <option value="Province 1">Province 1</option>
                              <option value="Madhesh">Madhesh</option>
                              <option value="Bagmati">Bagmati</option>
                              <option value="Gandaki">Gandaki</option>
                              <option value="Lumbini">Lumbini</option>
                              <option value="Karnali">Karnali</option>
                              <option value="Sudurpashchim">
                                Sudurpashchim
                              </option>
                            </select>
                          </div>
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newAddress.isDefault}
                            onChange={(e) =>
                              updateNewAddressField(
                                "isDefault",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-merogreen border-gray-300 rounded focus:ring-merogreen"
                          />
                          <span className="text-sm text-gray-600">
                            Set as default address
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Security
                    </h2>
                    <p className="text-gray-500 mb-6">
                      Manage your password and security settings
                    </p>

                    <div className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={security.currentPassword}
                          onChange={(e) =>
                            updateSecurityField(
                              "currentPassword",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={security.newPassword}
                          onChange={(e) =>
                            updateSecurityField("newPassword", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={security.confirmPassword}
                          onChange={(e) =>
                            updateSecurityField(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
