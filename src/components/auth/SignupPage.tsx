import React, { useState } from 'react';
import { UserPlus, ArrowLeft, Upload, X } from 'lucide-react';
import { VendorStatus } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SignupPageProps {
  onShowLogin: () => void;
  onSignupSuccess: () => void;
}

interface SignupFormData {
  vendorName: string;
  panNumber: string;
  email: string;
  phoneNumber: string;
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
    vendorName: '',
    panNumber: '',
    email: '',
    phoneNumber: '',
    contactPerson1: {
      name: '',
      phone: '',
    },
    contactPerson2: {
      name: '',
      phone: '',
    },
    district: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      branch: '',
      holderName: '',
    },
    images: [],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof SignupFormData] as any,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to submit vendor application
    setTimeout(() => {
      console.log('Vendor application submitted:', formData);
      setIsLoading(false);
      onSignupSuccess();
    }, 2000);
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
                console.log('Logo failed to load');
                e.currentTarget.style.display = 'none';
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
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
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
                    onChange={(e) => handleInputChange('panNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="ABCDE1234F"
                    pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="vendor@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                    placeholder="+91 9876543210"
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
                    onChange={(e) => handleInputChange('district', e.target.value)}
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
                  <h4 className="text-md font-medium text-gray-800 mb-4 text-center bg-white/50 py-2 rounded">Contact Person 1 *</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson1.name}
                        onChange={(e) => handleNestedInputChange('contactPerson1', 'name', e.target.value)}
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
                        onChange={(e) => handleNestedInputChange('contactPerson1', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="+91 9876543210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person 2 */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-4 text-center bg-white/50 py-2 rounded">Contact Person 2 (Optional)</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson2.name}
                        onChange={(e) => handleNestedInputChange('contactPerson2', 'name', e.target.value)}
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
                        onChange={(e) => handleNestedInputChange('contactPerson2', 'phone', e.target.value)}
                        className="w-full px-4 py-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-6 flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                Bank Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'bankName', e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    placeholder="HDFC Bank"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'accountNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    placeholder="1234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'branch', e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    placeholder="Main Branch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.holderName}
                    onChange={(e) => handleNestedInputChange('bankDetails', 'holderName', e.target.value)}
                    className="w-full px-4 py-3 border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 bg-white transition-all"
                    placeholder="Account holder name"
                    required
                  />
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
                  Upload Documents (PAN Card, GST Certificate, etc.)
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
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                    <div className="space-y-2">
                      {formData.images.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-orange-200">
                          <span className="text-sm text-gray-600">{file.name}</span>
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
              <h4 className="font-medium text-yellow-800 mb-2">Application Process</h4>
              <p className="text-sm text-yellow-700">
                Your application will be submitted to the admin for review. You will receive an email notification 
                once your application is approved or if additional information is required.
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