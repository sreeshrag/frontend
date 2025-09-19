import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";

export const usePermission = () => {
  // ✅ Use shallow equality comparison to prevent unnecessary re-renders
  const { user, company } = useSelector(
    (state) => ({
      user: state.auth.user,
      company: state.auth.company,
    }),
    (left, right) => {
      return left.user === right.user && left.company === right.company;
    }
  );

  // ✅ Memoize permissions with stable dependencies
  const permissions = useMemo(() => {
    if (!user || !user.role || !company) {
      return [];
    }

    if (
      company.status !== "active" ||
      (user.companyId && company.id && user.companyId !== company.id)
    ) {
      return [];
    }

    const rolePermissions = {
      super_admin: [
        "company.manage_all",
        "projects.manage_all",
        "data.view_all",
        "system.admin",
      ],
      company_admin: [
        "users.manage",
        "projects.view",
        "projects.create",
        "projects.edit",
        "projects.delete",
        "projects.manage_categories",
        "projects.manage_tasks",
        "progress.view",
        "progress.update",
        "progress.manage",
        "reports.view",
        "reports.generate",
        "reports.export",
        "data.import_export",
        "dashboard.view",
        "dashboard.manage",
        "company.view",
        "company.edit",
      ],
      staff: [
        "projects.view",
        "progress.view",
        "progress.update",
        "reports.view",
        "dashboard.view",
      ],
    };

    const companyAccess = Array.isArray(company.permissions)
      ? company.permissions
      : [];
    const databasePermissions = companyAccess
      .filter((access) => access && access.key)
      .map((access) => access.key);

    const userRolePermissions = rolePermissions[user.role] || [];
    const effectivePermissions = new Set([
      ...userRolePermissions,
      ...databasePermissions,
    ]);

    if (company.subscription?.status === "active") {
      const plan = company.subscription.plan;
      if (plan === "enterprise") {
        effectivePermissions.add("projects.bulk_operations");
        effectivePermissions.add("analytics.advanced");
      } else if (plan === "premium") {
        effectivePermissions.add("analytics.standard");
      }
    }

    return Array.from(effectivePermissions);
  }, [
    user?.id,
    user?.role,
    user?.companyId,
    company?.id,
    company?.status,
    company?.permissions,
    company?.subscription?.status,
    company?.subscription?.plan,
  ]);

  // ✅ Memoize callback functions to prevent re-creation
  const hasPermission = useCallback(
    (permission) => {
      return Array.isArray(permissions) && permissions.includes(permission);
    },
    [permissions]
  );

  const canManageProjects = useCallback(() => {
    if (!user?.role) return false;

    return (
      (hasPermission("projects.manage_tasks") ||
        hasPermission("projects.create") ||
        hasPermission("projects.edit") ||
        user.role === "company_admin") &&
      company?.status === "active"
    );
  }, [hasPermission, user?.role, company?.status]);

  const canViewProjects = useCallback(() => {
    return hasPermission("projects.view") || canManageProjects();
  }, [hasPermission, canManageProjects]);

  const canCreateProjects = useCallback(() => {
    return hasPermission("projects.create") && canManageProjects();
  }, [hasPermission, canManageProjects]);

  const canEditProjects = useCallback(() => {
    return hasPermission("projects.edit") && canManageProjects();
  }, [hasPermission, canManageProjects]);

  const canDeleteProjects = useCallback(() => {
    return hasPermission("projects.delete") && canManageProjects();
  }, [hasPermission, canManageProjects]);

  const hasAnyPermission = useCallback(
    (permissionList) => {
      if (!Array.isArray(permissionList)) return false;
      return permissionList.some((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (permissionList) => {
      if (!Array.isArray(permissionList)) return false;
      return permissionList.every((permission) =>
        permissions.includes(permission)
      );
    },
    [permissions]
  );

  return {
    permissions,
    hasPermission,
    canManageProjects,
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canViewProjects,
    hasAnyPermission,
    hasAllPermissions,
    user,
    company,
  };
};
