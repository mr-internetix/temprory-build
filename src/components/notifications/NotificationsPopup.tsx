import React, { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Icon } from "@iconify/react";

interface NotificationsPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsPopup({
  open,
  onOpenChange,
}: NotificationsPopupProps) {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Request Completed",
      message:
        "Survey request s25021874 completed successfully with 247 responses.",
      time: "2 min",
      read: false,
      priority: "normal",
    },
    {
      id: 2,
      type: "warning",
      title: "High Response Time",
      message: "Request s25022909 experiencing slower response times.",
      time: "15 min",
      read: false,
      priority: "medium",
    },
    {
      id: 3,
      type: "error",
      title: "Request Failed",
      message: "Survey request s25023001 failed due to invalid MDD structure.",
      time: "1h",
      read: true,
      priority: "high",
    },
    {
      id: 4,
      type: "info",
      title: "MDD File Uploaded",
      message: "New MDD file successfully uploaded and processed.",
      time: "2h",
      read: true,
      priority: "normal",
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
      success: "text-emerald-600",
      warning: "text-amber-600",
      error: "text-rose-600",
      info: "text-blue-600",
    };
    return colors[type] || "text-slate-600";
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return "bg-white";

    const colors: Record<string, string> = {
      success: "bg-emerald-50/50",
      warning: "bg-amber-50/50",
      error: "bg-rose-50/50",
      info: "bg-blue-50/50",
    };
    return colors[type] || "bg-slate-50/50";
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[500px] p-0 bg-white border-slate-200 shadow-lg">
        {/* Header */}
        <DialogHeader className="px-3 py-2 border-b border-slate-100 bg-slate-50/50 pr-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-800">
                Notifications
              </DialogTitle>
              {unreadCount > 0 && (
                <Badge className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Actions and Filter */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              disabled={unreadCount === 0}
              className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700"
            >
              <Icon icon="heroicons:check" className="w-3 h-3 mr-1" />
              Mark All Read
            </Button>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full h-7 text-xs border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({notifications.length})</SelectItem>
              <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
              <SelectItem value="read">
                Read ({notifications.length - unreadCount})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          <div className="space-y-1 p-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded-md border-l-2 transition-all ${getBgColor(notification.type, notification.read)} border-l-slate-200 hover:bg-slate-50`}
              >
                <div className="flex items-start gap-2">
                  {/* Icon */}
                  <div
                    className={`mt-0.5 ${getNotificationColor(notification.type)}`}
                  >
                    <Icon
                      icon={getNotificationIcon(notification.type)}
                      className="w-3 h-3"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <h4
                        className={`text-xs font-medium truncate ${!notification.read ? "text-slate-900" : "text-slate-700"}`}
                      >
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {notification.time}
                      </span>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="h-5 px-1 text-xs text-slate-500 hover:text-emerald-600"
                          >
                            <Icon icon="heroicons:check" className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-5 px-1 text-xs text-slate-400 hover:text-rose-600"
                        >
                          <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-6">
                <Icon
                  icon="heroicons:bell-slash"
                  className="w-8 h-8 text-slate-400 mx-auto mb-2"
                />
                <p className="text-xs text-slate-500">
                  {filter === "unread"
                    ? "No unread notifications"
                    : filter === "read"
                      ? "No read notifications"
                      : "No notifications"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
