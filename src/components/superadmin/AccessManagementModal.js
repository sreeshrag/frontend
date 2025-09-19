import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  Card,
  CardHeader,
  CardBody,
  Button,
} from '@chakra-ui/react';
import { toast } from 'react-hot-toast';

const AccessManagementModal = ({ isOpen, onClose, company, sections, loading, onGrantAccess, onRevokeAccess }) => {
  const isAccessGranted = (sectionId, permissionId) => {
    if (!sections || !company?.accessRecords) return false;
    return company.accessRecords.some(access => 
      access.isGranted && (
        (!permissionId && access.sectionId === sectionId) ||
        (permissionId && access.sectionId === sectionId && access.permissionId === permissionId)
      )
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" borderColor="whiteAlpha.200" border="1px solid">
        <ModalHeader color="white">
          Manage Access - {company?.name}
        </ModalHeader>
        <ModalCloseButton color="white" />
        
        <Box px={6} pt={2}>
          <Text fontSize="sm" color="gray.400">Debug Info:</Text>
          <Text fontSize="xs" color="gray.500" whiteSpace="pre-wrap">
            {JSON.stringify({ 
              sectionsCount: sections?.length,
              hasActiveSections: sections?.some(s => s.isActive),
              sectionIds: sections?.map(s => s.id)
            }, null, 2)}
          </Text>
        </Box>

        <ModalBody>
          {loading && (
            <Box display="flex" justifyContent="center" alignItems="center" py={8}>
              <Spinner size="lg" color="blue.500" />
            </Box>
          )}

          {!loading && !Array.isArray(sections) && (
            <Box p={4} textAlign="center">
              <Text color="gray.400">Error loading sections</Text>
            </Box>
          )}

          {!loading && Array.isArray(sections) && sections.length === 0 && (
            <Box p={4} textAlign="center">
              <Text color="gray.400">No sections available</Text>
              <Text color="gray.500" fontSize="sm" mt={2}>
                Current sections data: {JSON.stringify(sections)}
              </Text>
            </Box>
          )}

          {!loading && Array.isArray(sections) && sections.length > 0 && (
            <VStack spacing={6} align="stretch">
              {sections.map(section => {
                if (!section || !section.isActive) return null;
                
                return (
                  <Card key={section.id} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.200">
                    <CardHeader pb={2}>
                      <HStack justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text color="white" fontWeight="semibold">
                            {section.name}
                          </Text>
                          {section.description && (
                            <Text color="gray.400" fontSize="sm">
                              {section.description}
                            </Text>
                          )}
                        </VStack>
                        <Checkbox
                          isChecked={isAccessGranted(section.id, null)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onGrantAccess(company?.id, section.id, null);
                            } else {
                              onRevokeAccess(company?.id, section.id, null);
                            }
                          }}
                          colorScheme="blue"
                        >
                          <Text color="white" fontSize="sm">Section Access</Text>
                        </Checkbox>
                      </HStack>
                    </CardHeader>
                    <CardBody pt={0}>
                      {section.permissions && section.permissions.length > 0 && (
                        <VStack spacing={2} pl={4} align="stretch">
                          <Text color="gray.300" fontSize="sm" fontWeight="semibold">
                            Permissions:
                          </Text>
                          {section.permissions.map((permission) => (
                            <HStack key={permission.id} justify="space-between">
                              <VStack align="start" spacing={0} flex="1">
                                <Text color="white" fontSize="sm">
                                  {permission.name}
                                </Text>
                                {permission.description && (
                                  <Text color="gray.500" fontSize="xs">
                                    {permission.description}
                                  </Text>
                                )}
                              </VStack>
                              <Checkbox
                                isChecked={isAccessGranted(section.id, permission.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    onGrantAccess(company?.id, section.id, permission.id);
                                  } else {
                                    onRevokeAccess(company?.id, section.id, permission.id);
                                  }
                                }}
                                colorScheme="green"
                                size="sm"
                              />
                            </HStack>
                          ))}
                        </VStack>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </VStack>
          )}
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Done
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AccessManagementModal;
