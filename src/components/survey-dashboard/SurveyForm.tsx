import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Icon } from "@iconify/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { projectApi, ProjectCreationRequest, ProjectCreationResponse, ProjectSuggestion } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { webSocketService } from "../../lib/websocket_service";

interface SurveyFormProps {
  onSubmit: (data: any) => void;
  onClose?: () => void; // Add optional close function
}

export interface TestCase {
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

// Updated MddVariable interface to match API response
export interface MddVariable {
  id: string;
  variable_name: string;
  new_variable_name: string;
  variable_label: string;
  datatype: string;
  has_categories: boolean;
  category_count: number;
  categories?: { code: string; label: string }[];
}

// New interface for the complete API response
export interface MddVariablesResponse {
  project_id: string;
  project_name: string;
  variables: MddVariable[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
    total_pages: number;
  };
  summary: {
    total_variables: number;
    by_type: {
      text: number;
      categorical: number;
      boolean: number;
      date: number;
      numeric: number;
      double: number;
    };
  };
  filters: {
    type: string;
    search: string;
  };
  project_defaults: {
    device_type: string;
    number_of_completes: number;
    generate_screenshot: boolean;
  };
}

interface MddProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
  message: string;
  filename: string;
  isCompleted: boolean;
  variablesCount?: number;
  processingTime?: string;
}

// Add missing MddQuestion interface
export interface MddQuestion {
  id: string;
  text: string;
  type: string;
  options?: { id: string; text: string }[];
}

