"use client"

import { useState } from "react"
import { FileText, Building, Users, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { Card } from "./../ui/Card"
import { Button } from "./../ui/Button"

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
  documents: string[]
}

export function ApplicationsComponent() {
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "1",
      type: "vendor",
      name: "John Doe",
      businessName: "TechCorp Solutions",
      email: "john@techcorp.com",
      phone: "+1-555-0123",
      status: "pending",
      submittedDate: "2024-01-15",
      documents: ["Business License", "Tax Certificate", "Bank Details"],
    },
    {
      id: "2",
      type: "center",
      name: "Sarah Johnson",
      businessName: "East Coast Distribution",
      location: "Boston, MA",
      email: "sarah@eastcoast.com",
      phone: "+1-555-0456",
      status: "pending",
      submittedDate: "2024-01-14",
      documents: ["Facility License", "Insurance Certificate", "Lease Agreement"],
    },
    {
      id: "3",
      type: "vendor",
      name: "Mike Wilson",
      businessName: "Global Supplies Inc",
      email: "mike@globalsupplies.com",
      phone: "+1-555-0789",
      status: "approved",
      submittedDate: "2024-01-10",
      documents: ["Business License", "Tax Certificate"],
    },
    {
      id: "4",
      type: "center",
      name: "David Chen",
      businessName: "West Coast Hub",
      location: "San Francisco, CA",
      email: "david@westcoasthub.com",
      phone: "+1-555-0321",
      status: "rejected",
      submittedDate: "2024-01-12",
      documents: ["Facility License", "Insurance Certificate"],
    },
    {
      id: "5",
      type: "vendor",
      name: "Lisa Brown",
      businessName: "Premium Electronics",
      email: "lisa@premiumelec.com",
      phone: "+1-555-0654",
      status: "pending",
      submittedDate: "2024-01-16",
      documents: ["Business License", "Tax Certificate", "Product Catalog"],
    },
  ])

  const [activeTab, setActiveTab] = useState<"vendor" | "center">("vendor")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  const filteredApplications = applications.filter((app) => {
    const typeMatch = app.type === activeTab
    const statusMatch = statusFilter === "all" || app.status === statusFilter
    return typeMatch && statusMatch
  })

  const handleApprove = (id: string) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: "approved" as const } : app)))
  }

  const handleReject = (id: string) => {
    setApplications((prev) => prev.map((app) => (app.id === id ? { ...app, status: "rejected" as const } : app)))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6 bg-gradient-to-br from-purple-50/30 to-pink-50/30 min-h-screen -m-6 p-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-purple-100 mt-2">Review and manage vendor and center applications</p>
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
            {activeTab === "vendor" ? "Vendor Applications" : "Center Applications"}
          </h2>
          <div className="text-sm text-gray-600">{filteredApplications.length} applications</div>
        </div>

        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-gray-100 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                {activeTab === "vendor" ? (
                  <Users className="h-8 w-8 text-gray-400" />
                ) : (
                  <Building className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} applications found</h3>
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
                          <p className="font-medium text-slate-900">{application.name}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="font-medium text-slate-900">{application.email}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Phone</p>
                          <p className="font-medium text-slate-900">{application.phone}</p>
                        </div>
                        {application.location && (
                          <div>
                            <p className="text-slate-500">Location</p>
                            <p className="font-medium text-slate-900">{application.location}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-slate-500 text-sm">Documents Submitted</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {application.documents.map((doc, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(application.submittedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {application.status === "pending" && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
