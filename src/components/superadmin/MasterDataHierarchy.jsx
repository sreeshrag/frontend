import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Collapse,
  useDisclosure,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex
} from '@chakra-ui/react';
import {
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiLayers,
  FiList,
  FiPackage,
  FiEdit2,
  FiEye
} from 'react-icons/fi';

const TreeNode = ({ node, level = 0, searchTerm = '', onEdit, onView }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: level < 2 });
  
  const hasChildren = node.children && node.children.length > 0;
  const matchesSearch = !searchTerm || 
    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.code?.toLowerCase().includes(searchTerm.toLowerCase());

  // Filter children based on search
  const filteredChildren = hasChildren 
    ? node.children.filter(child => 
        !searchTerm || 
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (child.children && child.children.some(grandChild => 
          grandChild.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : [];

  const shouldShow = matchesSearch || (hasChildren && filteredChildren.length > 0);

  if (!shouldShow) return null;

  const getNodeIcon = () => {
    switch (level) {
      case 0: return <FiLayers color="blue.400" />;
      case 1: return <FiList color="green.400" />;
      case 2: return <FiPackage color="orange.400" />;
      default: return null;
    }
  };

  const getNodeColor = () => {
    switch (level) {
      case 0: return 'blue.300';
      case 1: return 'green.300';
      case 2: return 'orange.300';
      default: return 'white';
    }
  };

  const getBadgeColor = () => {
    switch (level) {
      case 0: return 'blue';
      case 1: return 'green';
      case 2: return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box pl={level * 4}>
      <HStack spacing={3} py={2} px={3} borderRadius="md" _hover={{ bg: 'gray.700' }}>
        {hasChildren ? (
          <IconButton
            aria-label={isOpen ? 'Collapse' : 'Expand'}
            icon={isOpen ? <FiChevronDown /> : <FiChevronRight />}
            size="xs"
            variant="ghost"
            onClick={onToggle}
          />
        ) : (
          <Box w="24px" />
        )}
        
        {getNodeIcon()}
        
        <VStack align="start" spacing={0} flex="1">
          <HStack spacing={2}>
            <Text color={getNodeColor()} fontWeight="medium" fontSize="sm">
              {node.code && `${node.code} - `}{node.name}
            </Text>
            {node.defaultProductivity && (
              <Badge size="sm" colorScheme="purple">
                {node.defaultProductivity} {node.unit}
              </Badge>
            )}
            {hasChildren && (
              <Badge size="sm" colorScheme={getBadgeColor()}>
                {node.children.length} items
              </Badge>
            )}
            {!node.isActive && (
              <Badge size="sm" colorScheme="red">
                Inactive
              </Badge>
            )}
          </HStack>
          
          {node.description && (
            <Text color="gray.400" fontSize="xs" noOfLines={1}>
              {node.description}
            </Text>
          )}
        </VStack>

        <HStack spacing={1}>
          <IconButton
            aria-label="View details"
            icon={<FiEye />}
            size="xs"
            variant="outline"
            onClick={() => onView?.(node, level)}
          />
          <IconButton
            aria-label="Edit"
            icon={<FiEdit2 />}
            size="xs"
            variant="outline"
            onClick={() => onEdit?.(node, level)}
          />
        </HStack>
      </HStack>

      {hasChildren && (
        <Collapse in={isOpen} unmountOnExit>
          <VStack align="stretch" spacing={0} mt={1}>
            {(searchTerm ? filteredChildren : node.children).map((child) => (
              <TreeNode 
                key={child.id} 
                node={child} 
                level={level + 1} 
                searchTerm={searchTerm}
                onEdit={onEdit}
                onView={onView}
              />
            ))}
          </VStack>
        </Collapse>
      )}
    </Box>
  );
};

const MasterDataHierarchy = ({ hierarchyData, onDataChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Transform hierarchyData for tree display
  const transformDataForTree = (categories) => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      code: category.code,
      description: category.description,
      isActive: category.isActive,
      children: category.masterActivities?.map(activity => ({
        id: activity.id,
        name: activity.name,
        code: activity.code,
        description: activity.description,
        defaultUnit: activity.defaultUnit,
        isActive: activity.isActive,
        children: activity.masterSubTasks?.map(subTask => ({
          id: subTask.id,
          name: subTask.name,
          description: subTask.description,
          defaultProductivity: subTask.defaultProductivity,
          unit: subTask.unit,
          isActive: subTask.isActive,
          children: []
        })) || []
      })) || []
    }));
  };

  const treeData = transformDataForTree(hierarchyData);

  const handleEdit = (node, level) => {
    // Handle edit based on level
    console.log('Edit:', { node, level });
    // You can emit events or call parent methods here
  };

  const handleView = (node, level) => {
    // Handle view based on level
    console.log('View:', { node, level });
  };

  const getTotalCounts = () => {
    let categories = 0;
    let activities = 0;
    let subTasks = 0;

    hierarchyData.forEach(category => {
      categories++;
      if (category.masterActivities) {
        activities += category.masterActivities.length;
        category.masterActivities.forEach(activity => {
          if (activity.masterSubTasks) {
            subTasks += activity.masterSubTasks.length;
          }
        });
      }
    });

    return { categories, activities, subTasks };
  };

  const counts = getTotalCounts();

  return (
    <VStack spacing={6} align="stretch">
      {/* Header with Search */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="md" color="white">
                  Master Data Hierarchy
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  Complete structure of categories, activities, and sub-tasks
                </Text>
              </VStack>
              
              <HStack spacing={4}>
                <VStack align="center" spacing={0}>
                  <Text color="blue.300" fontSize="lg" fontWeight="bold">
                    {counts.categories}
                  </Text>
                  <Text color="gray.400" fontSize="xs">Categories</Text>
                </VStack>
                <VStack align="center" spacing={0}>
                  <Text color="green.300" fontSize="lg" fontWeight="bold">
                    {counts.activities}
                  </Text>
                  <Text color="gray.400" fontSize="xs">Activities</Text>
                </VStack>
                <VStack align="center" spacing={0}>
                  <Text color="orange.300" fontSize="lg" fontWeight="bold">
                    {counts.subTasks}
                  </Text>
                  <Text color="gray.400" fontSize="xs">Sub-Tasks</Text>
                </VStack>
              </HStack>
            </Flex>

            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search categories, activities, or tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.700"
                color="white"
                borderColor="gray.600"
                _placeholder={{ color: 'gray.400' }}
              />
            </InputGroup>
          </VStack>
        </CardHeader>
      </Card>

      {/* Hierarchy Tree */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          {treeData.length === 0 ? (
            <VStack spacing={4} py={8}>
              <Text color="gray.400" fontSize="lg">
                No master data found
              </Text>
              <Text color="gray.500" fontSize="sm" textAlign="center">
                Import master data or create categories to see the hierarchy.
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" spacing={1}>
              {treeData.map((category) => (
                <TreeNode 
                  key={category.id} 
                  node={category} 
                  searchTerm={searchTerm}
                  onEdit={handleEdit}
                  onView={handleView}
                />
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {searchTerm && (
        <Text color="gray.400" fontSize="sm" textAlign="center">
          {treeData.length > 0 
            ? `Found ${treeData.length} matching categories`
            : 'No matches found'
          }
        </Text>
      )}
    </VStack>
  );
};

export default MasterDataHierarchy;
