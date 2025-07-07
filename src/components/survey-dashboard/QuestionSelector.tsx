import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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

const defaultQuestions = [
  "Please select question --",
  "Skip Termination logics",
  "Market_zipcode",
  "Year/month",
  "Gender",
  "Race",
  "US_income",
  "Q1",
  "Q2",
  "Q3",
  "Q4",
  "Q5",
];

const defaultAnswers = [
  { id: "_1", text: "Brand A" },
  { id: "_2", text: "Brand B" },
  { id: "_3", text: "Brand C" },
  { id: "_4", text: "Brand D" },
  { id: "_99", text: "None" },
];

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
    existingQuestionData?.assignmentType || "assign",
  );
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    existingQuestionData?.selectedAnswers || [],
  );
  const [skipTermination, setSkipTermination] = useState(
    existingQuestionData?.skipTermination || false,
  );

  // Use MDD questions if available, otherwise use default questions
  const questionOptions =
    availableQuestions.length > 0
      ? [
          "Please select question --",
          "Skip Termination logics",
          ...availableQuestions.map((q) => q.id),
        ]
      : defaultQuestions;

  // Get the selected question data from MDD
  const selectedQuestionData = availableQuestions.find(
    (q) => q.id === selectedQuestion,
  );
  const availableAnswers = selectedQuestionData?.options || defaultAnswers;

  const handleAnswerToggle = (answerId: string) => {
    setSelectedAnswers((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId],
    );
  };

  const handleSaveAnswer = () => {
    if (!selectedQuestion || selectedQuestion === "Please select question --") {
      return;
    }

    const config = {
      questionId: selectedQuestion,
      assignmentType,
      selectedAnswers,
      skipTermination,
      questionText:
        selectedQuestionData?.text || `${selectedQuestion} Qtext here...?`,
      questionType: selectedQuestionData?.type || "single",
    };

    onQuestionSelected(selectedQuestion, config);
  };

  const showQuestionConfig =
    selectedQuestion && selectedQuestion !== "Please select question --";

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white space-y-4">
      {/* Question Dropdown */}
      <Select value={selectedQuestion} onValueChange={setSelectedQuestion}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Please select question --" />
        </SelectTrigger>
        <SelectContent>
          {questionOptions.map((question) => (
            <SelectItem key={question} value={question}>
              {question}
              {question === "Skip Termination logics" && (
                <span className="text-red-500 text-xs ml-2">
                  - if selected, this will auto avoid the selection of the
                  terminated options
                </span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Question Configuration */}
      {showQuestionConfig && (
        <div className="space-y-4 border-t pt-4">
          <div className="text-sm font-medium text-gray-700">
            {selectedQuestionData?.text || `${selectedQuestion} Qtext here...?`}
          </div>

          {/* Assignment Type */}
          <RadioGroup value={assignmentType} onValueChange={setAssignmentType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="assign" id="assign" />
              <Label htmlFor="assign">Assign on selected</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no-assign" id="no-assign" />
              <Label htmlFor="no-assign">Do not assign on selected</Label>
            </div>
          </RadioGroup>

          {/* Answer Options */}
          <div className="space-y-2">
            {availableAnswers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2">
                <Checkbox
                  id={answer.id}
                  checked={selectedAnswers.includes(answer.id)}
                  onCheckedChange={() => handleAnswerToggle(answer.id)}
                />
                <Label htmlFor={answer.id} className="text-sm">
                  {answer.id} {answer.text}
                </Label>
              </div>
            ))}
          </div>

          {/* Skip Termination Logic */}
          {selectedQuestion === "Skip Termination logics" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="skip-termination"
                checked={skipTermination}
                onCheckedChange={setSkipTermination}
              />
              <Label
                htmlFor="skip-termination"
                className="text-sm text-red-500"
              >
                if selected, this will auto avoid the selection of the
                terminated options
              </Label>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveAnswer}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              Save answer
            </Button>
          </div>

          <div className="text-xs text-red-500 italic">
            Once clicked, the qID will display in Test Case box, then the
            question div is hidden
          </div>
        </div>
      )}

      {!showQuestionConfig && (
        <div className="text-xs text-red-500 italic">
          This question box is dynamic. Will be hidden if there's no selected
          question id
        </div>
      )}
    </div>
  );
}
