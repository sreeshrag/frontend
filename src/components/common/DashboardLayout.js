import React from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  VStack,
  Text,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  useDisclosure,
  Badge,
  Heading,
  Icon,
} from '@chakra-ui/react';
import { 
  FiMenu, 
  FiBell, 
  FiChevronDown, 
  FiUser, 
  FiSettings, 
  FiLogOut,
  FiHome,
} from 'react-icons/fi';

const DashboardLayout = ({ 
  children, 
  title = "Dashboard", 
  user = {}, 
  onLogout = () => {}, 
  sidebarItems = [],
  notifications = 0 
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Color mode values - matching your login design
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.500, purple.600, pink.500)',
    'linear(to-br, brand.600, purple.700, pink.600)'
  );
  const headerBg = useColorModeValue('white', 'gray.800');
  const sidebarBg = useColorModeValue('white', 'gray.800');
  const mainBg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('brand.50', 'brand.900');
  
  const headerHeight = "70px";
  const sidebarWidth = "280px";

  return (
    <Box minH="100vh" bg={mainBg}>
      {/* Top Navigation Bar */}
      <Flex
        as="header"
        align="center"
        justify="space-between"
        w="full"
        px={6}
        py={3}
        bg={headerBg}
        borderBottomWidth="1px"
        borderBottomColor={borderColor}
        position="fixed"
        top={0}
        left={0}
        right={0}
        zIndex={1000}
        boxShadow="lg"
        h={headerHeight}
      >
        {/* Left Section */}
        <HStack spacing={4}>
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onOpen}
            variant="ghost"
            aria-label="open menu"
            icon={<FiMenu size={20} />}
            size="md"
            color={textColor}
            _hover={{ bg: hoverBg }}
          />
          
          <HStack spacing={3}>
            <Box
              p={2}
              bgGradient={bgGradient}
              borderRadius="lg"
              display={{ base: 'none', md: 'flex' }}
            >
              <Icon as={FiHome} w={5} h={5} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" color={textColor} fontWeight="700">
                {title}
              </Heading>
              <Text fontSize="xs" color={mutedColor}>
                Welcome back, {user?.firstName || 'User'}
              </Text>
            </VStack>
          </HStack>
        </HStack>

        {/* Right Section */}
        <HStack spacing={4}>
          {/* Notifications */}
          <Box position="relative">
            <IconButton
              size="md"
              variant="ghost"
              aria-label="notifications"
              icon={<FiBell size={18} />}
              color={textColor}
              _hover={{ bg: hoverBg }}
            />
            {notifications > 0 && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                colorScheme="red"
                borderRadius="full"
                boxSize="18px"
                fontSize="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {notifications > 99 ? '99+' : notifications}
              </Badge>
            )}
          </Box>
          
          {/* User Menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              cursor="pointer"
              minW={0}
              rightIcon={<FiChevronDown size={14} />}
              _hover={{ bg: hoverBg }}
              px={3}
            >
              <HStack spacing={3}>
                <Avatar 
                  size="sm" 
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  bg="brand.500"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing={0}
                >
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    {user?.firstName || ''} {user?.lastName || ''}
                  </Text>
                  <Text fontSize="xs" color={mutedColor}>
                    {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
                  </Text>
                </VStack>
              </HStack>
            </MenuButton>
            <MenuList
              boxShadow="2xl"
              border="1px"
              borderColor={borderColor}
              bg={headerBg}
              borderRadius="xl"
            >
              <MenuItem icon={<FiUser size={16} />} _hover={{ bg: hoverBg }}>
                Profile
              </MenuItem>
              <MenuItem icon={<FiSettings size={16} />} _hover={{ bg: hoverBg }}>
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem 
                icon={<FiLogOut size={16} />} 
                onClick={onLogout}
                color="red.500"
                _hover={{ bg: 'red.50', color: 'red.600' }}
              >
                Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Desktop Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={headerHeight}
        w={{ base: 0, md: sidebarWidth }}
        h={`calc(100vh - ${headerHeight})`}
        bg={sidebarBg}
        borderRightWidth="1px"
        borderRightColor={borderColor}
        display={{ base: 'none', md: 'block' }}
        overflowY="auto"
        boxShadow="lg"
      >
        {/* Sidebar Header */}
        <Box p={6} borderBottomWidth="1px" borderBottomColor={borderColor}>
          <HStack spacing={3}>
            <Box
              p={3}
              bgGradient={bgGradient}
              borderRadius="xl"
            >
              <Icon as={FiHome} w={6} h={6} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="sm" color={textColor} fontWeight="700">
                SaaS Platform
              </Heading>
              <Text fontSize="xs" color={mutedColor}>
                Management System
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Sidebar Items */}
        <VStack align="stretch" spacing={2} p={4}>
          {sidebarItems.map((item, index) => (
            <Button
              key={index}
              variant={item.isActive ? "solid" : "ghost"}
              colorScheme={item.isActive ? "brand" : "gray"}
              leftIcon={item.icon ? React.cloneElement(item.icon, { size: 18 }) : null}
              justifyContent="flex-start"
              w="full"
              h="48px"
              onClick={item.onClick}
              bg={item.isActive ? bgGradient : 'transparent'}
              color={item.isActive ? 'white' : textColor}
              _hover={{
                bg: item.isActive ? bgGradient : hoverBg,
                transform: 'translateX(4px)',
              }}
              transition="all 0.3s ease"
              fontWeight={item.isActive ? "600" : "500"}
              fontSize="sm"
              borderRadius="xl"
              boxShadow={item.isActive ? "lg" : "none"}
            >
              {item.label}
            </Button>
          ))}
        </VStack>
      </Box>

      {/* Mobile Sidebar */}
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="sm"
      >
        <DrawerOverlay bg="blackAlpha.600" />
        <DrawerContent bg={sidebarBg} borderRadius="0">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderBottomColor={borderColor}>
            <HStack spacing={3}>
              <Box
                p={2}
                bgGradient={bgGradient}
                borderRadius="lg"
              >
                <Icon as={FiHome} w={5} h={5} color="white" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="sm" color={textColor} fontWeight="700">
                  {title}
                </Heading>
                <Text fontSize="xs" color={mutedColor}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </VStack>
            </HStack>
          </DrawerHeader>
          <DrawerBody p={0}>
            <VStack align="stretch" spacing={2} p={4}>
              {sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  variant={item.isActive ? "solid" : "ghost"}
                  leftIcon={item.icon ? React.cloneElement(item.icon, { size: 18 }) : null}
                  justifyContent="flex-start"
                  w="full"
                  h="48px"
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  bg={item.isActive ? bgGradient : 'transparent'}
                  color={item.isActive ? 'white' : textColor}
                  fontWeight={item.isActive ? "600" : "500"}
                  borderRadius="xl"
                  boxShadow={item.isActive ? "lg" : "none"}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Box 
        ml={{ base: 0, md: sidebarWidth }} 
        pt={headerHeight}
        minH="100vh"
        transition="margin-left 0.3s ease"
      >
        <Box p={6}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
