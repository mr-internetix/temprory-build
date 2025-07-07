import React, { useState } from "react";
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
  Search,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  MoreHorizontal,
  Play,
} from "lucide-react";

interface RequestsTableProps {
  onOpenExecution: (requestId: string) => void;
}

// Sample data grouped by SID
const groupedRequestsBySid = {
  s25021874: [
    {
      id: "s25021874",
      timeStamp: "2025-05-28 02:33:27",
      completes: "0 / 2",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "1fbe8d61-C4bb-43da-8b85-044eb5e1bc32",
      testCaseName: "Test Case Name",
      status: "completed",
    },
  ],
  s25000213: [
    {
      id: "s25000213",
      timeStamp: "2025-05-28 02:25:15",
      completes: "0 / 2",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "30bf238a-Eb8a-4ed6-924d-435b75e0bd93",
      testCaseName: "Skipscreener",
      status: "completed",
    },
  ],
  s25022909: [
    {
      id: "s25022909",
      timeStamp: "2025-05-22 02:41:13",
      completes: "0 / 2",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "72fc065f-Fc45-48fd-9590-Bd8508dc2a2d",
      testCaseName: "Q1None",
      status: "running",
    },
    {
      id: "s25022909",
      timeStamp: "2025-05-22 02:37:29",
      completes: "0 / 3",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "5948ada0-87b5-415a-98bc-C3284072ce67",
      testCaseName: "Q1AllQ2None",
      status: "paused",
    },
    {
      id: "s25022909",
      timeStamp: "2025-05-22 02:23:12",
      completes: "0 / 4",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "0e6aca6f-Befa-450b-86c7-3418ef85dd1f",
      testCaseName: "BrandAwareness",
      status: "failed",
    },
    {
      id: "s25022909",
      timeStamp: "2025-05-22 02:14:38",
      completes: "0 / 4",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "20f7c6d0-3ef1-4621-80c2-617835721fc",
      testCaseName: "CustomerSatisfaction",
      status: "completed",
    },
    {
      id: "s25022909",
      timeStamp: "2025-05-22 02:10:53",
      completes: "0 / 3",
      deviceType: "Desktop",
      screenshot: "Yes",
      requestId: "2a35aaf4-3832-4909-987b-F9b29767fcd2",
      testCaseName: "ProductFeedback",
      status: "running",
    },
  ],
};

interface Request {
  id: string;
  timeStamp: string;
  completes: string;
  deviceType: string;
  screenshot: string;
  requestId: string;
  testCaseName: string;
  status: string;
}

