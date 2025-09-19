import React, { useEffect, useState } from 'react';
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
  Input,
  NumberInput,
  NumberInputField,
  Select,
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
  StatArrow,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiSave, 
  FiEdit, 
  FiCalendar, 
  FiTrendingUp, 
  FiTrendingDown,
  FiTarget,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../contexts/ProjectContext';
import { useProgress } from '../../contexts/ProgressContext';
import { formatNumber, formatDate } from '../../utils/formatters';

const MonthlyProgress = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProject, fetchProject } = useProject();
  const {
    monthlyProgress,
    loading,
    error,
    selectedMonth,
    fetchMonthlyProgress,
    updateMonthlyProgress,
    setSelectedMonth
  } = useProgress();

  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      loadMonthlyProgress();
    }
  }, [projectId, selectedMonth]);

  const loadMonthlyProgress = () => {
    const [year, month] = selectedMonth.split('-');
    fetchMonthlyProgress(projectId, { year, month });
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const handleEditTask = (progress) => {
    setEditingTask(progress);
    setFormData({
      month: selectedMonth + '-01',
      targetedQuantity: progress.targetedQuantity || 0,
      achievedQuantity: progress.achievedQuantity || 0,
      consumedManhours: progress.consumedManhours || 0,
      additionalLapsedManhours: progress.additionalLapsedManhours || 0
    });

    // Initialize weekly data
    const weeks = getWeeksInMonth(selectedMonth);
    const existingWeekly = progress.weeklyProgress || [];
    
    setWeeklyData(weeks.map((week, index) => {
      const existing = existingWeekly.find(w => w.weekNumber === index + 1);
      return {
        weekNumber: index + 1,
        weekStartDate: week.startDate,
        targetedQuantity: existing?.targetedQuantity || 0,
        achievedQuantity: existing?.achievedQuantity || 0,
        consumedManhours: existing?.consumedManhours || 0,
        additionalLapsedManhours: existing?.additionalLapsedManhours || 0
      };
    }));

    onOpen();
  };

  const handleSaveProgress = async () => {
    try {
      await updateMonthlyProgress(editingTask.task.id, {
        ...formData,
        weeklyData
      });
      onClose();
      loadMonthlyProgress();
    } catch (error) {
      // Error handled in context
    }
  };

  const getWeeksInMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    const weeks = [];
    
    let current = new Date(startOfMonth);
    let weekNumber = 1;
    
    while (current <= endOfMonth) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      if (weekEnd > endOfMonth) {
        weekEnd.setDate(endOfMonth.getDate());
      }
      
      weeks.push({
        number: weekNumber,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });
      
      current.setDate(current.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };

  const calculateEfficiency = (budgeted, consumed) => {
    if (consumed === 0) return 0;
    return ((budgeted / consumed) * 100).toFixed(1);
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return 'green';
    if (efficiency >= 80) return 'blue';
    if (efficiency >= 60) return 'yellow';
    return 'red';
  };

  if (loading && !monthlyProgress.length) {
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
              <Heading size="lg">Monthly Progress</Heading>
              <Text color="gray.500">
                {currentProject?.name || 'Project Progress Tracking'}
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={3}>
            <HStack>
              <FiCalendar />
              <Text fontSize="sm">Month:</Text>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                size="sm"
                w="150px"
              />
            </HStack>
            <Button
              leftIcon={<FiTrendingUp />}
              colorScheme="blue"
              onClick={() => navigate(`/dashboard/company/projects/${projectId}/reports`)}
            >
              View Reports
            </Button>
          </HStack>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Monthly Summary Cards */}
        {monthlyProgress.length > 0 && (
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2}>
                    <FiTarget /> Total Targeted
                  </StatLabel>
                  <StatNumber>
                    {formatNumber(monthlyProgress.reduce((sum, p) => sum + (p.targetedQuantity || 0), 0))} hrs
                  </StatNumber>
                  <StatHelpText>This month's target</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2}>
                    <FiCheckCircle /> Total Achieved
                  </StatLabel>
                  <StatNumber>
                    {formatNumber(monthlyProgress.reduce((sum, p) => sum + (p.achievedQuantity || 0), 0))} hrs
                  </StatNumber>
                  <StatHelpText>Completed work</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2}>
                    <FiClock /> Total Consumed
                  </StatLabel>
                  <StatNumber>
                    {formatNumber(monthlyProgress.reduce((sum, p) => sum + (p.consumedManhours || 0), 0))} hrs
                  </StatNumber>
                  <StatHelpText>Manhours used</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Overall Efficiency</StatLabel>
                  <StatNumber>
                    {calculateEfficiency(
                      monthlyProgress.reduce((sum, p) => sum + (p.targetedQuantity || 0), 0),
                      monthlyProgress.reduce((sum, p) => sum + (p.consumedManhours || 0), 0)
                    )}%
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Performance metric
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        {/* Progress by Category */}
        <Card>
          <CardHeader>
            <Heading size="md">Category-wise Progress</Heading>
          </CardHeader>
          <CardBody>
            <Accordion allowToggle>
              {currentProject?.categories?.map((category) => {
                const categoryProgress = monthlyProgress.filter(p => 
                  p.task?.category?.id === category.id
                );
                
                const totalTargeted = categoryProgress.reduce((sum, p) => sum + (p.targetedQuantity || 0), 0);
                const totalAchieved = categoryProgress.reduce((sum, p) => sum + (p.achievedQuantity || 0), 0);
                const totalConsumed = categoryProgress.reduce((sum, p) => sum + (p.consumedManhours || 0), 0);
                const progressPercentage = totalTargeted > 0 ? (totalAchieved / totalTargeted) * 100 : 0;
                
                return (
                  <AccordionItem key={category.id}>
                    <AccordionButton py={4}>
                      <Box flex="1" textAlign="left">
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{category.name}</Text>
                            <HStack spacing={4}>
                              <Text fontSize="sm" color="gray.500">
                                {categoryProgress.length} tasks
                              </Text>
                              <Badge colorScheme={getEfficiencyColor(calculateEfficiency(totalTargeted, totalConsumed))}>
                                {calculateEfficiency(totalTargeted, totalConsumed)}% efficiency
                              </Badge>
                            </HStack>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {progressPercentage.toFixed(1)}% Complete
                            </Text>
                            <Progress 
                              value={progressPercentage} 
                              colorScheme={progressPercentage >= 80 ? 'green' : progressPercentage >= 50 ? 'blue' : 'red'}
                              size="sm" 
                              w="100px"
                            />
                          </VStack>
                        </HStack>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    
                    <AccordionPanel pb={4}>
                      <Table size="sm">
                        <Thead>
                          <Tr>
                            <Th>Task</Th>
                            <Th isNumeric>Targeted</Th>
                            <Th isNumeric>Achieved</Th>
                            <Th isNumeric>Consumed</Th>
                            <Th isNumeric>Efficiency</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {categoryProgress.map((progress) => {
                            const efficiency = calculateEfficiency(progress.targetedQuantity, progress.consumedManhours);
                            return (
                              <Tr key={progress.id}>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {progress.task?.code}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" noOfLines={2}>
                                      {progress.task?.description}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td isNumeric>
                                  <Text fontSize="sm">
                                    {formatNumber(progress.targetedQuantity)} hrs
                                  </Text>
                                </Td>
                                <Td isNumeric>
                                  <Text fontSize="sm">
                                    {formatNumber(progress.achievedQuantity)} hrs
                                  </Text>
                                </Td>
                                <Td isNumeric>
                                  <Text fontSize="sm">
                                    {formatNumber(progress.consumedManhours)} hrs
                                  </Text>
                                </Td>
                                <Td isNumeric>
                                  <Badge colorScheme={getEfficiencyColor(efficiency)}>
                                    {efficiency}%
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    leftIcon={<FiEdit />}
                                    onClick={() => handleEditTask(progress)}
                                    colorScheme="blue"
                                    variant="outline"
                                  >
                                    Edit
                                  </Button>
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </AccordionPanel>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardBody>
        </Card>

        {/* No Data State */}
        {monthlyProgress.length === 0 && !loading && (
          <Card>
            <CardBody>
              <VStack spacing={4} py={8}>
                <Text fontSize="lg" color="gray.500">
                  No progress data found for {selectedMonth}
                </Text>
                <Text fontSize="sm" color="gray.400" textAlign="center">
                  Progress data will appear here once tasks are started and progress is recorded.
                </Text>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Edit Progress Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent maxH="90vh" overflowY="auto">
          <ModalHeader>
            Edit Monthly Progress - {editingTask?.task?.code}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Monthly Totals */}
              <Card>
                <CardHeader>
                  <Heading size="sm">Monthly Summary</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <Text fontSize="sm" mb={2}>Targeted Quantity</Text>
                      <NumberInput
                        value={formData.targetedQuantity}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          targetedQuantity: parseFloat(value) || 0
                        }))}
                        min={0}
                        precision={3}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </GridItem>

                    <GridItem>
                      <Text fontSize="sm" mb={2}>Achieved Quantity</Text>
                      <NumberInput
                        value={formData.achievedQuantity}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          achievedQuantity: parseFloat(value) || 0
                        }))}
                        min={0}
                        precision={3}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </GridItem>

                    <GridItem>
                      <Text fontSize="sm" mb={2}>Consumed Manhours</Text>
                      <NumberInput
                        value={formData.consumedManhours}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          consumedManhours: parseFloat(value) || 0
                        }))}
                        min={0}
                        precision={3}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </GridItem>

                    <GridItem>
                      <Text fontSize="sm" mb={2}>Additional/Lapsed Hours</Text>
                      <NumberInput
                        value={formData.additionalLapsedManhours}
                        onChange={(value) => setFormData(prev => ({
                          ...prev,
                          additionalLapsedManhours: parseFloat(value) || 0
                        }))}
                        precision={3}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>

              {/* Weekly Breakdown */}
              <Card>
                <CardHeader>
                  <Heading size="sm">Weekly Breakdown</Heading>
                </CardHeader>
                <CardBody>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Week</Th>
                        <Th isNumeric>Targeted</Th>
                        <Th isNumeric>Achieved</Th>
                        <Th isNumeric>Consumed</Th>
                        <Th isNumeric>Additional/Lapsed</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {weeklyData.map((week, index) => (
                        <Tr key={index}>
                          <Td>
                            <Text fontSize="sm" fontWeight="medium">
                              Week {week.weekNumber}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(week.weekStartDate)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              size="sm"
                              value={week.targetedQuantity}
                              onChange={(value) => {
                                const newWeeklyData = [...weeklyData];
                                newWeeklyData[index].targetedQuantity = parseFloat(value) || 0;
                                setWeeklyData(newWeeklyData);
                              }}
                              min={0}
                              precision={3}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              size="sm"
                              value={week.achievedQuantity}
                              onChange={(value) => {
                                const newWeeklyData = [...weeklyData];
                                newWeeklyData[index].achievedQuantity = parseFloat(value) || 0;
                                setWeeklyData(newWeeklyData);
                              }}
                              min={0}
                              precision={3}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              size="sm"
                              value={week.consumedManhours}
                              onChange={(value) => {
                                const newWeeklyData = [...weeklyData];
                                newWeeklyData[index].consumedManhours = parseFloat(value) || 0;
                                setWeeklyData(newWeeklyData);
                              }}
                              min={0}
                              precision={3}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                          <Td isNumeric>
                            <NumberInput
                              size="sm"
                              value={week.additionalLapsedManhours}
                              onChange={(value) => {
                                const newWeeklyData = [...weeklyData];
                                newWeeklyData[index].additionalLapsedManhours = parseFloat(value) || 0;
                                setWeeklyData(newWeeklyData);
                              }}
                              precision={3}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              leftIcon={<FiSave />}
              colorScheme="blue"
              onClick={handleSaveProgress}
              isLoading={loading}
            >
              Save Progress
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MonthlyProgress;
