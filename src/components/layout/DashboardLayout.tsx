import React, { useEffect, useState } from "react";
import { Menu, X, User, LogOut, Search, ChevronDown } from "lucide-react";
import { User as UserType } from "../../types";
import { Button } from "../ui/Button";
import { NotificationPanel } from "../ui/NotificationPanel";
import axiosInstance from "../../utils/axios";

interface DashboardLayoutProps {
  user: UserType;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  onLogout: () => void;
}

export function DashboardLayout({
  user,
  children,
  sidebar,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
                src="/image/vrslogo.png"
                alt="VRS Logo"
                className="w-8 h-8 object-contain"
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
          <nav className="flex-1 px-4 py-6 overflow-y-auto">{sidebar}</nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-4">
              {/* Logout button removed as requested */}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col min-h-screen lg:min-h-0">
          {/* Header Bar */}
          <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between">
            {/* Left Section - Mobile Menu + Search */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

            </div>

            {/* Right Section - Notifications + User Menu */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <NotificationPanel />

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
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {user.role}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden md:block" />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Account Preferences
                    </button>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}
