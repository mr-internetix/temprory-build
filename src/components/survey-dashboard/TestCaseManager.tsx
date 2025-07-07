import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionSelector } from "./QuestionSelector";
import { Icon } from "@iconify/react";
import { TestCase, MddQuestion } from "./SurveyForm";

interface TestCaseManagerProps {
  testCase: TestCase;
  onUpdate: (updates: Partial<TestCase>) => void;
  onRemove: () => void;
  availableQuestions: MddQuestion[];
}

export function TestCaseManager({
  testCase,
  onUpdate,
  onRemove,
  availableQuestions,
}: TestCaseManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestionForConfig, setSelectedQuestionForConfig] =
    useState("");

  const handleQuestionUpdate = (questionId: string, config: any) => {
    const updatedQuestions = {
      ...testCase.questions,
      [questionId]: config,
    };
    onUpdate({ questions: updatedQuestions });
    setShowQuestionSelector(false);
  };

  const handleDirectQuestionSelect = (questionId: string) => {
    if (questionId && questionId !== "please-select") {
      setSelectedQuestionForConfig(questionId);
      setShowQuestionSelector(true);
    }
  };

  const removeQuestion = (questionId: string) => {
    const updatedQuestions = { ...testCase.questions };
    delete updatedQuestions[questionId];
    onUpdate({ questions: updatedQuestions });
  };

  const editQuestion = (questionId: string) => {
    setSelectedQuestionForConfig(questionId);
    setShowQuestionSelector(true);
  };

  const configuredQuestions = Object.keys(testCase.questions);

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4">
      {/* Test Case Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h4 className="text-md font-semibold">
            Test Case:{" "}
            <span className="text-blue-600">
              {testCase.name || "New Test Case"}
            </span>
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 transition-transform"
            style={{
              transform: isCollapsed ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <Icon icon="heroicons:chevron-down" className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700"
          >
            <Icon icon="heroicons:trash" className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Test Case Content - Collapsible */}
      {!isCollapsed && (
        <div className="space-y-4">
          {/* Test Case Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Case Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter test case name"
              value={testCase.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Questions Section */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Questions
            </h5>
            <div className="space-y-2 mb-2">
              {configuredQuestions.length > 0 ? (
                configuredQuestions.map((questionId) => {
                  const questionData = testCase.questions[questionId];
                  const question = availableQuestions.find(
                    (q) => q.id === questionId,
                  );
                  return (
                    <div
                      key={questionId}
                      className="p-3 bg-white rounded border border-gray-200"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-medium">
                          {questionId}: {question?.text || "Question"}
                        </h6>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => editQuestion(questionId)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          Selected:{" "}
                          {questionData?.selectedAnswers?.join(", ") || "None"}
                        </p>
                        <p>
                          Assignment:{" "}
                          {questionData?.assignment === "assign"
                            ? "Assign on selected"
                            : "Do not assign on selected"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No questions added yet
                </div>
              )}
            </div>

            {/* Add Question Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionForConfig("");
                setShowQuestionSelector(true);
              }}
              className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
              disabled={availableQuestions.length === 0}
            >
              <Icon icon="heroicons:plus" className="w-4 h-4" />
              Add Question
            </Button>
          </div>

          {/* Test Case Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Generate Screenshot <span className="text-red-500">*</span>
              </label>
              <Select
                value={testCase.screenshot || ""}
                onValueChange={(value) => onUpdate({ screenshot: value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Device Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={testCase.deviceType || ""}
                onValueChange={(value) => onUpdate({ deviceType: value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Completes <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={testCase.completes}
                onChange={(e) =>
                  onUpdate({ completes: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Question Selector Modal */}
      {showQuestionSelector && (
        <div className="mt-4">
          <QuestionSelector
            onQuestionSelected={handleQuestionUpdate}
            onClose={() => {
              setShowQuestionSelector(false);
              setSelectedQuestionForConfig("");
            }}
            availableQuestions={availableQuestions}
            preSelectedQuestion={selectedQuestionForConfig}
            existingQuestionData={
              selectedQuestionForConfig
                ? testCase.questions[selectedQuestionForConfig]
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
