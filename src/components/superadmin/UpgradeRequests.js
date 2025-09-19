import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Tbody,
  Td,
  TableContainer,
  Thead,
  Tr,
  HStack,
  Button,
  Text,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Grid,
  GridItem,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Select,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Flex,
  Heading,
  VStack,
  Spinner,
  Center,
  Divider,
  Icon,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiX,
  FiClock,
  FiBriefcase,
  FiTrendingUp,
  FiAlertTriangle,
  FiUsers,
  FiEye,
} from 'react-icons/fi';

import api from '../../services/api';
import toast from 'react-hot-toast';

const UpgradeRequests = () => {
  const [requests, setRequests] = useState({ items: [], totalItems: 0 });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      };
      
      const response = await api.get('/super-admin/upgrade-requests', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch upgrade requests');
      }
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching upgrade requests:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch upgrade requests');
      setRequests({ items: [], pagination: { totalItems: 0, totalPages: 0, currentPage: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (action) => {
    try {
      await api.put(`/super-admin/upgrade-requests/${selectedRequest.id}/process`, {
        action,
        adminNotes
      });
      
      toast.success(`Request ${action}d successfully`);
      setProcessDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const getStatusColorScheme = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'processed': return 'blue';
      case 'rejected': return 'red';
      case 'pending': return 'orange';
      default: return 'gray';
    }
  };

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
  const PremiumStatsCard = ({ title, value, subtitle, icon, gradient }) => (
    <PremiumCard gradient={gradient}>
      <CardBody p={6}>
        <HStack spacing={4}>
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
          <Stat>
            <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
              {title}
            </StatLabel>
            <StatNumber color="white" fontSize="3xl" fontWeight="black">
              {value}
            </StatNumber>
            {subtitle && (
              <Text color="gray.500" fontSize="xs">
                {subtitle}
              </Text>
            )}
          </Stat>
        </HStack>
      </CardBody>
    </PremiumCard>
  );

  const pendingCount = requests.items?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = requests.items?.filter(r => r.status === 'approved').length || 0;
  const rejectedCount = requests.items?.filter(r => r.status === 'rejected').length || 0;

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Upgrade Request Management
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Review and process subscription upgrade requests from companies
        </Text>
      </VStack>

      <VStack spacing={8} align="stretch">
        {/* Premium Stats Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6}>
          <PremiumStatsCard
            title="Pending Requests"
            value={pendingCount}
            subtitle="Awaiting review"
            icon={<FiClock size={24} />}
            gradient="linear(135deg, #f59e0b, #d97706)"
          />
          <PremiumStatsCard
            title="Approved Requests"
            value={approvedCount}
            subtitle="Successfully approved"
            icon={<FiCheckCircle size={24} />}
            gradient="linear(135deg, #10b981, #059669)"
          />
          <PremiumStatsCard
            title="Total Requests"
            value={requests.totalItems}
            subtitle="All time"
            icon={<FiBriefcase size={24} />}
            gradient="linear(135deg, #3b82f6, #1d4ed8)"
          />
          <PremiumStatsCard
            title="Rejected Requests"
            value={rejectedCount}
            subtitle="Declined requests"
            icon={<FiX size={24} />}
            gradient="linear(135deg, #ef4444, #dc2626)"
          />
        </Grid>

        {/* Main Requests Table */}
        <PremiumCard>
          <CardBody p={8}>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6} direction={{ base: "column", md: "row" }} gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white" fontWeight="bold">
                  All Upgrade Requests
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {requests.totalItems} total requests across all companies
                </Text>
              </VStack>
              
              <FormControl minW="200px">
                <FormLabel fontSize="sm" color="gray.400">Filter by Status</FormLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="sm"
                  bg="gray.800"
                  color="white"
                  borderColor="whiteAlpha.200"
                  _focus={{ borderColor: "blue.400" }}
                  onClick={e => e.stopPropagation()}
                >
                  <option value="all" style={{ backgroundColor: '#2d3748', color: 'white' }}>All Status</option>
                  <option value="pending" style={{ backgroundColor: '#2d3748', color: 'white' }}>Pending</option>
                  <option value="approved" style={{ backgroundColor: '#2d3748', color: 'white' }}>Approved</option>
                  <option value="rejected" style={{ backgroundColor: '#2d3748', color: 'white' }}>Rejected</option>
                  <option value="processed" style={{ backgroundColor: '#2d3748', color: 'white' }}>Processed</option>
                </Select>
              </FormControl>
            </Flex>

            <Divider borderColor="whiteAlpha.200" mb={6} />

            {/* Requests Table */}
            <Box
              bg="whiteAlpha.30"
              borderRadius="xl"
              p={1}
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <TableContainer>
                <Table variant="unstyled">
                  <Thead>
                    <Tr>
                      <Td color="gray.400" fontWeight="bold" py={4}>Company</Td>
                      <Td color="gray.400" fontWeight="bold">Current Plan</Td>
                      <Td color="gray.400" fontWeight="bold">Requested Plan</Td>
                      <Td color="gray.400" fontWeight="bold">Price</Td>
                      <Td color="gray.400" fontWeight="bold">Status</Td>
                      <Td color="gray.400" fontWeight="bold">Date</Td>
                      <Td color="gray.400" fontWeight="bold">Actions</Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading ? (
                      <Tr>
                        <Td colSpan={7}>
                          <Center py={8}>
                            <VStack spacing={4}>
                              <Spinner size="lg" color="cyan.400" thickness="4px" />
                              <Text color="gray.400">Loading requests...</Text>
                            </VStack>
                          </Center>
                        </Td>
                      </Tr>
                    ) : requests.items?.length === 0 ? (
                      <Tr>
                        <Td colSpan={7}>
                          <Center py={8}>
                            <VStack spacing={3}>
                              <Icon as={FiBriefcase} color="gray.600" size="48px" />
                              <Text color="gray.400">No upgrade requests found</Text>
                            </VStack>
                          </Center>
                        </Td>
                      </Tr>
                    ) : (
                      requests.items?.map((request) => (
                        <Tr 
                          key={request.id} 
                          _hover={{ bg: 'whiteAlpha.50' }}
                          transition="background 0.2s"
                        >
                          <Td py={4}>
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="bold" color="white" fontSize="md">
                                {request.company?.name || 'N/A'}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                {request.company?.email || 'N/A'}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme="gray" 
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              {request.currentPlan}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme="blue" 
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              {request.requestedPlan}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="white" fontSize="lg">
                              ${request.requestedPrice}
                              <Text as="span" fontSize="xs" color="gray.400">/month</Text>
                            </Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColorScheme(request.status)}
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                              textTransform="capitalize"
                            >
                              {request.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="white">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              {request.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  bgGradient="linear(135deg, #22d3ee, #0891b2)"
                                  color="white"
                                  borderRadius="xl"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setProcessDialogOpen(true);
                                  }}
                                  leftIcon={<FiEye />}
                                  _hover={{
                                    bgGradient: "linear(135deg, #0891b2, #0e7490)",
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                                  }}
                                >
                                  Review
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  borderColor="whiteAlpha.200"
                                  color="gray.300"
                                  borderRadius="xl"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setProcessDialogOpen(true);
                                  }}
                                  leftIcon={<FiEye />}
                                  _hover={{
                                    bg: 'whiteAlpha.100',
                                    color: 'white',
                                    transform: 'translateY(-1px)',
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </HStack>
                          </Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

            {/* Pagination */}
            <HStack justify="space-between" align="center" mt={6}>
              <Text fontSize="sm" color="gray.400">
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, requests.totalItems || 0)} of {requests.totalItems || 0} results
              </Text>
              <HStack>
                <Button
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  isDisabled={page === 0}
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  borderRadius="lg"
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  isDisabled={(page + 1) * rowsPerPage >= (requests.totalItems || 0)}
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="gray.300"
                  _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                  borderRadius="lg"
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </PremiumCard>
      </VStack>

      {/* Enhanced Process Request Modal */}
      <Modal 
        isOpen={processDialogOpen} 
        onClose={() => setProcessDialogOpen(false)}
        size="lg"
        isCentered
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg="#181E27" color="white" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.200">
          <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">Review Upgrade Request</Text>
              <Text fontSize="sm" color="gray.400">Evaluate and process the subscription upgrade</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            {selectedRequest && (
              <VStack spacing={6} align="stretch">
                {/* Company Information */}
                <Box 
                  p={6} 
                  bg="whiteAlpha.50" 
                  borderRadius="xl" 
                  border="1px solid" 
                  borderColor="whiteAlpha.100"
                >
                  <VStack align="start" spacing={4}>
                    <Heading size="lg" color="white">
                      {selectedRequest.company?.name || 'N/A'}
                    </Heading>
                    
                    <Grid templateColumns="1fr 1fr" gap={6} w="full">
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color="gray.400" fontWeight="bold">Current Plan</Text>
                        <Badge colorScheme="gray" variant="solid" borderRadius="full" px={3} py={1}>
                          {selectedRequest.currentPlan}
                        </Badge>
                      </VStack>
                      
                      <VStack align="start" spacing={2}>
                        <Text fontSize="sm" color="gray.400" fontWeight="bold">Requested Plan</Text>
                        <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1}>
                          {selectedRequest.requestedPlan}
                        </Badge>
                      </VStack>
                    </Grid>
                    
                    <HStack spacing={4} w="full" justify="center">
                      <Icon as={FiTrendingUp} color="cyan.400" />
                      <Text color="cyan.400" fontSize="xl" fontWeight="bold">
                        ${selectedRequest.requestedPrice}/month
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
                
                {/* Company Message */}
                {selectedRequest.message && (
                  <Box>
                    <Text fontWeight="bold" mb={3} color="gray.300">
                      Company Request Message:
                    </Text>
                    <Box 
                      p={4} 
                      bg="gray.800" 
                      borderRadius="lg" 
                      border="1px solid" 
                      borderColor="whiteAlpha.100"
                    >
                      <Text color="gray.300" fontStyle="italic">
                        "{selectedRequest.message}"
                      </Text>
                    </Box>
                  </Box>
                )}

                {/* Admin Notes */}
                <FormControl>
                  <FormLabel color="gray.300" fontWeight="bold">Administrative Notes</FormLabel>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add your decision notes and reasoning..."
                    rows={4}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                  />
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    These notes will be visible to the requesting company
                  </Text>
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
            <HStack spacing={3}>
              <Button 
                onClick={() => setProcessDialogOpen(false)}
                variant="ghost"
                color="gray.300"
                borderRadius="xl"
              >
                {selectedRequest?.status === 'pending' ? 'Cancel' : 'Close'}
              </Button>
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button 
                    onClick={() => handleProcessRequest('reject')} 
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<FiX />}
                    borderRadius="xl"
                  >
                    Reject Request
                  </Button>
                  <Button 
                    onClick={() => handleProcessRequest('approve')} 
                    bgGradient="linear(135deg, #10b981, #059669)"
                    color="white"
                    leftIcon={<FiCheckCircle />}
                    borderRadius="xl"
                    _hover={{
                      bgGradient: "linear(135deg, #059669, #047857)",
                    }}
                  >
                    Approve Request
                  </Button>
                </>
              )}
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UpgradeRequests;
