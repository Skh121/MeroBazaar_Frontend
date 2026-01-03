import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";

const VendorRegistrationSuccess = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-merogreen" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Registration Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Your vendor registration has been submitted successfully. Our team
            will review your application.
          </p>

          {/* Status Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-yellow-700">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Pending Approval</span>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              You will receive an email once your account is approved by the
              admin.
            </p>
          </div>

          {/* What's Next */}
          <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-merogreen text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Our team reviews your application (1-2 business days)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </span>
                <span>You receive an approval email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-gray-300 text-white rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </span>
                <span>Start selling on MeroBazaar!</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/vendor/login"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-merogreen text-white font-medium hover:bg-green-700 transition"
            >
              Go to Vendor Login
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/"
              className="block w-full py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegistrationSuccess;
