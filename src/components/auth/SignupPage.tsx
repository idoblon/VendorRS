import React, { useState } from "react";
import { UserPlus, ArrowLeft, Upload, X } from "lucide-react";
import { VendorStatus } from "../../types";
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
  contactPerson1: {
    name: string;
    phone: string;
  };
  contactPerson2: {
    name: string;
    phone: string;
  };
  district: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    branch: string;
    holderName: string;
  };
  images: File[];
}

export function SignupPage({ onShowLogin, onSignupSuccess }: SignupPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    vendorName: "",
    panNumber: "",
    email: "",
    phoneNumber: "",
    password: "",
    contactPerson1: {
      name: "",
      phone: "",
    },
    contactPerson2: {
      name: "",
      phone: "",
    },
    district: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      branch: "",
      holderName: "",
    },
    images: [],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof SignupFormData] as any),
        [field]: value,
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Validation functions for server-side validation
  const validateAccountNumber = (accountNumber: string): boolean => {
    // Check if account number contains only digits
    if (!/^\d+$/.test(accountNumber)) {
      return false;
    }

    // Check if account number length is between 10 and 20 digits
    if (accountNumber.length < 10 || accountNumber.length > 20) {
      return false;
    }

    return true;
  };

  const validateAccountHolderName = (holderName: string): boolean => {
    // Check if account holder name contains only English or Nepali characters and spaces
    // \u0900-\u097F is the Unicode range for Nepali characters (Devanagari script)
    return /^[a-zA-Z\u0900-\u097F\s]+$/.test(holderName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Perform server-side validation before submission
    const isAccountNumberValid = validateAccountNumber(
      formData.bankDetails.accountNumber
    );
    const isAccountHolderNameValid = validateAccountHolderName(
      formData.bankDetails.holderName
    );

    if (!isAccountNumberValid || !isAccountHolderNameValid) {
      // Handle validation errors
      setIsLoading(false);
      alert(
        "Please check your bank details. Account number must be 10-20 digits, and account holder name must contain only valid characters."
      );
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      setIsLoading(false);
      alert("Password must be at least 6 characters long.");
      return;
    }

    // Check if password contains at least one uppercase letter, one lowercase letter, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      setIsLoading(false);
      alert(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    // Make actual API call to submit vendor application
    try {
      // Format phone number with country code for backend validation
      const formattedPhone = formData.phoneNumber.startsWith("+977")
        ? formData.phoneNumber
        : `+977${formData.phoneNumber}`;

      // Prepare data for API call
      const apiData = {
        name: formData.vendorName,
        email: formData.email,
        password: formData.password,
        phone: formattedPhone,
        role: "VENDOR",
        businessName: formData.vendorName,
        panNumber: formData.panNumber,
        address: formData.district, // Using district as address for simplicity
        district: formData.district,
        bankDetails: formData.bankDetails,
        contactPersons: [
          formData.contactPerson1,
          formData.contactPerson2,
        ].filter((person) => person.name && person.phone), // Only include filled contact persons
      };

      console.log("Submitting vendor application:", apiData);

      // Make the actual API call
      const response = await axiosInstance.post("/api/auth/register", apiData);

      console.log("Vendor application response:", response.data);
      setIsLoading(false);

      if (response.data.success) {
        // Show success message before redirecting
        alert("Application submitted successfully! Your application has been sent to the admin for verification.");
        // Redirect to success page
        onSignupSuccess();
      } else {
        alert(
          response.data.message ||
            "Failed to submit application. Please try again."
        );
      }
    } catch (error: any) {
      console.error("Error submitting vendor application:", error);
      setIsLoading(false);

      // Display detailed validation errors if available
      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        const errorMessages = error.response.data.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join("\n");
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        alert(
          error.response?.data?.message ||
            "An error occurred while submitting your application. Please try again."
        );
      }
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
                console.log("Logo failed to load");
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
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Basic Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) =>
                      handleInputChange("vendorName", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="Enter vendor/business name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PAN Number *
                  </label>
                  <input
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => {
                      // Allow only numbers (0-9)
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      handleInputChange("panNumber", value);
                    }}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="123456789"
                    pattern="[0-9]{9}"
                    inputMode="numeric"
                    maxLength={9}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter 9-digit Nepal PAN number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="vendor@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-orange-200 rounded-l-lg">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        // Remove non-digits and limit to 10 digits
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        handleInputChange("phoneNumber", value);
                      }}
                      className="w-full px-4 py-3 border border-orange-200 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      inputMode="numeric"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter a 10-digit Nepali mobile number
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange("district", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="Enter district"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-red-50 to-yellow-50 p-6 rounded-lg border border-red-200">
              <h3 className="text-lg font-semibold text-red-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                Contact Information
              </h3>

              <div className="space-y-6">
                {/* Contact Person 1 */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4 text-center bg-white/50 py-2 rounded">
                    Contact Person 1 *
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="Contact person name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="+977 9876543210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person 2 */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4 text-center bg-white/50 py-2 rounded">
                    Contact Person 2 (Optional)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="Contact person name (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="+977 9876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details - Nepali Format */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                बैंक विवरण (Bank Details)
              </h3>

              <div className="space-y-4">
                {/* Bank Name (Nepali Banks) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    बैंकको नाम (Bank Name) *
                  </label>
                  <select
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "bankName",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    required
                  >
                    <option value="">
                      -- बैंक छान्नुहोस् (Select Bank) --
                    </option>
                    <option value="Nepal Rastra Bank">
                      नेपाल राष्ट्र बैंक (Nepal Rastra Bank)
                    </option>
                    <option value="NIC Asia Bank">
                      एनआइसी एशिया बैंक (NIC Asia Bank)
                    </option>
                    <option value="NMB Bank">एनएमबी बैंक (NMB Bank)</option>
                    <option value="Global IME Bank">
                      ग्लोबल आइएमई बैंक (Global IME Bank)
                    </option>
                    <option value="Prabhu Bank">
                      प्रभु बैंक (Prabhu Bank)
                    </option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>

                {/* Account Number (Nepali Format) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    खाता नम्बर (Account Number) *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // Allow only digits
                      handleNestedInputChange(
                        "bankDetails",
                        "accountNumber",
                        value.slice(0, 20)
                      ); // Max 20 digits
                    }}
                    className={`w-full px-4 py-3 border ${
                      formData.bankDetails.accountNumber &&
                      !validateAccountNumber(formData.bankDetails.accountNumber)
                        ? "border-red-500"
                        : "border-yellow-200"
                    } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all`}
                    placeholder="जस्तै: १३०१५००००२०"
                    pattern="[0-9]{10,20}"
                    inputMode="numeric"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    (१०-२० अंक हुनुपर्छ)
                  </p>
                  {formData.bankDetails.accountNumber &&
                    !validateAccountNumber(
                      formData.bankDetails.accountNumber
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        खाता नम्बर १०-२० अंकको हुनुपर्छ र केवल अंक मात्र
                        हुनुपर्छ
                      </p>
                    )}
                </div>

                {/* Branch (With Common Nepali Branches) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    शाखा (Branch) *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      handleNestedInputChange(
                        "bankDetails",
                        "branch",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    placeholder="जस्तै: काठमाडौं शाखा"
                    required
                  />
                </div>

                {/* Account Holder Name (Nepali/English) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    खाताधारीको नाम (Account Holder Name) *
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
                    className={`w-full px-4 py-3 border ${
                      formData.bankDetails.holderName &&
                      !validateAccountHolderName(
                        formData.bankDetails.holderName
                      )
                        ? "border-red-500"
                        : "border-yellow-200"
                    } rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all`}
                    placeholder="जस्तै: राम बहादुर श्रेष्ठ"
                    pattern="[a-zA-Z\u0900-\u097F\s]+" // Allows English/Nepali characters
                    required
                  />
                  {formData.bankDetails.holderName &&
                    !validateAccountHolderName(
                      formData.bankDetails.holderName
                    ) && (
                      <p className="text-xs text-red-500 mt-1">
                        खाताधारीको नाममा अंग्रेजी वा नेपाली अक्षर र खाली स्थान
                        मात्र हुनुपर्छ
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                Documents
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Documents (PAN Card, Business Registration, etc.)
                </label>
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center bg-white/50 hover:bg-white/70 transition-all">
                  <Upload className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-orange-600 hover:text-orange-500 font-medium"
                  >
                    Choose files
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Uploaded Files:
                    </h4>
                    <div className="space-y-2">
                      {formData.images.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-3 rounded border border-orange-200"
                        >
                          <span className="text-sm text-gray-600">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">
                Application Process
              </h4>
              <p className="text-sm text-yellow-700">
                Your application will be submitted to the admin for review. You
                will receive an email notification once your application is
                approved or if additional information is required.
              </p>
            </div>

            {/* Submit Button at the bottom */}
            <div className="flex justify-center space-x-4 pt-6 border-t border-orange-200">
              <Button
                type="button"
                variant="outline"
                onClick={onShowLogin}
                className="px-8 border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                icon={UserPlus}
                className="px-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
              > 
                Submit Application
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Vendor Request System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
