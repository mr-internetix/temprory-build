import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@iconify/react";
import { projectApi } from "../../lib/api";
import { useToast } from "@/hooks/use-toast";
import { MddVariable } from "./SurveyForm";
import { QuestionSelector } from "./QuestionSelector";

interface TestCase {
  id: string;
  name: string;
  description: string;
  customSurveyLink: string;
  deviceType: string;
  completes: number;
  screenshot: boolean;
  selectedVariables: {
    variable_id: string;
    variable_name: string;
    variable_label: string;
    datatype: string;
    selected: boolean;
    assignment_type?: "assign" | "do-not-assign";
    selected_options?: string[];
    stop_at_question?: boolean;
    text_value?: string;
    number_value?: string;
    date_value?: string;
    boolean_value?: boolean;
    options?: { code: string; label: string }[];
  }[];
}

interface TestCaseManagerProps {
  testCase: TestCase;
  onUpdate: (updates: Partial<TestCase>) => void;
  onRemove: () => void;
  availableVariables: MddVariable[];
  variableSummary?: any;
  projectDefaults?: any;
  isSubmitting?: boolean;
  projectId?: string;
}

export function TestCaseManager({
  testCase,
  onUpdate,
  onRemove,
  availableVariables,
  variableSummary,
  projectDefaults,
  isSubmitting,
  projectId,
}: TestCaseManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmittingTestCase, setIsSubmittingTestCase] = useState(false);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [selectedQuestionForConfig, setSelectedQuestionForConfig] = useState("");
  const { toast } = useToast();

  // Convert MDD variables to question format for QuestionSelector
  const availableQuestions = availableVariables.map((variable) => ({
    id: variable.id,
    text: variable.variable_label || variable.variable_name,
    type: variable.datatype,
    options: variable.categories?.map((cat) => ({
      id: cat.code,
      text: cat.label,
    })) || [],
  }));

  const handleQuestionUpdate = (questionId: string, config: any) => {
    // Handle special case for skip termination
    if (questionId === "skip_termination") {
      const newVariable = {
        variable_id: questionId,
        variable_name: "skip_termination",
        variable_label: "Skip Termination logics",
        datatype: "special",
        selected: true,
        assignment_type: config.assignmentType === "assign" ? "assign" as const : "do-not-assign" as const,
        selected_options: [],
        stop_at_question: true,
        text_value: "",
        number_value: "",
        date_value: "",
        boolean_value: false,
        options: [],
      };

      // Check if variable already exists
      const existingIndex = testCase.selectedVariables.findIndex(
        (v) => v.variable_id === questionId
      );

      if (existingIndex >= 0) {
        // Update existing variable
        const updatedVariables = [...testCase.selectedVariables];
        updatedVariables[existingIndex] = newVariable;
        onUpdate({ selectedVariables: updatedVariables });
      } else {
        // Add new variable
        onUpdate({
          selectedVariables: [...testCase.selectedVariables, newVariable],
        });
      }

      setShowQuestionSelector(false);
      setSelectedQuestionForConfig("");
      return;
    }

    const variable = availableVariables.find((v) => v.id === questionId);
    if (!variable) return;

    const newVariable = {
      variable_id: variable.id,
      variable_name: variable.variable_name,
      variable_label: variable.variable_label,
      datatype: variable.datatype,
      selected: true,
      assignment_type: config.assignmentType === "assign" ? "assign" as const : "do-not-assign" as const,
      selected_options: config.selectedAnswers || [],
      stop_at_question: config.skipTermination || false,
      text_value: config.textValue || "",
      number_value: config.numberValue || "",
      date_value: config.dateValue || "",
      boolean_value: config.booleanValue || false,
      options: variable.categories || [],
    };

    // Check if variable already exists
    const existingIndex = testCase.selectedVariables.findIndex(
      (v) => v.variable_id === questionId
    );

    if (existingIndex >= 0) {
      // Update existing variable
      const updatedVariables = [...testCase.selectedVariables];
      updatedVariables[existingIndex] = newVariable;
      onUpdate({ selectedVariables: updatedVariables });
    } else {
      // Add new variable
      onUpdate({
        selectedVariables: [...testCase.selectedVariables, newVariable],
      });
    }

    setShowQuestionSelector(false);
    setSelectedQuestionForConfig("");
  };

  const handleDirectQuestionSelect = (questionId: string) => {
    if (questionId && questionId !== "please_select") {
      setSelectedQuestionForConfig(questionId);
      setShowQuestionSelector(true);
    }
  };

  const removeQuestion = (questionId: string) => {
    const updatedVariables = testCase.selectedVariables.filter(
      (v) => v.variable_id !== questionId
    );
    onUpdate({ selectedVariables: updatedVariables });
  };

  const editQuestion = (questionId: string) => {
    setSelectedQuestionForConfig(questionId);
    setShowQuestionSelector(true);
  };

  const handleSubmitTestCase = async () => {
    if (!projectId) {
      toast({
        title: "Error",
        description: "Project ID is required to submit test case",
        variant: "destructive",
      });
      return;
    }

    if (!testCase.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Test case name is required",
        variant: "destructive",
      });
      return;
    }

    if (testCase.selectedVariables.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one variable",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingTestCase(true);

    try {
      const testCaseData = {
        test_case_name: testCase.name,
        test_case_description: testCase.description,
        custom_survey_link: testCase.customSurveyLink,
        device_type: testCase.deviceType,
        number_of_completes: testCase.completes,
        generate_screenshot: testCase.screenshot,
        selected_variables: testCase.selectedVariables,
      };

      const response = await projectApi.createTestCase(projectId, testCaseData);

      toast({
        title: "Success!",
        description: `Test case "${response.test_case_name}" created successfully`,
        variant: "default",
      });

      // Collapse the test case after successful creation
      setIsCollapsed(true);

      console.log("Test case created:", response);
    } catch (error) {
      console.error("Error creating test case:", error);
      toast({
        title: "Error",
        description: "Failed to create test case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTestCase(false);
    }
  };

  const configuredQuestions = testCase.selectedVariables;

  const renderQuestionValue = (questionData: any) => {
    // Handle special case for skip termination
    if (questionData.variable_id === "skip_termination") {
      return "Skip Termination logics - Auto avoid terminated options";
    }

    const variable = availableVariables.find((v) => v.id === questionData.variable_id);
    if (!variable) return "Unknown variable";

    const datatype = variable.datatype;

    switch (datatype) {
      case "text":
        return questionData.text_value 
          ? `Text: "${questionData.text_value}"` 
          : "Text: Any value";

      case "categorical":
        return questionData.selected_options?.length > 0
          ? `Selected: ${questionData.selected_options.join(", ")}`
          : "No options selected";

      case "numeric":
      case "double":
        return questionData.number_value
          ? `${datatype === "numeric" ? "Number" : "Double"}: ${questionData.number_value}`
          : `${datatype === "numeric" ? "Number" : "Double"}: Any value`;

      case "date":
        return questionData.date_value
          ? `Date: ${questionData.date_value}`
          : "Date: Any value";

      case "boolean":
        return `Boolean: ${questionData.boolean_value ? "True" : "False"}`;

      default:
        return `Type: ${datatype}`;
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-4 relative">
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
          {/* Test Case Name and Description */}
          <div className="grid grid-cols-1 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Case Description
              </label>
              <Textarea
                placeholder="Enter test case description"
                value={testCase.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="w-full"
                rows={3}
              />
            </div>
          </div>

          {/* Custom Survey Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Survey Link
            </label>
            <Input
              placeholder="Enter custom survey link (optional)"
              value={testCase.customSurveyLink}
              onChange={(e) => onUpdate({ customSurveyLink: e.target.value })}
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
                configuredQuestions.map((questionData) => {
                  // Handle special case for skip termination
                  if (questionData.variable_id === "skip_termination") {
                    return (
                      <div
                        key={questionData.variable_id}
                        className="p-3 bg-white rounded border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h6 className="font-medium mb-1">
                              Skip Termination logics
                            </h6>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                special
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Stop here
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => editQuestion(questionData.variable_id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(questionData.variable_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{renderQuestionValue(questionData)}</p>
                        </div>
                      </div>
                    );
                  }

                  const question = availableVariables.find(
                    (q) => q.id === questionData.variable_id
                  );
                  return (
                    <div
                      key={questionData.variable_id}
                      className="p-3 bg-white rounded border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h6 className="font-medium mb-1">
                            {question?.variable_name}: {question?.variable_label || "Question"}
                          </h6>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {question?.datatype}
                            </span>
                            {questionData.assignment_type && (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                questionData.assignment_type === "assign" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {questionData.assignment_type === "assign" ? "Assign" : "Do not assign"}
                              </span>
                            )}
                            {questionData.stop_at_question && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                Stop here
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => editQuestion(questionData.variable_id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(questionData.variable_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Icon icon="heroicons:x-mark" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{renderQuestionValue(questionData)}</p>
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
                Device Type <span className="text-red-500">*</span>
              </label>
              <Select
                value={testCase.deviceType}
                onValueChange={(value) => onUpdate({ deviceType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
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
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id={`screenshot-${testCase.id}`}
                checked={testCase.screenshot}
                onCheckedChange={(checked) => onUpdate({ screenshot: !!checked })}
              />
              <label
                htmlFor={`screenshot-${testCase.id}`}
                className="text-sm font-medium text-gray-700"
              >
                Generate Screenshot
              </label>
            </div>
          </div>

          {/* Submit Test Case Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={handleSubmitTestCase}
              disabled={
                isSubmittingTestCase ||
                !testCase.name.trim() ||
                testCase.selectedVariables.length === 0
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmittingTestCase ? (
                <>
                  <Icon
                    icon="heroicons:arrow-path"
                    className="w-4 h-4 mr-2 animate-spin"
                  />
                  Creating Test Case...
                </>
              ) : (
                <>
                  <Icon
                    icon="heroicons:paper-airplane"
                    className="w-4 h-4 mr-2"
                  />
                  Submit Test Case
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Question Selector Modal */}
      {showQuestionSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={() => {
            setShowQuestionSelector(false);
            setSelectedQuestionForConfig("");
          }}></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Select & Configure Question</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowQuestionSelector(false);
                    setSelectedQuestionForConfig("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                </Button>
              </div>
              <div className="min-h-[500px]">
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
                      ? testCase.selectedVariables.find(
                          (v) => v.variable_id === selectedQuestionForConfig
                        )
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}