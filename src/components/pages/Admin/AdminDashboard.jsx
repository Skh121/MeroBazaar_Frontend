import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { useAuthStore } from "../../../store/lib/authStore";
import { useLogout } from "../../../hooks/useAuth";
import Logo from "../../../assets/images/Logo.svg";

// Import content components
import AdminDashboardContent from "./AdminDashboardContent";
import AdminVendorsContent from "./AdminVendorsContent";
import AdminCustomersContent from "./AdminCustomersContent";
import AdminOrdersContent from "./AdminOrdersContent";
import AdminMessagesContent from "./AdminMessagesContent";
import AdminSettingsContent from "./AdminSettingsContent";

const MENU_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  { id: "vendors", label: "Vendors", icon: Store, path: "/admin/vendors" },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
    path: "/admin/customers",
  },
  { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  {
    id: "messages",
    label: "Messages",
    icon: MessageSquare,
    path: "/admin/messages",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active menu based on path
  const getActiveMenu = () => {
    const path = location.pathname;
    if (path.includes("/orders")) return "orders";
    if (path.includes("/vendors")) return "vendors";
    if (path.includes("/customers")) return "customers";
    if (path.includes("/messages")) return "messages";
    if (path.includes("/analytics")) return "analytics";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const activeMenu = getActiveMenu();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sidebar Component
  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${mobile ? "fixed inset-0 z-50" : "hidden lg:flex"}
        ${sidebarOpen ? "w-64" : "w-20"}
        flex-col bg-white border-r border-gray-200 transition-all duration-300`}
    >
      {mobile && (
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`${
          mobile ? "relative z-10 w-64 h-full bg-white" : ""
        } flex flex-col h-full`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin/dashboard" className="flex items-center">
            {sidebarOpen ? (
              <img src={Logo} alt="MeroBazaar" className="h-8 w-auto" />
            ) : (
              <img
                src={Logo}
                alt="MeroBazaar"
                className="h-8 w-8 object-contain"
              />
            )}
          </Link>
          {mobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-500"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeMenu;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition
                  ${
                    isActive
                      ? "bg-green-50 text-merogreen"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );

  // Render content based on active menu
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <AdminDashboardContent token={token} />;
      case "vendors":
        return <AdminVendorsContent token={token} />;
      case "customers":
        return <AdminCustomersContent token={token} />;
      case "orders":
        return <AdminOrdersContent token={token} />;
      case "messages":
        return <AdminMessagesContent token={token} />;
      case "analytics":
        return (
          <div className="text-center py-20">
            <BarChart3 size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-600">
              Analytics Dashboard
            </h2>
            <p className="text-gray-400">
              Visit{" "}
              <Link
                to="/admin/analytics"
                className="text-merogreen hover:underline"
              >
                Analytics Section
              </Link>{" "}
              for detailed insights
            </p>
          </div>
        );
      case "settings":
        return (
          <AdminSettingsContent
            token={token}
            user={user}
            updateUser={updateUser}
          />
        );
      default:
        return <AdminDashboardContent token={token} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      {mobileMenuOpen && <Sidebar mobile />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* User Menu */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-merogreen rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
