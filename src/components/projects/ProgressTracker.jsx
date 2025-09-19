import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
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
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Textarea,
  Grid,
  GridItem,
  useToast,
  Alert,
  AlertIcon,
  Flex,
  Spinner,
  Tooltip,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { projectTaskAPI } from "../../services/api";
import {
  FiPlus,
  FiMinus,
  FiEdit2,
  FiCalendar,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiEye,
  FiBarChart2,
  FiDollarSign,
} from "react-icons/fi";
import WeeklyProgressForm from "./WeeklyProgressForm";

const ProgressTracker = ({ projectTasks, onProgressUpdate, projectId }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);
  const [progressHistory, setProgressHistory] = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  // Store expanded states for each task
  const [expandedTasks, setExpandedTasks] = useState({});

  // Legacy simple progress modal
  const [progressData, setProgressData] = useState({
    targetedQuantity: "",
    achievedQuantity: "",
    consumedManhours: "",
    remarks: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isWeeklyProgressOpen,
    onOpen: onWeeklyProgressOpen,
    onClose: onWeeklyProgressClose,
  } = useDisclosure();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();

  const toast = useToast();

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();

    for (let i = -6; i <= 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  // ✅ UPDATED: Task-Level CPI Calculation Function - Uses Quantity-Based Progress
  const calculateCPI = (task) => {
    const plannedManhours = task.totalBudgetedManhours || 0;
    const actualManhours = task.totalConsumedManhours || 0;
    
    // ✅ QUANTITY-BASED progress calculation
    const progressPercentage = task.quantity > 0
      ? (task.totalInstalledQuantity / task.quantity) * 100
      : 0;

    // Handle edge cases
    if (actualManhours === 0) {
      return {
        cpi: null,
        earnedValue: 0,
        actualCost: 0,
        interpretation: "No Progress",
      };
    }

    if (plannedManhours === 0) {
      return {
        cpi: null,
        earnedValue: 0,
        actualCost: actualManhours,
        interpretation: "No Plan",
      };
    }

    // ✅ CPI Calculation using quantity-based progress
    // EV = Planned Man-hours × (Quantity Progress %)
    // AC = Actual Man-hours recorded
    const earnedValue = plannedManhours * (Math.min(progressPercentage, 100) / 100);
    const actualCost = actualManhours;
    const cpi = earnedValue / actualCost;

    let interpretation = "";
    let colorScheme = "";

    if (cpi >= 1.0) {
      interpretation = "Under Budget";
      colorScheme = "green";
    } else if (cpi >= 0.9) {
      interpretation = "Near Budget";
      colorScheme = "yellow";
    } else {
      interpretation = "Over Budget";
      colorScheme = "red";
    }

    return {
      cpi: cpi,
      earnedValue: earnedValue,
      actualCost: actualCost,
      interpretation: interpretation,
      colorScheme: colorScheme,
    };
  };

  // ✅ UPDATED: Project-Level CPI Calculation - Uses Quantity-Based Progress
  const calculateProjectCPI = () => {
    let totalEarnedValue = 0;
    let totalActualCost = 0;
    let totalPlannedValue = 0;

    projectTasks.forEach((task) => {
      const plannedManhours = task.totalBudgetedManhours || 0;
      const actualManhours = task.totalConsumedManhours || 0;
      
      // ✅ QUANTITY-BASED progress calculation
      const progressPercentage = task.quantity > 0 
        ? task.totalInstalledQuantity / task.quantity 
        : 0;

      // Earned Value = Planned manhours × quantity progress percentage
      const earnedValue = plannedManhours * Math.min(progressPercentage, 1);

      totalEarnedValue += earnedValue;
      totalActualCost += actualManhours;
      totalPlannedValue += plannedManhours;
    });

    // Project CPI = Total EV / Total AC
    const projectCPI = totalActualCost > 0 ? totalEarnedValue / totalActualCost : null;

    // Project Progress = Total EV / Total Planned
    const projectProgress = totalPlannedValue > 0 ? (totalEarnedValue / totalPlannedValue) * 100 : 0;

    return {
      cpi: projectCPI,
      totalEarnedValue,
      totalActualCost,
      totalPlannedValue,
      projectProgress: Math.min(projectProgress, 100),
    };
  };

  // Task CPI Badge Component
  const CPIBadge = ({ task }) => {
    const cpiData = calculateCPI(task);

    if (cpiData.cpi === null) {
      return (
        <Tooltip label={cpiData.interpretation}>
          <Badge colorScheme="gray" fontSize="xs">
            N/A
          </Badge>
        </Tooltip>
      );
    }

    const cpiFormatted = cpiData.cpi.toFixed(2);

    return (
      <Tooltip
        label={
          <VStack spacing={1} align="start">
            <Text fontSize="xs" fontWeight="bold">
              CPI Breakdown:
            </Text>
            <Text fontSize="xs">
              Earned Value: {cpiData.earnedValue.toFixed(2)} hrs
            </Text>
            <Text fontSize="xs">
              Actual Cost: {cpiData.actualCost.toFixed(2)} hrs
            </Text>
            <Text fontSize="xs">CPI: {cpiFormatted}</Text>
            <Text
              fontSize="xs"
              fontWeight="bold"
              color={
                cpiData.colorScheme === "green"
                  ? "green.200"
                  : cpiData.colorScheme === "yellow"
                  ? "yellow.200"
                  : "red.200"
              }
            >
              {cpiData.interpretation}
            </Text>
          </VStack>
        }
        placement="top"
        hasArrow
      >
        <Badge colorScheme={cpiData.colorScheme} fontSize="xs" cursor="pointer">
          {cpiFormatted}
        </Badge>
      </Tooltip>
    );
  };

  // FIXED: Fetch task progress history with proper array handling
  const fetchTaskHistory = async (taskId) => {
    const existingHistory = progressHistory[taskId];
    if (existingHistory && Array.isArray(existingHistory)) {
      return existingHistory;
    }

    setLoadingHistory(true);
    try {
      const response = await projectTaskAPI.getTaskProgressHistory(taskId);

      if (response.data.success) {
        const historyData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setProgressHistory((prev) => ({
          ...prev,
          [taskId]: historyData,
        }));
        return historyData;
      }
    } catch (error) {
      console.error("Error fetching task history:", error);
    } finally {
      setLoadingHistory(false);
    }
    return [];
  };

  const openWeeklyProgressForm = async (task) => {
    console.log("🎯 Opening weekly form for task:", task.id);
    console.log("📅 Selected month:", selectedMonth);

    setSelectedTask(task);

    const [year, month] = selectedMonth.split("-");
    console.log("🔍 Looking for progress - Year:", year, "Month:", month);

    const history = await fetchTaskHistory(task.id);
    console.log("📊 Fetched history:", history);

    const safeHistory = Array.isArray(history) ? history : [];
    const existingProgress = safeHistory.find(
      (p) => p.year === parseInt(year) && p.month === parseInt(month)
    );

    console.log("✅ Found existingProgress:", existingProgress);

    setSelectedProgress(existingProgress || null);
    onWeeklyProgressOpen();
  };

  const openProgressModal = (task) => {
    setSelectedTask(task);
    setProgressData({
      targetedQuantity: "",
      achievedQuantity: "",
      consumedManhours: "",
      remarks: "",
    });
    onOpen();
  };

  const viewTaskHistory = async (task) => {
    setSelectedTask(task);
    await fetchTaskHistory(task.id);
    onHistoryOpen();
  };

  const handleWeeklyProgressSave = (savedData) => {
    onWeeklyProgressClose();
    onProgressUpdate();

    toast({
      title: "Success",
      description: "Weekly progress saved successfully",
      status: "success",
      duration: 3000,
    });
  };

  // FIXED: Use projectTaskAPI instead of fetch
  const handleProgressSubmit = async () => {
    if (!selectedTask || !selectedMonth) return;

    setSubmitting(true);
    try {
      const [year, month] = selectedMonth.split("-");

      const response = await projectTaskAPI.recordTaskProgress(
        selectedTask.id,
        {
          month: parseInt(month),
          year: parseInt(year),
          targetedQuantity: parseFloat(progressData.targetedQuantity) || 0,
          achievedQuantity: parseFloat(progressData.achievedQuantity) || 0,
          consumedManhours: parseFloat(progressData.consumedManhours) || 0,
          remarks: progressData.remarks,
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Progress recorded successfully",
          status: "success",
          duration: 3000,
        });

        onClose();
        onProgressUpdate();
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to record progress",
          status: "error",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error recording progress:", error);
      toast({
        title: "Error",
        description: "Failed to record progress",
        status: "error",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!projectTasks || projectTasks.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text>No tasks available for progress tracking</Text>
          <Text fontSize="sm">
            Configure task quantities first in the Task Management tab.
          </Text>
        </VStack>
      </Alert>
    );
  }

  // Handler for toggling task expansion
  const toggleTaskExpansion = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const tasksByCategory = projectTasks.reduce((acc, task) => {
    const categoryName = task.categoryName || "Uncategorized";
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(task);
    return acc;
  }, {});

  // Calculate project-level metrics
  const projectMetrics = calculateProjectCPI();

  // Get project CPI interpretation
  const getProjectCPIStatus = () => {
    if (projectMetrics.cpi === null) {
      return { color: "gray", text: "No Data", bgColor: "gray.800" };
    }

    if (projectMetrics.cpi >= 1.0) {
      return { color: "green", text: "Under Budget", bgColor: "green.900" };
    } else if (projectMetrics.cpi >= 0.9) {
      return { color: "yellow", text: "Near Budget", bgColor: "yellow.900" };
    } else {
      return { color: "red", text: "Over Budget", bgColor: "red.900" };
    }
  };

  const projectStatus = getProjectCPIStatus();

  return (
    <VStack spacing={6} align="stretch">
      {/* Project-Level CPI Summary Card */}
      <Card bg={projectStatus.bgColor} borderColor="gray.600" borderWidth="2px">
        <CardHeader>
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Box p={3} bg="gray.700" borderRadius="md">
                <FiDollarSign size={24} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="lg" fontWeight="bold">
                  Project Cost Performance Index
                </Text>
                <Text color="gray.300" fontSize="sm">
                  Overall project budget efficiency (Quantity-based)
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={6}>
              <Stat textAlign="center">
                <StatLabel color="gray.300">Project CPI</StatLabel>
                <StatNumber color={projectStatus.color + ".200"} fontSize="3xl">
                  {projectMetrics.cpi !== null
                    ? projectMetrics.cpi.toFixed(2)
                    : "N/A"}
                </StatNumber>
                <StatHelpText
                  color={projectStatus.color + ".300"}
                  fontWeight="bold"
                >
                  {projectStatus.text}
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color="gray.300">Earned Value</StatLabel>
                <StatNumber color="white" fontSize="xl">
                  {formatNumber(projectMetrics.totalEarnedValue)} hrs
                </StatNumber>
                <StatHelpText color="gray.400">
                  vs {formatNumber(projectMetrics.totalActualCost)} actual
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color="gray.300">Progress</StatLabel>
                <StatNumber color="white" fontSize="xl">
                  {projectMetrics.projectProgress.toFixed(1)}%
                </StatNumber>
                <StatHelpText color="gray.400">Overall completion</StatHelpText>
              </Stat>
            </HStack>
          </HStack>
        </CardHeader>
      </Card>

      {/* Header */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="white">
                Progress Tracking
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Record detailed weekly progress with quantity-based CPI monitoring
              </Text>
            </VStack>

            <HStack spacing={4}>
              <FormControl maxW="200px">
                <FormLabel color="gray.300" fontSize="sm" mb={1}>
                  Select Month
                </FormLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  {generateMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <VStack align="end" spacing={0}>
                <Text color="gray.400" fontSize="lg" fontWeight="bold">
                  {getMonthName(selectedMonth)}
                </Text>
                <Badge colorScheme="blue" fontSize="xs">
                  Active Period
                </Badge>
              </VStack>
            </HStack>
          </Flex>
        </CardHeader>
      </Card>

      {/* ✅ UPDATED: Tasks by Category - Now uses quantity-based progress */}
      <VStack spacing={4} align="stretch">
        {Object.entries(tasksByCategory).map(([categoryName, tasks]) => (
          <Card key={categoryName} bg="gray.800" borderColor="gray.700">
            <CardHeader py={3}>
              <HStack justify="space-between">
                <Text color="white" fontWeight="bold" fontSize="md">
                  {categoryName}
                </Text>
                <Badge variant="outline" colorScheme="blue">
                  {tasks.length} tasks
                </Badge>
              </HStack>
            </CardHeader>

            <CardBody pt={0}>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.400" w="40px"></Th>
                      <Th color="gray.400" minW="250px">
                        Task Description
                      </Th>
                      <Th color="gray.400" isNumeric>
                        Total Qty
                      </Th>
                      <Th color="gray.400" isNumeric>
                        Progress %
                      </Th>
                      <Th color="gray.400" isNumeric>
                        CPI
                      </Th>
                      <Th color="gray.400" minW="200px">
                        Actions
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tasks.map((task) => {
                      // ✅ FIXED: Now uses quantity-based progress instead of manhour-based
                      const quantityProgressPercentage = task.quantity > 0
                        ? (task.totalInstalledQuantity / task.quantity) * 100
                        : 0;

                      const getStatusColor = () => {
                        if (quantityProgressPercentage >= 100) return "green";
                        if (quantityProgressPercentage >= 75) return "yellow";
                        if (quantityProgressPercentage > 0) return "blue";
                        return "gray";
                      };

                      const getStatusText = () => {
                        if (quantityProgressPercentage >= 100) return "Complete";
                        if (quantityProgressPercentage >= 75) return "Near Complete";
                        if (quantityProgressPercentage > 0) return "In Progress";
                        return "Not Started";
                      };

                      return (
                        <React.Fragment key={task.id}>
                          <Tr>
                            <Td>
                              <IconButton
                                aria-label="Expand row"
                                icon={expandedTasks[task.id] ? <FiMinus /> : <FiPlus />}
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleTaskExpansion(task.id)}
                                color="white"
                              />
                            </Td>
                            <Td color="white" maxW="300px">
                              <VStack align="start" spacing={1}>
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  noOfLines={2}
                                >
                                  {task.masterSubTask?.name}
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color="gray.400"
                                  fontFamily="mono"
                                >
                                  {task.masterSubTask?.masterActivity?.code}
                                </Text>
                              </VStack>
                            </Td>

                            <Td isNumeric color="white">
                              {formatNumber(task.quantity)} {task.unit}
                            </Td>

                            <Td isNumeric>
                              <Badge colorScheme={getStatusColor()}>
                                {quantityProgressPercentage.toFixed(1)}%
                              </Badge>
                            </Td>

                            <Td isNumeric>
                              <CPIBadge task={task} />
                            </Td>

                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  leftIcon={<FiBarChart2 />}
                                  colorScheme="blue"
                                  onClick={() => openWeeklyProgressForm(task)}
                                >
                                  Weekly Entry
                                </Button>

                                <Tooltip label="View progress history">
                                  <IconButton
                                    size="sm"
                                    icon={<FiEye />}
                                    variant="outline"
                                    onClick={() => viewTaskHistory(task)}
                                    aria-label="View history"
                                  />
                                </Tooltip>
                              </HStack>
                            </Td>
                          </Tr>

                          {expandedTasks[task.id] && (
                            <Tr bg="gray.900">
                              <Td colSpan={6}>
                                <Grid templateColumns="repeat(2, 1fr)" gap={4} p={4}>
                                  <Box>
                                    <VStack align="start" spacing={3}>
                                      <Box>
                                        <Text color="gray.400" fontSize="sm">Installed Quantity</Text>
                                        <Text color="white" fontSize="md">
                                          {formatNumber(task.totalInstalledQuantity || 0)} {task.unit}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text color="gray.400" fontSize="sm">Budgeted Hours</Text>
                                        <Text color="white" fontSize="md">
                                          {formatNumber(task.totalBudgetedManhours)}
                                        </Text>
                                      </Box>
                                    </VStack>
                                  </Box>
                                  <Box>
                                    <VStack align="start" spacing={3}>
                                      <Box>
                                        <Text color="gray.400" fontSize="sm">Consumed Hours</Text>
                                        <Text color="white" fontSize="md">
                                          {formatNumber(task.totalConsumedManhours)}
                                        </Text>
                                      </Box>
                                      <Box>
                                        <Text color="gray.400" fontSize="sm">Status</Text>
                                        <Badge
                                          colorScheme={getStatusColor()}
                                          variant="subtle"
                                        >
                                          {getStatusText()}
                                        </Badge>
                                      </Box>
                                    </VStack>
                                  </Box>
                                </Grid>
                              </Td>
                            </Tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        ))}
      </VStack>

      {/* All Existing Modals - UNCHANGED */}
      {/* Weekly Progress Form Modal */}
      <Modal
        isOpen={isWeeklyProgressOpen}
        onClose={onWeeklyProgressClose}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent maxW="90vw">
          <ModalHeader>Weekly Progress Entry</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedTask && (
              <WeeklyProgressForm
                taskId={selectedTask.id}
                taskDetails={{
                  ...selectedTask,
                  category: selectedTask.categoryName,
                  name: selectedTask.masterSubTask?.name,
                }}
                existingProgress={selectedProgress}
                onSave={handleWeeklyProgressSave}
                onCancel={onWeeklyProgressClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Legacy Progress Entry Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">
            Quick Progress - {getMonthName(selectedMonth)}
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody>
            <VStack spacing={6} align="stretch">
              {selectedTask && (
                <Card bg="gray.700" borderColor="gray.600">
                  <CardBody py={3}>
                    <VStack align="start" spacing={2}>
                      <Text color="white" fontWeight="bold" fontSize="sm">
                        {selectedTask.masterSubTask?.name}
                      </Text>
                      <HStack spacing={6}>
                        <Text color="gray.300" fontSize="xs">
                          Total Quantity: {formatNumber(selectedTask.quantity)}{" "}
                          {selectedTask.unit}
                        </Text>
                        <Text color="gray.300" fontSize="xs">
                          Budgeted:{" "}
                          {formatNumber(selectedTask.totalBudgetedManhours)} hrs
                        </Text>
                        <Text color="gray.300" fontSize="xs">
                          Consumed:{" "}
                          {formatNumber(selectedTask.totalConsumedManhours)} hrs
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="sm">
                    Targeted Quantity for {getMonthName(selectedMonth)}
                  </FormLabel>
                  <NumberInput
                    min={0}
                    precision={3}
                    value={progressData.targetedQuantity}
                    onChange={(value) =>
                      setProgressData((prev) => ({
                        ...prev,
                        targetedQuantity: value,
                      }))
                    }
                  >
                    <NumberInputField
                      bg="gray.700"
                      color="white"
                      borderColor="gray.600"
                    />
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.300" fontSize="sm">
                    Achieved Quantity
                  </FormLabel>
                  <NumberInput
                    min={0}
                    precision={3}
                    value={progressData.achievedQuantity}
                    onChange={(value) =>
                      setProgressData((prev) => ({
                        ...prev,
                        achievedQuantity: value,
                      }))
                    }
                  >
                    <NumberInputField
                      bg="gray.700"
                      color="white"
                      borderColor="gray.600"
                    />
                  </NumberInput>
                </FormControl>
              </Grid>

              <FormControl>
                <FormLabel color="gray.300" fontSize="sm">
                  Consumed Manhours
                </FormLabel>
                <NumberInput
                  min={0}
                  precision={2}
                  value={progressData.consumedManhours}
                  onChange={(value) =>
                    setProgressData((prev) => ({
                      ...prev,
                      consumedManhours: value,
                    }))
                  }
                >
                  <NumberInputField
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                  />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300" fontSize="sm">
                  Remarks (Optional)
                </FormLabel>
                <Textarea
                  value={progressData.remarks}
                  onChange={(e) =>
                    setProgressData((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }))
                  }
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                  rows={3}
                  placeholder="Add any notes about this month's progress..."
                />
              </FormControl>

              {progressData.targetedQuantity &&
                progressData.achievedQuantity && (
                  <Card bg="blue.900" borderColor="blue.600">
                    <CardBody py={3}>
                      <HStack justify="space-between">
                        <Text color="white" fontSize="sm">
                          Progress Preview:
                        </Text>
                        <Badge
                          colorScheme={
                            parseFloat(progressData.achievedQuantity) >=
                            parseFloat(progressData.targetedQuantity)
                              ? "green"
                              : "yellow"
                          }
                        >
                          {progressData.targetedQuantity > 0
                            ? (
                                (parseFloat(progressData.achievedQuantity) /
                                  parseFloat(progressData.targetedQuantity)) *
                                100
                              ).toFixed(1)
                            : 0}
                          % of Monthly Target
                        </Badge>
                      </HStack>
                    </CardBody>
                  </Card>
                )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleProgressSubmit}
              isLoading={submitting}
              isDisabled={
                !progressData.targetedQuantity || !progressData.achievedQuantity
              }
            >
              Record Progress
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Progress History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="4xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">
            Progress History - {selectedTask?.masterSubTask?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />

          <ModalBody>
            {loadingHistory ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" />
              </Flex>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th color="gray.400">Period</Th>
                      <Th color="gray.400" isNumeric>
                        Targeted
                      </Th>
                      <Th color="gray.400" isNumeric>
                        Achieved
                      </Th>
                      <Th color="gray.400" isNumeric>
                        Manhours
                      </Th>
                      <Th color="gray.400" isNumeric>
                        Variance
                      </Th>
                      <Th color="gray.400">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(() => {
                      const taskHistory = progressHistory[selectedTask?.id];
                      const safeHistory = Array.isArray(taskHistory)
                        ? taskHistory
                        : [];

                      if (safeHistory.length === 0) {
                        return (
                          <Tr>
                            <Td colSpan={6}>
                              <VStack py={8} spacing={3}>
                                <Text color="gray.400" textAlign="center">
                                  No progress history found for this task
                                </Text>
                                <Text
                                  color="gray.500"
                                  fontSize="sm"
                                  textAlign="center"
                                >
                                  Add some weekly progress entries to see
                                  history here
                                </Text>
                                <Button
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => {
                                    onHistoryClose();
                                    openWeeklyProgressForm(selectedTask);
                                  }}
                                >
                                  Add Progress Entry
                                </Button>
                              </VStack>
                            </Td>
                          </Tr>
                        );
                      }

                      return safeHistory.map((progress, index) => (
                        <Tr key={progress.id || index}>
                          <Td color="white">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">
                                {progress.monthName ||
                                  `${progress.month}/${progress.year}`}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {progress.year} - Month {progress.month}
                              </Text>
                            </VStack>
                          </Td>
                          <Td color="white" isNumeric>
                            {(progress.targetedQuantity || 0).toFixed(3)}
                          </Td>
                          <Td color="white" isNumeric>
                            {(progress.achievedQuantity || 0).toFixed(3)}
                          </Td>
                          <Td color="white" isNumeric>
                            {(progress.consumedManhours || 0).toFixed(2)}
                          </Td>
                          <Td isNumeric>
                            <Badge
                              colorScheme={
                                (progress.varianceQuantity || 0) >= 0
                                  ? "green"
                                  : "red"
                              }
                              fontSize="xs"
                            >
                              {(progress.varianceQuantity || 0) >= 0 ? "+" : ""}
                              {(progress.varianceQuantity || 0).toFixed(3)}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {progress.status || "Completed"}
                            </Badge>
                          </Td>
                        </Tr>
                      ));
                    })()}
                  </Tbody>
                </Table>
              </Box>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onHistoryClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default ProgressTracker;
