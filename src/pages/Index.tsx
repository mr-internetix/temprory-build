import React, { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { projectApi, Activity, ProjectHierarchy } from "../lib/api";

export default function Index() {
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // Single modal state
  const [activeRequestId, setActiveRequestId] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [projectsData, setProjectsData] = useState<ProjectHierarchy[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsSummary, setProjectsSummary] = useState({
    total_projects: 0,
    projects_with_test_cases: 0,
    total_test_cases: 0
  });

  const handleCreateSubmit = (data: any) => {
    console.log("Creating request:", data);
    setShowCreateModal(false);
    // Handle the form submission here
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

  // Fetch recent activities
  useEffect(() => {
    const fetchRecentActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await projectApi.getActivities(1, 5); // Get first 5 activities
        setRecentActivities(response.activities);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchRecentActivities();
  }, []);

  // Fetch projects hierarchy
  useEffect(() => {
    const fetchProjectsHierarchy = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await projectApi.getProjectsHierarchy(1, 10); // Get first 10 projects
        setProjectsData(response.projects_hierarchy);
        setProjectsSummary(response.summary);
      } catch (error) {
        console.error("Error fetching projects hierarchy:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjectsHierarchy();
  }, []);

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      project_created: "bg-emerald-50 text-emerald-600 border-emerald-100",
      testcase_created: "bg-blue-50 text-blue-600 border-blue-100",
      project_archived: "bg-amber-50 text-amber-600 border-amber-100",
      project_updated: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return colors[type] || "bg-slate-50 text-slate-600 border-slate-100";
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      project_created: "heroicons:plus",
      testcase_created: "heroicons:document-plus",
      project_archived: "heroicons:archive-box",
      project_updated: "heroicons:pencil",
    };
    return icons[type] || "heroicons:document-text";
  };

  const handleActivityClick = (activity: Activity) => {
    // Navigate based on activity type
    if (activity.project?.id) {
      window.location.href = `/projects/${activity.project.id}`;
    }
  };

  const handleProjectClick = (projectId: string) => {
    window.location.href = `/projects/${projectId}`;
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

  // Helper functions for projects display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    } catch {
      return "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: "bg-green-100 text-green-800",
      ready_for_test_cases: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-purple-100 text-purple-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getCaseTypeColor = (caseType: number) => {
    return caseType === 1 
      ? "bg-purple-100 text-purple-800" 
      : "bg-blue-100 text-blue-800";
  };

  // Filter projects based on search term
  const filteredProjects = projectsData.filter((project) => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      project.project_name.toLowerCase().includes(searchLower) ||
      project.created_by.toLowerCase().includes(searchLower) ||
      project.case_type_display.toLowerCase().includes(searchLower) ||
      project.test_cases.some(tc => tc.test_case_name.toLowerCase().includes(searchLower))
    );
  });

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
              onClick={() => setShowCreateModal(true)}
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
              onClick={() => setShowCreateModal(true)}
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
                {recentActivities.length} new
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <Icon icon="heroicons:arrow-path" className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading activities...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.slice(0, 3).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border ${getActivityColor(
                        activity.activity_type,
                      )}`}
                    >
                      <Icon
                        icon={getActivityIcon(activity.activity_type)}
                        className="w-3 h-3"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 font-medium leading-tight">
                        {activity.title}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-slate-500">{activity.time_ago}</p>
                        <p className="text-xs text-slate-600">{activity.username}</p>
                      </div>
                      {activity.project && (
                        <p className="text-xs text-slate-400 truncate mt-1">
                          Project: {activity.project.name}
                          {activity.project.archived && (
                            <span className="ml-1 text-amber-600">(Archived)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => window.location.href = "/activity"}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-xs py-2 border-t mt-3"
                >
                  View all activity →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projects & Requests Table - Updated */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 text-base">
              Recent Projects
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600">
                {projectsSummary.total_projects} projects • {projectsSummary.total_test_cases} test cases
              </div>
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading projects...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Project Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Case Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Test Cases
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Device
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      MDD Info
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Created By
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 cursor-pointer">
                      <td
                        className="px-3 py-2"
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div>
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            {project.project_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.region_display}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getCaseTypeColor(project.case_type)} text-xs`}>
                          {project.case_type === 1 ? "Completes Only" : "With Test Cases"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          {project.status_display}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="text-sm text-gray-900">
                          {project.test_cases_summary.completed_test_cases}/{project.test_cases_summary.total_test_cases}
                          {project.test_cases_summary.total_test_cases > 0 && (
                            <Icon icon="heroicons:check-circle" className="w-3 h-3 inline ml-1 text-green-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-600">
                        {project.default_settings.device_type}
                      </td>
                      <td className="px-3 py-2">
                        {project.mdd_processing ? (
                          <div className="text-xs">
                            <div className="text-gray-900 font-medium truncate max-w-24">
                              {project.mdd_processing.filename}
                            </div>
                            <div className="text-gray-500">
                              {project.mdd_processing.variables_count} vars
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No MDD</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {project.created_by}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">
                        {getTimeAgo(project.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredProjects.length === 0 && !isLoadingProjects && (
            <div className="text-center py-12">
              <Icon
                icon="heroicons:document-magnifying-glass"
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No projects match your search "${searchTerm}"`
                  : "There are no projects to display"}
              </p>
            </div>
          )}

          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {filteredProjects.length} of {projectsData.length} projects
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

      {/* Execution Modal */}
      {showExecutionModal && (
        <ExecutionModal 
          isOpen={showExecutionModal}
          requestId={activeRequestId}
          onClose={() => setShowExecutionModal(false)}
        />
      )}

      {/* Create Request Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  Create New Survey Request
                </DialogTitle>
                <p className="text-gray-600 mt-1">
                  Configure your survey testing parameters and generate test cases
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="heroicons:x-mark" className="w-6 h-6" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <SurveyForm 
              onSubmit={handleCreateSubmit} 
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}