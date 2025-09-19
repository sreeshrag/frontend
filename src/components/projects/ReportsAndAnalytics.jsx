import React, { useState, useEffect } from 'react';
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
  Text,
  Badge,
  Progress,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  FormControl,
  FormLabel,
  Flex,
  Divider,
  Alert,
  AlertIcon,
  Spinner,
  useToast
} from '@chakra-ui/react';
import {
  FiDownload,
  FiTrendingUp,
  FiClock,
  FiTarget,
  FiActivity,
  FiBarChart2,
  FiCalendar
} from 'react-icons/fi';

const ReportsAndAnalytics = ({ projectTasks, categories, budgetSummary, projectId, currentProject }) => {
  const [selectedReportType, setSelectedReportType] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num || 0);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = -6; i <= 5; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    
    return options;
  };

  // ✅ UPDATED: Calculate task metrics using quantity-based progress
  const calculateTaskMetrics = () => {
    if (!projectTasks || projectTasks.length === 0) return null;

    const metrics = {
      total: projectTasks.length,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      overBudget: 0,
      onTrack: 0
    };

    projectTasks.forEach(task => {
      // ✅ QUANTITY-BASED progress calculation
      const quantityProgress = task.quantity > 0 
        ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
        : 0;
      
      if (quantityProgress >= 100) metrics.completed++;
      else if (quantityProgress > 0) metrics.inProgress++;
      else metrics.notStarted++;

      // ✅ Budget efficiency check using CPI logic
      const plannedManhours = task.totalBudgetedManhours || 0;
      const actualManhours = task.totalConsumedManhours || 0;
      const earnedValue = plannedManhours * (Math.min(quantityProgress, 100) / 100);
      const cpi = actualManhours > 0 ? earnedValue / actualManhours : 1;

      if (cpi < 0.9) metrics.overBudget++;
      else metrics.onTrack++;
    });

    return metrics;
  };

  // ✅ UPDATED: Category-wise report with quantity-based progress
  const getCategoryWiseReport = () => {
    const categoryReport = {};
    
    categories.forEach(category => {
      const categoryTasks = projectTasks.filter(task => task.categoryName === category.name);
      
      const totalBudgeted = categoryTasks.reduce((sum, task) => sum + (task.totalBudgetedManhours || 0), 0);
      const totalConsumed = categoryTasks.reduce((sum, task) => sum + (task.totalConsumedManhours || 0), 0);
      const totalQuantity = categoryTasks.reduce((sum, task) => sum + (task.quantity || 0), 0);
      const totalInstalledQuantity = categoryTasks.reduce((sum, task) => sum + (task.totalInstalledQuantity || 0), 0);
      
      // ✅ QUANTITY-BASED progress calculation for category
      const quantityProgress = totalQuantity > 0 
        ? (totalInstalledQuantity / totalQuantity) * 100 
        : 0;

      // ✅ Calculate category CPI using quantity-based earned value
      const categoryEarnedValue = totalBudgeted * (Math.min(quantityProgress, 100) / 100);
      const categoryCPI = totalConsumed > 0 ? categoryEarnedValue / totalConsumed : 1;
      
      categoryReport[category.name] = {
        taskCount: categoryTasks.length,
        totalBudgeted,
        totalConsumed,
        totalQuantity,
        totalInstalledQuantity,
        quantityProgress,
        cpi: categoryCPI,
        efficiency: quantityProgress, // Now represents quantity completion
        status: categoryCPI < 0.9 ? 'Over Budget' : 
                categoryCPI >= 1.0 ? 'Under Budget' : 'On Track'
      };
    });

    return categoryReport;
  };

  const handleExportReport = async () => {
    setLoading(true);
    try {
      // Create comprehensive report data
      const reportData = {
        projectInfo: {
          name: currentProject?.name || 'Unnamed Project',
          id: projectId,
          generatedAt: new Date().toISOString()
        },
        summary: budgetSummary,
        taskMetrics: calculateTaskMetrics(),
        categoryReport: getCategoryWiseReport(),
        tasks: projectTasks
      };

      // Convert to CSV format
      const csvContent = generateCSVReport(reportData);
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentProject?.name || 'Project'}_Quantity_Progress_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Quantity-based report exported successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        status: 'error',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Generate CSV with quantity-based progress
  const generateCSVReport = (data) => {
    let csv = `Project Manpower Budget Report (Quantity-Based)\n`;
    csv += `Project: ${data.projectInfo.name}\n`;
    csv += `Generated: ${new Date(data.projectInfo.generatedAt).toLocaleString()}\n\n`;
    
    csv += `SUMMARY\n`;
    csv += `Total Categories,${data.summary?.totalCategories || 0}\n`;
    csv += `Total Tasks,${data.summary?.totalTasks || 0}\n`;
    csv += `Total Budgeted Manhours,${data.summary?.totalBudgetedManhours || 0}\n`;
    csv += `Total Consumed Manhours,${data.summary?.totalConsumedManhours || 0}\n`;
    csv += `Progress Percentage (Quantity-Based),${data.summary?.progressPercentage || 0}%\n\n`;

    csv += `TASK DETAILS (QUANTITY-BASED PROGRESS)\n`;
    csv += `Task,Category,Total Quantity,Installed Quantity,Unit,Quantity Progress %,Budgeted Hours,Consumed Hours,CPI,Status\n`;
    
    data.tasks.forEach(task => {
      // ✅ QUANTITY-BASED progress for CSV export
      const quantityProgress = task.quantity > 0 
        ? (((task.totalInstalledQuantity || 0) / task.quantity) * 100).toFixed(1) 
        : 0;
      
      const status = quantityProgress >= 100 ? 'Complete' : quantityProgress > 0 ? 'In Progress' : 'Not Started';
      
      // Calculate CPI using quantity-based earned value
      const plannedManhours = task.totalBudgetedManhours || 0;
      const actualManhours = task.totalConsumedManhours || 0;
      const earnedValue = plannedManhours * (Math.min(quantityProgress, 100) / 100);
      const cpi = actualManhours > 0 ? (earnedValue / actualManhours).toFixed(2) : 'N/A';
      
      csv += `"${task.masterSubTask?.name || 'Unknown'}",`;
      csv += `"${task.categoryName || 'Unknown'}",`;
      csv += `${task.quantity || 0},`;
      csv += `${task.totalInstalledQuantity || 0},`;
      csv += `"${task.unit || 'No'}",`;
      csv += `${quantityProgress}%,`;
      csv += `${task.totalBudgetedManhours || 0},`;
      csv += `${task.totalConsumedManhours || 0},`;
      csv += `${cpi},`;
      csv += `"${status}"\n`;
    });

    return csv;
  };

  const taskMetrics = calculateTaskMetrics();
  const categoryReport = getCategoryWiseReport();

  if (!projectTasks || projectTasks.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text>No data available for reports</Text>
          <Text fontSize="sm">
            Configure task quantities and record progress to generate reports.
          </Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* ✅ UPDATED: Header Controls with quantity-based terminology */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="white">
                Reports & Analytics
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Quantity-based project performance insights
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <FormControl maxW="200px">
                <FormLabel color="gray.300" fontSize="sm" mb={1}>
                  Report Type
                </FormLabel>
                <Select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  <option value="overview">Project Overview</option>
                  <option value="detailed">Detailed Analysis</option>
                  <option value="progress">Quantity Progress</option>
                </Select>
              </FormControl>

              <Button
                leftIcon={<FiDownload />}
                colorScheme="blue"
                onClick={handleExportReport}
                isLoading={loading}
              >
                Export CSV
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        <Card bg="gray.800" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Quantity Progress</StatLabel>
              <StatNumber color="white">
                {budgetSummary?.progressPercentage || 0}%
              </StatNumber>
              <Progress 
                value={budgetSummary?.progressPercentage || 0} 
                colorScheme="blue" 
                size="sm" 
                mt={2}
              />
              <StatHelpText color="gray.400">
                Based on installed quantities
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Tasks</StatLabel>
              <StatNumber color="white">{taskMetrics?.total || 0}</StatNumber>
              <StatHelpText color="gray.400">
                {taskMetrics?.completed || 0} completed by quantity
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Budget Efficiency</StatLabel>
              <StatNumber color="white">
                {budgetSummary?.efficiencyPercentage || 0}%
              </StatNumber>
              <StatHelpText color={
                (budgetSummary?.efficiencyPercentage || 0) > 100 ? "red.400" : "green.400"
              }>
                Quantity-based CPI
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="gray.800" borderColor="gray.700">
          <CardBody>
            <Stat>
              <StatLabel color="gray.400">Total Manhours</StatLabel>
              <StatNumber color="white">
                {formatNumber(budgetSummary?.totalConsumedManhours || 0)}
              </StatNumber>
              <StatHelpText color="gray.400">
                of {formatNumber(budgetSummary?.totalBudgetedManhours || 0)} budgeted
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* ✅ UPDATED: Category-wise Performance with quantity-based metrics */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <Heading size="sm" color="white">Category Performance (Quantity-Based)</Heading>
        </CardHeader>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Category</Th>
                  <Th color="gray.400" isNumeric>Tasks</Th>
                  <Th color="gray.400" isNumeric>Total Qty</Th>
                  <Th color="gray.400" isNumeric>Installed Qty</Th>
                  <Th color="gray.400" isNumeric>Qty Progress %</Th>
                  <Th color="gray.400" isNumeric>CPI</Th>
                  <Th color="gray.400">Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(categoryReport).map(([categoryName, data]) => {
                  const getStatusColor = (status) => {
                    switch (status) {
                      case 'Over Budget': return 'red';
                      case 'On Track': return 'yellow';
                      case 'Under Budget': return 'green';
                      default: return 'gray';
                    }
                  };

                  return (
                    <Tr key={categoryName}>
                      <Td color="white" fontWeight="medium">{categoryName}</Td>
                      <Td color="white" isNumeric>{data.taskCount}</Td>
                      <Td color="white" isNumeric>{formatNumber(data.totalQuantity)}</Td>
                      <Td color="white" isNumeric>{formatNumber(data.totalInstalledQuantity)}</Td>
                      <Td isNumeric>
                        <Badge colorScheme={data.quantityProgress >= 80 ? "green" : data.quantityProgress >= 50 ? "yellow" : "red"}>
                          {data.quantityProgress.toFixed(1)}%
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Badge colorScheme={getStatusColor(data.status)}>
                          {data.cpi.toFixed(2)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(data.status)}
                          variant="subtle"
                        >
                          {data.status}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* ✅ UPDATED: Task Status Distribution with quantity-based categorization */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <Heading size="sm" color="white">Task Status Distribution (Quantity-Based)</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={4}>
            <Box textAlign="center">
              <Text color="green.400" fontSize="2xl" fontWeight="bold">
                {taskMetrics?.completed || 0}
              </Text>
              <Text color="gray.400" fontSize="sm">Fully Installed</Text>
            </Box>
            <Box textAlign="center">
              <Text color="yellow.400" fontSize="2xl" fontWeight="bold">
                {taskMetrics?.inProgress || 0}
              </Text>
              <Text color="gray.400" fontSize="sm">Partially Installed</Text>
            </Box>
            <Box textAlign="center">
              <Text color="gray.400" fontSize="2xl" fontWeight="bold">
                {taskMetrics?.notStarted || 0}
              </Text>
              <Text color="gray.400" fontSize="sm">Not Started</Text>
            </Box>
            <Box textAlign="center">
              <Text color="red.400" fontSize="2xl" fontWeight="bold">
                {taskMetrics?.overBudget || 0}
              </Text>
              <Text color="gray.400" fontSize="sm">Over Budget (CPI)</Text>
            </Box>
          </Grid>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ReportsAndAnalytics;
