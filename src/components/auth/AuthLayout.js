import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FiShield, FiUsers, FiTrendingUp } from 'react-icons/fi';

const AuthLayout = ({ children, title, subtitle }) => {
  // Move ALL useColorModeValue calls to the top level - before any conditional logic
  const bgGradient = useColorModeValue(
    'linear(to-br, brand.500, purple.600, pink.500)',
    'linear(to-br, brand.600, purple.700, pink.600)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const overlayBg = useColorModeValue('blackAlpha.50', 'blackAlpha.700');
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      display="flex"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg={overlayBg}
        opacity={0.1}
      />
      
      {/* Floating Elements */}
      <Box
        position="absolute"
        top="20%"
        left="10%"
        w="100px"
        h="100px"
        bgGradient="linear(to-r, brand.400, purple.400)"
        borderRadius="50%"
        opacity={0.1}
        animation="float 6s ease-in-out infinite"
      />
      <Box
        position="absolute"
        bottom="20%"
        right="15%"
        w="150px"
        h="150px"
        bgGradient="linear(to-r, purple.400, pink.400)"
        borderRadius="50%"
        opacity={0.1}
        animation="float 8s ease-in-out infinite reverse"
      />

      <Container maxW="6xl" px={6}>
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
          gap={12}
          alignItems="center"
        >
          {/* Left Side - Branding */}
          <VStack spacing={8} align="start" display={{ base: 'none', lg: 'flex' }}>
            <Box>
              <Heading
                size="2xl"
                color="white"
                fontWeight="800"
                lineHeight="1.2"
                mb={4}
              >
                Construction & Maintenance Industry
                <Text as="span" display="block" color="brand.100">
                  Management Platform
                </Text>
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.800" mb={8}>
                Streamline your business operations with our comprehensive
                suite of tools designed for modern teams.
              </Text>
            </Box>

            <VStack spacing={6} align="start">
              <HStack spacing={4}>
                <Box
                  p={3}
                  bg="whiteAlpha.200"
                  borderRadius="xl"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiShield} w={6} h={6} color="white" />
                </Box>
                <Box>
                  <Heading size="md" color="white" mb={1}>
                    Enterprise Security
                  </Heading>
                  <Text color="whiteAlpha.700">
                    Bank-grade encryption and security measures
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={4}>
                <Box
                  p={3}
                  bg="whiteAlpha.200"
                  borderRadius="xl"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiUsers} w={6} h={6} color="white" />
                </Box>
                <Box>
                  <Heading size="md" color="white" mb={1}>
                    Team Collaboration
                  </Heading>
                  <Text color="whiteAlpha.700">
                    Real-time collaboration tools for distributed teams
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={4}>
                <Box
                  p={3}
                  bg="whiteAlpha.200"
                  borderRadius="xl"
                  backdropFilter="blur(10px)"
                >
                  <Icon as={FiTrendingUp} w={6} h={6} color="white" />
                </Box>
                <Box>
                  <Heading size="md" color="white" mb={1}>
                    Analytics & Insights
                  </Heading>
                  <Text color="whiteAlpha.700">
                    Data-driven insights to grow your business
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </VStack>

          {/* Right Side - Auth Form */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            boxShadow="2xl"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <VStack spacing={6} align="start" w="full">
              <Box textAlign="center" w="full">
                <Heading
                  size="xl"
                  fontWeight="700"
                  color={titleColor}
                  mb={2}
                >
                  {title}
                </Heading>
                {subtitle && (
                  <Text
                    fontSize="md"
                    color={subtitleColor}
                  >
                    {subtitle}
                  </Text>
                )}
              </Box>

              <Box w="full">
                {children}
              </Box>
            </VStack>
          </Box>
        </Box>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </Box>
  );
};

export default AuthLayout;
