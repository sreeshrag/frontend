import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Heading,
  Card,
  CardBody,
  Badge,
  Progress,
  Button,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Center,
  Flex,
  Icon,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';
import {
  FiStar,
  FiCheckCircle,
  FiAlertTriangle,
  FiHardDrive,
  FiHeadphones,
  FiPackage,
  FiUsers,
  FiStar as FiCrown,
  FiCalendar,
  FiTrendingUp,
  FiShield,
  FiZap,
} from 'react-icons/fi';

import api from '../../services/api';

const SubscriptionDetails = () => {
  const { subscription: authSubscription, company } = useSelector((state) => state.auth || {});
  
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeRequests, setUpgradeRequests] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const plans = [
    {
      name: 'Basic',
      id: 'basic',
      price: 29.99,
      gradient: 'linear(135deg, #3b82f6, #1d4ed8)',
      features: {
        maxUsers: 25,
        storage: '10GB',
        support: 'Email + Chat',
        details: ['Advanced Dashboard', 'User Management', 'Advanced Reports', 'API Access']
      },
      popular: false,
    },
    {
      name: 'Premium',
      id: 'premium',
      price: 59.99,
      gradient: 'linear(135deg, #8b5cf6, #7c3aed)',
      features: {
        maxUsers: 100,
        storage: '50GB',
        support: 'Priority Support',
        details: ['Premium Dashboard', 'Advanced User Management', 'Custom Reports', 'API Access', 'Integrations']
      },
      popular: true,
    },
    {
      name: 'Enterprise',
      id: 'enterprise',
      price: 99.99,
      gradient: 'linear(135deg, #f59e0b, #d97706)',
      features: {
        maxUsers: 'Unlimited',
        storage: '200GB',
        support: 'Dedicated Support',
        details: ['Enterprise Dashboard', 'Advanced User Management', 'Custom Reports', 'Full API Access', 'All Integrations', 'Custom Features']
      },
      popular: false,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchSubscriptionDetails(), fetchUpgradeRequests()]);
  };

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await api.get('/company/subscription');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch subscription details');
      }
      
      const subData = response.data.data;
      console.log('Received subscription data:', subData);
      
      // Ensure we have a plan, defaulting to free if not set
      const subscription = {
        ...subData,
        plan: subData?.plan || authSubscription?.plan || 'free',
      };
      
      setSubscription(subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      // Fall back to auth subscription data or default to free plan
      const fallbackSub = authSubscription || { plan: 'free' };
      setSubscription(fallbackSub);
      toast.error('Failed to load subscription details. Using cached data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpgradeRequests = async () => {
    try {
      console.log('Fetching upgrade requests...');
      const response = await api.get('/company/upgrade-requests');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch upgrade requests');
      }
      
      const requests = response.data.data || [];
      console.log('Received upgrade requests:', requests);
      setUpgradeRequests(requests);
      
      return requests;
    } catch (error) {
      console.error('Failed to fetch upgrade requests:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status
      });
      setUpgradeRequests([]);
      toast.error('Failed to load upgrade requests. Please refresh the page.');
    }
  };

  const handleUpgrade = (plan) => {
    if (!plan) return;
    setSelectedPlan(plan);
    onOpen();
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan || submitting) {
      console.log('Upgrade canceled - Invalid plan or already submitting:', { selectedPlan, submitting });
      return;
    }
    
    setSubmitting(true);
    try {
      console.log('Submitting upgrade request for plan:', selectedPlan);
      
      const response = await api.post('/company/upgrade-request', {
        requestedPlan: selectedPlan.id,
        requestedPrice: selectedPlan.price,
        currentPlan: subscription?.plan || company?.subscription?.plan || 'free',
        message: `Requesting upgrade to ${selectedPlan.name} plan`
      });

      console.log('Upgrade request response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit upgrade request');
      }

      toast.success(response.data.message);
      
      // Update the local state with the new request
      setUpgradeRequests(prevRequests => [response.data.data, ...prevRequests]);
      
      onClose();
      setSelectedPlan(null);
    } catch (error) {
      console.error('Upgrade request error:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      toast.error(error.response?.data?.message || error.message || 'Failed to submit upgrade request');
    } finally {
      setSubmitting(false);
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
        transform: 'translateY(-4px)',
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

  if (loading) {
    return (
      <Center minH="400px" bg="#0f1419">
        <VStack spacing={4}>
          <Spinner size="xl" color="cyan.400" thickness="4px" />
          <Text color="gray.400" fontSize="lg">Loading subscription details...</Text>
        </VStack>
      </Center>
    );
  }

  const isExpired = subscription?.status === 'expired' || 
                   (subscription?.endDate && new Date(subscription.endDate) < new Date());
  const isExpiringSoon = subscription?.daysRemaining <= 7 && subscription?.daysRemaining > 0;
  const hasPendingUpgrade = upgradeRequests.some(req => req.status === 'pending');

  const usagePercentage = Math.min((company?.currentUsers || 0) / (company?.maxUsers || 1) * 100, 100);

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Subscription Management
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Manage your subscription plans and billing information
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
              <Text fontSize="sm" color="gray.300">Your subscription has expired. Please upgrade to continue using all features.</Text>
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
              <Text fontSize="sm" color="gray.300">Your subscription expires in {subscription?.daysRemaining || 0} days. Please renew to avoid service interruption.</Text>
            </Box>
          </Alert>
        )}
        
        {hasPendingUpgrade && (
          <Alert
            status="info"
            borderRadius="xl"
            bg="rgba(59, 130, 246, 0.1)"
            border="1px solid"
            borderColor="blue.800"
            color="white"
          >
            <AlertIcon color="blue.400" />
            <Box>
              <Text fontWeight="bold" color="blue.400">Upgrade Request Pending</Text>
              <Text fontSize="sm" color="gray.300">You have a pending upgrade request. Please wait for admin approval.</Text>
            </Box>
          </Alert>
        )}

        {/* Current Subscription Overview */}
        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
          <PremiumCard gradient="linear(135deg, #22d3ee, #0891b2)">
            <CardBody p={6}>
              <HStack justify="space-between" mb={6}>
                <HStack spacing={3}>
                  <Box
                    w={12}
                    h={12}
                    borderRadius="xl"
                    bgGradient="linear(135deg, #22d3ee, #0891b2)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    boxShadow="0 8px 32px rgba(34, 211, 238, 0.3)"
                  >
                    <FiStar size={24} />
                  </Box>
                  <VStack align="start" spacing={0}>
                    <Heading size="lg" color="white" fontWeight="bold">
                      {subscription?.plan || 'No Plan'}
                    </Heading>
                    <Text color="gray.400">Current Subscription</Text>
                  </VStack>
                </HStack>
                <Badge
                  colorScheme={subscription?.status === 'active' ? 'green' : 'red'}
                  variant="solid"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                  fontWeight="bold"
                >
                  {subscription?.status || 'Unknown'}
                </Badge>
              </HStack>

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <VStack align="start" spacing={3}>
                  <HStack spacing={3}>
                    <Icon as={FiCalendar} color="gray.400" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.400">End Date</Text>
                      <Text fontWeight="bold" color="white">
                        {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <HStack spacing={3}>
                    <Icon as={FiTrendingUp} color="gray.400" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" color="gray.400">Days Remaining</Text>
                      <Text fontWeight="bold" color="white">
                        {subscription?.daysRemaining || 0} days
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack align="start" spacing={4}>
                  <Text fontSize="sm" color="gray.400" fontWeight="medium">User Limit Usage</Text>
                  <HStack spacing={4} w="full">
                    <CircularProgress 
                      value={usagePercentage} 
                      size="80px" 
                      color="cyan.400"
                      trackColor="whiteAlpha.200"
                      thickness="8px"
                    >
                      <CircularProgressLabel color="white" fontWeight="bold" fontSize="sm">
                        {Math.round(usagePercentage)}%
                      </CircularProgressLabel>
                    </CircularProgress>
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontWeight="bold" fontSize="lg">
                        {company?.currentUsers || 0}
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        of {company?.maxUsers || 0} users
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>
              </Grid>
            </CardBody>
          </PremiumCard>

          {/* Current Features */}
          <PremiumCard gradient="linear(135deg, #10b981, #059669)">
            <CardBody p={6}>
              <HStack spacing={3} mb={6}>
                <Box
                  w={10}
                  h={10}
                  borderRadius="xl"
                  bgGradient="linear(135deg, #10b981, #059669)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  boxShadow="0 8px 32px rgba(16, 185, 129, 0.3)"
                >
                  <FiZap size={20} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="white" fontWeight="bold">
                    Current Features
                  </Heading>
                  <Text color="gray.400" fontSize="sm">Active benefits</Text>
                </VStack>
              </HStack>
              
              <VStack align="start" spacing={4}>
                <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                  <Icon as={FiUsers} color="blue.400" />
                  <Text fontSize="sm" color="white">Max Users: {subscription?.features?.maxUsers || 'N/A'}</Text>
                </HStack>
                
                <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                  <Icon as={FiHardDrive} color="purple.400" />
                  <Text fontSize="sm" color="white">Storage: {subscription?.features?.storage || 'N/A'}</Text>
                </HStack>
                
                <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                  <Icon as={FiHeadphones} color="green.400" />
                  <Text fontSize="sm" color="white">Support: {subscription?.features?.support || 'N/A'}</Text>
                </HStack>
                
                {subscription?.features?.details?.slice(0, 3).map((feature, index) => (
                  <HStack key={index} spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                    <Icon as={FiCheckCircle} color="green.400" />
                    <Text fontSize="sm" color="white">{feature}</Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </PremiumCard>
        </Grid>

        {/* Available Plans */}
        <Box>
          <VStack align="start" spacing={4} mb={8}>
            <Heading size="xl" color="white" fontWeight="bold">
              Choose Your Plan
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Upgrade your subscription to unlock more features and capabilities
            </Text>
          </VStack>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={8}>
            {plans.map((plan) => (
              <Box key={plan.id} position="relative">
                {plan.popular && (
                  <Box
                    position="absolute"
                    top="-12px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={10}
                  >
                    <Badge
                      bgGradient="linear(135deg, #f59e0b, #d97706)"
                      color="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="bold"
                      boxShadow="0 4px 20px rgba(245, 158, 11, 0.4)"
                    >
                      <HStack spacing={1}>
                        <Icon as={FiCrown} />
                        <Text>Most Popular</Text>
                      </HStack>
                    </Badge>
                  </Box>
                )}
                
                <PremiumCard
                  gradient={plan.gradient}
                  border={plan.popular ? "2px solid" : "1px solid"}
                  borderColor={plan.popular ? "orange.400" : "whiteAlpha.100"}
                  _hover={{
                    transform: plan.popular ? 'translateY(-8px)' : 'translateY(-4px)',
                    boxShadow: plan.popular ? '0 30px 60px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.4)',
                  }}
                >
                  <CardBody p={8}>
                    <VStack spacing={6} align="stretch">
                      <Box textAlign="center">
                        <Heading size="xl" color="white" mb={2} fontWeight="bold">
                          {plan.name}
                        </Heading>
                        <HStack justify="center" align="baseline">
                          <Text fontSize="4xl" fontWeight="black" color="white">
                            ${plan.price}
                          </Text>
                          <Text fontSize="lg" color="gray.400">
                            /month
                          </Text>
                        </HStack>
                      </Box>

                      <VStack align="start" spacing={3}>
                        <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                          <Icon as={FiUsers} color="blue.400" />
                          <Text fontSize="sm" color="white" fontWeight="medium">{plan.features.maxUsers} users</Text>
                        </HStack>
                        
                        <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                          <Icon as={FiHardDrive} color="purple.400" />
                          <Text fontSize="sm" color="white" fontWeight="medium">{plan.features.storage} storage</Text>
                        </HStack>
                        
                        <HStack spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                          <Icon as={FiHeadphones} color="green.400" />
                          <Text fontSize="sm" color="white" fontWeight="medium">{plan.features.support}</Text>
                        </HStack>
                        
                        {plan.features.details.slice(0, 4).map((feature, index) => (
                          <HStack key={index} spacing={3} w="full" p={3} bg="whiteAlpha.50" borderRadius="lg">
                            <Icon as={FiCheckCircle} color="green.400" />
                            <Text fontSize="sm" color="white" fontWeight="medium">{feature}</Text>
                          </HStack>
                        ))}
                      </VStack>

                      <Button
                        size="lg"
                        w="full"
                        h="56px"
                        bgGradient={plan.popular ? plan.gradient : "linear(135deg, whiteAlpha.200, whiteAlpha.100)"}
                        color="white"
                        fontSize="lg"
                        fontWeight="bold"
                        borderRadius="xl"
                        onClick={() => handleUpgrade(plan)}
                        isDisabled={subscription?.plan === plan.id}
                        _hover={!subscription || subscription.plan !== plan.id ? {
                          bgGradient: plan.gradient,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                        } : {}}
                        _disabled={{
                          opacity: 0.6,
                          cursor: 'not-allowed',
                        }}
                        leftIcon={subscription?.plan === plan.id ? <FiCheckCircle /> : <FiTrendingUp />}
                      >
                        {subscription?.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </Button>
                    </VStack>
                  </CardBody>
                </PremiumCard>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Upgrade Request History */}
        {upgradeRequests.length > 0 && (
          <PremiumCard>
            <CardBody p={6}>
              <Heading size="lg" mb={6} color="white" fontWeight="bold">
                Upgrade Request History
              </Heading>
              <Box
                bg="whiteAlpha.50"
                borderRadius="xl"
                p={1}
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <TableContainer>
                  <Table variant="unstyled">
                    <Thead>
                      <Tr>
                        <Th color="gray.400" fontWeight="bold">Plan</Th>
                        <Th color="gray.400" fontWeight="bold">Price</Th>
                        <Th color="gray.400" fontWeight="bold">Status</Th>
                        <Th color="gray.400" fontWeight="bold">Date</Th>
                        <Th color="gray.400" fontWeight="bold">Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {upgradeRequests.map((request) => (
                        <Tr key={request.id} _hover={{ bg: 'whiteAlpha.50' }}>
                          <Td>
                            <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3}>
                              {request.requestedPlan}
                            </Badge>
                          </Td>
                          <Td>
                            <Text color="white" fontWeight="bold">${request.requestedPrice}/month</Text>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                request.status === 'approved' || request.status === 'processed' ? 'green' :
                                request.status === 'rejected' ? 'red' : 'yellow'
                              }
                              variant="solid"
                              borderRadius="full"
                              px={3}
                            >
                              {request.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text color="white" fontSize="sm">
                              {new Date(request.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="gray.300" noOfLines={2}>
                              {request.adminNotes || request.message || '-'}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </CardBody>
          </PremiumCard>
        )}

        {/* Upgrade Confirmation Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg="#181E27" color="white" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.200">
            <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold">Confirm Plan Upgrade</Text>
                <Text fontSize="sm" color="gray.400">Review your upgrade request details</Text>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody py={6}>
              {selectedPlan && (
                <VStack spacing={6} align="stretch">
                  <Box
                    p={6}
                    bg="whiteAlpha.50"
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                  >
                    <HStack justify="space-between" mb={4}>
                      <Text fontSize="lg" fontWeight="bold" color="white">
                        {selectedPlan.name} Plan
                      </Text>
                      <Text fontSize="2xl" fontWeight="black" color="cyan.400">
                        ${selectedPlan.price}/month
                      </Text>
                    </HStack>
                    
                    <Text color="gray.300" fontSize="sm" mb={4}>
                      Your request will be sent to the administrator for approval. You'll be notified once it's processed.
                    </Text>
                    
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" fontWeight="bold" color="gray.400">Included Features:</Text>
                      {selectedPlan.features.details.slice(0, 3).map((feature, index) => (
                        <HStack key={index} spacing={2}>
                          <Icon as={FiCheckCircle} color="green.400" size="16px" />
                          <Text fontSize="sm" color="gray.300">{feature}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
              <HStack spacing={3}>
                <Button 
                  onClick={onClose} 
                  isDisabled={submitting}
                  variant="ghost"
                  color="gray.300"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmUpgrade}
                  isLoading={submitting}
                  loadingText="Submitting..."
                  bgGradient="linear(135deg, #22d3ee, #0891b2)"
                  color="white"
                  borderRadius="xl"
                  leftIcon={<FiTrendingUp />}
                  _hover={{
                    bgGradient: "linear(135deg, #0891b2, #0e7490)",
                  }}
                >
                  Submit Request
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default SubscriptionDetails;
