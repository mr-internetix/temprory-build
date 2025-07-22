import React, { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Special options
  const specialOptions = [
    {
      value: "skip_termination",
      label: "Skip Termination logics",
      type: "special",
      description: "Auto avoid the selection of terminated options",
    },
  ];

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...specialOptions, ...availableQuestions.map((q) => ({
        value: q.id,
        label: `${q.text} (${q.type})`,
        type: q.type,
        description: `Variable ID: ${q.id}`,
        question: q,
      }))];
    }

    const query = searchQuery.toLowerCase();

    // Filter special options
    const filteredSpecial = specialOptions.filter((option) =>
      option.label.toLowerCase().includes(query) ||
      option.description.toLowerCase().includes(query)
    );

    // Filter regular questions
    const filteredRegular = availableQuestions
      .filter((q) =>
        q.id.toLowerCase().includes(query) ||
        q.text.toLowerCase().includes(query) ||
        q.type.toLowerCase().includes(query)
      )
      .map((q) => ({
        value: q.id,
        label: `${q.text} (${q.type})`,
        type: q.type,
        description: `Variable ID: ${q.id}`,
        question: q,
      }));

    return [...filteredSpecial, ...filteredRegular];
  }, [searchQuery, availableQuestions]);

  // Get the selected question data
  const selectedQuestionData = availableQuestions.find(
    (q) => q.id === selectedQuestion,
  );

  // Get display text for selected question
  const getSelectedQuestionDisplay = () => {
    if (!selectedQuestion) return "";
    if (selectedQuestion === "skip_termination") return "Skip Termination logics";
    const question = availableQuestions.find(q => q.id === selectedQuestion);
    return question ? `${question.text} (${question.type})` : selectedQuestion;
  };

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuestionSelect = (questionValue: string) => {
    setSelectedQuestion(questionValue);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };

  const clearSelection = () => {
    setSelectedQuestion("");
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleAnswerToggle = (answerId: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId],
    );
  };

  const handleSave = () => {
    if (!selectedQuestion) {
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

  const showQuestionConfig = selectedQuestion && selectedQuestion !== "";

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
      {/* Question Search Bar */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search & Select Question:
        </label>

        {/* Selected Question Display */}
        {selectedQuestion && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">
              Selected: {getSelectedQuestionDisplay()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-6 w-6 p-0 text-blue-700 hover:bg-blue-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            ref={searchRef}
            type="text"
            placeholder="Search questions by ID, text, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="pl-10 pr-10"
          />
          {isSearchOpen ? (
            <ChevronUp className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          )}
        </div>

        {/* Dropdown with suggestions */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {filteredQuestions.length > 0 ? (
              <>
                {filteredQuestions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleQuestionSelect(option.value)}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {option.description}
                        </div>
                        {option.value === "skip_termination" && (
                          <div className="text-red-500 text-xs mt-1">
                            Auto avoid terminated options
                          </div>
                        )}
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          option.type === "special" 
                            ? "bg-red-100 text-red-800"
                            : option.type === "categorical"
                            ? "bg-green-100 text-green-800"
                            : option.type === "text"
                            ? "bg-blue-100 text-blue-800"
                            : option.type === "numeric" || option.type === "double"
                            ? "bg-purple-100 text-purple-800"
                            : option.type === "boolean"
                            ? "bg-orange-100 text-orange-800"
                            : option.type === "date"
                            ? "bg-pink-100 text-pink-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {option.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                {searchQuery ? `No questions found for "${searchQuery}"` : "No questions available"}
              </div>
            )}
          </div>
        )}
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
          Search and select a question to configure its options
        </div>
      )}
    </div>
  );
}
