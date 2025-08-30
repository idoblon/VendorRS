import React, { useState } from "react";
import { Button } from "../ui/Button";
import axiosInstance from "../../utils/axios";

interface CenterCreateFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const CenterCreateForm: React.FC<CenterCreateFormProps> = ({ onClose, onCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    panNumber: "",
    province: "",
    district: "",
    categories: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.panNumber ||
      !formData.province ||
      !formData.district ||
      !formData.categories
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const categoriesArray = formData.categories.split(",").map((cat) => cat.trim()).filter(Boolean);

    if (categoriesArray.length === 0) {
      setError("Please provide at least one category.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/users/centers", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        businessName: formData.businessName || formData.name,
        panNumber: formData.panNumber,
        province: formData.province,
        district: formData.district,
        categories: categoriesArray,
        address: formData.address,
      });

      if (response.data.success) {
        alert("Center created successfully.");
        onCreated();
        onClose();
      } else {
        setError(response.data.message || "Failed to create center.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create center.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Center</h2>

        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1" htmlFor="name">
              Center Name <span className="text-red-600">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="email">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="password">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="phone">
              Phone <span className="text-red-600">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="businessName">
              Business Name
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="panNumber">
              PAN Number <span className="text-red-600">*</span>
            </label>
            <input
              id="panNumber"
              name="panNumber"
              type="text"
              value={formData.panNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="province">
              Province <span className="text-red-600">*</span>
            </label>
            <input
              id="province"
              name="province"
              type="text"
              value={formData.province}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="district">
              District <span className="text-red-600">*</span>
            </label>
            <input
              id="district"
              name="district"
              type="text"
              value={formData.district}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="categories">
              Categories (comma separated) <span className="text-red-600">*</span>
            </label>
            <input
              id="categories"
              name="categories"
              type="text"
              value={formData.categories}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. Food, Electronics"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1" htmlFor="address">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Center"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CenterCreateForm;
