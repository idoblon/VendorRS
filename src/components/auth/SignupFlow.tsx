import React, { useState } from "react";
import { User, Building, ArrowLeft } from "lucide-react";
import VendorSignupPage from "./VendorSignupPage";
import CenterSignupPage from "./CenterSignupPage";

type Role = "vendor" | "center";

interface SignupFlowProps {
  onShowLogin: () => void;
  onSignupSuccess: () => void;
}

export default function SignupFlow({
  onShowLogin,
  onSignupSuccess,
}: SignupFlowProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  if (!selectedRole) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Sign Up as
        </h2>

        <div className="flex flex-col gap-5">
          <button
            onClick={() => setSelectedRole("vendor")}
            className="flex items-center justify-center gap-3 py-3 px-5 bg-orange-500 hover:bg-orange-600 transition-colors rounded-md text-white font-semibold text-lg shadow-md"
            aria-label="Sign up as Vendor"
          >
            <User size={24} />
            Vendor
          </button>

          <button
            onClick={() => setSelectedRole("center")}
            className="flex items-center justify-center gap-3 py-3 px-5 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white font-semibold text-lg shadow-md"
            aria-label="Sign up as Center"
          >
            <Building size={24} />
            Center
          </button>
        </div>

        <button
          onClick={onShowLogin}
          className="mt-8 w-full py-2 text-gray-600 hover:text-gray-900 underline text-center font-medium transition-colors"
          aria-label="Back to Login"
        >
          <div className="flex items-center justify-center gap-2">
            <ArrowLeft size={16} />
            Back to Login
          </div>
        </button>
      </div>
    );
  }

  if (selectedRole === "vendor") {
    return (
      <VendorSignupPage
        onShowLogin={onShowLogin}
        onSignupSuccess={onSignupSuccess}
      />
    );
  }

  if (selectedRole === "center") {
    return (
      <CenterSignupPage
        onShowLogin={onShowLogin}
        onSignupSuccess={onSignupSuccess}
      />
    );
  }

  return null;
}
