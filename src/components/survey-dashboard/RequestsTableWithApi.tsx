import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Search, 
  RefreshCw, 
  FileText, 
  Calendar, 
  Clock, 
  Play,
  Eye,
  Filter,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Heart,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { apiClient } from "../../lib/api";
import { API_BASE_URL } from "../../lib/utils";

interface MddInfo {
  filename: string;
  status: string;
  variables_count: number;
}

interface TestCase {
  id: string;
  name: string;
  timeStamp: string;
  user: string;
  completes: string;
  device: string;
  screenshots: "Yes" | "No";
  status: "complete" | "running" | "paused" | "failed";
  requestId: string;
}

interface Project {
  id: string;
  project_name: string;
  case_type: number;
  case_type_display: string;
  region: string;
  region_display: string;
  status: string;
  status_display: string;
  created_at: string;
  processing_duration: string;
  test_cases_count: number;
  completed_test_cases: number;
  mdd_info?: MddInfo;
  testCases?: TestCase[];
  isFavorite?: boolean;
  totalCompletes?: number;
  requests?: number;
}

interface ProjectsResponse {
  projects: Project[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
    total_pages: number;
  };
  filters: {
    region: string;
    case_type: string;
    status: string;
  };
}

interface RequestsTableWithApiProps {
  onOpenExecution?: (requestId: string) => void;
  onProjectSelect?: (project: Project) => void;
  limit?: number;
  showFilters?: boolean;
  showFavoritesOnly?: boolean;
  projectId?: string;
  singleProjectView?: boolean;
}

export const RequestsTableWithApi: React.FC<RequestsTableWithApiProps> = ({
  onOpenExecution,
  onProjectSelect,
  limit,
  showFilters = true,
  showFavoritesOnly = false,
  projectId,
  singleProjectView = false,
}) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [caseTypeFilter, setCaseTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const fetchProjects = async (page = 1) => {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        page_size: limit ? limit.toString() : "10",
      });

      if (searchTerm) queryParams.append("search", searchTerm);
      if (statusFilter !== "all") queryParams.append("status", statusFilter);
      if (caseTypeFilter !== "all") queryParams.append("case_type", caseTypeFilter);
      if (regionFilter !== "all") queryParams.append("region", regionFilter);

      const data: ProjectsResponse = await apiClient.get(`/api/idatagenerator/projects/?${queryParams}`);
      
      // Enhance projects with additional UI-specific properties
      const enhancedProjects = data.projects.map(project => ({
        ...project,
        isFavorite: favorites.includes(project.id),
        totalCompletes: project.completed_test_cases || 0,
        requests: project.test_cases_count || 0,
        testCases: [] as TestCase[], // Will be populated when expanded
      }));

      setProjects(enhancedProjects);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.total_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "complete":
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleFavorite = (projectId: string) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleProjectClick = (project: Project) => {
    if (onProjectSelect) {
      onProjectSelect(project);
    }
    navigate(`/projects/${project.id}`);
  };

  const handleEdit = (projectId: string) => {
    console.log("Editing project:", projectId);
    // Add edit functionality here
  };

  const handleDelete = (projectId: string) => {
    console.log("Deleting project:", projectId);
    if (confirm("Are you sure you want to delete this project?")) {
      // Add delete functionality here
    }
  };

  const handleRun = (projectId: string) => {
    console.log("Running project:", projectId);
    if (onOpenExecution) {
      onOpenExecution(projectId);
    }
  };

  const renderTestCaseBadges = (testCases: TestCase[]) => {
    if (!testCases || testCases.length === 0) {
      return (
        <Badge variant="secondary" className="text-green-600 bg-green-50 text-xs">
          Default
        </Badge>
      );
    }

    const visibleTestCases = testCases.slice(0, 2);
    const extraTestCases = testCases.slice(2);

    return (
      <div className="flex flex-wrap gap-1">
        {visibleTestCases.map((testCase, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-green-600 bg-green-50 text-xs"
          >
            {testCase.name}
          </Badge>
        ))}
        {extraTestCases.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-gray-600 bg-gray-50 text-xs cursor-help"
                >
                  +{extraTestCases.length} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {extraTestCases.map((testCase, index) => (
                    <div key={index} className="text-xs">
                      {testCase.name}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  // Filter projects based on favorites and search
  const filteredProjects = projects.filter(project => {
    if (showFavoritesOnly && !project.isFavorite) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.id.toLowerCase().includes(searchLower) ||
        project.project_name.toLowerCase().includes(searchLower) ||
        project.status_display.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, caseTypeFilter, regionFilter, limit, searchTerm]);

  const handleRefresh = () => {
    fetchProjects(currentPage);
  };

  const handlePageChange = (page: number) => {
    fetchProjects(page);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {singleProjectView ? "Project Test Cases" : "Previous Requests"}
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex gap-4 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={caseTypeFilter} onValueChange={setCaseTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by case type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Case Types</SelectItem>
              <SelectItem value="1">Type 1</SelectItem>
              <SelectItem value="2">Type 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="us">US</SelectItem>
              <SelectItem value="eu">EU</SelectItem>
              <SelectItem value="apac">APAC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Projects Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-24">Project ID</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Completes</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Test Cases</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => {
              const isExpanded = expandedProjects.includes(project.id);

              return (
                <React.Fragment key={project.id}>
                  {/* Project Summary Row */}
                  <TableRow className="hover:bg-gray-50 cursor-pointer">
                    <TableCell
                      className="font-mono text-sm font-medium"
                      onClick={() => toggleProjectExpansion(project.id)}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProjectClick(project);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {project.id}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-emerald-600"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(project.id);
                          }}
                          className={`${
                            project.isFavorite
                              ? "text-yellow-500 hover:text-yellow-600"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        {project.project_name}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => toggleProjectExpansion(project.id)}>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status_display}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      onClick={() => toggleProjectExpansion(project.id)}
                    >
                      {project.totalCompletes}
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      onClick={() => toggleProjectExpansion(project.id)}
                    >
                      {project.requests} request{project.requests !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell onClick={() => toggleProjectExpansion(project.id)}>
                      {renderTestCaseBadges(project.testCases || [])}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleProjectClick(project)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleProjectExpansion(project.id)}>
                            {isExpanded ? "Collapse" : "Expand"} Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRun(project.id)}>
                            <Play className="w-4 h-4 mr-2" />
                            Run Project
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(project.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(project.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Detailed View (Expandable) */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={7} className="p-0">
                        <div className="bg-gray-50 border-t">
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Project Details for {project.id}
                            </h4>
                            <div className="bg-white rounded border p-4">
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <div className="text-sm text-gray-600">Created</div>
                                  <div className="font-medium">
                                    {format(new Date(project.created_at), "MMM dd, yyyy HH:mm")}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Processing Duration</div>
                                  <div className="font-medium">{project.processing_duration}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Region</div>
                                  <div className="font-medium">{project.region_display}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Case Type</div>
                                  <div className="font-medium">{project.case_type_display}</div>
                                </div>
                              </div>
                              
                              {project.mdd_info && (
                                <div className="border-t pt-4">
                                  <div className="text-sm text-gray-600 mb-2">MDD Information</div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <div className="text-xs text-gray-500">Filename</div>
                                      <div className="font-medium">{project.mdd_info.filename}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">Status</div>
                                      <div className="font-medium">{project.mdd_info.status}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">Variables</div>
                                      <div className="font-medium">{project.mdd_info.variables_count}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm ? "No projects found matching your search." : "No projects found."}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {totalCount} projects
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
