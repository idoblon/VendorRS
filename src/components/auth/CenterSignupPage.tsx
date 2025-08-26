import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Upload,
  X,
  FileText,
  ImageIcon,
} from "lucide-react";
import { Card } from "../ui/Card";
import nepalAddressData from "../../data/nepaladdress.json";
import nepaliBanksData from "../../data/nepali-banks.json";
import axiosInstance from "../../utils/axios";
import { getCategories } from "../../utils/categoryApi";

interface SignupPageProps {
  onShowLogin: () => void;
  onSignupSuccess: () => void;
}

interface SignupFormData {
  centerName: string;
  panNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  province: string;
  district: string;
  categories: string[];
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
  displayName: string;
}

interface District {
  id: string;
  displayName: string;
}

const nepaliBanks = nepaliBanksData;

const fetchProvinces = async (): Promise<Province[]> => {
  return nepalAddressData.provinces;
};

const fetchDistricts = async (provinceId: string): Promise<District[]> => {
  return (
    nepalAddressData.districts[
      provinceId as keyof typeof nepalAddressData.districts
    ] || []
  );
};

const validateNepalPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 13 && cleanPhone.startsWith("977")) {
    const localNumber = cleanPhone.substring(3);
    return localNumber.length === 10 && localNumber.startsWith("9");
  } else if (cleanPhone.length === 10 && cleanPhone.startsWith("9")) {
    return true;
  }

  return false;
};

const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, "");

  if (cleanPhone.length === 10 && cleanPhone.startsWith("9")) {
    return `+977${cleanPhone}`;
  } else if (cleanPhone.length === 13 && cleanPhone.startsWith("977")) {
    return `+${cleanPhone}`;
  } else if (cleanPhone.startsWith("977") && cleanPhone.length > 10) {
    return `+${cleanPhone}`;
  }

  return phone;
};

function calculatePasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

