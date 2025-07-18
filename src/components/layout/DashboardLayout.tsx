import React, { useState, useEffect, useDeferredValue } from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { apiClient } from "../../lib/api";
import { webSocketService, Notification } from "../../lib/websocket_service";
import { ToastNotification } from "../notifications/ToastNotification";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface ProjectSuggestion {
  project_id: string;
  project_name: string;
  project_created: string;
}

interface ProjectSuggestionsResponse {
  suggestions: ProjectSuggestion[];
  "total count": number;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // WebSocket notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.username.charAt(0).toUpperCase();
  };

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
    if (path === "/activity") return ["Activity"];
    if (path === "/archive") return ["Archive"];
    return [];
  };

  const breadcrumbs = getBreadcrumbs();

  // API call to fetch project suggestions
  const fetchProjectSuggestions = async (query: string) => {
    if (query.length < 2) {
      setProjectSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const data = await apiClient.get<ProjectSuggestionsResponse>(
        `/api/idatagenerator/projects/suggestions/?q=${encodeURIComponent(query)}&limit=5`
      );
      setProjectSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error fetching project suggestions:', error);
      setProjectSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        fetchProjectSuggestions(searchQuery);
      } else {
        setProjectSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // WebSocket notifications and webhook integration
  useEffect(() => {
    console.log("dashboard layout triggered for user:", user);

    if (user) {
      console.log("trying to connect websocket");

      // Connect to WebSocket
      webSocketService.connect();

      // Handle notifications updates
      const handleNotificationsChange = (newNotifications: Notification[]) => {
        console.log("Notifications Updated:", newNotifications);
        setNotifications(newNotifications);
      };

      // Handle toast notifications - PREVENT ALL DUPLICATES
      const handleToastNotification = (notification: Notification) => {
        console.log("🍞 Toast notification received:", notification.id);
        
        // Check if this notification already exists in our toast state
        setToastNotifications(prev => {
          const exists = prev.find(n => n.id === notification.id);
          if (exists) {
            console.log("🚫 Duplicate toast notification blocked:", notification.id);
            return prev;
          }
          
          console.log("✅ Adding new toast notification:", notification.id);
          return [...prev, notification];
        });
      };

      // IMPORTANT: Only register ONE set of callbacks
      webSocketService.onNotificationsChange(handleNotificationsChange);
      webSocketService.onToastNotification(handleToastNotification);

      // Initialize existing notifications
      const existingNotifications = webSocketService.getNotifications();
      console.log("Existing notifications:", existingNotifications);
      setNotifications(existingNotifications);

      // Cleanup on unmount
      return () => {
        console.log("🧹 Cleaning up WebSocket listeners");
        webSocketService.removeNotificationsListener(handleNotificationsChange);
        webSocketService.removeToastListener(handleToastNotification);
      };
    } else {
      console.log("No user found, not connecting WebSocket");
    }
  }, [user]);

  const handleSuggestionClick = (suggestion: ProjectSuggestion) => {
    setSearchQuery("");
    setShowSearchSuggestions(false);
    // Navigate to project details page
    navigate(`/projects/${suggestion.project_id}`);
  };

  // Remove toast notification after it's closed
  const handleToastClose = (notificationId: string) => {
    console.log("🗑️ Removing toast notification:", notificationId);
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    webSocketService.markAsRead(notificationId);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    webSocketService.markAllAsRead();
  };

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'idatagenerator_project_created':
        return 'heroicons:folder-plus';
      case 'idatagenerator_test_case_created':
        return 'heroicons:document-plus';
      case 'idatagenerator_mdd_processing_start':
      case 'idatagenerator_test_case_processing_start':
        return 'heroicons:play-circle';
      case 'idatagenerator_mdd_processing_update':
      case 'idatagenerator_data_generation_progress':
        return 'heroicons:arrow-path';
      case 'idatagenerator_mdd_processed':
      case 'idatagenerator_test_case_completed':
      case 'idatagenerator_respondent_completed':
        return 'heroicons:check-circle';
      case 'idatagenerator_error':
        return 'heroicons:exclamation-triangle';
      default:
        return 'heroicons:bell';
    }
  };

  // Get notification icon color
  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'idatagenerator_project_created':
      case 'idatagenerator_mdd_processed':
      case 'idatagenerator_test_case_completed':
      case 'idatagenerator_respondent_completed':
        return 'text-green-500';
      case 'idatagenerator_test_case_created':
      case 'idatagenerator_mdd_processing_update':
      case 'idatagenerator_data_generation_progress':
        return 'text-blue-500';
      case 'idatagenerator_mdd_processing_start':
      case 'idatagenerator_test_case_processing_start':
        return 'text-yellow-500';
      case 'idatagenerator_error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center flex-shrink-0">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
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
                      className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 px-3 py-2 font-medium"
                    >
                      <Icon icon="heroicons:bars-3" className="w-5 h-5" />
                      {/* <span>Navigation</span> */}
                      {/* <Icon icon="heroicons:chevron-down" className="w-4 h-4" /> */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-white border border-slate-200 rounded-lg shadow-lg"
                    align="start"
                  >
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className={
                          item.active
                            ? "bg-blue-50 text-blue-700 border-l-3 border-blue-500"
                            : "hover:bg-slate-50"
                        }
                      >
                        <Link
                          to={item.href}
                          className="flex items-center w-full py-2 px-3"
                          onClick={() => setNavDropdownOpen(false)}
                        >
                          <Icon icon={item.icon} className="w-4 h-4 mr-3" />
                          <span className="font-medium">{item.label}</span>
                          {item.active && (
                            <Icon
                              icon="heroicons:check"
                              className="w-4 h-4 ml-auto text-blue-600"
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
                    setShowSearchSuggestions(e.target.value.length >= 2);
                  }}
                  onFocus={() =>
                    setShowSearchSuggestions(searchQuery.length >= 2)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSearchSuggestions(false), 200)
                  }
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />

                {/* Search Suggestions */}
                {showSearchSuggestions && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
                    <Command>
                      <CommandList className="max-h-64">
                        {isLoadingSuggestions ? (
                          <div className="text-center py-4">
                            <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin mx-auto text-slate-400" />
                            <p className="text-sm text-slate-500 mt-2">Searching...</p>
                          </div>
                        ) : projectSuggestions.length === 0 ? (
                          <CommandEmpty className="text-center py-4 text-slate-500">
                            No projects found.
                          </CommandEmpty>
                        ) : (
                          <CommandGroup heading="Projects">
                            {projectSuggestions.map((project) => (
                              <CommandItem
                                key={project.project_id}
                                onSelect={() => handleSuggestionClick(project)}
                                className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50 p-2"
                              >
                                <Icon
                                  icon="heroicons:folder"
                                  className="w-4 h-4 text-slate-400"
                                />
                                <div className="flex flex-col flex-1">
                                  <span className="font-medium text-slate-900">
                                    {project.project_name}
                                  </span>
                                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                                    <span>ID: {project.project_id.slice(0, 8)}...</span>
                                    <span>•</span>
                                    <span>Created: {formatDate(project.project_created)}</span>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
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
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-96 bg-white border border-slate-200 rounded-lg shadow-lg z-50"
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
                          {unreadCount} unread notifications
                        </span>
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-blue-600 text-sm hover:text-blue-800"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <Icon 
                                  icon={getNotificationIcon(notification.type)}
                                  className={`w-5 h-5 ${getNotificationIconColor(notification.type)}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-slate-900">
                                    {notification.title}
                                  </p>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-slate-500">
                                    {formatNotificationTime(notification.timestamp)}
                                  </p>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {notification.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Icon icon="heroicons:bell-slash" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                        </div>
                      )}
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
                      <AvatarImage src="/avatars/01.png" alt={user?.username || "User"} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-white border-slate-200"
                  align="end"
                  forceMount
                >
                  {/* Profile and Settings tabs disabled */}
                  {/* 
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
                  */}
                  <DropdownMenuItem 
                    className="text-slate-700 hover:text-slate-900 cursor-pointer"
                    onClick={handleLogout}
                  >
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
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
          style={{ textAlign: "left" }}
        >
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
                href="https://ipsos-dsc.github.io/idatagenerator/"
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
                target="_blank"
              >
                Documentation
              </a>
              <a
                href="mailto:ajit.yadav2@ipsos.com"
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

      {/* SINGLE Toast Notifications Container - Only one in entire app */}
      {toastNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
          <div className="pointer-events-auto space-y-2">
            {toastNotifications.map((notification) => (
              <ToastNotification
                key={notification.id}
                notification={notification}
                onClose={() => handleToastClose(notification.id)}
                duration={5000}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}