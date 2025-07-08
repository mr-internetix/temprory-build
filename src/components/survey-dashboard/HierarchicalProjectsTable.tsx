import React, { useState } from "react";
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

interface Project {
  id: string;
  projectName: string;
  status: "complete" | "running" | "paused" | "failed";
  totalCompletes: number;
  requests: number;
  testCases: TestCase[];
  isFavorite: boolean;
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
  respondentPaths: RespondentPath[];
}

interface RespondentPath {
  id: string;
  serial: string;
  status: "Completed" | "In Progress" | "Failed";
  testPaths: TestPath[];
}

interface TestPath {
  qid: string;
  answers: string;
  screenshot: string;
}

interface HierarchicalProjectsTableProps {
  onOpenExecution?: (requestId: string) => void;
  showFavoritesOnly?: boolean;
  projectId?: string;
  singleProjectView?: boolean;
}

const mockProjects: Project[] = [
  {
    id: "s25021834",
    projectName: "Market Research Study",
    status: "complete",
    totalCompletes: 35,
    requests: 1,
    testCases: [
      {
        id: "tc1",
        name: "Skipscreener",
        timeStamp: "2023-06-06 08:30:22",
        user: "John Doe",
        completes: "3/5",
        device: "Desktop",
        screenshots: "Yes",
        status: "complete",
        requestId: "REQ-001",
        respondentPaths: [
          {
            id: "rp1",
            serial: "R5-00173",
            status: "Completed",
            testPaths: [
              {
                qid: "Q1",
                answers: "5 - Very Satisfied [code: 5]",
                screenshot:
                  "https://via.placeholder.com/800x600/4ade80/000000?text=Q1+Screenshot",
              },
              {
                qid: "Q2",
                answers: "Yes [code: 1]",
                screenshot:
                  "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Q2+Screenshot",
              },
              {
                qid: "Q3",
                answers: "User Interface [code: 2]",
                screenshot:
                  "https://via.placeholder.com/800x600/f59e0b/000000?text=Q3+Screenshot",
              },
            ],
          },
        ],
      },
      {
        id: "tc2",
        name: "Q1None",
        timeStamp: "2023-06-14 14:45:10",
        user: "Jane Smith",
        completes: "2/5",
        device: "Mobile",
        screenshots: "No",
        status: "running",
        requestId: "REQ-002",
        respondentPaths: [],
      },
    ],
    isFavorite: true,
  },
  {
    id: "s25000213",
    projectName: "Customer Feedback Survey",
    status: "running",
    totalCompletes: 28,
    requests: 2,
    testCases: [
      {
        id: "tc3",
        name: "Skipscreener",
        timeStamp: "2023-06-14 14:45:10",
        user: "Jane Smith",
        completes: "2/5",
        device: "Mobile",
        screenshots: "No",
        status: "running",
        requestId: "REQ-002",
        respondentPaths: [],
      },
    ],
    isFavorite: false,
  },
];

