import axios from "axios";
import toast from "react-hot-toast";
import store from "../store";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
  },
  // Add retry logic
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Wait 1s, 2s, 3s between retries
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const state = store.getState();
        const refreshToken = state.auth?.refreshToken;
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const { accessToken, refreshToken: newRefreshToken } =
          response.data.tokens;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        toast.error("Session expired. Please login again.");
        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message === "Network Error") {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// Master data API (UNCHANGED)
export const masterDataAPI = {
  // Get all master categories for companies
  getCategories: () => api.get("/master-data/categories"),

  // Get master data hierarchy
  getHierarchy: () => api.get("/master-data/hierarchy"),

  // Get activities for a specific category
  getCategoryActivities: (categoryId) =>
    api.get(`/master-data/categories/${categoryId}/activities`),
};

// Project task API (FIXED - using correct /manpower prefix)
export const projectTaskAPI = {
  // Initialize project tasks from master categories (UNCHANGED)
  initializeTasks: (projectId, selectedCategories) =>
    api.post(
      `/manpower/projects/${projectId}/tasks/initialize`,
      selectedCategories
    ),

  // Get project task hierarchy (UNCHANGED)
  getTaskHierarchy: (projectId) =>
    api.get(`/manpower/projects/${projectId}/tasks/hierarchy`),

  // ✅ FIXED: Record weekly progress with detailed breakdown
  recordWeeklyProgress: (taskId, weeklyProgressData) =>
    api.post(`/manpower/tasks/${taskId}/weekly-progress`, weeklyProgressData),

  // ✅ FIXED: Get task progress history
  getTaskProgressHistory: (taskId) =>
    api.get(`/manpower/tasks/${taskId}/progress-history`),

  // ✅ FIXED: Update specific progress record
  updateProgressRecord: (taskId, progressId, updateData) =>
    api.put(`/manpower/tasks/${taskId}/progress/${progressId}`, updateData),

  // ✅ FIXED: Lock/unlock progress record
  toggleProgressLock: (taskId, progressId, isLocked) =>
    api.patch(`/manpower/tasks/${taskId}/progress/${progressId}/lock`, {
      isLocked,
    }),

  // Legacy progress recording (keep for compatibility)
  recordTaskProgress: (taskId, progressData) =>
    api.post(`/manpower/tasks/${taskId}/progress`, progressData),
};

// Manpower API (UNCHANGED - keeping your exact working routes)
export const manpowerAPI = {
  // Get project task hierarchy (UNCHANGED)
  getTaskHierarchy: (projectId) =>
    api.get(`/manpower/projects/${projectId}/tasks/hierarchy`),

  // Get project summary (UNCHANGED)
  getProjectSummary: (projectId) =>
    api.get(`/manpower/projects/${projectId}/summary`),

  // Initialize project tasks from master categories (UNCHANGED)
  initializeTasks: (projectId, selectedCategories) =>
    api.post(
      `/manpower/projects/${projectId}/tasks/initialize`,
      selectedCategories
    ),

  // Update task quantities (UNCHANGED)
  updateTaskQuantities: (tasks) =>
    api.put("/manpower/tasks/quantities", { tasks }),
};

// ✅ FIXED: Progress Report API (using correct /manpower prefix)
export const progressReportAPI = {
  // Get comprehensive monthly progress report
  getMonthlyProgressReport: (projectId, filters = {}) =>
    api.get(`/manpower/projects/${projectId}/progress-report`, {
      params: filters,
    }),

  // Export progress report to Excel
  exportProgressReport: (projectId, filters = {}) =>
    api.get(`/manpower/projects/${projectId}/export-progress-report`, {
      params: filters,
      responseType: "blob",
    }),

  // Get variance analysis
  getVarianceAnalysis: (projectId, filters = {}) =>
    api.get(`/manpower/projects/${projectId}/variance-analysis`, {
      params: filters,
    }),

  // Get project dashboard data
  getProjectDashboard: (projectId) =>
    api.get(`/manpower/projects/${projectId}/dashboard`),
};

// ✅ NEW: Analytics API (placeholder for future implementation)
export const analyticsAPI = {
  // Get project performance metrics
  getProjectMetrics: (projectId, dateRange = {}) =>
    api.get(`/analytics/projects/${projectId}/metrics`, { params: dateRange }),

  // Get efficiency trends
  getEfficiencyTrends: (projectId, period = "monthly") =>
    api.get(`/analytics/projects/${projectId}/efficiency-trends`, {
      params: { period },
    }),

  // Get resource utilization
  getResourceUtilization: (projectId) =>
    api.get(`/analytics/projects/${projectId}/resource-utilization`),

  // Get cost variance analysis
  getCostVarianceAnalysis: (projectId) =>
    api.get(`/analytics/projects/${projectId}/cost-variance`),
};

// ✅ NEW: File Upload API (placeholder for future implementation)
export const fileAPI = {
  // Upload file with progress tracking
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  // Download file
  downloadFile: (fileId) =>
    api.get(`/files/${fileId}/download`, { responseType: "blob" }),
};

// ✅ NEW: Utility functions
export const apiUtils = {
  // Download blob as file
  downloadBlob: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format error message
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred";
  },

  // Handle API response
  handleResponse: (response) => {
    return response.data.data || response.data;
  },
};

// Keep your default export
export default api;
