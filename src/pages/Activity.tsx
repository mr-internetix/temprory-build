import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Icon } from "@iconify/react";

interface ActivityItem {
  id: string;
  type: "request" | "system" | "user" | "project";
  action: string;
  description: string;
  user: string;
  timestamp: string;
  metadata?: {
    projectName?: string;
    requestId?: string;
    status?: string;
    priority?: string;
  };
}

export default function Activity() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Sample activity data
  const activities: ActivityItem[] = [
    {
      id: "act-001",
      type: "request",
      action: "Request Created",
      description: "New survey request created for E-commerce Platform Testing",
      user: "John Smith",
      timestamp: "2025-01-20 14:30:00",
      metadata: {
        projectName: "E-commerce Platform Testing",
        requestId: "req-001",
        priority: "High",
      },
    },
    {
      id: "act-002",
      type: "system",
      action: "Test Execution Completed",
      description: "Automated test execution completed successfully",
      user: "System",
      timestamp: "2025-01-20 13:45:00",
      metadata: {
        requestId: "req-001",
        status: "completed",
      },
    },
    {
      id: "act-003",
      type: "user",
      action: "User Login",
      description: "User logged into the system",
      user: "Sarah Johnson",
      timestamp: "2025-01-20 13:15:00",
    },
    {
      id: "act-004",
      type: "request",
      action: "Request Updated",
      description: "Survey request status updated to In Progress",
      user: "Michael Brown",
      timestamp: "2025-01-20 12:30:00",
      metadata: {
        projectName: "Mobile App Usability Study",
        requestId: "req-002",
        status: "in-progress",
      },
    },
    {
      id: "act-005",
      type: "project",
      action: "Project Archived",
      description: "Project moved to archive",
      user: "Emily Davis",
      timestamp: "2025-01-20 11:20:00",
      metadata: {
        projectName: "Legacy Survey Analysis",
      },
    },
    {
      id: "act-006",
      type: "system",
      action: "Database Backup",
      description: "Automated database backup completed",
      user: "System",
      timestamp: "2025-01-20 10:00:00",
    },
    {
      id: "act-007",
      type: "request",
      action: "Request Deleted",
      description: "Survey request was permanently deleted",
      user: "David Wilson",
      timestamp: "2025-01-20 09:45:00",
      metadata: {
        requestId: "req-003",
      },
    },
    {
      id: "act-008",
      type: "user",
      action: "Profile Updated",
      description: "User profile information updated",
      user: "John Smith",
      timestamp: "2025-01-20 09:15:00",
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "request":
        return "heroicons:clipboard-document-list";
      case "system":
        return "heroicons:cog-6-tooth";
      case "user":
        return "heroicons:user";
      case "project":
        return "heroicons:folder";
      default:
        return "heroicons:information-circle";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "request":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "system":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "user":
        return "bg-green-100 text-green-700 border-green-200";
      case "project":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activity.metadata?.projectName &&
        activity.metadata.projectName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === "all" || activity.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const filterOptions = [
    { value: "all", label: "All Activity", icon: "heroicons:list-bullet" },
    {
      value: "request",
      label: "Requests",
      icon: "heroicons:clipboard-document-list",
    },
    { value: "system", label: "System", icon: "heroicons:cog-6-tooth" },
    { value: "user", label: "Users", icon: "heroicons:user" },
    { value: "project", label: "Projects", icon: "heroicons:folder" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Activity Feed</h1>
            <p className="text-slate-600 mt-1">
              Track all system activities and user actions
            </p>
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <Icon icon="heroicons:arrow-path" className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      filterType === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setFilterType(option.value)}
                    className="flex items-center gap-2"
                  >
                    <Icon icon={option.icon} className="w-4 h-4" />
                    {option.label}
                  </Button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons:clock" className="w-5 h-5" />
              Recent Activity ({filteredActivities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  icon="heroicons:exclamation-circle"
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Activities Found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "No activities match the selected filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      index === 0
                        ? "bg-blue-50 border-blue-200"
                        : "bg-gray-50 border-gray-200"
                    } hover:shadow-sm transition-shadow`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(activity.type)} border`}
                    >
                      <Icon
                        icon={getTypeIcon(activity.type)}
                        className="w-5 h-5"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-slate-900">
                              {activity.action}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-sm mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Icon icon="heroicons:user" className="w-3 h-3" />
                              {activity.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon
                                icon="heroicons:clock"
                                className="w-3 h-3"
                              />
                              {getRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-slate-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="flex flex-wrap gap-2">
                            {activity.metadata.projectName && (
                              <Badge variant="secondary" className="text-xs">
                                <Icon
                                  icon="heroicons:folder"
                                  className="w-3 h-3 mr-1"
                                />
                                {activity.metadata.projectName}
                              </Badge>
                            )}
                            {activity.metadata.requestId && (
                              <Badge variant="secondary" className="text-xs">
                                <Icon
                                  icon="heroicons:hashtag"
                                  className="w-3 h-3 mr-1"
                                />
                                {activity.metadata.requestId}
                              </Badge>
                            )}
                            {activity.metadata.status && (
                              <Badge
                                variant={
                                  activity.metadata.status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {activity.metadata.status}
                              </Badge>
                            )}
                            {activity.metadata.priority && (
                              <Badge
                                variant={
                                  activity.metadata.priority === "High"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {activity.metadata.priority} Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More */}
        {filteredActivities.length > 0 && (
          <div className="text-center">
            <Button variant="outline" className="w-full sm:w-auto">
              <Icon icon="heroicons:arrow-down" className="w-4 h-4 mr-2" />
              Load More Activities
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
