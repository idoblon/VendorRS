import React, { useState, useEffect } from "react";
import { ArrowLeft, X, Check, Eye, EyeOff } from "lucide-react";
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

interface Province {
  id: string;
  name_en: string;
}

interface District {
  id: string;
  name_en: string;
}

const nepaliBanks = [
  {
    name: "Nepal Bank Limited",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Bharatpur",
    ],
  },
  {
    name: "Rastriya Banijya Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Dharan",
      "Janakpur",
      "Bharatpur",
      "Hetauda",
    ],
  },
  {
    name: "Nabil Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Lalitpur",
      "Bhaktapur",
    ],
  },
  {
    name: "Himalayan Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Lalitpur",
      "Bhaktapur",
    ],
  },
  {
    name: "Standard Chartered Bank",
    branches: ["Kathmandu", "Pokhara", "Biratnagar", "Lalitpur", "Bhaktapur"],
  },
  {
    name: "Everest Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Bharatpur",
    ],
  },
  {
    name: "Sanima Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Hetauda",
    ],
  },
  {
    name: "NIC Asia Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Bharatpur",
      "Janakpur",
    ],
  },
  {
    name: "Machhapuchchhre Bank",
    branches: ["Pokhara", "Kathmandu", "Biratnagar", "Butwal", "Dharan"],
  },
  {
    name: "Prime Commercial Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Janakpur",
      "Lalitpur",
    ],
  },
  {
    name: "Global IME Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Bharatpur",
      "Hetauda",
    ],
  },
  {
    name: "Prabhu Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Janakpur",
    ],
  },
  {
    name: "Citizens Bank International",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Lalitpur",
      "Bhaktapur",
    ],
  },
  {
    name: "Agriculture Development Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Nepalgunj",
      "Bharatpur",
      "Janakpur",
      "Hetauda",
    ],
  },
  {
    name: "Siddhartha Bank",
    branches: [
      "Kathmandu",
      "Pokhara",
      "Biratnagar",
      "Birgunj",
      "Butwal",
      "Dharan",
      "Lalitpur",
    ],
  },
];

