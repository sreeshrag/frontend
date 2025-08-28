import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Table, Tbody, Td, TableContainer, Thead, Tr, HStack, Input,
  InputGroup, Button, Text, Badge, Modal, ModalHeader, ModalBody, ModalFooter,
  Grid, GridItem, Card, CardBody, FormControl, FormLabel, Select, ModalOverlay,
  ModalContent, ModalCloseButton, InputLeftElement, Flex, Heading, VStack,
  useColorModeValue, Spinner, Center, ButtonGroup, Tooltip
} from '@chakra-ui/react';
import {
  FiSearch, FiSlash, FiCheckCircle, FiPackage, FiBriefcase, FiClock,
  FiPause, FiPlay
} from 'react-icons/fi';

import { fetchCompanies } from '../../store/slices/superAdminSlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CompaniesManagement = () => {
  const dispatch = useDispatch();
  const { companies, loading } = useSelector((state) => state.superAdmin);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extensionDuration, setExtensionDuration] = useState(1);
  const [extensionUnit, setExtensionUnit] = useState('months');
  const [actionLoading, setActionLoading] = useState({});

  // Premium Palette
  const cardBg = useColorModeValue('gray.900', 'gray.900');
  const borderColor = useColorModeValue('whiteAlpha.100', 'whiteAlpha.200');
  const textColor = useColorModeValue('gray.100', 'gray.100');
  const mutedColor = useColorModeValue('gray.400', 'gray.400');
  const hoverBg = useColorModeValue('gray.800', 'gray.800');
  const cardAccent = {
    total: 'linear-gradient(135deg, #5eead4, #3b82f6)',
    active: 'linear-gradient(135deg, #4ade80, #22d3ee)',
    blocked: 'linear-gradient(135deg, #f87171, #fbbf24)',
    suspended: 'linear-gradient(135deg, #fb923c, #f59e42)'
  };

  useEffect(() => {
    fetchCompaniesData();
  }, [page, rowsPerPage, searchTerm, statusFilter, planFilter]);

  const fetchCompaniesData = () => {
    const params = {
      page,
      size: rowsPerPage,
      search: searchTerm,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(planFilter !== 'all' && { plan: planFilter }),
    };
    dispatch(fetchCompanies(params));
  };

  const setCompanyActionLoading = (companyId, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [companyId]: isLoading
    }));
  };

  const handleChangePage = (newPage) => { setPage(newPage); };

  const handleToggleBlock = async (company) => {
    setCompanyActionLoading(company.id, true);
    try {
      const response = await api.put(`/super-admin/companies/${company.id}/toggle-block`, {
        reason: company.isBlocked ? 'Unblocked by admin' : 'Blocked by admin'
      });
      toast.success(response.data.message);
      fetchCompaniesData();
    } catch {
      toast.error('Failed to update company status');
    } finally {
      setCompanyActionLoading(company.id, false);
    }
  };

  const handleSuspendCompany = async (company) => {
    setCompanyActionLoading(company.id, true);
    try {
      await api.put(`/super-admin/companies/${company.id}/subscription/suspend`, {
        reason: 'Suspended by admin'
      });
      toast.success('Company suspended successfully');
      fetchCompaniesData();
    } catch {
      toast.error('Failed to suspend company');
    } finally {
      setCompanyActionLoading(company.id, false);
    }
  };

  const handleReactivateCompany = async (company) => {
    setCompanyActionLoading(company.id, true);
    try {
      const response = await api.put(`/super-admin/companies/${company.id}/reactivate`, {
        reason: 'Reactivated by admin'
      });
      toast.success(response.data.message);
      fetchCompaniesData();
    } catch {
      toast.error('Failed to reactivate company');
    } finally {
      setCompanyActionLoading(company.id, false);
    }
  };

  const handleExtendSubscription = async () => {
    try {
      const response = await api.put(`/super-admin/companies/${selectedCompany.id}/subscription`, {
        action: 'extend',
        duration: extensionDuration,
        durationUnit: extensionUnit
      });
      toast.success(response.data.message);
      fetchCompaniesData();
      setExtendDialogOpen(false);
    } catch {
      toast.error('Failed to extend subscription');
    }
  };

  // Styled badges
  const getStatusColorScheme = (company) => {
    if (company.isBlocked) return 'red';
    if (company.status === 'active') return 'green';
    if (company.status === 'suspended') return 'orange';
    return 'gray';
  };

  const getPlanColorScheme = (plan) => {
    switch (plan) {
      case 'enterprise': return 'purple';
      case 'premium': return 'blue';
      case 'basic': return 'teal';
      case 'free_trial': return 'orange';
      default: return 'gray';
    }
  };

  // Premium row for stats
  const StatCard = ({ icon, label, value, gradient }) => (
    <Card bg={cardBg} boxShadow="lg" borderRadius="2xl" border="none">
      <CardBody>
        <Flex align="center">
          <Box
            p={3}
            borderRadius="full"
            bgGradient={gradient}
            mr={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {icon}
          </Box>
          <Box>
            <Text fontSize="sm" color={mutedColor} mb={1} fontWeight="medium" textTransform="uppercase" letterSpacing="widest">{label}</Text>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>{value}</Text>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <Box p={6} bg="#171C23" borderRadius="2xl">
      <Heading size="lg" mb={6} color="white" fontWeight="extrabold" letterSpacing="tight">
        Companies Management
      </Heading>

      {/* PREMIUM STATS CARDS */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} mb={8}>
        <StatCard
          icon={<FiBriefcase size={24} color="#fff" />}
          label="Total Companies"
          value={companies.totalItems || 0}
          gradient={cardAccent.total}
        />
        <StatCard
          icon={<FiCheckCircle size={24} color="#fff" />}
          label="Active Companies"
          value={companies.items?.filter(c => c.status === 'active' && !c.isBlocked).length || 0}
          gradient={cardAccent.active}
        />
        <StatCard
          icon={<FiSlash size={24} color="#fff" />}
          label="Blocked Companies"
          value={companies.items?.filter(c => c.isBlocked).length || 0}
          gradient={cardAccent.blocked}
        />
        <StatCard
          icon={<FiClock size={24} color="#fff" />}
          label="Suspended Companies"
          value={companies.items?.filter(c => c.status === 'suspended').length || 0}
          gradient={cardAccent.suspended}
        />
      </Grid>

      {/* FILTERS */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={4}
        bg="#161B22"
        borderRadius="lg"
        p={6}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color={mutedColor} />
          </InputLeftElement>
          <Input
            bg="gray.800"
            borderColor="whiteAlpha.100"
            placeholder="Search companies..."
            value={searchTerm}
            color="white"
            onChange={(e) => setSearchTerm(e.target.value)}
            _placeholder={{ color: "gray.500" }}
          />
        </InputGroup>
        <HStack spacing={4}>
          <FormControl minW="120px">
            <FormLabel fontSize="sm" color="gray.400">Status</FormLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="sm"
              bg="gray.800"
              color="white"
              borderColor="whiteAlpha.100"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FormControl>
          <FormControl minW="120px">
            <FormLabel fontSize="sm" color="gray.400">Plan</FormLabel>
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              size="sm"
              bg="gray.800"
              color="white"
              borderColor="whiteAlpha.100"
            >
              <option value="all">All Plans</option>
              <option value="free_trial">Free Trial</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </Select>
          </FormControl>
        </HStack>
      </Flex>

      {/* COMPANIES TABLE PREMIUM */}
      <Box
        px={{ base: 2, md: 0 }}
        py={3}
        bg="#171C23"
        rounded="2xl"
        shadow="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <TableContainer>
          <Table variant="unstyled">
            <Thead>
              <Tr>
                <Td fontWeight="600" color="gray.400" py={3}>Company</Td>
                <Td fontWeight="600" color="gray.400">Plan</Td>
                <Td fontWeight="600" color="gray.400">Status</Td>
                <Td fontWeight="600" color="gray.400">Users</Td>
                <Td fontWeight="600" color="gray.400">Subscription</Td>
                <Td fontWeight="600" color="gray.400">Created</Td>
                <Td fontWeight="600" color="gray.400">Actions</Td>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={7}>
                    <Center py={8}>
                      <Spinner size="lg" color="blue.400" />
                    </Center>
                  </Td>
                </Tr>
              ) : companies.items?.length === 0 ? (
                <Tr>
                  <Td colSpan={7}>
                    <Center py={8}>
                      <Text color={mutedColor}>No companies found</Text>
                    </Center>
                  </Td>
                </Tr>
              ) : (
                companies.items?.map((company) => (
                  <Tr key={company.id}
                      bg="transparent"
                      _hover={{ bg: "rgba(18, 27, 39, 0.96)" }}
                      style={{ transition: "background 0.2s" }}
                  >
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" color="white" fontSize="md">
                          {company.name}
                        </Text>
                        <Text fontSize="xs" color={mutedColor}>
                          {company.email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        borderRadius="full"
                        px={2}
                        fontWeight="bold"
                        colorScheme={getPlanColorScheme(company.Subscription?.plan)}
                        variant="subtle"
                        fontSize="sm"
                        textTransform="capitalize"
                      >
                        {company.Subscription?.plan || 'No Plan'}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        borderRadius="xl"
                        px={2}
                        fontWeight="bold"
                        colorScheme={getStatusColorScheme(company)}
                        variant="solid"
                        fontSize="sm"
                        textTransform="capitalize"
                      >
                        {company.isBlocked ? 'Blocked' : company.status}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="white">
                          {company.Users?.length || 0} users
                        </Text>
                        <Text fontSize="xs" color={mutedColor}>
                          Max: {company.maxUsers}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      {company.subscriptionStatus ? (
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="white">
                            {company.subscriptionStatus.daysRemaining > 0
                              ? `${company.subscriptionStatus.daysRemaining} days left`
                              : company.subscriptionStatus.isExpired ? 'Expired' : 'Active'
                            }
                          </Text>
                          <Text fontSize="xs" color={mutedColor}>
                            {company.Subscription?.endDate
                              ? new Date(company.Subscription.endDate).toLocaleDateString() : 'N/A'
                            }
                          </Text>
                        </VStack>
                      ) : (
                        <Text fontSize="sm" color="gray.500">No subscription</Text>
                      )}
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="white">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <ButtonGroup size="sm" variant="outline" spacing={2}>
                        <Tooltip label={company.isBlocked ? 'Unblock Company' : 'Block Company'} >
                          <Button
                            borderRadius="xl"
                            colorScheme={company.isBlocked ? "green" : "red"}
                            leftIcon={company.isBlocked ? <FiCheckCircle /> : <FiSlash />}
                            onClick={() => handleToggleBlock(company)}
                            isLoading={actionLoading[company.id]}
                          >
                            {company.isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        </Tooltip>
                        {company.status === 'suspended' ? (
                          <Tooltip label="Reactivate Company">
                            <Button
                              borderRadius="xl"
                              colorScheme="green"
                              leftIcon={<FiPlay />}
                              onClick={() => handleReactivateCompany(company)}
                              isLoading={actionLoading[company.id]}
                            >
                              Reactivate
                            </Button>
                          </Tooltip>
                        ) : company.status === 'active' && !company.isBlocked && (
                          <Tooltip label="Suspend Company">
                            <Button
                              borderRadius="xl"
                              colorScheme="orange"
                              leftIcon={<FiPause />}
                              onClick={() => handleSuspendCompany(company)}
                              isLoading={actionLoading[company.id]}
                            >
                              Suspend
                            </Button>
                          </Tooltip>
                        )}
                        <Tooltip label="Extend Subscription">
                          <Button
                            borderRadius="xl"
                            colorScheme="blue"
                            leftIcon={<FiPackage />}
                            onClick={() => {
                              setSelectedCompany(company);
                              setExtendDialogOpen(true);
                            }}
                            isLoading={actionLoading[company.id]}
                          >
                            Extend
                          </Button>
                        </Tooltip>
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <HStack justify="space-between" align="center" mt={6}>
          <Text fontSize="sm" color={mutedColor}>
            Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, companies.totalItems || 0)} of {companies.totalItems || 0} results
          </Text>
          <HStack>
            <Button
              size="sm"
              borderRadius="xl"
              colorScheme="whiteAlpha"
              variant="outline"
              onClick={() => handleChangePage(page - 1)}
              isDisabled={page === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              borderRadius="xl"
              colorScheme="whiteAlpha"
              variant="outline"
              onClick={() => handleChangePage(page + 1)}
              isDisabled={(page + 1) * rowsPerPage >= (companies.totalItems || 0)}
            >
              Next
            </Button>
          </HStack>
        </HStack>
      </Box>

      {/* Extend Subscription Dialog */}
      <Modal isOpen={extendDialogOpen} onClose={() => setExtendDialogOpen(false)}>
        <ModalOverlay />
        <ModalContent bg="#181E27" color="white">
          <ModalHeader>Extend Subscription: {selectedCompany?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Duration</FormLabel>
                <Input
                  type="number"
                  value={extensionDuration}
                  onChange={(e) => setExtensionDuration(parseInt(e.target.value))}
                  min={1}
                  bg="gray.800"
                  borderColor="whiteAlpha.100"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Unit</FormLabel>
                <Select
                  value={extensionUnit}
                  onChange={(e) => setExtensionUnit(e.target.value)}
                  bg="gray.800"
                  borderColor="whiteAlpha.100"
                >
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={() => setExtendDialogOpen(false)} colorScheme="whiteAlpha" borderRadius="xl">
              Cancel
            </Button>
            <Button colorScheme="blue" borderRadius="xl" onClick={handleExtendSubscription}>
              Extend Subscription
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompaniesManagement;
