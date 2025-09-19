import api from "./api";

// Enhanced API service that works with Redux store
class ProjectAPIService {
  constructor() {
    // Set up request interceptor to add token from Redux store
    api.interceptors.request.use((config) => {
      const state = window.__REDUX_STORE__?.getState();
      const token = state?.auth?.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  // Project CRUD operations
  getProjects = (params) => api.get("/projects", { params });
  getProject = (projectId) => api.get(`/projects/${projectId}`);
  createProject = (data) => api.post("/projects", data);
  updateProject = (projectId, data) => api.put(`/projects/${projectId}`, data);
  deleteProject = (projectId) => api.delete(`/projects/${projectId}`);

  // Dashboard
  getProjectDashboard = () => api.get("/projects/dashboard");
  getProjectStats = () => api.get("/projects/stats");

  // Data import/export
  importProjectData = (projectId, data) =>
    api.post(`/projects/${projectId}/import-data`, data);
  exportProjectData = (projectId) =>
    api.get(`/projects/${projectId}/export-data`);

  // Task management
  updateTaskData = (taskId, data) => api.put(`/projects/tasks/${taskId}`, data);

  // Progress tracking
  getMonthlyProgress = (projectId, params) =>
    api.get(`/progress/projects/${projectId}/monthly`, { params });
  createOrUpdateMonthlyProgress = (taskId, data) =>
    api.post(`/progress/tasks/${taskId}/monthly`, data);
  bulkUpdateWeeklyProgress = (monthlyProgressId, data) =>
    api.put(`/progress/monthly/${monthlyProgressId}/weekly`, data);

  // Reports
  getProjectSummaryReport = (projectId, params) =>
    api.get(`/progress/projects/${projectId}/summary`, { params });
  getProductivityAnalysis = (projectId, params) =>
    api.get(`/progress/projects/${projectId}/productivity`, { params });
}

export const projectAPI = new ProjectAPIService();
