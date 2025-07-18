import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { HierarchicalProjectsTable } from "../components/survey-dashboard/HierarchicalProjectsTable";
import { ExecutionModal } from "../components/survey-dashboard/ExecutionModal";
import { SurveyForm } from "../components/survey-dashboard/SurveyForm";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Icon } from "@iconify/react";
import { projectApi, ProjectHierarchy } from "../lib/api";

export default function RequestManagement() {
  const navigate = useNavigate();
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterTab, setFilterTab] = useState("all");
  // Load favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('project-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [projectsData, setProjectsData] = useState<ProjectHierarchy[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  // Helper function to get time ago - move this before it's used
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Just now";
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "1 day ago";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      return `${Math.floor(diffInDays / 7)} weeks ago`;
    } catch {
      return "Unknown";
    }
  };

  // Listen for global new request events
  React.useEffect(() => {
    const handleGlobalNewRequest = () => {
      setShowNewRequestModal(true);
    };

    window.addEventListener("openNewRequest", handleGlobalNewRequest);
    return () =>
      window.removeEventListener("openNewRequest", handleGlobalNewRequest);
  }, []);

  // Fetch projects hierarchy
  useEffect(() => {
    const fetchProjectsHierarchy = async () => {
      setIsLoadingProjects(true);
      try {
        const response = await projectApi.getProjectsHierarchy(1, 50); // Get more projects for management page
        setProjectsData(response.projects_hierarchy);
      } catch (error) {
        console.error("Error fetching projects hierarchy:", error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjectsHierarchy();
  }, []);

  // Transform API data to match expected format
  const projects = projectsData.map((project) => ({
    id: project.id,
    name: project.project_name,
    description: `${project.case_type_display} project in ${project.region_display}`,
    status: project.status === "ready_for_test_cases" ? "active" : 
             project.status === "completed" ? "completed" : 
             project.status === "pending" ? "paused" : "active",
    requests: project.test_cases_summary.total_test_cases,
    testCases: project.test_cases_summary.total_test_cases,
    lastActivity: getTimeAgo(project.created_at),
    progress: project.test_cases_summary.total_test_cases > 0 
      ? Math.round((project.test_cases_summary.completed_test_cases / project.test_cases_summary.total_test_cases) * 100)
      : 0,
    owner: project.created_by,
    team: `${project.case_type_display} Team`,
  }));

  const handleOpenExecution = (requestId: string) => {
    setActiveRequestId(requestId);
    setShowExecutionModal(true);
  };

  const handleSubmitRequest = (data: any) => {
    console.log("Submitting request:", data);
    setActiveRequestId("new-request-" + Date.now());
    setShowNewRequestModal(false);
    setShowExecutionModal(true);
  };

  const toggleFavorite = (projectId: string) => {
    setFavorites((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('project-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());

    switch (filterTab) {
      case "favorites":
        return matchesSearch && favorites.includes(project.id);
      case "active":
        return matchesSearch && project.status === "active";
      case "completed":
        return matchesSearch && project.status === "completed";
      case "paused":
        return matchesSearch && project.status === "paused";
      default:
        return matchesSearch;
    }
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Project Management
              </h1>
              <p className="mt-2 text-slate-600">
                Manage and monitor your testing projects and requests
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                onClick={() => setShowNewRequestModal(true)}
              >
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Projects Table */}
      <Card className="border border-slate-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-slate-50 py-4">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Projects Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-white">
          {isLoadingProjects ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading projects...</span>
            </div>
          ) : (
            <HierarchicalProjectsTable
              onOpenExecution={handleOpenExecution}
              showFavoritesOnly={filterTab === "favorites"}
              projectsData={projectsData}
            />
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProjects.length === 0 && !isLoadingProjects && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-12 text-center">
            <Icon
              icon="heroicons:folder-open"
              className="w-12 h-12 text-slate-400 mx-auto mb-4"
            />
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery
                ? `No projects match "${searchQuery}"`
                : "Get started by creating your first project"}
            </p>
            <Button
              onClick={() => setShowNewRequestModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}

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
              <SurveyForm onSubmit={handleSubmitRequest} />
            </div>
          </div>
        </div>
      )}

      {/* Execution Modal */}
      <ExecutionModal
        isOpen={showExecutionModal}
        requestId={activeRequestId}
        onClose={() => setShowExecutionModal(false)}
      />
    </DashboardLayout>
  );
}