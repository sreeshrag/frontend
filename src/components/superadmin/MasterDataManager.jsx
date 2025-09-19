import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  VStack,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FiPlus,
  FiUpload,
  FiDownload,
  FiSettings,
  FiBarChart,
  FiLayers,
  FiList,
  FiPackage
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import MasterCategoryManager from './MasterCategoryManager';
import MasterActivityManager from './MasterActivityManager';
import MasterSubTaskManager from './MasterSubTaskManager';
import MasterDataHierarchy from './MasterDataHierarchy';
import MasterDataImportExport from './MasterDataImportExport';
import toast from 'react-hot-toast';

const MasterDataManager = () => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // ✅ FIXED: Move useEffect to top level (unconditional)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ FIXED: Check user role after hooks
  if (user?.role !== 'super_admin') {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Access denied. This section is only available to Super Administrators.
        </Alert>
      </Container>
    );
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    setTabLoading(true);
    try {
      const [statsResponse, hierarchyResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/super-admin/master/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/super-admin/master/hierarchy`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      const [statsData, hierarchyData] = await Promise.all([
        statsResponse.json(),
        hierarchyResponse.json()
      ]);

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (hierarchyData.success) {
        setHierarchyData(hierarchyData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setTabLoading(false);
      }, 500);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
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
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="white">
              Master Data Management
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Manage construction categories, activities, and tasks for all companies
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Button
              leftIcon={<FiUpload />}
              variant="outline"
              onClick={() => setActiveTab(4)}
            >
              Import Data
            </Button>
            <Button
              leftIcon={<FiDownload />}
              variant="outline"
              onClick={() => setActiveTab(4)}
            >
              Export Data
            </Button>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => setActiveTab(1)}
            >
              Add Category
            </Button>
          </HStack>
        </Flex>

        {/* Statistics Cards */}
        {stats && (
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiLayers /> Categories
                  </StatLabel>
                  <StatNumber color="white">{stats.totals.categories}</StatNumber>
                  <StatHelpText color="gray.400">
                    +{stats.recent.categories} this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiList /> Activities
                  </StatLabel>
                  <StatNumber color="white">{stats.totals.activities}</StatNumber>
                  <StatHelpText color="gray.400">
                    +{stats.recent.activities} this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiPackage /> Sub-Tasks
                  </StatLabel>
                  <StatNumber color="white">{stats.totals.subTasks}</StatNumber>
                  <StatHelpText color="gray.400">
                    +{stats.recent.subTasks} this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg="gray.800" borderColor="gray.700">
              <CardBody>
                <Stat>
                  <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
                    <FiBarChart /> Total Items
                  </StatLabel>
                  <StatNumber color="white">{stats.totals.total}</StatNumber>
                  <StatHelpText color="gray.400">
                    <Badge colorScheme="green">+{stats.recent.total} recent</Badge>
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </Grid>
        )}

        {/* Main Content Tabs */}
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          index={activeTab} 
          onChange={(index) => {
            setTabLoading(true);
            setActiveTab(index);
            // Give components time to mount and load data
            setTimeout(() => {
              setTabLoading(false);
            }, 800);
          }}
        >
          <TabList bg="gray.800" borderColor="gray.700">
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>
              <HStack spacing={2}>
                <FiBarChart />
                <Text>Overview</Text>
              </HStack>
            </Tab>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>
              <HStack spacing={2}>
                <FiLayers />
                <Text>Categories</Text>
              </HStack>
            </Tab>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>
              <HStack spacing={2}>
                <FiList />
                <Text>Activities</Text>
              </HStack>
            </Tab>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>
              <HStack spacing={2}>
                <FiPackage />
                <Text>Sub-Tasks</Text>
              </HStack>
            </Tab>
            <Tab color="gray.300" _selected={{ color: "white", bg: "blue.600" }}>
              <HStack spacing={2}>
                <FiSettings />
                <Text>Import/Export</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel px={0}>
              {tabLoading ? (
                <Box p={8}>
                  <Flex justify="center" align="center" direction="column" gap={4}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                    <Text color="gray.400" fontSize="lg">Loading Overview...</Text>
                  </Flex>
                </Box>
              ) : (
                <MasterDataHierarchy 
                  hierarchyData={hierarchyData} 
                  onDataChange={refreshData}
                />
              )}
            </TabPanel>

            {/* Categories Tab */}
            <TabPanel px={0}>
              {tabLoading ? (
                <Box p={8}>
                  <Flex justify="center" align="center" direction="column" gap={4}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                    <Text color="gray.400" fontSize="lg">Loading Categories...</Text>
                  </Flex>
                </Box>
              ) : (
                <MasterCategoryManager 
                  onDataChange={refreshData}
                />
              )}
            </TabPanel>

            {/* Activities Tab */}
            <TabPanel px={0}>
              {tabLoading ? (
                <Box p={8}>
                  <Flex justify="center" align="center" direction="column" gap={4}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                    <Text color="gray.400" fontSize="lg">Loading Activities...</Text>
                  </Flex>
                </Box>
              ) : (
                <MasterActivityManager 
                  categories={hierarchyData}
                  onDataChange={refreshData}
                />
              )}
            </TabPanel>

            {/* Sub-Tasks Tab */}
            <TabPanel px={0}>
              {tabLoading ? (
                <Box p={8}>
                  <Flex justify="center" align="center" direction="column" gap={4}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                    <Text color="gray.400" fontSize="lg">Loading Sub-Tasks...</Text>
                  </Flex>
                </Box>
              ) : (
                <MasterSubTaskManager 
                  categories={hierarchyData}
                  onDataChange={refreshData}
                />
              )}
            </TabPanel>

            {/* Import/Export Tab */}
            <TabPanel px={0}>
              {tabLoading ? (
                <Box p={8}>
                  <Flex justify="center" align="center" direction="column" gap={4}>
                    <Spinner size="xl" color="blue.400" thickness="4px" />
                    <Text color="gray.400" fontSize="lg">Loading Import/Export...</Text>
                  </Flex>
                </Box>
              ) : (
                <MasterDataImportExport 
                  onDataChange={refreshData}
                />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default MasterDataManager;
