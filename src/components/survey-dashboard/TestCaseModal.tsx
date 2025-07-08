import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Icon } from "@iconify/react";

interface TestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "edit" | "duplicate";
  testCaseData?: {
    id: string;
    name: string;
    requestId: string;
    completes: number;
    device: string;
    screenshots: string;
  };
  onSave: (data: any) => void;
}

export function TestCaseModal({
  isOpen,
  onClose,
  mode,
  testCaseData,
  onSave,
}: TestCaseModalProps) {
  const [testCaseName, setTestCaseName] = useState(
    mode === "duplicate"
      ? `${testCaseData?.name || "Test Case"} (Copy)`
      : testCaseData?.name || "",
  );
  const [completes, setCompletes] = useState(testCaseData?.completes || 100);
  const [screenshot, setScreenshot] = useState(
    testCaseData?.screenshots || "Yes",
  );
  const [deviceType, setDeviceType] = useState(
    testCaseData?.device || "Desktop",
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [qids, setQids] = useState([
    {
      id: "QID1",
      name: "Product Selection",
      hint: 'Select "Smartphone"',
    },
    {
      id: "QID3",
      name: "Usage Frequency",
      hint: 'Select "Daily"',
    },
    {
      id: "QID7",
      name: "Satisfaction Rating",
      hint: 'Select "Very Satisfied"',
    },
  ]);

  const [showAddQidModal, setShowAddQidModal] = useState(false);
  const [showEditQidModal, setShowEditQidModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQid, setSelectedQid] = useState("");
  const [selectedQidOptions, setSelectedQidOptions] = useState<any>({});
  const [assignmentOption, setAssignmentOption] = useState("");
  const [editingQid, setEditingQid] = useState<any>(null);
  const [qidToDelete, setQidToDelete] = useState<any>(null);

  const handleSave = () => {
    const data = {
      name: testCaseName,
      completes,
      screenshot,
      deviceType,
      qids,
      file: selectedFile,
    };
    onSave(data);
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const removeQid = (qidId: string) => {
    setQids(qids.filter((q) => q.id !== qidId));
  };

  const editQid = (qid: any) => {
    setEditingQid(qid);
    setShowEditQidModal(true);
  };

  const availableQids = [
    {
      id: "QID2",
      name: "Brand Awareness",
      type: "checkbox",
      question: "Which brands are you aware of?",
      options: ["Apple", "Samsung", "Google", "Xiaomi"],
    },
    {
      id: "QID4",
      name: "Feature Importance",
      type: "ranking",
      question: "Rank the importance of these features (1-5):",
      options: ["Camera Quality", "Battery Life", "Price"],
    },
    {
      id: "QID5",
      name: "Purchase Intent",
      type: "radio",
      question: "How likely are you to purchase this product?",
      options: [
        "Very Likely",
        "Somewhat Likely",
        "Neutral",
        "Somewhat Unlikely",
        "Very Unlikely",
      ],
    },
    {
      id: "QID6",
      name: "Price Sensitivity",
      type: "radio",
      question: "What price range would you consider reasonable?",
      options: [
        "Under $500",
        "$500-$800",
        "$801-$1000",
        "$1001-$1500",
        "Over $1500",
      ],
    },
    {
      id: "QID8",
      name: "Net Promoter Score",
      type: "radio",
      question: "How likely are you to recommend our product?",
      options: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
  ];

  const modalTitle = mode === "edit" ? "Edit Test Case" : "Duplicate Test Case";
  const actionButtonText =
    mode === "edit" ? "Save Changes" : "Create Duplicate";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">
              {modalTitle}
            </DialogTitle>
            <p className="text-gray-600">
              Configure and manage your survey test case
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Survey Link Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Link
              </label>
              <div className="relative">
                <Input
                  value="https://example.com/survey/12345"
                  className="pr-24"
                  readOnly
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  &test=true
                </span>
              </div>
            </div>

            {/* Step 1: Re-upload MDD */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Step 1: Re-upload new MDD (if needed)
              </h3>
              <p className="text-gray-600 mb-4">
                Current MDD file:{" "}
                <span className="font-medium">survey_structure_v2.mdd</span>
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <Icon
                    icon="heroicons:document"
                    className="h-10 w-10 text-emerald-600 mx-auto"
                  />
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    survey_structure_v2.mdd
                  </p>
                  <p className="text-xs text-gray-500">
                    Uploaded on May 15, 2023
                  </p>
                </div>
                <label className="cursor-pointer">
                  <Button
                    variant="outline"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Re-upload New MDD File
                  </Button>
                  <input
                    type="file"
                    accept=".mdd"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Only re-upload if you have a newer version of the MDD file
                </p>
              </div>
            </div>

            {/* Step 2: Edit Test Case */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Step 2: {mode === "edit" ? "Edit" : "Configure"} Test Case
              </h3>

              {/* Test Case Name and Number of Completes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Case Name
                  </label>
                  <Input
                    value={testCaseName}
                    onChange={(e) => setTestCaseName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Completes
                  </label>
                  <Input
                    type="number"
                    value={completes}
                    onChange={(e) => setCompletes(Number(e.target.value))}
                    min="1"
                  />
                </div>
              </div>

              {/* Test Case QIDs with Hints */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3">
                  Test Case QIDs with Hints
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Click on a QID to edit its hint or remove it from the test
                  case.
                </p>

                <div className="space-y-3">
                  {qids.map((qid) => (
                    <div
                      key={qid.id}
                      className="p-4 border border-gray-200 rounded-lg flex justify-between items-center"
                    >
                      <div className="flex-grow">
                        <div className="flex items-center">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mr-3">
                            {qid.id}
                          </span>
                          <span className="text-gray-800">{qid.name}</span>
                        </div>
                        <span className="text-sm text-gray-600 ml-16">
                          {qid.hint}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editQid(qid)}
                          className="p-1 hover:bg-blue-50"
                        >
                          <Icon icon="heroicons:pencil" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setQidToDelete(qid);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 hover:bg-red-50"
                        >
                          <Icon icon="heroicons:trash" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add QID Button */}
                  <Button
                    variant="outline"
                    onClick={() => setShowAddQidModal(true)}
                    className="w-full p-4 border-dashed"
                  >
                    <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
                    Add QID to Test Case
                  </Button>
                </div>
              </div>

              {/* Screenshot and Device Type options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Screenshot
                  </label>
                  <Select value={screenshot} onValueChange={setScreenshot}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Device Type
                  </label>
                  <Select value={deviceType} onValueChange={setDeviceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Desktop">Desktop</SelectItem>
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionButtonText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add QID Modal */}
      <Dialog open={showAddQidModal} onOpenChange={setShowAddQidModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add QID to Test Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select QID
              </label>
              <Select
                value={selectedQid}
                onValueChange={(value) => {
                  setSelectedQid(value);
                  setSelectedQidOptions({});
                  setAssignmentOption("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a QID" />
                </SelectTrigger>
                <SelectContent>
                  {availableQids.map((qid) => (
                    <SelectItem key={qid.id} value={qid.id}>
                      {qid.id} - {qid.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedQid &&
              (() => {
                const qidData = availableQids.find((q) => q.id === selectedQid);
                if (!qidData) return null;

                return (
                  <div className="space-y-4">
                    {/* Question display */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        {qidData.question}
                      </p>
                    </div>

                    {/* Different UI based on question type */}
                    {qidData.type === "checkbox" && (
                      <div className="space-y-3">
                        {qidData.options.map((option) => (
                          <div key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`${selectedQid}-${option}`}
                              checked={selectedQidOptions[option] || false}
                              onChange={(e) =>
                                setSelectedQidOptions((prev) => ({
                                  ...prev,
                                  [option]: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={`${selectedQid}-${option}`}
                              className="ml-3 block text-sm text-gray-700"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {qidData.type === "radio" && (
                      <div className="space-y-3">
                        {qidData.options.map((option) => (
                          <div key={option} className="flex items-center">
                            <input
                              type="radio"
                              id={`${selectedQid}-${option}`}
                              name={`${selectedQid}-options`}
                              value={option}
                              checked={selectedQidOptions.selected === option}
                              onChange={(e) =>
                                setSelectedQidOptions({
                                  selected: e.target.value,
                                })
                              }
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <label
                              htmlFor={`${selectedQid}-${option}`}
                              className="ml-3 block text-sm text-gray-700"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}

                    {qidData.type === "ranking" && (
                      <div className="space-y-4">
                        {qidData.options.map((option) => (
                          <div key={option} className="flex items-center gap-4">
                            <Select
                              value={selectedQidOptions[option] || ""}
                              onValueChange={(value) =>
                                setSelectedQidOptions((prev) => ({
                                  ...prev,
                                  [option]: value,
                                }))
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select importance" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">
                                  1 - Not Important
                                </SelectItem>
                                <SelectItem value="2">
                                  2 - Slightly Important
                                </SelectItem>
                                <SelectItem value="3">
                                  3 - Moderately Important
                                </SelectItem>
                                <SelectItem value="4">4 - Important</SelectItem>
                                <SelectItem value="5">
                                  5 - Very Important
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium min-w-fit">
                              {option}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assignment Options */}
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Assignment Options:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="assign-selected"
                            name="assignment"
                            value="assign"
                            checked={assignmentOption === "assign"}
                            onChange={(e) =>
                              setAssignmentOption(e.target.value)
                            }
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <label
                            htmlFor="assign-selected"
                            className="ml-3 block text-sm text-gray-700"
                          >
                            Assign on Selected
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="do-not-assign"
                            name="assignment"
                            value="do-not-assign"
                            checked={assignmentOption === "do-not-assign"}
                            onChange={(e) =>
                              setAssignmentOption(e.target.value)
                            }
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <label
                            htmlFor="do-not-assign"
                            className="ml-3 block text-sm text-gray-700"
                          >
                            Do not assign on selected
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddQidModal(false);
                  setSelectedQid("");
                  setSelectedQidOptions({});
                  setAssignmentOption("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedQid && assignmentOption) {
                    const qidData = availableQids.find(
                      (q) => q.id === selectedQid,
                    );
                    if (qidData) {
                      let hint = "";
                      if (qidData.type === "checkbox") {
                        const selected = Object.keys(selectedQidOptions).filter(
                          (key) => selectedQidOptions[key],
                        );
                        hint =
                          selected.length > 0
                            ? `Select "${selected.join(", ")}"`
                            : "No options selected";
                      } else if (qidData.type === "radio") {
                        hint = selectedQidOptions.selected
                          ? `Select "${selectedQidOptions.selected}"`
                          : "No option selected";
                      } else if (qidData.type === "ranking") {
                        const rankings = Object.entries(
                          selectedQidOptions,
                        ).filter(([_, value]) => value);
                        hint =
                          rankings.length > 0
                            ? `Rankings: ${rankings.map(([key, value]) => `${key}(${value})`).join(", ")}`
                            : "No rankings set";
                      }
                      hint += ` (${assignmentOption === "assign" ? "Assign on Selected" : "Do not assign on selected"})`;

                      setQids([
                        ...qids,
                        {
                          id: qidData.id,
                          name: qidData.name,
                          hint: hint,
                        },
                      ]);
                    }
                    setSelectedQid("");
                    setSelectedQidOptions({});
                    setAssignmentOption("");
                    setShowAddQidModal(false);
                  }
                }}
                disabled={!selectedQid || !assignmentOption}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Add QID
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit QID Modal */}
      <Dialog open={showEditQidModal} onOpenChange={setShowEditQidModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit QID Options</DialogTitle>
          </DialogHeader>
          {editingQid &&
            (() => {
              // Find the original QID data to get question type and options
              const originalQid = availableQids.find(
                (q) => q.id === editingQid.id,
              ) || {
                id: editingQid.id,
                name: editingQid.name,
                type: "radio",
                question: "Select the option to use for this question:",
                options: [
                  "Very Satisfied",
                  "Satisfied",
                  "Neutral",
                  "Dissatisfied",
                  "Very Dissatisfied",
                ],
              };

              return (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mr-3">
                      {editingQid.id}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {editingQid.name}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      {originalQid.question}
                    </p>

                    {/* Show options based on question type */}
                    <div className="space-y-3">
                      {originalQid.options.map((option) => (
                        <div key={option} className="flex items-center">
                          <input
                            type="radio"
                            id={`edit-${editingQid.id}-${option}`}
                            name={`edit-${editingQid.id}-options`}
                            value={option}
                            defaultChecked={editingQid.hint.includes(option)}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                          />
                          <label
                            htmlFor={`edit-${editingQid.id}-${option}`}
                            className="ml-3 block text-sm font-medium text-gray-700"
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditQidModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        const selectedOption = document.querySelector(
                          `input[name="edit-${editingQid.id}-options"]:checked`,
                        ) as HTMLInputElement;
                        if (selectedOption) {
                          const updatedHint = `Select "${selectedOption.value}"`;
                          setQids(
                            qids.map((q) =>
                              q.id === editingQid.id
                                ? { ...q, hint: updatedHint }
                                : q,
                            ),
                          );
                        }
                        setShowEditQidModal(false);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          {qidToDelete && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-medium">{qidToDelete.id}</span> from the
                test case?
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No, Keep It
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    removeQid(qidToDelete.id);
                    setShowDeleteModal(false);
                  }}
                >
                  Yes, Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