export function SurveyForm({ onSubmit, onClose }: SurveyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [surveyUrl, setSurveyUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [testingOption, setTestingOption] = useState("");

  // Project suggestions state
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Option 1 fields (case_type = "1")
  const [option1Screenshot, setOption1Screenshot] = useState("true");
  const [option1DeviceType, setOption1DeviceType] = useState("desktop");
  const [option1Completes, setOption1Completes] = useState<number>(5);

  // Option 2 fields - updated for existing project support
  const [option2Mode, setOption2Mode] = useState<"new" | "existing">("new"); // New state for mode selection
  const [existingProjectId, setExistingProjectId] = useState(""); // For existing project selection
  const [isLoadingExistingProject, setIsLoadingExistingProject] = useState(false);

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [mddVariablesResponse, setMddVariablesResponse] = useState<MddVariablesResponse | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [mddFile, setMddFile] = useState<File | null>(null);

  // MDD Processing state
  const [mddProcessing, setMddProcessing] = useState<MddProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: "",
    message: "",
    filename: "",
    isCompleted: false,
  });

  // API state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdProject, setCreatedProject] = useState<ProjectCreationResponse | null>(null);

  // Debug state for WebSocket
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Add debug logging function
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log("🔍 DEBUG:", logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // Keep last 10 logs
  };

  // WebSocket event handlers with enhanced debugging
  useEffect(() => {
    if (!createdProject?.project_id) {
      addDebugLog("No project ID available for WebSocket connection");
      return;
    }

    addDebugLog(`Setting up WebSocket listeners for project: ${createdProject.project_id}`);

    // Test WebSocket connection
    const testConnection = () => {
      addDebugLog("Testing WebSocket connection...");
      if (webSocketService && typeof webSocketService.addEventListener === 'function') {
        addDebugLog("WebSocket service is available");
      } else {
        addDebugLog("❌ WebSocket service not available or missing addEventListener");
      }
    };
    testConnection();

    // MDD Processing Start Handler
    const handleMddProcessingStart = (message: any) => {
      addDebugLog(`🎬 MDD Processing Start received: ${JSON.stringify(message)}`);
      
      if (message.project_id === createdProject.project_id) {
        addDebugLog("✅ Project ID matches - updating processing state");
        setMddProcessing(prev => {
          const newState = {
            ...prev,
            isProcessing: true,
            progress: 0,
            stage: "starting",
            message: message.message || "MDD processing started",
            filename: message.filename || "Unknown file",
            isCompleted: false,
          };
          addDebugLog(`Updated processing state: ${JSON.stringify(newState)}`);
          return newState;
        });

        toast({
          title: "MDD Processing Started",
          description: `Processing file: ${message.filename}`,
          variant: "default",
        });
      } else {
        addDebugLog(`❌ Project ID mismatch: received ${message.project_id}, expected ${createdProject.project_id}`);
      }
    };

    // MDD Processing Update Handler
    const handleMddProcessingUpdate = (message: any) => {
      addDebugLog(`📊 MDD Processing Update received: ${JSON.stringify(message)}`);
      
      if (message.project_id === createdProject.project_id) {
        addDebugLog("✅ Project ID matches - updating progress");
        setMddProcessing(prev => {
          const newState = {
            ...prev,
            progress: message.progress || 0,
            stage: message.stage || "processing",
            message: message.message || "Processing...",
          };
          addDebugLog(`Updated progress: ${newState.progress}%`);
          return newState;
        });
      } else {
        addDebugLog(`❌ Project ID mismatch: received ${message.project_id}, expected ${createdProject.project_id}`);
      }
    };

    // MDD Processing Completed Handler - Fixed to handle the WebSocket message structure
    const handleMddProcessingCompleted = (message: any) => {
      addDebugLog(`✅ MDD Processing Completed received: ${JSON.stringify(message)}`);
      
      if (message.project_id === createdProject.project_id) {
        addDebugLog("✅ Project ID matches - processing completed");
        setMddProcessing(prev => {
          const newState = {
            ...prev,
            isProcessing: false,
            progress: 100,
            stage: "completed",
            message: message.message || "MDD processing completed",
            isCompleted: true,
            variablesCount: message.variables_count,
            processingTime: message.processing_time,
          };
          addDebugLog(`Final processing state: ${JSON.stringify(newState)}`);
          return newState;
        });

        toast({
          title: "MDD Processing Complete",
          description: `Found ${message.variables_count} variables in ${message.processing_time}`,
          variant: "default",
        });

        // Fetch variables after processing completes
        addDebugLog("Initiating variable fetch...");
        fetchMddVariables(createdProject.project_id);
      } else {
        addDebugLog(`❌ Project ID mismatch: received ${message.project_id}, expected ${createdProject.project_id}`);
      }
    };

    // Register event listeners with your WebSocket service
    try {
      addDebugLog("Registering WebSocket event listeners...");
      webSocketService.addEventListener('idatagenerator_mdd_processing_start', handleMddProcessingStart);
      webSocketService.addEventListener('idatagenerator_mdd_processing_update', handleMddProcessingUpdate);
      webSocketService.addEventListener('idatagenerator_mdd_processed', handleMddProcessingCompleted);
      addDebugLog("✅ WebSocket event listeners registered successfully");
    } catch (error) {
      addDebugLog(`❌ Error registering WebSocket listeners: ${error}`);
    }

    // Cleanup listeners on unmount
    return () => {
      addDebugLog("🧹 Cleaning up WebSocket listeners");
      try {
        webSocketService.removeEventListener('idatagenerator_mdd_processing_start', handleMddProcessingStart);
        webSocketService.removeEventListener('idatagenerator_mdd_processing_update', handleMddProcessingUpdate);
        webSocketService.removeEventListener('idatagenerator_mdd_processed', handleMddProcessingCompleted);
        addDebugLog("✅ WebSocket listeners cleaned up successfully");
      } catch (error) {
        addDebugLog(`❌ Error cleaning up WebSocket listeners: ${error}`);
      }
    };
  }, [createdProject?.project_id, toast]);

  // Fetch MDD variables after processing completes
  const fetchMddVariables = async (projectId: string) => {
    try {
      addDebugLog(`🔄 Fetching MDD variables for project: ${projectId}`);
      
      // Use the API method which handles authentication properly
      const response = await projectApi.getProjectVariables(projectId);
      
      addDebugLog(`✅ MDD variables API response: ${response.variables?.length || 0} variables`);
      
      // Store the complete response
      setMddVariablesResponse(response);
      
      toast({
        title: "Variables Loaded Successfully",
        description: `Loaded ${response.variables?.length || 0} variables from MDD file`,
        variant: "default",
      });
      
    } catch (error) {
      addDebugLog(`❌ Error fetching MDD variables: ${error}`);
      console.error("❌ Error fetching MDD variables:", error);
      toast({
        title: "Error Loading Variables",
        description: "Failed to load MDD variables. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Optimize canCreateTestCases with useMemo to prevent excessive calls
  const canCreateTestCases = useMemo(() => {
    const result = mddProcessing.isCompleted && mddVariablesResponse?.variables?.length > 0;
    // Only log when the result actually changes
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 canCreateTestCases: ${result} (isCompleted: ${mddProcessing.isCompleted}, variables: ${mddVariablesResponse?.variables?.length || 0})`);
    }
    return result;
  }, [mddProcessing.isCompleted, mddVariablesResponse?.variables?.length]);

  // Test Case Management
  const addTestCase = () => {
    if (!canCreateTestCases) {
      toast({
        title: "MDD Processing Required",
        description: "Please wait for MDD processing to complete before creating test cases",
        variant: "destructive",
      });
      return;
    }

    const newTestCase: TestCase = {
      id: Date.now().toString(),
      name: `Test Case ${testCases.length + 1}`,
      description: "",
      customSurveyLink: surveyUrl,
      deviceType: mddVariablesResponse!.project_defaults.device_type || "desktop",
      completes: mddVariablesResponse!.project_defaults.number_of_completes || 5,
      screenshot: mddVariablesResponse!.project_defaults.generate_screenshot || true,
      selectedVariables: []
    };
    setTestCases([...testCases, newTestCase]);
    addDebugLog(`Added new test case: ${newTestCase.name}`);
  };

  const updateTestCase = (id: string, updates: Partial<TestCase>) => {
    setTestCases(testCases.map(tc => tc.id === id ? { ...tc, ...updates } : tc));
    addDebugLog(`Updated test case: ${id}`);
  };

  const removeTestCase = (id: string) => {
    setTestCases(testCases.filter(tc => tc.id !== id));
    addDebugLog(`Removed test case: ${id}`);
  };

  // MDD File Upload Handler
  const handleMddUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    addDebugLog(`MDD file selected: ${file.name}`);

    // Validate form fields first
    if (!surveyUrl.trim()) {
      setError("Please enter a survey link before uploading MDD file.");
      return;
    }

    if (!projectName.trim()) {
      setError("Please enter a project name before uploading MDD file.");
      return;
    }

    // Validate file type
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension !== 'mdd') {
      setError('Please select a valid MDD file (.mdd extension)');
      return;
    }

    setMddFile(file);
    setUploadedFileName(file.name);
    setError(null);

    // Reset processing state
    setMddProcessing({
      isProcessing: false,
      progress: 0,
      stage: "",
      message: "",
      filename: "",
      isCompleted: false,
    });

    // Clear previous data
    setMddVariablesResponse(null);
    setTestCases([]);

    toast({
      title: "MDD File Selected",
      description: `Selected: ${file.name}. Click Submit to process the file.`,
      variant: "default",
    });
  };

  // New function to load existing project variables
  const loadExistingProject = async (projectId: string) => {
    if (!projectId.trim()) return;

    setIsLoadingExistingProject(true);
    setError(null);

    try {
      addDebugLog(`🔄 Loading existing project: ${projectId}`);
      
      const response = await projectApi.getProjectVariables(projectId);
      
      addDebugLog(`✅ Existing project loaded: ${response.variables?.length || 0} variables`);
      
      // Store the complete response
      setMddVariablesResponse(response);
      
      // Create a mock project response for existing project
      const mockProjectResponse: ProjectCreationResponse = {
        message: "Existing project loaded",
        project_id: projectId,
        project_name: response.project_name,
        status: "active",
        case_type: 2,
        region: user?.department || "IN",
        created_by: user?.username || "current_user",
        requires_mdd_processing: false,
        default_settings: response.project_defaults
      };
      
      setCreatedProject(mockProjectResponse);
      
      // Set processing as completed since we have variables
      setMddProcessing({
        isProcessing: false,
        progress: 100,
        stage: "completed",
        message: "Variables loaded from existing project",
        filename: "existing_project",
        isCompleted: true,
        variablesCount: response.variables.length,
        processingTime: "0s"
      });

      // Clear any existing error
      setError(null);

      toast({
        title: "Project Loaded Successfully",
        description: `Loaded existing project with ${response.variables?.length || 0} variables`,
        variant: "default",
      });
      
    } catch (error) {
      addDebugLog(`❌ Error loading existing project: ${error}`);
      console.error("❌ Error loading existing project:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to load existing project. Please check the project ID and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          errorMessage = "Project not found. Please verify the project ID is correct.";
        } else if (error.message.includes('403')) {
          errorMessage = "Access denied. You don't have permission to access this project.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error occurred while loading the project. Please try again later.";
        } else {
          // Use the actual error message if it's meaningful
          const match = error.message.match(/message: (.+)/);
          if (match) {
            errorMessage = match[1];
          }
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error Loading Project",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingExistingProject(false);
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    if (!surveyUrl.trim()) {
      setError("Please enter a survey link.");
      return false;
    }

    if (!projectName.trim()) {
      setError("Please enter a project name.");
      return false;
    }

    if (!testingOption) {
      setError("Please select a testing option.");
      return false;
    }

    try {
      new URL(surveyUrl);
    } catch {
      setError("Please enter a valid URL for the survey link.");
      return false;
    }

    if (testingOption === "option1") {
      if (!option1Screenshot || !option1DeviceType || !option1Completes) {
        setError("Please fill out all required fields for Option 1.");
        return false;
      }
    } else if (testingOption === "option2") {
      if (option2Mode === "new" && !mddFile) {
        setError("Please upload an MDD file for new project or select existing project mode.");
        return false;
      }
      if (option2Mode === "existing" && !existingProjectId.trim()) {
        setError("Please enter a project ID for existing project.");
        return false;
      }
    }

    return true;
  };

  // Main Form Submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    // For existing project mode, just load the project
    if (testingOption === "option2" && option2Mode === "existing") {
      await loadExistingProject(existingProjectId);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    addDebugLog("🚀 Starting form submission...");

    try {
      const projectData: ProjectCreationRequest = {
        project_name: projectName,
        default_project_link: surveyUrl,
        case_type: testingOption === "option1" ? "1" : "2",
        default_generate_screenshot: testingOption === "option1" ? option1Screenshot : "true",
        default_device_type: testingOption === "option1" ? option1DeviceType : "desktop",
        default_number_of_completes: testingOption === "option1" ? option1Completes.toString() : "5",
        region: user?.department || "IN"
      };

      addDebugLog(`📤 Creating project with data: ${JSON.stringify(projectData)}`);
      
      let projectResponse: ProjectCreationResponse;

      if (testingOption === "option1") {
        // Option 1: Create project without MDD
        projectResponse = await projectApi.createProject(projectData);
        
        addDebugLog(`✅ Option 1 Project created: ${JSON.stringify(projectResponse)}`);
        setCreatedProject(projectResponse);
        
        const successMessage = `Project "${projectResponse.project_name}" created successfully!`;
        setSuccess(successMessage);
        
        toast({
          title: "Success!",
          description: successMessage,
          variant: "default",
        });

        // Close modal after 2 seconds for Option 1
        setTimeout(() => {
          const formData = {
            surveyUrl,
            projectName,
            testingOption,
            projectResponse,
            option1: {
              screenshot: option1Screenshot,
              deviceType: option1DeviceType,
              completes: option1Completes,
            },
            timestamp: new Date().toISOString(),
          };
          onSubmit(formData);
        }, 2000);

      } else {
        // Option 2: Create new project with MDD
        if (!mddFile) {
          throw new Error("MDD file is required for Option 2");
        }
        
        addDebugLog(`📤 Creating project with MDD file: ${mddFile.name}`);
        
        projectResponse = await projectApi.createProjectWithMDD(projectData, mddFile);
        
        addDebugLog(`✅ Option 2 Project created: ${JSON.stringify(projectResponse)}`);
        setCreatedProject(projectResponse);
        
        const successMessage = `Project "${projectResponse.project_name}" created successfully! MDD processing will begin shortly...`;
        setSuccess(successMessage);
        
        toast({
          title: "Project Created!",
          description: successMessage,
          variant: "default",
        });

        addDebugLog("🔄 Waiting for WebSocket events for MDD processing...");
      }

    } catch (err) {
      addDebugLog(`❌ Error creating project: ${err}`);
      console.error("❌ Error creating project:", err);
      
      // Enhanced error message extraction
      let errorMessage = "Failed to create project. Please try again.";
      
      if (err instanceof Error) {
        if (err.message.includes('400')) {
          errorMessage = "Invalid project data. Please check your inputs and try again.";
        } else if (err.message.includes('401')) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (err.message.includes('403')) {
          errorMessage = "Access denied. You don't have permission to create projects.";
        } else if (err.message.includes('500')) {
          errorMessage = "Server error occurred. Please try again later.";
        } else {
          // Extract meaningful error message from API response
          const match = err.message.match(/message: (.+)/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]);
              if (parsed.error || parsed.message || parsed.detail) {
                errorMessage = parsed.error || parsed.message || parsed.detail;
              }
            } catch {
              errorMessage = match[1];
            }
          }
        }
      }
      
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const isFormValid = () => {
    if (!surveyUrl.trim() || !projectName.trim() || !testingOption) return false;
    
    if (testingOption === "option1") {
      return option1Screenshot && option1DeviceType && option1Completes;
    } else if (testingOption === "option2") {
      if (option2Mode === "new") {
        return mddFile !== null;
      } else {
        return existingProjectId.trim() !== "";
      }
    }
    
    return false;
  };

  // Helper function to check if submit should be disabled
  const shouldDisableSubmit = () => {
    if (testingOption === "option2" && createdProject) {
      return true;
    }
    if (testingOption === "option2" && option2Mode === "existing" && isLoadingExistingProject) {
      return true;
    }
    return !isFormValid() || isSubmitting;
  };

  // Helper function to get submit button text
  const getSubmitButtonText = () => {
    if (testingOption === "option2" && createdProject) {
      return "Project Already Loaded";
    }
    if (testingOption === "option2" && option2Mode === "existing" && isLoadingExistingProject) {
      return "Loading Project...";
    }
    if (testingOption === "option2" && option2Mode === "existing") {
      return "Load Existing Project";
    }
    if (isSubmitting) {
      return "Creating Project...";
    }
    return "Submit Request";
  };

  // Debounced function to fetch project suggestions
  const fetchProjectSuggestions = useCallback(
    async (query: string) => {
      if (query.trim().length < 2) {
        setProjectSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await projectApi.getProjectSuggestions(query);
        setProjectSuggestions(response.suggestions);
        setShowSuggestions(response.suggestions.length > 0);
      } catch (error) {
        console.error("Error fetching project suggestions:", error);
        setProjectSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    []
  );

  // Debounce the suggestions fetch
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (projectName && !createdProject) {
        fetchProjectSuggestions(projectName);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [projectName, fetchProjectSuggestions, createdProject]);

  // Handle suggestion selection - Updated to automatically load project
  const handleSuggestionSelect = async (suggestion: ProjectSuggestion) => {
    setProjectName(suggestion.project_name);
    setSurveyUrl(suggestion.project_survey_link);
    setShowSuggestions(false);
    
    // Automatically set to option2 and existing mode
    setTestingOption("option2");
    setOption2Mode("existing");
    setExistingProjectId(suggestion.project_id);
    
    toast({
      title: "Project Details Filled",
      description: "Project details auto-filled. Loading project variables...",
      variant: "default",
    });

    // Automatically load the project variables
    await loadExistingProject(suggestion.project_id);
  };

  return (
    <div className="space-y-8">
      {/* Debug Information Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
        <Alert className="border-gray-200 bg-gray-50">
          <Icon icon="heroicons:bug-ant" className="h-4 w-4 text-gray-600" />
          <AlertDescription>
            <details className="text-xs">
              <summary className="font-medium cursor-pointer">Debug Information</summary>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {debugInfo.map((log, index) => (
                  <div key={index} className="font-mono text-xs text-gray-600 mb-1">
                    {log}
                  </div>
                ))}
              </div>
            </details>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
            {createdProject && (
              <div className="mt-2 text-sm space-y-1">
                <p><strong>Project ID:</strong> {createdProject.project_id}</p>
                <p><strong>Status:</strong> {createdProject.status}</p>
                {testingOption === "option2" && !mddProcessing.isCompleted && (
                  <p className="text-blue-600">🔄 Waiting for MDD processing...</p>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* MDD Processing Progress */}
      {testingOption === "option2" && mddProcessing.isProcessing && (
        <Alert className="border-blue-200 bg-blue-50">
          <Icon icon="heroicons:arrow-path" className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Processing: {mddProcessing.filename}</span>
                <span className="text-sm font-mono">{mddProcessing.progress}%</span>
              </div>
              <Progress value={mddProcessing.progress} className="w-full h-2" />
              <div className="text-sm">
                <p><strong>Stage:</strong> {mddProcessing.stage}</p>
                <p><strong>Status:</strong> {mddProcessing.message}</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* MDD Processing Complete */}
      {testingOption === "option2" && mddProcessing.isCompleted && (
        <Alert className="border-green-200 bg-green-50">
          <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-1">
              <p className="font-medium">🎉 MDD Processing Complete!</p>
              <p className="text-sm">
                <strong>Variables Found:</strong> {mddProcessing.variablesCount || mddVariablesResponse?.variables?.length}
              </p>
              <p className="text-sm">
                <strong>Processing Time:</strong> {mddProcessing.processingTime}
              </p>
              {mddVariablesResponse?.summary && (
                <div className="text-sm mt-2 p-2 bg-white rounded border">
                  <p><strong>Variable Types:</strong></p>
                  <ul className="text-xs mt-1 space-y-1">
                    <li>Categorical: {mddVariablesResponse.summary.by_type.categorical}</li>
                    <li>Text: {mddVariablesResponse.summary.by_type.text}</li>
                    <li>Numeric: {mddVariablesResponse.summary.by_type.numeric}</li>
                    <li>Boolean: {mddVariablesResponse.summary.by_type.boolean}</li>
                    <li>Date: {mddVariablesResponse.summary.by_type.date}</li>
                  </ul>
                </div>
              )}
              <p className="text-sm">You can now create test cases using the processed variables.</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Project Information */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Project Information</h3>
        </div>
        <div className="ml-11 space-y-4">
          <div className="relative">
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              id="projectName"
              placeholder="Enter project name..."
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (!e.target.value.trim()) {
                  setShowSuggestions(false);
                }
              }}
              onFocus={() => {
                if (projectName.trim().length >= 2 && projectSuggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay hiding suggestions to allow clicking
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="w-full"
              disabled={isSubmitting || (testingOption === "option2" && createdProject)}
            />
            
            {/* Project Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isLoadingSuggestions ? (
                  <div className="p-3 text-sm text-gray-500 flex items-center">
                    <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                    Loading suggestions...
                  </div>
                ) : (
                  <>
                    {projectSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.project_id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {suggestion.project_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.project_survey_link}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Created: {new Date(suggestion.project_created).toLocaleDateString()}
                            </p>
                          </div>
                          <Icon icon="heroicons:arrow-top-right-on-square" className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                    {projectSuggestions.length === 0 && (
                      <div className="p-3 text-sm text-gray-500">
                        No matching projects found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="surveyUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Survey Link <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              id="surveyUrl"
              placeholder="https://survey.example.com/your-survey"
              value={surveyUrl}
              onChange={(e) => setSurveyUrl(e.target.value)}
              className="w-full"
              disabled={isSubmitting || (testingOption === "option2" && createdProject)}
            />
          </div>
        </div>
      </div>

      {/* Testing Option Selection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
            2
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Select Testing Option</h3>
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
              disabled={isSubmitting || (testingOption === "option2" && createdProject)}
            />
            <label htmlFor="option1" className="ml-2 block text-sm font-medium text-gray-700">
              Option 1: Completes without Test Cases (Case Type 1)
            </label>
            <input
              type="radio"
              id="option2"
              name="testingOption"
              value="option2"
              checked={testingOption === "option2"}
              onChange={(e) => setTestingOption(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ml-4"
              disabled={isSubmitting || (testingOption === "option2" && createdProject)}
            />
            <label htmlFor="option2" className="ml-2 block text-sm font-medium text-gray-700">
              Option 2: Completes with Test Cases (Case Type 2)
            </label>
          </div>
        </div>
      </div>

      {/* Option 1 Fields */}
      {testingOption === "option1" && (
        <div className="ml-11 pl-4 border-l-2 border-blue-200 space-y-4">
          <h4 className="text-md font-semibold text-blue-800">
            Option 1: Configure completes without Test Cases
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="generateScreenshot1" className="block text-sm font-medium text-gray-700 mb-1">
                Generate Screenshot <span className="text-red-500">*</span>
              </label>
              <Select value={option1Screenshot} onValueChange={setOption1Screenshot} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="deviceType1" className="block text-sm font-medium text-gray-700 mb-1">
                Device Type <span className="text-red-500">*</span>
              </label>
              <Select value={option1DeviceType} onValueChange={setOption1DeviceType} disabled={isSubmitting}>
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
              <label htmlFor="completes1" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Completes <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                id="completes1"
                min="1"
                value={option1Completes}
                onChange={(e) => setOption1Completes(parseInt(e.target.value) || 1)}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Option 2 Fields - Updated */}
      {testingOption === "option2" && (
        <div className="ml-11 pl-4 border-l-2 border-blue-200 space-y-6">
          <h4 className="text-md font-semibold text-blue-800">
            Option 2: Configure completes with Test Cases
          </h4>

          {/* Project Mode Selection */}
          {!createdProject && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Mode <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="new-project"
                      name="projectMode"
                      value="new"
                      checked={option2Mode === "new"}
                      onChange={(e) => {
                        setOption2Mode("new");
                        setExistingProjectId("");
                        setMddVariablesResponse(null);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="new-project" className="ml-2 block text-sm text-gray-700">
                      Create New Project with MDD File
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="existing-project"
                      name="projectMode"
                      value="existing"
                      checked={option2Mode === "existing"}
                      onChange={(e) => {
                        setOption2Mode("existing");
                        setMddFile(null);
                        setUploadedFileName("");
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="existing-project" className="ml-2 block text-sm text-gray-700">
                      Use Existing Project (with processed MDD)
                    </label>
                  </div>
                </div>
              </div>

              {/* New Project - MDD File Upload */}
              {option2Mode === "new" && (
                <div className="space-y-2">
                  <label htmlFor="mddFile" className="block text-sm font-medium text-gray-700">
                    Upload MDD File <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="file"
                        id="mddFile"
                        accept=".mdd"
                        onChange={handleMddUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isSubmitting || mddProcessing.isProcessing}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="flex items-center gap-2"
                        disabled={isSubmitting || mddProcessing.isProcessing}
                      >
                        <Icon icon="heroicons:document-arrow-up" className="w-4 h-4" />
                        Choose MDD File
                      </Button>
                    </div>
                    {uploadedFileName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Icon icon="heroicons:document" className="w-4 h-4" />
                        <span>{uploadedFileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Existing Project - Project ID Input */}
              {option2Mode === "existing" && (
                <div className="space-y-2">
                  <label htmlFor="existingProjectId" className="block text-sm font-medium text-gray-700">
                    Project ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <Input
                      type="text"
                      id="existingProjectId"
                      placeholder="Enter existing project ID (e.g., 5c54d1d0-9b55-4f48-aee6-e06092568de4)"
                      value={existingProjectId}
                      onChange={(e) => setExistingProjectId(e.target.value)}
                      className="flex-1"
                      disabled={isSubmitting || isLoadingExistingProject}
                    />
                    <Button
                      type="button"
                      onClick={() => loadExistingProject(existingProjectId)}
                      disabled={!existingProjectId.trim() || isLoadingExistingProject}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {isLoadingExistingProject ? (
                        <>
                          <Icon icon="heroicons:arrow-path" className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Icon icon="heroicons:magnifying-glass" className="w-4 h-4" />
                          Load Project
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter the project ID of an existing project that has already been processed with MDD variables.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Show project details when loaded */}
          {createdProject && mddVariablesResponse && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon="heroicons:check-circle" className="w-5 h-5 text-blue-600" />
                <h5 className="font-medium text-blue-800">Project Loaded</h5>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Project:</strong> {mddVariablesResponse.project_name}</p>
                <p><strong>Project ID:</strong> {mddVariablesResponse.project_id}</p>
                <p><strong>Variables:</strong> {mddVariablesResponse.variables.length}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    Categorical: {mddVariablesResponse.summary.by_type.categorical}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    Text: {mddVariablesResponse.summary.by_type.text}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    Numeric: {mddVariablesResponse.summary.by_type.numeric}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Test Cases Section - Show when variables are available */}
          {canCreateTestCases && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-700">Test Cases</h5>
                  <Button
                    type="button"
                    onClick={addTestCase}
                    size="sm"
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Icon icon="heroicons:plus" className="w-4 h-4" />
                    Add Test Case
                  </Button>
                </div>
                
                {testCases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Icon icon="heroicons:beaker" className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No test cases created yet</p>
                    <p className="text-sm">Click "Add Test Case" to create your first test case</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testCases.map((testCase) => (
                      <TestCaseManager
                        key={testCase.id}
                        testCase={testCase}
                        onUpdate={(updates) => updateTestCase(testCase.id, updates)}
                        onRemove={() => removeTestCase(testCase.id)}
                        availableVariables={mddVariablesResponse?.variables || []}
                        variableSummary={mddVariablesResponse?.summary}
                        projectDefaults={mddVariablesResponse?.project_defaults}
                        isSubmitting={isSubmitting}
                        projectId={createdProject?.project_id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-between items-center mt-8">
        {/* Close Button on the left */}
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
        
        {/* Spacer if no close button */}
        {!onClose && <div></div>}

        {/* Submit button and status messages on the right */}
        <div className="flex items-center space-x-3">
          {/* Show submit button based on mode and state */}
          {!(testingOption === "option2" && createdProject && option2Mode === "existing") && (
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              disabled={shouldDisableSubmit()}
            >
              {isSubmitting || (testingOption === "option2" && option2Mode === "existing" && isLoadingExistingProject) ? (
                <>
                  <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                  {getSubmitButtonText()}
                </>
              ) : (
                <>
                  <Icon icon="heroicons:paper-airplane" className="w-4 h-4 mr-2" />
                  {getSubmitButtonText()}
                </>
              )}
            </Button>
          )}

          {/* Show status message when existing project is loaded */}
          {testingOption === "option2" && createdProject && option2Mode === "existing" && (
            <div className="flex items-center text-green-600">
              <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Existing project loaded successfully! You can now create test cases above.</span>
            </div>
          )}

          {/* Show status message when new project is created for option 2 */}
          {testingOption === "option2" && createdProject && option2Mode === "new" && (
            <div className="flex items-center text-green-600">
              <Icon icon="heroicons:check-circle" className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Project created successfully! You can now create test cases above.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}