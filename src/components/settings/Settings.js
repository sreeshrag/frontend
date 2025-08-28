import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  GridItem,
  Text,
  Card,
  CardBody,
  Switch,
  FormControl,
  Input,
  Button,
  Divider,
  VStack,
  HStack,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  FormLabel,
  AlertIcon,
  Select,
  Heading,
  Flex,
  Badge,
  IconButton,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import {
  FiShield,
  FiBell,
  FiGlobe,
  FiGrid,
  FiTrash2,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiUser,
  FiSettings,
  FiCheck,
} from 'react-icons/fi';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../../services/api';
import toast from 'react-hot-toast';

const passwordSchema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase and number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

const Settings = () => {
  const { user, company } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    securityAlerts: true,
    darkMode: true,
    twoFactorEnabled: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const handleSettingChange = (setting) => (event) => {
    setSettings(prev => ({
      ...prev,
      [setting]: event.target.checked,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordChange = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.success('Account deletion request submitted. Please contact support.');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to process deletion request');
    }
  };

  // Premium Settings Card Component
  const SettingsCard = ({ icon, title, children, gradient }) => (
    <Card
      bg="linear-gradient(145deg, #1e2936 0%, #1a202c 100%)"
      border="1px solid"
      borderColor="whiteAlpha.100"
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      boxShadow="0 20px 40px rgba(0,0,0,0.3)"
    >
      <CardBody p={6}>
        <Flex align="center" mb={6}>
          <Box
            w={12}
            h={12}
            borderRadius="xl"
            bgGradient={gradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            mr={4}
            boxShadow="0 8px 32px rgba(34, 211, 238, 0.3)"
          >
            {icon}
          </Box>
          <Heading size="lg" color="white" fontWeight="bold">
            {title}
          </Heading>
        </Flex>
        {children}
      </CardBody>
    </Card>
  );

  // Premium Toggle Item Component
  const ToggleItem = ({ title, description, isChecked, onChange, icon }) => (
    <Box
      p={4}
      bg="whiteAlpha.50"
      borderRadius="xl"
      border="1px solid"
      borderColor="whiteAlpha.100"
      _hover={{ bg: 'whiteAlpha.100' }}
      transition="all 0.2s"
    >
      <HStack justify="space-between">
        <HStack spacing={3}>
          <Box color="gray.400">
            {icon}
          </Box>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" color="white" fontSize="md">
              {title}
            </Text>
            <Text fontSize="sm" color="gray.400">
              {description}
            </Text>
          </VStack>
        </HStack>
        <Switch
          isChecked={isChecked}
          onChange={onChange}
          colorScheme="cyan"
          size="lg"
        />
      </HStack>
    </Box>
  );

  return (
    <Box p={6} bg="#0f1419" minH="100vh">
      {/* Header */}
      <VStack align="start" spacing={2} mb={8}>
        <Heading size="xl" color="white" fontWeight="black" letterSpacing="tight">
          Settings & Preferences
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Customize your account security, notifications, and preferences
        </Text>
      </VStack>

      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={8}>
        {/* Security Settings */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <SettingsCard
            icon={<FiShield size={24} />}
            title="Security & Authentication"
            gradient="linear(135deg, #3b82f6, #1d4ed8)"
          >
            <VStack spacing={6} align="stretch">
              {/* Password Change Section */}
              <Box
                as="form"
                onSubmit={handlePasswordSubmit(handlePasswordChange)}
                p={6}
                bg="whiteAlpha.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <Heading size="md" mb={4} color="white">
                  Change Password
                </Heading>
                
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={!!passwordErrors.currentPassword}>
                    <FormLabel color="gray.300">Current Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...registerPassword('currentPassword')}
                        type={showPasswords.current ? 'text' : 'password'}
                        placeholder="Enter current password"
                        bg="gray.800"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                        _placeholder={{ color: "gray.500" }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          aria-label="Toggle password visibility"
                          icon={showPasswords.current ? <FiEyeOff /> : <FiEye />}
                          onClick={() => togglePasswordVisibility('current')}
                          color="gray.400"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {passwordErrors.currentPassword && (
                      <Text color="red.400" fontSize="sm" mt={1}>
                        {passwordErrors.currentPassword.message}
                      </Text>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!passwordErrors.newPassword}>
                    <FormLabel color="gray.300">New Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...registerPassword('newPassword')}
                        type={showPasswords.new ? 'text' : 'password'}
                        placeholder="Enter new password"
                        bg="gray.800"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                        _placeholder={{ color: "gray.500" }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          aria-label="Toggle password visibility"
                          icon={showPasswords.new ? <FiEyeOff /> : <FiEye />}
                          onClick={() => togglePasswordVisibility('new')}
                          color="gray.400"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {passwordErrors.newPassword && (
                      <Text color="red.400" fontSize="sm" mt={1}>
                        {passwordErrors.newPassword.message}
                      </Text>
                    )}
                  </FormControl>
                  
                  <FormControl isInvalid={!!passwordErrors.confirmPassword}>
                    <FormLabel color="gray.300">Confirm New Password</FormLabel>
                    <InputGroup>
                      <Input
                        {...registerPassword('confirmPassword')}
                        type={showPasswords.confirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        bg="gray.800"
                        border="1px solid"
                        borderColor="whiteAlpha.200"
                        color="white"
                        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182ce" }}
                        _placeholder={{ color: "gray.500" }}
                      />
                      <InputRightElement>
                        <IconButton
                          variant="ghost"
                          aria-label="Toggle password visibility"
                          icon={showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                          onClick={() => togglePasswordVisibility('confirm')}
                          color="gray.400"
                          size="sm"
                        />
                      </InputRightElement>
                    </InputGroup>
                    {passwordErrors.confirmPassword && (
                      <Text color="red.400" fontSize="sm" mt={1}>
                        {passwordErrors.confirmPassword.message}
                      </Text>
                    )}
                  </FormControl>
                  
                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    size="lg"
                    borderRadius="xl"
                    leftIcon={<FiLock />}
                  >
                    Update Password
                  </Button>
                </VStack>
              </Box>

              {/* Two-Factor Authentication */}
              <ToggleItem
                title="Two-Factor Authentication"
                description="Add an extra layer of security with 2FA"
                isChecked={settings.twoFactorEnabled}
                onChange={handleSettingChange('twoFactorEnabled')}
                icon={<FiShield />}
              />
            </VStack>
          </SettingsCard>
        </GridItem>

        {/* Notification Settings */}
        <GridItem>
          <SettingsCard
            icon={<FiBell size={24} />}
            title="Notifications"
            gradient="linear(135deg, #10b981, #059669)"
          >
            <VStack spacing={4} align="stretch">
              <ToggleItem
                title="Email Notifications"
                description="Receive notifications via email"
                isChecked={settings.emailNotifications}
                onChange={handleSettingChange('emailNotifications')}
                icon={<FiBell />}
              />

              <ToggleItem
                title="SMS Notifications"
                description="Receive notifications via SMS"
                isChecked={settings.smsNotifications}
                onChange={handleSettingChange('smsNotifications')}
                icon={<FiBell />}
              />

              <ToggleItem
                title="Marketing Emails"
                description="Receive marketing and promotional emails"
                isChecked={settings.marketingEmails}
                onChange={handleSettingChange('marketingEmails')}
                icon={<FiBell />}
              />

              <ToggleItem
                title="Security Alerts"
                description="Important security notifications"
                isChecked={settings.securityAlerts}
                onChange={handleSettingChange('securityAlerts')}
                icon={<FiShield />}
              />
            </VStack>
          </SettingsCard>
        </GridItem>

        {/* Appearance Settings */}
        <GridItem>
          <SettingsCard
            icon={<FiGrid size={24} />}
            title="Appearance & Language"
            gradient="linear(135deg, #8b5cf6, #7c3aed)"
          >
            <VStack spacing={6} align="stretch">
              <ToggleItem
                title="Dark Mode"
                description="Use dark theme across the application"
                isChecked={settings.darkMode}
                onChange={handleSettingChange('darkMode')}
                icon={<FiGrid />}
              />

              <Box
                p={4}
                bg="whiteAlpha.50"
                borderRadius="xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                <FormControl>
                  <FormLabel color="gray.300" mb={3} fontWeight="bold">
                    Language Preference
                  </FormLabel>
                  <Select 
                    defaultValue="en" 
                    size="md"
                    bg="gray.800"
                    color="white"
                    borderColor="whiteAlpha.200"
                    borderRadius="lg"
                    _focus={{ borderColor: "purple.400" }}
                  >
                    <option value="en" style={{ backgroundColor: '#2d3748' }}>English</option>
                    <option value="es" style={{ backgroundColor: '#2d3748' }}>Spanish</option>
                    <option value="fr" style={{ backgroundColor: '#2d3748' }}>French</option>
                    <option value="de" style={{ backgroundColor: '#2d3748' }}>German</option>
                  </Select>
                </FormControl>
              </Box>
            </VStack>
          </SettingsCard>
        </GridItem>

        {/* Account Management */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <SettingsCard
            icon={<FiUser size={24} />}
            title="Account Information"
            gradient="linear(135deg, #f59e0b, #d97706)"
          >
            <VStack spacing={6} align="stretch">
              {/* System Information */}
              <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Account Type
                  </Text>
                  <Badge
                    colorScheme={user?.role === 'company_admin' ? 'purple' : 'blue'}
                    variant="solid"
                    borderRadius="full"
                    px={3}
                    py={1}
                  >
                    {user?.role === 'company_admin' ? 'Admin' : 'Staff'}
                  </Badge>
                </Box>
                
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Company
                  </Text>
                  <Text fontWeight="bold" color="white" isTruncated>
                    {company?.name || 'N/A'}
                  </Text>
                </Box>
                
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Member Since
                  </Text>
                  <Text fontWeight="bold" color="white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </Box>
                
                <Box
                  p={4}
                  bg="whiteAlpha.50"
                  borderRadius="xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                >
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Last Login
                  </Text>
                  <Text fontWeight="bold" color="white">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                  </Text>
                </Box>
              </Grid>

              {/* Danger Zone */}
              <Box
                p={6}
                bg="rgba(239, 68, 68, 0.1)"
                borderRadius="xl"
                border="1px solid"
                borderColor="red.800"
              >
                <HStack spacing={3} mb={4}>
                  <FiAlertTriangle color="#ef4444" />
                  <Heading size="md" color="red.400">
                    Danger Zone
                  </Heading>
                </HStack>
                
                <Text color="gray.300" mb={4} fontSize="sm">
                  These actions are irreversible. Please proceed with caution.
                </Text>

                <Button
                  variant="outline"
                  colorScheme="red"
                  leftIcon={<FiTrash2 />}
                  onClick={() => setDeleteDialogOpen(true)}
                  isDisabled={user?.role === 'company_admin'}
                  borderRadius="xl"
                >
                  {user?.role === 'company_admin' 
                    ? 'Cannot Delete Admin Account' 
                    : 'Delete Account'
                  }
                </Button>

                {user?.role === 'company_admin' && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Company admins cannot delete their own accounts. 
                    Please contact support or assign another admin first.
                  </Text>
                )}
              </Box>
            </VStack>
          </SettingsCard>
        </GridItem>
      </Grid>

      {/* Delete Account Modal */}
      <Modal isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent bg="#181E27" color="white" borderRadius="2xl" border="1px solid" borderColor="red.800">
          <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.100" pb={4}>
            <HStack spacing={3}>
              <FiAlertTriangle color="#ef4444" size={24} />
              <Text fontSize="xl" fontWeight="bold">Delete Account</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="start" spacing={4}>
              <Text color="white" fontSize="lg">
                Are you absolutely sure you want to delete your account?
              </Text>
              <Alert status="error" bg="rgba(239, 68, 68, 0.1)" border="1px solid" borderColor="red.800" borderRadius="lg">
                <AlertIcon color="red.400" />
                <Box>
                  <Text fontWeight="bold" color="red.400">This action cannot be undone</Text>
                  <Text fontSize="sm" color="gray.300">
                    All your data will be permanently deleted and cannot be recovered.
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
            <HStack spacing={3}>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                variant="ghost"
                color="gray.300"
                borderRadius="xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteAccount} 
                colorScheme="red"
                borderRadius="xl"
                leftIcon={<FiTrash2 />}
              >
                Delete Account
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Settings;
