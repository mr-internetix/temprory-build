import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Icon } from "@iconify/react";

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Request Completed",
      message:
        "Survey request s25021874 has completed successfully with 247 responses.",
      time: "2 minutes ago",
      read: false,
      priority: "normal",
    },
    {
      id: 2,
      type: "warning",
      title: "High Response Time",
      message:
        "Request s25022909 is experiencing slower than usual response times. Current average: 4.8 seconds.",
      time: "15 minutes ago",
      read: false,
      priority: "medium",
    },
    {
      id: 3,
      type: "error",
      title: "Request Failed",
      message:
        "Survey request s25023001 failed due to invalid MDD file structure. Please review and resubmit.",
      time: "1 hour ago",
      read: true,
      priority: "high",
    },
    {
      id: 4,
      type: "info",
      title: "MDD File Uploaded",
      message:
        "New MDD file 'customer_survey_v2.mdd' has been successfully uploaded and processed.",
      time: "2 hours ago",
      read: true,
      priority: "normal",
    },
    {
      id: 5,
      type: "success",
      title: "System Update",
      message:
        "iDataGenerator has been updated to version 2.4.1 with improved performance and new features.",
      time: "1 day ago",
      read: true,
      priority: "normal",
    },
    {
      id: 6,
      type: "warning",
      title: "Storage Limit Warning",
      message:
        "Your account is approaching the storage limit (87% used). Consider archiving old requests.",
      time: "2 days ago",
      read: false,
      priority: "medium",
    },
  ]);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      success: "heroicons:check-circle",
      warning: "heroicons:exclamation-triangle",
      error: "heroicons:x-circle",
      info: "heroicons:information-circle",
    };
    return icons[type] || "heroicons:information-circle";
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-600 border-green-200",
      warning: "bg-yellow-100 text-yellow-600 border-yellow-200",
      error: "bg-red-100 text-red-600 border-red-200",
      info: "bg-blue-100 text-blue-600 border-blue-200",
    };
    return colors[type] || "bg-gray-100 text-gray-600 border-gray-200";
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      normal: "bg-gray-100 text-gray-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600">
              Stay updated with your survey requests and system alerts
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Button
              onClick={markAllAsRead}
              variant="outline"
              disabled={unreadCount === 0}
            >
              <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Badge variant="secondary" className="px-3 py-2">
              {unreadCount} unread
            </Badge>
          </div>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="heroicons:bell" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon
                  icon="heroicons:envelope"
                  className="w-6 h-6 text-red-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unreadCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon
                  icon="heroicons:exclamation-triangle"
                  className="w-6 h-6 text-yellow-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  High Priority
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {notifications.filter((n) => n.priority === "high").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Filter</p>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="unread">Unread Only</SelectItem>
                    <SelectItem value="read">Read Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "all" && "All Notifications"}
            {filter === "unread" && "Unread Notifications"}
            {filter === "read" && "Read Notifications"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border-l-4 ${getNotificationColor(
                  notification.type,
                )} ${!notification.read ? "bg-blue-50" : "bg-white"}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getNotificationColor(
                        notification.type,
                      )}`}
                    >
                      <Icon
                        icon={getNotificationIcon(notification.type)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            !notification.read
                              ? "text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <Badge
                          className={getPriorityBadge(notification.priority)}
                        >
                          {notification.priority}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Icon icon="heroicons:check" className="w-3 h-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon icon="heroicons:trash" className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Icon
                  icon="heroicons:bell-slash"
                  className="w-12 h-12 text-gray-400 mx-auto mb-4"
                />
                <p className="text-gray-500">
                  {filter === "unread"
                    ? "No unread notifications"
                    : filter === "read"
                      ? "No read notifications"
                      : "No notifications found"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
