import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  IconButton,
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
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Switch,
  Spinner,
  Flex,
  Alert,
  AlertIcon,
  Box
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MasterSubTaskManager = ({ categories, onDataChange }) => {
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubTask, setSelectedSubTask] = useState(null);
  const [formData, setFormData] = useState({
    masterActivityId: '',
    name: '',
    description: '',
    defaultProductivity: 0,
    unit: 'No',
    order: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose
  } = useDisclosure();

  // Get all activities from all categories
  const allActivities = categories.flatMap(category =>
    (category.masterActivities || []).map(activity => ({
      ...activity,
      categoryName: category.name,
      categoryCode: category.code
    }))
  );

  useEffect(() => {
    fetchAllSubTasks();
  }, [categories]);

  // Optimized function to process subtasks in chunks
  const processSubTasksInChunks = (categories) => {
    return new Promise((resolve) => {
      const allSubTasks = [];
      let currentIndex = 0;
      
      const processNextChunk = () => {
        const chunkSize = 50; // Process 50 categories at a time
        const chunk = categories.slice(currentIndex, currentIndex + chunkSize);
        
        chunk.forEach(category => {
          if (category.masterActivities) {
            category.masterActivities.forEach(activity => {
              if (activity.masterSubTasks) {
                allSubTasks.push(...activity.masterSubTasks.map(subTask => ({
                  ...subTask,
                  activityName: activity.name,
                  activityCode: activity.code,
                  categoryName: category.name,
                  categoryCode: category.code
                })));
              }
            });
          }
        });
        
        currentIndex += chunkSize;
        
        if (currentIndex < categories.length) {
          setTimeout(() => processNextChunk(), 0); // Use setTimeout to prevent blocking
        } else {
          resolve(allSubTasks);
        }
      };
      
      processNextChunk();
    });
  };

  const fetchAllSubTasks = async () => {
    setLoading(true);
    try {
      const allSubTasks = await processSubTasksInChunks(categories);
      setSubTasks(allSubTasks);
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
      toast.error('Failed to fetch sub-tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSubTask(null);
    setFormData({
      masterActivityId: allActivities[0]?.id || '',
      name: '',
      description: '',
      defaultProductivity: 0,
      unit: 'No',
      order: 0,
      isActive: true
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEdit = (subTask) => {
    setSelectedSubTask(subTask);
    setFormData({
      masterActivityId: subTask.masterActivityId,
      name: subTask.name,
      description: subTask.description || '',
      defaultProductivity: subTask.defaultProductivity,
      unit: subTask.unit,
      order: subTask.order,
      isActive: subTask.isActive
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.masterActivityId) {
      toast.error('Name and activity are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing 
        ? `/super-admin/master/subtasks/${selectedSubTask.id}`
        : `/super-admin/master/activities/${formData.masterActivityId}/subtasks`;
      
      const method = isEditing ? 'put' : 'post';

      const { data } = await api[method](url, formData);
      
      if (data.success) {
        toast.success(`Sub-task ${isEditing ? 'updated' : 'created'} successfully`);
        fetchAllSubTasks();
        onDataChange?.();
        onFormClose();
      } else {
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} sub-task`);
      }
    } catch (error) {
      console.error('Error saving sub-task:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} sub-task`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="xl" />
      </Flex>
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
                Master Sub-Tasks
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Manage individual tasks with productivity rates
              </Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleCreate}
              isDisabled={allActivities.length === 0}
            >
              Add Sub-Task
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Sub-Tasks Table */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          {allActivities.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Please create categories and activities first.
            </Alert>
          ) : subTasks.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Text color="gray.400" fontSize="lg">
                No sub-tasks found
              </Text>
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreate}>
                Add First Sub-Task
              </Button>
            </VStack>
          ) : (
            <Box overflowX="auto" maxH="600px" overflowY="auto">
              <Table variant="simple" size="sm">
                <Thead position="sticky" top={0} bg="gray.800" zIndex={1}>
                  <Tr>
                    <Th color="gray.400" whiteSpace="nowrap">Category</Th>
                    <Th color="gray.400" whiteSpace="nowrap">Activity</Th>
                    <Th color="gray.400" whiteSpace="nowrap">Task Name</Th>
                    <Th color="gray.400" whiteSpace="nowrap">Productivity</Th>
                    <Th color="gray.400" whiteSpace="nowrap">Unit</Th>
                    <Th color="gray.400" whiteSpace="nowrap">Status</Th>
                    <Th color="gray.400" whiteSpace="nowrap" position="sticky" right={0} bg="gray.800">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {subTasks.map((subTask) => (
                    <Tr key={subTask.id}>
                      <Td whiteSpace="nowrap">
                        <Badge colorScheme="blue" variant="outline">
                          {subTask.categoryCode}
                        </Badge>
                      </Td>
                      <Td whiteSpace="nowrap">
                        <Badge colorScheme="green" variant="outline">
                          {subTask.activityCode}
                        </Badge>
                      </Td>
                      <Td color="white" maxW="300px">
                        <Text fontWeight="medium" noOfLines={2}>
                          {subTask.name}
                        </Text>
                      </Td>
                      <Td color="white" whiteSpace="nowrap">
                        {subTask.defaultProductivity} {subTask.unit}
                      </Td>
                      <Td color="white" whiteSpace="nowrap">{subTask.unit}</Td>
                      <Td whiteSpace="nowrap">
                        <Badge 
                          colorScheme={subTask.isActive ? "green" : "red"}
                          variant="solid"
                        >
                          {subTask.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td position="sticky" right={0} bg="gray.800">
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit sub-task"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(subTask)}
                          />
                          <IconButton
                            aria-label="Delete sub-task"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">
            {isEditing ? 'Edit Sub-Task' : 'Create New Sub-Task'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="gray.300">Activity</FormLabel>
                <Select
                  value={formData.masterActivityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, masterActivityId: e.target.value }))}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  <option value="">Select Activity</option>
                  {allActivities.map(activity => (
                    <option key={activity.id} value={activity.id}>
                      {activity.categoryCode} - {activity.code} - {activity.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="gray.300">Task Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Heat Exchanger Installation"
                  bg="gray.700"
                  color="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description..."
                  bg="gray.700"
                  color="white"
                  rows={3}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel color="gray.300">Default Productivity</FormLabel>
                  <NumberInput
                    value={formData.defaultProductivity}
                    onChange={(value) => setFormData(prev => ({ ...prev, defaultProductivity: parseFloat(value) || 0 }))}
                    min={0}
                    precision={6}
                    step={0.1}
                  >
                    <NumberInputField bg="gray.700" color="white" />
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Unit</FormLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    bg="gray.700"
                    color="white"
                  >
                    <option value="No">No</option>
                    <option value="m">m</option>
                    <option value="Sq.m">Sq.m</option>
                    <option value="Item">Item</option>
                    <option value="Set">Set</option>
                    <option value="Point">Point</option>
                    <option value="Nos">Nos</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl display="flex" alignItems="center">
                <FormLabel color="gray.300" mb={0}>Active</FormLabel>
                <Switch
                  isChecked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  colorScheme="blue"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFormClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {isEditing ? 'Update' : 'Create'} Sub-Task
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MasterSubTaskManager;
