import React, { useState } from "react";
import { RequestsTable } from "../components/survey-dashboard/RequestsTable";
import { ExecutionModal } from "../components/survey-dashboard/ExecutionModal";
import { SurveyForm } from "../components/survey-dashboard/SurveyForm";
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

export default function Index() {
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRequests, setExpandedRequests] = useState<string[]>([]);

  const handleSubmitRequest = (data: any) => {
    console.log("Submitting request:", data);
    setActiveRequestId("new-request-" + Date.now());
    setShowExecutionModal(true);
  };

  const handleOpenExecution = (requestId: string) => {
    setActiveRequestId(requestId);
    setShowExecutionModal(true);
  };

  const triggerFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mdd,.xml,.txt";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log("File selected:", file.name);
      }
    };
    input.click();
  };

  const stats = {
    totalRequests: 47,
    completed: 23,
    running: 12,
    failed: 3,
  };

  const recentActivity = [
    {
      id: 1,
      type: "added",
      message: "Request added for SID12345678 Testcase",
      time: "2 minutes ago",
      user: "Username234",
      sid: "s25021874",
      action: "added",
    },
    {
      id: 2,
      type: "duplicated",
      message: "Duplicated for Testcase1Term in SID12345699",
      time: "10 minutes ago",
      user: "Username124",
      sid: "s25000213",
      action: "duplicated",
    },
    {
      id: 3,
      type: "archived",
      message:
        "SID12345690 - TestCase2Screener Serial#58 moved to Archive folder",
      time: "25 minutes ago",
      user: "Username56",
      sid: "s25022909",
      action: "archived",
    },
    {
      id: 4,
      type: "renamed",
      message: "TestcaseScreener1 renamed to NewTestcaseName123",
      time: "30 minutes ago",
      user: "Username852",
      sid: "s25022909",
      action: "renamed",
    },
  ];

  const handleActivityClick = (sid: string) => {
    // Navigate to requests page and highlight the specific SID
    window.location.href = `/requests?highlight=${sid}`;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      added: "bg-emerald-50 text-emerald-600 border-emerald-100",
      duplicated: "bg-blue-50 text-blue-600 border-blue-100",
      archived: "bg-amber-50 text-amber-600 border-amber-100",
      renamed: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return colors[type] || "bg-slate-50 text-slate-600 border-slate-100";
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      added: "heroicons:plus",
      duplicated: "heroicons:document-duplicate",
      archived: "heroicons:archive-box",
      renamed: "heroicons:pencil",
    };
    return icons[type] || "heroicons:document-text";
  };

  // Dashboard requests data
  const dashboardRequests = [
    {
      id: "req-001",
      sid: "s25021874",
      projectName: "E-commerce Platform Testing",
      type: "Request",
      status: "completed",
      completes: "2 / 2",
      device: "Desktop",
      screenshot: "Yes",
      testCases: ["LoginFlow", "CheckoutProcess"],
      userName: "John Smith",
      lastUpdated: "2 hours ago",
      requestId: "1fbe8d61-C4bb-43da-8b85-044eb5e1bc32",
      createdDate: "2025-01-15 10:30:00",
      estimatedCompletion: "2025-01-16 14:00:00",
      surveyUrl: "https://survey.example.com/ecommerce",
      priority: "High",
      progressPercent: 100,
    },
    {
      id: "req-002",
      sid: "s25000213",
      projectName: "CRM System Validation",
      type: "Request",
      status: "running",
      completes: "1 / 3",
      device: "Mobile",
      screenshot: "Yes",
      testCases: ["UserRegistration", "DataValidation", "ReportGeneration"],
      userName: "Sarah Johnson",
      lastUpdated: "30 minutes ago",
      requestId: "30bf238a-Eb8a-4ed6-924d-435b75e0bd93",
      createdDate: "2025-01-15 14:20:00",
      estimatedCompletion: "2025-01-16 16:30:00",
      surveyUrl: "https://survey.example.com/crm",
      priority: "Medium",
      progressPercent: 33,
    },
    {
      id: "req-003",
      sid: "s25022909",
      projectName: "HR Portal Security Audit",
      type: "Project",
      status: "paused",
      completes: "0 / 5",
      device: "Desktop",
      screenshot: "No",
      testCases: [
        "SecurityScan",
        "AccessControl",
        "DataProtection",
        "AuditLog",
        "ComplianceCheck",
      ],
      userName: "Michael Brown",
      lastUpdated: "1 hour ago",
      requestId: "72fc065f-Fc45-48fd-9590-Bd8508dc2a2d",
      createdDate: "2025-01-14 09:15:00",
      estimatedCompletion: "2025-01-17 12:00:00",
      surveyUrl: "https://survey.example.com/hr-portal",
      priority: "High",
      progressPercent: 0,
    },
    {
      id: "req-004",
      sid: "REQ-12389",
      projectName: "API Security Validation",
      type: "Request",
      status: "completed",
      completes: "1250 / 1250",
      device: "Server",
      screenshot: "No",
      testCases: ["APIAuthentication", "DataEncryption"],
      userName: "Emily Davis",
      lastUpdated: "3 hours ago",
      requestId: "api-security-1234567890",
      createdDate: "2025-01-14 11:45:00",
      estimatedCompletion: "2025-01-15 15:00:00",
      surveyUrl: "https://api.example.com/security",
      priority: "Critical",
      progressPercent: 100,
    },
    {
      id: "req-005",
      sid: "REQ-12388",
      projectName: "User Authentication Flow",
      type: "Request",
      status: "failed",
      completes: "0 / 2",
      device: "Mobile",
      screenshot: "Yes",
      testCases: ["BiometricAuth", "TwoFactorAuth"],
      userName: "David Wilson",
      lastUpdated: "4 hours ago",
      requestId: "auth-flow-9876543210",
      createdDate: "2025-01-14 08:30:00",
      estimatedCompletion: "2025-01-15 18:00:00",
      surveyUrl: "https://auth.example.com/flow",
      priority: "Medium",
      progressPercent: 15,
    },
  ];

  const filteredRequests = dashboardRequests.filter((request) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.sid.toLowerCase().includes(searchLower) ||
      request.projectName.toLowerCase().includes(searchLower) ||
      request.userName.toLowerCase().includes(searchLower) ||
      request.testCases.some((tc) => tc.toLowerCase().includes(searchLower))
    );
  });

  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId],
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      running: "bg-blue-100 text-blue-800",
      paused: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      queued: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Monitor and manage your survey test data generation requests
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Quick Actions */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
            <CardTitle className="text-slate-800 text-base">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <Button
              onClick={() => setShowNewRequestModal(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9"
            >
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              New Request
            </Button>
            <Button
              onClick={() => (window.location.href = "/archive")}
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 h-9"
            >
              <Icon icon="heroicons:archive-box" className="w-4 h-4 mr-2" />
              View Archive
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-blue-600 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-base">
                Recent Activity
              </CardTitle>
              <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-medium">
                4 new
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                  onClick={() => handleActivityClick(activity.sid)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border ${getActivityColor(
                      activity.type,
                    )}`}
                  >
                    <Icon
                      icon={getActivityIcon(activity.type)}
                      className="w-3 h-3"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 font-medium leading-tight">
                      {activity.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-500">{activity.time}</p>
                      <p className="text-xs text-slate-600">{activity.user}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => window.open("/activity", "_blank")}
                className="w-full text-center text-blue-600 hover:text-blue-800 text-xs py-2 border-t mt-3"
              >
                View all activity →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects & Requests Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 text-base">
              Recent Requests
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    SID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PROJECT/REQUEST NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TYPE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COMPLETES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DEVICE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SCREENSHOT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TEST CASES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    USER NAME
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LAST UPDATED
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr className="hover:bg-gray-50 cursor-pointer">
                      <td
                        className="px-4 py-3 whitespace-nowrap font-mono text-sm font-medium"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Icon
                            icon={
                              expandedRequests.includes(request.id)
                                ? "heroicons:chevron-down"
                                : "heroicons:chevron-right"
                            }
                            className="w-4 h-4"
                          />
                          {request.sid}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.projectName}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        <Badge
                          className={`${
                            request.type === "Project"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          } text-xs`}
                        >
                          {request.type}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        <Badge
                          className={`${getStatusColor(request.status)} text-xs`}
                        >
                          {request.status}
                        </Badge>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.completes}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.device}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.screenshot}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        <div className="flex flex-wrap gap-1">
                          {request.testCases
                            .slice(0, 2)
                            .map((testCase, idx) => (
                              <Badge
                                key={idx}
                                className="text-green-600 bg-green-50 text-xs"
                              >
                                {testCase}
                              </Badge>
                            ))}
                          {request.testCases.length > 2 && (
                            <Badge className="text-gray-600 bg-gray-50 text-xs">
                              +{request.testCases.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.userName}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                        onClick={() => toggleRequestExpansion(request.id)}
                      >
                        {request.lastUpdated}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenExecution(request.id)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Icon
                            icon="heroicons:ellipsis-horizontal"
                            className="w-4 h-4"
                          />
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded Detail Row */}
                    {expandedRequests.includes(request.id) && (
                      <tr>
                        <td colSpan={11} className="px-0 py-0">
                          <div className="bg-gray-50 border-t border-gray-200">
                            <div className="p-4">
                              <h4 className="font-medium text-gray-900 mb-3">
                                Request Details for {request.sid}
                              </h4>
                              <div className="bg-white rounded border overflow-hidden">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Request ID
                                    </label>
                                    <p className="text-sm font-mono text-blue-600">
                                      {request.requestId}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Created Date
                                    </label>
                                    <p className="text-sm text-gray-900">
                                      {request.createdDate}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Estimated Completion
                                    </label>
                                    <p className="text-sm text-gray-900">
                                      {request.estimatedCompletion}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Survey URL
                                    </label>
                                    <p className="text-sm text-blue-600 truncate">
                                      {request.surveyUrl}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Priority
                                    </label>
                                    <Badge
                                      className={`${
                                        request.priority === "High" ||
                                        request.priority === "Critical"
                                          ? "bg-red-100 text-red-800"
                                          : request.priority === "Medium"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                      } text-xs`}
                                    >
                                      {request.priority}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Progress
                                    </label>
                                    <div className="flex items-center gap-2">
                                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-blue-600 h-1.5 rounded-full"
                                          style={{
                                            width: `${request.progressPercent}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-600">
                                        {request.progressPercent}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Icon
                icon="heroicons:document-magnifying-glass"
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No requests match your search "${searchTerm}"`
                  : "There are no requests to display"}
              </p>
            </div>
          )}

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredRequests.length} of {dashboardRequests.length}{" "}
                total requests
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800">
                  Create New Request
                </h2>
                <Button
                  onClick={() => setShowNewRequestModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-500 hover:text-slate-700"
                >
                  <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <SurveyForm
                onSubmit={(data) => {
                  handleSubmitRequest(data);
                  setShowNewRequestModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      {showExecutionModal && (
        <ExecutionModal
          requestId={activeRequestId}
          onClose={() => setShowExecutionModal(false)}
        />
      )}
    </DashboardLayout>
  );
}
