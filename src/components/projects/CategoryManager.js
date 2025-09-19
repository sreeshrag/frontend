import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Switch,
  Tooltip,
} from "@chakra-ui/react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useCategory } from "../../contexts/CategoryContext";

const CategoryForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
    ...initialData,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Code</FormLabel>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="Enter category code"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter category name"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter category description"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Active</FormLabel>
          <Switch
            isChecked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
        </FormControl>

        <HStack spacing={4} width="100%">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button type="submit" colorScheme="blue">
            {initialData ? "Update" : "Create"}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

const CategoryManager = ({ projectId }) => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategory();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      if (projectId) {
        try {
          console.log("Fetching categories for project:", projectId);
          await fetchCategories(projectId);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }
    };
    loadCategories();
  }, [projectId, fetchCategories]);

  const handleCreate = async (data) => {
    try {
      await createCategory(projectId, data);
      onClose();
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateCategory(projectId, selectedCategory.id, data);
      setSelectedCategory(null);
      onClose();
    } catch (error) {
      // Error is handled in the context
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(projectId, categoryId);
      } catch (error) {
        // Error is handled in the context
      }
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    onOpen();
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    onOpen();
  };

  return (
    <Box>
      <HStack justify="space-between" mb={4}>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddNew}
          isLoading={loading}
        >
          Add Category
        </Button>
      </HStack>

      {error && (
        <Box mb={4} p={4} bg="red.500" color="white" borderRadius="md">
          {error}
        </Box>
      )}

      {loading ? (
        <Box textAlign="center" py={4}>
          Loading categories...
        </Box>
      ) : categories && categories.length > 0 ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Code</Th>
              <Th>Name</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {categories.map((category) => (
              <Tr key={category.id}>
                <Td>{category.code}</Td>
                <Td>{category.name}</Td>
                <Td>{category.description}</Td>
                <Td>
                  <Switch
                    isChecked={category.isActive}
                    onChange={async () => {
                      await updateCategory(projectId, category.id, {
                        ...category,
                        isActive: !category.isActive,
                      });
                    }}
                  />
                </Td>
                <Td>
                  <HStack spacing={2}>
                    <Tooltip label="Edit">
                      <IconButton
                        icon={<FiEdit2 />}
                        size="sm"
                        onClick={() => handleEdit(category)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(category.id)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Box textAlign="center" py={4} color="gray.500">
          No categories found. Click the "Add Category" button to create one.
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedCategory ? "Edit Category" : "Add New Category"}
          </ModalHeader>
          <ModalBody>
            <CategoryForm
              initialData={selectedCategory}
              onSubmit={selectedCategory ? handleUpdate : handleCreate}
              onCancel={onClose}
            />
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CategoryManager;
