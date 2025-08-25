"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Building,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
} from "lucide-react";
import { Card } from "./../ui/Card";
import { Button } from "./../ui/Button";
import axiosInstance from "../../utils/axios";

interface Application {
  id: string;
  type: "vendor" | "center";
  name: string;
  businessName?: string;
  location?: string;
  email: string;
  phone: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  documents: string[];
}

export function ApplicationsComponent() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"vendor" | "center">("vendor");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      console.log(
        "Fetching applications for:",
        activeTab,
        "with status:",
        statusFilter
      );
      setLoading(true);
      const response = await axiosInstance.get(`/api/users/${activeTab}s`, {
        params: {
          status:
            statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
        },
      });

      console.log("API response:", response.data);

      if (response.data.success) {
        // Log the raw response data
        console.log("Raw response data:", response.data);

        // Check if the data structure is as expected
        const responseData = response.data.data;
        console.log("Response data structure:", responseData);

        if (!responseData) {
          console.error("No data found in response");
          setError("No data found in response");
          return;
        }

        const applicationsData = responseData[`${activeTab}s`];
        console.log("Applications data:", applicationsData);

        if (!applicationsData) {
          console.error(`No ${activeTab}s data found in response`);
          setError(`No ${activeTab} applications found`);
          return;
        }

        // Transform the data to match our Application interface
        const transformedApplications = applicationsData.map((item: any) => ({
          id: item._id,
          type: activeTab,
          name: item.name,
          businessName: item.businessName,
          location: item.district
            ? `${item.district}, ${item.province || ""}`
            : undefined,
          email: item.email,
          phone: item.phone,
          status: item.status.toLowerCase() as
            | "pending"
            | "approved"
            | "rejected",
          submittedDate: item.createdAt
            ? new Date(item.createdAt).toISOString().split("T")[0]
            : "",
          documents: item.documents
            ? item.documents.map((doc: any) => doc.originalName || "Document")
            : [],
        }));
        console.log("Transformed applications:", transformedApplications);
        setApplications(transformedApplications);
      } else {
        setError(response.data.message || "Failed to fetch applications");
      }
    } catch (err: any) {
      console.error("Error fetching applications:", err);
      // Log more detailed error information
      if (err.response) {
        console.error("Error response:", err.response);
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError("Network error: Unable to reach server");
      } else {
        console.error("Error message:", err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      console.log("Updating application status for:", id, "to:", status);
      const response = await axiosInstance.put(
        `/api/users/${activeTab}s/${id}/status`,
        {
          status: status.toUpperCase(),
        }
      );

      console.log("Update status response:", response.data);

      if (response.data.success) {
        // Update local state to reflect the change
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
        // Close modal if viewing the updated application
        if (selectedApplication?.id === id) {
          setSelectedApplication((prev) => (prev ? { ...prev, status } : null));
        }
      } else {
        throw new Error(
          response.data.message || "Failed to update application status"
        );
      }
    } catch (err: any) {
      console.error("Error updating application status:", err);
      // Log more detailed error information
      if (err.response) {
        console.error("Error response:", err.response);
        setError(
          `Server error: ${err.response.status} - ${
            err.response.data?.message || "Unknown error"
          }`
        );
      } else if (err.request) {
        console.error("Error request:", err.request);
        setError("Network error: Unable to reach server");
      } else {
        console.error("Error message:", err.message);
        setError(`Error: ${err.message}`);
      }
    }
  };

  // Fetch applications when activeTab or statusFilter changes
  useEffect(() => {
    console.log(
      "useEffect triggered with activeTab:",
      activeTab,
      "and statusFilter:",
      statusFilter
    );
    fetchApplications();
  }, [activeTab, statusFilter]);

  const filteredApplications = applications.filter((app) => {
    const statusMatch = statusFilter === "all" || app.status === statusFilter;
    return statusMatch;
  });

  const handleApprove = (id: string) => {
    console.log("Approving application:", id);
    updateApplicationStatus(id, "approved");
  };

  const handleReject = (id: string) => {
    console.log("Rejecting application:", id);
    updateApplicationStatus(id, "rejected");
  };

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedApplication(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50/30 to-pink-50/30 min-h-screen -m-6 p-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-purple-100 mt-2">
          Review and manage vendor and center applications
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
          <button
            onClick={() => setActiveTab("vendor")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "vendor"
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Vendor Applications
          </button>
          <button
            onClick={() => setActiveTab("center")}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "center"
                ? "bg-purple-100 text-purple-700"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Building className="h-4 w-4 mr-2" />
            Center Applications
          </button>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <Card className="bg-gradient-to-br from-white to-purple-50/50 border-purple-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {activeTab === "vendor"
              ? "Vendor Applications"
              : "Center Applications"}
          </h2>
          <div className="text-sm text-gray-600">
            {filteredApplications.length} applications
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-500">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-red-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Error loading applications
              </h3>
              <p className="text-gray-500">{error}</p>
              <Button
                onClick={fetchApplications}
                className="mt-4 bg-purple-600 hover:bg-purple-700"
              >
                Try Again
              </Button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {activeTab === "vendor" ? (
                  <Users className="h-8 w-8 text-gray-400" />
                ) : (
                  <Building className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab} applications found
              </h3>
              <p className="text-gray-500">
                {statusFilter === "all"
                  ? `No ${activeTab} applications have been submitted yet.`
                  : `No ${statusFilter} ${activeTab} applications found.`}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <Card
                key={application.id}
                className={`hover:shadow-xl transition-all duration-300 p-4 ${
                  application.status === "approved"
                    ? "bg-gradient-to-br from-white to-green-50/50 border-green-200"
                    : application.status === "rejected"
                    ? "bg-gradient-to-br from-white to-red-50/50 border-red-200"
                    : "bg-gradient-to-br from-white to-yellow-50/50 border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {application.type === "vendor" ? (
                        <Users className="h-6 w-6 text-gray-600" />
                      ) : (
                        <Building className="h-6 w-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.businessName || application.name}
                        </h3>
                        {getStatusIcon(application.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Contact Person</p>
                          <p className="font-medium text-slate-900">
                            {application.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="font-medium text-slate-900">
                            {application.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Phone</p>
                          <p className="font-medium text-slate-900">
                            {application.phone}
                          </p>
                        </div>
                        {application.location && (
                          <div>
                            <p className="text-slate-500">Location</p>
                            <p className="font-medium text-slate-900">
                              {application.location}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-medium text-slate-900">
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-slate-500 text-sm">
                          Documents Submitted
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.documents.map((doc, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted:{" "}
                        {new Date(
                          application.submittedDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => handleViewDetails(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {application.status === "pending" && (
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(application.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(application.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedApplication.type === "vendor" ? "Vendor" : "Center"}{" "}
                Application Details
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-lg bg-gray-100">
                    {selectedApplication.type === "vendor" ? (
                      <Users className="h-8 w-8 text-gray-600" />
                    ) : (
                      <Building className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedApplication.businessName ||
                        selectedApplication.name}
                    </h3>
                    <p className="text-gray-500">
                      {selectedApplication.type === "vendor"
                        ? "Vendor Application"
                        : "Distribution Center Application"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedApplication.status)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedApplication.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : selectedApplication.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedApplication.status.charAt(0).toUpperCase() +
                      selectedApplication.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium text-gray-900">
                        {selectedApplication.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">
                        {selectedApplication.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">
                        {selectedApplication.phone}
                      </p>
                    </div>
                  </div>
                  {selectedApplication.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedApplication.location}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Application Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Submitted Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(
                          selectedApplication.submittedDate
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FileText className="h-5 w-5 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">
                        Documents Submitted
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.documents.length > 0 ? (
                          selectedApplication.documents.map((doc, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                            >
                              {doc}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No documents submitted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === "pending" && (
                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      closeDetailModal();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      closeDetailModal();
                    }}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
