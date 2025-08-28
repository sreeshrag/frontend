import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid,
  GridItem,
  Box,
  Text,
  Table,
  Tbody,
  Td,
  TableContainer,
  Thead,
  Tr,
  Badge,
  Progress,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Flex,
  Heading,
  Card,
  CardBody,
  Spinner,
  Center,
  Icon,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiUserPlus,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
  FiCalendar,
  FiBarChart,
  FiBriefcase,
} from 'react-icons/fi';

import { fetchDashboardStats } from '../../store/slices/companySlice';

const CompanyDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.company);
  const { user, company, subscription } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const subscriptionStatus = subscription || dashboardStats?.subscription;
  const isExpiringSoon = subscriptionStatus?.daysRemaining <= 7 && subscriptionStatus?.daysRemaining > 0;
  const isExpired = subscriptionStatus?.isExpired;

  // Premium Card Component
  const PremiumCard = ({ children, gradient, ...props }) => (
    <Card
      bg="linear-gradient(145deg, #1e2936 0%, #1a202c 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      boxShadow="0 20px 40px rgba(0,0,0,0.3)"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      {...props}
    >
      {gradient && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="4px"
          bgGradient={gradient}
        />
      )}
      {children}
    </Card>
  );

  // Premium Stats Card Component
  const PremiumStatsCard = ({ title, value, subtitle, icon, gradient, trend }) => (
    <PremiumCard gradient={gradient}>
      <CardBody p={6}>
        <HStack justify="space-between" mb={4}>
          <Box
            w={12}
            h={12}
            borderRadius="xl"
            bgGradient={gradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            boxShadow="0 8px 32px rgba(34, 211, 238, 0.3)"
          >
            {icon}
          </Box>
          {trend && (
            <Badge
              colorScheme={trend.isPositive ? "green" : "red"}
              variant="solid"
              borderRadius="full"
              px={2}
              fontSize="xs"
              fontWeight="bold"
            >
              {trend.isPositive ? '+' : ''}{trend.value}
            </Badge>
          )}
        </HStack>
        
        <VStack align="start" spacing={2}>
          <Text color="gray.400" fontSize="sm" fontWeight="medium" letterSpacing="wide">
            {title}
          </Text>
          <Text color="white" fontSize="3xl" fontWeight="black" lineHeight={1}>
            {value}
          </Text>
          {subtitle && (
            <Text color="gray.500" fontSize="xs">
              {subtitle}
            </Text>
          )}
        </VStack>
      </CardBody>
    </PremiumCard>
  );

  // Quick Action Item Component
  const QuickActionItem = ({ icon, title, description, color }) => (
    <HStack
      spacing={4}
      p={4}
      bg="whiteAlpha.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      _hover={{ bg: 'whiteAlpha.100' }}
      transition="all 0.2s"
      cursor="pointer"
    >
      <Box
        w={10}
        h={10}
        borderRadius="xl"
        bg={`${color}.500`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="white"
        flexShrink={0}
      >
        {icon}
      </Box>
      <VStack align="start" spacing={0} flex="1">
        <Text color="white" fontSize="sm" fontWeight="bold">
          {title}
        </Text>
        <Text color="gray.400" fontSize="xs">
          {description}
        </Text>
      </VStack>
      <Icon as={FiArrowRight} color="gray.400" />
    </HStack>
  );

  if (loading && !dashboardStats) {
    return (
      <Center minH="400px" bg="#0f1419">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.400" thickness="4px" />
          <Text color="gray.400" fontSize="lg">Loading dashboard...</Text>
        </VStack>
      </Center>
    );
  }

  const userUsagePercentage = Math.min((dashboardStats?.users?.total || 0) / (company?.maxUsers || 1) * 100, 100);
  const activeUsagePercentage = Math.min((dashboardStats?.users?.active || 0) / (dashboardStats?.users?.total || 1) * 100, 100);

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Welcome back, {user?.firstName}!
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Here's what's happening with your company today.
        </Text>
      </VStack>

      <VStack spacing={8} align="stretch">
        {/* Premium Alerts */}
        {isExpired && (
          <Alert
            status="error"
            borderRadius="xl"
            bg="rgba(239, 68, 68, 0.1)"
            border="1px solid"
            borderColor="red.800"
            color="white"
          >
            <AlertIcon color="red.400" />
            <Box>
              <Text fontWeight="bold" color="red.400">Subscription Expired</Text>
              <Text fontSize="sm" color="gray.300">Your subscription has expired. Please contact support to renew your access.</Text>
            </Box>
          </Alert>
        )}
        
        {isExpiringSoon && !isExpired && (
          <Alert
            status="warning"
            borderRadius="xl"
            bg="rgba(245, 158, 11, 0.1)"
            border="1px solid"
            borderColor="orange.800"
            color="white"
          >
            <AlertIcon color="orange.400" />
            <Box>
              <Text fontWeight="bold" color="orange.400">Subscription Expiring Soon</Text>
              <Text fontSize="sm" color="gray.300">Your subscription expires in {subscriptionStatus.daysRemaining} days. Please renew to avoid service interruption.</Text>
            </Box>
          </Alert>
        )}

        {/* Premium Stats Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
          <PremiumStatsCard
            title="Total Users"
            value={dashboardStats?.users?.total || 0}
            subtitle="Registered team members"
            icon={<FiUsers size={24} />}
            gradient="linear(135deg, #22d3ee, #0891b2)"
            trend={{ isPositive: true, value: '+2' }}
          />
          <PremiumStatsCard
            title="Active Users"
            value={dashboardStats?.users?.active || 0}
            subtitle="Currently active"
            icon={<FiUserPlus size={24} />}
            gradient="linear(135deg, #10b981, #059669)"
            trend={{ isPositive: true, value: '5%' }}
          />
          <PremiumStatsCard
            title="Recent Logins"
            value={dashboardStats?.users?.recentLogins || 0}
            subtitle="Last 24 hours"
            icon={<FiClock size={24} />}
            gradient="linear(135deg, #f59e0b, #d97706)"
            trend={{ isPositive: true, value: '8%' }}
          />
          <PremiumStatsCard
            title="Administrators"
            value={dashboardStats?.users?.admins || 0}
            subtitle="Admin users"
            icon={<FiShield size={24} />}
            gradient="linear(135deg, #8b5cf6, #7c3aed)"
          />
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
          {/* Subscription Analytics */}
          <PremiumCard gradient="linear(135deg, #3b82f6, #1d4ed8)">
            <CardBody p={8}>
              <HStack justify="space-between" mb={6}>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="white" fontWeight="bold">
                    Subscription Analytics
                  </Heading>
                  <Text color="gray.400" fontSize="sm">
                    Current plan performance
                  </Text>
                </VStack>
                <Icon as={FiBarChart} color="blue.400" size="24px" />
              </HStack>

              <Divider borderColor="whiteAlpha.200" mb={6} />

              {subscriptionStatus ? (
                <VStack spacing={6} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.300" fontWeight="medium">Plan Type:</Text>
                    <Badge 
                      colorScheme={
                        subscriptionStatus.plan === 'enterprise' ? 'purple' :
                        subscriptionStatus.plan === 'premium' ? 'blue' : 'teal'
                      }
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      {subscriptionStatus.plan}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.300" fontWeight="medium">Status:</Text>
                    <Badge 
                      colorScheme={subscriptionStatus.status === 'active' ? 'green' : 'red'}
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                      fontWeight="bold"
                      textTransform="capitalize"
                    >
                      {subscriptionStatus.status}
                    </Badge>
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.300" fontWeight="medium">Days Remaining:</Text>
                    <Text fontSize="sm" fontWeight="bold" color="white">
                      {subscriptionStatus.daysRemaining > 0 ? `${subscriptionStatus.daysRemaining} days` : 'Expired'}
                    </Text>
                  </HStack>
                  
                  <Box
                    p={4}
                    bg="whiteAlpha.100"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                  >
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.300" fontWeight="medium">User Capacity:</Text>
                        <Text fontSize="sm" color="white" fontWeight="bold">
                          {dashboardStats?.users?.total || 0} / {company?.maxUsers || 0}
                        </Text>
                      </HStack>
                      <Box>
                        <HStack justify="space-between" mb={2}>
                          <Text fontSize="xs" color="gray.400">Usage</Text>
                          <Text fontSize="xs" color="gray.400">{Math.round(userUsagePercentage)}%</Text>
                        </HStack>
                        <Progress 
                          value={userUsagePercentage}
                          colorScheme="cyan"
                          size="lg"
                          borderRadius="full"
                          bg="whiteAlpha.300"
                        />
                      </Box>
                    </VStack>
                  </Box>
                </VStack>
              ) : (
                <Center py={8}>
                  <VStack spacing={3}>
                    <Icon as={FiAlertTriangle} color="gray.500" size="32px" />
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                      No subscription information available
                    </Text>
                  </VStack>
                </Center>
              )}
            </CardBody>
          </PremiumCard>

          {/* Quick Actions */}
          <PremiumCard gradient="linear(135deg, #10b981, #059669)">
            <CardBody p={8}>
              <HStack justify="space-between" mb={6}>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" color="white" fontWeight="bold">
                    Quick Actions
                  </Heading>
                  <Text color="gray.400" fontSize="sm">
                    Common management tasks
                  </Text>
                </VStack>
                <Icon as={FiActivity} color="green.400" size="24px" />
              </HStack>

              <Divider borderColor="whiteAlpha.200" mb={6} />

              <VStack spacing={4} align="stretch">
                <QuickActionItem
                  icon={<FiUsers size={18} />}
                  title="Manage Users"
                  description="Add, edit, or remove team members"
                  color="blue"
                />
                <QuickActionItem
                  icon={<FiBriefcase size={18} />}
                  title="Company Profile"
                  description="Update business information"
                  color="purple"
                />
                <QuickActionItem
                  icon={<FiBarChart size={18} />}
                  title="View Analytics"
                  description="Monitor usage and performance"
                  color="orange"
                />
                <QuickActionItem
                  icon={<FiCalendar size={18} />}
                  title="Subscription"
                  description="Manage billing and plans"
                  color="teal"
                />
              </VStack>
            </CardBody>
          </PremiumCard>
        </Grid>

        {/* Company Metrics Overview */}
        <PremiumCard>
          <CardBody p={8}>
            <HStack justify="space-between" mb={8}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white" fontWeight="bold">
                  Company Metrics
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  Detailed usage analytics and performance indicators
                </Text>
              </VStack>
              <Icon as={FiTrendingUp} color="gray.400" size="24px" />
            </HStack>

            <Divider borderColor="whiteAlpha.200" mb={8} />

            <Box
              bg="whiteAlpha.30"
              borderRadius="xl"
              p={1}
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <TableContainer>
                <Table variant="unstyled" size="md">
                  <Thead>
                    <Tr>
                      <Td color="gray.400" fontWeight="bold" py={4}>Metric</Td>
                      <Td color="gray.400" fontWeight="bold">Current</Td>
                      <Td color="gray.400" fontWeight="bold">Limit</Td>
                      <Td color="gray.400" fontWeight="bold">Usage</Td>
                      <Td color="gray.400" fontWeight="bold">Status</Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr _hover={{ bg: 'whiteAlpha.50' }}>
                      <Td py={6}>
                        <HStack spacing={3}>
                          <Icon as={FiUsers} color="blue.400" />
                          <Text fontWeight="bold" color="white">Total Users</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text color="white" fontSize="lg" fontWeight="bold">{dashboardStats?.users?.total || 0}</Text>
                      </Td>
                      <Td>
                        <Text color="white" fontSize="lg" fontWeight="bold">{company?.maxUsers || 0}</Text>
                      </Td>
                      <Td>
                        <Box w="120px">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.400">Usage</Text>
                            <Text fontSize="xs" color="gray.400">{Math.round(userUsagePercentage)}%</Text>
                          </HStack>
                          <Progress 
                            value={userUsagePercentage}
                            colorScheme="blue"
                            size="md"
                            borderRadius="full"
                            bg="whiteAlpha.300"
                          />
                        </Box>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={userUsagePercentage < 80 ? "green" : userUsagePercentage < 95 ? "yellow" : "red"}
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {userUsagePercentage < 80 ? "Healthy" : userUsagePercentage < 95 ? "Warning" : "Critical"}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr _hover={{ bg: 'whiteAlpha.50' }}>
                      <Td py={6}>
                        <HStack spacing={3}>
                          <Icon as={FiCheckCircle} color="green.400" />
                          <Text fontWeight="bold" color="white">Active Users</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text color="white" fontSize="lg" fontWeight="bold">{dashboardStats?.users?.active || 0}</Text>
                      </Td>
                      <Td>
                        <Text color="white" fontSize="lg" fontWeight="bold">{dashboardStats?.users?.total || 0}</Text>
                      </Td>
                      <Td>
                        <Box w="120px">
                          <HStack justify="space-between" mb={1}>
                            <Text fontSize="xs" color="gray.400">Activity</Text>
                            <Text fontSize="xs" color="gray.400">{Math.round(activeUsagePercentage)}%</Text>
                          </HStack>
                          <Progress 
                            value={activeUsagePercentage}
                            colorScheme="green"
                            size="md"
                            borderRadius="full"
                            bg="whiteAlpha.300"
                          />
                        </Box>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={activeUsagePercentage > 70 ? "green" : activeUsagePercentage > 50 ? "yellow" : "red"}
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {activeUsagePercentage > 70 ? "Excellent" : activeUsagePercentage > 50 ? "Good" : "Low"}
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </CardBody>
        </PremiumCard>
      </VStack>
    </Box>
  );
};

export default CompanyDashboard;
