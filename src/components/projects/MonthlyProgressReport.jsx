import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  IconButton,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Divider,
  Flex,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { EditIcon, LockIcon, UnlockIcon, DownloadIcon, ViewIcon, CalendarIcon } from '@chakra-ui/icons';
import WeeklyProgressForm from './WeeklyProgressForm';

const MonthlyProgressReport = ({ projectId }) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProgress, setSelectedProgress] = useState(null);
  
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().slice(0, 7), // YYYY-MM format
    endDate: new Date().toISOString().slice(0, 7)
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: filters.startDate + '-01',
        endDate: new Date(filters.endDate + '-01').toISOString().split('T')[0]
      });
      
      const response = await fetch(`/api/projects/${projectId}/progress-report?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setReportData(result.data);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to fetch progress report',
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch progress report',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchReport();
    }
  }, [projectId, filters]);

  const handleEditProgress = (task, monthKey) => {
    setSelectedTask(task);
    setSelectedProgress(task.monthlyProgress[monthKey] || null);
    onOpen();
  };

  const handleProgressSaved = () => {
    onClose();
    fetchReport(); // Refresh the report
  };

  const exportToExcel = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export-progress-report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        params: filters,
        responseType: 'blob'
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress-report-${reportData.projectName}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  const getVarianceBadgeColor = (variance) => {
    if (Math.abs(variance) < 0.1) return 'gray';
    return variance >= 0 ? 'green' : 'red';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'green';
    if (percentage >= 80) return 'yellow';
    if (percentage >= 50) return 'blue';
    return 'red';
  };

  if (loading) {
    return (
      <Box display="flex" justify="center" align="center" h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.400">Loading progress report...</Text>
        </VStack>
      </Box>
    );
  }

  if (!reportData) {
    return (
      <Alert status="info" bg="gray.700" color="white">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text>No progress data available for the selected period.</Text>
          <Text fontSize="sm">
            Record some progress first using the Progress Tracking tab.
          </Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <Box>
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <VStack align="start" spacing={4}>
            <HStack justify="space-between" w="full">
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white">
                  Monthly Progress Report
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {reportData.projectName}
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Button 
                  leftIcon={<DownloadIcon />} 
                  onClick={exportToExcel} 
                  colorScheme="green"
                  size="sm"
                >
                  Export Excel
                </Button>
                <Button 
                  leftIcon={<CalendarIcon />} 
                  colorScheme="blue"
                  size="sm"
                  onClick={fetchReport}
                >
                  Refresh
                </Button>
              </HStack>
            </HStack>
            
            {/* Filters */}
            <HStack spacing={4} bg="gray.700" p={4} borderRadius="md" w="full">
              <Box>
                <Text fontSize="sm" mb={1} color="gray.300">Start Period</Text>
                <Input
                  type="month"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" mb={1} color="gray.300">End Period</Text>
                <Input
                  type="month"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                  size="sm"
                />
              </Box>
              <Button onClick={fetchReport} colorScheme="blue" size="sm" mt={6}>
                Apply Filters
              </Button>
            </HStack>
          </VStack>
        </CardHeader>

        <CardBody>
          {/* Project Summary */}
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
            <Card bg="gray.700" borderColor="gray.600">
              <CardBody py={3}>
                <Stat size="sm">
                  <StatLabel color="gray.300">Total Tasks</StatLabel>
                  <StatNumber color="white">{reportData.summary?.totalTasks || 0}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg="gray.700" borderColor="gray.600">
              <CardBody py={3}>
                <Stat size="sm">
                  <StatLabel color="gray.300">Budget Manhours</StatLabel>
                  <StatNumber color="white">
                    {(reportData.summary?.totalBudgetedManhours || 0).toFixed(0)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg="gray.700" borderColor="gray.600">
              <CardBody py={3}>
                <Stat size="sm">
                  <StatLabel color="gray.300">Consumed Manhours</StatLabel>
                  <StatNumber color="white">
                    {(reportData.summary?.totalConsumedManhours || 0).toFixed(0)}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg="gray.700" borderColor="gray.600">
              <CardBody py={3}>
                <Stat size="sm">
                  <StatLabel color="gray.300">Progress %</StatLabel>
                  <StatNumber color="white">
                    {reportData.summary?.totalBudgetedManhours > 0 
                      ? ((reportData.summary.totalConsumedManhours / reportData.summary.totalBudgetedManhours) * 100).toFixed(1)
                      : 0}%
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </Grid>

          {/* Progress Table */}
          <Box overflowX="auto">
            <Table variant="simple" size="sm" bg="gray.700">
              <Thead>
                <Tr bg="gray.600">
                  <Th color="gray.300" rowSpan={2} minW="250px">Task Description</Th>
                  <Th color="gray.300" rowSpan={2}>Unit</Th>
                  <Th color="gray.300" rowSpan={2} isNumeric>Productivity</Th>
                  <Th color="gray.300" rowSpan={2} isNumeric>Budget Qty</Th>
                  <Th color="gray.300" rowSpan={2} isNumeric>Budget Hrs</Th>
                  
                  {/* Monthly columns */}
                  {reportData.monthColumns?.map(month => (
                    <Th 
                      key={month.key} 
                      colSpan={5} 
                      textAlign="center" 
                      color="gray.300"
                      bg="blue.900"
                      borderColor="blue.700"
                    >
                      {new Date(month.year, month.month - 1).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </Th>
                  ))}
                  
                  <Th color="gray.300" rowSpan={2} bg="green.900">Total Installed</Th>
                  <Th color="gray.300" rowSpan={2} bg="green.900">Total Consumed</Th>
                  <Th color="gray.300" rowSpan={2} bg="yellow.900">Remaining Qty</Th>
                  <Th color="gray.300" rowSpan={2}>Actions</Th>
                </Tr>
                <Tr bg="gray.600">
                  {reportData.monthColumns?.map(month => (
                    <React.Fragment key={month.key}>
                      <Th fontSize="xs" color="gray.300">Target</Th>
                      <Th fontSize="xs" color="gray.300">Achieved</Th>
                      <Th fontSize="xs" color="gray.300">Manhours</Th>
                      <Th fontSize="xs" color="gray.300">Qty Var</Th>
                      <Th fontSize="xs" color="gray.300">Progress</Th>
                    </React.Fragment>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {reportData.tasks?.map((task, index) => (
                  <Tr key={task.id} _hover={{ bg: "gray.600" }}>
                    <Td color="white" maxW="300px">
                      <VStack align="start" spacing={1}>
                        <Badge colorScheme="blue" fontSize="xs">{task.categoryName}</Badge>
                        <Text fontSize="sm" fontWeight="semibold" noOfLines={2}>
                          {task.taskName}
                        </Text>
                      </VStack>
                    </Td>
                    <Td color="white">{task.unit}</Td>
                    <Td color="white" isNumeric>{task.productivity}</Td>
                    <Td color="white" isNumeric>{task.budgetedQuantity.toFixed(3)}</Td>
                    <Td color="white" isNumeric>{task.totalBudgetedManhours.toFixed(0)}</Td>
                    
                    {/* Monthly progress columns */}
                    {reportData.monthColumns?.map(month => {
                      const progress = task.monthlyProgress?.[month.key];
                      const taskProgress = task.totalBudgetedManhours > 0 
                        ? (progress?.consumedManhours / task.totalBudgetedManhours) * 100 
                        : 0;
                      
                      return (
                        <React.Fragment key={month.key}>
                          <Td color="white" isNumeric fontSize="sm">
                            {progress?.targetedQuantity?.toFixed(3) || '-'}
                          </Td>
                          <Td isNumeric>
                            {progress?.achievedQuantity ? (
                              <Badge 
                                colorScheme="green"
                                variant="solid"
                                fontSize="xs"
                              >
                                {progress.achievedQuantity.toFixed(3)}
                              </Badge>
                            ) : '-'}
                          </Td>
                          <Td color="white" isNumeric fontSize="sm">
                            {progress?.consumedManhours?.toFixed(1) || '-'}
                          </Td>
                          <Td isNumeric>
                            {progress?.varianceQuantity ? (
                              <Badge 
                                colorScheme={getVarianceBadgeColor(progress.varianceQuantity)}
                                fontSize="xs"
                              >
                                {progress.varianceQuantity >= 0 ? '+' : ''}{progress.varianceQuantity.toFixed(2)}
                              </Badge>
                            ) : '-'}
                          </Td>
                          <Td>
                            {progress ? (
                              <VStack spacing={1}>
                                <Progress 
                                  value={Math.min(taskProgress, 100)} 
                                  colorScheme={getProgressColor(taskProgress)}
                                  size="sm" 
                                  w="60px"
                                  bg="gray.600"
                                />
                                <Text fontSize="xs" color="white">
                                  {taskProgress.toFixed(0)}%
                                </Text>
                              </VStack>
                            ) : '-'}
                          </Td>
                        </React.Fragment>
                      );
                    })}
                    
                    <Td isNumeric bg="green.800" fontWeight="semibold" color="white">
                      {task.totalInstalledQuantity.toFixed(3)}
                    </Td>
                    <Td isNumeric bg="green.800" fontWeight="semibold" color="white">
                      {task.totalConsumedManhours.toFixed(1)}
                    </Td>
                    <Td isNumeric bg="yellow.800" fontWeight="semibold" color="white">
                      {task.remainingQuantity.toFixed(3)}
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <Tooltip label="Edit Progress">
                          <IconButton
                            size="xs"
                            icon={<EditIcon />}
                            onClick={() => handleEditProgress(task, reportData.monthColumns?.[0]?.key)}
                            aria-label="Edit progress"
                            colorScheme="blue"
                            variant="outline"
                          />
                        </Tooltip>
                        <Tooltip label="View Details">
                          <IconButton
                            size="xs"
                            icon={<ViewIcon />}
                            aria-label="View details"
                            colorScheme="green"
                            variant="outline"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Summary Footer */}
          <Box mt={6} p={4} bg="gray.700" borderRadius="md">
            <HStack justify="space-between">
              <VStack align="start">
                <Text color="gray.300" fontSize="sm">Report Generated</Text>
                <Text color="white" fontSize="sm">
                  {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </VStack>
              
              <VStack align="end">
                <Text color="gray.300" fontSize="sm">Period Coverage</Text>
                <Text color="white" fontSize="sm">
                  {filters.startDate} to {filters.endDate}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </CardBody>
      </Card>

      {/* Edit Progress Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700" maxW="90vw">
          <ModalHeader color="white">Edit Task Progress</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            {selectedTask && (
              <WeeklyProgressForm
                taskId={selectedTask.id}
                taskDetails={{
                  ...selectedTask,
                  category: selectedTask.categoryName,
                  name: selectedTask.taskName
                }}
                existingProgress={selectedProgress}
                onSave={handleProgressSaved}
                onCancel={onClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MonthlyProgressReport;
