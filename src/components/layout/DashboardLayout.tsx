import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Icon } from "@iconify/react";
import { NotificationsPopup } from "../notifications/NotificationsPopup";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);

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

  // Sample data for search suggestions
  const getProjectSuggestions = (query: string) => {
    const projects = [
      { name: "E-commerce Platform", sid: "s25021874" },
      { name: "CRM System", sid: "s25000213" },
      { name: "HR Portal", sid: "s25022909" },
      { name: "Inventory Management", sid: "s25010456" },
      { name: "Customer Support Portal", sid: "s25011789" },
      { name: "Analytics Dashboard", sid: "s25012234" },
    ];

    return projects
      .filter(
        (project) =>
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.sid.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  };

  const getRequestSuggestions = (query: string) => {
    const requests = [
      {
        id: "1fbe8d61-C4bb-43da-8b85-044eb5e1bc32",
        testCase: "Test Case Name",
      },
      { id: "30bf238a-Eb8a-4ed6-924d-435b75e0bd93", testCase: "Skipscreener" },
      { id: "72fc065f-Fc45-48fd-9590-Bd8508dc2a2d", testCase: "Q1None" },
      { id: "5948ada0-87b5-415a-98bc-C3284072ce67", testCase: "Q1AllQ2None" },
      {
        id: "0e6aca6f-Befa-450b-86c7-3418ef85dd1f",
        testCase: "BrandAwareness",
      },
    ];

    return requests
      .filter(
        (request) =>
          request.id.toLowerCase().includes(query.toLowerCase()) ||
          request.testCase.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  };

  const getTestCaseSuggestions = (query: string) => {
    const testCases = [
      { name: "Test Case Name", project: "E-commerce Platform" },
      { name: "Skipscreener", project: "CRM System" },
      { name: "Q1None", project: "HR Portal" },
      { name: "Q1AllQ2None", project: "HR Portal" },
      { name: "BrandAwareness", project: "HR Portal" },
      { name: "CustomerSatisfaction", project: "HR Portal" },
      { name: "ProductFeedback", project: "HR Portal" },
    ];

    return testCases
      .filter(
        (testCase) =>
          testCase.name.toLowerCase().includes(query.toLowerCase()) ||
          testCase.project.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center flex-shrink-0">
              {/* Logo */}
              <div className="flex items-center">
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

              {/* Navigation Dropdown */}
              <div className="ml-10">
                <DropdownMenu
                  open={navDropdownOpen}
                  onOpenChange={setNavDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 px-3 py-2"
                    >
                      <Icon icon="heroicons:bars-3" className="w-5 h-5" />
                      <span className="font-medium">Navigation</span>
                      <Icon icon="heroicons:chevron-down" className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className={
                          item.active ? "bg-emerald-50 text-emerald-700" : ""
                        }
                      >
                        <Link
                          to={item.href}
                          className="flex items-center w-full"
                          onClick={() => setNavDropdownOpen(false)}
                        >
                          <Icon icon={item.icon} className="w-4 h-4 mr-3" />
                          {item.label}
                          {item.active && (
                            <Icon
                              icon="heroicons:check"
                              className="w-4 h-4 ml-auto text-emerald-600"
                            />
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-md mx-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon
                    icon="heroicons:magnifying-glass"
                    className="h-5 w-5 text-slate-400"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() =>
                    setShowSearchSuggestions(searchQuery.length > 0)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSearchSuggestions(false), 200)
                  }
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

                {/* Search Suggestions */}
                {showSearchSuggestions && searchQuery && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                    <Command>
                      <CommandList className="max-h-64">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Projects">
                          {getProjectSuggestions(searchQuery).map(
                            (project, index) => (
                              <CommandItem
                                key={`project-${index}`}
                                onSelect={() => {
                                  setSearchQuery(project.name);
                                  setShowSearchSuggestions(false);
                                  navigate("/requests");
                                }}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <Icon
                                  icon="heroicons:folder"
                                  className="w-4 h-4 text-slate-400"
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {project.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {project.sid}
                                  </span>
                                </div>
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                        <CommandGroup heading="Requests">
                          {getRequestSuggestions(searchQuery).map(
                            (request, index) => (
                              <CommandItem
                                key={`request-${index}`}
                                onSelect={() => {
                                  setSearchQuery(request.id);
                                  setShowSearchSuggestions(false);
                                  navigate("/requests");
                                }}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <Icon
                                  icon="heroicons:document-text"
                                  className="w-4 h-4 text-slate-400"
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {request.id}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {request.testCase}
                                  </span>
                                </div>
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                        <CommandGroup heading="Test Cases">
                          {getTestCaseSuggestions(searchQuery).map(
                            (testCase, index) => (
                              <CommandItem
                                key={`testcase-${index}`}
                                onSelect={() => {
                                  setSearchQuery(testCase.name);
                                  setShowSearchSuggestions(false);
                                  navigate("/requests");
                                }}
                                className="flex items-center space-x-3 cursor-pointer"
                              >
                                <Icon
                                  icon="heroicons:beaker"
                                  className="w-4 h-4 text-slate-400"
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {testCase.name}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {testCase.project}
                                  </span>
                                </div>
                              </CommandItem>
                            ),
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Notifications and Profile */}
            <div className="flex items-center space-x-4 flex-shrink-0">
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
                          ��� May 15, 2023 - 10:23 AM
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
            <div className="py-4">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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