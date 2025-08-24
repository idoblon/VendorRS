"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building,
  BarChart3,
  Search,
  Eye,
  FileText,
  Plus,
  X,
} from "lucide-react";
import { DashboardLayout } from "./../layout/DashboardLayout";
import { Card } from "./../ui/Card";
import { Button } from "./../ui/Button";
import {
  type User,
  type Vendor,
  VendorStatus,
  type Document,
} from "../../types/index";
// Remove this import
// import { ApplicationsComponent } from "./ApplicationsComponent";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../utils/categoryApi";
import axiosInstance from "../../utils/axios";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface DistributionCenter {
  id: string;
  name: string;
  location: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "maintenance";
  capacity: number;
  currentOrders: number;
  establishedDate: string;
  region: string;
  documents?: Document[];
}

export default function AdminDashboard({
  user,
  onLogout,
}: AdminDashboardProps) {
  const [centers, setCenters] = useState<DistributionCenter[]>([
    {
      id: "1",
      name: "Kathmandu Distribution Center",
      location: "Kathmandu, Bagmati Province",
      address: "Industrial Area, Balaju-16, Kathmandu",
      contactPerson: "Ram Bahadur Sharma",
      email: "ram@ktm-center.com",
      phone: "+977-9801234567",
      status: "active",
      capacity: 15000,
      currentOrders: 245,
      establishedDate: "2018-03-15",
      region: "Central",
    },
    {
      id: "2",
      name: "Pokhara Distribution Center",
      location: "Pokhara, Gandaki Province",
      address: "Lakeside Road, Pokhara-33, Gandaki Province",
      contactPerson: "Sunita Shrestha",
      email: "sunita@pokhara-center.com",
      phone: "+977-9801234568",
      status: "active",
      capacity: 12000,
      currentOrders: 189,
      establishedDate: "2019-06-20",
      region: "Western",
    },
    {
      id: "3",
      name: "Biratnagar Distribution Center",
      location: "Biratnagar, Province 1",
      address: "Main Road, Biratnagar-56613, Province 1",
      contactPerson: "Prakash Gurung",
      email: "prakash@biratnagar-center.com",
      phone: "+977-9801234569",
      status: "maintenance",
      capacity: 10000,
      currentOrders: 0,
      establishedDate: "2021-03-10",
      region: "Eastern",
    },
    {
      id: "4",
      name: "Chitwan Distribution Center",
      location: "Bharatpur, Chitwan",
      address: "Narayanghat-Mugling Highway, Bharatpur-10",
      contactPerson: "Maya Tamang",
      email: "maya@chitwan-center.com",
      phone: "+977-9801234570",
      status: "active",
      capacity: 8000,
      currentOrders: 156,
      establishedDate: "2020-08-12",
      region: "Central",
    },
    {
      id: "5",
      name: "Dharan Distribution Center",
      location: "Dharan, Province 1",
      address: "BP Highway, Dharan-17, Sunsari",
      contactPerson: "Bikash Rai",
      email: "bikash@dharan-center.com",
      phone: "+977-9801234571",
      status: "active",
      capacity: 7500,
      currentOrders: 98,
      establishedDate: "2022-01-25",
      region: "Eastern",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      _id: "1",
      name: "Himalayan Handicrafts Pvt. Ltd.",
      email: "info@himalayanhandicrafts.com.np",
      phone: "+977-9841234567",
      address: "Thamel, Kathmandu-29, Nepal",
      businessType: "Handicrafts & Souvenirs",
      status: VendorStatus.APPROVED,
      commission: 15000,
      joinedDate: "2023-01-15",
      description: "Traditional Nepalese handicrafts and cultural items",
      documents: [],
    },
    {
      _id: "2",
      name: "Everest Organic Tea Company",
      email: "sales@everestorganictea.com",
      phone: "+977-9851234568",
      address: "Ilam Tea Garden, Ilam-56700, Nepal",
      businessType: "Organic Tea & Beverages",
      status: VendorStatus.APPROVED,
      commission: 22000,
      joinedDate: "2023-02-20",
      description: "Premium organic tea from the hills of Nepal",
      documents: [],
    },
    {
      _id: "3",
      name: "Kathmandu Spice Trading",
      email: "orders@ktmspice.com.np",
      phone: "+977-9861234569",
      address: "Asan Bazaar, Kathmandu-31, Nepal",
      businessType: "Spices & Food Products",
      status: VendorStatus.PENDING,
      commission: 8500,
      joinedDate: "2023-03-10",
      description: "Authentic Nepalese spices and food ingredients",
      documents: [],
    },
    {
      _id: "4",
      name: "Sherpa Adventure Gear",
      email: "gear@sherpaadventure.com.np",
      phone: "+977-9871234570",
      address: "Namche Bazaar, Solukhumbu-56000, Nepal",
      businessType: "Outdoor & Adventure Equipment",
      status: VendorStatus.APPROVED,
      commission: 35000,
      joinedDate: "2023-01-05",
      description: "High-quality mountaineering and trekking equipment",
      documents: [],
    },
    {
      _id: "5",
      name: "Pashmina Palace Nepal",
      email: "info@pashminapalace.com.np",
      phone: "+977-9881234571",
      address: "Durbar Marg, Kathmandu-44600, Nepal",
      businessType: "Textiles & Fashion",
      status: VendorStatus.APPROVED,
      commission: 18500,
      joinedDate: "2023-02-28",
      description: "Authentic Nepalese pashmina and traditional textiles",
      documents: [],
    },
    {
      _id: "6",
      name: "Annapurna Organic Farms",
      email: "harvest@annapurnaorganic.com.np",
      phone: "+977-9891234572",
      address: "Gorkha-34000, Gandaki Province, Nepal",
      businessType: "Organic Agriculture",
      status: VendorStatus.PENDING,
      commission: 12000,
      joinedDate: "2023-03-15",
      description: "Organic vegetables and fruits from Annapurna region",
      documents: [],
    },
    {
      _id: "7",
      name: "Bhaktapur Pottery Works",
      email: "pottery@bhaktapurworks.com.np",
      phone: "+977-9801234573",
      address: "Pottery Square, Bhaktapur-44800, Nepal",
      businessType: "Ceramics & Pottery",
      status: VendorStatus.APPROVED,
      commission: 9500,
      joinedDate: "2023-01-20",
      description: "Traditional Newari pottery and ceramic art",
      documents: [],
    },
    {
      _id: "8",
      name: "Mustang Yak Cheese Co.",
      email: "cheese@mustangyak.com.np",
      phone: "+977-9811234574",
      address: "Jomsom, Mustang-33100, Nepal",
      businessType: "Dairy Products",
      status: VendorStatus.REJECTED,
      commission: 0,
      joinedDate: "2023-02-10",
      description: "Traditional yak cheese and dairy products from Mustang",
      documents: [],
    },
    {
      _id: "9",
      name: "Lumbini Meditation Supplies",
      email: "peace@lumbinimeditation.com.np",
      phone: "+977-9821234575",
      address: "Lumbini-32900, Rupandehi, Nepal",
      businessType: "Spiritual & Wellness",
      status: VendorStatus.APPROVED,
      commission: 14000,
      joinedDate: "2023-03-01",
      description: "Meditation accessories and spiritual items",
      documents: [],
    },
    {
      _id: "10",
      name: "Chitwan Honey Collective",
      email: "sweet@chitwanhoney.com.np",
      phone: "+977-9831234576",
      address: "Sauraha, Chitwan-44200, Nepal",
      businessType: "Natural Products",
      status: VendorStatus.PENDING,
      commission: 7500,
      joinedDate: "2023-03-20",
      description: "Pure honey and bee products from Chitwan forests",
      documents: [],
    },
  ]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  // Remove this line
  // const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [selectedCenter, setSelectedCenter] =
    useState<DistributionCenter | null>(null);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [selectedDashboardCard, setSelectedDashboardCard] = useState<
    string | null
  >(null);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);
  const [activeCentersCount, setActiveCentersCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get("/vendors");
        // Only update vendors if we get data from the API
        if (response.data && response.data.length > 0) {
          setVendors(response.data);
        }
        // If no data from API, keep the mock data that was set in useState

        setTotalVendorsCount(vendors.length); // Use current vendors length
        setActiveCentersCount(
          centers.filter((c) => c.status === "active").length
        );

        const commission = vendors.reduce(
          (acc: number, vendor: Vendor) => acc + (vendor.commission || 0),
          0
        );
        setTotalCommission(commission);

        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        // On error, keep the mock data and don't override vendors
        console.log("Using mock data due to API error:", err);
        setError("Using mock data - API not available");
        
        // Calculate stats from mock data
        setTotalVendorsCount(vendors.length);
        setActiveCentersCount(
          centers.filter((c) => c.status === "active").length
        );
        
        const commission = vendors.reduce(
          (acc: number, vendor: Vendor) => acc + (vendor.commission || 0),
          0
        );
        setTotalCommission(commission);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [centers]); // Remove vendors from dependency to avoid infinite loop

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCategoryError(null);

    try {
      await createCategory(newCategory);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
      setNewCategory("");
      setShowCategoryForm(false);
    } catch (err) {
      setCategoryError("Failed to add category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setLoading(true);
    try {
      await deleteCategory(categoryId);
      const updatedCategories = await getCategories();
      setCategories(updatedCategories);
    } catch (err) {
      setCategoryError("Failed to delete category");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject"
  ) => {
    try {
      await axiosInstance.patch(`/vendors/${vendorId}/status`, {
        status:
          action === "approve" ? VendorStatus.APPROVED : VendorStatus.REJECTED,
        notes: actionNotes,
      });

      const response = await axiosInstance.get("/vendors");
      setVendors(response.data);
      setShowVendorModal(false);
      setSelectedVendor(null);
      setActionNotes("");
    } catch (err) {
      setError("Failed to update vendor status");
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      ) : (
        <>
          {/* AdminDashboard Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AdminDashboard</h1>
            <p className="text-gray-600">Manage vendors, centers, and system overview</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200/50"
              onClick={() => {
                setSelectedDashboardCard("vendors");
                setShowDashboardModal(true);
              }}
            >
              <div className="flex items-center p-8">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">Total Vendors</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalVendorsCount}</p>
                </div>
              </div>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-100 border-green-200/50"
              onClick={() => {
                setSelectedDashboardCard("centers");
                setShowDashboardModal(true);
              }}
            >
              <div className="flex items-center p-8">
                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">Active Centers</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{activeCentersCount}</p>
                </div>
              </div>
            </Card>

            <Card
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200/50"
              onClick={() => {
                setSelectedDashboardCard("commission");
                setShowDashboardModal(true);
              }}
            >
              <div className="flex items-center p-8">
                <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div className="ml-6">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">Total Commission</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">₹{totalCommission.toFixed(2)}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Vendor Categories */}
          {/* ... keep same code for categories, centers, vendor applications, modals ... */}

          {showDashboardModal && selectedDashboardCard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedDashboardCard === "vendors" && "Vendor List"}
                    {selectedDashboardCard === "centers" && "Distribution Center List"}
                    {selectedDashboardCard === "commission" && "Commission Details"}
                  </h3>
                  <button onClick={() => setShowDashboardModal(false)}>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedDashboardCard === "vendors" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">All Vendors ({vendors.length})</h4>
                      
                      {vendors.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Loading vendors...</p>
                          {error && <p className="text-red-500 mt-2">{error}</p>}
                        </div>
                      )}
                      
                      <div className="max-h-96 overflow-y-auto">
                        <ul className="space-y-2">
                          {vendors.map((vendor) => (
                            <li key={vendor._id || vendor.id} className="p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {vendor.businessName || vendor.name || 'Unknown Business'}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-600">
                                    ({vendor.email || 'No email'})
                                  </span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  vendor.status === VendorStatus.APPROVED ? 'bg-green-100 text-green-800' :
                                  vendor.status === VendorStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {vendor.status || 'Unknown'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {vendors.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No vendors found.</p>
                      )}
                    </div>
                  )}

                  {selectedDashboardCard === "centers" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">All Distribution Centers ({centers.length})</h4>
                      
                      <div className="max-h-96 overflow-y-auto">
                        <ul className="space-y-2">
                          {centers.map((center) => (
                            <li key={center.id} className="p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">{center.name}</span>
                                  <span className="ml-2 text-sm text-gray-600">({center.location})</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  center.status === 'active' ? 'bg-green-100 text-green-800' :
                                  center.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {center.status}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {centers.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No centers found.</p>
                      )}
                    </div>
                  )}

                  {selectedDashboardCard === "commission" && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold">Commission from Vendor-Center Transactions ({vendors.filter(v => v.status === VendorStatus.APPROVED).length})</h4>
                      
                      <div className="max-h-96 overflow-y-auto">
                        <ul className="space-y-2">
                          {vendors.filter(vendor => vendor.status === VendorStatus.APPROVED).map((vendor) => {
                            // Calculate commission based on vendor's total payments to centers
                            const vendorCenterPayments = vendor.totalPurchases || 0;
                            const commissionRate = 0.05; // 5% commission
                            const commissionEarned = vendorCenterPayments * commissionRate;
                            
                            return (
                              <li key={vendor._id || vendor.id} className="p-3 border rounded-lg hover:bg-gray-50">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium text-gray-900">
                                      {vendor.businessName || vendor.name || 'Unknown Business'}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-600">
                                      (₹{vendorCenterPayments.toLocaleString()} purchases)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-blue-600">
                                      ₹{commissionEarned.toLocaleString()}
                                    </span>
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      5% Commission
                                    </span>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      
                      {/* Total Summary */}
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-blue-800">Total Commission Earned:</span>
                          <span className="text-xl font-bold text-blue-600">
                            ₹{vendors.filter(v => v.status === VendorStatus.APPROVED)
                              .reduce((sum, vendor) => sum + ((vendor.totalPurchases || 0) * 0.05), 0)
                              .toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {vendors.filter(v => v.status === VendorStatus.APPROVED).length === 0 && (
                        <p className="text-center text-gray-500 py-8">No commission data found.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