export function HierarchicalProjectsTable({
  onOpenExecution,
  showFavoritesOnly = false,
  projectId,
  singleProjectView = false,
}: HierarchicalProjectsTableProps) {
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<string[]>(
    singleProjectView && projectId ? [projectId] : [],
  );
  const [expandedTestCases, setExpandedTestCases] = useState<string[]>(
    singleProjectView ? ["tc1", "tc2"] : [],
  );
  const [expandedRespondentPaths, setExpandedRespondentPaths] = useState<
    string[]
  >([]);
  const [favorites, setFavorites] = useState<string[]>(["s25021834"]);
  const [screenshotModal, setScreenshotModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
  }>({
    isOpen: false,
    imageUrl: "",
    title: "",
  });

  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
  }>({
    isVisible: false,
    message: "",
  });

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

  // Get unique values for filter dropdowns
  const getUniqueValues = (field: keyof Project | string) => {
    const values = new Set<string>();

    mockProjects.forEach((project) => {
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

  const filteredProjects = mockProjects.filter((project) => {
    // If single project view, only show the specific project
    if (singleProjectView && projectId) {
      return project.id === projectId;
    }

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

  const showToast = (message: string) => {
    setToast({ isVisible: true, message });
    setTimeout(() => {
      setToast({ isVisible: false, message: "" });
    }, 3000);
  };

  return (
    <div className="w-full">
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          {!singleProjectView && (
            <TableHeader>
              <TableRow className="bg-slate-50">
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
                <TableHead className="w-32">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium">SID</span>
                    <Select
                      value={filters.sid}
                      onValueChange={(value) =>
                        handleFilterChange("sid", value)
                      }
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
          )}

          <TableBody>
            {filteredProjects.map((project) => (
              <React.Fragment key={project.id}>
                {/* Project Row - only show if not single project view */}
                {!singleProjectView && (
                  <TableRow className="hover:bg-slate-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(project.id)}
                        className={`p-1 ${
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
                    </TableCell>
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
                        <button
                          onClick={() => navigate(`/projects/${project.id}`)}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {project.id}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell
                      className="font-medium cursor-pointer hover:text-emerald-600"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      {project.projectName}
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
                    <TableCell>Skipscreener, Q1None</TableCell>
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )}

                {/* Test Cases Section */}
                {singleProjectView && (
                  <TableRow className="bg-blue-50/30">
                    <TableCell colSpan={8} className="py-3 px-4">
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
                )}

                {/* Test Cases Table */}
                {(expandedProjects.includes(project.id) ||
                  singleProjectView) && (
                  <TableRow>
                    <TableCell
                      colSpan={singleProjectView ? 8 : 9}
                      className="p-0"
                    >
                      <div
                        className={
                          singleProjectView
                            ? ""
                            : "ml-6 bg-white rounded border border-slate-200"
                        }
                      >
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-100">
                              <TableHead className="text-xs">
                                Time Stamp
                              </TableHead>
                              <TableHead className="text-xs">User</TableHead>
                              <TableHead className="text-xs">
                                Completes
                              </TableHead>
                              <TableHead className="text-xs">Device</TableHead>
                              <TableHead className="text-xs">
                                Screenshots
                              </TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs">
                                Test Case
                              </TableHead>
                              <TableHead className="text-xs">
                                Request ID
                              </TableHead>
                              <TableHead className="text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.testCases.map((testCase) => (
                              <React.Fragment key={testCase.id}>
                                <TableRow className="hover:bg-slate-50">
                                  <TableCell className="text-xs">
                                    {testCase.timeStamp}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {testCase.user}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {testCase.completes}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {testCase.device}
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    {testCase.screenshots}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={`${getStatusColor(testCase.status)} text-xs`}
                                    >
                                      {testCase.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs">
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          toggleTestCase(testCase.id)
                                        }
                                        className="p-1"
                                      >
                                        <Icon
                                          icon={
                                            expandedTestCases.includes(
                                              testCase.id,
                                            )
                                              ? "heroicons:chevron-down"
                                              : "heroicons:chevron-right"
                                          }
                                          className="w-3 h-3"
                                        />
                                      </Button>
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
                                        navigator.clipboard.writeText(
                                          testCase.requestId,
                                        );
                                        // You could add a toast notification here
                                      }}
                                      className="p-1 h-auto hover:bg-slate-100"
                                      title="Copy Request ID"
                                    >
                                      <Icon
                                        icon="heroicons:clipboard"
                                        className="w-3 h-3 text-slate-500 hover:text-slate-700"
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
                                          onClick={() =>
                                            onOpenExecution?.(
                                              testCase.requestId,
                                            )
                                          }
                                        >
                                          <Icon
                                            icon="heroicons:play"
                                            className="w-4 h-4 mr-2"
                                          />
                                          Run
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
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>

                                {/* Respondent Paths */}
                                {expandedTestCases.includes(testCase.id) &&
                                  testCase.respondentPaths.map((path) => (
                                    <React.Fragment key={path.id}>
                                      <TableRow className="bg-green-50/30">
                                        <TableCell colSpan={9}>
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
                                                  <TableHead className="text-xs">
                                                    Respondent Serial #
                                                  </TableHead>
                                                  <TableHead className="text-xs">
                                                    Status
                                                  </TableHead>
                                                  <TableHead className="text-xs">
                                                    Actions
                                                  </TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                <TableRow>
                                                  <TableCell className="text-xs">
                                                    {path.serial}
                                                  </TableCell>
                                                  <TableCell>
                                                    <Badge
                                                      className={getStatusColor(
                                                        path.status.toLowerCase(),
                                                      )}
                                                    >
                                                      {path.status}
                                                    </Badge>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() =>
                                                        toggleRespondentPath(
                                                          path.id,
                                                        )
                                                      }
                                                      className="p-1"
                                                    >
                                                      <Icon
                                                        icon={
                                                          expandedRespondentPaths.includes(
                                                            path.id,
                                                          )
                                                            ? "heroicons:chevron-down"
                                                            : "heroicons:chevron-right"
                                                        }
                                                        className="w-3 h-3"
                                                      />
                                                    </Button>
                                                  </TableCell>
                                                </TableRow>

                                                {/* Test Paths */}
                                                {expandedRespondentPaths.includes(
                                                  path.id,
                                                ) && (
                                                  <TableRow>
                                                    <TableCell colSpan={3}>
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
                                                              >
                                                                Open
                                                              </Button>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <Table>
                                                          <TableHeader>
                                                            <TableRow>
                                                              <TableHead className="text-xs">
                                                                QID
                                                              </TableHead>
                                                              <TableHead className="text-xs">
                                                                Answers
                                                              </TableHead>
                                                              <TableHead className="text-xs">
                                                                Screenshot
                                                              </TableHead>
                                                            </TableRow>
                                                          </TableHeader>
                                                          <TableBody>
                                                            {path.testPaths.map(
                                                              (
                                                                testPath,
                                                                index,
                                                              ) => (
                                                                <TableRow
                                                                  key={index}
                                                                >
                                                                  <TableCell className="text-xs">
                                                                    {
                                                                      testPath.qid
                                                                    }
                                                                  </TableCell>
                                                                  <TableCell className="text-xs">
                                                                    {
                                                                      testPath.answers
                                                                    }
                                                                  </TableCell>
                                                                  <TableCell className="text-xs">
                                                                    <div
                                                                      className="cursor-pointer hover:opacity-75 transition-opacity"
                                                                      onClick={() =>
                                                                        setScreenshotModal(
                                                                          {
                                                                            isOpen:
                                                                              true,
                                                                            imageUrl:
                                                                              testPath.screenshot,
                                                                            title: `${testPath.qid} Screenshot`,
                                                                          },
                                                                        )
                                                                      }
                                                                    >
                                                                      <img
                                                                        src={
                                                                          testPath.screenshot
                                                                        }
                                                                        alt={`${testPath.qid} Screenshot`}
                                                                        className="w-16 h-12 object-cover rounded border border-slate-200"
                                                                      />
                                                                    </div>
                                                                  </TableCell>
                                                                </TableRow>
                                                              ),
                                                            )}
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
    </div>
  );
}
