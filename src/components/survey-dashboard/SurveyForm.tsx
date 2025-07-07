import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TestCaseManager } from "./TestCaseManager";
import { QuestionSelector } from "./QuestionSelector";
import { Icon } from "@iconify/react";

interface SurveyFormProps {
  onSubmit: (data: any) => void;
}

export interface TestCase {
  id: string;
  name: string;
  questions: { [questionId: string]: any };
  completes: number;
  screenshot: string;
  deviceType: string;
}

export interface MddQuestion {
  id: string;
  text: string;
  type: string;
  options?: { id: string; text: string }[];
}

export function SurveyForm({ onSubmit }: SurveyFormProps) {
  const [surveyUrl, setSurveyUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [testingOption, setTestingOption] = useState("");

  // Option 1 fields
  const [option1Screenshot, setOption1Screenshot] = useState("");
  const [option1DeviceType, setOption1DeviceType] = useState("");
  const [option1Completes, setOption1Completes] = useState<number>(1);

  // Option 2 fields
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [mddQuestions, setMddQuestions] = useState<MddQuestion[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("S24055977 1.mdd");
  const [isProcessingMdd, setIsProcessingMdd] = useState(false);

  const addTestCase = () => {
    if (mddQuestions.length === 0) {
      alert("MDD file is required before creating any test case");
      return;
    }

    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: `Test Case ${testCases.length + 1}`,
      questions: {},
      completes: 1,
      screenshot: "",
      deviceType: "",
    };
    setTestCases([...testCases, newTestCase]);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, ...updates } : tc)),
    );
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter((tc) => tc.id !== id));
  };

  const handleMddUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingMdd(true);
      setUploadedFileName(file.name);

      // Simulate MDD processing delay
      setTimeout(() => {
        try {
          // Sample questions for demo
          const sampleQuestions: MddQuestion[] = [
            {
              id: "QID1",
              text: "How satisfied are you with our product?",
              type: "single",
              options: [
                { id: "_1", text: "Very Satisfied" },
                { id: "_2", text: "Satisfied" },
                { id: "_3", text: "Neutral" },
                { id: "_4", text: "Dissatisfied" },
                { id: "_5", text: "Very Dissatisfied" },
              ],
            },
            {
              id: "QID2",
              text: "Would you recommend our product to others?",
              type: "single",
              options: [
                { id: "_1", text: "Yes" },
                { id: "_2", text: "No" },
                { id: "_3", text: "Maybe" },
              ],
            },
            {
              id: "QID3",
              text: "What features do you use most often?",
              type: "multiple",
              options: [
                { id: "_1", text: "Feature A" },
                { id: "_2", text: "Feature B" },
                { id: "_3", text: "Feature C" },
                { id: "_4", text: "Feature D" },
                { id: "_5", text: "Feature E" },
              ],
            },
            {
              id: "QID4",
              text: "How often do you use our product?",
              type: "single",
              options: [
                { id: "_1", text: "Daily" },
                { id: "_2", text: "Weekly" },
                { id: "_3", text: "Monthly" },
                { id: "_4", text: "Rarely" },
                { id: "_5", text: "Never" },
              ],
            },
          ];

          setMddQuestions(sampleQuestions);
          setIsProcessingMdd(false);
        } catch (error) {
          console.error("Error parsing MDD file:", error);
          alert("Error parsing MDD file. Please check the file format.");
          setIsProcessingMdd(false);
        }
      }, 1500);
    }
  };

  const handleSubmit = () => {
    if (!surveyUrl.trim()) {
      alert("Please enter a survey link.");
      return;
    }

    if (!projectName.trim()) {
      alert("Please enter a project name.");
      return;
    }

    if (!testingOption) {
      alert("Please select a testing option.");
      return;
    }

    if (testingOption === "option1") {
      if (!option1Screenshot || !option1DeviceType || !option1Completes) {
        alert("Please fill out all required fields for Option 1.");
        return;
      }
    } else if (testingOption === "option2") {
      if (mddQuestions.length === 0) {
        alert("Please upload and process an MDD file before submitting.");
        return;
      }
      if (testCases.length === 0) {
        alert("Please add at least one test case before submitting.");
        return;
      }
    }

    const formData = {
      surveyUrl,
      projectName,
      testingOption,
      option1:
        testingOption === "option1"
          ? {
              screenshot: option1Screenshot,
              deviceType: option1DeviceType,
              completes: option1Completes,
            }
          : null,
      option2:
        testingOption === "option2"
          ? {
              testCases,
              mddQuestions,
              uploadedFileName,
            }
          : null,
      timestamp: new Date().toISOString(),
    };
    onSubmit(formData);
  };

  const isFormValid = () => {
    if (!surveyUrl.trim() || !projectName.trim() || !testingOption)
      return false;

    if (testingOption === "option1") {
      return option1Screenshot && option1DeviceType && option1Completes;
    } else if (testingOption === "option2") {
      if (mddQuestions.length === 0 || testCases.length === 0) return false;

      // Check if all test cases are valid
      return testCases.every(
        (tc) =>
          tc.name.trim() &&
          tc.screenshot &&
          tc.deviceType &&
          tc.completes &&
          Object.keys(tc.questions).length > 0,
      );
    }

    return false;
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Survey URL */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Project Information
          </h3>
        </div>
        <div className="ml-11 space-y-4">
          <div>
            <label
              htmlFor="projectName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Icon
                icon="heroicons:magnifying-glass"
                className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                id="projectName"
                placeholder="Search or enter project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Enter or search for the project name to associate with this
              request
            </div>
          </div>
          <div>
            <label
              htmlFor="surveyUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Survey Link <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              id="surveyUrl"
              placeholder="https://survey.example.com/your-survey"
              value={surveyUrl}
              onChange={(e) => setSurveyUrl(e.target.value)}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              Enter the survey link to be tested via idatagenerator
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Select Testing Option */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            2
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Select Testing Option
          </h3>
        </div>
        <div className="ml-11 space-y-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="option1"
              name="testingOption"
              value="option1"
              checked={testingOption === "option1"}
              onChange={(e) => setTestingOption(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="option1"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Option 1: Completes without Test Cases
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="option2"
              name="testingOption"
              value="option2"
              checked={testingOption === "option2"}
              onChange={(e) => setTestingOption(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="option2"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Option 2: Completes with Test Cases
            </label>
          </div>
        </div>
      </div>

      {/* Option 1 Fields */}
      {testingOption === "option1" && (
        <div className="ml-11 pl-4 border-l-2 border-blue-200 space-y-4">
          <h4 className="text-md font-semibold text-blue-800">
            Option 1: Fill out this section for completes without Test Case(s)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="generateScreenshot1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Generate Screenshot <span className="text-red-500">*</span>
              </label>
              <Select
                value={option1Screenshot}
                onValueChange={setOption1Screenshot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="deviceType1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Device Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={option1DeviceType}
                onValueChange={setOption1DeviceType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor="completes1"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Number of Completes <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                id="completes1"
                min="1"
                value={option1Completes}
                onChange={(e) =>
                  setOption1Completes(parseInt(e.target.value) || 1)
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Option 2 Fields */}
      {testingOption === "option2" && (
        <div className="ml-11 pl-4 border-l-2 border-blue-200 space-y-6">
          <h4 className="text-md font-semibold text-blue-800">
            Option 2: Fill out this section for completes with Test Case(s)
          </h4>

          {/* MDD Upload */}
          <div className="space-y-2">
            <label
              htmlFor="mddFile"
              className="block text-sm font-medium text-gray-700"
            >
              Upload MDD File <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <input
                  type="file"
                  id="mddFile"
                  accept=".mdd,.xml,.txt"
                  onChange={handleMddUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isProcessingMdd}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={isProcessingMdd}
                >
                  {isProcessingMdd ? (
                    <>
                      <Icon
                        icon="heroicons:arrow-path"
                        className="w-4 h-4 animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    "Choose file"
                  )}
                </Button>
              </div>
              <span className="text-sm text-gray-500">{uploadedFileName}</span>
            </div>
            <p className="text-xs text-gray-500">
              MDD file is required before creating any test case
            </p>
          </div>

          {/* Test Cases Container */}
          <div className="space-y-4">
            {testCases.map((testCase) => (
              <TestCaseManager
                key={testCase.id}
                testCase={testCase}
                onUpdate={(updates) => updateTestCase(testCase.id, updates)}
                onRemove={() => removeTestCase(testCase.id)}
                availableQuestions={mddQuestions}
              />
            ))}
          </div>

          {/* Add Test Case Button */}
          <Button
            type="button"
            onClick={addTestCase}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={mddQuestions.length === 0}
          >
            <Icon icon="heroicons:plus" className="w-4 h-4" />
            Add Test Case
          </Button>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 mt-8">
        <Button
          type="submit"
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          disabled={!isFormValid()}
        >
          Submit Request
        </Button>
      </div>
    </div>
  );
}
