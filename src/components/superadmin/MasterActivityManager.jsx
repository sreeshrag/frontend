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
  Switch,
  Spinner,
  Flex,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MasterActivityManager = ({ categories, onDataChange }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [formData, setFormData] = useState({
    masterCategoryId: '',
    code: '',
    name: '',
    description: '',
    defaultUnit: 'No',
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

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose
  } = useDisclosure();

  useEffect(() => {
    fetchAllActivities();
  }, []);

  const fetchAllActivities = async () => {
    setLoading(true);
    try {
      // Fetch all activities across categories
      const allActivities = [];
      for (const category of categories) {
        if (category.masterActivities) {
          allActivities.push(...category.masterActivities.map(activity => ({
            ...activity,
            categoryName: category.name,
            categoryCode: category.code
          })));
        }
      }
      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedActivity(null);
    setFormData({
      masterCategoryId: categories[0]?.id || '',
      code: '',
      name: '',
      description: '',
      defaultUnit: 'No',
      order: 0,
      isActive: true
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setFormData({
      masterCategoryId: activity.masterCategoryId,
      code: activity.code,
      name: activity.name,
      description: activity.description || '',
      defaultUnit: activity.defaultUnit,
      order: activity.order,
      isActive: activity.isActive
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.masterCategoryId) {
      toast.error('Code, name, and category are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing 
        ? `/super-admin/master/activities/${selectedActivity.id}`
        : `/super-admin/master/categories/${formData.masterCategoryId}/activities`;
      
      const method = isEditing ? 'put' : 'post';

      const { data } = await api[method](url, formData);
      
      if (data.success) {
        toast.success(`Activity ${isEditing ? 'updated' : 'created'} successfully`);
        await fetchAllActivities();
        onDataChange?.();
        onFormClose();
      } else {
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} activity`);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} activity`);
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
                Master Activities
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Manage activities within categories
              </Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleCreate}
              isDisabled={categories.length === 0}
            >
              Add Activity
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Activities Table */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          {categories.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Please create categories first before adding activities.
            </Alert>
          ) : activities.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Text color="gray.400" fontSize="lg">
                No activities found
              </Text>
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreate}>
                Add First Activity
              </Button>
            </VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.400">Category</Th>
                  <Th color="gray.400">Code</Th>
                  <Th color="gray.400">Name</Th>
                  <Th color="gray.400">Default Unit</Th>
                  <Th color="gray.400">Sub-Tasks</Th>
                  <Th color="gray.400">Status</Th>
                  <Th color="gray.400">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activities.map((activity) => {
                  const subTasksCount = activity.masterSubTasks?.length || 0;

                  return (
                    <Tr key={activity.id}>
                      <Td>
                        <Badge colorScheme="blue" variant="outline">
                          {activity.categoryCode}
                        </Badge>
                      </Td>
                      <Td color="white" fontFamily="mono" fontWeight="bold">
                        {activity.code}
                      </Td>
                      <Td color="white" fontWeight="medium">
                        {activity.name}
                      </Td>
                      <Td color="white">{activity.defaultUnit}</Td>
                      <Td>
                        <Badge variant="outline" colorScheme="green">
                          {subTasksCount}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={activity.isActive ? "green" : "red"}
                          variant="solid"
                        >
                          {activity.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit activity"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(activity)}
                          />
                          <IconButton
                            aria-label="Delete activity"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            isDisabled={subTasksCount > 0}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">
            {isEditing ? 'Edit Activity' : 'Create New Activity'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel color="gray.300">Category</FormLabel>
                <Select
                  value={formData.masterCategoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, masterCategoryId: e.target.value }))}
                  bg="gray.700"
                  color="white"
                  borderColor="gray.600"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.code} - {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Code</FormLabel>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., HVAC-001"
                    bg="gray.700"
                    color="white"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Default Unit</FormLabel>
                  <Select
                    value={formData.defaultUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, defaultUnit: e.target.value }))}
                    bg="gray.700"
                    color="white"
                  >
                    <option value="No">No</option>
                    <option value="m">m</option>
                    <option value="Sq.m">Sq.m</option>
                    <option value="Item">Item</option>
                    <option value="Set">Set</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color="gray.300">Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Activity name"
                  bg="gray.700"
                  color="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Activity description..."
                  bg="gray.700"
                  color="white"
                  rows={3}
                />
              </FormControl>

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
              {isEditing ? 'Update' : 'Create'} Activity
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MasterActivityManager;
