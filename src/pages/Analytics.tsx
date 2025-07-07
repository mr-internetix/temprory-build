import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
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
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";

export default function Analytics() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const recentActivity = [
    {
      id: 1,
      type: "success",
      message: "Batch processing completed for s25021874",
      time: "5 minutes ago",
    },
    {
      id: 2,
      type: "warning",
      message: "High response time detected for Q1None test case",
      time: "12 minutes ago",
    },
    {
      id: 3,
      type: "error",
      message: "Failed to process 3 requests in s25022909",
      time: "25 minutes ago",
    },
    {
      id: 4,
      type: "info",
      message: "New MDD file uploaded and processed",
      time: "1 hour ago",
    },
    {
      id: 5,
      type: "success",
      message: "Q1AllQ2None test case completed successfully",
      time: "2 hours ago",
    },
  ];

  const topTestCases = [
    {
      name: "Skipscreener",
      requests: 124,
      successRate: 94,
      color: "bg-emerald-100 text-emerald-800",
    },
    {
      name: "Q1None",
      requests: 89,
      successRate: 87,
      color: "bg-blue-100 text-blue-800",
    },
    {
      name: "Q1AllQ2None",
      requests: 76,
      successRate: 92,
      color: "bg-purple-100 text-purple-800",
    },
    {
      name: "BrandAwareness",
      requests: 45,
      successRate: 89,
      color: "bg-orange-100 text-orange-800",
    },
    {
      name: "CustomerSatisfaction",
      requests: 32,
      successRate: 96,
      color: "bg-pink-100 text-pink-800",
    },
  ];

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      success: "bg-green-100 text-green-600",
      warning: "bg-yellow-100 text-yellow-600",
      error: "bg-red-100 text-red-600",
      info: "bg-blue-100 text-blue-600",
    };
    return colors[type] || "bg-gray-100 text-gray-600";
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      success: "heroicons:check-circle",
      warning: "heroicons:exclamation-triangle",
      error: "heroicons:x-circle",
      info: "heroicons:information-circle",
    };
    const iconName = icons[type] || "heroicons:information-circle";
    return <Icon icon={iconName} className="w-4 h-4" />;
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-2 text-gray-600">
              Monitor performance and insights for your survey test requests
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Select
              value={selectedTimeRange}
              onValueChange={setSelectedTimeRange}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="12m">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-green-600">87.3%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon
                  icon="heroicons:chart-bar-square"
                  className="w-6 h-6 text-green-600"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ↗ +2.1% from last week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg. Completion Time
                </p>
                <p className="text-2xl font-bold text-blue-600">4.2min</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon
                  icon="heroicons:clock"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ↘ -0.8min from last week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Responses
                </p>
                <p className="text-2xl font-bold text-purple-600">1,247</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon
                  icon="heroicons:users"
                  className="w-6 h-6 text-purple-600"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ↗ +156 from last week
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Error Rate</p>
                <p className="text-2xl font-bold text-red-600">2.1%</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Icon
                  icon="heroicons:x-circle"
                  className="w-6 h-6 text-red-600"
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                ↘ -0.5% from last week
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Request Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Request Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <Icon
                  icon="heroicons:chart-bar"
                  className="w-12 h-12 mx-auto mb-2"
                />
                <p>Chart visualization would go here</p>
                <p className="text-sm">Request volume over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <Icon
                  icon="heroicons:chart-pie"
                  className="w-12 h-12 mx-auto mb-2"
                />
                <p>Pie chart would go here</p>
                <p className="text-sm">Request status breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Top Test Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(
                      activity.type,
                    )}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle>Top Test Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topTestCases.map((testCase) => (
                <div
                  key={testCase.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className={testCase.color}>{testCase.name}</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {testCase.requests} requests
                    </p>
                    <p className="text-xs text-gray-500">
                      {testCase.successRate}% success
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
