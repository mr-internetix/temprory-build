import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { RequestsTable } from "../components/survey-dashboard/RequestsTable";
import { ExecutionModal } from "../components/survey-dashboard/ExecutionModal";
import { SurveyForm } from "../components/survey-dashboard/SurveyForm";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Icon } from "@iconify/react";

export default function RequestManagement() {
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState("");

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

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Request Management
            </h1>
            <p className="mt-2 text-slate-600">
              Manage and monitor your survey test requests organized by SID
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
                  icon="heroicons:queue-list"
                  className="w-6 h-6 text-blue-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total SIDs</p>
                <p className="text-2xl font-bold text-slate-800">3</p>
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
                <p className="text-sm font-medium text-slate-600">
                  Active Requests
                </p>
                <p className="text-2xl font-bold text-slate-800">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <Icon
                  icon="heroicons:clock"
                  className="w-6 h-6 text-amber-600"
                />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-slate-800">2</p>
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
                <p className="text-2xl font-bold text-slate-800">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-slate-800">All Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <RequestsTable onOpenExecution={handleOpenExecution} />
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
