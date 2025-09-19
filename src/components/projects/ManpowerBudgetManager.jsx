import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  HStack,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
  Text,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  CheckboxGroup,
  Stack,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSettings,
  FiBarChart2,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import CategorySelector from "./CategorySelector";
import TaskQuantityManager from "./TaskQuantityManager";
import ProgressTracker from "./ProgressTracker";
import BudgetSummary from "./BudgetSummary";
import { projectTaskAPI } from "../../services/api";
import { manpowerAPI } from "../../services/api";
import ReportsAndAnalytics from "./ReportsAndAnalytics";

const ManpowerBudgetManager = ({ projectId, currentProject }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const toast = useToast();

  const {
    isOpen: isCategorySelectorOpen,
    onOpen: onCategorySelectorOpen,
    onClose: onCategorySelectorClose,
  } = useDisclosure();

  // Fetch project task hierarchy on load
  useEffect(() => {
    if (projectId) {
      fetchProjectTasks();
    }
  }, [projectId]);

  const fetchProjectTasks = async () => {
    setLoading(true);
    try {
      const response = await manpowerAPI.getTaskHierarchy(projectId);

      if (response.data.success) {
        setCategories(response.data.data);
        setHasInitialized(response.data.data.length > 0);

        // ✅ UPDATED: Flatten tasks with quantity fields for quantity-based tracking
        const allTasks = response.data.data.flatMap(
          (category) =>
            category.projectTasks?.map((task) => ({
              ...task,
              categoryName: category.name,
              categoryCode: category.code,
              // ✅ Ensure quantity fields are available for progress calculation
              totalInstalledQuantity: task.totalInstalledQuantity || 0,
              quantity: task.quantity || 0,
              // Calculate quantity-based progress for immediate use
              quantityProgress: task.quantity > 0 
                ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
                : 0
            })) || []
        );
        setProjectTasks(allTasks);

        // Fetch summary with quantity-based calculations
        fetchBudgetSummary();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to fetch project tasks",
          status: "error",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch project tasks",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Fetch budget summary with quantity-based progress awareness
  const fetchBudgetSummary = async () => {
    try {
      const response = await manpowerAPI.getProjectSummary(projectId);

      if (response.data.success) {
        // ✅ Enhance summary with quantity-based metrics
        const summaryData = response.data.data.summary;
        
        // Calculate overall quantity progress if not provided by backend
        if (!summaryData.overallQuantityProgress && projectTasks.length > 0) {
          const totalQuantityProgress = projectTasks.reduce((sum, task) => {
            const taskProgress = task.quantity > 0 
              ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
              : 0;
            return sum + taskProgress;
          }, 0);
          
          summaryData.overallQuantityProgress = projectTasks.length > 0 
            ? totalQuantityProgress / projectTasks.length 
            : 0;
        }
        
        setBudgetSummary(summaryData);
      }
    } catch (error) {
      console.error("Error fetching budget summary:", error);
    }
  };

  const handleCategorySelection = async (selectedCategories) => {
    setLoading(true);
    try {
      const response = await manpowerAPI.initializeTasks(
        projectId,
        selectedCategories
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Successfully initialized ${response.data.data.length} categories`,
          status: "success",
          duration: 4000,
        });

        // Refresh data with quantity fields
        await fetchProjectTasks();
        onCategorySelectorClose();
      } else {
        toast({
          title: "Error",
          description:
            response.data.message || "Failed to initialize categories",
          status: "error",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error initializing categories:", error);
      toast({
        title: "Error",
        description: "Failed to initialize categories",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* ✅ UPDATED: Header with quantity-based terminology */}
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="md" color="white">
            Manpower Budget & Tracking
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Manage work quantities, track quantity-based progress, and monitor CPI
          </Text>
        </VStack>

        <HStack spacing={3}>
          <Button
            leftIcon={<FiSettings />}
            variant="outline"
            onClick={onCategorySelectorOpen}
          >
            {hasInitialized ? "Manage Categories" : "Setup Categories"}
          </Button>
          <Button
            leftIcon={<FiDownload />}
            variant="outline"
            isDisabled={!hasInitialized}
          >
            Export
          </Button>
          <Button
            leftIcon={<FiBarChart2 />}
            colorScheme="blue"
            isDisabled={!hasInitialized}
          >
            Reports
          </Button>
        </HStack>
      </Flex>

      {/* ✅ Budget Summary - Now with quantity-based progress support */}
      {budgetSummary && <BudgetSummary summary={budgetSummary} />}

      {!hasInitialized ? (
        /* ✅ UPDATED: Setup State with quantity-focused messaging */
        <Card bg="gray.800" borderColor="gray.700">
          <CardBody>
            <VStack spacing={6} py={8}>
              <Text color="gray.300" fontSize="lg" textAlign="center">
                No manpower budget configured for this project
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center" maxW="md">
                Get started by selecting the construction categories (HVAC,
                Plumbing, Electrical, etc.) that apply to this project. This
                will create your work breakdown structure with quantity-based
                progress tracking.
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                size="lg"
                onClick={onCategorySelectorOpen}
              >
                Setup Manpower Budget
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        /* ✅ UPDATED: Main Interface with quantity-based components */
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList bg="gray.800" borderColor="gray.700">
            <Tab
              color="gray.300"
              _selected={{ color: "white", bg: "blue.600" }}
            >
              Task Management
            </Tab>
            <Tab
              color="gray.300"
              _selected={{ color: "white", bg: "blue.600" }}
            >
              Progress Tracking
            </Tab>
            <Tab
              color="gray.300"
              _selected={{ color: "white", bg: "blue.600" }}
            >
              Reports
            </Tab>
          </TabList>

          <TabPanels>
            {/* ✅ Task Management Tab - Now with quantity-based progress */}
            <TabPanel px={0}>
              <TaskQuantityManager
                categories={categories}
                projectTasks={projectTasks}
                onTaskUpdate={fetchProjectTasks}
                projectId={projectId}
              />
            </TabPanel>

            {/* ✅ Progress Tracking Tab - Now with quantity-based CPI */}
            <TabPanel px={0}>
              <ProgressTracker
                projectTasks={projectTasks}
                onProgressUpdate={fetchProjectTasks}
                projectId={projectId}
              />
            </TabPanel>

            {/* ✅ Reports Tab - Now with quantity-based analytics */}
            <TabPanel px={0}>
              <ReportsAndAnalytics
                projectTasks={projectTasks}
                categories={categories}
                budgetSummary={budgetSummary}
                projectId={projectId}
                currentProject={currentProject}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* ✅ UPDATED: Category Selection Modal with quantity awareness */}
      <Modal
        isOpen={isCategorySelectorOpen}
        onClose={onCategorySelectorClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">
            {hasInitialized
              ? "Manage Categories"
              : "Select Construction Categories"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack align="start" spacing={3} mb={4}>
              <Text color="gray.300" fontSize="sm">
                Categories will be configured for quantity-based progress tracking
              </Text>
              <Text color="gray.400" fontSize="xs">
                Progress calculations will be based on installed vs. total quantities
              </Text>
            </VStack>
            <CategorySelector
              onSelectionComplete={handleCategorySelection}
              existingCategories={categories}
              isUpdate={hasInitialized}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ManpowerBudgetManager;