export function RequestsTable({ onOpenExecution }: RequestsTableProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [openSids, setOpenSids] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchFilter(value);
  };

  const toggleSid = (sid: string) => {
    setOpenSids((prev) =>
      prev.includes(sid) ? prev.filter((s) => s !== sid) : [...prev, sid],
    );
  };

  const handleEdit = (requestId: string) => {
    console.log("Editing request:", requestId);
    alert(`Edit request: ${requestId}`);
  };

  const handleDelete = (requestId: string) => {
    console.log("Deleting request:", requestId);
    if (confirm("Are you sure you want to delete this request?")) {
      alert(`Request ${requestId} deleted`);
    }
  };

  const handleRun = (requestId: string) => {
    console.log("Running request:", requestId);
    onOpenExecution(requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
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

  const getOverallSidStatus = (requests: Request[]) => {
    const statuses = requests.map((r) => r.status);
    if (statuses.includes("running")) return "running";
    if (statuses.includes("paused")) return "paused";
    if (statuses.includes("failed")) return "failed";
    if (statuses.every((s) => s === "completed")) return "completed";
    return "mixed";
  };

  const getSidSummary = (requests: Request[]) => {
    const totalCompletes = requests.reduce((sum, r) => {
      const [completed, total] = r.completes.split(" / ").map(Number);
      return sum + (total || 0);
    }, 0);

    const completedCompletes = requests.reduce((sum, r) => {
      const [completed] = r.completes.split(" / ").map(Number);
      return sum + (completed || 0);
    }, 0);

    const testCases = [
      ...new Set(requests.map((r) => r.testCaseName).filter(Boolean)),
    ];

    return {
      totalRequests: requests.length,
      completes: `${completedCompletes} / ${totalCompletes}`,
      testCases: testCases.length > 0 ? testCases : ["Default"],
      status: getOverallSidStatus(requests),
    };
  };

  const filteredSids = Object.entries(groupedRequestsBySid).reduce(
    (acc, [sid, requests]) => {
      if (searchFilter.trim() === "") {
        acc[sid] = requests;
      } else {
        const filtered = requests.filter(
          (request) =>
            request.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
            request.requestId
              .toLowerCase()
              .includes(searchFilter.toLowerCase()) ||
            request.testCaseName
              .toLowerCase()
              .includes(searchFilter.toLowerCase()) ||
            sid.toLowerCase().includes(searchFilter.toLowerCase()),
        );
        if (filtered.length > 0) {
          acc[sid] = filtered;
        }
      }
      return acc;
    },
    {} as Record<string, Request[]>,
  );

  const renderTestCaseBadges = (testCases: string[]) => {
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
            {testCase}
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
                      {testCase}
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Previous Requests
        </h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search requests..."
              value={searchFilter}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* SID Summary Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-24">SID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Completes</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Test Cases</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(filteredSids).map(([sid, requests]) => {
              const summary = getSidSummary(requests);
              const isOpen = openSids.includes(sid);

              return (
                <React.Fragment key={sid}>
                  {/* SID Summary Row */}
                  <TableRow className="hover:bg-gray-50 cursor-pointer">
                    <TableCell
                      className="font-mono text-sm font-medium"
                      onClick={() => toggleSid(sid)}
                    >
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        {sid}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => toggleSid(sid)}>
                      <Badge className={getStatusColor(summary.status)}>
                        {summary.status}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      onClick={() => toggleSid(sid)}
                    >
                      {summary.completes}
                    </TableCell>
                    <TableCell
                      className="text-sm"
                      onClick={() => toggleSid(sid)}
                    >
                      {summary.totalRequests} request
                      {summary.totalRequests !== 1 ? "s" : ""}
                    </TableCell>
                    <TableCell onClick={() => toggleSid(sid)}>
                      {renderTestCaseBadges(summary.testCases)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleSid(sid)}>
                            {isOpen ? "Collapse" : "Expand"} Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              requests.forEach((req) =>
                                handleRun(req.requestId),
                              );
                            }}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run All
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Detailed Requests (Expandable) */}
                  {isOpen && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="bg-gray-50 border-t">
                          <div className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Detailed Requests for {sid}
                            </h4>
                            <div className="bg-white rounded border">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-100">
                                    <TableHead className="text-xs">
                                      Time Stamp
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Completes
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Device
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Screenshot
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Status
                                    </TableHead>
                                    <TableHead className="text-xs">
                                      Test Case
                                    </TableHead>
                                    <TableHead className="text-xs min-w-[250px]">
                                      Request ID
                                    </TableHead>
                                    <TableHead className="text-xs w-20">
                                      Actions
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {requests.map((request, index) => (
                                    <TableRow
                                      key={index}
                                      className="hover:bg-gray-50"
                                    >
                                      <TableCell className="text-xs">
                                        {request.timeStamp}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {request.completes}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {request.deviceType}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {request.screenshot}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          className={`${getStatusColor(
                                            request.status,
                                          )} text-xs`}
                                        >
                                          {request.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        <span className="text-green-600 font-medium">
                                          {request.testCaseName || "Default"}
                                        </span>
                                      </TableCell>
                                      <TableCell className="font-mono text-xs">
                                        <button
                                          onClick={() =>
                                            onOpenExecution(request.requestId)
                                          }
                                          className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px] block"
                                        >
                                          {request.requestId}
                                        </button>
                                      </TableCell>
                                      <TableCell>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreHorizontal className="w-3 h-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleRun(request.requestId)
                                              }
                                            >
                                              <Play className="w-4 h-4 mr-2" />
                                              Run
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleEdit(request.requestId)
                                              }
                                            >
                                              <Edit className="w-4 h-4 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleDelete(request.requestId)
                                              }
                                              className="text-red-600"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
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

      {Object.keys(filteredSids).length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-gray-500">
            No requests found matching your search.
          </p>
        </div>
      )}

      <div className="text-sm text-red-500">
        If did not input a Test Case, then it should still work and run the no.
        of Completes inputted same as current iDataGen works.
      </div>
    </div>
  );
}
