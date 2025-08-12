import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import axiosInstance from "../../utils/axios";

interface SignupPageProps {
  onShowLogin: () => void;
  onSignupSuccess: () => void;
}

interface SignupFormData {
  vendorName: string;
  panNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  province: string;
  district: string;
  contactPerson1: {
    name: string;
    phone: string;
  };
  contactPerson2: {
    name: string;
    phone: string;
  };
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branch: string;
    holderName: string;
  };
}

export function VendorDashboard({
  onShowLogin,
  onSignupSuccess,
}: SignupPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    vendorName: "",
    panNumber: "",
    email: "",
    phoneNumber: "",
    password: "",
    province: "",
    district: "",
    contactPerson1: { name: "", phone: "" },
    contactPerson2: { name: "", phone: "" },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      branch: "",
      holderName: "",
    },
  });

  const [panDocument, setPanDocument] = useState<File | null>(null);

  // Province and District data as before
  const provinces = [
    { id: "1", name: "Province 1" },
    { id: "2", name: "Province 2" },
    { id: "3", name: "Bagmati Province" },
  ];

  const districtsByProvince: Record<string, { id: string; name: string }[]> = {
    "1": [
      { id: "1", name: "Morang" },
      { id: "2", name: "Sunsari" },
    ],
    "2": [
      { id: "3", name: "Parsa" },
      { id: "4", name: "Bara" },
    ],
    "3": [
      { id: "5", name: "Kathmandu" },
      { id: "6", name: "Lalitpur" },
    ],
  };

  // Input handlers (same as before)
  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (
    parent: keyof SignupFormData,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value,
      },
    }));
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, district: "" }));
  }, [formData.province]);

  // Validation helpers (same as before)
  const validateAccountNumber = (accountNumber: string): boolean => {
    if (!/^\d+$/.test(accountNumber)) return false;
    if (accountNumber.length < 10 || accountNumber.length > 20) return false;
    return true;
  };

  const validateAccountHolderName = (holderName: string): boolean => {
    return /^[a-zA-Z\u0900-\u097F\s]+$/.test(holderName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.vendorName.trim()) {
      alert("Please enter vendor name");
      setIsLoading(false);
      return;
    }

    if (!formData.panNumber.trim()) {
      alert("Please enter PAN number");
      setIsLoading(false);
      return;
    }

    if (!panDocument) {
      alert("Please upload the PAN document");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter email");
      setIsLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      alert("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.phoneNumber.startsWith("+977")) {
      alert("Phone number must start with +977");
      setIsLoading(false);
      return;
    }

    if (!formData.province) {
      alert("Please select a province");
      setIsLoading(false);
      return;
    }

    if (!formData.district) {
      alert("Please select a district");
      setIsLoading(false);
      return;
    }

    if (!formData.contactPerson1.name || !formData.contactPerson1.phone) {
      alert("Please enter contact person 1's name and phone");
      setIsLoading(false);
      return;
    }

    if (!formData.bankDetails.bankName.trim()) {
      alert("Please enter bank name");
      setIsLoading(false);
      return;
    }

    if (!validateAccountNumber(formData.bankDetails.accountNumber)) {
      alert("Account number must be 10-20 digits");
      setIsLoading(false);
      return;
    }

    if (!validateAccountHolderName(formData.bankDetails.holderName)) {
      alert("Account holder name contains invalid characters");
      setIsLoading(false);
      return;
    }

    // Prepare FormData for multipart request
    const data = new FormData();
    data.append("name", formData.vendorName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phone", formData.phoneNumber);
    data.append("role", "VENDOR");
    data.append("businessName", formData.vendorName);
    data.append("panNumber", formData.panNumber);
    data.append("address", `${formData.district}, ${formData.province}`);
    data.append("district", formData.district);
    data.append("province", formData.province);
    data.append("bankDetails", JSON.stringify(formData.bankDetails));
    data.append(
      "contactPersons",
      JSON.stringify(
        [formData.contactPerson1, formData.contactPerson2].filter(
          (p) => p.name && p.phone
        )
      )
    );
    data.append("panDocument", panDocument);

    try {
      const response = await axiosInstance.post("/api/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setIsLoading(false);

      if (response.data.success) {
        alert(
          "Application submitted successfully! Your application has been sent to the admin for verification."
        );
        onSignupSuccess();
      } else {
        alert(
          response.data.message ||
            "Failed to submit application. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setIsLoading(false);

      alert(
        error.response?.data?.message ||
          "An error occurred while submitting your application. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/vrslogo.png"
              alt="Vendor Request System Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vendor Registration
          </h1>
          <p className="text-lg text-gray-600">
            Join our vendor network and start your business journey
          </p>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <button
              onClick={onShowLogin}
              className="flex items-center text-orange-600 hover:text-orange-500 font-medium transition-colors"
              type="button"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Vendor Name */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="vendorName"
              >
                Vendor Name
              </label>
              <input
                id="vendorName"
                type="text"
                value={formData.vendorName}
                onChange={(e) =>
                  handleInputChange("vendorName", e.target.value)
                }
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* PAN Number */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="panNumber"
              >
                PAN Number (e.g., १२३४५६७८९)
              </label>
              <input
                id="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleInputChange("panNumber", e.target.value)}
                required
                placeholder="१२३४५६७८९"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* PAN Document Upload */}
            <div>
              <label
                htmlFor="panDocument"
                className="block text-gray-700 font-semibold mb-1"
              >
                Upload PAN Document (PDF/Image)
              </label>
              <input
                id="panDocument"
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPanDocument(e.target.files[0]);
                  } else {
                    setPanDocument(null);
                  }
                }}
                required
                className="w-full text-gray-700"
              />
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="At least 6 chars, uppercase, lowercase, number"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="phoneNumber"
              >
                Phone Number (+977 Nepali Format)
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="+977XXXXXXXXX"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Province */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="province"
              >
                Province
              </label>
              <select
                id="province"
                value={formData.province}
                onChange={(e) => handleInputChange("province", e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label
                className="block text-gray-700 font-semibold mb-1"
                htmlFor="district"
              >
                District
              </label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                disabled={!formData.province}
              >
                <option value="">Select District</option>
                {(
                  districtsByProvince[
                    provinces.find((p) => p.name === formData.province)?.id ||
                      ""
                  ] || []
                ).map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Person 1 */}
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold text-gray-700 mb-2">
                Contact Person 1
              </legend>
              <div className="mb-2">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="contactPerson1Name"
                >
                  Name
                </label>
                <input
                  id="contactPerson1Name"
                  type="text"
                  value={formData.contactPerson1.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contactPerson1",
                      "name",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="contactPerson1Phone"
                >
                  Phone
                </label>
                <input
                  id="contactPerson1Phone"
                  type="tel"
                  value={formData.contactPerson1.phone}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contactPerson1",
                      "phone",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </fieldset>

            {/* Contact Person 2 */}
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold text-gray-700 mb-2">
                Contact Person 2 (optional)
              </legend>
              <div className="mb-2">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="contactPerson2Name"
                >
                  Name
                </label>
                <input
                  id="contactPerson2Name"
                  type="text"
                  value={formData.contactPerson2.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contactPerson2",
                      "name",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="contactPerson2Phone"
                >
                  Phone
                </label>
                <input
                  id="contactPerson2Phone"
                  type="tel"
                  value={formData.contactPerson2.phone}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "contactPerson2",
                      "phone",
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </fieldset>

            {/* Bank Details */}
            <fieldset className="border p-4 rounded">
              <legend className="font-semibold text-gray-700 mb-2">
                Bank Details
              </legend>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1" htmlFor="bankName">
                  Bank Name
                </label>
                <input
                  id="bankName"
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "bankDetails",
                      "bankName",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 mb-1" htmlFor="branch">
                  Branch
                </label>
                <input
                  id="branch"
                  type="text"
                  value={formData.bankDetails.branch}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "bankDetails",
                      "branch",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="mb-2">
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="accountNumber"
                >
                  Account Number
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "bankDetails",
                      "accountNumber",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 mb-1"
                  htmlFor="holderName"
                >
                  Account Holder Name
                </label>
                <input
                  id="holderName"
                  type="text"
                  value={formData.bankDetails.holderName}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "bankDetails",
                      "holderName",
                      e.target.value
                    )
                  }
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </fieldset>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Vendor Request System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
