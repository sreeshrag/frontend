import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Input,
  Button,
  Box,
  Alert,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Text,
  Grid,
  GridItem,
  Select,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  AlertIcon,
  Heading,
  Link as ChakraLink,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  FiEye, 
  FiEyeOff, 
  FiUser, 
  FiMail, 
  FiBriefcase, 
  FiPhone 
} from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerCompany, clearError } from '../../store/slices/authSlice';

const schema = yup.object({
  firstName: yup.string().required('First name is required').min(2, 'Too short'),
  lastName: yup.string().required('Last name is required').min(2, 'Too short'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number'),
  companyName: yup.string().required('Company name is required').min(2, 'Too short'),
  companyEmail: yup.string().email('Invalid email').required('Company email is required'),
  industry: yup.string(),
  companySize: yup.string(),
});

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' },
];

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  // Color mode values
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const linkColor = useColorModeValue('brand.500', 'brand.300');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(registerCompany(data));
    
    if (registerCompany.fulfilled.match(result)) {
      navigate('/dashboard/company');
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
      {error && (
        <Alert status="error" borderRadius="lg" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing={6} align="stretch">
        {/* Personal Information Section */}
        <Box>
          <Heading size="md" color={textColor} mb={4}>
            Personal Information
          </Heading>

          <VStack spacing={4} align="stretch">
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isInvalid={!!errors.firstName}>
                  <FormLabel>First Name</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FiUser color="gray" />
                    </InputLeftElement>
                    <Input
                      {...register('firstName')}
                      placeholder="Enter your first name"
                      focusBorderColor="brand.500"
                    />
                  </InputGroup>
                  {errors.firstName && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.firstName.message}
                    </Text>
                  )}
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={!!errors.lastName}>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    {...register('lastName')}
                    placeholder="Enter your last name"
                    focusBorderColor="brand.500"
                  />
                  {errors.lastName && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.lastName.message}
                    </Text>
                  )}
                </FormControl>
              </GridItem>
            </Grid>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Your Email Address</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiMail color="gray" />
                </InputLeftElement>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Enter your email"
                  focusBorderColor="brand.500"
                />
              </InputGroup>
              {errors.email && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.email.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  focusBorderColor="brand.500"
                />
                <InputRightElement>
                  <IconButton
                    variant="ghost"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    icon={showPassword ? <FiEyeOff /> : <FiEye />}
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
              {errors.password && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.password.message}
                </Text>
              )}
            </FormControl>
          </VStack>
        </Box>

        {/* Company Information Section */}
        <Box>
          <Heading size="md" color={textColor} mb={4}>
            Company Information
          </Heading>

          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.companyName}>
              <FormLabel>Company Name</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiBriefcase color="gray" />
                </InputLeftElement>
                <Input
                  {...register('companyName')}
                  placeholder="Enter your company name"
                  focusBorderColor="brand.500"
                />
              </InputGroup>
              {errors.companyName && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.companyName.message}
                </Text>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.companyEmail}>
              <FormLabel>Company Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FiMail color="gray" />
                </InputLeftElement>
                <Input
                  {...register('companyEmail')}
                  type="email"
                  placeholder="Enter company email"
                  focusBorderColor="brand.500"
                />
              </InputGroup>
              {errors.companyEmail && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.companyEmail.message}
                </Text>
              )}
            </FormControl>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <GridItem>
                <FormControl isInvalid={!!errors.industry}>
                  <FormLabel>Industry</FormLabel>
                  <Input
                    {...register('industry')}
                    placeholder="e.g., Technology, Healthcare"
                    focusBorderColor="brand.500"
                  />
                  {errors.industry && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.industry.message}
                    </Text>
                  )}
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl isInvalid={!!errors.companySize}>
                  <FormLabel>Company Size</FormLabel>
                  <Select
                    {...register('companySize')}
                    placeholder="Select company size"
                    focusBorderColor="brand.500"
                  >
                    {companySizes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  {errors.companySize && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.companySize.message}
                    </Text>
                  )}
                </FormControl>
              </GridItem>
            </Grid>
          </VStack>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="brand"
          size="lg"
          w="full"
          isLoading={loading}
          loadingText="Creating Account..."
          borderRadius="lg"
          py={6}
        >
          Create Account
        </Button>

        {/* Sign In Link */}
        <Box textAlign="center">
          <Text color={textColor}>
            Already have an account?{' '}
            <ChakraLink
              as={Link}
              to="/auth/login"
              color={linkColor}
              fontWeight="600"
              _hover={{ textDecoration: 'none', color: 'brand.600' }}
            >
              Sign in here
            </ChakraLink>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default RegisterForm;
