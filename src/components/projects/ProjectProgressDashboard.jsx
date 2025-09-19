import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Flex,
  Progress,
  Divider
} from '@chakra-ui/react';
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiClock, 
  FiTarget,
  FiActivity,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import WeeklyProgressForm from './WeeklyProgressForm';
import MonthlyProgressReport from './MonthlyProgressReport';
import { progressReportAPI, analyticsAPI } from '../../services/api';

const ProjectProgressDashboard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch dashboard overview data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await progressReportAPI.getProjectDashboard(projectId);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        status: 'error',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDashboardData();
    }
  }, [projectId, refreshKey]);

  const handleProgressSaved = () => {
    setRefreshKey(prev => prev + 1); // Refresh reports
    toast({
      title: 'Success',
      description: 'Progress updated successfully',
      status: 'success',
      duration: 3000
    });
  };

  const handleExportData = async () => {
    try {
      const blob = await progressReportAPI.exportProgressReport(projectId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dashboardData?.projectName || 'project'}-progress-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Progress report exported successfully',
        status: 'success',
        duration: 3000
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export progress report',
        status: 'error',
        duration: 4000
      });
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'green';
    if (percentage >= 80) return 'yellow';
    if (percentage >= 60) return 'blue';
    return 'red';
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} justify="center" h="400px">
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.400">Loading project progress dashboard...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="white">Project Progress Management</Heading>
            <HStack spacing={2}>
              <Text color="gray.400" fontSize="lg">
                {dashboardData?.projectName || 'Loading...'}
              </Text>
              <Badge colorScheme="blue" variant="subtle">
                {dashboardData?.totalTasks || 0} Tasks
              </Badge>
            </HStack>
          </VStack>
          
          <HStack spacing={3}>
            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={() => setRefreshKey(prev => prev + 1)}
              size="sm"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="green"
              onClick={handleExportData}
              size="sm"
            >
              Export Report
            </Button>
          </HStack>
        </Flex>

        {/* Dashboard Overview Cards */}
        {dashboardData && (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={4}>
            
            {/* Overall Progress */}
            <Card bg="gray.800" borderColor="gray.700">
              <CardHeader pb={2}>
                <HStack>
                  <Box p={2} bg="blue.100" borderRadius="md">
                    <FiTarget color="blue.500" size="20" />
                  </Box>
                  <Text color="white" fontWeight="semibold">Overall Progress</Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Stat>
                  <StatNumber color="white" fontSize="2xl">
                    {(dashboardData.overallProgress || 0).toFixed(1)}%
                  </StatNumber>
                  <Progress 
                    value={dashboardData.overallProgress || 0} 
                    colorScheme={getProgressColor(dashboardData.overallProgress || 0)}
                    size="sm" 
                    mt={2}
                    bg="gray.700"
                  />
                  <StatHelpText color="gray.400" mt={1}>
                    {dashboardData.completedTasks || 0} of {dashboardData.totalTasks || 0} tasks completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Budget Efficiency */}
            <Card bg="gray.800" borderColor="gray.700">
              <CardHeader pb={2}>
                <HStack>
                  <Box p={2} bg="green.100" borderRadius="md">
                    <FiActivity color="green.500" size="20" />
                  </Box>
                  <Text color="white" fontWeight="semibold">Budget Efficiency</Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Stat>
                  <StatNumber color="white" fontSize="2xl">
                    {(dashboardData.budgetEfficiency || 0).toFixed(1)}%
                  </StatNumber>
                  <StatHelpText color={dashboardData.budgetEfficiency >= 100 ? "red.400" : "green.400"}>
                    {dashboardData.budgetEfficiency >= 100 ? 'Over Budget' : 'Within Budget'}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Total Manhours */}
            <Card bg="gray.800" borderColor="gray.700">
              <CardHeader pb={2}>
                <HStack>
                  <Box p={2} bg="purple.100" borderRadius="md">
                    <FiClock color="purple.500" size="20" />
                  </Box>
                  <Text color="white" fontWeight="semibold">Total Manhours</Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Stat>
                  <StatNumber color="white" fontSize="2xl">
                    {(dashboardData.totalConsumedManhours || 0).toLocaleString()}
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    of {(dashboardData.totalBudgetedManhours || 0).toLocaleString()} budgeted
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            {/* Monthly Trend */}
            <Card bg="gray.800" borderColor="gray.700">
              <CardHeader pb={2}>
                <HStack>
                  <Box p={2} bg="orange.100" borderRadius="md">
                    <FiTrendingUp color="orange.500" size="20" />
                  </Box>
                  <Text color="white" fontWeight="semibold">This Month</Text>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <Stat>
                  <StatNumber color="white" fontSize="2xl">
                    {(dashboardData.monthlyProgress || 0).toFixed(1)}%
                  </StatNumber>
                  <StatHelpText color={dashboardData.monthlyTrend >= 0 ? "green.400" : "red.400"}>
                    {dashboardData.monthlyTrend >= 0 ? '+' : ''}{dashboardData.monthlyTrend || 0}% from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        <Divider borderColor="gray.600" />
        
        {/* Main Tabs */}
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={selectedTab} 
          onChange={setSelectedTab}
          bg="gray.900"
          borderRadius="md"
        >
          <TabList bg="gray.800" borderColor="gray.700">
            <Tab 
              color="gray.300" 
              _selected={{ color: "white", bg: "blue.600" }}
              leftIcon={<FiBarChart2 />}
            >
              Weekly Progress Entry
            </Tab>
            <Tab 
              color="gray.300" 
              _selected={{ color: "white", bg: "blue.600" }}
              leftIcon={<FiTarget />}
            >
              Monthly Progress Report
            </Tab>
            <Tab 
              color="gray.300" 
              _selected={{ color: "white", bg: "blue.600" }}
              leftIcon={<FiClock />}
            >
              Task Progress History
            </Tab>
            <Tab 
              color="gray.300" 
              _selected={{ color: "white", bg: "blue.600" }}
              leftIcon={<FiTrendingUp />}
            >
              Variance Analysis
            </Tab>
          </TabList>

          <TabPanels bg="gray.800">
            
            {/* Weekly Progress Entry Tab */}
            <TabPanel>
              <Alert status="info" mb={4} bg="blue.900" borderColor="blue.700">
                <AlertIcon color="blue.300" />
                <VStack align="start" spacing={1}>
                  <Text color="blue.100" fontWeight="semibold">
                    Weekly Progress Entry
                  </Text>
                  <Text color="blue.200" fontSize="sm">
                    Use the Progress Tracking tab in the main project view for comprehensive weekly progress entry.
                  </Text>
                </VStack>
              </Alert>
              
              <Card bg="gray.700" borderColor="gray.600">
                <CardBody>
                  <VStack spacing={4}>
                    <Text color="gray.300" textAlign="center">
                      Weekly progress entry is handled through the main project interface.
                    </Text>
                    <Button
                      colorScheme="blue"
                      onClick={() => navigate(`/dashboard/company/projects/${projectId}`)}
                    >
                      Go to Project Details
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Monthly Progress Report Tab */}
            <TabPanel px={0}>
              <MonthlyProgressReport 
                projectId={projectId}
                key={refreshKey}
              />
            </TabPanel>

            {/* Task Progress History Tab */}
            <TabPanel>
              <Card bg="gray.700" borderColor="gray.600">
                <CardHeader>
                  <Heading size="md" color="white">Task Progress History</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Box p={8} textAlign="center">
                      <FiClock size={48} color="gray.400" />
                      <Text color="gray.300" mt={4}>
                        Task Progress History
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Detailed historical progress tracking coming soon
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Variance Analysis Tab */}
            <TabPanel>
              <Card bg="gray.700" borderColor="gray.600">
                <CardHeader>
                  <Heading size="md" color="white">Variance Analysis</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Box p={8} textAlign="center">
                      <FiTrendingUp size={48} color="gray.400" />
                      <Text color="gray.300" mt={4}>
                        Variance Analysis
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        Advanced analytics and variance reporting coming soon
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default ProjectProgressDashboard;
