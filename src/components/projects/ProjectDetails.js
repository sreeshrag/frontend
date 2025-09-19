import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Textarea,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit,
  FiBarChart2 as FiBarChart3,
  FiFileText,
  FiUpload,
  FiDownload,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiActivity,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "../../contexts/ProjectContext";
import { useAuth } from "../../contexts/AuthContext";
import { CategoryProvider } from "../../contexts/CategoryContext";
import CategoryManager from "./CategoryManager";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  getStatusColor,
  getProgressColor,
} from "../../utils/formatters";

// Import new manpower budget components
import ManpowerBudgetManager from "./ManpowerBudgetManager";
import CategorySelector from "./CategorySelector";
import TaskQuantityManager from "./TaskQuantityManager";
import ProgressTracker from "./ProgressTracker";
import BudgetSummary from "./BudgetSummary";

const ProjectDetailsContent = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const {
    currentProject,
    loading,
    error,
    fetchProject,
    importProjectData,
    clearCurrentProject,
  } = useProject();

  const [selectedFile, setSelectedFile] = useState(null);
  const [importData, setImportData] = useState("");
  const [importing, setImporting] = useState(false);
  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
    }

    return () => clearCurrentProject();
  }, [projectId]);

  const validateImportData = (data) => {
    if (!Array.isArray(data.categories)) {
      throw new Error("Import data must contain a categories array");
    }

    for (const category of data.categories) {
      if (!category.code || typeof category.code !== "string") {
        throw new Error("Each category must have a valid code");
      }
      if (!category.name || typeof category.name !== "string") {
        throw new Error("Each category must have a valid name");
      }

      if (category.tasks) {
        if (!Array.isArray(category.tasks)) {
          throw new Error(`Category ${category.code}: tasks must be an array`);
        }

        for (const task of category.tasks) {
          if (!task.code || typeof task.code !== "string") {
            throw new Error(
              `Category ${category.code}: each task must have a valid code`
            );
          }
          if (!task.description || typeof task.description !== "string") {
            throw new Error(
              `Category ${category.code}, Task ${task.code}: must have a valid description`
            );
          }

          // Validate numeric fields
          const numericFields = [
            "totalQuantity",
            "productivity",
            "totalBudgetedManhours",
            "totalInstalledQuantity",
            "totalConsumedManhours",
            "additionalLapsedManhours",
          ];
          for (const field of numericFields) {
            if (task[field] !== undefined && task[field] !== null) {
              const value = parseFloat(task[field]);
              if (isNaN(value) || value < 0) {
                throw new Error(
                  `Category ${category.code}, Task ${task.code}: ${field} must be a non-negative number`
                );
              }
            }
          }
        }
      }
    }
    return true;
  };

  const handleImportData = async () => {
    if (!importData.trim()) {
      toast.error("Please provide import data");
      return;
    }

    setImporting(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (parseError) {
        try {
          // If not JSON, try to parse as CSV or other format
          parsedData = parseImportData(importData);
        } catch (formatError) {
          toast.error("Invalid data format. Please check your input.", {
            duration: 4000,
          });
          return;
        }
      }

      try {
        // Validate the parsed data structure
        validateImportData(parsedData);
      } catch (validationError) {
        toast.error(validationError.message, {
          duration: 4000,
        });
        return;
      }

      await importProjectData(projectId, parsedData);
      onImportClose();
      setImportData("");
      toast.success("Project data imported successfully", {
        duration: 4000,
      });
      fetchProject(projectId); // Refresh data
    } catch (error) {
      // Error handled in context
    } finally {
      setImporting(false);
    }
  };

  const parseImportData = (data) => {
    // Simple CSV-like parsing - extend based on your Excel structure
    const lines = data.split("\n");
    const categories = [];

    // This is a simplified parser - you'd want to make this more robust
    // based on your actual Excel structure
    let currentCategory = null;

    lines.forEach((line) => {
      const columns = line.split(",");
      if (columns.length >= 3) {
        const code = columns[0]?.trim();
        const description = columns[1]?.trim();
        const quantity = parseFloat(columns[2]) || 0;

        if (code && description) {
          // Determine if this is a category or task based on code pattern
          if (code.length === 1 || !code.includes(".")) {
            // This is a category
            currentCategory = {
              code,
              name: description,
              tasks: [],
            };
            categories.push(currentCategory);
          } else if (currentCategory) {
            // This is a task
            currentCategory.tasks.push({
              code,
              description,
              totalQuantity: quantity,
              unit: columns[3]?.trim() || "",
              productivity: parseFloat(columns[4]) || 0,
              totalBudgetedManhours: parseFloat(columns[5]) || 0,
            });
          }
        }
      }
    });

    return { categories };
  };

  const exportProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export-data`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${currentProject.name}-data.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const calculateProjectStats = () => {
    if (!currentProject?.categories) return {};

    let totalBudgeted = 0;
    let totalConsumed = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    currentProject.categories.forEach((category) => {
      category.tasks?.forEach((task) => {
        totalBudgeted += parseFloat(task.totalBudgetedManhours || 0);
        totalConsumed += parseFloat(task.totalConsumedManhours || 0);
        totalTasks++;

        if (task.totalConsumedManhours >= task.totalBudgetedManhours) {
          completedTasks++;
        }
      });
    });

    const progressPercentage =
      totalBudgeted > 0 ? (totalConsumed / totalBudgeted) * 100 : 0;
    const completionPercentage =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const efficiencyPercentage =
      totalConsumed > 0 ? (totalBudgeted / totalConsumed) * 100 : 0;

    return {
      totalBudgeted,
      totalConsumed,
      totalRemaining: totalBudgeted - totalConsumed,
      totalTasks,
      completedTasks,
      progressPercentage,
      completionPercentage,
      efficiencyPercentage,
    };
  };

  // NEW: Handler for manpower budget data import
  const handleManpowerImport = async (excelData) => {
    try {
      // Parse the Excel data to match our master data structure
      const parsedData = parseExcelToMasterData(excelData);

      // Import as master data first (if user is super admin)
      const response = await fetch("/api/master-data/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Manpower budget data imported successfully", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error importing manpower data:", error);
      toast.error("Failed to import manpower budget data", {
        duration: 4000,
      });
    }
  };

  // NEW: Helper function to parse Excel data to our format
  const parseExcelToMasterData = (excelData) => {
    // This would parse your specific Excel structure
    // Based on the structure you showed me earlier
    const categories = [];

    // Example parsing logic - you'd customize this based on your Excel format
    const lines = excelData.split("\n");
    let currentCategory = null;
    let currentActivity = null;

    lines.forEach((line) => {
      const columns = line.split(",");
      if (columns.length >= 6) {
        const code = columns[3]?.trim(); // Activity Code column
        const description = columns[4]?.trim(); // Activity Description
        const qty = parseFloat(columns[5]) || 0; // Total Qty
        const unit = columns[6]?.trim(); // Unit
        const productivity = parseFloat(columns[7]) || 0; // Productivity

        // Determine if this is a category, activity, or sub-task based on your Excel structure
        if (code && description) {
          if (code.match(/^[A-Z]+$/)) {
            // This is a category
            currentCategory = {
              code,
              name: description,
              activities: [],
            };
            categories.push(currentCategory);
          } else if (code.includes("-") && currentCategory) {
            // This is an activity
            currentActivity = {
              code,
              name: description,
              subTasks: [],
            };
            currentCategory.activities.push(currentActivity);
          } else if (currentActivity) {
            // This is a sub-task
            currentActivity.subTasks.push({
              name: description,
              defaultProductivity: productivity,
              unit: unit || "No",
            });
          }
        }
      }
    });

    return { categories };
  };

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Project not found or you do not have permission to access it.
        </Alert>
      </Container>
    );
  }

  const stats = calculateProjectStats();

  return (
    <CategoryProvider>
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="outline"
                onClick={() => navigate("/dashboard/company/projects")}
              >
                Back to Projects
              </Button>
              <VStack align="start" spacing={0}>
                <Heading size="lg">{currentProject.name}</Heading>
                <HStack>
                  <Badge colorScheme={getStatusColor(currentProject.status)}>
                    {currentProject.status?.replace("_", " ")}
                  </Badge>
                  <Text color="gray.500" fontSize="sm">
                    {currentProject.projectType} • Created{" "}
                    {formatDate(currentProject.createdAt)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={3}>
              {user?.role === "company_admin" && (
                <>
                  <Button
                    leftIcon={<FiUpload />}
                    variant="outline"
                    onClick={onImportOpen}
                  >
                    Import Data
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    variant="outline"
                    onClick={exportProjectData}
                  >
                    Export Data
                  </Button>
                  <Button
                    leftIcon={<FiEdit />}
                    colorScheme="blue"
                    onClick={() =>
                      navigate(`/dashboard/company/projects/${projectId}/edit`)
                    }
                  >
                    Edit Project
                  </Button>
                </>
              )}
              <Button
                leftIcon={<FiBarChart3 />}
                colorScheme="green"
                onClick={() =>
                  navigate(`/dashboard/company/projects/${projectId}/progress`)
                }
              >
                View Progress
              </Button>
            </HStack>
          </Flex>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Tabs variant="enclosed" colorScheme="blue">
            <TabList bg="gray.800" borderColor="gray.700">
              <Tab
                color="gray.300"
                _selected={{ color: "white", bg: "blue.600" }}
              >
                Overview
              </Tab>

              {/* ✅ NEW: Manpower Budget Tab */}
              <Tab
                color="gray.300"
                _selected={{ color: "white", bg: "blue.600" }}
              >
                Manpower Budget
              </Tab>
              <Tab
                color="gray.300"
                _selected={{ color: "white", bg: "blue.600" }}
              >
                Statistics
              </Tab>
              <Tab
                color="gray.300"
                _selected={{ color: "white", bg: "blue.600" }}
              >
                Details
              </Tab>
            </TabList>

            <TabPanels>
              {/* Overview Tab */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Project Stats */}
                  <Grid
                    templateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                    gap={6}
                  >
                    <Card bg="gray.800" borderColor="gray.700">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.300"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <FiDollarSign /> Budget
                          </StatLabel>
                          <StatNumber color="white">
                            {formatCurrency(
                              currentProject.budget,
                              currentProject.currency
                            )}
                          </StatNumber>
                          <StatHelpText color="gray.400">
                            Total project budget
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.300"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <FiTarget /> Progress
                          </StatLabel>
                          <StatNumber color="white">
                            {stats.progressPercentage?.toFixed(1)}%
                          </StatNumber>
                          <StatHelpText color="gray.400">
                            {formatNumber(stats.totalConsumed)} /{" "}
                            {formatNumber(stats.totalBudgeted)} hrs
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.300"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <FiActivity /> Efficiency
                          </StatLabel>
                          <StatNumber color="white">
                            {stats.efficiencyPercentage?.toFixed(1)}%
                          </StatNumber>
                          <StatHelpText color="gray.400">
                            Manhour efficiency
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.300"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <FiUsers /> Apartments
                          </StatLabel>
                          <StatNumber color="white">
                            {currentProject.totalApartments}
                          </StatNumber>
                          <StatHelpText color="gray.400">
                            Total units
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  </Grid>

                  {/* Project Information */}
                  <Grid
                    templateColumns="repeat(auto-fit, minmax(400px, 1fr))"
                    gap={6}
                  >
                    <Card bg="gray.800" borderColor="gray.700">
                      <CardHeader>
                        <Heading size="md" color="white">
                          Project Information
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text color="gray.400" fontSize="sm">
                              Description
                            </Text>
                            <Text color="white">
                              {currentProject.description ||
                                "No description provided"}
                            </Text>
                          </Box>

                          <Box>
                            <Text color="gray.400" fontSize="sm">
                              Location
                            </Text>
                            <Text color="white">
                              {currentProject.location || "Not specified"}
                            </Text>
                          </Box>

                          <Box>
                            <Text color="gray.400" fontSize="sm">
                              Timeline
                            </Text>
                            <Text color="white">
                              {currentProject.startDate
                                ? formatDate(currentProject.startDate)
                                : "Not set"}{" "}
                              -
                              {currentProject.endDate
                                ? formatDate(currentProject.endDate)
                                : "Not set"}
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card bg="gray.800" borderColor="gray.700">
                      <CardHeader>
                        <Heading size="md" color="white">
                          Unit Breakdown
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text color="gray.400">Studio Apartments</Text>
                            <Badge>{currentProject.studioApartments}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400">1 BHK Apartments</Text>
                            <Badge>{currentProject.oneBhkApartments}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400">2 BHK Apartments</Text>
                            <Badge>{currentProject.twoBhkApartments}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400">Penthouses</Text>
                            <Badge>{currentProject.penthouses}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400">Retail Units</Text>
                            <Badge>{currentProject.retails}</Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text color="gray.400">Total Area</Text>
                            <Badge>
                              {formatNumber(currentProject.buildupArea)}{" "}
                              {currentProject.areaUnit}
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </Grid>

                  {/* Quick Actions */}
                </VStack>
              </TabPanel>

              {/* Work Breakdown Tab */}

              {/* ✅ NEW: Manpower Budget Tab */}
              <TabPanel>
                <ManpowerBudgetManager
                  projectId={projectId}
                  currentProject={currentProject}
                />
              </TabPanel>

              {/* Statistics Tab */}
              <TabPanel>
                <Grid
                  templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                  gap={6}
                >
                  <Card bg="gray.800" borderColor="gray.700">
                    <CardHeader>
                      <Heading size="md" color="white">
                        Manhour Statistics
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text color="gray.400">Total Budgeted</Text>
                          <Text color="white" fontWeight="bold">
                            {formatNumber(stats.totalBudgeted)} hrs
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Total Consumed</Text>
                          <Text color="white" fontWeight="bold">
                            {formatNumber(stats.totalConsumed)} hrs
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Remaining</Text>
                          <Text color="white" fontWeight="bold">
                            {formatNumber(stats.totalRemaining)} hrs
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Efficiency</Text>
                          <Badge
                            colorScheme={
                              stats.efficiencyPercentage >= 100
                                ? "green"
                                : "red"
                            }
                          >
                            {stats.efficiencyPercentage?.toFixed(1)}%
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg="gray.800" borderColor="gray.700">
                    <CardHeader>
                      <Heading size="md" color="white">
                        Task Statistics
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <HStack justify="space-between">
                          <Text color="gray.400">Total Tasks</Text>
                          <Text color="white" fontWeight="bold">
                            {stats.totalTasks}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Completed Tasks</Text>
                          <Text color="white" fontWeight="bold">
                            {stats.completedTasks}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Pending Tasks</Text>
                          <Text color="white" fontWeight="bold">
                            {stats.totalTasks - stats.completedTasks}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text color="gray.400">Completion Rate</Text>
                          <Badge
                            colorScheme={
                              stats.completionPercentage >= 80
                                ? "green"
                                : "yellow"
                            }
                          >
                            {stats.completionPercentage?.toFixed(1)}%
                          </Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg="gray.800" borderColor="gray.700">
                    <CardHeader>
                      <Heading size="md" color="white">
                        Category Summary
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        {currentProject.categories?.map((category) => {
                          const categoryBudget =
                            category.tasks?.reduce(
                              (sum, task) =>
                                sum +
                                (parseFloat(task.totalBudgetedManhours) || 0),
                              0
                            ) || 0;

                          return (
                            <HStack key={category.id} justify="space-between">
                              <Text color="gray.400" fontSize="sm" isTruncated>
                                {category.name}
                              </Text>
                              <Badge variant="outline">
                                {formatNumber(categoryBudget)} hrs
                              </Badge>
                            </HStack>
                          );
                        })}
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </TabPanel>

              {/* Details Tab */}
              <TabPanel>
                <Grid
                  templateColumns="repeat(auto-fit, minmax(400px, 1fr))"
                  gap={6}
                >
                  <Card bg="gray.800" borderColor="gray.700">
                    <CardHeader>
                      <Heading size="md" color="white">
                        Project Metadata
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Project ID
                          </Text>
                          <Text color="white" fontFamily="mono" fontSize="sm">
                            {currentProject.id}
                          </Text>
                        </Box>
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Created By
                          </Text>
                          <Text color="white">
                            {currentProject.creator?.firstName}{" "}
                            {currentProject.creator?.lastName}
                          </Text>
                        </Box>
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Created Date
                          </Text>
                          <Text color="white">
                            {formatDate(currentProject.createdAt, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Box>
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Last Updated
                          </Text>
                          <Text color="white">
                            {formatDate(currentProject.updatedAt, {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg="gray.800" borderColor="gray.700">
                    <CardHeader>
                      <Heading size="md" color="white">
                        System Information
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Categories
                          </Text>
                          <Text color="white">
                            {currentProject.categories?.length || 0} categories
                            defined
                          </Text>
                        </Box>
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Total Tasks
                          </Text>
                          <Text color="white">
                            {stats.totalTasks} tasks configured
                          </Text>
                        </Box>
                        <Box>
                          <Text color="gray.400" fontSize="sm">
                            Data Status
                          </Text>
                          <Badge
                            colorScheme={
                              currentProject.categories?.length > 0
                                ? "green"
                                : "yellow"
                            }
                          >
                            {currentProject.categories?.length > 0
                              ? "Complete"
                              : "Needs Import"}
                          </Badge>
                        </Box>
                      </VStack>
                    </CardBody>
                  </Card>
                </Grid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Import Data Modal */}
        <Modal isOpen={isImportOpen} onClose={onImportClose} size="4xl">
          <ModalOverlay />
          <ModalContent bg="gray.800" borderColor="gray.700">
            <ModalHeader color="white">Import Project Data</ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text color="gray.300">
                  Paste your project data in JSON format or CSV format. The
                  system will automatically detect the format and import the
                  work breakdown structure.
                </Text>

                <FormControl>
                  <FormLabel color="gray.300">Project Data</FormLabel>
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your project data here..."
                    rows={15}
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                    _placeholder={{ color: "gray.400" }}
                  />
                </FormControl>

                <Text fontSize="sm" color="gray.400">
                  Supported formats: JSON, CSV. For CSV format, use columns:
                  Code, Description, Quantity, Unit, Productivity, Budgeted
                  Hours
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="ghost"
                mr={3}
                onClick={onImportClose}
                color="gray.300"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleImportData}
                isLoading={importing}
                disabled={!importData.trim()}
              >
                Import Data
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </CategoryProvider>
  );
};

// Wrapper component that provides CategoryContext
const ProjectDetails = () => {
  return (
    <CategoryProvider>
      <ProjectDetailsContent />
    </CategoryProvider>
  );
};

export default ProjectDetails;
