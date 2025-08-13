"use client";

import { useState } from "react";
import { Bell, CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { Card } from "./../ui/Card";
import { Button } from "./../ui/Button";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Vendor Approved",
      message: "TechCorp Solutions has been approved as a vendor",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "warning",
      title: "Center Maintenance",
      message: "Downtown Hub scheduled for maintenance tomorrow",
      timestamp: "4 hours ago",
      read: false,
    },
    {
      id: "3",
      type: "info",
      title: "New Application",
      message: "Global Supplies submitted a vendor application",
      timestamp: "1 day ago",
      read: true,
    },
  ]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen -m-6 p-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-blue-100 mt-2">
          Stay updated with system alerts and updates
        </p>
      </div>

      <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Notifications
          </h2>
          <Button variant="outline" size="sm">
            Mark All Read
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                notification.read
                  ? "bg-gray-50 border-gray-200"
                  : "bg-white border-blue-200 shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <h3
                      className={`font-medium ${
                        notification.read ? "text-gray-700" : "text-slate-900"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <p
                      className={`text-sm mt-1 ${
                        notification.read ? "text-gray-600" : "text-slate-600"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
