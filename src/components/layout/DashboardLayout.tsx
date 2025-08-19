"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown, Bell } from "lucide-react";
import axiosInstance from "../../utils/axios";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

interface NotificationItem {
  id: string;
  message: string;
  time: string;
  read: boolean;
  title: string;
  createdAt: string;
}

export function DashboardLayout({
  children,
  activeSection = "overview",
  onSectionChange,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // First fetch application-related notifications
        const appResponse = await axiosInstance.get("/api/notifications", {
          params: { limit: 5, type: "VENDOR_APPLICATION" },
        });

        // Then fetch center application notifications
        const centerAppResponse = await axiosInstance.get("/api/notifications", {
          params: { limit: 5, type: "CENTER_APPLICATION" },
        });

        // Combine application notifications
        let appNotifications = [];
        if (appResponse.data.success) {
          appNotifications = appResponse.data.data.notifications;
        }
        
        if (centerAppResponse.data.success) {
          appNotifications = [...appNotifications, ...centerAppResponse.data.data.notifications];
        }

        // If we don't have enough notifications, fetch general notifications
        let allNotifications = appNotifications;
        let unreadCount = 0;
        
        if (appNotifications.length < 10) {
          const generalResponse = await axiosInstance.get("/api/notifications", {
            params: { limit: 10 - appNotifications.length },
          });
          
          if (generalResponse.data.success) {
            // Filter out application notifications that we already have
            const generalNotifications = generalResponse.data.data.notifications.filter(
              (n: any) => n.type !== "VENDOR_APPLICATION" && n.type !== "CENTER_APPLICATION"
            );
            
            allNotifications = [...appNotifications, ...generalNotifications];
            unreadCount = generalResponse.data.data.unreadCount;
          }
        }
        
        // If we still don't have the unread count from general notifications, calculate it
        if (unreadCount === 0) {
          const unreadResponse = await axiosInstance.get("/api/notifications", {
            params: { unread: true },
          });
          
          if (unreadResponse.data.success) {
            unreadCount = unreadResponse.data.data.unreadCount;
          }
        }

        const formattedNotifications = allNotifications.map(
          (notification: any) => ({
            id: notification._id,
            title: notification.title,
            message: notification.message,
            time: formatTime(notification.createdAt),
            read: notification.isRead,
            createdAt: notification.createdAt,
          })
        );

        setNotifications(formattedNotifications);
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    // Set up interval to refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const handleNotificationClick = async (id: string) => {
    try {
      // Mark notification as read
      await axiosInstance.put(`/api/notifications/${id}/read`);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      // Mark all notifications as read
      await axiosInstance.put("/api/notifications/read-all");

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "vendors", label: "Vendors", icon: "👥" },
    { id: "centers", label: "Centers", icon: "🏢" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[256px_1fr] grid-rows-[auto_1fr] lg:grid-rows-1 min-h-screen">
        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
          transform transition-transform duration-200 ease-in-out 
          lg:relative lg:translate-x-0 lg:z-auto lg:w-auto
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <img
                src="/vrslogo.png"
                alt="VRS Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <h1 className="text-xl font-bold text-gray-900">VRS</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSectionChange?.(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen lg:min-h-0">
          {/* Header Bar */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
            {/* Left Section - Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                AdminDashboard
              </h2>
            </div>

            {/* Right Section - Notifications + User Menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllRead();
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() =>
                              handleNotificationClick(notification.id)
                            }
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-gray-900">
                      Admin User
                    </p>
                    <p className="text-xs text-gray-600">Administrator</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        Admin Profile
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        console.log("Logging out...");
                        setUserMenuOpen(false);
                        // Call the onLogout prop if available
                        if (typeof window !== "undefined") {
                          // Clear local storage
                          localStorage.removeItem("vrs_token");
                          localStorage.removeItem("vrs_user");
                          // Redirect to login page
                          window.location.href = "/";
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}
