import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  User,
  Shield,
  Bell,
  Save,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Camera,
  Lock,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AdminSettingsContent = ({ token, user, updateUser }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Password settings state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings state
  const [notificationData, setNotificationData] = useState({
    emailOnNewOrder: true,
    emailOnNewVendor: true,
    emailOnNewCustomer: false,
    emailOnLowStock: true,
    emailOnContactMessage: true,
    dailyReport: false,
    weeklyReport: true,
  });
  const [adminEmail, setAdminEmail] = useState("");
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // Fetch notification settings on mount
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      setNotificationsLoading(true);
      const response = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setNotificationData(response.data.notifications || {});
        setAdminEmail(response.data.adminEmail || user?.email || "");
      }
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/users/profile`,
        {
          fullName: profileData.fullName,
          phone: profileData.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (updateUser) {
        updateUser({
          fullName: profileData.fullName,
          phone: profileData.phone,
        });
      }
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/users/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_URL}/settings/notifications`,
        {
          ...notificationData,
          adminEmail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Notification settings saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save notification settings");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your account and platform settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === tab.id
                      ? "bg-merogreen text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Profile Settings */}
            {activeTab === "profile" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Profile Settings</h2>

                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="relative">
                    <div className="w-20 h-20 bg-merogreen rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {profileData.fullName?.charAt(0)?.toUpperCase() || "A"}
                      </span>
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
                      <Camera size={14} className="text-gray-600" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{profileData.fullName}</h3>
                    <p className="text-sm text-gray-500">Administrator</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) =>
                          setProfileData({ ...profileData, fullName: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Security Settings</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Lock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Change Password</h3>
                      <p className="text-sm text-gray-500">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={handleChangePassword}
                    disabled={
                      loading ||
                      !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword
                    }
                    className="flex items-center gap-2 px-6 py-2.5 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Shield size={18} />
                    )}
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Notification Settings</h2>

                {notificationsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-merogreen" />
                  </div>
                ) : (
                <div className="space-y-4">
                  {/* Admin Email */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Notification Email</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      All notifications will be sent to this email address
                    </p>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="Enter email address for notifications"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-merogreen focus:border-merogreen"
                      />
                    </div>
                  </div>

                  {/* Email Notifications */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "emailOnNewOrder",
                          label: "New Order",
                          desc: "Receive email when a new order is placed",
                        },
                        {
                          key: "emailOnNewVendor",
                          label: "New Vendor Registration",
                          desc: "Receive email when a new vendor applies",
                        },
                        {
                          key: "emailOnNewCustomer",
                          label: "New Customer Registration",
                          desc: "Receive email when a new customer signs up",
                        },
                        {
                          key: "emailOnLowStock",
                          label: "Low Stock Alert",
                          desc: "Receive email when product stock is low",
                        },
                        {
                          key: "emailOnContactMessage",
                          label: "Contact Form Message",
                          desc: "Receive email when someone submits contact form",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={notificationData[item.key]}
                              onChange={(e) =>
                                setNotificationData({
                                  ...notificationData,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-merogreen after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Report Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-4">Scheduled Reports</h3>
                    <div className="space-y-3">
                      {[
                        {
                          key: "dailyReport",
                          label: "Daily Summary Report",
                          desc: "Automatically sent every day at 6:00 AM",
                        },
                        {
                          key: "weeklyReport",
                          label: "Weekly Analytics Report",
                          desc: "Automatically sent every Monday at 7:00 AM",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={notificationData[item.key]}
                              onChange={(e) =>
                                setNotificationData({
                                  ...notificationData,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-merogreen after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Reports include order summaries, revenue metrics, top products, and low stock alerts.
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={loading || !adminEmail}
                      className="flex items-center gap-2 px-6 py-2.5 bg-merogreen text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      Save Notification Settings
                    </button>
                    {!adminEmail && (
                      <p className="text-sm text-orange-600 mt-2">
                        Please enter an email address to receive notifications
                      </p>
                    )}
                  </div>
                </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsContent;
