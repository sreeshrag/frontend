import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  VStack,
  Select,
  Card,
  CardBody,
  CardHeader,
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
  StatArrow,
  Progress,
  Badge,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiTrendingUp, 
  FiTarget,
  FiActivity,
  FiClock
} from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useProgress } from '../../contexts/ProgressContext';
import { formatNumber } from '../../utils/formatters';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProgressTracking = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProject, fetchProject } = useProject();
  const {
    productivityAnalysis,
    projectSummary,
    loading,
    error,
    fetchProductivityAnalysis,
    fetchProjectSummary
  } = useProgress();

  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      loadAnalytics();
    }
  }, [projectId, selectedPeriod, dateRange]);

  const loadAnalytics = () => {
    fetchProductivityAnalysis(projectId, { 
      period: selectedPeriod,
      ...dateRange 
    });
    fetchProjectSummary(projectId, dateRange);
  };

  const getChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#CBD5E0'
        }
      },
      title: {
        display: true,
        text: title,
        color: '#E2E8F0'
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#A0AEC0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.2)'
        }
      },
      y: {
        ticks: {
          color: '#A0AEC0'
        },
        grid: {
          color: 'rgba(160, 174, 192, 0.2)'
        }
      }
    }
  });

  const productivityChartData = {
    labels: productivityAnalysis?.trends?.map(t => t.period) || [],
    datasets: [
      {
        label: 'Productivity (hrs/manhour)',
        data: productivityAnalysis?.trends?.map(t => t.avgProductivity) || [],
        borderColor: 'rgb(66, 153, 225)',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  const efficiencyChartData = {
    labels: productivityAnalysis?.trends?.map(t => t.period) || [],
    datasets: [
      {
        label: 'Targeted',
        data: productivityAnalysis?.trends?.map(t => t.totalTargeted) || [],
        backgroundColor: 'rgba(72, 187, 120, 0.8)',
      },
      {
        label: 'Achieved',
        data: productivityAnalysis?.trends?.map(t => t.totalAchieved) || [],
        backgroundColor: 'rgba(66, 153, 225, 0.8)',
      },
      {
        label: 'Consumed',
        data: productivityAnalysis?.trends?.map(t => t.totalConsumed) || [],
        backgroundColor: 'rgba(245, 101, 101, 0.8)',
      }
    ]
  };

  const categoryDistributionData = {
    labels: projectSummary?.categorySummary?.map(c => c.name) || [],
    datasets: [
      {
        data: projectSummary?.categorySummary?.map(c => c.totalBudgeted) || [],
        backgroundColor: [
          'rgba(66, 153, 225, 0.8)',
          'rgba(72, 187, 120, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(236, 201, 75, 0.8)',
          'rgba(159, 122, 234, 0.8)',
          'rgba(237, 137, 54, 0.8)',
        ],
        borderColor: [
          'rgb(66, 153, 225)',
          'rgb(72, 187, 120)',
          'rgb(245, 101, 101)',
          'rgb(236, 201, 75)',
          'rgb(159, 122, 234)',
          'rgb(237, 137, 54)',
        ],
        borderWidth: 2,
      },
    ],
  };

  if (loading && !productivityAnalysis) {
    return (
      <Container maxW="7xl" py={8}>
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={4}>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="outline"
              onClick={() => navigate(`/dashboard/company/projects/${projectId}`)}
            >
              Back to Project
            </Button>
            <VStack align="start" spacing={0}>
              <Heading size="lg">Progress Tracking</Heading>
              <Text color="gray.500">
                {currentProject?.name || 'Project Analytics'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              size="sm"
              w="120px"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </Select>

            <Button
              leftIcon={<FiCalendar />}
              onClick={() => navigate(`/dashboard/company/projects/${projectId}/monthly`)}
            >
              Monthly View
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Summary Statistics */}
        {projectSummary && (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiTarget /> Total Budgeted
                  </StatLabel>
                  <StatNumber color="white">
                    {formatNumber(projectSummary.statistics.totalBudgetedManhours)} hrs
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    Project allocation
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiActivity /> Total Consumed
                  </StatLabel>
                  <StatNumber color="white">
                    {formatNumber(projectSummary.statistics.totalConsumedManhours)} hrs
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    <StatArrow type={projectSummary.statistics.progressPercentage >= 50 ? "increase" : "decrease"} />
                    {projectSummary.statistics.progressPercentage}% complete
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiClock /> Remaining
                  </StatLabel>
                  <StatNumber color="white">
                    {formatNumber(projectSummary.statistics.totalRemainingManhours)} hrs
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    Work remaining
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300">Overall Efficiency</StatLabel>
                  <StatNumber color="white">
                    {projectSummary.statistics.efficiencyPercentage}%
                  </StatNumber>
                  <StatHelpText color="gray.400">
                    <StatArrow type={projectSummary.statistics.efficiencyPercentage >= 100 ? "increase" : "decrease"} />
                    Performance metric
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        {/* Charts and Analytics */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList bg="gray.800" borderColor="gray.700">
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'blue.600' }}>
              Productivity Trends
            </Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'blue.600' }}>
              Progress Analysis
            </Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'blue.600' }}>
              Category Distribution
            </Tab>
            <Tab color="gray.300" _selected={{ color: 'white', bg: 'blue.600' }}>
              Insights
            </Tab>
          </TabList>

          <TabPanels>
            {/* Productivity Trends */}
            <TabPanel>
              <Card bg="gray.800" borderColor="gray.700">
                <CardHeader>
                  <Heading size="md" color="white">Productivity Over Time</Heading>
                </CardHeader>
                <CardBody>
                  <Box h="400px">
                    {productivityAnalysis?.trends?.length > 0 ? (
                      <Line 
                        data={productivityChartData} 
                        options={getChartOptions('Productivity Trends')}
                      />
                    ) : (
                      <Flex align="center" justify="center" h="100%">
                        <Text color="gray.400">No productivity data available</Text>
                      </Flex>
                    )}
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Progress Analysis */}
            <TabPanel>
              <Card bg="gray.800" borderColor="gray.700">
                <CardHeader>
                  <Heading size="md" color="white">Progress vs Targets</Heading>
                </CardHeader>
                <CardBody>
                  <Box h="400px">
                    {productivityAnalysis?.trends?.length > 0 ? (
                      <Bar 
                        data={efficiencyChartData} 
                        options={getChartOptions('Progress Analysis')}
                      />
                    ) : (
                      <Flex align="center" justify="center" h="100%">
                        <Text color="gray.400">No progress data available</Text>
                      </Flex>
                    )}
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Category Distribution */}
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
                <Card bg="gray.800" borderColor="gray.700">
                  <CardHeader>
                    <Heading size="md" color="white">Work Distribution by Category</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="300px">
                      {projectSummary?.categorySummary?.length > 0 ? (
                        <Doughnut 
                          data={categoryDistributionData}
                          options={{
                            ...getChartOptions('Category Distribution'),
                            maintainAspectRatio: false
                          }}
                        />
                      ) : (
                        <Flex align="center" justify="center" h="100%">
                          <Text color="gray.400">No category data available</Text>
                        </Flex>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                <Card bg="gray.800" borderColor="gray.700">
                  <CardHeader>
                    <Heading size="md" color="white">Category Details</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={3} align="stretch">
                      {projectSummary?.categorySummary?.map((category, index) => (
                        <Box key={index} p={3} bg="gray.700" borderRadius="md">
                          <HStack justify="space-between" mb={2}>
                            <Text fontWeight="medium" color="white">
                              {category.name}
                            </Text>
                            <Badge colorScheme="blue">
                              {formatNumber(category.totalBudgeted)} hrs
                            </Badge>
                          </HStack>
                          <Progress 
                            value={50} // Calculate based on progress data
                            colorScheme="blue" 
                            size="sm"
                            borderRadius="full"
                          />
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Insights */}
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
                {productivityAnalysis?.insights && (
                  <>
                    <Card bg="gray.800" borderColor="gray.700">
                      <CardHeader>
                        <Heading size="md" color="white">Performance Insights</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={4} align="stretch">
                          <Box>
                            <Text color="gray.300" fontSize="sm">Average Productivity</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                              {productivityAnalysis.insights.averageProductivity}
                            </Text>
                          </Box>
                          
                          <Box>
                            <Text color="gray.300" fontSize="sm">Improving Periods</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="green.400">
                              {productivityAnalysis.insights.improvingPeriods}
                            </Text>
                          </Box>
                          
                          <Box>
                            <Text color="gray.300" fontSize="sm">Declining Periods</Text>
                            <Text fontSize="2xl" fontWeight="bold" color="red.400">
                              {productivityAnalysis.insights.decliningPeriods}
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>

                    {productivityAnalysis.insights.bestPeriod && (
                      <Card bg="gray.800" borderColor="gray.700">
                        <CardHeader>
                          <Heading size="md" color="white">Best Performance Period</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <Text color="gray.300">Period:</Text>
                            <Text fontSize="lg" fontWeight="bold" color="white">
                              {productivityAnalysis.insights.bestPeriod.period}
                            </Text>
                            
                            <Text color="gray.300">Productivity:</Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.400">
                              {productivityAnalysis.insights.bestPeriod.avgProductivity}
                            </Text>
                            
                            <Text color="gray.300">Efficiency Ratio:</Text>
                            <Text fontSize="lg" fontWeight="bold" color="blue.400">
                              {productivityAnalysis.insights.bestPeriod.efficiencyRatio}
                            </Text>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </>
                )}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default ProgressTracking;
