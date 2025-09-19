import React from 'react';
import { Box, Text, Card, CardBody, VStack, Button } from '@chakra-ui/react';
import { FiLock, FiMail } from 'react-icons/fi';
import { useAccessControl } from '../../hooks/useAccessControl';

const ProtectedFeature = ({ 
  children, 
  sectionKey, 
  permissionKey, 
  fallback = null,
  showUpgradePrompt = true 
}) => {
  const { hasAccess, loading } = useAccessControl();

  if (loading) {
    return <Box>Loading...</Box>;
  }

  const userHasAccess = permissionKey 
    ? hasAccess(sectionKey, permissionKey)
    : hasAccess(sectionKey, 'view'); // Default to view permission

  if (userHasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return fallback;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <Box p={6}>
      <Card bg="gray.50" border="2px dashed" borderColor="gray.300">
        <CardBody>
          <VStack spacing={4} py={8}>
            <FiLock size={48} color="gray" />
            <VStack spacing={2} textAlign="center">
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Access Restricted
              </Text>
              <Text color="gray.600" maxW="md">
                This feature is not included in your current access level. 
                Contact your administrator to request access.
              </Text>
            </VStack>
            <Button 
              leftIcon={<FiMail />} 
              colorScheme="blue" 
              variant="outline"
              onClick={() => {
                // Open email client or contact form
                window.location.href = 'mailto:support@yourapp.com?subject=Access Request';
              }}
            >
              Contact Support
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProtectedFeature;
