import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../services/api";

const ProjectContext = createContext();

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  stats: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
  },
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_PROJECTS":
      return {
        ...state,
        projects: action.payload.projects || [],
        pagination: action.payload.pagination || state.pagination,
        loading: false,
        error: null,
      };

    case "SET_STATS":
      return {
        ...state,
        stats: action.payload,
        loading: false,
        error: null,
      };

    case "SET_CURRENT_PROJECT":
      return {
        ...state,
        currentProject: action.payload,
        loading: false,
        error: null,
      };

    case "ADD_PROJECT":
      return {
        ...state,
        projects: [action.payload, ...state.projects],
        loading: false,
        error: null,
      };

    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload : project
        ),
        currentProject:
          state.currentProject?.id === action.payload.id
            ? action.payload
            : state.currentProject,
        loading: false,
        error: null,
      };

    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter(
          (project) => project.id !== action.payload
        ),
        currentProject:
          state.currentProject?.id === action.payload
            ? null
            : state.currentProject,
        loading: false,
        error: null,
      };

    case "CLEAR_CURRENT_PROJECT":
      return { ...state, currentProject: null };

    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const { token, user } = useSelector((state) => ({
    token: state.auth?.token,
    user: state.auth?.user,
  }));

  // ✅ Fetch projects using your existing backend route
  const fetchProjects = useCallback(
    async (params = {}) => {
      if (!token || !user) return;

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const queryParams = new URLSearchParams({
          search: params.search || "",
          status: params.status || "",
          projectType: params.projectType || "",
          page: params.page || 0,
          size: params.size || 10,
        });

        const response = await api.get(`/projects?${queryParams}`);
        const { data } = response;

        if (data.success) {
          dispatch({
            type: "SET_PROJECTS",
            payload: {
              projects: data.data.items,
              pagination: {
                currentPage: data.data.currentPage,
                totalPages: data.data.totalPages,
                totalItems: data.data.totalItems,
                itemsPerPage: params.size || 10,
              },
            },
          });
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        const errorMessage = error.message || "Failed to fetch projects";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
      }
    },
    [token, user]
  );

  // ✅ Fetch dashboard stats using your existing route
  const fetchStats = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await api.get("/projects/dashboard");
      if (response.data.success) {
        dispatch({ type: "SET_STATS", payload: response.data.data });
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [token, user]);

  const fetchProject = useCallback(
    async (projectId) => {
      if (!token || !projectId) return;

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await api.get(`/projects/${projectId}`);
        const data = response.data;

        if (data.success) {
          dispatch({ type: "SET_CURRENT_PROJECT", payload: data.data });
        } else {
          throw new Error(data.message || "Failed to fetch project");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        const errorMessage = error.message || "Failed to fetch project";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
      }
    },
    [token]
  );

  const createProject = useCallback(
    async (projectData) => {
      if (!token) throw new Error("Authentication required");

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await api.post("/projects", projectData);
        const data = response.data;

        if (data.success) {
          dispatch({ type: "ADD_PROJECT", payload: data.data });
          toast.success("Project created successfully");
          return data.data;
        } else {
          throw new Error(data.message || "Failed to create project");
        }
      } catch (error) {
        console.error("Failed to create project:", error);
        const errorMessage = error.message || "Failed to create project";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      }
    },
    [token]
  );

  const updateProject = useCallback(
    async (projectId, projectData) => {
      if (!token) throw new Error("Authentication required");

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await api.put(`/projects/${projectId}`, projectData);
        const data = response.data;

        if (data.success) {
          dispatch({ type: "UPDATE_PROJECT", payload: data.data });
          toast.success("Project updated successfully");
          return data.data;
        } else {
          throw new Error(data.message || "Failed to update project");
        }
      } catch (error) {
        console.error("Failed to update project:", error);
        const errorMessage = error.message || "Failed to update project";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      }
    },
    [token]
  );

  const deleteProject = useCallback(
    async (projectId) => {
      if (!token) throw new Error("Authentication required");

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }

        dispatch({ type: "DELETE_PROJECT", payload: projectId });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Failed to delete project:", error);
        const errorMessage = error.message || "Failed to delete project";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      }
    },
    [token]
  );

  const clearCurrentProject = useCallback(() => {
    dispatch({ type: "CLEAR_CURRENT_PROJECT" });
  }, []);

  const importProjectData = useCallback(
    async (projectId, importData) => {
      if (!token) throw new Error("Authentication required");

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const response = await api.post(
          `/projects/${projectId}/import-data`,
          importData
        );
        const data = response.data;

        if (data.success) {
          toast.success("Project data imported successfully");
          return data.data;
        } else {
          throw new Error(data.message || "Failed to import project data");
        }
      } catch (error) {
        console.error("Failed to import project data:", error);
        let errorMessage = "Failed to import project data";

        // Handle structured error responses
        if (error.response?.data) {
          const responseData = error.response.data;
          if (
            responseData.type === "ValidationError" &&
            responseData.error?.details
          ) {
            errorMessage = responseData.error.details
              .map((d) => `${d.field}: ${d.message}`)
              .join("\n");
          } else if (responseData.error?.message) {
            errorMessage = responseData.error.message;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          }
        }

        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage, { duration: 5000 });
        throw error;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [token]
  );

  const value = useMemo(
    () => ({
      ...state,
      fetchProjects,
      fetchProject,
      fetchStats,
      createProject,
      updateProject,
      deleteProject,
      clearCurrentProject,
      importProjectData,
    }),
    [
      state,
      fetchProjects,
      fetchProject,
      fetchStats,
      createProject,
      updateProject,
      deleteProject,
      clearCurrentProject,
      importProjectData,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
