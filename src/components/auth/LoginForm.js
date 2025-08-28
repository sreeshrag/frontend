import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  Alert,
  AlertIcon,
  Text,
  Link as ChakraLink,
  IconButton,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { loginUser, clearError } from '../../store/slices/authSlice';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(loginUser(data));
    
    if (loginUser.fulfilled.match(result)) {
      const user = result.payload.user;
      
      // Redirect based on user role
      if (user.role === 'super_admin') {
        navigate('/dashboard/super-admin');
      } else {
        navigate('/dashboard/company');
      }
    }
  };

  return (
    <VStack spacing={6} w="full">
      {error && (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <VStack spacing={4} w="full">
        <FormControl isInvalid={!!errors.email}>
          <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
            Email Address
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiMail color="gray" />
            </InputLeftElement>
            <Input
              {...register('email')}
              type="email"
              placeholder="Enter your email"
              size="lg"
              borderRadius="lg"
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
          <FormLabel color={useColorModeValue('gray.700', 'gray.300')}>
            Password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiLock color="gray" />
            </InputLeftElement>
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              size="lg"
              borderRadius="lg"
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

      <VStack spacing={4} w="full">
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          size="lg"
          w="full"
          colorScheme="brand"
          isLoading={loading}
          loadingText="Signing in..."
          borderRadius="lg"
          fontWeight="600"
        >
          Sign In
        </Button>

        

        {/* <HStack spacing={3} w="full">
          <Button
            variant="outline"
            size="lg"
            w="full"
            leftIcon={<FcGoogle />}
            borderRadius="lg"
          >
            Google
          </Button>
          <Button
            variant="outline"
            size="lg"
            w="full"
            leftIcon={<FiGithub />}
            borderRadius="lg"
          >
            GitHub
          </Button>
        </HStack> */}
      </VStack>

      <Text textAlign="center" color={useColorModeValue('gray.600', 'gray.400')}>
        Don't have an account?{' '}
        <ChakraLink
          as={Link}
          to="/auth/register"
          color="brand.500"
          fontWeight="600"
          _hover={{ textDecoration: 'none', color: 'brand.600' }}
        >
          Sign up here
        </ChakraLink>
      </Text>
    </VStack>
  );
};

export default LoginForm;
