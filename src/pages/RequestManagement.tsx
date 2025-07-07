import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
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
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              onClick={() => setShowNewRequestModal(true)}
            >
              <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Icon
                  icon="heroicons:folder"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Projects
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {projects.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <Icon
                  icon="heroicons:play"
                  className="w-6 h-6 text-emerald-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {projects.filter((p) => p.status === "active").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Icon
                  icon="heroicons:star"
                  className="w-6 h-6 text-amber-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Favorites</p>
                <p className="text-2xl font-bold text-slate-800">
                  {favorites.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <Icon
                  icon="heroicons:beaker"
                  className="w-6 h-6 text-indigo-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Test Cases
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {projects.reduce((sum, p) => sum + p.testCases, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Tabs
            value={filterTab}
            onValueChange={setFilterTab}
            className="w-full lg:w-auto"
          >
            <TabsList className="grid w-full grid-cols-5 lg:w-auto">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
              />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <div className="flex items-center border border-slate-200 rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Icon icon="heroicons:squares-2x2" className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <Icon icon="heroicons:list-bullet" className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                        {project.name}
                      </CardTitle>
                      <Badge
                        className={`${getStatusColor(project.status)} text-xs`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 font-mono">
                      {project.id}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(project.id);
                    }}
                    className={`text-yellow-500 hover:text-yellow-600 ${
                      favorites.includes(project.id)
                        ? "text-yellow-500"
                        : "text-slate-400"
                    }`}
                  >
                    <Icon
                      icon={
                        favorites.includes(project.id)
                          ? "heroicons:star-solid"
                          : "heroicons:star"
                      }
                      className="w-4 h-4"
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Requests</p>
                      <p className="font-medium">{project.requests}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Test Cases</p>
                      <p className="font-medium">{project.testCases}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>{project.lastActivity}</span>
                    <span>{project.owner}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800 truncate">
                          {project.name}
                        </h3>
                        <Badge
                          className={`${getStatusColor(project.status)} text-xs`}
                        >
                          {project.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(project.id);
                          }}
                          className={`text-yellow-500 hover:text-yellow-600 ${
                            favorites.includes(project.id)
                              ? "text-yellow-500"
                              : "text-slate-400"
                          }`}
                        >
                          <Icon
                            icon={
                              favorites.includes(project.id)
                                ? "heroicons:star-solid"
                                : "heroicons:star"
                            }
                            className="w-4 h-4"
                          />
                        </Button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-slate-500">
                        <span className="font-mono">{project.id}</span>
                        <span>{project.requests} requests</span>
                        <span>{project.testCases} test cases</span>
                        <span>Progress: {project.progress}%</span>
                        <span>{project.lastActivity}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Icon
                              icon="heroicons:ellipsis-horizontal"
                              className="w-4 h-4"
                            />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            <Icon
                              icon="heroicons:eye"
                              className="w-4 h-4 mr-2"
                            />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icon
                              icon="heroicons:pencil"
                              className="w-4 h-4 mr-2"
                            />
                            Edit Project
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Icon
                              icon="heroicons:document-duplicate"
                              className="w-4 h-4 mr-2"
                            />
                            Duplicate Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
