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
    <div className="bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-500 p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-lg"
              >
                <Icon icon="heroicons:arrow-left" className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-blue-800 mb-2">
                  📊 Respondent Details
                </h1>
                <div className="flex gap-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    SID: {projectId || "S2501234"}
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                    Serial: {serial || "RS-12345"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <div className="relative">
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-3 pr-10 text-sm w-64"
                />
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                />
              </div>
              <Button
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
                size="sm"
              >
                <Icon
                  icon="heroicons:arrow-down-tray"
                  className="w-4 h-4 mr-1"
                />
                Download
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-indigo-100">
                  <TableHead className="text-xs font-semibold text-indigo-800">
                    QID
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-indigo-800">
                    Answers
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-indigo-800">
                    Screenshot
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={index} className="border-b border-gray-200">
                    <TableCell className="text-xs text-gray-700 align-top">
                      <div>
                        <div className="font-medium">{item.qid}</div>
                        <div className="text-gray-500 mt-1">
                          {item.question}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 align-top">
                      {item.answer}
                    </TableCell>
                    <TableCell className="text-xs align-top">
                      <div className="w-16 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        {item.screenshot ? (
                          <img
                            src={item.screenshot}
                            alt={`${item.qid} Screenshot`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Icon
                            icon="heroicons:photo"
                            className="text-gray-400 text-xl"
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No results found for "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
