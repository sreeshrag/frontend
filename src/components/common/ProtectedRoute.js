import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  Spinner,
  Flex,
  Box,
  Alert,
  AlertIcon,
  VStack,
  Text,
} from "@chakra-ui/react";
import { usePermission } from "../../hooks/usePermission";

const ProtectedRoute = ({ children, roles = [], permissions = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  const { hasPermission, hasAnyPermission, company } = usePermission();

  // ✅ Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        minH="100vh"
        bg="#0f1419"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.400" thickness="4px" />
          <Text color="white">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  // ✅ Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // ✅ Enhanced user validation
  if (!user || typeof user !== "object") {
    console.error("ProtectedRoute: Invalid user object");
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.role) {
    console.error("ProtectedRoute: User role is missing");
    return <Navigate to="/auth/login" replace />;
  }

  // ✅ Safe role permissions check
  if (roles.length > 0 && !roles.includes(user.role)) {
    const redirectPath =
      user.role === "super_admin"
        ? "/dashboard/super-admin"
        : "/dashboard/company";

    console.warn(
      `ProtectedRoute: User role '${user.role}' not in allowed roles:`,
      roles
    );
    return <Navigate to={redirectPath} replace />;
  }

  // ✅ Safe specific permissions check
  if (permissions.length > 0 && !hasAnyPermission(permissions)) {
    return (
      <Box
        minH="100vh"
        bg="#0f1419"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Alert
          status="error"
          maxW="md"
          bg="red.900"
          color="white"
          borderRadius="lg"
        >
          <AlertIcon color="red.300" />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Access Denied</Text>
            <Text fontSize="sm">
              You don't have the required permissions to access this page.
            </Text>
            <Text fontSize="xs" color="gray.300">
              Required permissions: {permissions.join(", ")}
            </Text>
            {company?.subscription?.status !== "active" && (
              <Text fontSize="xs" color="orange.300">
                Your company subscription may need to be upgraded.
              </Text>
            )}
          </VStack>
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
