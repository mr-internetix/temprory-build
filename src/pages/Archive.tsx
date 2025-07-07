import React, { useState } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

interface ArchivedProject {
  id: string;
  sid: string;
  projectName: string;
  status: string;
  totalCompletes: number;
  requests: number;
  testCases: string;
  archivedDate: string;
}

export default function Archive() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedProject, setSelectedProject] =
    useState<ArchivedProject | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);

  // Sample archived projects data
  const [archivedProjects, setArchivedProjects] = useState<ArchivedProject[]>([
    {
      id: "1",
      sid: "SID-001",
      projectName: "E-commerce Platform",
      status: "Archived",
      totalCompletes: 24,
      requests: 32,
      testCases: "Integration Tests, Load Testing",
      archivedDate: "2024-01-15",
    },
    {
      id: "2",
      sid: "SID-002",
      projectName: "CRM System",
      status: "Archived",
      totalCompletes: 18,
      requests: 25,
      testCases: "Unit Tests, Regression Testing",
      archivedDate: "2024-01-10",
    },
    {
      id: "3",
      sid: "SID-003",
      projectName: "HR Portal",
      status: "Archived",
      totalCompletes: 15,
      requests: 20,
      testCases: "Functional Testing, User Acceptance",
      archivedDate: "2024-01-05",
    },
    {
      id: "4",
      sid: "SID-006",
      projectName: "Inventory Management",
      status: "Archived",
      totalCompletes: 22,
      requests: 28,
      testCases: "API Testing, Database Testing",
      archivedDate: "2023-12-20",
    },
    {
      id: "5",
      sid: "SID-007",
      projectName: "Customer Support Portal",
      status: "Archived",
      totalCompletes: 19,
      requests: 24,
      testCases: "UI Testing, Performance Testing",
      archivedDate: "2023-12-15",
    },
    {
      id: "6",
      sid: "SID-008",
      projectName: "Analytics Dashboard",
      status: "Archived",
      totalCompletes: 16,
      requests: 21,
      testCases: "Data Validation, Report Testing",
      archivedDate: "2023-12-10",
    },
  ]);

  const handleUnarchive = () => {
    if (selectedProject) {
      setArchivedProjects((projects) =>
        projects.filter((project) => project.id !== selectedProject.id),
      );
      setShowUnarchiveModal(false);
      setSelectedProject(null);
    }
  };

  const openDetailsModal = (project: ArchivedProject) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const openUnarchiveModal = (project: ArchivedProject) => {
    setSelectedProject(project);
    setShowUnarchiveModal(true);
  };

  const filteredProjects = archivedProjects.filter((project) => {
    const matchesSearch =
      project.sid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.testCases.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "recent") {
      const projectDate = new Date(project.archivedDate);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return matchesSearch && projectDate >= thirtyDaysAgo;
    }

    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Archived Projects
          </h2>
          <div className="flex space-x-3">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="h-5 w-5 text-gray-400"
                />
              </div>
              <Input
                type="text"
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 w-64 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium shadow-sm flex items-center"
                >
                  <Icon icon="heroicons:funnel" className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("all")}
                  className={
                    selectedFilter === "all" ? "bg-blue-50 text-blue-700" : ""
                  }
                >
                  <Icon icon="heroicons:list-bullet" className="w-4 h-4 mr-2" />
                  All Projects
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSelectedFilter("recent")}
                  className={
                    selectedFilter === "recent"
                      ? "bg-blue-50 text-blue-700"
                      : ""
                  }
                >
                  <Icon icon="heroicons:clock" className="w-4 h-4 mr-2" />
                  Recently Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Back to Dashboard */}
            <Button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredProjects.length} of {archivedProjects.length}{" "}
          archived projects
          {searchTerm && ` for "${searchTerm}"`}
          {selectedFilter !== "all" && ` (${selectedFilter})`}
        </div>

        {/* Archive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Completes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Archived Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {project.sid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.projectName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.totalCompletes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.requests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.testCases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.archivedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsModal(project)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                          title="View details"
                        >
                          <Icon icon="heroicons:eye" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUnarchiveModal(project)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                          title="Unarchive project"
                        >
                          <Icon
                            icon="heroicons:arrow-up-tray"
                            className="h-4 w-4"
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Icon
                        icon="heroicons:archive-box-x-mark"
                        className="w-12 h-12 text-gray-400 mb-4"
                      />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No archived projects found
                      </h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm
                          ? `No projects match your search "${searchTerm}"`
                          : "There are no archived projects yet"}
                      </p>
                      {searchTerm && (
                        <Button
                          onClick={() => setSearchTerm("")}
                          variant="outline"
                          size="sm"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProjects.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to{" "}
                  <span className="font-medium">{filteredProjects.length}</span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredProjects.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-l-md"
                    disabled
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 border-blue-500 text-blue-600"
                  >
                    1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-r-md"
                    disabled
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {showDetailsModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Project Details
                  </h2>
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedProject(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project ID
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedProject.sid}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedProject.projectName}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Completes
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedProject.totalCompletes}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Requests
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedProject.requests}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archived Date
                      </label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                        {new Date(
                          selectedProject.archivedDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Cases
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">
                      {selectedProject.testCases}
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedProject(null);
                  }}
                  variant="outline"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openUnarchiveModal(selectedProject);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon
                    icon="heroicons:arrow-up-tray"
                    className="w-4 h-4 mr-2"
                  />
                  Unarchive Project
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unarchive Confirmation Modal */}
        {showUnarchiveModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Unarchive Project
                  </h2>
                  <Button
                    onClick={() => {
                      setShowUnarchiveModal(false);
                      setSelectedProject(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Icon
                      icon="heroicons:arrow-up-tray"
                      className="w-6 h-6 text-green-600"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Unarchive "{selectedProject.projectName}"?
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This project will be moved back to the active projects list
                    and will be available for normal operations.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg text-left">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        <strong>Project ID:</strong> {selectedProject.sid}
                      </div>
                      <div>
                        <strong>Total Completes:</strong>{" "}
                        {selectedProject.totalCompletes}
                      </div>
                      <div>
                        <strong>Total Requests:</strong>{" "}
                        {selectedProject.requests}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  onClick={() => {
                    setShowUnarchiveModal(false);
                    setSelectedProject(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnarchive}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon
                    icon="heroicons:arrow-up-tray"
                    className="w-4 h-4 mr-2"
                  />
                  Unarchive Project
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
