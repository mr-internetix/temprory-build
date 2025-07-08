import React, { useState } from "react";
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

export default function RequestManagement() {
  const navigate = useNavigate();
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterTab, setFilterTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([
    "s25021874",
    "s25022909",
  ]);

  // Listen for global new request events
  React.useEffect(() => {
    const handleGlobalNewRequest = () => {
      setShowNewRequestModal(true);
    };

    window.addEventListener("openNewRequest", handleGlobalNewRequest);
    return () =>
      window.removeEventListener("openNewRequest", handleGlobalNewRequest);
  }, []);

  // Mock projects data
  const projects = [
    {
      id: "s25021874",
      name: "E-commerce Platform",
      description:
        "Comprehensive testing suite for e-commerce platform functionality",
      status: "active",
      requests: 12,
      testCases: 24,
      lastActivity: "2 hours ago",
      progress: 75,
      owner: "John Doe",
      team: "QA Team Alpha",
    },
    {
      id: "s25000213",
      name: "CRM System",
      description:
        "Customer relationship management system testing and validation",
      status: "completed",
      requests: 8,
      testCases: 16,
      lastActivity: "1 day ago",
      progress: 100,
      owner: "Jane Smith",
      team: "QA Team Beta",
    },
    {
      id: "s25022909",
      name: "HR Portal",
      description:
        "Human resources portal testing including user management and workflows",
      status: "active",
      requests: 15,
      testCases: 32,
      lastActivity: "3 hours ago",
      progress: 60,
      owner: "Mike Johnson",
      team: "QA Team Alpha",
    },
    {
      id: "s25010456",
      name: "Inventory Management",
      description:
        "Warehouse and inventory management system comprehensive testing",
      status: "paused",
      requests: 6,
      testCases: 12,
      lastActivity: "2 days ago",
      progress: 40,
      owner: "Sarah Wilson",
      team: "QA Team Gamma",
    },
    {
      id: "s25011789",
      name: "Customer Support Portal",
      description: "Customer support and ticketing system testing suite",
      status: "active",
      requests: 10,
      testCases: 20,
      lastActivity: "5 hours ago",
      progress: 85,
      owner: "David Brown",
      team: "QA Team Beta",
    },
    {
      id: "s25012234",
      name: "Analytics Dashboard",
      description: "Business intelligence and analytics dashboard testing",
      status: "completed",
      requests: 4,
      testCases: 8,
      lastActivity: "1 week ago",
      progress: 100,
      owner: "Emma Davis",
      team: "QA Team Gamma",
    },
  ];

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
      <Card className="border-2 border-blue-200 shadow-2xl rounded-2xl overflow-hidden">
        <CardHeader className="border-b-4 border-gradient-to-r from-green-500 to-yellow-500 bg-gradient-to-r from-blue-50 to-green-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Icon
                icon="heroicons:table-cells"
                className="w-8 h-8 text-white"
              />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 to-yellow-700 bg-clip-text text-transparent">
              📋 sid1 Dashboard
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-gradient-to-br from-white to-blue-50">
          <HierarchicalProjectsTable
            onOpenExecution={handleOpenExecution}
            showFavoritesOnly={filterTab === "favorites"}
          />
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
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
