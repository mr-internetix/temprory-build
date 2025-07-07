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
        name: "Test Cases",
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
                screenshot: "Q1 Screenshot",
              },
              {
                qid: "Q2",
                answers: "Yes [code: 1]",
                screenshot: "Q2 Screenshot",
              },
              {
                qid: "Q3",
                answers: "User Interface [code: 2]",
                screenshot: "Q3 Screenshot",
              },
            ],
          },
        ],
      },
    ],
    isFavorite: true,
  },
];

export function HierarchicalProjectsTable({
  onOpenExecution,
  showFavoritesOnly = false,
}: HierarchicalProjectsTableProps) {
  const navigate = useNavigate();
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedTestCases, setExpandedTestCases] = useState<string[]>([]);
  const [expandedRespondentPaths, setExpandedRespondentPaths] = useState<
    string[]
  >([]);
  const [favorites, setFavorites] = useState<string[]>(["s25021834"]);

  // Column filters
  const [filters, setFilters] = useState({
    favorites: "",
    sid: "",
    projectName: "",
    status: "",
    totalCompletes: "",
    requests: "",
    testCases: "",
    actions: "",
  });

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
    if (showFavoritesOnly && !favorites.includes(project.id)) return false;

    const matchesFilters =
      project.id.toLowerCase().includes(filters.sid.toLowerCase()) &&
      project.projectName
        .toLowerCase()
        .includes(filters.projectName.toLowerCase()) &&
      project.status.toLowerCase().includes(filters.status.toLowerCase());

    return matchesFilters;
  });

  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({ ...prev, [column]: value }));
  };

  return (
    <div className="w-full">
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-12">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Favorites</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.favorites}
                    onChange={(e) =>
                      handleFilterChange("favorites", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead className="w-32">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">SID</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.sid}
                    onChange={(e) => handleFilterChange("sid", e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Project Name</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.projectName}
                    onChange={(e) =>
                      handleFilterChange("projectName", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
                </div>
              </TableHead>
              <TableHead className="w-24">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Status</span>
                  <Input
                    placeholder="Filter..."
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    className="h-7 text-xs"
                  />
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
                      {project.id}
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
                  <TableCell>Skipscreener, Others</TableCell>
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
                          <Icon icon="heroicons:eye" className="w-4 h-4 mr-2" />
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

                {/* Test Cases (when project is expanded) */}
                {expandedProjects.includes(project.id) &&
                  project.testCases.map((testCase) => (
                    <React.Fragment key={testCase.id}>
                      <TableRow className="bg-blue-50/30">
                        <TableCell></TableCell>
                        <TableCell colSpan={8}>
                          <div className="ml-6 bg-white rounded border border-slate-200">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-slate-100">
                                  <TableHead className="text-xs">
                                    Time Stamp
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    User
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Completes
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Device
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Screenshots
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Status
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Test Case
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Request ID
                                  </TableHead>
                                  <TableHead className="text-xs">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
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
                                        Skipscreener
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs font-mono">
                                    <button
                                      onClick={() =>
                                        onOpenExecution?.(testCase.requestId)
                                      }
                                      className="text-blue-600 hover:text-blue-800 underline"
                                    >
                                      {testCase.requestId}
                                    </button>
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
                                        <DropdownMenuItem>
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

                                {/* Respondent Paths (when test case is expanded) */}
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
                                                    <div className="flex gap-1">
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
                                                    </div>
                                                  </TableCell>
                                                </TableRow>

                                                {/* Test Path (when respondent path is expanded) */}
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
                                                                  <TableCell className="text-xs text-blue-600">
                                                                    {
                                                                      testPath.screenshot
                                                                    }
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
    </div>
  );
}
