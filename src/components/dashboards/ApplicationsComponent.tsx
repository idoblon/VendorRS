"use client"

import { useState, useEffect } from "react"
import { FileText, Building, Users, Eye, CheckCircle, XCircle, Clock, X, Download, ExternalLink } from "lucide-react"
import { Card } from "./../ui/Card"
import { Button } from "./../ui/Button"
import axiosInstance from "../../utils/axios"
import { Document } from "../../types"

interface Application {
  id: string
  type: "vendor" | "center"
  name: string
  businessName?: string
  location?: string
  email: string
  phone: string
  status: "pending" | "approved" | "rejected"
  submittedDate: string
  documents: Document[]
}

export function ApplicationsComponent() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"vendor" | "center">("vendor")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  // Fetch applications from backend
  const fetchApplications = async () => {
    try {
      console.log("Fetching applications for:", activeTab, "with status:", statusFilter);
      setLoading(true)
      const response = await axiosInstance.get(`/api/users/${activeTab}s`, {
        params: {
          status: statusFilter === "all" ? undefined : statusFilter.toUpperCase()
        }
      })
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        // Log the raw response data
        console.log("Raw response data:", response.data);
        
        // Check if the data structure is as expected
        const responseData = response.data.data;
        
        // Transform the data to match our Application interface
        const transformedData = responseData.map((item: any) => {
          // Transform documents to include name, type, and url
          const documents = item.documents ? item.documents.map((doc: any) => {
            return {
              name: doc.name || doc.type || "Document",
              type: doc.type || "Unknown",
              url: doc.url || null
            };
          }) : [];
          
          return {
            id: item._id,
            type: activeTab,
            name: item.name || "",
            businessName: item.businessName || item.centerName || "",
            location: item.address?.city || "",
            email: item.email || "",
            phone: item.phone || "",
            status: item.status?.toLowerCase() || "pending",
            submittedDate: item.createdAt || new Date().toISOString(),
            documents: documents
          };
        });
        
        console.log("Transformed data:", transformedData);
        setApplications(transformedData);
      } else {
        setError("Failed to fetch applications");
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("An error occurred while fetching applications");
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const response = await axiosInstance.put(`/api/users/${activeTab}s/${id}/status`, {
        status
      });
      
      if (response.data.success) {
        // Update the local state
        setApplications(prevApplications =>
          prevApplications.map(app =>
            app.id === id ? { ...app, status: status.toLowerCase() as "approved" | "rejected" } : app
          )
        );
        return true;
      } else {
        setError(`Failed to ${status.toLowerCase()} application`);
        return false;
      }
    } catch (err) {
      console.error(`Error ${status.toLowerCase()}ing application:`, err);
      setError(`An error occurred while ${status.toLowerCase()}ing application`);
      return false;
    }
  };

  const handleApprove = async (id: string) => {
    const success = await updateApplicationStatus(id, "APPROVED");
    if (success) {
      console.log("Application approved successfully");
    }
  };

  const handleReject = async (id: string) => {
    const success = await updateApplicationStatus(id, "REJECTED");
    if (success) {
      console.log("Application rejected successfully");
    }
  };

  // Filter applications based on activeTab and statusFilter
  const filteredApplications = applications.filter(app => {
    if (app.type !== activeTab) return false;
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-amber-500" />;
    }
  };

  // Fetch applications when activeTab or statusFilter changes
  useEffect(() => {
    fetchApplications();
  }, [activeTab, statusFilter]);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 sm:mb-0">
              Applications
            </h2>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === "vendor" ? "default" : "outline"}
                onClick={() => setActiveTab("vendor")}
                className="flex items-center"
              >
                <Users className="h-4 w-4 mr-2" />
                Vendors
              </Button>
              <Button
                variant={activeTab === "center" ? "default" : "outline"}
                onClick={() => setActiveTab("center")}
                className="flex items-center"
              >
                <Building className="h-4 w-4 mr-2" />
                Centers
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-amber-500 hover:bg-amber-600" : ""}
            >
              <Clock className="h-4 w-4 mr-2" />
              Pending
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("approved")}
              className={statusFilter === "approved" ? "bg-green-500 hover:bg-green-600" : ""}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
              className={statusFilter === "rejected" ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p className="text-slate-500">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button
                variant="outline"
                onClick={() => {
                  setError(null);
                  fetchApplications();
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">
                No {statusFilter !== "all" ? statusFilter : ""} {activeTab} applications found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.businessName || application.name}
                        </h3>
                        <p className="text-sm text-slate-500">{application.name}</p>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(application.status)}
                        <span className="ml-2 text-sm font-medium capitalize">
                          {application.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start">
                        <span className="text-sm text-slate-500 w-20">Email:</span>
                        <span className="text-sm text-slate-700">{application.email}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-slate-500 w-20">Phone:</span>
                        <span className="text-sm text-slate-700">{application.phone}</span>
                      </div>
                      {application.location && (
                        <div className="flex items-start">
                          <span className="text-sm text-slate-500 w-20">Location:</span>
                          <span className="text-sm text-slate-700">{application.location}</span>
                        </div>
                      )}
                      <div className="flex items-start">
                        <span className="text-sm text-slate-500 w-20">Submitted:</span>
                        <span className="text-sm text-slate-700">
                          {new Date(application.submittedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-sm text-slate-500 w-20">Documents:</span>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm text-slate-700">
                            {application.documents.length} submitted
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {application.status === "pending" ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDocumentModal(true);
                          }}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(application.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(application.id)}
                          className="border-green-300 text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowDocumentModal(true);
                          }}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {showDocumentModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-slate-900">
                {selectedApplication.type === "vendor" ? "Vendor" : "Center"} Application Details
              </h3>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    {selectedApplication.type === "vendor" ? "Business" : "Center"} Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        {selectedApplication.type === "vendor" ? "Business Name" : "Center Name"}
                      </p>
                      <p className="font-medium text-slate-900">
                        {selectedApplication.businessName || selectedApplication.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Contact Person</p>
                      <p className="font-medium text-slate-900">{selectedApplication.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">{selectedApplication.phone}</p>
                    </div>
                    {selectedApplication.location && (
                      <div>
                        <p className="text-sm text-slate-500">Location</p>
                        <p className="font-medium text-slate-900">{selectedApplication.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <div className="flex items-center">
                        {getStatusIcon(selectedApplication.status)}
                        <p className="font-medium text-slate-900 ml-2 capitalize">
                          {selectedApplication.status}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Submitted Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedApplication.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Uploaded Documents
                  </h4>
                  {selectedApplication.documents.length === 0 ? (
                    <p className="text-gray-500">No documents uploaded</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedApplication.documents.map((doc, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <FileText className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">{doc.name}</p>
                                <p className="text-xs text-slate-500">{doc.type}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {doc.url && (
                                <>
                                  <a 
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2 bg-blue-100 rounded-lg text-blue-600 hover:bg-blue-200 transition-colors"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                  <a 
                                    href={doc.url} 
                                    download={doc.name}
                                    className="p-2 bg-green-100 rounded-lg text-green-600 hover:bg-green-200 transition-colors"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {selectedApplication.status === "pending" && (
                <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setShowDocumentModal(false);
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setShowDocumentModal(false);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
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
