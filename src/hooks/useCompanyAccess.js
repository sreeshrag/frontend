import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

export const useCompanyAccess = () => {
  const [companies, setCompanies] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCompaniesWithAccess = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        search: filters.search || "",
        plan: filters.plan || "",
      });

      const response = await fetch(
        `/api/superadmin/companies-access?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setCompanies(data.data.companies);
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch companies");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch companies with access data");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSectionsAndPermissions = useCallback(async () => {
    try {
      const response = await fetch("/api/access/sections", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSections(data.data);
        return data.data;
      } else {
        throw new Error(data.message || "Failed to fetch sections");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch sections and permissions");
      return null;
    }
  }, []);

  const grantAccess = useCallback(
    async (companyId, sectionId, permissionId) => {
      try {
        const response = await fetch("/api/superadmin/companies/grant-access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            companyId,
            sectionId,
            permissionId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Access granted successfully");
          return true;
        } else {
          throw new Error(data.message || "Failed to grant access");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    },
    []
  );

  const revokeAccess = useCallback(
    async (companyId, sectionId, permissionId) => {
      try {
        const response = await fetch(
          "/api/superadmin/companies/revoke-access",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
              companyId,
              sectionId,
              permissionId,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          toast.success("Access revoked successfully");
          return true;
        } else {
          throw new Error(data.message || "Failed to revoke access");
        }
      } catch (err) {
        toast.error(err.message);
        return false;
      }
    },
    []
  );

  const createSection = useCallback(
    async (sectionData) => {
      try {
        const response = await fetch("/api/access/sections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(sectionData),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Section created successfully");
          await fetchSectionsAndPermissions();
          return data.data;
        } else {
          throw new Error(data.message || "Failed to create section");
        }
      } catch (err) {
        toast.error(err.message);
        return null;
      }
    },
    [fetchSectionsAndPermissions]
  );

  const createPermission = useCallback(
    async (permissionData) => {
      try {
        const response = await fetch("/api/access/permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify(permissionData),
        });

        const data = await response.json();

        if (data.success) {
          toast.success("Permission created successfully");
          await fetchSectionsAndPermissions();
          return data.data;
        } else {
          throw new Error(data.message || "Failed to create permission");
        }
      } catch (err) {
        toast.error(err.message);
        return null;
      }
    },
    [fetchSectionsAndPermissions]
  );

  return {
    companies,
    sections,
    loading,
    error,
    fetchCompaniesWithAccess,
    fetchSectionsAndPermissions,
    grantAccess,
    revokeAccess,
    createSection,
    createPermission,
  };
};
