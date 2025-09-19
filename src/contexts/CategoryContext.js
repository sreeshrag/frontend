import React, { createContext, useContext, useCallback, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (projectId) => {
    console.log("🔄 fetchCategories called with projectId:", projectId);

    // Validate projectId
    if (!projectId) {
      console.error("❌ No projectId provided");
      setError("Project ID is required");
      toast.error("Project ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    console.log("⏳ Loading state set to true");

    // Check authentication token
    const token = localStorage.getItem("accessToken");
    console.log("🔑 Token check:", token ? "Token exists" : "No token found");

    if (!token) {
      console.error("❌ No authentication token");
      setError("No authentication token found");
      toast.error("Please login to continue");
      setLoading(false);
      return;
    }

    const maxRetries = 3;
    let currentTry = 0;

    while (currentTry < maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("⏰ Request timeout triggered");
        controller.abort();
      }, 30000); // Reduced to 30 seconds

      try {
        console.log(
          `🚀 Attempt ${currentTry + 1}/${maxRetries} to fetch categories`
        );
        console.log("📡 API Base URL:", api.defaults.baseURL);
        console.log(
          "🎯 Full URL:",
          `${api.defaults.baseURL}/projects/${projectId}/categories`
        );

        // Check if api instance is configured properly
        console.log("🔧 API instance configuration:", {
          baseURL: api.defaults.baseURL,
          timeout: api.defaults.timeout,
          headers: api.defaults.headers,
        });

        const response = await api.get(`/projects/${projectId}/categories`, {
          signal: controller.signal,
          timeout: 30000,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          validateStatus: function (status) {
            console.log("📊 Response status:", status);
            return status >= 200 && status < 500; // Accept all statuses for debugging
          },
        });

        clearTimeout(timeoutId);

        console.log("✅ API Response received:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
        });

        // Handle different response scenarios
        if (response.status === 200) {
          if (response.data && response.data.success) {
            console.log("🎉 Success response with data:", response.data.data);
            console.log(
              "📋 Categories count:",
              response.data.data?.length || 0
            );
            setCategories(response.data.data || []);
            setLoading(false);
            console.log("✅ Categories loaded successfully");
            return;
          } else {
            console.warn(
              "⚠️ Success status but no success flag:",
              response.data
            );
            // Try to extract categories anyway
            if (response.data && Array.isArray(response.data)) {
              console.log("📋 Using response data directly as array");
              setCategories(response.data);
              setLoading(false);
              return;
            } else if (
              response.data &&
              response.data.data &&
              Array.isArray(response.data.data)
            ) {
              console.log("📋 Using response.data.data as array");
              setCategories(response.data.data);
              setLoading(false);
              return;
            }
            throw new Error(
              response.data?.message || "Unexpected response format"
            );
          }
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`❌ Attempt ${currentTry + 1} failed:`, error);

        // Log detailed error information
        if (error.response) {
          console.error("🔍 Error response details:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error(
            "🔍 Network error - no response received:",
            error.request
          );
        } else {
          console.error("🔍 Request setup error:", error.message);
        }

        // Handle specific error cases
        if (error.response?.status === 401) {
          console.log("🔐 Authentication error - redirecting to login");
          setError("Authentication failed. Please login again.");
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("accessToken");
          window.location.href = "/auth/login";
          setLoading(false);
          return;
        }

        if (error.response?.status === 403) {
          console.log("🚫 Permission denied");
          setError("You don't have permission to access these categories.");
          toast.error("Access denied. Please check your permissions.");
          setLoading(false);
          return;
        }

        if (error.response?.status === 404) {
          console.log("🔍 Categories not found for project");
          setError("Categories not found for this project.");
          setCategories([]);
          setLoading(false);
          return;
        }

        // Retry logic for network errors or 5xx errors
        if (
          currentTry < maxRetries - 1 &&
          (!error.response ||
            error.response.status >= 500 ||
            error.name === "AbortError")
        ) {
          currentTry++;
          const retryDelay = 1000 * Math.pow(2, currentTry - 1); // Exponential backoff
          console.log(
            `🔄 Retrying in ${retryDelay}ms... (Attempt ${
              currentTry + 1
            }/${maxRetries})`
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          continue;
        }

        // Final error handling
        console.log("💥 All retry attempts exhausted or non-retryable error");
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch categories";
        setError(errorMessage);
        toast.error("Failed to load categories. Please try again.");
        setCategories([]);
        break;
      }
    }

    setLoading(false);
    console.log("🏁 fetchCategories completed, loading set to false");
  }, []);

  const createCategory = useCallback(async (projectId, categoryData) => {
    console.log("🆕 Creating category:", { projectId, categoryData });
    setLoading(true);
    try {
      const response = await api.post(
        `/projects/${projectId}/categories`,
        categoryData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Create category response:", response.data);

      if (response.data?.success) {
        const newCategory = response.data.data;
        setCategories((prev) => {
          console.log("📝 Adding new category to existing list:", [
            ...prev,
            newCategory,
          ]);
          return [...prev, newCategory];
        });
        toast.success("Category created successfully");
        return newCategory;
      } else {
        throw new Error(response.data?.message || "Failed to create category");
      }
    } catch (error) {
      console.error("❌ Error creating category:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create category";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(
    async (projectId, categoryId, categoryData) => {
      console.log("📝 Updating category:", {
        projectId,
        categoryId,
        categoryData,
      });
      setLoading(true);
      try {
        const response = await api.put(
          `/projects/${projectId}/categories/${categoryId}`,
          categoryData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.success) {
          const updatedCategory = response.data.data;
          setCategories((prev) => {
            const updated = prev.map((cat) =>
              cat.id === categoryId ? updatedCategory : cat
            );
            console.log("📝 Updated categories list:", updated);
            return updated;
          });
          toast.success("Category updated successfully");
          return updatedCategory;
        } else {
          throw new Error(
            response.data?.message || "Failed to update category"
          );
        }
      } catch (error) {
        console.error("❌ Error updating category:", error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to update category";
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (projectId, categoryId) => {
    console.log("🗑️ Deleting category:", { projectId, categoryId });
    setLoading(true);
    try {
      const response = await api.delete(
        `/projects/${projectId}/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.data?.success) {
        setCategories((prev) => {
          const filtered = prev.filter((cat) => cat.id !== categoryId);
          console.log("🗑️ Categories after deletion:", filtered);
          return filtered;
        });
        toast.success("Category deleted successfully");
      } else {
        throw new Error(response.data?.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete category";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Debug the provider value
  const contextValue = {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  console.log("🎯 CategoryProvider context value:", {
    categoriesCount: categories.length,
    loading,
    error,
    hasToken: !!localStorage.getItem("accessToken"),
  });

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    console.error("❌ useCategory called outside of CategoryProvider");
    throw new Error("useCategory must be used within a CategoryProvider");
  }
  console.log("🎯 useCategory hook called, returning context");
  return context;
};
