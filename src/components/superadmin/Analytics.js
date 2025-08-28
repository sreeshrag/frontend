import React, { useEffect, useState } from 'react';
import {
  Grid,
  GridItem,
  Box,
  Text,
  Card,
  CardBody,
  Table,
  Tbody,
  Td,
  TableContainer,
  Thead,
  Tr,
  Badge,
  Spinner,
  Center,
  Heading,
  Flex,
  VStack,
  HStack,
  Progress,
} from '@chakra-ui/react';
import { 
  FiTrendingUp, 
  FiDollarSign, 
  FiBriefcase, 
  FiUsers,
  FiActivity,
  FiPieChart,
} from 'react-icons/fi';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import api from '../../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/super-admin/analytics/subscriptions');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center minH="400px" bg="#0f1419">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.400" thickness="4px" />
          <Text color="gray.400" fontSize="lg">Loading Analytics...</Text>
        </VStack>
      </Center>
    );
  }

  const revenueData = analytics?.monthlyRevenue || [];
  const planData = analytics?.planDistribution || [];
  const statusData = analytics?.statusDistribution || [];

  // Premium Color Scheme
  const chartColors = {
    primary: '#22d3ee',
    secondary: '#a855f7',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gradients: [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ]
  };

  // Premium Stats Card Component
  const PremiumStatsCard = ({ title, value, subtitle, icon, gradient, trend }) => (
    <Card
      bg="linear-gradient(145deg, #1e2936 0%, #1a202c 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      boxShadow="0 20px 40px rgba(0,0,0,0.3)"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    >
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
              borderRadius="full"
              px={2}
              fontSize="xs"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
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
    </Card>
  );

  // Premium Chart Container
  const ChartContainer = ({ title, subtitle, children, fullWidth = false }) => (
    <Card
      bg="linear-gradient(145deg, #1e2936 0%, #1a202c 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      boxShadow="0 20px 40px rgba(0,0,0,0.3)"
      overflow="hidden"
    >
      <CardBody p={6}>
        <VStack align="start" mb={6} spacing={1}>
          <Heading size="lg" color="white" fontWeight="bold">
            {title}
          </Heading>
          {subtitle && (
            <Text color="gray.400" fontSize="sm">
              {subtitle}
            </Text>
          )}
        </VStack>
        {children}
      </CardBody>
    </Card>
  );

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Analytics Dashboard
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Comprehensive insights and performance metrics
        </Text>
      </VStack>

      {/* Premium Key Metrics */}
      <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6} mb={8}>
        <PremiumStatsCard
          title="Total Revenue"
          value={`$${revenueData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}`}
          subtitle="This month"
          icon={<FiDollarSign size={24} />}
          gradient="linear(135deg, #10b981, #059669)"
          trend={{ isPositive: true, value: 12.5 }}
        />
        <PremiumStatsCard
          title="Active Subscriptions"
          value={statusData.find(s => s.status === 'active')?.count || 0}
          subtitle="Currently active"
          icon={<FiBriefcase size={24} />}
          gradient="linear(135deg, #3b82f6, #1d4ed8)"
          trend={{ isPositive: true, value: 8.2 }}
        />
        <PremiumStatsCard
          title="Churn Rate"
          value={`${analytics?.churn?.last30Days || 0}%`}
          subtitle="Last 30 days"
          icon={<FiTrendingUp size={24} />}
          gradient="linear(135deg, #f59e0b, #d97706)"
          trend={{ isPositive: false, value: 2.1 }}
        />
        <PremiumStatsCard
          title="Avg Revenue/User"
          value="$45.20"
          subtitle="Monthly average"
          icon={<FiUsers size={24} />}
          gradient="linear(135deg, #8b5cf6, #7c3aed)"
          trend={{ isPositive: true, value: 5.7 }}
        />
      </Grid>

      {/* Premium Charts Section */}
      <Grid templateColumns={{ base: "1fr", xl: "2fr 1fr" }} gap={6} mb={8}>
        <ChartContainer 
          title="Revenue Trend" 
          subtitle="Monthly revenue performance over time"
        >
          <Box h="350px">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    color: '#fff'
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke={chartColors.primary}
                  strokeWidth={3}
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </ChartContainer>

        <ChartContainer 
          title="Plan Distribution" 
          subtitle="Current subscription breakdown"
        >
          <Box h="350px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="plan" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    color: '#fff'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={chartColors.secondary}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </ChartContainer>
      </Grid>

      {/* Premium Tables Section */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <ChartContainer title="Subscription Status" subtitle="Current status breakdown">
          <TableContainer>
            <Table variant="unstyled" size="md">
              <Thead>
                <Tr>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Status</Td>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Count</Td>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Percentage</Td>
                </Tr>
              </Thead>
              <Tbody>
                {statusData.map((item) => {
                  const total = statusData.reduce((sum, s) => sum + parseInt(s.count), 0);
                  const percentage = ((parseInt(item.count) / total) * 100).toFixed(1);
                  
                  return (
                    <Tr key={item.status} _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.2s">
                      <Td py={4}>
                        <Badge
                          colorScheme={
                            item.status === 'active' ? 'green' :
                            item.status === 'expired' ? 'red' : 'gray'
                          }
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {item.status}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <Text color="white" fontWeight="semibold">{item.count}</Text>
                      </Td>
                      <Td py={4}>
                        <VStack align="start" spacing={1}>
                          <Text color="white" fontWeight="semibold">{percentage}%</Text>
                          <Progress 
                            value={parseFloat(percentage)} 
                            size="sm" 
                            borderRadius="full"
                            w="60px"
                            colorScheme={item.status === 'active' ? 'green' : 'gray'}
                          />
                        </VStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ChartContainer>

        <ChartContainer title="Plan Performance" subtitle="Revenue impact by plan">
          <TableContainer>
            <Table variant="unstyled" size="md">
              <Thead>
                <Tr>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Plan</Td>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Users</Td>
                  <Td color="gray.400" fontWeight="bold" fontSize="sm" pb={4}>Revenue</Td>
                </Tr>
              </Thead>
              <Tbody>
                {planData.map((item) => {
                  const prices = { basic: 29.99, premium: 59.99, enterprise: 99.99, free_trial: 0 };
                  const revenue = parseInt(item.count) * (prices[item.plan] || 0);
                  
                  return (
                    <Tr key={item.plan} _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.2s">
                      <Td py={4}>
                        <Badge
                          colorScheme={
                            item.plan === 'enterprise' ? 'purple' :
                            item.plan === 'premium' ? 'blue' :
                            item.plan === 'basic' ? 'teal' : 'gray'
                          }
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="capitalize"
                        >
                          {item.plan.replace('_', ' ')}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <Text color="white" fontWeight="semibold">{item.count}</Text>
                      </Td>
                      <Td py={4}>
                        <Text color="white" fontWeight="bold">${revenue.toLocaleString()}</Text>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </ChartContainer>
      </Grid>
    </Box>
  );
};

export default Analytics;
