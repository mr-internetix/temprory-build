import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@iconify/react";

interface RespondentData {
  qid: string;
  question: string;
  answer: string;
  screenshot?: string;
}

const mockRespondentData: RespondentData[] = [
  {
    qid: "QID1",
    question: "What is your age group?",
    answer: "25-34",
    screenshot:
      "https://via.placeholder.com/800x600/4ade80/000000?text=QID1+Screenshot",
  },
  {
    qid: "QID2",
    question: "How often do you use our product?",
    answer: "Weekly",
    screenshot:
      "https://via.placeholder.com/800x600/3b82f6/ffffff?text=QID2+Screenshot",
  },
  {
    qid: "QID3",
    question: "Rate your satisfaction with our service.",
    answer: "Very Satisfied",
    screenshot:
      "https://via.placeholder.com/800x600/f59e0b/000000?text=QID3+Screenshot",
  },
];

export default function RespondentDetails() {
  const { projectId, serial } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(mockRespondentData);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredData(mockRespondentData);
    } else {
      const filtered = mockRespondentData.filter(
        (item) =>
          item.qid.toLowerCase().includes(value.toLowerCase()) ||
          item.question.toLowerCase().includes(value.toLowerCase()) ||
          item.answer.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filtered);
    }
  };

  const handleDownload = () => {
    // Create CSV content
    let csvContent = "QID,Question,Answer\n";

    filteredData.forEach((row) => {
      csvContent += `"${row.qid}","${row.question}","${row.answer}"\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `respondent_${serial || "RS-12345"}_data.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100"
              >
                <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">
                  Respondent Details
                </h1>
                <div className="flex gap-4 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md font-medium">
                    SID: {projectId || "S2501234"}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-md font-medium">
                    Serial: {serial || "RS-12345"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* Controls */}
          <div className="bg-slate-50 p-6 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <div className="relative">
                  <Input
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 text-sm w-80 border-slate-300 focus:border-blue-500 rounded-md"
                  />
                  <Icon
                    icon="heroicons:magnifying-glass"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4"
                  />
                </div>
                <Button
                  onClick={handleDownload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm"
                  size="sm"
                >
                  <Icon
                    icon="heroicons:arrow-down-tray"
                    className="w-4 h-4 mr-2"
                  />
                  Download CSV
                </Button>
              </div>
              <div className="bg-white px-3 py-2 rounded-md border border-slate-200">
                <span className="text-sm font-medium text-slate-600">
                  {filteredData.length} responses
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-100 to-green-100 border-b-2 border-blue-200">
                  <TableHead className="text-sm font-bold text-blue-800 py-4">
                    🏷️ Question ID
                  </TableHead>
                  <TableHead className="text-sm font-bold text-green-800 py-4">
                    💬 Response
                  </TableHead>
                  <TableHead className="text-sm font-bold text-yellow-800 py-4 text-center">
                    �� Screenshot
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-25 hover:to-green-25 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <TableCell className="text-sm text-gray-700 align-top py-6">
                      <div className="space-y-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-center inline-block">
                          {item.qid}
                        </div>
                        <div className="text-gray-600 text-sm font-medium leading-relaxed">
                          {item.question}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 align-top py-6">
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                        {item.answer}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm align-top py-6">
                      <div className="flex justify-center">
                        {item.screenshot ? (
                          <div
                            className="w-20 h-16 bg-yellow-100 rounded-lg border-2 border-yellow-300 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
                            onClick={() =>
                              window.open(item.screenshot, "_blank")
                            }
                            title="Click to zoom in new tab"
                          >
                            <img
                              src={item.screenshot}
                              alt={`${item.qid} Screenshot`}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-16 bg-red-100 border-2 border-red-300 rounded-lg flex items-center justify-center">
                            <Icon
                              icon="heroicons:photo"
                              className="text-red-400 text-2xl"
                            />
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12 bg-gradient-to-r from-red-50 to-yellow-50">
              <Icon
                icon="heroicons:magnifying-glass-minus"
                className="w-16 h-16 text-red-400 mx-auto mb-4"
              />
              <div className="text-xl font-bold text-red-600 mb-2">
                🔍 No results found
              </div>
              <div className="text-gray-600">
                No responses match "{searchTerm}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
