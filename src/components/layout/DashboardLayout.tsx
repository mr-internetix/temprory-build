import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { NotificationsPopup } from "../notifications/NotificationsPopup";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: "heroicons:home",
      active: location.pathname === "/",
    },
    {
      href: "/requests",
      label: "Request Management",
      icon: "heroicons:clipboard-document-list",
      active: location.pathname === "/requests",
    },
    {
      href: "/analytics",
      label: "Analytics",
      icon: "heroicons:chart-pie",
      active: location.pathname === "/analytics",
    },
    {
      href: "/activity",
      label: "Activity",
      icon: "heroicons:clock",
      active: location.pathname === "/activity",
    },
    {
      href: "/archive",
      label: "Archive",
      icon: "heroicons:archive-box",
      active: location.pathname === "/archive",
    },
  ];

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return [];
    if (path === "/requests") return ["Request Management"];
    if (path === "/analytics") return ["Analytics"];
    if (path === "/activity") return ["Activity"];
    if (path === "/archive") return ["Archive"];
    return [];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                  <Icon
                    icon="heroicons:chart-bar"
                    className="w-5 h-5 text-white"
                  />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-slate-800">
                  iDataGenerator
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="ml-10 flex space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                      item.active
                        ? "text-emerald-600 border-b-2 border-emerald-500"
                        : "text-slate-600 hover:text-slate-800 hover:border-b-2 hover:border-slate-300"
                    }`}
                  >
                    <Icon icon={item.icon} className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-slate-600 hover:text-slate-800 hover:bg-slate-100 p-2"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Icon icon="heroicons:bell" className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
                </Button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-800">
                          NOTIFICATIONS
                        </h3>
                        <div className="flex gap-2">
                          <button className="text-blue-600 text-sm hover:text-blue-800">
                            All
                          </button>
                          <button className="text-blue-600 text-sm hover:text-blue-800">
                            Unread
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-slate-600">
                          5 unread notifications
                        </span>
                        <button className="text-blue-600 text-sm hover:text-blue-800">
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-3 border-l-4 border-emerald-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Request Completed for SID 8765432
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: corQID
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 1234, 2345, 3456
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 15, 2023 - 10:23 AM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-red-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Request Failed for SID 9876543
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: cor_screener
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 5678, 6789
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 14, 2023 - 03:45 PM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-blue-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Request Archived for SID 5432109
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: cor testing
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 7890, 8901
                        </p>
                        <p className="text-sm text-slate-600">
                          by Crystel Yu (SQA)
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 13, 2023 - 09:12 AM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-yellow-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Request In Progress for SID 1234567
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: Mobile Performance Test
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 9012, 3456, 7890
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 15, 2023 - 02:30 PM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-purple-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          New Request Created for SID 2468135
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: API Security Validation
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 1357, 2468, 9024
                        </p>
                        <p className="text-sm text-slate-600">
                          by Alex Johnson (Dev)
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 15, 2023 - 01:15 PM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-pink-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Priority Request Updated for SID 3691472
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: User Authentication Flow
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 4567, 8901, 2345
                        </p>
                        <p className="text-sm text-slate-600">
                          Priority changed to High by Maria Garcia (PM)
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 15, 2023 - 11:45 AM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-orange-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Test Data Generated for SID 7531598
                        </h4>
                        <p className="text-sm text-slate-600">
                          Test case name: Payment Gateway Integration
                        </p>
                        <p className="text-sm text-slate-600">
                          Serial: 6789, 0123, 4567
                        </p>
                        <p className="text-sm text-slate-600">
                          1,500 test records generated successfully
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 15, 2023 - 09:30 AM
                        </p>
                      </div>

                      <div className="p-3 border-l-4 border-gray-500 border-b border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <h4 className="font-medium text-slate-800">
                          Maintenance Scheduled for Infrastructure
                        </h4>
                        <p className="text-sm text-slate-600">
                          Scheduled downtime: May 16, 2023 (2:00 AM - 4:00 AM)
                        </p>
                        <p className="text-sm text-slate-600">
                          All active requests will be paused during maintenance
                        </p>
                        <p className="text-sm text-slate-600">
                          by System Administrator
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 May 14, 2023 - 05:00 PM
                        </p>
                      </div>
                    </div>

                    <div className="p-3 border-t border-slate-200 text-center">
                      <button
                        onClick={() => window.open("/notifications", "_blank")}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View All Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full hover:bg-slate-100"
                  >
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src="/avatars/01.png" alt="User" />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-slate-200"
                  align="end"
                  forceMount
                >
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center text-slate-700 hover:text-slate-900"
                    >
                      <Icon icon="heroicons:user" className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      className="flex items-center text-slate-700 hover:text-slate-900"
                    >
                      <Icon
                        icon="heroicons:cog-6-tooth"
                        className="mr-2 h-4 w-4"
                      />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem className="text-slate-700 hover:text-slate-900">
                    <Icon
                      icon="heroicons:arrow-right-on-rectangle"
                      className="mr-2 h-4 w-4"
                    />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <div className="bg-white border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-3">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link
                      to="/"
                      className="text-slate-500 hover:text-slate-700"
                    >
                      <Icon icon="heroicons:home" className="w-4 h-4" />
                    </Link>
                  </li>
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index}>
                      <div className="flex items-center">
                        <Icon
                          icon="heroicons:chevron-right"
                          className="w-4 h-4 text-slate-400 mx-2"
                        />
                        <span
                          className={
                            index === breadcrumbs.length - 1
                              ? "text-slate-800 font-medium"
                              : "text-slate-600 hover:text-slate-800"
                          }
                        >
                          {crumb}
                        </span>
                      </div>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/60 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-600">
              © 2024 iDataGenerator. Developed by Ipsos DSC Development Team
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Documentation
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Support
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Click outside to close notifications */}
      {notificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationsOpen(false)}
        />
      )}
    </div>
  );
}
