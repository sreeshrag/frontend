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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiFilter,
  FiCalendar,
  FiTrendingUp,
  FiPieChart,
  FiBarChart
} from 'react-icons/fi';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
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
  RadialLinearScale,
} from 'chart.js';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useProgress } from '../../contexts/ProgressContext';
import { formatNumber, formatDate, formatPercentage } from '../../utils/formatters';

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
  ArcElement,
  RadialLinearScale
);

const ProjectReports = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProject, fetchProject } = useProject();
  const {
    projectSummary,
    productivityAnalysis,
    loading,
    error,
    fetchProjectSummary,
    fetchProductivityAnalysis
  } = useProgress();

  const [reportFilters, setReportFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    period: 'monthly',
    categories: 'all'
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      loadReports();
    }
  }, [projectId, reportFilters]);

  const loadReports = () => {
    fetchProjectSummary(projectId, {
      startDate: reportFilters.startDate,
      endDate: reportFilters.endDate
    });
    fetchProductivityAnalysis(projectId, {
      period: reportFilters.period,
      startDate: reportFilters.startDate,
      endDate: reportFilters.endDate
    });
  };

  const handleFilterChange = (key, value) => {
    setReportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const reportData = {
        project: currentProject,
        summary: projectSummary,
        productivity: productivityAnalysis,
        filters: reportFilters,
        generatedAt: new Date().toISOString()
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(reportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.name}-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // For PDF export, you'd typically send this to a backend service
        console.log('PDF export would be handled by backend service');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          color: '#E2E8F0'
        }
      },
    },
    scales: {
      x: {
        ticks: { color: '#A0AEC0' },
        grid: { color: 'rgba(160, 174, 192, 0.2)' }
      },
      y: {
        ticks: { color: '#A0AEC0' },
        grid: { color: 'rgba(160, 174, 192, 0.2)' }
      }
    }
  };

  const progressOverTimeData = {
    labels: productivityAnalysis?.trends?.map(t => t.period) || [],
    datasets: [
      {
        label: 'Targeted Hours',
        data: productivityAnalysis?.trends?.map(t => t.totalTargeted) || [],
        borderColor: 'rgb(72, 187, 120)',
        backgroundColor: 'rgba(72, 187, 120, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Achieved Hours',
        data: productivityAnalysis?.trends?.map(t => t.totalAchieved) || [],
        borderColor: 'rgb(66, 153, 225)',
        backgroundColor: 'rgba(66, 153, 225, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Consumed Hours',
        data: productivityAnalysis?.trends?.map(t => t.totalConsumed) || [],
        borderColor: 'rgb(245, 101, 101)',
        backgroundColor: 'rgba(245, 101, 101, 0.1)',
        tension: 0.3,
        fill: true
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
          'rgba(56, 178, 172, 0.8)',
          'rgba(246, 133, 95, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#2D3748'
      }
    ]
  };

  const efficiencyRadarData = {
    labels: projectSummary?.categorySummary?.map(c => c.name) || [],
    datasets: [
      {
        label: 'Efficiency %',
        data: projectSummary?.categorySummary?.map(c => {
          const budgeted = c.totalBudgeted || 0;
          const consumed = c.totalConsumed || 0;
          return consumed > 0 ? ((budgeted / consumed) * 100) : 0;
        }) || [],
        backgroundColor: 'rgba(66, 153, 225, 0.2)',
        borderColor: 'rgb(66, 153, 225)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(66, 153, 225)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(66, 153, 225)'
      }
    ]
  };

  if (loading && !projectSummary) {
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
              <Heading size="lg">Project Reports</Heading>
              <Text color="gray.500">
                {currentProject?.name || 'Project Analytics & Reports'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              onClick={() => exportReport('json')}
            >
              Export JSON
            </Button>
            <Button
              leftIcon={<FiDownload />}
              colorScheme="blue"
              onClick={() => exportReport('pdf')}
            >
              Export PDF
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Report Filters */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader>
            <HStack>
              <FiFilter />
              <Heading size="md">Report Filters</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <Box>
                <Text fontSize="sm" mb={2}>Start Date</Text>
                <Input
                  type="date"
                  value={reportFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  size="sm"
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" mb={2}>End Date</Text>
                <Input
                  type="date"
                  value={reportFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  size="sm"
                />
              </Box>
              
              <Box>
                <Text fontSize="sm" mb={2}>Period</Text>
                <Select
                  value={reportFilters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  size="sm"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Box>
              
              <Box>
                <Text fontSize="sm" mb={2}>Categories</Text>
                <Select
                  value={reportFilters.categories}
                  onChange={(e) => handleFilterChange('categories', e.target.value)}
                  size="sm"
                >
                  <option value="all">All Categories</option>
                  {currentProject?.categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </Box>
            </Grid>
          </CardBody>
        </Card>

        {/* Reports Content */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList bg={bgColor} borderColor={borderColor}>
            <Tab>
              <HStack>
                <FiTrendingUp />
                <Text>Progress Analysis</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiPieChart />
                <Text>Distribution Reports</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiBarChart />
                <Text>Performance Metrics</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FiCalendar />
                <Text>Summary Tables</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Progress Analysis */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Progress Over Time</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="400px">
                      {productivityAnalysis?.trends?.length > 0 ? (
                        <Line data={progressOverTimeData} options={chartOptions} />
                      ) : (
                        <Flex align="center" justify="center" h="100%">
                          <Text color="gray.500">No progress data available for the selected period</Text>
                        </Flex>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Summary Statistics */}
                {projectSummary && (
                  <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
                    <Card bg={bgColor} borderColor={borderColor}>
                      <CardBody textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                          {formatPercentage(projectSummary.statistics.progressPercentage)}
                        </Text>
                        <Text color="gray.500">Overall Progress</Text>
                      </CardBody>
                    </Card>
                    
                    <Card bg={bgColor} borderColor={borderColor}>
                      <CardBody textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="green.500">
                          {formatPercentage(projectSummary.statistics.efficiencyPercentage)}
                        </Text>
                        <Text color="gray.500">Efficiency Rate</Text>
                      </CardBody>
                    </Card>
                    
                    <Card bg={bgColor} borderColor={borderColor}>
                      <CardBody textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                          {formatNumber(projectSummary.statistics.totalRemainingManhours)}
                        </Text>
                        <Text color="gray.500">Remaining Hours</Text>
                      </CardBody>
                    </Card>
                    
                    <Card bg={bgColor} borderColor={borderColor}>
                      <CardBody textAlign="center">
                        <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                          {formatNumber(projectSummary.statistics.totalLapsedManhours)}
                        </Text>
                        <Text color="gray.500">Lapsed Hours</Text>
                      </CardBody>
                    </Card>
                  </Grid>
                )}
              </VStack>
            </TabPanel>

            {/* Distribution Reports */}
            <TabPanel>
              <Grid templateColumns="repeat(auto-fit, minmax(400px, 1fr))" gap={6}>
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Category Distribution</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="350px">
                      {projectSummary?.categorySummary?.length > 0 ? (
                        <Pie data={categoryDistributionData} options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'right',
                              labels: {
                                usePointStyle: true,
                                color: '#E2E8F0'
                              }
                            }
                          }
                        }} />
                      ) : (
                        <Flex align="center" justify="center" h="100%">
                          <Text color="gray.500">No category data available</Text>
                        </Flex>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Efficiency by Category</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="350px">
                      {projectSummary?.categorySummary?.length > 0 ? (
                        <Radar data={efficiencyRadarData} options={{
                          ...chartOptions,
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              angleLines: { color: 'rgba(160, 174, 192, 0.2)' },
                              grid: { color: 'rgba(160, 174, 192, 0.2)' },
                              pointLabels: { color: '#A0AEC0' },
                              ticks: { color: '#A0AEC0' }
                            }
                          }
                        }} />
                      ) : (
                        <Flex align="center" justify="center" h="100%">
                          <Text color="gray.500">No efficiency data available</Text>
                        </Flex>
                      )}
                    </Box>
                  </CardBody>
                </Card>
              </Grid>
            </TabPanel>

            {/* Performance Metrics */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Productivity Trends</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box h="400px">
                      {productivityAnalysis?.trends?.length > 0 ? (
                        <Bar
                          data={{
                            labels: productivityAnalysis.trends.map(t => t.period),
                            datasets: [
                              {
                                label: 'Average Productivity',
                                data: productivityAnalysis.trends.map(t => t.avgProductivity),
                                backgroundColor: 'rgba(66, 153, 225, 0.8)',
                                borderColor: 'rgb(66, 153, 225)',
                                borderWidth: 1
                              },
                              {
                                label: 'Efficiency Ratio',
                                data: productivityAnalysis.trends.map(t => t.efficiencyRatio),
                                backgroundColor: 'rgba(72, 187, 120, 0.8)',
                                borderColor: 'rgb(72, 187, 120)',
                                borderWidth: 1
                              }
                            ]
                          }}
                          options={chartOptions}
                        />
                      ) : (
                        <Flex align="center" justify="center" h="100%">
                          <Text color="gray.500">No productivity data available</Text>
                        </Flex>
                      )}
                    </Box>
                  </CardBody>
                </Card>

                {/* Performance Insights */}
                {productivityAnalysis?.insights && (
                  <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
                    <Card bg={bgColor} borderColor={borderColor}>
                      <CardHeader>
                        <Heading size="sm">Performance Insights</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between">
                            <Text>Average Productivity</Text>
                            <Badge colorScheme="blue">
                              {productivityAnalysis.insights.averageProductivity}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Improving Periods</Text>
                            <Badge colorScheme="green">
                              {productivityAnalysis.insights.improvingPeriods}
                            </Badge>
                          </HStack>
                          <HStack justify="space-between">
                            <Text>Declining Periods</Text>
                            <Badge colorScheme="red">
                              {productivityAnalysis.insights.decliningPeriods}
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    {productivityAnalysis.insights.bestPeriod && (
                      <Card bg={bgColor} borderColor={borderColor}>
                        <CardHeader>
                          <Heading size="sm">Best Performance Period</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="start">
                            <Text fontWeight="bold">
                              {productivityAnalysis.insights.bestPeriod.period}
                            </Text>
                            <HStack justify="space-between" w="full">
                              <Text>Productivity</Text>
                              <Badge colorScheme="green">
                                {productivityAnalysis.insights.bestPeriod.avgProductivity}
                              </Badge>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text>Efficiency</Text>
                              <Badge colorScheme="blue">
                                {productivityAnalysis.insights.bestPeriod.efficiencyRatio}
                              </Badge>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    )}
                  </Grid>
                )}
              </VStack>
            </TabPanel>

            {/* Summary Tables */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                {/* Category Summary Table */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardHeader>
                    <Heading size="md">Category Summary Report</Heading>
                  </CardHeader>
                  <CardBody>
                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Category</Th>
                            <Th isNumeric>Budgeted Hours</Th>
                            <Th isNumeric>Consumed Hours</Th>
                            <Th isNumeric>Remaining Hours</Th>
                            <Th isNumeric>Progress %</Th>
                            <Th isNumeric>Efficiency %</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {projectSummary?.categorySummary?.map((category, index) => {
                            const budgeted = category.totalBudgeted || 0;
                            const consumed = category.totalConsumed || 0;
                            const remaining = budgeted - consumed;
                            const progress = budgeted > 0 ? (consumed / budgeted) * 100 : 0;
                            const efficiency = consumed > 0 ? (budgeted / consumed) * 100 : 0;
                            
                            return (
                              <Tr key={index}>
                                <Td fontWeight="medium">{category.name}</Td>
                                <Td isNumeric>{formatNumber(budgeted)}</Td>
                                <Td isNumeric>{formatNumber(consumed)}</Td>
                                <Td isNumeric>{formatNumber(remaining)}</Td>
                                <Td isNumeric>{formatPercentage(progress)}</Td>
                                <Td isNumeric>{formatPercentage(efficiency)}</Td>
                                <Td>
                                  <Badge 
                                    colorScheme={
                                      progress >= 100 ? 'green' :
                                      progress >= 50 ? 'blue' :
                                      progress >= 25 ? 'yellow' : 'red'
                                    }
                                  >
                                    {progress >= 100 ? 'Complete' :
                                     progress >= 50 ? 'In Progress' :
                                     progress >= 25 ? 'Started' : 'Not Started'}
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

                {/* Time Period Summary */}
                {productivityAnalysis?.trends?.length > 0 && (
                  <Card bg={bgColor} borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Time Period Analysis</Heading>
                    </CardHeader>
                    <CardBody>
                      <Box overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Period</Th>
                              <Th isNumeric>Targeted</Th>
                              <Th isNumeric>Achieved</Th>
                              <Th isNumeric>Consumed</Th>
                              <Th isNumeric>Productivity</Th>
                              <Th isNumeric>Efficiency</Th>
                              <Th>Trend</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {productivityAnalysis.trends.map((trend, index) => (
                              <Tr key={index}>
                                <Td fontWeight="medium">{trend.period}</Td>
                                <Td isNumeric>{formatNumber(trend.totalTargeted)}</Td>
                                <Td isNumeric>{formatNumber(trend.totalAchieved)}</Td>
                                <Td isNumeric>{formatNumber(trend.totalConsumed)}</Td>
                                <Td isNumeric>{trend.avgProductivity}</Td>
                                <Td isNumeric>{trend.efficiencyRatio}</Td>
                                <Td>
                                  <Badge 
                                    colorScheme={
                                      trend.trend === 'improving' ? 'green' :
                                      trend.trend === 'declining' ? 'red' : 'blue'
                                    }
                                  >
                                    {trend.trend}
                                  </Badge>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </CardBody>
                  </Card>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default ProjectReports;
