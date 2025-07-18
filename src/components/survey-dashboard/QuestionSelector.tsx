import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MddQuestion } from "./SurveyForm";

interface QuestionSelectorProps {
  onQuestionSelected: (questionId: string, config: any) => void;
  onClose: () => void;
  availableQuestions: MddQuestion[];
  preSelectedQuestion?: string;
  existingQuestionData?: any;
}

export function QuestionSelector({
  onQuestionSelected,
  onClose,
  availableQuestions,
  preSelectedQuestion,
  existingQuestionData,
}: QuestionSelectorProps) {
  const [selectedQuestion, setSelectedQuestion] = useState(
    preSelectedQuestion || "",
  );
  const [assignmentType, setAssignmentType] = useState(
    existingQuestionData?.assignment_type || "assign",
  );
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    existingQuestionData?.selected_options || [],
  );
  const [skipTermination, setSkipTermination] = useState(
    existingQuestionData?.stop_at_question || false,
  );
  const [textValue, setTextValue] = useState(
    existingQuestionData?.text_value || "",
  );
  const [numberValue, setNumberValue] = useState(
    existingQuestionData?.number_value || "",
  );
  const [dateValue, setDateValue] = useState(
    existingQuestionData?.date_value || "",
  );
  const [booleanValue, setBooleanValue] = useState(
    existingQuestionData?.boolean_value || false,
  );

  // Create question options - use proper non-empty values
  const questionOptions = [
    { value: "please_select", label: "Please select question --" },
    { value: "skip_termination", label: "Skip Termination logics" },
    ...availableQuestions.map((q) => ({
      value: q.id,
      label: `${q.text} (${q.type})`, // Show variable name with type
    })),
  ];

  // Get the selected question data
  const selectedQuestionData = availableQuestions.find(
    (q) => q.id === selectedQuestion,
  );

  const handleAnswerToggle = (answerId: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId],
    );
  };

  const handleSave = () => {
    if (!selectedQuestion || selectedQuestion === "please_select") {
      return;
    }

    // Handle skip termination logic
    if (selectedQuestion === "skip_termination") {
      const config = {
        questionId: selectedQuestion,
        assignmentType,
        selectedAnswers: [],
        skipTermination: true,
        questionText: "Skip Termination logics",
        questionType: "special",
      };
      onQuestionSelected(selectedQuestion, config);
      return;
    }

    // Prepare config based on question type
    let config: any = {
      questionId: selectedQuestion,
      assignmentType,
      selectedAnswers,
      skipTermination,
      questionText: selectedQuestionData?.text || selectedQuestion,
      questionType: selectedQuestionData?.type || "text",
    };

    // Add type-specific values
    if (selectedQuestionData?.type === "text") {
      config.textValue = textValue;
    } else if (selectedQuestionData?.type === "numeric" || selectedQuestionData?.type === "double") {
      config.numberValue = numberValue;
    } else if (selectedQuestionData?.type === "date") {
      config.dateValue = dateValue;
    } else if (selectedQuestionData?.type === "boolean") {
      config.booleanValue = booleanValue;
    }

    onQuestionSelected(selectedQuestion, config);
  };

  const showQuestionConfig = selectedQuestion && selectedQuestion !== "please_select";

  const renderInputByType = () => {
    if (!selectedQuestionData) return null;

    const datatype = selectedQuestionData.type;

    switch (datatype) {
      case "text":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Text Value:
            </label>
            <Textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter text value or leave empty for any value"
              rows={3}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              This text will be used as the expected value for this question
            </p>
          </div>
        );

      case "categorical":
        const availableAnswers = selectedQuestionData.options || [];
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Options:
            </label>
            <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
              {availableAnswers.map((answer) => (
                <div key={answer.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={answer.id}
                    checked={selectedAnswers.includes(answer.id)}
                    onCheckedChange={() => handleAnswerToggle(answer.id)}
                  />
                  <Label htmlFor={answer.id} className="text-sm">
                    {answer.id} - {answer.text}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Select the options that should be chosen for this question
            </p>
          </div>
        );

      case "numeric":
      case "double":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {datatype === "numeric" ? "Numeric Value:" : "Double Value:"}
            </label>
            <Input
              type="number"
              value={numberValue}
              onChange={(e) => setNumberValue(e.target.value)}
              placeholder={`Enter ${datatype} value or leave empty for any value`}
              className="w-full"
              step={datatype === "double" ? "0.01" : "1"}
            />
            <p className="text-xs text-gray-500">
              This {datatype} value will be used as the expected value for this question
            </p>
          </div>
        );

      case "date":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Value:
            </label>
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              This date will be used as the expected value for this question
            </p>
          </div>
        );

      case "boolean":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Boolean Value:
            </label>
            <RadioGroup
              value={booleanValue ? "true" : "false"}
              onValueChange={(value) => setBooleanValue(value === "true")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="bool-true" />
                <Label htmlFor="bool-true">True</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="bool-false" />
                <Label htmlFor="bool-false">False</Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-gray-500">
              This boolean value will be used as the expected value for this question
            </p>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              No specific input configuration available for type: {datatype}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Question:
        </label>
        <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Please select question --" />
          </SelectTrigger>
          <SelectContent 
            className="max-h-64 overflow-y-auto z-[10000] max-w-[600px]"
            position="popper"
            sideOffset={4}
            align="start"
          >
            {questionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="max-w-full">
                <div className="w-full max-w-[600px]">
                  <div className="text-sm font-medium truncate">{option.label}</div>
                  {option.value === "skip_termination" && (
                    <div className="text-red-500 text-xs mt-1 whitespace-normal">
                      If selected, this will auto avoid the selection of terminated options
                    </div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Show selected question info */}
      {selectedQuestionData && (
        <div className="p-3 bg-gray-50 rounded border text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p><strong>Variable ID:</strong> {selectedQuestionData.id}</p>
              <p><strong>Variable Name:</strong> {selectedQuestionData.text}</p>
            </div>
            <div>
              <p><strong>Data Type:</strong> 
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                  {selectedQuestionData.type}
                </span>
              </p>
              {selectedQuestionData.options && selectedQuestionData.options.length > 0 && (
                <p><strong>Options:</strong> {selectedQuestionData.options.length} available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question Configuration */}
      {showQuestionConfig && selectedQuestion !== "skip_termination" && (
        <div className="space-y-4 border-t pt-4">
          <div className="text-sm font-medium text-gray-700">
            Configure options for: {selectedQuestionData?.text || selectedQuestion}
          </div>

          {/* Assignment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Type:
            </label>
            <RadioGroup value={assignmentType} onValueChange={setAssignmentType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="assign" id="assign" />
                <Label htmlFor="assign">Assign on selected</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="do-not-assign" id="no-assign" />
                <Label htmlFor="no-assign">Do not assign on selected</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Type-specific Input */}
          <div>
            {renderInputByType()}
          </div>

          {/* Stop at Question */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="stop-termination"
              checked={skipTermination}
              onCheckedChange={setSkipTermination}
            />
            <Label htmlFor="stop-termination" className="text-sm">
              Stop at this question
            </Label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Question
            </Button>
          </div>
        </div>
      )}

      {/* Special handling for Skip Termination logics */}
      {selectedQuestion === "skip_termination" && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="skip-termination-logic"
              checked={skipTermination}
              onCheckedChange={setSkipTermination}
            />
            <Label htmlFor="skip-termination-logic" className="text-sm text-red-500">
              If selected, this will auto avoid the selection of the terminated options
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save Configuration
            </Button>
          </div>
        </div>
      )}

      {!showQuestionConfig && (
        <div className="text-xs text-gray-500 italic">
          Select a question to configure its options
        </div>
      )}
    </div>
  );
}
