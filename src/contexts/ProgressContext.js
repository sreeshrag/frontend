import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { projectAPI } from "../services/projectAPI";
import toast from "react-hot-toast";

const ProgressContext = createContext();

const initialState = {
  monthlyProgress: [],
  weeklyProgress: [],
  projectSummary: null,
  productivityAnalysis: null,
  loading: false,
  error: null,
  selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM format
  selectedProject: null,
};

const progressReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };

    case "SET_MONTHLY_PROGRESS":
      return {
        ...state,
        monthlyProgress: action.payload,
        loading: false,
        error: null,
      };

    case "SET_PROJECT_SUMMARY":
      return {
        ...state,
        projectSummary: action.payload,
        loading: false,
        error: null,
      };

    case "SET_PRODUCTIVITY_ANALYSIS":
      return {
        ...state,
        productivityAnalysis: action.payload,
        loading: false,
        error: null,
      };

    case "UPDATE_MONTHLY_PROGRESS":
      return {
        ...state,
        monthlyProgress: state.monthlyProgress.map((progress) =>
          progress.id === action.payload.id ? action.payload : progress
        ),
        loading: false,
        error: null,
      };

    case "SET_SELECTED_MONTH":
      return { ...state, selectedMonth: action.payload };

    case "SET_SELECTED_PROJECT":
      return { ...state, selectedProject: action.payload };

    default:
      return state;
  }
};

export const ProgressProvider = ({ children }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  // Memoized selector to prevent re-renders
  const { token } = useSelector(
    useCallback(
      (state) => ({
        token: state.auth?.token,
      }),
      []
    ),
    (prev, next) => prev.token === next.token
  );

  const fetchMonthlyProgress = useCallback(
    async (projectId, params = {}) => {
      if (!token || !projectId) return;

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await projectAPI.getMonthlyProgress(projectId, params);
        dispatch({ type: "SET_MONTHLY_PROGRESS", payload: response.data });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch monthly progress";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
      }
    },
    [token]
  );

  const updateMonthlyProgress = useCallback(
    async (taskId, data) => {
      if (!token) throw new Error("Authentication required");

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await projectAPI.createOrUpdateMonthlyProgress(
          taskId,
          data
        );
        dispatch({ type: "UPDATE_MONTHLY_PROGRESS", payload: response.data });
        toast.success("Progress updated successfully");
        return response.data;
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to update progress";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
        throw error;
      }
    },
    [token]
  );

  const fetchProjectSummary = useCallback(
    async (projectId, params = {}) => {
      if (!token || !projectId) return;

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await projectAPI.getProjectSummaryReport(
          projectId,
          params
        );
        dispatch({ type: "SET_PROJECT_SUMMARY", payload: response.data });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to fetch project summary";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
      }
    },
    [token]
  );

  const fetchProductivityAnalysis = useCallback(
    async (projectId, params = {}) => {
      if (!token || !projectId) return;

      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await projectAPI.getProductivityAnalysis(
          projectId,
          params
        );
        dispatch({ type: "SET_PRODUCTIVITY_ANALYSIS", payload: response.data });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          "Failed to fetch productivity analysis";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
        toast.error(errorMessage);
      }
    },
    [token]
  );

  const setSelectedMonth = useCallback((month) => {
    dispatch({ type: "SET_SELECTED_MONTH", payload: month });
  }, []);

  const setSelectedProject = useCallback((project) => {
    dispatch({ type: "SET_SELECTED_PROJECT", payload: project });
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      fetchMonthlyProgress,
      updateMonthlyProgress,
      fetchProjectSummary,
      fetchProductivityAnalysis,
      setSelectedMonth,
      setSelectedProject,
      token,
    }),
    [
      state,
      fetchMonthlyProgress,
      updateMonthlyProgress,
      fetchProjectSummary,
      fetchProductivityAnalysis,
      setSelectedMonth,
      setSelectedProject,
      token,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export default ProgressContext;
