import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";

interface TestCaseData {
  id: string;
  name: string;
  description: string;
  deviceType: string;
  completes: number;
  screenshot: boolean;
  selectedVariables: Array<{
    variable_id: string;
    variable_name: string;
    variable_label: string;
    datatype: string;
    selected_options?: string[];
    assignment_type?: "assign" | "do-not-assign";
    stop_at_question?: boolean;
  }>;
  projectId: string;
  projectName: string;
}

interface DuplicateTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCaseData | null;
  onDuplicate: (duplicatedTestCase: TestCaseData) => void;
}

export function DuplicateTestCaseModal({
  isOpen,
  onClose,
  testCase,
  onDuplicate,
}: DuplicateTestCaseModalProps) {
  const [duplicatedName, setDuplicatedName] = useState("");
  const [duplicatedDescription, setDuplicatedDescription] = useState("");
  const [duplicatedDeviceType, setDuplicatedDeviceType] = useState("desktop");
  const [duplicatedCompletes, setDuplicatedCompletes] = useState(5);
  const [duplicatedScreenshot, setDuplicatedScreenshot] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when testCase changes
  React.useEffect(() => {
    if (testCase) {
      setDuplicatedName(`${testCase.name} (Copy)`);
      setDuplicatedDescription(testCase.description);
      setDuplicatedDeviceType(testCase.deviceType);
      setDuplicatedCompletes(testCase.completes);
      setDuplicatedScreenshot(testCase.screenshot);
    }
  }, [testCase]);

  const handleDuplicate = async () => {
    if (!testCase || !duplicatedName.trim()) return;

    setIsSubmitting(true);
    try {
      const duplicatedTestCase: TestCaseData = {
        ...testCase,
        id: `duplicate-${Date.now()}`,
        name: duplicatedName,
        description: duplicatedDescription,
        deviceType: duplicatedDeviceType,
        completes: duplicatedCompletes,
        screenshot: duplicatedScreenshot,
      };

      onDuplicate(duplicatedTestCase);
      onClose();
    } catch (error) {
      console.error("Error duplicating test case:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setDuplicatedName("");
    setDuplicatedDescription("");
    setDuplicatedDeviceType("desktop");
    setDuplicatedCompletes(5);
    setDuplicatedScreenshot(true);
  };

  if (!testCase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Duplicate Test Case
              </DialogTitle>
              <p className="text-gray-600 text-sm mt-1">
                Create a copy of "{testCase.name}" with modifications
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon icon="heroicons:x-mark" className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Test Case Info */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Original Test Case</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Project:</span>
                <Badge variant="outline">{testCase.projectName}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="text-sm font-medium">{testCase.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Variables:</span>
                <Badge variant="secondary">{testCase.selectedVariables.length} selected</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Settings:</span>
                <Badge variant="outline">{testCase.deviceType}</Badge>
                <Badge variant="outline">{testCase.completes} completes</Badge>
                <Badge variant="outline">
                  Screenshot: {testCase.screenshot ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Duplicate Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Configure Duplicate
            </h3>

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Case Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={duplicatedName}
                  onChange={(e) => setDuplicatedName(e.target.value)}
                  placeholder="Enter name for duplicated test case"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={duplicatedDescription}
                  onChange={(e) => setDuplicatedDescription(e.target.value)}
                  placeholder="Enter description for duplicated test case"
                  className="w-full"
                  rows={3}
                />
              </div>
            </div>

            {/* Test Case Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Device Type
                </label>
                <Select
                  value={duplicatedDeviceType}
                  onValueChange={setDuplicatedDeviceType}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  Number of Completes
                </label>
                <Input
                  type="number"
                  min="1"
                  value={duplicatedCompletes}
                  onChange={(e) => setDuplicatedCompletes(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="duplicate-screenshot"
                  checked={duplicatedScreenshot}
                  onCheckedChange={(checked) => setDuplicatedScreenshot(!!checked)}
                />
                <label
                  htmlFor="duplicate-screenshot"
                  className="text-sm font-medium text-gray-700"
                >
                  Generate Screenshot
                </label>
              </div>
            </div>

            {/* Variable Configuration Preview */}
            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-700">
                Variable Configuration (will be copied)
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-gray-50 rounded border">
                {testCase.selectedVariables.map((variable) => (
                  <div
                    key={variable.variable_id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium">
                        {variable.variable_name}: {variable.variable_label}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {variable.datatype}
                        </Badge>
                        {variable.assignment_type && (
                          <Badge
                            variant={variable.assignment_type === "assign" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {variable.assignment_type === "assign" ? "Assign" : "Do not assign"}
                          </Badge>
                        )}
                        {variable.stop_at_question && (
                          <Badge variant="destructive" className="text-xs">
                            Stop here
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                All variable configurations will be copied to the new test case. 
                You can modify them after duplication.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicatedName.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Icon icon="heroicons:document-duplicate" className="w-4 h-4 mr-2" />
                  Create Duplicate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
