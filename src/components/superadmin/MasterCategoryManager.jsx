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
  NumberInput,
  NumberInputField,
  Switch,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
  useToast
} from '@chakra-ui/react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiToggleLeft,
  FiToggleRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MasterCategoryManager = ({ onDataChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    order: 0,
    isActive: true,
    categoryId: null
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/super-admin/master/hierarchy');
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      order: categories.length,
      isActive: true
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      code: category.code,
      name: category.name,
      description: category.description || '',
      order: category.order,
      isActive: category.isActive,
      categoryId: category.id // Include categoryId in form data
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    onDeleteOpen();
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast.error('Code and name are required');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEditing 
        ? `/super-admin/master/categories/${selectedCategory.id}`
        : '/super-admin/master/categories';
      
      const method = isEditing ? 'put' : 'post';

      // Include categoryId when editing
      const requestData = isEditing 
        ? { 
            ...formData,
            categoryId: selectedCategory.id // Add categoryId for edit requests
          }
        : formData;

      const { data } = await api[method](url, requestData);
      
      if (data.success) {
        toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
        await fetchCategories();
        onDataChange?.();
        onFormClose();
      } else {
        toast.error(data.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error('Error saving category:', error?.response?.data || error);
      const errorMessage = error?.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} category`;
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      const { data } = await api.delete(`/super-admin/master/categories/${selectedCategory.id}`);
      
      if (data.success) {
        toast.success('Category deleted successfully');
        await fetchCategories();
        onDataChange?.();
        onDeleteClose();
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const toggleCategoryStatus = async (category) => {
    try {
      const { data } = await api.put(`/super-admin/master/categories/${category.id}`, { 
        isActive: !category.isActive 
      });
      
      if (data.success) {
        toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
        await fetchCategories();
        onDataChange?.();
      } else {
        toast.error(data.message || 'Failed to toggle category status');
      }
    } catch (error) {
      console.error('Error toggling category status:', error);
      toast.error('Failed to toggle category status');
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
                Master Categories
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Manage construction categories (HVAC, Plumbing, Electrical, etc.)
              </Text>
            </VStack>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleCreate}
            >
              Add Category
            </Button>
          </Flex>
        </CardHeader>
      </Card>

      {/* Categories Table */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          {categories.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Text color="gray.400" fontSize="lg">
                No categories found
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Create your first construction category to get started.
              </Text>
              <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={handleCreate}>
                Add First Category
              </Button>
            </VStack>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.400">Code</Th>
                  <Th color="gray.400">Name</Th>
                  <Th color="gray.400">Description</Th>
                  <Th color="gray.400">Activities</Th>
                  <Th color="gray.400">Sub-Tasks</Th>
                  <Th color="gray.400">Status</Th>
                  <Th color="gray.400">Order</Th>
                  <Th color="gray.400">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => {
                  const activitiesCount = category.masterActivities?.length || 0;
                  const subTasksCount = category.masterActivities?.reduce(
                    (sum, activity) => sum + (activity.masterSubTasks?.length || 0), 0
                  ) || 0;

                  return (
                    <Tr key={category.id}>
                      <Td color="white" fontFamily="mono" fontWeight="bold">
                        {category.code}
                      </Td>
                      <Td color="white" fontWeight="medium">
                        {category.name}
                      </Td>
                      <Td color="gray.300" maxW="300px">
                        <Text noOfLines={2}>{category.description}</Text>
                      </Td>
                      <Td>
                        <Badge variant="outline" colorScheme="blue">
                          {activitiesCount}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge variant="outline" colorScheme="green">
                          {subTasksCount}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={category.isActive ? "green" : "red"}
                          variant="solid"
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Td>
                      <Td color="white">{category.order}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Edit category"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                          />
                          <IconButton
                            aria-label="Toggle status"
                            icon={category.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                            size="sm"
                            variant="outline"
                            colorScheme={category.isActive ? "green" : "gray"}
                            onClick={() => toggleCategoryStatus(category)}
                          />
                          <IconButton
                            aria-label="Delete category"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="outline"
                            colorScheme="red"
                            onClick={() => handleDelete(category)}
                            isDisabled={activitiesCount > 0}
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
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel color="gray.300">Code</FormLabel>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g., HVAC, PL, EL"
                    bg="gray.700"
                    color="white"
                    maxLength={10}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel color="gray.300">Order</FormLabel>
                  <NumberInput
                    value={formData.order}
                    onChange={(value) => setFormData(prev => ({ ...prev, order: parseInt(value) || 0 }))}
                    min={0}
                  >
                    <NumberInputField bg="gray.700" color="white" />
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color="gray.300">Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., HVAC Systems, Plumbing, Electrical"
                  bg="gray.700"
                  color="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="gray.300">Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this category..."
                  bg="gray.700"
                  color="white"
                  rows={3}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel color="gray.300" mb={0}>
                  Active
                </FormLabel>
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
              {isEditing ? 'Update' : 'Create'} Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" borderColor="gray.700">
          <ModalHeader color="white">Delete Category</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              This action cannot be undone.
            </Alert>
            <Text color="white">
              Are you sure you want to delete the category{' '}
              <Text as="span" fontWeight="bold" color="red.300">
                {selectedCategory?.code} - {selectedCategory?.name}
              </Text>
              ?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete Category
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default MasterCategoryManager;
