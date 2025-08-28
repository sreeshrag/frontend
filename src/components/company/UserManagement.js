import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Table,
  Tbody,
  Td,
  TableContainer,
  Thead,
  Tr,
  HStack,
  Input,
  InputGroup,
  Button,
  Text,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  InputLeftElement,
  InputRightElement,
  Flex,
  Heading,
  Card,
  CardBody,
  VStack,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  Select,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Avatar,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiPlus,
  FiMoreVertical,
  FiTrash2,
  FiSlash,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiShield,
} from 'react-icons/fi';

import { fetchUsers } from '../../store/slices/companySlice';
import api from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users = { items: [], totalItems: 0 }, loading } = useSelector((state) => state.company || {});
  const { user: currentUser } = useSelector((state) => state.auth || {});
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Modal states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Add User form state
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addUserForm, setAddUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  });
  const [addUserErrors, setAddUserErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Prevent duplicate API calls
  const isSubmittingRef = useRef(false);
  const isDeletingRef = useRef(false);

  useEffect(() => {
    dispatch(fetchUsers({
      page,
      size: rowsPerPage,
      search: searchTerm,
    }));
  }, [dispatch, page, rowsPerPage, searchTerm]);

  // Stats calculations
  const totalUsers = users?.totalItems || 0;
  const activeUsers = users?.items?.filter(user => user?.isActive).length || 0;
  const adminUsers = users?.items?.filter(user => user?.role === 'company_admin').length || 0;

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

  // Enhanced validation function
  const validateAddUserForm = () => {
    const errors = {};
    
    if (!addUserForm.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (addUserForm.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!addUserForm.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (addUserForm.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!addUserForm.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addUserForm.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!addUserForm.password.trim()) {
      errors.password = 'Password is required';
    } else if (addUserForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!addUserForm.role) {
      errors.role = 'Role is required';
    }
    
    setAddUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleToggleStatus = async (user) => {
    if (!user?.id) return;
    
    try {
      await api.put(`/company/users/${user.id}`, {
        isActive: !user.isActive
      });
      
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      dispatch(fetchUsers({ page, size: rowsPerPage, search: searchTerm }));
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.id || isDeletingRef.current) return;
    
    isDeletingRef.current = true;
    
    try {
      await api.delete(`/company/users/${selectedUser.id}`);
      
      toast.success('User deleted successfully');
      dispatch(fetchUsers({ page, size: rowsPerPage, search: searchTerm }));
      setIsDeleteOpen(false);
      setSelectedUser(null);
      
    } catch (error) {
      let errorMessage = 'Failed to delete user';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (error.response?.status === 400) {
        errorMessage = 'Cannot delete this user';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to delete this user';
      }
      
      toast.error(errorMessage);
      console.error('Delete user error:', error);
    } finally {
      isDeletingRef.current = false;
    }
  };

  // Add User Functions
  const openAddUserModal = () => {
    setAddUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' });
    setAddUserErrors({});
    setServerError('');
    setShowPassword(false);
    setIsAddUserOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserOpen(false);
    setAddUserForm({ firstName: '', lastName: '', email: '', password: '', role: '' });
    setAddUserErrors({});
    setServerError('');
    setShowPassword(false);
  };

  const handleAddUserFormChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (addUserErrors[name]) {
      setAddUserErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear server error when user makes changes
    if (serverError) {
      setServerError('');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;
    
    if (!validateAddUserForm()) {
      return;
    }

    isSubmittingRef.current = true;
    setAddUserLoading(true);
    setServerError('');

    try {
      await api.post('/company/users', {
        firstName: addUserForm.firstName,
        lastName: addUserForm.lastName,
        email: addUserForm.email,
        password: addUserForm.password,
        role: addUserForm.role
      });
      
      toast.success('User added successfully');
      dispatch(fetchUsers({ page, size: rowsPerPage, search: searchTerm }));
      closeAddUserModal();
    } catch (error) {
      console.error('Add user error:', error);
      
      // Handle backend validation errors
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setAddUserErrors(backendErrors);
        setServerError('');
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to add user';
        setServerError(errorMessage);
        setAddUserErrors({});
      }
    } finally {
      setAddUserLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          User Management
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Manage your team members and their permissions
        </Text>
      </VStack>

      <VStack spacing={8} align="stretch">
        {/* Stats Cards */}
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
                  <FiUsers size={24} />
                </Box>
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
                    Total Users
                  </StatLabel>
                  <StatNumber color="white" fontSize="3xl" fontWeight="black">
                    {totalUsers}
                  </StatNumber>
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
                  <FiUserCheck size={24} />
                </Box>
                <Stat>
                  <StatLabel color="gray.400" fontSize="sm" fontWeight="medium">
                    Active Users
                  </StatLabel>
                  <StatNumber color="white" fontSize="3xl" fontWeight="black">
                    {activeUsers}
                  </StatNumber>
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
                    Administrators
                  </StatLabel>
                  <StatNumber color="white" fontSize="3xl" fontWeight="black">
                    {adminUsers}
                  </StatNumber>
                </Stat>
              </HStack>
            </CardBody>
          </PremiumCard>
        </Grid>

        {/* Main Users Table */}
        <PremiumCard>
          <CardBody p={6}>
            {/* Header Actions */}
            <Flex justify="space-between" align="center" mb={6} direction={{ base: "column", md: "row" }} gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="white" fontWeight="bold">
                  Team Members
                </Heading>
                <Text color="gray.400" fontSize="sm">
                  {totalUsers} total users across your organization
                </Text>
              </VStack>
              
              <HStack spacing={4}>
                <InputGroup maxW="300px" onClick={e => e.stopPropagation()}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg="gray.800"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                  />
                </InputGroup>
                
                {currentUser?.role === 'company_admin' && (
                  <Button
                    bgGradient="linear(135deg, #22d3ee, #0891b2)"
                    color="white"
                    leftIcon={<FiPlus />}
                    onClick={openAddUserModal}
                    borderRadius="xl"
                    fontWeight="bold"
                    _hover={{
                      bgGradient: "linear(135deg, #0891b2, #0e7490)",
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                    }}
                  >
                    Add User
                  </Button>
                )}
              </HStack>
            </Flex>

            <Divider borderColor="whiteAlpha.200" mb={6} />

            {/* Users Table */}
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
                      <Td color="gray.400" fontWeight="bold" py={4}>User</Td>
                      <Td color="gray.400" fontWeight="bold">Role</Td>
                      <Td color="gray.400" fontWeight="bold">Status</Td>
                      <Td color="gray.400" fontWeight="bold">Last Login</Td>
                      <Td color="gray.400" fontWeight="bold">Actions</Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {loading ? (
                      <Tr>
                        <Td colSpan={5}>
                          <Center py={8}>
                            <VStack spacing={4}>
                              <Spinner size="lg" color="cyan.400" thickness="4px" />
                              <Text color="gray.400">Loading users...</Text>
                            </VStack>
                          </Center>
                        </Td>
                      </Tr>
                    ) : !users?.items || users.items.length === 0 ? (
                      <Tr>
                        <Td colSpan={5}>
                          <Center py={8}>
                            <VStack spacing={3}>
                              <Box color="gray.600">
                                <FiUsers size={48} />
                              </Box>
                              <Text color="gray.400">No users found</Text>
                            </VStack>
                          </Center>
                        </Td>
                      </Tr>
                    ) : (
                      users.items.map((user) => (
                        <Tr 
                          key={user?.id || Math.random()} 
                          _hover={{ bg: 'whiteAlpha.50' }}
                          transition="background 0.2s"
                        >
                          <Td py={4}>
                            <HStack spacing={3}>
                              <Avatar
                                size="md"
                                name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                color="white"
                              />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="bold" color="white" fontSize="md">
                                  {user?.firstName || ''} {user?.lastName || ''}
                                </Text>
                                <Text fontSize="sm" color="gray.400">
                                  {user?.email || 'No email'}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={user?.role === 'company_admin' ? 'purple' : 'blue'}
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {user?.role === 'company_admin' ? 'Administrator' : 'Staff Member'}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={user?.isActive ? 'green' : 'red'}
                              variant="solid"
                              borderRadius="full"
                              px={3}
                              py={1}
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {user?.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm" color="white">
                              {user?.lastLogin 
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : 'Never'
                              }
                            </Text>
                          </Td>
                          <Td>
                            {currentUser?.role === 'company_admin' && user?.id !== currentUser?.id ? (
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  icon={<FiMoreVertical />}
                                  variant="ghost"
                                  size="sm"
                                  color="gray.400"
                                  _hover={{ bg: 'whiteAlpha.200', color: 'white' }}
                                />
                                <MenuList 
                                  bg="gray.800" 
                                  borderColor="whiteAlpha.200"
                                  boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
                                >
                                  <MenuItem 
                                    icon={user?.isActive ? <FiSlash /> : <FiCheckCircle />}
                                    onClick={() => handleToggleStatus(user)}
                                    bg="transparent"
                                    color="white"
                                    _hover={{ bg: 'whiteAlpha.100' }}
                                  >
                                    {user?.isActive ? 'Deactivate' : 'Activate'}
                                  </MenuItem>
                                  <MenuItem 
                                    icon={<FiTrash2 />}
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setIsDeleteOpen(true);
                                    }}
                                    bg="transparent"
                                    color="red.300"
                                    _hover={{ bg: 'red.900', color: 'red.200' }}
                                  >
                                    Delete User
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            ) : (
                              <Text fontSize="xs" color="gray.500">-</Text>
                            )}
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
                Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, users?.totalItems || 0)} of {users?.totalItems || 0} users
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
                <Text fontSize="sm" color="white" px={4} fontWeight="medium">
                  Page {page + 1}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  isDisabled={(page + 1) * rowsPerPage >= (users?.totalItems || 0)}
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

      {/* Enhanced Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={closeAddUserModal} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg="#181E27" color="white" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.200">
          <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">Add New Team Member</Text>
              <Text fontSize="sm" color="gray.400">Create a new user account for your organization</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleAddUserSubmit}>
            <ModalBody py={6}>
              <VStack spacing={6} align="stretch">
                {/* Server error alert */}
                {serverError && (
                  <Alert status="error" bg="rgba(239, 68, 68, 0.1)" border="1px solid" borderColor="red.800" borderRadius="lg">
                    <AlertIcon color="red.400" />
                    <Text color="red.400">{serverError}</Text>
                  </Alert>
                )}

                <HStack spacing={4}>
                  <FormControl isInvalid={!!addUserErrors.firstName} isRequired>
                    <FormLabel color="gray.300" fontWeight="medium">First Name</FormLabel>
                    <Input
                      name="firstName"
                      value={addUserForm.firstName}
                      onChange={handleAddUserFormChange}
                      placeholder="John"
                      bg="gray.800"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                    />
                    {addUserErrors.firstName && (
                      <Text color="red.400" fontSize="sm" mt={1}>
                        {addUserErrors.firstName}
                      </Text>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!addUserErrors.lastName} isRequired>
                    <FormLabel color="gray.300" fontWeight="medium">Last Name</FormLabel>
                    <Input
                      name="lastName"
                      value={addUserForm.lastName}
                      onChange={handleAddUserFormChange}
                      placeholder="Doe"
                      bg="gray.800"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                    />
                    {addUserErrors.lastName && (
                      <Text color="red.400" fontSize="sm" mt={1}>
                        {addUserErrors.lastName}
                      </Text>
                    )}
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!addUserErrors.email} isRequired>
                  <FormLabel color="gray.300" fontWeight="medium">Email Address</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={addUserForm.email}
                    onChange={handleAddUserFormChange}
                    placeholder="john@company.com"
                    bg="gray.800"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                  />
                  {addUserErrors.email && (
                    <Text color="red.400" fontSize="sm" mt={1}>
                      {addUserErrors.email}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!addUserErrors.password} isRequired>
                  <FormLabel color="gray.300" fontWeight="medium">Password</FormLabel>
                  <InputGroup>
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={addUserForm.password}
                      onChange={handleAddUserFormChange}
                      placeholder="Enter secure password"
                      bg="gray.800"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                      _placeholder={{ color: "gray.500" }}
                      _focus={{ borderColor: "cyan.400", boxShadow: "0 0 0 1px #22d3ee" }}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <FiEyeOff /> : <FiEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                        color="gray.400"
                        _hover={{ color: 'white' }}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {addUserErrors.password && (
                    <Text color="red.400" fontSize="sm" mt={1}>
                      {addUserErrors.password}
                    </Text>
                  )}
                </FormControl>

                <FormControl isInvalid={!!addUserErrors.role} isRequired>
                  <FormLabel color="gray.300" fontWeight="medium">Role</FormLabel>
                  <Select
                    name="role"
                    value={addUserForm.role}
                    onChange={handleAddUserFormChange}
                    placeholder="Select user role"
                    bg="gray.800"
                    border="1px solid"
                    borderColor="whiteAlpha.200"
                    color="white"
                    _focus={{ borderColor: "cyan.400" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <option value="staff" style={{ backgroundColor: '#2d3748', color: 'white' }}>Staff Member</option>
                    <option value="company_admin" style={{ backgroundColor: '#2d3748', color: 'white' }}>Administrator</option>
                  </Select>
                  {addUserErrors.role && (
                    <Text color="red.400" fontSize="sm" mt={1}>
                      {addUserErrors.role}
                    </Text>
                  )}
                </FormControl>

                {/* Info Alert */}
                {!serverError && (
                  <Alert status="info" bg="rgba(59, 130, 246, 0.1)" border="1px solid" borderColor="blue.800" borderRadius="lg">
                    <AlertIcon color="blue.400" />
                    <Box>
                      <Text fontSize="sm" color="blue.400" fontWeight="bold">Account Setup</Text>
                      <Text fontSize="sm" color="gray.300">
                        The user will receive login credentials and can change their password after first login.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
              <HStack spacing={3}>
                <Button 
                  onClick={closeAddUserModal} 
                  isDisabled={addUserLoading}
                  variant="ghost"
                  color="gray.300"
                  borderRadius="xl"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={addUserLoading}
                  loadingText="Adding User..."
                  bgGradient="linear(135deg, #22d3ee, #0891b2)"
                  color="white"
                  borderRadius="xl"
                  fontWeight="bold"
                  leftIcon={<FiPlus />}
                  _hover={{
                    bgGradient: "linear(135deg, #0891b2, #0e7490)",
                  }}
                >
                  Add User
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Enhanced Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg="#181E27" color="white" borderRadius="2xl" border="1px solid" borderColor="red.800">
          <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold" color="red.400">Delete User</Text>
              <Text fontSize="sm" color="gray.400">This action cannot be undone</Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" bg="rgba(245, 158, 11, 0.1)" border="1px solid" borderColor="orange.800" borderRadius="lg">
                <AlertIcon color="orange.400" />
                <Box>
                  <Text fontWeight="bold" color="orange.400">Permanent Deletion</Text>
                  <Text fontSize="sm" color="gray.300">
                    This will permanently delete the user account and all associated data.
                  </Text>
                </Box>
              </Alert>
              
              <Text color="gray.300">
                Are you sure you want to delete{' '}
                <Text as="span" fontWeight="bold" color="white">
                  {selectedUser?.firstName || ''} {selectedUser?.lastName || ''}
                </Text>
                ?
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
            <HStack spacing={3}>
              <Button 
                onClick={() => setIsDeleteOpen(false)}
                variant="ghost"
                color="gray.300"
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteUser} 
                colorScheme="red"
                borderRadius="xl"
                leftIcon={<FiTrash2 />}
                fontWeight="bold"
              >
                Delete User
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManagement;
