import { authService } from "./auth";
import { API_BASE_URL } from "./utils";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      // Use authService.authenticatedRequest which handles token refresh automatically
      const response = await authService.authenticatedRequest(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { 
      method: "GET",
      headers: headers
    });
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    // Don't set Content-Type for FormData - let browser handle it
    const requestHeaders = data instanceof FormData 
      ? { ...headers }
      : { "Content-Type": "application/json", ...headers };

    return this.request<T>(endpoint, {
      method: "POST",
      headers: requestHeaders,
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    // Don't set Content-Type for FormData - let browser handle it
    const requestHeaders = data instanceof FormData 
      ? { ...headers }
      : { "Content-Type": "application/json", ...headers };

    return this.request<T>(endpoint, {
      method: "PUT",
      headers: requestHeaders,
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { 
      method: "DELETE",
      headers: headers
    });
  }

  // Helper method to get current token (for debugging)
  getCurrentToken(): string | null {
    return authService.getAccessToken();
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }
}



export interface ProjectCreationRequest {
  project_name: string;
  default_project_link: string;
  case_type: string;
  default_generate_screenshot: string;
  default_device_type: string;
  default_number_of_completes: string;
  region: string;
}

export interface ProjectCreationResponse {
  message: string;
  project_id: string;
  project_name: string;
  status: string;
  case_type: number;
  region: string;
  created_by: string;
  requires_mdd_processing: boolean;
  default_settings: {
    device_type: string;
    number_of_completes: number;
    generate_screenshot: boolean;
  };
}

export interface ProjectVariable {
  variable_id: string;
  variable_name: string;
  variable_label: string;
  datatype: string;
  options?: Array<{
    code: string;
    label: string;
  }>;
}

export interface TestCaseCreationRequest {
  test_case_name: string;
  test_case_description: string;
  custom_survey_link: string;
  device_type: string;
  number_of_completes: number;
  generate_screenshot: boolean;
  selected_variables: Array<{
    variable_id: string;
    variable_name: string;
    variable_label: string;
    datatype: string;
    selected: boolean;
    options?: Array<{
      code: string;
      label: string;
    }>;
  }>;
}

export interface TestCaseCreationResponse {
  message: string;
  test_case_id: string;
  test_case_name: string;
  created_by: string;
  effective_settings: {
    survey_link: string;
    device_type: string;
    number_of_completes: number;
    generate_screenshot: boolean;
  };
  selected_variables_count: number;
  generation_started: boolean;
}

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

export interface ProjectSuggestion {
  project_id: string;
  project_name: string;
  project_created: string;
  project_survey_link: string;
}

export interface ProjectSuggestionsResponse {
  suggestions: ProjectSuggestion[];
  total_count: number;
}

export interface Activity {
  id: string;
  activity_type: string;
  title: string;
  username: string;
  created_at: string;
  time_ago: string;
  metadata: {
    project_id?: string;
    test_case_id?: string;
    archived_at?: string;
    case_type?: number;
    region?: string;
    device_type?: string;
    completes?: number;
  };
  project?: {
    id: string;
    name: string;
    archived: boolean;
  };
  test_case?: {
    id: string;
    name: string;
  };
}

export interface ActivitiesResponse {
  activities: Activity[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
    total_pages: number;
  };
}

export interface ArchivedProject {
  id: string;
  project_name: string;
  case_type_display: string;
  region_display: string;
  status_display: string;
  created_at: string;
  processing_duration: string;
  test_cases_count: number;
  completed_test_cases: number;
  archived: boolean;
  archived_at: string;
  archived_by: string;
  mdd_info: {
    filename: string;
    status: string;
    variables_count: number;
  };
}

export interface ArchivedProjectsResponse {
  projects: ArchivedProject[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
    total_pages: number;
  };
  filters: {
    region: string;
    case_type: string;
    status: string;
    include_archived: boolean;
  };
}

export interface RestoreProjectResponse {
  message: string;
  project_id: string;
  project_name: string;
}

export interface ProjectHierarchy {
  id: string;
  project_name: string;
  case_type: number;
  case_type_display: string;
  region: string;
  region_display: string;
  status: string;
  status_display: string;
  created_at: string;
  created_by: string;
  default_project_link: string;
  processing_duration: string;
  archived: boolean;
  archived_at: string | null;
  archived_by: string | null;
  default_settings: {
    device_type: string;
    number_of_completes: number;
    generate_screenshot: boolean;
  };
  mdd_processing?: {
    status: string;
    filename: string;
    file_size_mb: number;
    processing_duration: string;
    processed_at: string;
    variables_count: number;
  };
  test_cases: {
    id: string;
    test_case_name: string;
    test_case_description: string;
    status: string;
    status_display: string;
    created_at: string;
    created_by: string;
    processing_duration: string;
    effective_settings: {
      survey_link: string;
      device_type: string;
      number_of_completes: number;
      generate_screenshot: boolean;
    };
    respondents_summary: {
      total_respondents: number;
      completed_respondents: number;
      pending_respondents: number;
      failed_respondents: number;
    };
    has_custom_settings: boolean;
    mdd_hints_count: number;
  }[];
  test_cases_summary: {
    total_test_cases: number;
    completed_test_cases: number;
    pending_test_cases: number;
    processing_test_cases: number;
    failed_test_cases: number;
  };
}

export interface ProjectsHierarchyResponse {
  projects_hierarchy: ProjectHierarchy[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_next: boolean;
    total_pages: number;
  };
  filters: {
    region: string;
    case_type: string;
    status: string;
    include_archived: boolean;
    include_only_archived: boolean;
  };
  summary: {
    total_projects: number;
    projects_with_test_cases: number;
    total_test_cases: number;
  };
}

// Project API Functions
export const projectApi = {
  // Create project without MDD file - Now using apiClient
  async createProject(data: ProjectCreationRequest): Promise<ProjectCreationResponse> {
    console.log("📤 Creating project with data:", data);
    
    try {
      const formData = new FormData();
      
      // Add all project data to FormData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
        console.log(`📝 FormData: ${key} = ${value}`);
      });

      const result = await apiClient.post<ProjectCreationResponse>('/api/idatagenerator/projects/create/', formData);
      console.log("✅ Project created successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Create project error:", error);
      throw error;
    }
  },

  // Create project with MDD file - Now using apiClient
  async createProjectWithMDD(data: ProjectCreationRequest, mddFile: File): Promise<ProjectCreationResponse> {
    console.log("📤 Creating project with MDD file:", { data, fileName: mddFile.name });
    
    try {
      const formData = new FormData();
      
      // Add all project data to FormData
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
        console.log(`📝 FormData: ${key} = ${value}`);
      });
      
      // Add MDD file
      formData.append('mdd_file', mddFile);
      console.log("📁 Added MDD file to FormData:", mddFile.name);

      const result = await apiClient.post<ProjectCreationResponse>('/api/idatagenerator/projects/create/', formData);
      console.log("✅ Project with MDD created successfully:", result);
      return result;
    } catch (error) {
      console.error("❌ Create project with MDD error:", error);
      throw error;
    }
  },

  // Get project variables - Updated to fetch all variables
  async getProjectVariables(projectId: string): Promise<MddVariablesResponse> {
    console.log("📤 Fetching variables for project:", projectId);
    try {
      const response = await apiClient.get<MddVariablesResponse>(`/api/idatagenerator/projects/${projectId}/variables/?page_size=10000`);
      console.log("✅ Variables fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching variables:", error);
      throw error;
    }
  },

  // Create test case
  async createTestCase(projectId: string, data: TestCaseCreationRequest): Promise<TestCaseCreationResponse> {
    console.log("📤 Creating test case for project:", projectId, "with data:", data);
    try {
      const response = await apiClient.post<TestCaseCreationResponse>(`/api/idatagenerator/projects/${projectId}/test-cases/create/`, data);
      console.log("✅ Test case created successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating test case:", error);
      throw error;
    }
  },

  // Get project suggestions based on search query
  async getProjectSuggestions(query: string): Promise<ProjectSuggestionsResponse> {
    console.log("📤 Fetching project suggestions for query:", query);
    try {
      const response = await apiClient.get<ProjectSuggestionsResponse>(`/api/idatagenerator/projects/suggestions/?q=${encodeURIComponent(query)}`);
      console.log("✅ Project suggestions fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching project suggestions:", error);
      throw error;
    }
  },

  // Get activities
  async getActivities(page: number = 1, pageSize: number = 200000): Promise<ActivitiesResponse> {
    console.log("📤 Fetching activities:", { page, pageSize });
    try {
      const response = await apiClient.get<ActivitiesResponse>(`/api/idatagenerator/activities/?page=${page}&page_size=${pageSize}`);
      console.log("✅ Activities fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching activities:", error);
      throw error;
    }
  },

  // Get archived projects
  async getArchivedProjects(page: number = 1, pageSize: number = 20): Promise<ArchivedProjectsResponse> {
    console.log("📤 Fetching archived projects:", { page, pageSize });
    try {
      const response = await apiClient.get<ArchivedProjectsResponse>(`/api/idatagenerator/projects/?include_only_archived=true&page=${page}&page_size=${pageSize}`);
      console.log("✅ Archived projects fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching archived projects:", error);
      throw error;
    }
  },

  // Restore archived project
  async restoreProject(projectId: string): Promise<RestoreProjectResponse> {
    console.log("📤 Restoring project:", projectId);
    try {
      const response = await apiClient.post<RestoreProjectResponse>(`/api/idatagenerator/projects/${projectId}/restore/`);
      console.log("✅ Project restored successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error restoring project:", error);
      throw error;
    }
  },

  // Get projects hierarchy
  async getProjectsHierarchy(page: number = 1, pageSize: number = 20): Promise<ProjectsHierarchyResponse> {
    console.log("📤 Fetching projects hierarchy:", { page, pageSize });
    try {
      const response = await apiClient.get<ProjectsHierarchyResponse>(`/api/idatagenerator/projects/hierarchy/?page=${page}&page_size=${pageSize}`);
      console.log("✅ Projects hierarchy fetched successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching projects hierarchy:", error);
      throw error;
    }
  },

  // Archive project
  async archiveProject(projectId: string): Promise<ArchiveProjectResponse> {
    console.log("📤 Archiving project:", projectId);
    try {
      const response = await apiClient.post<ArchiveProjectResponse>(`/api/idatagenerator/projects/${projectId}/archive/`);
      console.log("✅ Project archived successfully:", response);
      return response;
    } catch (error) {
      console.error("❌ Error archiving project:", error);
      throw error;
    }
  },
};

export const apiClient = new ApiClient(API_BASE_URL);

export interface ArchiveProjectResponse {
  message: string;
  project_id: string;
  project_name: string;
  archived_at: string;
  archived_by: string;
}