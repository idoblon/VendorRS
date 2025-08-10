import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axios";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Calendar, Edit, Eye, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "../../ui/Toaster";

export default function DistributedCenter() {
  const [mockCenters, setCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("centers");
  useEffect(() => {
    async function getDistributedCenters() {
      setIsLoading(true);
      const response = await axiosInstance.get("/api/centers");
      // Handle the response as needed
      setCenters(response.data.data.centers);
    }
    getDistributedCenters();
    setIsLoading(false);
  }, []);

  const handleCenterAction = (
    centerId: string,
    action: "activate" | "deactivate" | "maintenance" | "delete"
  ) => {
    const actionMessages = {
      activate: "Distribution center activated",
      deactivate: "Distribution center deactivated",
      maintenance: "Distribution center set to maintenance mode",
      delete: "Distribution center deleted",
    };

    toast.success(actionMessages[action]);
  };
  return !isLoading ? (
    console.log(mockCenters),
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockCenters && mockCenters.map((center: any) => (
          <Card
            key={center.id}
            className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-green-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {center.name}
                </h3>
                <p className="text-sm text-slate-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {center.location}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  center.status === "active"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : center.status === "maintenance"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {center.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Contact Person</p>
                  <p className="font-medium text-slate-900">
                    {center.contactPerson.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Region</p>
                  <p className="font-medium text-slate-900">{center.region}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {center.contactPerson.email}
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {center.contactPerson.phone}
                </div>
              </div>

              <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Capacity Utilization
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                     {center.operationalDetails.currentOrders}/
                      {center.operationalDetails.capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (center.operationalDetails.currentOrders / center.operationalDetails.capacity) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((center.operationalDetails.currentOrders / center.operationalDetails.capacity) * 100)}%
                  utilized
                </p>
              </div>

              <div className="text-sm text-slate-600">
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Established: {center.establishedDate}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              {center.status === "inactive" && (
                <Button
                  size="sm"
                  onClick={() => handleCenterAction(center.id, "activate")}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                >
                  Activate
                </Button>
              )}
              {center.status === "active" && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCenterAction(center.id, "maintenance")}
                    className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 border-0"
                  >
                    Maintenance
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCenterAction(center.id, "deactivate")}
                    className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                  >
                    Deactivate
                  </Button>
                </>
              )}
              {center.status === "maintenance" && (
                <Button
                  size="sm"
                  onClick={() => handleCenterAction(center.id, "activate")}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                >
                  Reactivate
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                icon={Edit}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Eye}
                className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
              >
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {/* Centers Grid */}
      {mockCenters && mockCenters.length ? (

        console.log(mockCenters[0]),
       <>
        <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Distribution Centers
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("centers")}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              Manage All
            </Button>
          </div>
          <div className="space-y-4">
            {mockCenters.slice(0, 3).map((center: any) => (
              <div
                key={center.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      center.status === "active"
                        ? "bg-emerald-400"
                        : center.status === "maintenance"
                        ? "bg-amber-400"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <div>
                    <p className="font-medium text-slate-900">{center.name}</p>
                    <p className="text-sm text-slate-600">{center.location}</p>
                    <p className="text-sm text-slate-500">
                      {center.operationalDetails.currentOrders}/
                      {center.operationalDetails.capacity} orders
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    center.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : center.status === "maintenance"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {center.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
       </>
      ) : (
        <>
          <p>No distribution centers found.</p>
        </>
      )}
    </>
  ) : (
    <>
      <p>loading............</p>
    </>
  );
}
