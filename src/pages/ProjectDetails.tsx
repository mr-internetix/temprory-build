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
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/requests")}
            className="text-slate-600 hover:text-slate-800 text-sm px-2 py-1"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-1" />
            Back to All Projects
          </Button>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Project Details: {project.id}
        </h1>
      </div>

      {/* Project Test Cases */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <HierarchicalProjectsTable
            onOpenExecution={handleOpenExecution}
            projectId={project.id}
            singleProjectView={true}
          />
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
