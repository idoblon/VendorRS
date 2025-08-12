import React from "react";
import { Building2, Store } from "lucide-react";
import { Card } from "../ui/Card";

interface RoleSelectionProps {
  onSelectRole: (role: "vendor" | "center") => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">
          Choose Registration Type
        </h1>

        <div className="space-y-4">
          <Card
            onClick={() => onSelectRole("vendor")}
            className="cursor-pointer"
          >
            <Store className="mx-auto h-12 w-12 text-orange-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              Vendor Registration
            </h2>
          </Card>

          <Card
            onClick={() => onSelectRole("center")}
            className="cursor-pointer"
          >
            <Building2 className="mx-auto h-12 w-12 text-red-500 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              Center Registration
            </h2>
          </Card>
        </div>
      </div>
    </div>
  );
}
