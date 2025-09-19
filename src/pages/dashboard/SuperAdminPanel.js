import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Drawer,
  Flex,
  HStack,
  VStack,
  Text,
  Divider,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Badge,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import {
  FiMenu,
  FiHome,
  FiBriefcase,
  FiBarChart,
  FiSettings,
  FiLogOut,
  FiUser,
  FiTrendingUp,
  FiBell,
  FiSearch,
  FiUsers,
  FiShield,
  FiDatabase, // ✅ NEW ICON for Master Data
} from "react-icons/fi";

import SuperAdminDashboard from "../../components/dashboard/SuperAdminDashboard";
import Analytics from "../../components/superadmin/Analytics";
import Settings from "../../components/settings/Settings";
import UpgradeRequests from "../../components/superadmin/UpgradeRequests";
import CompaniesManagement from "../../components/superadmin/CompaniesManagement";
import CompanyAccessManagement from "../../components/superadmin/CompanyAccessManagement";

// ✅ NEW IMPORT - Add Master Data Manager
import MasterDataManager from "../../components/superadmin/MasterDataManager";

import { logoutUser } from "../../store/slices/authSlice";

// Fixed responsive sidebar width
const SIDEBAR_WIDTH = {
  base: "0px",
  lg: "280px",
};

const SuperAdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/auth/login");
  };

  // ✅ UPDATED - Added Master Data Management to menu items
  const menuItems = [
    {
      text: "Dashboard",
      icon: <FiHome size={20} />,
      path: "/dashboard/super-admin",
    },
    {
      text: "Master Data", // ✅ NEW MENU ITEM
      icon: <FiDatabase size={20} />,
      path: "/dashboard/super-admin/master-data",
    },
    {
      text: "Companies",
      icon: <FiUsers size={20} />, // More intuitive icon for companies
      path: "/dashboard/super-admin/companies",
    },
    {
      text: "Access Management",
      icon: <FiShield size={20} />,
      path: "/dashboard/super-admin/access",
    },
    {
      text: "Upgrade Requests",
      icon: <FiTrendingUp size={20} />,
      path: "/dashboard/super-admin/upgrade-requests",
    },
    {
      text: "Analytics",
      icon: <FiBarChart size={20} />,
      path: "/dashboard/super-admin/analytics",
    },
    {
      text: "Settings",
      icon: <FiSettings size={20} />,
      path: "/dashboard/super-admin/settings",
    },
  ];

  const SidebarContent = () => (
    <Box
      h="100vh"
      w="280px"
      bg="linear-gradient(180deg, #1a202c 0%, #2d3748 100%)"
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient:
          "linear(to-b, rgba(66, 153, 225, 0.1), rgba(159, 122, 234, 0.05))",
        pointerEvents: "none",
      }}
    >
      {/* Brand Section */}
      <Box px={6} py={8} position="relative">
        <HStack spacing={3} mb={2}>
          <Box
            w={10}
            h={10}
            borderRadius="xl"
            bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            fontSize="lg"
            boxShadow="0 8px 32px rgba(102, 126, 234, 0.3)"
          >
            SA
          </Box>
          <VStack align="start" spacing={0}>
            <Text
              color="white"
              fontSize="lg"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Super Admin
            </Text>
            <Text color="gray.400" fontSize="sm">
              Management Portal
            </Text>
          </VStack>
        </HStack>
      </Box>

      <Box px={4}>
        <Divider borderColor="whiteAlpha.200" />
      </Box>

      {/* User Info */}
      <Box px={6} py={4}>
        <HStack spacing={3}>
          <Avatar
            size="md"
            name={`${user?.firstName} ${user?.lastName}`}
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            color="white"
          />
          <VStack align="start" spacing={0} flex="1" minW="0">
            <Text color="white" fontSize="sm" fontWeight="semibold" isTruncated>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text color="gray.400" fontSize="xs">
              Administrator
            </Text>
          </VStack>
          <Badge
            colorScheme="green"
            variant="solid"
            fontSize="8px"
            borderRadius="full"
          >
            ONLINE
          </Badge>
        </HStack>
      </Box>

      <Box px={4} mb={4}>
        <Divider borderColor="whiteAlpha.200" />
      </Box>

      {/* Navigation Menu */}
      <VStack spacing={2} px={4} align="stretch" flex="1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Box key={item.text} position="relative">
              <Button
                variant="ghost"
                leftIcon={item.icon}
                justifyContent="flex-start"
                w="full"
                h="48px"
                px={4}
                bg={isActive ? "whiteAlpha.100" : "transparent"}
                color={isActive ? "white" : "gray.300"}
                _hover={{
                  bg: isActive ? "whiteAlpha.200" : "whiteAlpha.100",
                  color: "white",
                  transform: "translateX(4px)",
                }}
                _active={{ bg: "whiteAlpha.200" }}
                fontWeight={isActive ? "semibold" : "medium"}
                fontSize="14px"
                borderRadius="xl"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                onClick={() => navigate(item.path)}
                boxShadow={
                  isActive ? "0 4px 20px rgba(102, 126, 234, 0.3)" : "none"
                }
                position="relative"
                overflow="hidden"
                _before={
                  isActive
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: "3px",
                        bgGradient: "linear(to-b, #667eea, #764ba2)",
                        borderRadius: "full",
                      }
                    : {}
                }
              >
                <Text isTruncated>{item.text}</Text>
              </Button>
              {isActive && (
                <Box
                  position="absolute"
                  right={4}
                  top="50%"
                  transform="translateY(-50%)"
                  w={2}
                  h={2}
                  bg="cyan.400"
                  borderRadius="full"
                  boxShadow="0 0 10px rgba(0, 255, 255, 0.6)"
                />
              )}
            </Box>
          );
        })}
      </VStack>

      {/* Bottom Section */}
      <Box p={4}>
        <Box
          p={4}
          bg="whiteAlpha.50"
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
          backdropFilter="blur(10px)"
        >
          <VStack spacing={2}>
            <Text color="gray.300" fontSize="xs" textAlign="center">
              System Status
            </Text>
            <HStack spacing={2}>
              <Box w={2} h={2} bg="green.400" borderRadius="full" />
              <Text color="green.400" fontSize="xs">
                All Systems Operational
              </Text>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box minH="100vh" bg="#0f1419" w="100vw" overflow="hidden">
      {/* Top Header */}
      <Box
        as="header"
        position="fixed"
        top={0}
        left={SIDEBAR_WIDTH}
        right={0}
        h="70px"
        bg="linear-gradient(135deg, rgba(26, 32, 44, 0.95) 0%, rgba(45, 55, 72, 0.95) 100%)"
        backdropFilter="blur(20px)"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        zIndex={999}
        boxShadow="0 4px 32px rgba(0, 0, 0, 0.1)"
      >
        <Flex alignItems="center" h="full" px={6}>
          <IconButton
            aria-label="open drawer"
            icon={<FiMenu color="white" />}
            onClick={onOpen}
            display={{ base: "flex", lg: "none" }}
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.100" }}
            mr={4}
          />
          <VStack align="start" spacing={0} flex="1">
            <Text
              color="white"
              fontSize="xl"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Good evening, {user?.firstName}
            </Text>
            <Text color="gray.400" fontSize="sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </VStack>
          <HStack spacing={4}>
            <IconButton
              aria-label="search"
              icon={<FiSearch />}
              variant="ghost"
              color="gray.300"
              _hover={{ bg: "whiteAlpha.100", color: "white" }}
              borderRadius="xl"
            />
            <Box position="relative">
              <IconButton
                aria-label="notifications"
                icon={<FiBell />}
                variant="ghost"
                color="gray.300"
                _hover={{ bg: "whiteAlpha.100", color: "white" }}
                borderRadius="xl"
              />
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                colorScheme="red"
                borderRadius="full"
                boxSize="18px"
                fontSize="9px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                3
              </Badge>
            </Box>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                p={0}
                minW="auto"
                h="auto"
                _hover={{ transform: "scale(1.05)" }}
                transition="transform 0.2s"
              >
                <Avatar
                  size="sm"
                  name={`${user?.firstName} ${user?.lastName}`}
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                />
              </MenuButton>
              <MenuList
                bg="gray.800"
                borderColor="whiteAlpha.200"
                boxShadow="0 20px 40px rgba(0, 0, 0, 0.3)"
              >
                <MenuItem
                  icon={<FiUser />}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: "whiteAlpha.100" }}
                >
                  Profile Settings
                </MenuItem>
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                  bg="transparent"
                  color="red.300"
                  _hover={{ bg: "red.900", color: "red.200" }}
                >
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      {/* Desktop Sidebar */}
      <Box
        position="fixed"
        left={0}
        top={0}
        h="100vh"
        display={{ base: "none", lg: "block" }}
        zIndex={1000}
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
          },
        }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent p={0}>
          <DrawerCloseButton color="white" />
          <SidebarContent />
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        marginLeft={SIDEBAR_WIDTH}
        pt="70px"
        minH="100vh"
        bg="#0f1419"
        position="relative"
        w={{ base: "100%", lg: "calc(100% - 280px)" }}
      >
        {/* Background Pattern */}
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.03}
          bgImage="radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2px, transparent 0)"
          bgSize="50px 50px"
          pointerEvents="none"
        />

        <Box p={6} position="relative" maxW="full">
          <Routes>
            <Route path="/" element={<SuperAdminDashboard />} />

            {/* ✅ NEW ROUTE - Master Data Management */}
            <Route path="/master-data" element={<MasterDataManager />} />

            <Route path="/companies" element={<CompaniesManagement />} />
            <Route path="/access" element={<CompanyAccessManagement />} />
            <Route path="/upgrade-requests" element={<UpgradeRequests />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminPanel;
