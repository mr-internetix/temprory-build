import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { HierarchicalProjectsTable } from "../components/survey-dashboard/HierarchicalProjectsTable";
import { ExecutionModal } from "../components/survey-dashboard/ExecutionModal";
import { SurveyForm } from "../components/survey-dashboard/SurveyForm";
import { Button } from "../components/ui/button";
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
import { Icon } from "@iconify/react";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock project data - in real app, fetch based on projectId
  const project = {
    id: projectId || "s25021874",
    name: "E-commerce Platform",
    description:
      "Comprehensive testing suite for e-commerce platform functionality",
    status: "active",
    totalRequests: 12,
    activeRequests: 8,
    completedRequests: 4,
    totalTestCases: 24,
    lastActivity: "2 hours ago",
    createdDate: "2024-01-15",
    owner: "John Doe",
    team: "QA Team Alpha",
  };

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

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
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

  return (
    <DashboardLayout>
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/requests")}
            className="text-slate-600 hover:text-slate-800"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">
                  {project.name}
                </h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className={`text-yellow-500 hover:text-yellow-600 ${
                    isFavorite ? "text-yellow-500" : "text-slate-400"
                  }`}
                >
                  <Icon
                    icon={
                      isFavorite ? "heroicons:star-solid" : "heroicons:star"
                    }
                    className="w-5 h-5"
                  />
                </Button>
              </div>
              <p className="text-slate-600 mb-4">{project.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Project ID</p>
                  <p className="font-mono font-medium">{project.id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Owner</p>
                  <p className="font-medium">{project.owner}</p>
                </div>
                <div>
                  <p className="text-slate-500">Team</p>
                  <p className="font-medium">{project.team}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Activity</p>
                  <p className="font-medium">{project.lastActivity}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowNewRequestModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                New Request
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Icon
                      icon="heroicons:ellipsis-horizontal"
                      className="w-4 h-4"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2" />
                    Edit Project
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon
                      icon="heroicons:document-duplicate"
                      className="w-4 h-4 mr-2"
                    />
                    Clone Project
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Icon
                      icon="heroicons:archive-box"
                      className="w-4 h-4 mr-2"
                    />
                    Archive Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Icon
                  icon="heroicons:queue-list"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-slate-800">
                  {project.totalRequests}
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
                  icon="heroicons:check-circle"
                  className="w-6 h-6 text-emerald-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Active</p>
                <p className="text-2xl font-bold text-slate-800">
                  {project.activeRequests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <Icon
                  icon="heroicons:check-badge"
                  className="w-6 h-6 text-green-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-2xl font-bold text-slate-800">
                  {project.completedRequests}
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
                <p className="text-sm font-medium text-slate-600">Test Cases</p>
                <p className="text-2xl font-bold text-slate-800">
                  {project.totalTestCases}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Test Cases */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-800">
                Project Details: {project.id}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">
                Test Cases and Request Details
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Single project hierarchical table showing all test cases */}
          <div className="w-full">
            <div className="border-b border-slate-200">
              <div className="p-4 bg-slate-50">
                <div className="grid grid-cols-6 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Project ID:</span>
                    <p className="font-mono font-medium">{project.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Project Name:</span>
                    <p className="font-medium">{project.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>
                    <Badge className={getStatusColor(project.status)} size="sm">
                      {project.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Completes:</span>
                    <p className="font-medium">{project.totalRequests}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Requests:</span>
                    <p className="font-medium">
                      {project.activeRequests} request
                      {project.activeRequests !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Test Cases:</span>
                    <p className="font-medium">Skipscreener, Q1None</p>
                  </div>
                </div>
              </div>
            </div>
            <HierarchicalProjectsTable
              onOpenExecution={handleOpenExecution}
              projectId={project.id}
              singleProjectView={true}
            />
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
                  Create New Request for {project.name}
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
