import React, { useState, useEffect } from "react";
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
import { projectApi, Activity } from "../lib/api";

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Fetch activities
  const fetchActivities = async (page: number = 1, search: string = "") => {
    setIsLoading(true);
    try {
      const response = await projectApi.getActivities(page, pageSize);
      setActivities(response.activities);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.total_pages);
      setTotalCount(response.pagination.total_count);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, searchTerm);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchActivities(1, searchTerm);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchActivities(page, searchTerm);
    }
  };

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

  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      project_created: "Project Created",
      testcase_created: "Test Case Created",
      project_archived: "Project Archived",
      project_updated: "Project Updated",
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleActivityClick = (activity: Activity) => {
    // Navigate based on activity type
    if (activity.project?.id) {
      window.location.href = `/projects/${activity.project.id}`;
    }
  };

  // Filter activities based on search term
  const filteredActivities = activities.filter(activity => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.title.toLowerCase().includes(searchLower) ||
      activity.username.toLowerCase().includes(searchLower) ||
      activity.project?.name.toLowerCase().includes(searchLower) ||
      activity.test_case?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Activity Feed</h1>
            <p className="mt-2 text-slate-600">
              Track all project and test case activities across your organization
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="border-slate-300"
            >
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:chart-bar" className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Activities</p>
                <p className="text-lg font-semibold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:folder-plus" className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Projects Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activities.filter(a => a.activity_type === 'project_created').length}
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
                  <Icon icon="heroicons:document-plus" className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Test Cases Created</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activities.filter(a => a.activity_type === 'testcase_created').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:archive-box" className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Archived Projects</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activities.filter(a => a.activity_type === 'project_archived').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
          <CardTitle className="text-slate-800 text-base">Search Activities</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search by title, username, project name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="heroicons:magnifying-glass" className="w-4 h-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 text-base">
              Activity Timeline
            </CardTitle>
            <div className="text-sm text-slate-600">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading activities...</span>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                icon="heroicons:exclamation-triangle"
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No activities found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No activities match your search "${searchTerm}"`
                  : "No activities to display"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${getActivityColor(
                        activity.activity_type,
                      )}`}
                    >
                      <Icon
                        icon={getActivityIcon(activity.activity_type)}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h3>
                          <Badge className={`text-xs ${getActivityColor(activity.activity_type)}`}>
                            {getActivityTypeLabel(activity.activity_type)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.time_ago}
                        </div>
                      </div>
                      
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                        <span>by {activity.username}</span>
                        {activity.project && (
                          <span className="flex items-center gap-1">
                            <Icon icon="heroicons:folder" className="w-4 h-4" />
                            {activity.project.name}
                            {activity.project.archived && (
                              <Badge className="text-xs bg-amber-100 text-amber-800 ml-1">
                                Archived
                              </Badge>
                            )}
                          </span>
                        )}
                        {activity.test_case && (
                          <span className="flex items-center gap-1">
                            <Icon icon="heroicons:document" className="w-4 h-4" />
                            {activity.test_case.name}
                          </span>
                        )}
                      </div>

                      {activity.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {activity.metadata.device_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              {activity.metadata.device_type}
                            </span>
                          )}
                          {activity.metadata.completes && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {activity.metadata.completes} completes
                            </span>
                          )}
                          {activity.metadata.case_type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                              Case Type {activity.metadata.case_type}
                            </span>
                          )}
                          {activity.metadata.region && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              {activity.metadata.region}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} activities
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Icon icon="heroicons:chevron-left" className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant={currentPage === totalPages ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
