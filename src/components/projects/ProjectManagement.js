import React, { useState, useEffect, useCallback } from "react";
import { projectAPI } from "../../services/projectAPI";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiFilter,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useProject } from "../../contexts/ProjectContext";
import { usePermission } from "../../hooks/usePermission";
import api from "../../services/api"; // Add this line

const ProjectManagement = () => {
  const navigate = useNavigate();
  const { projects, loading, error, fetchProjects, deleteProject } =
    useProject();

  const {
    canCreateProjects,
    canEditProjects,
    canDeleteProjects,
    canViewProjects,
  } = usePermission();

  // Local state for filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    projectType: "",
    page: 0,
    size: 10,
  });

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ✅ Memoized fetch function to prevent infinite loops
  const fetchProjectsWithFilters = useCallback(() => {
    if (canViewProjects()) {
      fetchProjects(filters);
    }
  }, [fetchProjects, filters, canViewProjects]);

  // ✅ Fetch projects only when component mounts or filters change
  useEffect(() => {
    fetchProjectsWithFilters();
  }, [fetchProjectsWithFilters]);

  // ✅ Separate effect for stats to prevent conflicts
  useEffect(() => {
    const fetchStats = async () => {
      if (!canViewProjects()) return;

      try {
        setStatsLoading(true);
        const response = await projectAPI.getProjectStats();

        if (response.data.success) {
          setStats(response.data.data);
        } else {
          throw new Error("Failed to fetch stats");
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        // Don't set error state for stats, just log it
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []); // ✅ Empty dependency array - only run once

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 0, // Reset to first page when filter changes
    }));
  }, []);

  // Handle search with debouncing
  const handleSearch = useCallback(
    (searchValue) => {
      handleFilterChange("search", searchValue);
    },
    [handleFilterChange]
  );

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(projectId);
        fetchProjectsWithFilters(); // Refresh list
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  // ✅ Permission check at component level
  if (!canViewProjects()) {
    return (
      <Box p={6} textAlign="center">
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">Access Denied</Text>
            <Text>You don't have permission to view projects.</Text>
          </VStack>
        </Alert>
      </Box>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      pending: "yellow",
      completed: "blue",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  return (
    <Box p={6}>
      {/* Header */}
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              Project Management
            </Text>
            <Text color="gray.400">
              Manage and track your construction projects
            </Text>
          </VStack>

          {canCreateProjects() && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => navigate("/dashboard/company/projects/new")}
            >
              New Project
            </Button>
          )}
        </HStack>

        {/* Stats Cards */}
        {statsLoading ? (
          <Flex justify="center" p={4}>
            <Spinner color="blue.400" />
          </Flex>
        ) : (
          stats && (
            <HStack spacing={4} wrap="wrap">
              <Box bg="gray.800" p={4} borderRadius="lg" minW="200px">
                <Text color="gray.400" fontSize="sm">
                  Total Projects
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="white">
                  {stats.totalProjects}
                </Text>
              </Box>
              <Box bg="gray.800" p={4} borderRadius="lg" minW="200px">
                <Text color="gray.400" fontSize="sm">
                  Active Projects
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.400">
                  {stats.activeProjects}
                </Text>
              </Box>
              <Box bg="gray.800" p={4} borderRadius="lg" minW="200px">
                <Text color="gray.400" fontSize="sm">
                  Completed
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                  {stats.completedProjects}
                </Text>
              </Box>
            </HStack>
          )
        )}

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              bg="gray.800"
              border="1px solid"
              borderColor="gray.600"
              color="white"
              _placeholder={{ color: "gray.400" }}
            />
          </InputGroup>

          <Select
            placeholder="All Status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            maxW="150px"
            bg="gray.800"
            border="1px solid"
            borderColor="gray.600"
            color="white"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select
            placeholder="All Types"
            value={filters.projectType}
            onChange={(e) => handleFilterChange("projectType", e.target.value)}
            maxW="150px"
            bg="gray.800"
            border="1px solid"
            borderColor="gray.600"
            color="white"
          >
            <option value="construction">Construction</option>
            <option value="renovation">Renovation</option>
            <option value="maintenance">Maintenance</option>
          </Select>
        </HStack>

        {/* Error Alert */}
        {error && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Error Loading Projects</Text>
              <Text fontSize="sm">{error}</Text>
            </VStack>
          </Alert>
        )}

        {/* Projects Table */}
        {loading ? (
          <Flex justify="center" p={8}>
            <VStack spacing={4}>
              <Spinner size="lg" color="blue.400" />
              <Text color="gray.400">Loading projects...</Text>
            </VStack>
          </Flex>
        ) : (
          <Box
            bg="gray.800"
            borderRadius="lg"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.600"
          >
            <Table variant="simple">
              <Thead bg="gray.700">
                <Tr>
                  <Th color="gray.300">Name</Th>
                  <Th color="gray.300">Status</Th>
                  <Th color="gray.300">Type</Th>
                  <Th color="gray.300">Created</Th>
                  <Th color="gray.300">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {projects.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={8}>
                      <VStack spacing={4}>
                        <Text color="gray.400">No projects found</Text>
                        {canCreateProjects() && (
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() =>
                              navigate("/dashboard/company/projects/new")
                            }
                          >
                            Create Your First Project
                          </Button>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  projects.map((project) => (
                    <Tr key={project.id} _hover={{ bg: "gray.700" }}>
                      <Td color="white">
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="semibold">{project.name}</Text>
                          <Text fontSize="sm" color="gray.400" noOfLines={1}>
                            {project.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(project.status)}
                          variant="solid"
                        >
                          {project.status}
                        </Badge>
                      </Td>
                      <Td color="gray.300">{project.projectType}</Td>
                      <Td color="gray.400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            icon={<FiEye />}
                            size="sm"
                            variant="ghost"
                            color="blue.400"
                            onClick={() =>
                              navigate(
                                `/dashboard/company/projects/${project.id}`
                              )
                            }
                            aria-label="View project"
                          />

                          {canEditProjects() && (
                            <IconButton
                              icon={<FiEdit3 />}
                              size="sm"
                              variant="ghost"
                              color="yellow.400"
                              onClick={() =>
                                navigate(
                                  `/dashboard/company/projects/${project.id}/edit`
                                )
                              }
                              aria-label="Edit project"
                            />
                          )}

                          {canDeleteProjects() && (
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              variant="ghost"
                              color="red.400"
                              onClick={() => handleDeleteProject(project.id)}
                              aria-label="Delete project"
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default React.memo(ProjectManagement);