export default function CenterSignupPage({
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
  const [isDragOver, setIsDragOver] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>({
    centerName: "",
    panNumber: "",
    email: "",
    phoneNumber: "+977",
    password: "",
    province: "",
    district: "",
    categories: [],
    contactPerson1: { name: "", phone: "" },
    contactPerson2: { name: "", phone: "" },
    bankDetails: {
      bankName: "",
      accountNumber: "",
      branch: "",
      holderName: "",
    },
  });

  const [passwordStrength, setPasswordStrength] = useState(
    calculatePasswordStrength("")
  );

  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingStates((prev) => ({ ...prev, provinces: true }));
      try {
        const provincesData = await fetchProvinces();
        setProvinces(provincesData);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, provinces: false }));
      }
    };
    loadProvinces();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData.map((cat) => cat.name));
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (formData.province) {
      const loadDistricts = async () => {
        setLoadingStates((prev) => ({ ...prev, districts: true }));
        try {
          const districtsData = await fetchDistricts(formData.province);
          setDistricts(districtsData);
        } catch (error) {
          console.error("Failed to load districts:", error);
        } finally {
          setLoadingStates((prev) => ({ ...prev, districts: false }));
        }
      };
      loadDistricts();
    } else {
      setDistricts([]);
    }
    if (formData.district) {
      setFormData((prev) => ({ ...prev, district: "" }));
    }
  }, [formData.province]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSubmitState("submitting");

    // Validate form fields
    const newErrors: string[] = [];

    if (!formData.centerName.trim()) newErrors.push("Center name is required");
    if (!formData.email.trim()) newErrors.push("Email is required");
    if (!formData.phoneNumber.trim() || formData.phoneNumber === "+977")
      newErrors.push("Phone number is required");
    if (!formData.password.trim()) newErrors.push("Password is required");
    if (!formData.province) newErrors.push("Province is required");
    if (!formData.district) newErrors.push("District is required");
    if (formData.categories.length === 0)
      newErrors.push("At least one category must be selected");
    if (!formData.contactPerson1.name.trim())
      newErrors.push("Contact person name is required");
    if (!formData.contactPerson1.phone.trim())
      newErrors.push("Contact person phone is required");
    if (!panDocument) newErrors.push("PAN document is required");

    if (
      formData.phoneNumber &&
      !validateNepalPhoneNumber(formData.phoneNumber)
    ) {
      newErrors.push("Please enter a valid Nepal mobile number");
    }
    if (
      formData.contactPerson1.phone &&
      !validateNepalPhoneNumber(formData.contactPerson1.phone)
    ) {
      newErrors.push("Please enter a valid phone number for contact person 1");
    }
    if (
      formData.contactPerson2.phone &&
      !validateNepalPhoneNumber(formData.contactPerson2.phone)
    ) {
      newErrors.push("Please enter a valid phone number for contact person 2");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push("Please enter a valid email address");
    }

    if (passwordStrength < 3) {
      newErrors.push("Password must be stronger (at least 3 criteria)");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      setSubmitState("error");
      return;
    }

    try {
      const formDataToSubmit = new FormData();

      // Append all simple fields
      formDataToSubmit.append("name", formData.centerName);
      formDataToSubmit.append("email", formData.email);
      formDataToSubmit.append("password", formData.password);
      formDataToSubmit.append("phone", formData.phoneNumber);
      formDataToSubmit.append("role", "CENTER");
      formDataToSubmit.append("businessName", formData.centerName);
      formDataToSubmit.append("panNumber", formData.panNumber || "");
      formDataToSubmit.append("address", formData.district);
      formDataToSubmit.append("district", formData.district);
      formDataToSubmit.append("province", formData.province);
      formDataToSubmit.append(
        "categories",
        JSON.stringify(formData.categories)
      );

      // Append contact persons
      formDataToSubmit.append(
        "contactPersons",
        JSON.stringify(
          [
            {
              name: formData.contactPerson1.name,
              phone: formData.contactPerson1.phone,
            },
            formData.contactPerson2.name
              ? {
                  name: formData.contactPerson2.name,
                  phone: formData.contactPerson2.phone,
                }
              : null,
          ].filter(Boolean)
        )
      );

      // Append bank details
      formDataToSubmit.append(
        "bankDetails",
        JSON.stringify({
          bankName: formData.bankDetails.bankName,
          accountNumber: formData.bankDetails.accountNumber,
          branch: formData.bankDetails.branch,
          holderName: formData.bankDetails.holderName,
        })
      );

      // Append PAN document if exists
      if (panDocument) {
        formDataToSubmit.append("panDocument", panDocument);
      }

      const response = await axiosInstance.post(
        "/api/auth/register",
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSubmitState("success");
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please try again.";
      setErrors([errorMessage]);
      setSubmitState("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (field === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleNestedInputChange = (
    parentField: keyof SignupFormData,
    childField: string,
    value: string
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      [parentField]: {
        ...(prevData[parentField] as any),
        [childField]: value,
      },
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prevData) => {
      const newCategories = prevData.categories.includes(category)
        ? prevData.categories.filter((c) => c !== category)
        : [...prevData.categories, category];

      return {
        ...prevData,
        categories: newCategories,
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      if (
        !["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
          file.type
        )
      ) {
        alert("Only PDF and image files are allowed");
        return;
      }
      setPanDocument(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      if (
        !["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
          file.type
        )
      ) {
        alert("Only PDF and image files are allowed");
        return;
      }
      setPanDocument(file);
    }
  };

  const removeFile = () => {
    setPanDocument(null);
    const fileInput = document.getElementById(
      "panDocument"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return "bg-red-500";
    if (strength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Medium";
    return "Strong";
  };

  const handleBankChange = (bankName: string) => {
    const selectedBank = nepaliBanks.find((bank) => bank.name === bankName);
    if (selectedBank) {
      setAvailableBranches(selectedBank.branches || []);
    } else {
      setAvailableBranches([]);
    }
    handleNestedInputChange("bankDetails", "bankName", bankName);
    handleNestedInputChange("bankDetails", "branch", "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/image/vrslogo.png"
              alt="Center Request System Logo"
              className="w-20 h-20 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Center Registration
          </h1>
          <p className="text-lg text-gray-600">
            Join our center network and start your business journey
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <div className="p-6 bg-white border-b">
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
            <div className="p-4 bg-green-100 text-green-700 rounded mx-6 mt-4 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Application submitted successfully! Redirecting...
            </div>
          )}

          {errors.length > 0 && (
            <div className="p-4 bg-red-100 text-red-700 rounded mx-6 mt-4">
              <ul className="list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-0"
            encType="multipart/form-data"
          >
            {/* Center Information Section */}
            <div className="p-6 bg-orange-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  1
                </span>
                Center Information
              </h3>

              <div className="space-y-4">
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    placeholder="Enter email address"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>

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
                    placeholder="Enter PAN number"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    required
                    placeholder="+977 98XXXXXXXX"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter Nepal mobile number
                  </p>
                </div>

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
                      className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(
                              passwordStrength
                            )}`}
                            style={{
                              width: `${(passwordStrength / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            passwordStrength <= 2
                              ? "text-red-500"
                              : passwordStrength <= 3
                              ? "text-yellow-500"
                              : "text-green-500"
                          }`}
                        >
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            formData.password.length >= 8
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          8+ characters
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[a-z]/.test(formData.password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          Lowercase letter
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[A-Z]/.test(formData.password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          Uppercase letter
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[0-9]/.test(formData.password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          Number
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            /[^a-zA-Z0-9]/.test(formData.password)
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          Special character
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Province *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) =>
                      handleInputChange("province", e.target.value)
                    }
                    required
                    disabled={loadingStates.provinces}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingStates.provinces
                        ? "Loading provinces..."
                        : "Select province"}
                    </option>
                    {provinces.map((province) => (
                      <option key={province.id} value={province.id}>
                        {province.displayName}
                      </option>
                    ))}
                  </select>
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white disabled:bg-gray-100"
                  >
                    <option value="">
                      {!formData.province
                        ? "Select province first"
                        : loadingStates.districts
                        ? "Loading districts..."
                        : "Select district"}
                    </option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Selection Section */}
            <div className="p-6 bg-purple-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  2
                </span>
                Center Categories
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Categories *
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select the categories that best describe your center's
                    products/services
                  </p>

                  {loadingCategories ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                      <span className="ml-2 text-gray-600">
                        Loading categories...
                      </span>
                    </div>
                  ) : categories.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No categories available
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {categories.map((category) => (
                        <div
                          key={category}
                          onClick={() => handleCategoryChange(category)}
                          className={`p-3 border rounded cursor-pointer transition-all ${
                            formData.categories.includes(category)
                              ? "border-purple-500 bg-purple-100"
                              : "border-gray-300 hover:border-purple-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full border mr-2 flex items-center justify-center ${
                                formData.categories.includes(category)
                                  ? "bg-purple-500 border-purple-500"
                                  : "border-gray-400"
                              }`}
                            >
                              {formData.categories.includes(category) && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="text-sm">{category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.categories.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700 mb-2">
                        Selected categories:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.categories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCategoryChange(category);
                              }}
                              className="ml-2 text-purple-600 hover:text-purple-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="p-6 bg-yellow-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  3
                </span>
                Contact Information
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Contact Person 1 *
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">
                        Name *
                      </label>
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
                        placeholder="Contact person name"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">
                        Phone *
                      </label>
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
                        placeholder="+977 98XXXXXXXX"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Contact Person 2 (Optional)
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">
                        Name
                      </label>
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
                        placeholder="Contact person name (optional)"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">
                        Phone
                      </label>
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
                        placeholder="+977 98XXXXXXXX"
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className="p-6 bg-green-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  4
                </span>
                बैंक विवरण (Bank Details)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    बैंक छान्नुहोस् (Select Bank) *
                  </label>
                  <select
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleBankChange(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  >
                    <option value="">बैंक छान्नुहोस् (Select Bank)</option>
                    {nepaliBanks.map((bank) => (
                      <option key={bank.id} value={bank.name}>
                        {bank.name} ({bank.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    खाता नम्बर (Account Number) *
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
                    placeholder="खाता नम्बर प्रविष्ट गर्नुहोस्"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    शाखा (Branch) *
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
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white disabled:bg-gray-100"
                  >
                    <option value="">
                      {!formData.bankDetails.bankName
                        ? "पहिले बैंक छान्नुहोस्"
                        : "शाखा छान्नुहोस्"}
                    </option>
                    {availableBranches.map((branch, index) => (
                      <option key={index} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    खाताधारकको नाम (Account Holder Name) *
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
                    placeholder="खाताधारकको पूरा नाम"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="p-6 bg-pink-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                  5
                </span>
                Documents
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Upload Documents (PAN Card, Business Registration, etc.) *
                  </label>

                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                      <p className="font-medium mb-1">Required Documents:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>PAN Card (Personal or Business)</li>
                        <li>Business Registration Certificate</li>
                        <li>Citizenship Certificate</li>
                        <li>Bank Account Details</li>
                      </ul>
                      <p className="mt-2 text-xs">
                        <strong>File Requirements:</strong> PDF or Image files
                        only, Maximum 10MB per file
                      </p>
                    </div>

                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver
                          ? "border-pink-400 bg-pink-50"
                          : "border-gray-300 hover:border-pink-400 hover:bg-pink-50"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        PDF, PNG, JPG up to 10MB
                      </p>
                      <input
                        type="file"
                        id="panDocument"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                        required
                        className="hidden"
                      />
                      <label
                        htmlFor="panDocument"
                        className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 cursor-pointer transition-colors"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </label>
                    </div>

                    {panDocument && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(panDocument.type)}
                            <div>
                              <p className="font-medium text-gray-900">
                                {panDocument.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatFileSize(panDocument.size)} •{" "}
                                {panDocument.type.split("/")[1].toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-6 bg-white">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={onShowLogin}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || submitState === "submitting"}
                  className="px-8 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[140px]"
                >
                  {submitState === "submitting" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          </form>

          <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
            © 2024 Center Request System. All rights reserved.
          </div>
        </Card>
      </div>
    </div>
  );
}
