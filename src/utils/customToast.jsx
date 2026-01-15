import toast from "react-hot-toast";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

// Custom Toast Component
const CustomToast = ({ title, message, type = "success", t }) => {
  const config = {
    success: {
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-500",
      borderColor: "border-green-500",
      gradientFrom: "from-green-50",
    },
    error: {
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
      borderColor: "border-red-500",
      gradientFrom: "from-red-50",
    },
    warning: {
      icon: AlertCircle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-500",
      borderColor: "border-yellow-500",
      gradientFrom: "from-yellow-50",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500",
      gradientFrom: "from-blue-50",
    },
  };

  const { icon: Icon, iconBg, iconColor, borderColor, gradientFrom } = config[type];

  return (
    <div
      className={`
        ${t.visible ? "animate-enter" : "animate-leave"}
        max-w-sm w-full bg-linear-to-r ${gradientFrom} to-white
        shadow-md rounded-lg pointer-events-auto
        border-b-[3px] ${borderColor}
        overflow-hidden
      `}
    >
      <div className="px-3 py-2.5 flex items-center gap-3">
        {/* Icon Container */}
        <div className={`shrink-0 w-9 h-9 ${iconBg} rounded-full flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            {title}
          </h3>
          {message && (
            <p className="text-xs text-gray-600 leading-tight">
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast utility functions
const showToast = {
  success: (title, message) => {
    toast.custom((t) => <CustomToast title={title} message={message} type="success" t={t} />, {
      duration: 4000,
      position: "top-right",
    });
  },

  error: (title, message) => {
    toast.custom((t) => <CustomToast title={title} message={message} type="error" t={t} />, {
      duration: 5000,
      position: "top-right",
    });
  },

  warning: (title, message) => {
    toast.custom((t) => <CustomToast title={title} message={message} type="warning" t={t} />, {
      duration: 4000,
      position: "top-right",
    });
  },

  info: (title, message) => {
    toast.custom((t) => <CustomToast title={title} message={message} type="info" t={t} />, {
      duration: 4000,
      position: "top-right",
    });
  },
};

export default showToast;