export default function VendorSignupPage({
  onShowLogin,
  onSignupSuccess,
}: SignupPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [panDocument, setPanDocument] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [availableBranches, setAvailableBranches] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    provinces: false,
    districts: false,
  });
  const [apiErrors, setApiErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<SignupFormData>({
    vendorName: "",
    panNumber: "",
    email: "",
    phoneNumber: "+977",
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

  // Load provinces on component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      setApiErrors((prev) => ({ ...prev, provinces: "" }));
      try {
        const provincesData = await fetchProvinces();
        const formattedProvinces = provincesData.map((province: Province) => ({
          id: province.id,
          name: province.name_en,
        }));
        setProvinces(formattedProvinces);
      } catch (error) {
        console.error("Error loading provinces:", error);
        setApiErrors((prev) => ({
          ...prev,
          provinces: "Failed to load provinces. Please try again.",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.province) {
        setDistricts([]);
        return;
      }

      setLoadingStates((prev) => ({ ...prev, districts: true }));
      setApiErrors((prev) => ({ ...prev, districts: "" }));
      try {
        const districtsData = await fetchDistrictsByProvince(formData.province);
        const formattedDistricts = districtsData.map((district: District) => ({
          id: district.id,
          name: district.name_en,
        }));
        setDistricts(formattedDistricts);
      } catch (error) {
        console.error("Error loading districts:", error);
        setApiErrors((prev) => ({
          ...prev,
          districts: "Failed to load districts. Please try again.",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, districts: false }));
      }
    };
    loadDistricts();
  }, [formData.province]);

  // Update available branches when bank changes
  useEffect(() => {
    if (formData.bankDetails.bankName) {
      const selectedBank = nepaliBanks.find(
        (bank) => bank.name === formData.bankDetails.bankName
      );
      setAvailableBranches(selectedBank?.branches || []);
      // Reset branch when bank changes
      setFormData((prev) => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          branch: "",
        },
      }));
    } else {
      setAvailableBranches([]);
    }
  }, [formData.bankDetails.bankName]);

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

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!formData.vendorName.trim())
      validationErrors.push("Vendor name is required");
    if (!formData.panNumber.trim())
      validationErrors.push("PAN number is required");
    if (!panDocument) validationErrors.push("PAN document is required");
    if (!formData.email.trim()) validationErrors.push("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      validationErrors.push("Invalid email format");
    if (formData.password.length < 6)
      validationErrors.push("Password must be at least 6 characters");
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      validationErrors.push(
        "Password must contain uppercase, lowercase and number"
      );
    }
    if (
      !formData.phoneNumber.startsWith("+977") ||
      formData.phoneNumber.length !== 13
    ) {
      validationErrors.push("Phone number must be in +977XXXXXXXXX format");
    }
    if (!formData.province) validationErrors.push("Province is required");
    if (!formData.district) validationErrors.push("District is required");
    if (!formData.contactPerson1.name || !formData.contactPerson1.phone) {
      validationErrors.push("Contact Person 1 details are required");
    }
    if (!formData.bankDetails.bankName)
      validationErrors.push("Bank name is required");
    if (!formData.bankDetails.branch)
      validationErrors.push("Bank branch is required");
    if (!/^\d{10,20}$/.test(formData.bankDetails.accountNumber)) {
      validationErrors.push("Account number must be 10-20 digits");
    }
    if (!/^[a-zA-Z\u0900-\u097F\s]+$/.test(formData.bankDetails.holderName)) {
      validationErrors.push("Account holder name contains invalid characters");
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitState("submitting");

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setErrors(formErrors);
      setIsLoading(false);
      setSubmitState("error");
      return;
    }

    // Get province and district names from IDs
    const selectedProvinceName =
      provinces.find((p) => p.id === formData.province)?.name || "";
    const selectedDistrictName =
      districts.find((d) => d.id === formData.district)?.name || "";

    // Prepare FormData for multipart request
    const data = new FormData();
    data.append("name", formData.vendorName);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phone", formData.phoneNumber);
    data.append("role", "VENDOR");
    data.append("businessName", formData.vendorName);
    data.append("panNumber", formData.panNumber);
    data.append("address", `${selectedDistrictName}, ${selectedProvinceName}`);
    data.append("district", selectedDistrictName);
    data.append("province", selectedProvinceName);
    data.append("districtId", formData.district);
    data.append("provinceId", formData.province);
    data.append("bankDetails", JSON.stringify(formData.bankDetails));
    data.append(
      "contactPersons",
      JSON.stringify(
        [formData.contactPerson1, formData.contactPerson2].filter(
          (p) => p.name && p.phone
        )
      )
    );
    if (panDocument) data.append("panDocument", panDocument);

    try {
      const response = await axiosInstance.post("/api/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSubmitState("success");
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      } else {
        setErrors([response.data.message || "Failed to submit application"]);
        setSubmitState("error");
      }
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setErrors([
        error.response?.data?.message ||
          "An error occurred while submitting your application",
      ]);
      setSubmitState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (formData.password.length === 0) return 0;
    if (formData.password.length < 6) return 30;
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) return 60;
    return 100;
  };

  const passwordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength < 30) return "bg-gray-200";
    if (strength < 60) return "bg-red-500";
    if (strength < 100) return "bg-yellow-500";
    return "bg-green-500";
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

          {submitState === "success" && (
            <div className="p-4 bg-green-100 text-green-700 rounded mb-6 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Application submitted successfully! Redirecting...
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-4 bg-red-100 text-red-700 rounded mb-6">
              <ul className="list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            encType="multipart/form-data"
          >
            {/* Vendor Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Vendor Information
              </h3>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Center Name *
                </label>
                <input
                  type="text"
                  value={formData.centerName}
                  onChange={(e) =>
                    handleInputChange("centerName", e.target.value)
                  }
                  required
                  placeholder="Enter center name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) =>
                      handleInputChange("panNumber", e.target.value)
                    }
                    required
                    placeholder="123456789"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    PAN Document *
                  </label>
                  <div className="border border-gray-300 rounded p-2">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) =>
                        setPanDocument(e.target.files?.[0] || null)
                      }
                      required
                      className="w-full text-gray-700"
                    />
                  </div>
                  {panDocument && (
                    <div className="mt-2 flex items-center text-sm text-gray-600">
                      <span className="truncate flex-1">
                        {panDocument.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPanDocument(null)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Account Information
              </h3>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      required
                      placeholder="Enter password"
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="h-1 mt-1 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${passwordStrengthColor()}`}
                      style={{ width: `${passwordStrength()}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password must contain at least 6 characters with uppercase,
                    lowercase, and number
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 rounded-l bg-gray-100 text-gray-700">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber.replace("+977", "")}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        handleInputChange("phoneNumber", `+977${value}`);
                      }}
                      required
                      className="flex-1 border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Address Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Province *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => {
                      handleInputChange("province", e.target.value);
                      handleInputChange("district", ""); // Reset district when province changes
                    }}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    disabled={loadingStates.provinces}
                  >
                    <option value="">Select Province</option>
                    {loadingStates.provinces ? (
                      <option value="" disabled>
                        Loading provinces...
                      </option>
                    ) : (
                      provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))
                    )}
                  </select>
                  {apiErrors.provinces && (
                    <p className="text-red-500 text-sm mt-1">
                      {apiErrors.provinces}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    District *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                    required
                    disabled={!formData.province || loadingStates.districts}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select District</option>
                    {loadingStates.districts ? (
                      <option value="" disabled>
                        Loading districts...
                      </option>
                    ) : (
                      districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))
                    )}
                  </select>
                  {apiErrors.districts && (
                    <p className="text-red-500 text-sm mt-1">
                      {apiErrors.districts}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <fieldset className="border p-4 rounded">
                  <legend className="font-medium text-gray-700 px-2">
                    Primary Contact *
                  </legend>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Name</label>
                      <input
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
                        placeholder="Enter name"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Phone</label>
                      <input
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
                        placeholder="+977 9840000000"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 rounded">
                  <legend className="font-medium text-gray-700 px-2">
                    Secondary Contact
                  </legend>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 mb-1">Name</label>
                      <input
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
                      <label className="block text-gray-700 mb-1">Phone</label>
                      <input
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
                  </div>
                </fieldset>
              </div>
            </div>

            {/* Bank Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Bank Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Bank Name *
                  </label>
                  <select
                    value={formData.bankDetails.bankName}
                    onChange={(e) => {
                      handleNestedInputChange(
                        "bankDetails",
                        "bankName",
                        e.target.value
                      );
                    }}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select Bank</option>
                    {nepaliBanks.map((bank) => (
                      <option key={bank.name} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Branch *
                  </label>
                  <select
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "branch",
                        e.target.value
                      )
                    }
                    required
                    disabled={!formData.bankDetails.bankName}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select Branch</option>
                    {availableBranches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Account Number *
                  </label>
                  <input
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
                    placeholder="Enter account number"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be 10-20 digits
                  </p>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Account Holder Name *
                  </label>
                  <input
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
                    placeholder="Enter account holder name"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || submitState === "success"}
              className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-lg transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : submitState === "success" ? (
                "Submitted Successfully!"
              ) : (
                "Submit Application"
              )}
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
