import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { HierarchicalProjectsTable } from "../components/survey-dashboard/HierarchicalProjectsTable";
import { ExecutionModal } from "../components/survey-dashboard/ExecutionModal";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Icon } from "@iconify/react";
import { projectApi, ProjectHierarchy } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [projectData, setProjectData] = useState<ProjectHierarchy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // Fetch from hierarchy API and filter for specific project
      const response = await projectApi.getProjectsHierarchy(1, 1000);
      const project = response.projects_hierarchy.find(p => p.id === projectId);
      
      if (project) {
        setProjectData(project);
      } else {
        toast({
          title: "Project not found",
          description: "The requested project could not be found.",
          variant: "destructive",
        });
        navigate("/requests");
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
      toast({
        title: "Error",
        description: "Failed to load project details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExecution = (requestId: string) => {
    setActiveRequestId(requestId);
    setShowExecutionModal(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_for_test_cases":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-500">Loading project details...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!projectData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Project not found</h3>
          <p className="text-gray-500 mb-4">The requested project could not be found.</p>
          <Button onClick={() => navigate("/requests")} className="bg-blue-600 hover:bg-blue-700">
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/requests")}
              className="flex items-center gap-2"
            >
              <Icon icon="heroicons:arrow-left" className="w-4 h-4" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                {projectData.project_name}
              </h1>
              <p className="text-slate-600">
                Project ID: <span className="font-mono text-blue-600">{projectData.id}</span>
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(projectData.status)}>
            {projectData.status_display}
          </Badge>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:beaker" className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Test Cases</p>
                <p className="text-lg font-semibold text-gray-900">
                  {projectData.test_cases_summary.completed_test_cases}/{projectData.test_cases_summary.total_test_cases}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:chart-bar" className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Respondents</p>
                <p className="text-lg font-semibold text-gray-900">
                  {projectData.test_cases.reduce((sum, tc) => sum + tc.respondents_summary.total_respondents, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:document-text" className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">MDD Variables</p>
                <p className="text-lg font-semibold text-gray-900">
                  {projectData.mdd_processing?.variables_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:clock" className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Processing Time</p>
                <p className="text-lg font-semibold text-gray-900">{projectData.processing_duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Case Type</label>
                <p className="text-sm text-gray-900">{projectData.case_type_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Region</label>
                <p className="text-sm text-gray-900">{projectData.region_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created By</label>
                <p className="text-sm text-gray-900">{projectData.created_by}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created Date</label>
                <p className="text-sm text-gray-900">{formatDate(projectData.created_at)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Survey Link</label>
              <p className="text-sm text-blue-600 break-all">{projectData.default_project_link}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Default Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Device Type</label>
              <p className="text-sm text-gray-900 capitalize">{projectData.default_settings.device_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Completes</label>
              <p className="text-sm text-gray-900">{projectData.default_settings.number_of_completes}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Screenshots</label>
              <p className="text-sm text-gray-900">
                {projectData.default_settings.generate_screenshot ? "Enabled" : "Disabled"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MDD Information */}
      {projectData.mdd_processing && (
        <Card className="border-slate-200 mb-6">
          <CardHeader>
            <CardTitle>MDD Processing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Filename</label>
                <p className="text-sm text-gray-900">{projectData.mdd_processing.filename}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">File Size</label>
                <p className="text-sm text-gray-900">{projectData.mdd_processing.file_size_mb} MB</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Processing Duration</label>
                <p className="text-sm text-gray-900">{projectData.mdd_processing.processing_duration}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Variables Count</label>
                <p className="text-sm text-gray-900">{projectData.mdd_processing.variables_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hierarchical Table - Single Project View */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50 py-4">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Project Details - {projectData.project_name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          <HierarchicalProjectsTable
            onOpenExecution={handleOpenExecution}
            showFavoritesOnly={false}
            projectsData={[projectData]} // Pass only this project
            singleProjectView={true}
          />
        </CardContent>
      </Card>

      {/* Execution Modal */}
      <ExecutionModal
        isOpen={showExecutionModal}
        requestId={activeRequestId}
        onClose={() => setShowExecutionModal(false)}
      />
    </DashboardLayout>
  );
}
