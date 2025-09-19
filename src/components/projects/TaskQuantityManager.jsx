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
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  useToast,
  Flex,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FiSave,
  FiEdit2,
  FiRefreshCw,
  FiDownload,
  FiUpload
} from 'react-icons/fi';

const TaskQuantityManager = ({ categories, projectTasks, onTaskUpdate, projectId }) => {
  const [editingTasks, setEditingTasks] = useState({});
  const [saving, setSaving] = useState(false);
  const [changedTasks, setChangedTasks] = useState(new Set());
  const toast = useToast();

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num || 0);
  };

  const handleTaskEdit = (taskId, field, value) => {
    setEditingTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
    
    setChangedTasks(prev => new Set([...prev, taskId]));
  };

  const calculateManhours = (quantity, productivity) => {
    const qty = parseFloat(quantity) || 0;
    const prod = parseFloat(productivity) || 0;
    return qty * prod;
  };

  const getTaskValue = (task, field) => {
    if (editingTasks[task.id] && editingTasks[task.id][field] !== undefined) {
      return editingTasks[task.id][field];
    }
    return task[field] || '';
  };

  const getCurrentManhours = (task) => {
    const quantity = getTaskValue(task, 'quantity');
    const productivity = getTaskValue(task, 'productivity');
    return calculateManhours(quantity, productivity);
  };

  const saveTasks = async () => {
    if (changedTasks.size === 0) return;

    setSaving(true);
    try {
      const tasksToUpdate = Array.from(changedTasks).map(taskId => {
        const originalTask = projectTasks.find(t => t.id === taskId);
        const editedData = editingTasks[taskId] || {};
        
        return {
          id: taskId,
          quantity: parseFloat(editedData.quantity || originalTask.quantity || 0),
          productivity: parseFloat(editedData.productivity || originalTask.productivity || 0),
          unit: editedData.unit || originalTask.unit
        };
      });

      const response = await fetch('/api/manpower/tasks/quantities', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tasks: tasksToUpdate })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Success',
          description: `Updated ${tasksToUpdate.length} tasks successfully`,
          status: 'success',
          duration: 3000
        });

        // Clear editing state
        setEditingTasks({});
        setChangedTasks(new Set());
        
        // Refresh data
        onTaskUpdate();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to update tasks',
          status: 'error',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error saving tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        status: 'error',
        duration: 4000
      });
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setEditingTasks({});
    setChangedTasks(new Set());
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = [
      'Category',
      'Activity Code', 
      'Task Description',
      'Quantity',
      'Unit',
      'Productivity',
      'Total Manhours',
      'Consumed Manhours',
      'Remaining Manhours',
      'Installed Quantity',
      'Quantity Progress %'
    ];

    const rows = categories.flatMap(category =>
      category.projectTasks?.map(task => {
        const quantityProgress = task.quantity > 0 
          ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
          : 0;
          
        return [
          category.name,
          task.masterSubTask?.masterActivity?.code || '',
          task.masterSubTask?.name || '',
          task.quantity || 0,
          task.unit || '',
          task.productivity || 0,
          task.totalBudgetedManhours || 0,
          task.totalConsumedManhours || 0,
          task.totalRemainingManhours || 0,
          task.totalInstalledQuantity || 0,
          quantityProgress.toFixed(1)
        ];
      }) || []
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectId}-manpower-budget-quantities.csv`;
    link.click();
  };

  if (!categories || categories.length === 0) {
    return (
      <Alert status="info">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text>No categories configured</Text>
          <Text fontSize="sm">
            Use the "Setup Categories" button to initialize your manpower budget.
          </Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="md" color="white">
                Task Quantity Management
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Manage quantities and track quantity-based progress
              </Text>
            </VStack>
            <HStack spacing={3}>
              {changedTasks.size > 0 && (
                <>
                  <Badge colorScheme="yellow" variant="solid">
                    {changedTasks.size} unsaved changes
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetChanges}
                  >
                    Reset
                  </Button>
                </>
              )}
              <Button
                leftIcon={<FiSave />}
                colorScheme="green"
                size="sm"
                onClick={saveTasks}
                isLoading={saving}
                isDisabled={changedTasks.size === 0}
              >
                Save Changes
              </Button>
              <Button
                leftIcon={<FiDownload />}
                variant="outline"
                size="sm"
                onClick={exportToExcel}
              >
                Export Excel
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
      </Card>

      {/* ✅ UPDATED: Task Categories with Quantity-Based Progress */}
      <Accordion allowMultiple defaultIndex={[0]}>
        {categories.map((category, categoryIndex) => {
          const categoryTasks = category.projectTasks || [];
          const categoryTotal = categoryTasks.reduce(
            (sum, task) => sum + (task.totalBudgetedManhours || 0),
            0
          );
          const categoryConsumed = categoryTasks.reduce(
            (sum, task) => sum + (task.totalConsumedManhours || 0),
            0
          );

          // ✅ UPDATED: Category progress now based on quantity completion
          const categoryQuantityProgress = categoryTasks.length > 0
            ? categoryTasks.reduce((sum, task) => {
                const taskQuantityProgress = task.quantity > 0 
                  ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
                  : 0;
                return sum + taskQuantityProgress;
              }, 0) / categoryTasks.length
            : 0;

          return (
            <AccordionItem key={category.id}>
              <AccordionButton py={4} bg="gray.800" _expanded={{ bg: "gray.700" }}>
                <Box flex="1" textAlign="left">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" color="white">
                        {category.code} - {category.name}
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        {categoryTasks.length} tasks • {formatNumber(categoryTotal)} hrs budgeted
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="white">
                        {categoryQuantityProgress.toFixed(1)}% Quantity Progress
                      </Text>
                      <HStack spacing={2}>
                        <Badge 
                          colorScheme={categoryQuantityProgress >= 80 ? "green" : categoryQuantityProgress >= 50 ? "yellow" : "red"}
                        >
                          Qty: {categoryQuantityProgress.toFixed(1)}%
                        </Badge>
                        <Badge colorScheme="gray" variant="outline">
                          Hrs: {formatNumber(categoryConsumed)} / {formatNumber(categoryTotal)}
                        </Badge>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
                <AccordionIcon color="white" />
              </AccordionButton>

              <AccordionPanel pb={4} bg="gray.900">
                {categoryTasks.length > 0 ? (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th color="gray.400" minW="200px">Activity / Task</Th>
                          <Th color="gray.400" isNumeric minW="100px">Quantity</Th>
                          <Th color="gray.400" minW="80px">Unit</Th>
                          <Th color="gray.400" isNumeric minW="100px">Installed</Th>
                          <Th color="gray.400" isNumeric minW="120px">Productivity</Th>
                          <Th color="gray.400" isNumeric minW="120px">Total Manhours</Th>
                          <Th color="gray.400" isNumeric minW="120px">Consumed</Th>
                          <Th color="gray.400" isNumeric minW="120px">Remaining</Th>
                          <Th color="gray.400" minW="100px">Qty Progress</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {categoryTasks.map((task) => {
                          const isChanged = changedTasks.has(task.id);
                          const currentManhours = getCurrentManhours(task);
                          
                          // ✅ UPDATED: Now uses quantity-based progress instead of manhour-based
                          const quantityProgress = task.quantity > 0 
                            ? ((task.totalInstalledQuantity || 0) / task.quantity) * 100 
                            : 0;

                          return (
                            <Tr 
                              key={task.id}
                              bg={isChanged ? "blue.900" : "transparent"}
                              borderWidth={isChanged ? "1px" : "0"}
                              borderColor={isChanged ? "blue.500" : "transparent"}
                            >
                              <Td color="white" maxW="300px">
                                <VStack align="start" spacing={1}>
                                  <Text fontSize="xs" color="gray.400" fontFamily="mono">
                                    {task.masterSubTask?.masterActivity?.code}
                                  </Text>
                                  <Text fontSize="sm" noOfLines={2}>
                                    {task.masterSubTask?.name}
                                  </Text>
                                </VStack>
                              </Td>
                              
                              <Td>
                                <NumberInput
                                  size="sm"
                                  min={0}
                                  precision={3}
                                  value={getTaskValue(task, 'quantity')}
                                  onChange={(value) => handleTaskEdit(task.id, 'quantity', value)}
                                >
                                  <NumberInputField 
                                    bg="gray.700" 
                                    color="white" 
                                    border="1px solid"
                                    borderColor={isChanged ? "blue.400" : "gray.600"}
                                  />
                                </NumberInput>
                              </Td>

                              <Td>
                                <Select
                                  size="sm"
                                  value={getTaskValue(task, 'unit')}
                                  onChange={(e) => handleTaskEdit(task.id, 'unit', e.target.value)}
                                  bg="gray.700"
                                  color="white"
                                  borderColor={isChanged ? "blue.400" : "gray.600"}
                                >
                                  <option value="No">No</option>
                                  <option value="m">m</option>
                                  <option value="Sq.m">Sq.m</option>
                                  <option value="Item">Item</option>
                                  <option value="Set">Set</option>
                                  <option value="Point">Point</option>
                                  <option value="Nos">Nos</option>
                                </Select>
                              </Td>

                              {/* ✅ NEW: Show installed quantity */}
                              <Td isNumeric>
                                <Text color="white" fontSize="sm">
                                  {formatNumber(task.totalInstalledQuantity || 0)}
                                </Text>
                              </Td>

                              <Td>
                                <NumberInput
                                  size="sm"
                                  min={0}
                                  precision={6}
                                  step={0.1}
                                  value={getTaskValue(task, 'productivity')}
                                  onChange={(value) => handleTaskEdit(task.id, 'productivity', value)}
                                >
                                  <NumberInputField 
                                    bg="gray.700" 
                                    color="white"
                                    border="1px solid"
                                    borderColor={isChanged ? "blue.400" : "gray.600"}
                                  />
                                </NumberInput>
                              </Td>

                              <Td isNumeric>
                                <Text 
                                  color={isChanged ? "blue.300" : "white"}
                                  fontWeight={isChanged ? "bold" : "normal"}
                                >
                                  {formatNumber(isChanged ? currentManhours : task.totalBudgetedManhours)}
                                </Text>
                              </Td>

                              <Td isNumeric>
                                <Text color="white">
                                  {formatNumber(task.totalConsumedManhours)}
                                </Text>
                              </Td>

                              <Td isNumeric>
                                <Text color="white">
                                  {formatNumber(task.totalRemainingManhours)}
                                </Text>
                              </Td>

                              {/* ✅ UPDATED: Now shows quantity-based progress */}
                              <Td>
                                <VStack spacing={1} align="center">
                                  <Badge
                                    colorScheme={
                                      quantityProgress >= 100 ? "green" :
                                      quantityProgress >= 75 ? "yellow" : 
                                      quantityProgress > 0 ? "blue" : "gray"
                                    }
                                    size="sm"
                                  >
                                    {quantityProgress.toFixed(1)}%
                                  </Badge>
                                  <Text fontSize="xs" color="gray.400">
                                    Qty Based
                                  </Text>
                                </VStack>
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text color="gray.400" textAlign="center" py={4}>
                    No tasks found for this category
                  </Text>
                )}
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>
    </VStack>
  );
};

export default TaskQuantityManager;
