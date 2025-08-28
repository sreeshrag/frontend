import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  GridItem,
  Box,
  Text,
  Heading,
  Table,
  Tbody,
  Td,
  TableContainer,
  Thead,
  Tr,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Flex,
  Spinner,
  Center,
  useColorModeValue,
  ButtonGroup,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiBriefcase,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiSlash,
  FiCheckCircle,
  FiPackage,
  FiPause,
  FiPlay,
} from "react-icons/fi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import StatsCard from "./StatsCard";
import {
  fetchDashboardStats,
  fetchCompanies,
} from "../../store/slices/superAdminSlice";
import api from "../../services/api";
import toast from "react-hot-toast";

const SuperAdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, companies, loading } = useSelector(
    (state) => state.superAdmin
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [actionLoading, setActionLoading] = useState({});

  // Move ALL useColorModeValue calls to the top, before any conditional logic
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.600", "gray.400");
  const inputBg = useColorModeValue("white", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchCompanies({ page: 0, size: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (companies.items) {
      const filtered = companies.items.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [companies.items, searchTerm]);

  const setCompanyActionLoading = (companyId, isLoading) => {
    setActionLoading((prev) => ({
      ...prev,
      [companyId]: isLoading,
    }));
  };

  const handleToggleBlock = async (companyId, isBlocked) => {
    setCompanyActionLoading(companyId, true);
    try {
      const response = await api.put(
        `/super-admin/companies/${companyId}/toggle-block`,
        {
          reason: isBlocked ? "Unblocked by admin" : "Blocked by admin",
        }
      );

      toast.success(response.data.message);
      dispatch(fetchCompanies({ page: 0, size: 50 }));
    } catch (error) {
      toast.error("Failed to update company status");
    } finally {
      setCompanyActionLoading(companyId, false);
    }
  };

  const handleExtendSubscription = async (companyId) => {
    setCompanyActionLoading(companyId, true);
    try {
      const response = await api.put(
        `/super-admin/companies/${companyId}/subscription`,
        {
          action: "extend",
          duration: 1,
          durationUnit: "months",
        }
      );

      toast.success(response.data.message);
      dispatch(fetchCompanies({ page: 0, size: 50 }));
    } catch (error) {
      toast.error("Failed to extend subscription");
    } finally {
      setCompanyActionLoading(companyId, false);
    }
  };

  const handleReactivateCompany = async (companyId) => {
    setCompanyActionLoading(companyId, true);
    try {
      const response = await api.put(
        `/super-admin/companies/${companyId}/reactivate`,
        {
          reason: "Reactivated by admin",
        }
      );

      toast.success(response.data.message);
      dispatch(fetchCompanies({ page: 0, size: 50 }));
    } catch (error) {
      toast.error("Failed to reactivate company");
    } finally {
      setCompanyActionLoading(companyId, false);
    }
  };

  const handleSuspendCompany = async (companyId) => {
    setCompanyActionLoading(companyId, true);
    try {
      await api.put(
        `/super-admin/companies/${companyId}/subscription/suspend`,
        {
          reason: "Suspended by admin",
        }
      );

      toast.success("Company suspended successfully");
      dispatch(fetchCompanies({ page: 0, size: 50 }));
    } catch (error) {
      toast.error("Failed to suspend company");
    } finally {
      setCompanyActionLoading(companyId, false);
    }
  };

  const pieData = dashboardStats?.subscriptions
    ? [
        {
          name: "Active",
          value: dashboardStats.subscriptions.active,
          color: "#48bb78",
        },
        {
          name: "Trial",
          value: dashboardStats.subscriptions.trial,
          color: "#ed8936",
        },
        {
          name: "Expired",
          value: dashboardStats.subscriptions.expired,
          color: "#f56565",
        },
      ]
    : [];

  if (loading && !dashboardStats) {
    return (
      <Center minH="400px">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box p={6}>
      {/* Page Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color={textColor}>
          Super Admin Dashboard
        </Heading>
        <Text color={mutedColor} fontSize="lg">
          Manage companies, monitor performance, and track growth
        </Text>
      </VStack>

      {/* Stats Cards */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={6}
        mb={8}
      >
        <GridItem>
          <StatsCard
            title="Total Companies"
            value={dashboardStats?.overview?.totalCompanies || 0}
            icon={<FiBriefcase size={24} />}
            trend="up"
            trendValue="+12%"
            color="blue"
          />
        </GridItem>
        <GridItem>
          <StatsCard
            title="Active Users"
            value={dashboardStats?.overview?.totalUsers || 0}
            icon={<FiUsers size={24} />}
            trend="up"
            trendValue="+8%"
            color="green"
          />
        </GridItem>
        <GridItem>
          <StatsCard
            title="Monthly Revenue"
            value={`$${dashboardStats?.revenue?.total?.toFixed(2) || "0.00"}`}
            icon={<FiDollarSign size={24} />}
            trend="up"
            trendValue="+15%"
            color="purple"
          />
        </GridItem>
        <GridItem>
          <StatsCard
            title="Expiring Soon"
            value={dashboardStats?.subscriptions?.expiringSoon || 0}
            icon={<FiTrendingUp size={24} />}
            trend="down"
            trendValue="-3%"
            color="orange"
          />
        </GridItem>
      </Grid>

      {/* Charts Row */}
      <Grid
        templateColumns={{
          base: "1fr",
          lg: "2fr 1fr",
        }}
        gap={6}
        mb={8}
      >
        {/* Company Growth Chart */}
        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            rounded="xl"
            shadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <Heading size="md" mb={6} color={textColor}>
              Company Growth Trend
            </Heading>
            <Box h="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardStats?.growth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e0" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e0" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="#3182ce"
                    strokeWidth={3}
                    dot={{ fill: "#3182ce", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GridItem>

        {/* Subscription Distribution */}
        <GridItem>
          <Box
            bg={cardBg}
            p={6}
            rounded="xl"
            shadow="md"
            border="1px"
            borderColor={borderColor}
          >
            <Heading size="md" mb={6} color={textColor}>
              Subscription Distribution
            </Heading>
            <Box h="200px" mb={4}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            <VStack spacing={2} align="start">
              {pieData.map((entry, index) => (
                <HStack key={index} spacing={2}>
                  <Box w={3} h={3} bg={entry.color} rounded="sm" />
                  <Text fontSize="sm" color={textColor}>
                    {entry.name}:{" "}
                    <Text as="span" fontWeight="semibold">
                      {entry.value}
                    </Text>
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Companies Management */}
      <Box
        bg={cardBg}
        p={6}
        rounded="xl"
        shadow="md"
        border="1px"
        borderColor={borderColor}
      >
        {/* Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={6}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Heading size="md" color={textColor}>
            Companies Management
          </Heading>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray" />
            </InputLeftElement>
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={inputBg}
              border="1px"
              borderColor={borderColor}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
            />
          </InputGroup>
        </Flex>

        {/* Companies Table */}
        <TableContainer>
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Company
                </Td>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Plan
                </Td>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Status
                </Td>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Days Remaining
                </Td>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Users
                </Td>
                <Td fontWeight="bold" color={mutedColor} fontSize="sm">
                  Actions
                </Td>
              </Tr>
            </Thead>
            <Tbody>
              {filteredCompanies.map((company) => (
                <Tr key={company.id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color={textColor}>
                        {company.name}
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        {company.email}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        company.Subscription?.plan === "enterprise"
                          ? "purple"
                          : "gray"
                      }
                      variant="subtle"
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                    >
                      {company.Subscription?.plan || "No Plan"}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={
                        company.isBlocked
                          ? "red"
                          : company.status === "active"
                          ? "green"
                          : "gray"
                      }
                      variant="subtle"
                      px={2}
                      py={1}
                      rounded="md"
                      fontSize="xs"
                    >
                      {company.isBlocked ? "Blocked" : company.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color={textColor}>
                      {company.subscriptionStatus?.daysRemaining > 0
                        ? `${company.subscriptionStatus.daysRemaining} days`
                        : company.subscriptionStatus?.isExpired
                        ? "Expired"
                        : "N/A"}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      {company.Users?.length || 0}
                    </Text>
                  </Td>
                  <Td>
                    <ButtonGroup size="sm" variant="outline" spacing={2}>
                      {/* Block/Unblock Button */}
                      <Tooltip
                        label={
                          company.isBlocked
                            ? "Unblock Company"
                            : "Block Company"
                        }
                      >
                        <Button
                          colorScheme={company.isBlocked ? "green" : "red"}
                          leftIcon={
                            company.isBlocked ? <FiCheckCircle /> : <FiSlash />
                          }
                          onClick={() =>
                            handleToggleBlock(company.id, company.isBlocked)
                          }
                          isLoading={actionLoading[company.id]}
                          size="sm"
                        >
                          {company.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </Tooltip>

                      {/* Suspend/Reactivate Button */}
                      {company.status === "suspended" ? (
                        <Tooltip label="Reactivate Company">
                          <Button
                            colorScheme="green"
                            leftIcon={<FiPlay />}
                            onClick={() => handleReactivateCompany(company.id)}
                            isLoading={actionLoading[company.id]}
                            size="sm"
                          >
                            Reactivate
                          </Button>
                        </Tooltip>
                      ) : (
                        company.status === "active" &&
                        !company.isBlocked && (
                          <Tooltip label="Suspend Company">
                            <Button
                              colorScheme="orange"
                              leftIcon={<FiPause />}
                              onClick={() => handleSuspendCompany(company.id)}
                              isLoading={actionLoading[company.id]}
                              size="sm"
                            >
                              Suspend
                            </Button>
                          </Tooltip>
                        )
                      )}

                      {/* Extend Subscription Button */}
                      <Tooltip label="Extend Subscription">
                        <Button
                          colorScheme="blue"
                          leftIcon={<FiPackage />}
                          onClick={() => handleExtendSubscription(company.id)}
                          isLoading={actionLoading[company.id]}
                          size="sm"
                        >
                          Extend
                        </Button>
                      </Tooltip>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Empty State */}
        {filteredCompanies.length === 0 && (
          <Center py={10}>
            <VStack spacing={3}>
              <FiBriefcase size={48} color="gray" />
              <Text fontSize="lg" color={mutedColor}>
                {searchTerm ? "No companies found" : "No companies available"}
              </Text>
              {searchTerm && (
                <Text fontSize="sm" color={mutedColor}>
                  Try adjusting your search terms
                </Text>
              )}
            </VStack>
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminDashboard;
