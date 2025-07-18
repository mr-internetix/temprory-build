import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectApi, ProjectHierarchy } from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@iconify/react";
import { TestCaseModal } from "./TestCaseModal";

interface Project {
  id: string;
  projectName: string;
  status: string;
  requests: number;
  testCases: TestCase[];
  totalCompletes: number;
  originalData: ProjectHierarchy;
}

interface TestCase {
  id: string;
  name: string;
  status: string;
  timeStamp: string;
  user: string;
  completes: string;
  device: string;
  screenshots: string;
  requestId: string;
  respondentPaths: RespondentPath[];
}

interface RespondentPath {
  id: string;
  serial: string;
  status: string;
  testPaths: TestPath[];
}

interface TestPath {
  qid: string;
  answers: string;
  screenshot: string;
}

interface HierarchicalProjectsTableProps {
  onOpenExecution: (requestId: string) => void;
  showFavoritesOnly?: boolean;
  projectsData?: ProjectHierarchy[];
  singleProjectView?: boolean;
}

export function HierarchicalProjectsTable({
  onOpenExecution,
  showFavoritesOnly = false,
  projectsData: externalProjectsData,
  singleProjectView = false,
}: HierarchicalProjectsTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectsData, setProjectsData] = useState<ProjectHierarchy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedTestCases, setExpandedTestCases] = useState<string[]>([]);
  const [expandedRespondentPaths, setExpandedRespondentPaths] = useState<string[]>([]);
  
  // Load favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('project-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [screenshotModal, setScreenshotModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
  });

  const [toastState, setToast] = useState<{
    isVisible: boolean;
    message: string;
  }>({
    isVisible: false,
    message: "",
  });

  const [testCaseModal, setTestCaseModal] = useState<{
    isOpen: boolean;
    mode: "edit" | "duplicate";
    testCaseData: any;
  }>({
    isOpen: false,
    mode: "edit",
    testCaseData: null,
  });

  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    projectId: string;
    projectName: string;
  }>({
    isOpen: false,
    projectId: "",
    projectName: "",
  });

  const [isArchiving, setIsArchiving] = useState(false);

  // Column filters
  const [filters, setFilters] = useState({
    favorites: "all",
    sid: "all",
    projectName: "all",
    status: "all",
    totalCompletes: "",
    requests: "",
    testCases: "",
  });

  // Use external data if provided, otherwise fetch
  useEffect(() => {
    if (externalProjectsData) {
      setProjectsData(externalProjectsData);
      // Auto-expand the project if in single project view
      if (singleProjectView && externalProjectsData.length === 1) {
        setExpandedProjects([externalProjectsData[0].id]);
      }
    } else {
      const fetchProjectsHierarchy = async () => {
        setIsLoading(true);
        try {
          const response = await projectApi.getProjectsHierarchy(1, 50);
          setProjectsData(response.projects_hierarchy);
        } catch (error) {
          console.error("Error fetching projects hierarchy:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchProjectsHierarchy();
    }
  }, [externalProjectsData, singleProjectView]);

  // Helper function to get time ago
  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60),
      );

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

  // Transform API data to match expected format
  const projects: Project[] = projectsData.map((project) => ({
    id: project.id,
    projectName: project.project_name,
    status: project.status === "ready_for_test_cases" ? "complete" : 
             project.status === "completed" ? "complete" : 
             project.status === "pending" ? "paused" : "complete",
    requests: project.test_cases_summary.total_test_cases,
    totalCompletes: project.test_cases_summary.total_test_cases * 5, // Assuming 5 completes per test case
    testCases: project.test_cases.map((testCase) => ({
      id: testCase.id,
      name: testCase.test_case_name,
      status: testCase.status === "completed" ? "complete" : 
              testCase.status === "processing" ? "running" : 
              testCase.status === "failed" ? "failed" : "paused",
      timeStamp: getTimeAgo(testCase.created_at),
      user: testCase.created_by,
      completes: `${testCase.respondents_summary.completed_respondents}/${testCase.respondents_summary.total_respondents}`,
      device: testCase.effective_settings.device_type,
      screenshots: testCase.effective_settings.generate_screenshot ? "Yes" : "No",
      requestId: testCase.id,
      respondentPaths: [
        {
          id: `${testCase.id}-path-1`,
          serial: "1",
          status: "Complete",
          testPaths: [
            {
              qid: "Q1",
              answers: "Option A",
              screenshot: "https://via.placeholder.com/200x150?text=Screenshot+1"
            },
            {
              qid: "Q2", 
              answers: "Option B",
              screenshot: "https://via.placeholder.com/200x150?text=Screenshot+2"
            }
          ]
        }
      ]
    })),
    originalData: project,
  }));

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: string) => {
    const values = new Set<string>();

    projects.forEach((project) => {
      switch (field) {
        case "status":
          values.add(project.status);
          break;
        case "sid":
          values.add(project.id);
          break;
        case "projectName":
          values.add(project.projectName);
          break;
        case "device":
          project.testCases.forEach((tc) => values.add(tc.device));
          break;
        case "user":
          project.testCases.forEach((tc) => values.add(tc.user));
          break;
        case "testCaseStatus":
          project.testCases.forEach((tc) => values.add(tc.status));
          break;
        case "screenshots":
          project.testCases.forEach((tc) => values.add(tc.screenshots));
          break;
      }
    });

    return Array.from(values).sort();
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
  };

  const toggleTestCase = (testCaseId: string) => {
    setExpandedTestCases((prev) =>
      prev.includes(testCaseId)
        ? prev.filter((id) => id !== testCaseId)
        : [...prev, testCaseId],
    );
  };

  const toggleRespondentPath = (pathId: string) => {
    setExpandedRespondentPaths((prev) =>
      prev.includes(pathId)
        ? prev.filter((id) => id !== pathId)
        : [...prev, pathId],
    );
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
      case "complete":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredProjects = projects.filter((project) => {
    // If single project view, only show the specific project
    if (showFavoritesOnly && !favorites.includes(project.id)) return false;

    // Handle favorites filter
    if (filters.favorites === "true" && !favorites.includes(project.id))
      return false;
    if (filters.favorites === "false" && favorites.includes(project.id))
      return false;

    const matchesFilters =
      (filters.sid === "all" || project.id === filters.sid) &&
      (filters.projectName === "all" ||
        project.projectName === filters.projectName) &&
      (filters.status === "all" || project.status === filters.status) &&
      (filters.totalCompletes === "" ||
        project.totalCompletes.toString().includes(filters.totalCompletes)) &&
      (filters.requests === "" ||
        project.requests.toString().includes(filters.requests));

    return matchesFilters;
  });

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  // Add search functionality that navigates to project details
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = filters.totalCompletes.trim();
    if (searchTerm) {
      // Try to find exact project match by ID or name
      const exactMatch = projects.find(
        (project) => 
          project.id.toLowerCase() === searchTerm.toLowerCase() ||
          project.projectName.toLowerCase() === searchTerm.toLowerCase()
      );
      
      if (exactMatch) {
        navigate(`/projects/${exactMatch.id}`);
      } else {
        // If no exact match, show filtered results
        toast({
          title: "Search Results",
          description: `Found ${filteredProjects.length} projects matching "${searchTerm}"`,
          variant: "default",
        });
      }
    }
  };

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
    setTimeout(() => {
      setToast({ isVisible: false, message: "" });
    }, 3000);
  };

  const openTestCaseModal = (mode: "edit" | "duplicate", testCase: any) => {
    setTestCaseModal({
      isOpen: true,
      mode,
      testCaseData: {
        id: testCase.id,
        name: testCase.name,
        requestId: testCase.requestId,
        completes: parseInt(testCase.completes.split("/")[1]) || 5,
        device: testCase.device,
        screenshots: testCase.screenshots,
      },
    });
  };

  const closeTestCaseModal = () => {
    setTestCaseModal({
      isOpen: false,
      mode: "edit",
      testCaseData: null,
    });
  };

  const handleTestCaseSave = (data: any) => {
    const actionText = testCaseModal.mode === "edit" ? "updated" : "duplicated";
    showToast(`Test case ${actionText} successfully!`);
  };

  const handleArchiveProject = async () => {
    if (!archiveModal.projectId) return;

    setIsArchiving(true);
    try {
      const response = await projectApi.archiveProject(archiveModal.projectId);
      
      toast({
        title: "Success!",
        description: `Project "${response.project_name}" has been archived successfully.`,
        variant: "default",
      });

      // Remove the archived project from the list if we're not in single project view
      if (!singleProjectView) {
        setProjectsData(prev => prev.filter(p => p.id !== archiveModal.projectId));
      }

      setArchiveModal({
        isOpen: false,
        projectId: "",
        projectName: "",
      });
    } catch (error) {
      console.error("Error archiving project:", error);
      toast({
        title: "Error",
        description: "Failed to archive project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const openArchiveModal = (projectId: string, projectName: string) => {
    setArchiveModal({
      isOpen: true,
      projectId,
      projectName,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin text-gray-400" />
        <span className="ml-3 text-gray-500">Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hide filters in single project view */}
      {!singleProjectView && (
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:funnel" className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700">
                Filters:
              </span>
            </div>

            <div className="flex gap-3">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sid}
                onValueChange={(value) => handleFilterChange("sid", value)}
              >
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Project ID" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {getUniqueValues("sid").map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.favorites}
                onValueChange={(value) =>
                  handleFilterChange("favorites", value)
                }
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue placeholder="Favorites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Favorites</SelectItem>
                  <SelectItem value="false">Not Favorited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Input
                placeholder="Search projects..."
                className="w-64 h-8 text-xs"
                value={filters.totalCompletes}
                onChange={(e) =>
                  handleFilterChange("totalCompletes", e.target.value)
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters({
                    favorites: "all",
                    sid: "all",
                    projectName: "all",
                    status: "all",
                    totalCompletes: "",
                    requests: "",
                    testCases: "",
                  })
                }
                className="h-8 px-2 text-xs"
              >
                <Icon icon="heroicons:x-mark" className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Show favorites summary */}
      {favorites.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:star-solid" className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-yellow-800">
                {favorites.length} favorite project{favorites.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFavorites([]);
                toast({
                  title: "Favorites cleared",
                  description: "All favorite projects have been removed.",
                  variant: "default",
                });
              }}
              className="h-6 px-2 text-xs text-yellow-700 hover:text-yellow-900"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              {/* Hide favorites column in single project view */}
              {!singleProjectView && (
                <TableHead className="w-12">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium">Favorites</span>
                    <Select
                      value={filters.favorites}
                      onValueChange={(value) =>
                        handleFilterChange("favorites", value)
                      }
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Favorites Only</SelectItem>
                        <SelectItem value="false">Non-Favorites</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableHead>
              )}
              <TableHead className="w-32">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Project ID</span>
                  {!singleProjectView && (
                    <Select
                      value={filters.sid}
                      onValueChange={(value) => handleFilterChange("sid", value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {getUniqueValues("sid").map((value) => (
                          <SelectItem key={value} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Project Name</span>
                  <Select
                    value={filters.projectName}
                    onValueChange={(value) =>
                      handleFilterChange("projectName", value)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {getUniqueValues("projectName").map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="w-24">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Status</span>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {getUniqueValues("status").map((value) => (
                        <SelectItem
                          key={value}
                          value={value}
                          className="capitalize"
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TableHead>
              <TableHead className="w-32">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Total Completes</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.totalCompletes}
                    onChange={(e) =>
                      handleFilterChange("totalCompletes", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead className="w-24">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Requests</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.requests}
                    onChange={(e) =>
                      handleFilterChange("requests", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Test Cases</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.testCases}
                    onChange={(e) =>
                      handleFilterChange("testCases", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead className="w-20">
                <span className="text-xs font-medium">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredProjects.map((project) => (
              <React.Fragment key={project.id}>
                {/* Project Row */}
                <TableRow className="hover:bg-slate-50">
                  {/* Hide favorites column in single project view */}
                  {!singleProjectView && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newFavorites = favorites.includes(project.id)
                            ? favorites.filter((id) => id !== project.id)
                            : [...favorites, project.id];
                          
                          setFavorites(newFavorites);
                          
                          toast({
                            title: favorites.includes(project.id) ? "Removed from favorites" : "Added to favorites",
                            description: `Project "${project.projectName}" ${favorites.includes(project.id) ? 'removed from' : 'added to'} favorites.`,
                            variant: "default",
                          });
                        }}
                        className={`p-1 transition-colors ${
                          favorites.includes(project.id)
                            ? "text-yellow-500 hover:text-yellow-600"
                            : "text-slate-400 hover:text-yellow-500"
                        }`}
                        title={favorites.includes(project.id) ? "Remove from favorites" : "Add to favorites"}
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
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleProject(project.id)}
                        className="p-1"
                      >
                        <Icon
                          icon={
                            expandedProjects.includes(project.id)
                              ? "heroicons:chevron-down"
                              : "heroicons:chevron-right"
                          }
                          className="w-4 h-4"
                        />
                      </Button>
                      {singleProjectView ? (
                        <span className="text-blue-600 font-medium">{project.id}</span>
                      ) : (
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          title="View project details"
                        >
                          {project.id}
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`font-medium cursor-pointer hover:text-emerald-600 ${
                      favorites.includes(project.id) ? 'text-emerald-700' : ''
                    }`}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    title="View project details"
                  >
                    <div className="flex items-center gap-2">
                      {favorites.includes(project.id) && (
                        <Icon icon="heroicons:star-solid" className="w-3 h-3 text-yellow-500" />
                      )}
                      {project.projectName}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.totalCompletes}</TableCell>
                  <TableCell>
                    {project.requests} request
                    {project.requests !== 1 ? "s" : ""}
                  </TableCell>
                  <TableCell>{project.testCases.length} test cases</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
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
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icon
                            icon="heroicons:document-duplicate"
                            className="w-4 h-4 mr-2"
                          />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openArchiveModal(project.id, project.projectName)}
                          className="text-amber-600 hover:text-amber-800"
                        >
                          <Icon
                            icon="heroicons:archive-box"
                            className="w-4 h-4 mr-2"
                          />
                          Archive Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Test Cases Section - Always show in single project view */}
                {(expandedProjects.includes(project.id) || showFavoritesOnly || singleProjectView) && (
                  <>
                    <TableRow className="bg-blue-50/30">
                      <TableCell colSpan={singleProjectView ? 7 : 8} className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="heroicons:beaker"
                            className="w-5 h-5 text-blue-600"
                          />
                          <span className="font-medium text-blue-800">
                            Test Cases
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Test Cases Table */}
                    <TableRow>
                      <TableCell colSpan={singleProjectView ? 7 : 8} className="p-0">
                        <div className={showFavoritesOnly || singleProjectView ? "" : "ml-6 bg-white rounded border border-slate-200"}>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-slate-100">
                                <TableHead className="text-xs"></TableHead>
                                <TableHead className="text-xs">Time Stamp</TableHead>
                                <TableHead className="text-xs">User</TableHead>
                                <TableHead className="text-xs">Completes</TableHead>
                                <TableHead className="text-xs">Device</TableHead>
                                <TableHead className="text-xs">Screenshots</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Test Case</TableHead>
                                <TableHead className="text-xs">Request ID</TableHead>
                                <TableHead className="text-xs">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {project.testCases.map((testCase) => (
                                <React.Fragment key={testCase.id}>
                                  <TableRow className="hover:bg-slate-50">
                                    <TableCell className="text-xs">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleTestCase(testCase.id)}
                                        className="p-1"
                                      >
                                        <Icon
                                          icon={
                                            expandedTestCases.includes(testCase.id)
                                              ? "heroicons:chevron-down"
                                              : "heroicons:chevron-right"
                                          }
                                          className="w-3 h-3"
                                        />
                                      </Button>
                                    </TableCell>
                                    <TableCell className="text-xs">{testCase.timeStamp}</TableCell>
                                    <TableCell className="text-xs">{testCase.user}</TableCell>
                                    <TableCell className="text-xs">{testCase.completes}</TableCell>
                                    <TableCell className="text-xs">{testCase.device}</TableCell>
                                    <TableCell className="text-xs">{testCase.screenshots}</TableCell>
                                    <TableCell>
                                      <Badge className={`${getStatusColor(testCase.status)} text-xs`}>
                                        {testCase.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <div className="flex items-center gap-2">
                                        <span className="text-green-600 font-medium">
                                          {testCase.name}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          navigator.clipboard.writeText(testCase.requestId);
                                          showToast("Request ID copied");
                                        }}
                                        className="p-1 h-auto hover:bg-slate-100"
                                        title="Copy Request ID"
                                      >
                                        <Icon
                                          icon="heroicons:clipboard-document"
                                          className="w-3 h-3 text-blue-600 hover:text-blue-800"
                                        />
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Icon
                                              icon="heroicons:ellipsis-horizontal"
                                              className="w-3 h-3"
                                            />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => onOpenExecution?.(testCase.requestId)}
                                          >
                                            <Icon
                                              icon="heroicons:play"
                                              className="w-4 h-4 mr-2"
                                            />
                                            Run
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => openTestCaseModal("edit", testCase)}
                                          >
                                            <Icon
                                              icon="heroicons:pencil"
                                              className="w-4 h-4 mr-2"
                                            />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => openTestCaseModal("duplicate", testCase)}
                                          >
                                            <Icon
                                              icon="heroicons:document-duplicate"
                                              className="w-4 h-4 mr-2"
                                            />
                                            Duplicate
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </TableCell>
                                  </TableRow>

                                  {/* Respondent Paths */}
                                  {expandedTestCases.includes(testCase.id) &&
                                    testCase.respondentPaths.map((path) => (
                                      <React.Fragment key={path.id}>
                                        <TableRow className="bg-green-50/30">
                                          <TableCell colSpan={10}>
                                            <div className="ml-6 bg-white rounded border border-slate-200">
                                              <div className="p-3 border-b border-slate-200 bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                  <h4 className="font-medium text-slate-800">
                                                    Respondent Path
                                                  </h4>
                                                </div>
                                              </div>
                                              <Table>
                                                <TableHeader>
                                                  <TableRow className="bg-slate-100">
                                                    <TableHead className="text-xs"></TableHead>
                                                    <TableHead className="text-xs">
                                                      Respondent Serial #
                                                    </TableHead>
                                                    <TableHead className="text-xs">Status</TableHead>
                                                    <TableHead className="text-xs">Actions</TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  <TableRow>
                                                    <TableCell>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleRespondentPath(path.id)}
                                                        className="p-1"
                                                      >
                                                        <Icon
                                                          icon={
                                                            expandedRespondentPaths.includes(path.id)
                                                              ? "heroicons:chevron-down"
                                                              : "heroicons:chevron-right"
                                                          }
                                                          className="w-3 h-3"
                                                        />
                                                      </Button>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{path.serial}</TableCell>
                                                    <TableCell>
                                                      <Badge className={getStatusColor(path.status.toLowerCase())}>
                                                        {path.status}
                                                      </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={() => {
                                                            navigator.clipboard.writeText(
                                                              `PATH-${testCase.requestId}-${path.serial}`,
                                                            );
                                                            showToast("Path request ID copied");
                                                          }}
                                                          className="p-1 h-auto hover:bg-blue-100 text-blue-600"
                                                          title="Copy Path Request ID"
                                                        >
                                                          <Icon icon="heroicons:clipboard" className="w-3 h-3" />
                                                        </Button>
                                                      </div>
                                                    </TableCell>
                                                  </TableRow>

                                                  {/* Test Paths */}
                                                  {expandedRespondentPaths.includes(path.id) && (
                                                    <TableRow>
                                                      <TableCell colSpan={4}>
                                                        <div className="ml-6 bg-blue-50 rounded border border-blue-200">
                                                          <div className="p-3 border-b border-blue-200 bg-blue-100">
                                                            <div className="flex items-center justify-between">
                                                              <h5 className="font-medium text-blue-800">
                                                                Test Path
                                                              </h5>
                                                              <div className="flex gap-2">
                                                                <Button
                                                                  size="sm"
                                                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                                                >
                                                                  Download
                                                                </Button>
                                                                <Button
                                                                  size="sm"
                                                                  variant="outline"
                                                                  className="text-xs"
                                                                  onClick={() =>
                                                                    navigate(
                                                                      `/projects/${project.id}/respondent/${path.serial}`,
                                                                    )
                                                                  }
                                                                >
                                                                  Open
                                                                </Button>
                                                              </div>
                                                            </div>
                                                          </div>
                                                          <Table>
                                                            <TableHeader>
                                                              <TableRow>
                                                                <TableHead className="text-xs">QID</TableHead>
                                                                <TableHead className="text-xs">Answers</TableHead>
                                                                <TableHead className="text-xs">Screenshot</TableHead>
                                                              </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                              {path.testPaths.map((testPath, index) => (
                                                                <TableRow key={index}>
                                                                  <TableCell className="text-xs">{testPath.qid}</TableCell>
                                                                  <TableCell className="text-xs">{testPath.answers}</TableCell>
                                                                  <TableCell className="text-xs">
                                                                    <div
                                                                      className="cursor-pointer hover:opacity-75 transition-opacity"
                                                                      onClick={() =>
                                                                        setScreenshotModal({
                                                                          isOpen: true,
                                                                          imageUrl: testPath.screenshot,
                                                                          title: `${testPath.qid} Screenshot`,
                                                                        })
                                                                      }
                                                                    >
                                                                      <img
                                                                        src={testPath.screenshot}
                                                                        alt={`${testPath.qid} Screenshot`}
                                                                        className="w-16 h-12 object-cover rounded border border-slate-200"
                                                                      />
                                                                    </div>
                                                                  </TableCell>
                                                                </TableRow>
                                                              ))}
                                                            </TableBody>
                                                          </Table>
                                                        </div>
                                                      </TableCell>
                                                    </TableRow>
                                                  )}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          </TableCell>
                                        </TableRow>
                                      </React.Fragment>
                                    ))}
                                </React.Fragment>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Screenshot Modal */}
      <Dialog
        open={screenshotModal.isOpen}
        onOpenChange={(open) =>
          setScreenshotModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{screenshotModal.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={screenshotModal.imageUrl}
              alt={screenshotModal.title}
              className="max-w-full max-h-[70vh] object-contain rounded"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notification */}
      {toastState.isVisible && (
        <div className="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-md z-50 transform transition-transform duration-300">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Icon
                icon="heroicons:check-circle"
                className="h-5 w-5 text-green-500"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {toastState.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Case Modal */}
      <TestCaseModal
        isOpen={testCaseModal.isOpen}
        onClose={closeTestCaseModal}
        mode={testCaseModal.mode}
        testCaseData={testCaseModal.testCaseData}
        onSave={handleTestCaseSave}
      />

      {/* Archive Confirmation Modal */}
      <Dialog
        open={archiveModal.isOpen}
        onOpenChange={(open) => {
          if (!isArchiving) {
            setArchiveModal(prev => ({ ...prev, isOpen: open }));
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Archive Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center">
                <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-amber-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    Archive "{archiveModal.projectName}"?
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This will move the project to the archive. You can restore it later if needed.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                The project will be moved to the archive and will no longer appear in the main projects list.
              </p>
              <p className="text-gray-600">
                All test cases and data will be preserved and can be accessed from the archive.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setArchiveModal({
                  isOpen: false,
                  projectId: "",
                  projectName: "",
                })}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleArchiveProject}
                disabled={isArchiving}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isArchiving ? (
                  <>
                    <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Icon icon="heroicons:archive-box" className="w-4 h-4 mr-2" />
                    Archive Project
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}