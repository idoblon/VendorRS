import React from "react";

interface SignupSuccessPageProps {
  onContinue: () => void;
}

export default function SignupSuccessPage({ onContinue }: SignupSuccessPageProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50 p-4">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Signup Successful!</h1>
      <p className="mb-6 text-green-800">
        Your application has been submitted and is pending verification.
      </p>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Back to Login
      </button>
    </div>
  );
}
