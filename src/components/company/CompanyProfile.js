import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  GridItem,
  Input,
  Button,
  Text,
  Avatar,
  Card,
  CardBody,
  Select,
  Alert,
  Divider,
  FormControl,
  FormLabel,
  AlertIcon,
  VStack,
  HStack,
  Flex,
  Heading,
  Textarea,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
} from '@chakra-ui/react';
import { 
  FiBriefcase, 
  FiSave, 
  FiEdit,
  FiGlobe,
  FiPhone,
  FiMapPin,
  FiUsers,
  FiTrendingUp,
  FiShield,
} from 'react-icons/fi';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Company name is required').min(2, 'Too short'),
  phone: yup.string(),
  address: yup.string(),
  website: yup.string().url('Invalid URL'),
  industry: yup.string(),
  size: yup.string(),
});

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const CompanyProfile = () => {
  const { company, subscription } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: company?.name || '',
      phone: company?.phone || '',
      address: company?.address || '',
      website: company?.website || '',
      industry: company?.industry || '',
      size: company?.size || '',
    },
  });

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        phone: company.phone || '',
        address: company.address || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.size || '',
      });
    }
  }, [company, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await api.put('/company/profile', data);
      toast.success('Company profile updated successfully');
      
      // Update local storage
      const updatedCompany = { ...company, ...data };
      localStorage.setItem('company', JSON.stringify(updatedCompany));
      
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
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

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Company Profile
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Manage your company information and business details
        </Text>
      </VStack>

      <VStack spacing={8} align="stretch">
        {/* Company Overview Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
          <PremiumCard gradient="linear(135deg, #22d3ee, #0891b2)">
            <CardBody p={6}>
              <HStack spacing={4}>
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
                  <FiBriefcase size={24} />
                </Box>
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
                    Company Status
                  </StatLabel>
                  <StatNumber color="white" fontSize="xl" fontWeight="bold">
                    {company?.status || 'Active'}
                  </StatNumber>
                  <StatHelpText color="gray.400" fontSize="xs">
                    Business registration
                  </StatHelpText>
                </Stat>
              </HStack>
            </CardBody>
          </PremiumCard>

          <PremiumCard gradient="linear(135deg, #8b5cf6, #7c3aed)">
            <CardBody p={6}>
              <HStack spacing={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bgGradient="linear(135deg, #8b5cf6, #7c3aed)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  boxShadow="0 8px 32px rgba(139, 92, 246, 0.3)"
                >
                  <FiShield size={24} />
                </Box>
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
                    Subscription
                  </StatLabel>
                  <StatNumber color="white" fontSize="xl" fontWeight="bold">
                    {subscription?.plan || 'Free'}
                  </StatNumber>
                  <StatHelpText color="gray.400" fontSize="xs">
                    Current plan
                  </StatHelpText>
                </Stat>
              </HStack>
            </CardBody>
          </PremiumCard>

          <PremiumCard gradient="linear(135deg, #10b981, #059669)">
            <CardBody p={6}>
              <HStack spacing={4}>
                <Box
                  w={12}
                  h={12}
                  borderRadius="xl"
                  bgGradient="linear(135deg, #10b981, #059669)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  boxShadow="0 8px 32px rgba(16, 185, 129, 0.3)"
                >
                  <FiUsers size={24} />
                </Box>
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
                    Team Size
                  </StatLabel>
                  <StatNumber color="white" fontSize="xl" fontWeight="bold">
                    {company?.size || 'Not Set'}
                  </StatNumber>
                  <StatHelpText color="gray.400" fontSize="xs">
                    Employees
                  </StatHelpText>
                </Stat>
              </HStack>
            </CardBody>
          </PremiumCard>
        </Grid>

        <Grid templateColumns={{ base: "1fr", lg: "400px 1fr" }} gap={8}>
          {/* Company Profile Card */}
          <GridItem>
            <PremiumCard gradient="linear(135deg, #f59e0b, #d97706)">
              <CardBody p={8}>
                <VStack spacing={6} align="center">
                  <Box position="relative">
                    <Avatar
                      size="2xl"
                      name={company?.name}
                      bg="linear-gradient(135deg, #f59e0b, #d97706)"
                      color="white"
                      fontSize="2xl"
                      fontWeight="bold"
                      border="4px solid"
                      borderColor="whiteAlpha.200"
                      boxShadow="0 8px 32px rgba(245, 158, 11, 0.3)"
                    />
                    <Badge
                      position="absolute"
                      bottom="-2px"
                      right="-2px"
                      colorScheme="green"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      Verified
                    </Badge>
                  </Box>
                  
                  <VStack spacing={3} textAlign="center">
                    <Heading size="lg" color="white" fontWeight="bold">
                      {company?.name || 'Company Name'}
                    </Heading>
                    <Badge
                      colorScheme="orange"
                      variant="solid"
                      borderRadius="full"
                      px={3}
                      py={1}
                      fontSize="sm"
                    >
                      {subscription?.plan || 'Free Plan'}
                    </Badge>
                  </VStack>

                  <VStack spacing={4} w="full">
                    {company?.email && (
                      <HStack spacing={3} w="full" justify="center">
                        <Icon as={FiGlobe} color="gray.400" />
                        <Text fontSize="sm" color="gray.300" isTruncated>
                          {company.email}
                        </Text>
                      </HStack>
                    )}
                    
                    {company?.phone && (
                      <HStack spacing={3} w="full" justify="center">
                        <Icon as={FiPhone} color="gray.400" />
                        <Text fontSize="sm" color="gray.300">
                          {company.phone}
                        </Text>
                      </HStack>
                    )}
                    
                    {company?.address && (
                      <HStack spacing={3} w="full" justify="center">
                        <Icon as={FiMapPin} color="gray.400" />
                        <Text fontSize="sm" color="gray.300" noOfLines={2} textAlign="center">
                          {company.address}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </CardBody>
            </PremiumCard>
          </GridItem>

          {/* Company Details Form */}
          <GridItem>
            <PremiumCard>
              <CardBody p={8}>
                <Flex justify="space-between" align="center" mb={8}>
                  <VStack align="start" spacing={1}>
                    <Heading size="lg" color="white" fontWeight="bold">
                      Company Information
                    </Heading>
                    <Text color="gray.400" fontSize="sm">
                      Update your business details and contact information
                    </Text>
                  </VStack>
                  
                  <Button
                    bgGradient={isEditing ? "linear(135deg, #10b981, #059669)" : "linear(135deg, #22d3ee, #0891b2)"}
                    color="white"
                    leftIcon={isEditing ? <FiSave /> : <FiEdit />}
                    onClick={() => {
                      if (isEditing) {
                        handleSubmit(onSubmit)();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    isLoading={loading}
                    loadingText={loading ? 'Saving...' : undefined}
                    borderRadius="xl"
                    fontWeight="bold"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </Flex>

                <Divider borderColor="whiteAlpha.200" mb={8} />

                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={6} align="stretch">
                    <FormControl isInvalid={!!errors.name}>
                      <FormLabel color="gray.300" fontWeight="medium">Company Name</FormLabel>
                      <Input
                        {...register('name')}
                        isDisabled={!isEditing}
                        placeholder="Enter company name"
                        bg="gray.800"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                        _disabled={{ bg: "gray.900", opacity: 0.7 }}
                      />
                      {errors.name && (
                        <Text color="red.400" fontSize="sm" mt={1}>
                          {errors.name.message}
                        </Text>
                      )}
                    </FormControl>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <FormControl isInvalid={!!errors.phone}>
                        <FormLabel color="gray.300" fontWeight="medium">Phone Number</FormLabel>
                        <Input
                          {...register('phone')}
                          isDisabled={!isEditing}
                          placeholder="Enter phone number"
                          bg="gray.800"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                          _disabled={{ bg: "gray.900", opacity: 0.7 }}
                        />
                        {errors.phone && (
                          <Text color="red.400" fontSize="sm" mt={1}>
                            {errors.phone.message}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl isInvalid={!!errors.website}>
                        <FormLabel color="gray.300" fontWeight="medium">Website</FormLabel>
                        <Input
                          {...register('website')}
                          isDisabled={!isEditing}
                          placeholder="https://example.com"
                          bg="gray.800"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                          _disabled={{ bg: "gray.900", opacity: 0.7 }}
                        />
                        {errors.website && (
                          <Text color="red.400" fontSize="sm" mt={1}>
                            {errors.website.message}
                          </Text>
                        )}
                      </FormControl>
                    </Grid>

                    <FormControl isInvalid={!!errors.address}>
                      <FormLabel color="gray.300" fontWeight="medium">Business Address</FormLabel>
                      <Textarea
                        {...register('address')}
                        isDisabled={!isEditing}
                        placeholder="Enter company address"
                        rows={4}
                        bg="gray.800"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                        _disabled={{ bg: "gray.900", opacity: 0.7 }}
                        resize="vertical"
                      />
                      {errors.address && (
                        <Text color="red.400" fontSize="sm" mt={1}>
                          {errors.address.message}
                        </Text>
                      )}
                    </FormControl>

                    <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                      <FormControl isInvalid={!!errors.industry}>
                        <FormLabel color="gray.300" fontWeight="medium">Industry</FormLabel>
                        <Input
                          {...register('industry')}
                          isDisabled={!isEditing}
                          placeholder="e.g., Technology, Healthcare"
                          bg="gray.800"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _placeholder={{ color: "gray.500" }}
                          _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                          _disabled={{ bg: "gray.900", opacity: 0.7 }}
                        />
                        {errors.industry && (
                          <Text color="red.400" fontSize="sm" mt={1}>
                            {errors.industry.message}
                          </Text>
                        )}
                      </FormControl>

                      <FormControl isInvalid={!!errors.size}>
                        <FormLabel color="gray.300" fontWeight="medium">Company Size</FormLabel>
                        <Select
                          {...register('size')}
                          isDisabled={!isEditing}
                          placeholder="Select company size"
                          bg="gray.800"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                          color="white"
                          _focus={{ borderColor: "cyan.400" }}
                          _disabled={{ bg: "gray.900", opacity: 0.7 }}
                          onClick={e => e.stopPropagation()}
                        >
                          {companySizes.map((option) => (
                            <option 
                              key={option.value} 
                              value={option.value}
                              style={{ backgroundColor: '#2d3748', color: 'white' }}
                            >
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        {errors.size && (
                          <Text color="red.400" fontSize="sm" mt={1}>
                            {errors.size.message}
                          </Text>
                        )}
                      </FormControl>
                    </Grid>

                    {isEditing && (
                      <Box
                        p={6}
                        bg="whiteAlpha.50"
                        borderRadius="xl"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                      >
                        <HStack spacing={4} justify="center">
                          <Button
                            type="submit"
                            bgGradient="linear(135deg, #10b981, #059669)"
                            color="white"
                            leftIcon={<FiSave />}
                            isLoading={loading}
                            loadingText="Saving..."
                            borderRadius="xl"
                            fontWeight="bold"
                            size="lg"
                            _hover={{
                              bgGradient: "linear(135deg, #059669, #047857)",
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                            }}
                          >
                            Save Changes
                          </Button>
                          <Button
                            variant="outline"
                            borderColor="whiteAlpha.300"
                            color="gray.300"
                            onClick={() => {
                              setIsEditing(false);
                              reset();
                            }}
                            borderRadius="xl"
                            fontWeight="medium"
                            size="lg"
                            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </CardBody>
            </PremiumCard>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default CompanyProfile;
