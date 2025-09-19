import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Checkbox,
  CheckboxGroup,
  Stack,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Box,
  Badge,
  Divider
} from '@chakra-ui/react';
import { masterDataAPI } from '../../services/api';
const CategorySelector = ({ onSelectionComplete, existingCategories = [], isUpdate = false }) => {
  const [loading, setLoading] = useState(true);
  const [masterCategories, setMasterCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMasterCategories();
  }, []);

  useEffect(() => {
    // Pre-select existing categories if this is an update
    if (isUpdate && existingCategories.length > 0) {
      const existingIds = existingCategories
        .filter(cat => cat.masterCategoryId)
        .map(cat => cat.masterCategoryId);
      setSelectedCategories(existingIds);
    }
  }, [existingCategories, isUpdate]);

// Replace your fetchMasterCategories function with this:
// Replace your fetchMasterCategories function:
const fetchMasterCategories = async () => {
  try {
    const response = await masterDataAPI.getCategories();
    
    if (response.data.success) {
      setMasterCategories(response.data.data);
    } else {
      console.error('Failed to fetch master categories:', response.data.message);
    }
  } catch (error) {
    console.error('Error fetching master categories:', error);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSelectionComplete(selectedCategories);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <VStack spacing={4} py={6}>
        <Spinner size="lg" />
        <Text color="gray.400">Loading construction categories...</Text>
      </VStack>
    );
  }

  if (masterCategories.length === 0) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text>No master categories available</Text>
          <Text fontSize="sm">
            Master categories need to be imported by a Super Admin first.
          </Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Text color="gray.300" fontSize="sm" mb={4}>
          Select the construction categories that apply to this project. 
          Each category contains specific activities and tasks with predefined productivity rates.
        </Text>

        <CheckboxGroup value={selectedCategories} onChange={setSelectedCategories}>
          <Stack spacing={3}>
            {masterCategories.map((category) => {
              const isExisting = existingCategories.some(
                existing => existing.masterCategoryId === category.id
              );

              return (
                <HStack 
                  key={category.id}
                  p={3}
                  bg={isExisting ? "blue.900" : "gray.700"}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor={isExisting ? "blue.600" : "gray.600"}
                >
                  <Checkbox 
                    value={category.id}
                    colorScheme="blue"
                    size="lg"
                    isDisabled={isExisting && !isUpdate}
                  >
                    <VStack align="start" spacing={1} ml={2}>
                      <HStack>
                        <Text color="white" fontWeight="medium">
                          {category.code} - {category.name}
                        </Text>
                        {isExisting && (
                          <Badge colorScheme="blue" size="sm">
                            Already Added
                          </Badge>
                        )}
                      </HStack>
                      {category.description && (
                        <Text color="gray.400" fontSize="sm">
                          {category.description}
                        </Text>
                      )}
                    </VStack>
                  </Checkbox>
                </HStack>
              );
            })}
          </Stack>
        </CheckboxGroup>
      </Box>

      <Divider borderColor="gray.600" />

      <HStack justify="space-between">
        <Text color="gray.400" fontSize="sm">
          {selectedCategories.length} categories selected
        </Text>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isLoading={submitting}
          isDisabled={selectedCategories.length === 0}
        >
          {isUpdate ? 'Update Categories' : 'Initialize Tasks'}
        </Button>
      </HStack>
    </VStack>
  );
};

export default CategorySelector;
