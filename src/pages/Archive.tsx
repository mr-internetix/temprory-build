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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Icon } from "@iconify/react";
import { projectApi, ArchivedProject } from "../lib/api";
import { useToast } from "@/hooks/use-toast";

export default function ArchivePage() {
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ArchivedProject | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const pageSize = 20;
  const { toast } = useToast();

  // Fetch archived projects
  const fetchArchivedProjects = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await projectApi.getArchivedProjects(page, pageSize);
      setArchivedProjects(response.projects);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.total_pages);
      setTotalCount(response.pagination.total_count);
    } catch (error) {
      console.error("Error fetching archived projects:", error);
      toast({
        title: "Error",
        description: "Failed to load archived projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedProjects(1);
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArchivedProjects(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchArchivedProjects(page);
    }
  };

  // Handle restore project
  const handleRestoreProject = async () => {
    if (!selectedProject) return;

    setIsRestoring(true);
    try {
      const response = await projectApi.restoreProject(selectedProject.id);
      
      toast({
        title: "Success!",
        description: `Project "${response.project_name}" has been restored successfully.`,
        variant: "default",
      });

      // Remove the restored project from the list
      setArchivedProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setShowRestoreModal(false);
      setSelectedProject(null);

      // Update total count
      setTotalCount(prev => prev - 1);
    } catch (error) {
      console.error("Error restoring project:", error);
      toast({
        title: "Error",
        description: "Failed to restore project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Toggle project expansion
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Format date
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

  // Filter projects based on search term
  const filteredProjects = archivedProjects.filter(project => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      project.project_name.toLowerCase().includes(searchLower) ||
      project.archived_by.toLowerCase().includes(searchLower) ||
      project.case_type_display.toLowerCase().includes(searchLower) ||
      project.region_display.toLowerCase().includes(searchLower)
    );
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Archived Projects</h1>
            <p className="mt-2 text-slate-600">
              Manage and restore archived projects
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

      {/* Archive Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Icon icon="heroicons:archive-box" className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Archived</p>
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
                  <Icon icon="heroicons:beaker" className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Test Cases</p>
                <p className="text-lg font-semibold text-gray-900">
                  {archivedProjects.reduce((sum, project) => sum + project.test_cases_count, 0)}
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
                  <Icon icon="heroicons:check-circle" className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Completed Test Cases</p>
                <p className="text-lg font-semibold text-gray-900">
                  {archivedProjects.reduce((sum, project) => sum + project.completed_test_cases, 0)}
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
                  {archivedProjects.reduce((sum, project) => sum + (project.mdd_info?.variables_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-slate-200 shadow-sm mb-6">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
          <CardTitle className="text-slate-800 text-base">Search Archived Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search by project name, archived by, case type..."
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

      {/* Archived Projects Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 text-base">
              Archived Projects
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
              <span className="ml-3 text-gray-500">Loading archived projects...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Icon
                icon="heroicons:archive-box"
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No archived projects found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `No archived projects match your search "${searchTerm}"`
                  : "No projects have been archived yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Cases
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MDD Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archived
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map((project) => (
                    <React.Fragment key={project.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => toggleProjectExpansion(project.id)}
                              className="mr-2 text-gray-400 hover:text-gray-600"
                            >
                              <Icon
                                icon={
                                  expandedProjects.includes(project.id)
                                    ? "heroicons:chevron-down"
                                    : "heroicons:chevron-right"
                                }
                                className="w-4 h-4"
                              />
                            </button>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {project.project_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {project.region_display}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {project.case_type_display}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{project.completed_test_cases}/{project.test_cases_count}</span>
                            {project.completed_test_cases === project.test_cases_count && project.test_cases_count > 0 && (
                              <Icon icon="heroicons:check-circle" className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {project.mdd_info ? (
                            <div className="text-sm">
                              <div className="text-gray-900">{project.mdd_info.filename}</div>
                              <div className="text-gray-500">{project.mdd_info.variables_count} variables</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No MDD</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="text-gray-900">{formatDate(project.archived_at)}</div>
                            <div className="text-gray-500">by {project.archived_by}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProject(project);
                              setShowRestoreModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 border-blue-200"
                          >
                            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-1" />
                            Restore
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded Details */}
                      {expandedProjects.includes(project.id) && (
                        <tr>
                          <td colSpan={6} className="px-0 py-0">
                            <div className="bg-gray-50 border-t border-gray-200">
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 mb-3">
                                  Project Details
                                </h4>
                                <div className="bg-white rounded border overflow-hidden">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Project ID
                                      </label>
                                      <p className="text-sm font-mono text-blue-600">
                                        {project.id}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Created Date
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {formatDate(project.created_at)}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Processing Duration
                                      </label>
                                      <p className="text-sm text-gray-900">
                                        {project.processing_duration}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Status
                                      </label>
                                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                                        {project.status_display}
                                      </Badge>
                                    </div>
                                    {project.mdd_info && (
                                      <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                          MDD Status
                                        </label>
                                        <Badge className="bg-green-100 text-green-800 text-xs">
                                          {project.mdd_info.status}
                                        </Badge>
                                      </div>
                                    )}
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
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} archived projects
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

      {/* Restore Confirmation Modal */}
      <Dialog open={showRestoreModal} onOpenChange={setShowRestoreModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Restore "{selectedProject.project_name}"?
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      This will move the project back to the active projects list.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Case Type:</span>
                  <span className="text-gray-900">{selectedProject.case_type_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Test Cases:</span>
                  <span className="text-gray-900">
                    {selectedProject.completed_test_cases}/{selectedProject.test_cases_count}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Archived:</span>
                  <span className="text-gray-900">{formatDate(selectedProject.archived_at)}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setSelectedProject(null);
                  }}
                  disabled={isRestoring}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestoreProject}
                  disabled={isRestoring}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isRestoring ? (
                    <>
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
                      Restore Project
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
