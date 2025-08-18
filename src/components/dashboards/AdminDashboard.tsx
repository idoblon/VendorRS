"use client"

import { useState, useEffect } from "react"
import { Users, Building, BarChart3, Search, Eye, FileText, Plus, X } from "lucide-react"
import { DashboardLayout } from "./../layout/DashboardLayout"
import { Card } from "./../ui/Card"
import { Button } from "./../ui/Button"
import { type User, type Vendor, VendorStatus, type Document } from "../../types/index"
import { ApplicationsComponent } from "./ApplicationsComponent"
import { getCategories, createCategory, deleteCategory } from "../../utils/categoryApi"
import axiosInstance from "../../utils/axios"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

interface DistributionCenter {
  id: string
  name: string
  location: string
  address: string
  contactPerson: string
  email: string
  phone: string
  status: "active" | "inactive" | "maintenance"
  capacity: number
  currentOrders: number
  establishedDate: string
  region: string
  documents?: Document[];
}

interface CenterFormData {
  name: string
  code: string
  address: string
  capacity: string
  status: string
  manager: string
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0)

  const [centerForm, setCenterForm] = useState<CenterFormData>({
    name: "",
    code: "",
    address: "",
    capacity: "",
    status: "active",
    manager: "",
  })

  const [centers, setCenters] = useState<DistributionCenter[]>([
    {
      id: "1",
      name: "Downtown Hub",
      location: "New York, NY",
      address: "123 Main St, New York, NY 10001",
      contactPerson: "John Smith",
      email: "john@downtown.com",
      phone: "+1-555-0123",
      status: "active",
      capacity: 15000,
      currentOrders: 245,
      establishedDate: "2020-01-15",
      region: "Northeast",
    },
    {
      id: "2",
      name: "West Coast Center",
      location: "Los Angeles, CA",
      address: "456 Pacific Ave, Los Angeles, CA 90210",
      contactPerson: "Sarah Johnson",
      email: "sarah@westcoast.com",
      phone: "+1-555-0456",
      status: "active",
      capacity: 20000,
      currentOrders: 189,
      establishedDate: "2019-06-20",
      region: "West",
    },
    {
      id: "3",
      name: "Central Distribution",
      location: "Chicago, IL",
      address: "789 Industrial Blvd, Chicago, IL 60601",
      contactPerson: "Mike Davis",
      email: "mike@central.com",
      phone: "+1-555-0789",
      status: "maintenance",
      capacity: 18000,
      currentOrders: 0,
      establishedDate: "2021-03-10",
      region: "Central",
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [showCenterModal, setShowCenterModal] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<DistributionCenter | null>(null)

  const handleCenterFormChange = (field: keyof CenterFormData, value: string) => {
    setCenterForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCenterFormSubmit = () => {
    // Validate form
    if (!centerForm.name || !centerForm.code || !centerForm.address) {
      console.log("Please fill in all required fields")
      return
    }

    // Create new center
    const newCenter: DistributionCenter = {
      id: Date.now().toString(),
      name: centerForm.name,
      location: centerForm.address.split(",")[0] || centerForm.address,
      address: centerForm.address,
      contactPerson: centerForm.manager,
      email: `${centerForm.code.toLowerCase()}@company.com`,
      phone: "+1-555-0000",
      status: centerForm.status as "active" | "inactive" | "maintenance",
      capacity: Number.parseInt(centerForm.capacity) || 0,
      currentOrders: 0,
      establishedDate: new Date().toISOString().split("T")[0],
      region: "New",
    }

    setCenters((prev) => [...prev, newCenter])

    // Reset form
    setCenterForm({
      name: "",
      code: "",
      address: "",
      capacity: "",
      status: "active",
      manager: "",
    })

    console.log("Center created successfully")
  }

  // Fetch vendors from the backend
  const fetchVendors = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get("/api/users/vendors")
      if (response.data.success) {
        // Map the vendor data to match the Vendor interface
        const mappedVendors = response.data.data.vendors.map((vendor: any) => ({
          ...vendor,
          id: vendor._id,
        }))
        setVendors(mappedVendors)
      } else {
        setError(response.data.message || "Failed to fetch vendors")
      }
    } catch (error: any) {
      console.error("Error fetching vendors:", error)
      setError(error.response?.data?.message || error.message || "An error occurred while fetching vendors")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch centers from the backend
  const fetchCenters = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get("/api/users/centers")
      if (response.data.success) {
        // Map the center data to match the DistributionCenter interface
        const mappedCenters = response.data.data.centerUsers.map((center: any) => ({
          ...center,
          id: center._id,
          location: center.district,
          contactPerson: center.name,
          capacity: 0, // This would need to be added to the backend model
          currentOrders: 0, // This would need to be added to the backend model
          establishedDate: center.createdAt ? new Date(center.createdAt).toISOString().split("T")[0] : "",
          region: center.province || ""
        }))
        setCenters(mappedCenters)
      } else {
        setError(response.data.message || "Failed to fetch centers")
      }
    } catch (error: any) {
      console.error("Error fetching centers:", error)
      setError(error.response?.data?.message || error.message || "An error occurred while fetching centers")
    } finally {
      setIsLoading(false)
    }
  }

  // Update vendor status
  const updateVendorStatus = async (
    vendorId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const response = await axiosInstance.put(`/api/users/vendors/${vendorId}/status`, {
        status,
        notes
      })
      
      if (response.data.success) {
        // Refresh the vendor list after successful action
        fetchVendors()
        return response.data
      } else {
        throw new Error(response.data.message || "Failed to update vendor status")
      }
    } catch (error: any) {
      console.error("Error updating vendor status:", error)
      throw error
    }
  }

  // Update center status
  const updateCenterStatus = async (
    centerId: string,
    status: string,
    notes?: string
  ) => {
    try {
      const response = await axiosInstance.put(`/api/users/centers/${centerId}/status`, {
        status,
        notes
      })
      
      if (response.data.success) {
        // Refresh the center list after successful action
        fetchCenters()
        return response.data
      } else {
        throw new Error(response.data.message || "Failed to update center status")
      }
    } catch (error: any) {
      console.error("Error updating center status:", error)
      throw error
    }
  }

  // Load vendors/centers when component mounts or when activeTab changes
  useEffect(() => {
    if (activeTab === "vendors" || activeTab === "dashboard") {
      fetchVendors()
    } else if (activeTab === "centers") {
      fetchCenters()
    }
  }, [activeTab])

  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject" | "suspend" | "reactivate",
    notes?: string,
  ) => {
    const statusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      suspend: "SUSPENDED",
      reactivate: "APPROVED",
    }

    const actionMessages = {
      approve: "Vendor approved successfully. A notification has been sent to the vendor.",
      reject: "Vendor application rejected. A notification has been sent to the vendor.",
      suspend: "Vendor account suspended. A notification has been sent to the vendor.",
      reactivate: "Vendor account reactivated. A notification has been sent to the vendor.",
    }

    try {
      console.log("Making vendor status update request:", {
        vendorId,
        action,
        status: statusMap[action],
        notes: notes || "",
      })

      // Make API call to update vendor status
      const response = await updateVendorStatus(vendorId, statusMap[action], notes)
      
      console.log(actionMessages[action])
      
      return response
    } catch (error: any) {
      console.error("Error updating vendor status:", error)
      throw error
    }
  }

  const handleCenterAction = (centerId: string, action: "activate" | "deactivate" | "maintenance" | "delete") => {
      const actionMessages = {
        activate: "Distribution center activated",
        deactivate: "Distribution center deactivated",
        maintenance: "Distribution center set to maintenance mode",
        delete: "Distribution center deleted",
      }
  
      console.log(actionMessages[action])
    }
  
    // Category management functions
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const data = await getCategories();
          setCategories(data);
          setCategoryError(null);
        } catch (err) {
          setCategoryError("Failed to fetch categories");
          console.error("Error fetching categories:", err);
        } finally {
          setLoading(false);
        }
      };
    
      const addCategory = async () => {
        if (!newCategory.trim()) return;
        
        try {
          setLoading(true);
          const data = await createCategory(newCategory.trim());
          setCategories([...categories, data]);
          setNewCategory("");
          setCategoryError(null);
        } catch (err) {
          setCategoryError("Failed to create category");
          console.error("Error creating category:", err);
        } finally {
          setLoading(false);
        }
      };
    
      const removeCategory = async (categoryToRemove: { _id: string, name: string }) => {
        try {
          setLoading(true);
          await deleteCategory(categoryToRemove._id);
          setCategories(categories.filter(cat => cat._id !== categoryToRemove._id));
          setCategoryError(null);
        } catch (err) {
          setCategoryError("Failed to delete category");
          console.error("Error deleting category:", err);
        } finally {
          setLoading(false);
        }
      };
    
      // Load categories when component mounts or when activeTab changes to categories
      useEffect(() => {
        if (activeTab === "categories") {
          fetchCategories();
        }
      }, [activeTab]);

  // Fetch pending applications count
  useEffect(() => {
    const fetchPendingApplicationsCount = async () => {
      try {
        // Fetch pending vendors
        const vendorResponse = await axiosInstance.get("/api/users/vendors", {
          params: { status: "PENDING" }
        });
        
        // Fetch pending centers
        const centerResponse = await axiosInstance.get("/api/users/centers", {
          params: { status: "PENDING" }
        });
        
        // Calculate total pending applications
        const vendorCount = vendorResponse.data.data?.pagination?.total || 0;
        const centerCount = centerResponse.data.data?.pagination?.total || 0;
        const totalCount = vendorCount + centerCount;
        
        setPendingApplicationsCount(totalCount);
      } catch (error) {
        console.error("Error fetching pending applications count:", error);
      }
    };
    
    fetchPendingApplicationsCount();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Vendors</p>
                    <p className="text-2xl font-bold text-slate-900">1,234</p>
                    <p className="text-xs text-green-600">+12% from last month</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Active Centers</p>
                    <p className="text-2xl font-bold text-slate-900">56</p>
                    <p className="text-xs text-green-600">+3 new this week</p>
                  </div>
                </div>
              </Card>
              <Card
                className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveTab("applications")}
              >
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Pending Applications</p>
                    <p className="text-2xl font-bold text-slate-900">{pendingApplicationsCount}</p>
                    <p className="text-xs text-orange-600">
                      {pendingApplicationsCount === 1 ? "Requires attention" : pendingApplicationsCount > 1 ? "Require attention" : "No pending applications"}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-slate-900">$45.2K</p>
                    <p className="text-xs text-green-600">+8% growth</p>
                  </div>
                </div>
              </Card>
            </div>


          </div>
        )

      case "centers":
        return (
          <div className="space-y-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Centers</h1>
              <p className="text-green-100 mt-2">Manage your centers and locations</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full"
                  />
                  {searchTerm.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {centers
                        .filter(center => 
                          center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          center.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          center.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(center => (
                          <div 
                            key={center.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSearchTerm(center.name);
                              // Additional action if needed when a center is selected
                            }}
                          >
                            <div className="font-medium">{center.name}</div>
                            <div className="text-sm text-gray-600">{center.location}</div>
                          </div>
                        ))
                      }
                      {centers.filter(center => 
                        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        center.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        center.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-gray-500">No centers found</div>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">All Centers</h2>
              </div>
              <div className="space-y-4">
                {centers.map((center) => (
                  <Card
                    key={center.id}
                    className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-green-200 p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{center.name}</h3>
                          <p className="text-sm text-slate-600 flex items-center mt-1">
                            <Building className="h-4 w-4 mr-1" />
                            {center.location}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Manager:</span>
                            <p className="font-medium text-slate-900">{center.contactPerson}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Capacity:</span>
                            <p className="font-medium text-slate-900">{center.capacity.toLocaleString()} sq ft</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Current Orders:</span>
                            <p className="font-medium text-slate-900">{center.currentOrders}</p>
                          </div>
                          <div>
                            <span className="text-slate-500">Status:</span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                center.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : center.status === "inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {center.status.charAt(0).toUpperCase() + center.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCenterModal(center)}
                          className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )

      case "vendors":
        return (
          <div className="space-y-6 bg-gradient-to-br from-amber-50/30 to-orange-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Vendor Management</h1>
              <p className="text-amber-100 mt-2">Review and manage vendor applications and accounts</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full"
                  />
                  {searchTerm.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {vendors
                        .filter(vendor => 
                          vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(vendor => (
                          <div 
                            key={vendor.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setSearchTerm(vendor.businessName || vendor.name);
                              // Additional action if needed when a vendor is selected
                            }}
                          >
                            <div className="font-medium">{vendor.businessName}</div>
                            <div className="text-sm text-gray-600">{vendor.name}</div>
                          </div>
                        ))
                      }
                      {vendors.filter(vendor => 
                        vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className="p-2 text-gray-500">No vendors found</div>
                      )}
                    </div>
                  )}
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {/* All Vendors Section */}
            <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">All Vendors</h2>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading vendors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : vendors
                    .filter((v) => filterStatus === "all" || v.status === filterStatus)
                    .filter(
                      (v) =>
                        v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.email.toLowerCase().includes(searchTerm.toLowerCase()),
                    ).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No vendors found</p>
                  </div>
                ) : (
                  vendors
                    .filter((v) => filterStatus === "all" || v.status === filterStatus)
                    .filter(
                      (v) =>
                        v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        v.email.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((vendor) => (
                      <Card
                        key={vendor.id}
                        className={`hover:shadow-xl transition-all duration-300 p-4 ${
                          vendor.status === VendorStatus.APPROVED
                            ? "bg-gradient-to-br from-white to-green-50/50 border-green-200"
                            : vendor.status === VendorStatus.REJECTED
                              ? "bg-gradient-to-br from-white to-red-50/50 border-red-200"
                              : vendor.status === VendorStatus.SUSPENDED
                                ? "bg-gradient-to-br from-white to-gray-50/50 border-gray-200"
                                : "bg-gradient-to-br from-white to-amber-50/50 border-amber-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">{vendor.businessName}</h3>
                                <p className="text-sm text-slate-600 flex items-center mt-1">
                                  <Building className="h-4 w-4 mr-1" />
                                  {vendor.name}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  vendor.status === VendorStatus.APPROVED
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : vendor.status === VendorStatus.PENDING
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : vendor.status === VendorStatus.SUSPENDED
                                        ? "bg-gray-100 text-gray-800 border border-gray-200"
                                        : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {vendor.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">Contact Information</p>
                                <p className="font-medium text-slate-900">{vendor.email}</p>
                                <p className="font-medium text-slate-900">{vendor.phone}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Business Details</p>
                                <p className="font-medium text-slate-900">PAN: {vendor.panNumber}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-slate-500">Address</p>
                              <p className="font-medium text-slate-900">{vendor.address}</p>
                            </div>

                            <div>
                              <p className="text-slate-500">Joined Date</p>
                              <p className="font-medium text-slate-900">
                                {new Date(vendor.joinedDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openVendorModal(vendor)}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </Card>
          </div>
        )

      case "categories":
              return (
                <div className="space-y-6 bg-gradient-to-br from-purple-50/30 to-indigo-50/30 min-h-screen -m-6 p-6">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
                    <h1 className="text-3xl font-bold">Category Management</h1>
                    <p className="text-purple-100 mt-2">Manage product categories for the platform</p>
                  </div>
      
                  <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200 shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-slate-900">Add New Category</h2>
                      <Button
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {showCategoryForm ? "Cancel" : "Add Category"}
                      </Button>
                    </div>
      
                    {showCategoryForm && (
                      <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter new category name"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                          />
                          <Button
                            onClick={addCategory}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    )}
      
                    <div>
                      <h3 className="text-md font-semibold text-slate-900 mb-4">Existing Categories</h3>
                                      {loading ? (
                                        <p className="text-gray-500">Loading categories...</p>
                                      ) : categoryError ? (
                                        <p className="text-red-500">{categoryError}</p>
                                      ) : categories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {categories.map((category) => (
                                            <div
                                              key={category._id}
                                              className="flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full"
                                            >
                                              <span>{category.name}</span>
                                              <button
                                                onClick={() => removeCategory(category)}
                                                className="ml-2 text-purple-600 hover:text-purple-900"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-gray-500">No categories found</p>
                                      )}
                    </div>
                  </Card>
                </div>
              )
      
            case "applications":
              return <ApplicationsComponent />

      // Default case for other tabs
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Select a section from the sidebar</p>
          </div>
        )
    }
  }

  // Function to open vendor detail modal
  const openVendorModal = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setActionNotes("")
    setShowVendorModal(true)
  }

  // Function to close vendor detail modal
  const closeVendorModal = () => {
    setShowVendorModal(false)
    setSelectedVendor(null)
    setActionNotes("")
  }

  // Function to open center detail modal
  const openCenterModal = (center: DistributionCenter) => {
    setSelectedCenter(center)
    setShowCenterModal(true)
  }

  // Function to close center detail modal
  const closeCenterModal = () => {
    setShowCenterModal(false)
    setSelectedCenter(null)
  }

  // Function to handle vendor action with notes
  const handleVendorActionWithNotes = async (action: "approve" | "reject" | "suspend" | "reactivate") => {
    if (selectedVendor) {
      try {
        await handleVendorAction(selectedVendor._id, action, actionNotes)
        closeVendorModal()
        
        // Show success message based on action
        const actionMessages = {
          approve: "Vendor approved successfully. A notification has been sent to the vendor.",
          reject: "Vendor application rejected. A notification has been sent to the vendor.",
          suspend: "Vendor account suspended. A notification has been sent to the vendor.",
          reactivate: "Vendor account reactivated. A notification has been sent to the vendor.",
        }
        
        console.log(actionMessages[action])
      } catch (error: any) {
        console.error("Error updating vendor status:", error)
        console.log(error.response?.data?.message || error.message || "An error occurred while updating vendor status")
      }
    }
  }

  // Function to handle center action with notes
  const handleCenterActionWithNotes = async (action: "approve" | "reject" | "suspend" | "reactivate") => {
    if (selectedCenter) {
      try {
        // Map the action to a status
        const statusMap = {
          approve: "APPROVED",
          reject: "REJECTED",
          suspend: "SUSPENDED",
          reactivate: "APPROVED",
        }
        
        await updateCenterStatus(selectedCenter.id, statusMap[action], actionNotes)
        closeCenterModal()
        
        // Show success message based on action
        const actionMessages = {
          approve: "Center approved successfully. A notification has been sent to the center.",
          reject: "Center application rejected. A notification has been sent to the center.",
          suspend: "Center account suspended. A notification has been sent to the center.",
          reactivate: "Center account reactivated. A notification has been sent to the center.",
        }
        
        console.log(actionMessages[action])
      } catch (error: any) {
        console.error("Error updating center status:", error)
        console.log(error.response?.data?.message || error.message || "An error occurred while updating center status")
      }
    }
  }

  return (
    <DashboardLayout activeSection={activeTab} onSectionChange={setActiveTab}>
      {renderContent()}

      {/* Center Modal */}
      {showCenterModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">{selectedCenter.name}</h3>
                <button onClick={closeCenterModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Center Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          selectedCenter.status === "active"
                            ? "bg-green-100 text-green-800"
                            : selectedCenter.status === "inactive"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedCenter.status.charAt(0).toUpperCase() + selectedCenter.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Established Date</p>
                      <p className="font-medium text-slate-900">{selectedCenter.establishedDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Region</p>
                      <p className="font-medium text-slate-900">{selectedCenter.region}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Manager</p>
                      <p className="font-medium text-slate-900">{selectedCenter.contactPerson}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedCenter.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedCenter.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-900">{selectedCenter.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Operational Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Capacity</p>
                    <p className="font-medium text-slate-900">{selectedCenter.capacity.toLocaleString()} sq ft</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Current Orders</p>
                    <p className="font-medium text-slate-900">{selectedCenter.currentOrders}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Utilization</p>
                    <p className="font-medium text-slate-900">
                      {Math.round((selectedCenter.currentOrders / selectedCenter.capacity) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
              
              
              {/* Document Viewer Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedCenter.documents ? (
                    selectedCenter.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{doc.name || `Document ${index + 1}`}</p>
                            <p className="text-xs text-slate-500">{doc.type || 'PDF Document'}</p>
                          </div>
                          <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">No documents uploaded</p>
                      <p className="text-sm text-gray-400 mt-1">Documents will appear here once uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">Vendor Application Details</h3>
                <button onClick={closeVendorModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Business Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Business Name</p>
                      <p className="font-medium text-slate-900">{selectedVendor.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Owner/Manager</p>
                      <p className="font-medium text-slate-900">{selectedVendor.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full inline-block ${
                          selectedVendor.status === VendorStatus.APPROVED
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : selectedVendor.status === VendorStatus.PENDING
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : selectedVendor.status === VendorStatus.SUSPENDED
                                ? "bg-gray-100 text-gray-800 border border-gray-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {selectedVendor.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Application Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedVendor.joinedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedVendor.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedVendor.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-900">{selectedVendor.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">District</p>
                      <p className="font-medium text-slate-900">{selectedVendor.district}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Business Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">PAN Number</p>
                      <p className="font-medium text-slate-900">{selectedVendor.panNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Bank Details</h4>
                  <div className="space-y-3">
                    {selectedVendor.bankDetails ? (
                      <>
                        <div>
                          <p className="text-sm text-slate-500">Bank Name</p>
                          <p className="font-medium text-slate-900">{selectedVendor.bankDetails.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Account Number</p>
                          <p className="font-medium text-slate-900">{selectedVendor.bankDetails.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Account Holder</p>
                          <p className="font-medium text-slate-900">{selectedVendor.bankDetails.holderName}</p>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500">No bank details provided</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedVendor.status === VendorStatus.PENDING && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Application Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Application Status</p>
                      <p className="font-medium text-slate-900">Pending Review</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedVendor.status === VendorStatus.APPROVED && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Account Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Account Status</p>
                      <p className="font-medium text-slate-900">Approved</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedVendor.status === VendorStatus.SUSPENDED && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Account Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">Account Status</p>
                      <p className="font-medium text-slate-900">Suspended</p>
                    </div>
                  </div>
                </div>
              )}
              
              
              {/* Document Viewer Section */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVendor.documents ? (
                    selectedVendor.documents.map((doc, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-900 text-sm">{doc.name || `Document ${index + 1}`}</p>
                            <p className="text-xs text-slate-500">{doc.type || 'PDF Document'}</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            View
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500">No documents uploaded</p>
                      <p className="text-sm text-gray-400 mt-1">Documents will appear here once uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
