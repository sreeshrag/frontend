import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Heading,
} from "@chakra-ui/react";
import { FiSearch, FiMoreVertical, FiShield, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

const CompanyAccessManagement = () => {
  // State management
  const [companies, setCompanies] = useState([]);
  const [sections, setSections] = useState([]);
  const [modalSections, setModalSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(new Set());
  const [error, setError] = useState(null);
  const [pendingChanges, setPendingChanges] = useState([]);
  const [tempAccess, setTempAccess] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Modal states
  const {
    isOpen: isAccessModalOpen,
    onOpen: onAccessModalOpen,
    onClose: onAccessModalBaseClose,
  } = useDisclosure();

  const onAccessModalClose = () => {
    setPendingChanges([]);
    setTempAccess(new Map());
    setSelectedCompany(null);
    setCompanyAccess([]);
    onAccessModalBaseClose();
  };

  const {
    isOpen: isSectionModalOpen,
    onOpen: onSectionModalOpen,
    onClose: onSectionModalBaseClose,
  } = useDisclosure();

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyAccess, setCompanyAccess] = useState([]);
  const [newSection, setNewSection] = useState({ name: "", description: "" });
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: "",
    sectionId: "",
  });

  const fetchCompaniesWithAccess = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.currentPage,
        size: pagination.itemsPerPage,
        search: searchTerm,
        plan: planFilter || "all",
      };

      console.log("Fetching companies with params:", params);
      const response = await api.get("/access/companies-access", { params });

      if (response.data.success) {
        const companiesData = response.data.data.companies || [];
        setCompanies(companiesData);
        setPagination((prev) => ({
          ...prev,
          ...response.data.data.pagination,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch companies");
      }
    } catch (error) {
      console.error("Fetch companies error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch companies with access data";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionsAndPermissions = async () => {
    try {
      const response = await api.get("/access/sections");
      console.log("Sections API response:", response.data);

      if (response.data.success) {
        const sectionsData = response.data.data || [];

        const validSections = sectionsData
          .filter((section) => section && section.id && section.name)
          .map((section) => ({
            ...section,
            permissions: Array.isArray(section.permissions)
              ? section.permissions.filter((p) => p && p.id && p.name)
              : [],
          }));

        setSections(validSections);
      }
    } catch (error) {
      console.error("Fetch sections error:", error);
      if (error.response?.status !== 404) {
        toast.error("Failed to fetch sections");
      }
    }
  };

  const fetchModalSections = async () => {
    try {
      const response = await api.get("/access/sections");
      console.log("Modal sections API response:", response.data);
      if (response.data.success) {
        const sectionsData = response.data.data || [];
        setModalSections(sectionsData.filter((section) => section.isActive));
      }
    } catch (error) {
      console.error("Fetch modal sections error:", error);
      toast.error("Failed to fetch sections");
    }
  };

  const fetchCompanyAccessDetails = async (companyId) => {
    if (!companyId) {
      console.error("Company ID is required to fetch access details");
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const [accessResponse, sectionsData] = await Promise.all([
        api.get(`/access/companies/${companyId}/access`),
        api.get("/access/sections"),
      ]);

      if (!accessResponse?.data?.success) {
        throw new Error(
          accessResponse?.data?.message ||
            "Failed to fetch company access details"
        );
      }

      const { companyAccess: access } = accessResponse.data.data || {};
      const sections = sectionsData.data.success ? sectionsData.data.data : [];

      console.log("Received sections:", sections);
      console.log("Received access:", access);

      const processedSections = sections
        .filter((section) => section.isActive)
        .map((section) => ({
          ...section,
          permissions: Array.isArray(section.permissions)
            ? section.permissions.filter((p) => p.isActive)
            : [],
          isGranted: access.some(
            (a) => a.sectionId === section.id && a.isGranted
          ),
        }));

      console.log("Processed sections to set:", processedSections);
      setSections(processedSections);
      setCompanyAccess(Array.isArray(access) ? access : []);

      if (processedSections.length === 0) {
        toast("No active sections found. Please create sections first.", {
          icon: "ℹ️",
        });
      }
    } catch (error) {
      console.error("Fetch company access details error:", error);
      toast.error(error.message || "Failed to fetch company access details");
    } finally {
      setLoading(false);
    }
  };

  const handleManageAccess = async (company) => {
    console.log("Managing access for company:", company);
    setSelectedCompany(company);
    setPendingChanges([]);
    setTempAccess(new Map());
    setCompanyAccess([]);

    try {
      await fetchCompanyAccessDetails(company.id);
      onAccessModalOpen();
    } catch (error) {
      console.error("Error managing access:", error);
      toast.error("Failed to load access details. Please try again.");
    }
  };

  const isItemLoading = (sectionId, permissionId) => {
    const key = permissionId
      ? `${sectionId}-${permissionId}`
      : `section-${sectionId}`;
    return loadingItems.has(key);
  };

  const handleGrantAccess = async (companyId, sectionId, permissionId) => {
    if (!companyId || !sectionId) {
      throw new Error("Missing required parameters");
    }

    const loadingKey = permissionId
      ? `${sectionId}-${permissionId}`
      : `section-${sectionId}`;

    try {
      setLoadingItems((prev) => new Set(prev).add(loadingKey));

      const response = await api.post("/access/companies/grant-access", {
        companyId,
        sectionId,
        permissionId: permissionId || null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to grant access");
      }

      setCompanyAccess((prev) => {
        const newAccess = [...prev];

        const findAccess = (sId, pId) =>
          newAccess.findIndex(
            (a) =>
              a.sectionId === sId &&
              (pId ? a.permissionId === pId : !a.permissionId)
          );

        const existingIndex = findAccess(sectionId, permissionId);
        const accessRecord = {
          sectionId,
          permissionId,
          isGranted: true,
          grantedAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          newAccess[existingIndex] = accessRecord;
        } else {
          newAccess.push(accessRecord);
        }

        if (!permissionId) {
          const section = sections.find((s) => s.id === sectionId);
          if (section?.permissions) {
            section.permissions.forEach((permission) => {
              const permIndex = findAccess(sectionId, permission.id);
              if (permIndex >= 0) {
                newAccess[permIndex].isGranted = true;
              } else {
                newAccess.push({
                  sectionId,
                  permissionId: permission.id,
                  isGranted: true,
                  grantedAt: new Date().toISOString(),
                });
              }
            });
          }
        }

        return newAccess;
      });

      return response.data;
    } catch (error) {
      console.error("Grant access error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to grant access";
      throw new Error(errorMessage);
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(loadingKey);
        return next;
      });
    }
  };

  const handleRevokeAccess = async (companyId, sectionId, permissionId) => {
    if (!companyId || !sectionId) {
      console.error("Missing required parameters for revoke access");
      toast.error("Missing required parameters");
      return;
    }

    const loadingKey = permissionId
      ? `${sectionId}-${permissionId}`
      : `section-${sectionId}`;

    try {
      setLoadingItems((prev) => new Set(prev).add(loadingKey));

      const response = await api.post("/access/companies/revoke-access", {
        companyId,
        sectionId,
        permissionId,
      });

      if (response.data.success) {
        setCompanyAccess((prev) => {
          return prev.map((access) => {
            if (
              access.sectionId === sectionId &&
              (permissionId
                ? access.permissionId === permissionId
                : !access.permissionId)
            ) {
              return { ...access, isGranted: false };
            }
            return access;
          });
        });
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to revoke access");
      }
    } catch (error) {
      console.error("Revoke access error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to revoke access";
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(loadingKey);
        return next;
      });
    }
  };

  const handleCreateSection = async () => {
    try {
      const response = await api.post("/access/sections", newSection);

      if (response.data.success) {
        toast.success("Section created successfully");
        setNewSection({ name: "", description: "" });
        await Promise.all([
          fetchSectionsAndPermissions(),
          fetchModalSections(),
        ]);
      } else {
        toast.error(response.data.message || "Failed to create section");
      }
    } catch (error) {
      console.error("Create section error:", error);
      toast.error(error.response?.data?.message || "Failed to create section");
    }
  };

  const handleCreatePermission = async () => {
    try {
      const response = await api.post("/access/permissions", newPermission);

      if (response.data.success) {
        toast.success("Permission created successfully");
        setNewPermission({ name: "", description: "", sectionId: "" });
        await fetchSectionsAndPermissions();
      } else {
        toast.error(response.data.message || "Failed to create permission");
      }
    } catch (error) {
      console.error("Create permission error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create permission"
      );
    }
  };

  const isAccessGranted = (sectionId, permissionId) => {
    if (!sectionId) return false;

    const key = permissionId
      ? `${sectionId}-${permissionId}`
      : `section-${sectionId}`;
    if (tempAccess.has(key)) {
      return tempAccess.get(key);
    }

    const accessRecords = companyAccess.filter(
      (a) => a.sectionId === sectionId
    );

    if (permissionId) {
      const permissionAccess = accessRecords.find(
        (a) => a.permissionId === permissionId
      );
      return permissionAccess ? permissionAccess.isGranted : false;
    } else {
      const sectionAccess = accessRecords.find((a) => !a.permissionId);
      if (sectionAccess) {
        return sectionAccess.isGranted;
      }

      const section = sections.find((s) => s.id === sectionId);
      if (
        !section ||
        !section.permissions ||
        section.permissions.length === 0
      ) {
        return false;
      }

      const permissionStatuses = section.permissions.map((p) => {
        const permAccess = accessRecords.find((a) => a.permissionId === p.id);
        return permAccess ? permAccess.isGranted : false;
      });

      return permissionStatuses.every((status) => status);
    }
  };

  const handleSectionAccessChange = (sectionId, isChecked) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const changes = [];

    changes.push({
      sectionId: sectionId,
      permissionId: null,
      action: isChecked ? "grant" : "revoke",
    });

    if (section.permissions) {
      section.permissions.forEach((permission) => {
        changes.push({
          sectionId: sectionId,
          permissionId: permission.id,
          action: isChecked ? "grant" : "revoke",
        });
      });
    }

    const newTempAccess = new Map(tempAccess);
    newTempAccess.set(`section-${sectionId}`, isChecked);

    section.permissions?.forEach((permission) => {
      newTempAccess.set(`${sectionId}-${permission.id}`, isChecked);
    });

    setTempAccess(newTempAccess);

    setPendingChanges((prev) => {
      const filtered = prev.filter((p) => p.sectionId !== sectionId);
      return [...filtered, ...changes];
    });
  };

  const handlePermissionAccessChange = (sectionId, permissionId, isChecked) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newTempAccess = new Map(tempAccess);

    const permKey = `${sectionId}-${permissionId}`;
    newTempAccess.set(permKey, isChecked);

    const getCurrentPermissionState = (pId) => {
      const key = `${sectionId}-${pId}`;
      if (newTempAccess.has(key)) return newTempAccess.get(key);
      if (tempAccess.has(key)) return tempAccess.get(key);
      return isAccessGranted(sectionId, pId);
    };

    const allPermissionsGranted = section.permissions.every((p) =>
      p.id === permissionId ? isChecked : getCurrentPermissionState(p.id)
    );

    const changes = [
      { sectionId, permissionId, action: isChecked ? "grant" : "revoke" },
    ];

    const sectionKey = `section-${sectionId}`;
    const currentSectionState = newTempAccess.has(sectionKey)
      ? newTempAccess.get(sectionKey)
      : isAccessGranted(sectionId, null);

    if (currentSectionState !== allPermissionsGranted) {
      changes.push({
        sectionId,
        permissionId: null,
        action: allPermissionsGranted ? "grant" : "revoke",
      });
      newTempAccess.set(sectionKey, allPermissionsGranted);
    }

    setTempAccess(newTempAccess);

    setPendingChanges((prev) => {
      const filtered = prev.filter(
        (p) =>
          !(
            p.sectionId === sectionId &&
            (p.permissionId === permissionId || p.permissionId === null)
          )
      );

      return [...filtered, ...changes];
    });
  };

  // Memoized values to prevent unnecessary re-renders
  const memoizedCompanies = useMemo(() => companies, [companies]);
  const memoizedSections = useMemo(() => sections, [sections]);

  useEffect(() => {
    fetchCompaniesWithAccess();
    fetchSectionsAndPermissions();
  }, [searchTerm, planFilter, pagination.currentPage]);

  useEffect(() => {
    if (isSectionModalOpen) {
      fetchModalSections();
    }
  }, [isSectionModalOpen]);

  const onSectionModalClose = async () => {
    await fetchSectionsAndPermissions();
    onSectionModalBaseClose();
  };

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        h="400px"
        flexDirection="column"
      >
        <Alert status="error" variant="subtle" maxW="600px">
          <AlertIcon />
          <VStack align="start">
            <Text>An error occurred: {error}</Text>
            <Button
              size="sm"
              onClick={() => {
                setError(null);
                fetchCompaniesWithAccess();
              }}
            >
              Try Again
            </Button>
          </VStack>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="400px">
        <Spinner size="xl" color="blue.500" />
        <Text ml={4} color="gray.400">
          Loading company data...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="white" mb={2}>
            Company Access Management
          </Heading>
          <Text color="gray.400">
            Manage section and feature access for each company beyond
            subscription plans
          </Text>
        </Box>

        {/* Filters and Actions */}
        <HStack spacing={4} justify="space-between" wrap="wrap">
          <HStack spacing={4} flex="1">
            <InputGroup maxW="400px">
              <InputLeftElement>
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="whiteAlpha.100"
                border="1px solid"
                borderColor="whiteAlpha.200"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.6)",
                }}
              />
            </InputGroup>

            <Select
              placeholder="Filter by plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              maxW="200px"
              bg="whiteAlpha.100"
              border="1px solid"
              borderColor="whiteAlpha.200"
              color="white"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </Select>
          </HStack>

          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={onSectionModalOpen}
          >
            Manage Sections
          </Button>
        </HStack>

        {/* Companies Table */}
        <Card
          bg="whiteAlpha.100"
          border="1px solid"
          borderColor="whiteAlpha.200"
        >
          <CardBody p={0}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th color="gray.400" borderColor="whiteAlpha.200">
                    Company
                  </Th>
                  <Th color="gray.400" borderColor="whiteAlpha.200">
                    Plan
                  </Th>
                  <Th color="gray.400" borderColor="whiteAlpha.200">
                    Access Sections
                  </Th>
                  <Th color="gray.400" borderColor="whiteAlpha.200">
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {memoizedCompanies.map((company) => (
                  <Tr key={company.id}>
                    <Td borderColor="whiteAlpha.200">
                      <VStack align="start" spacing={1}>
                        <Text color="white" fontWeight="semibold">
                          {company.name}
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          {company.email}
                        </Text>
                      </VStack>
                    </Td>
                    <Td borderColor="whiteAlpha.200">
                      <Badge
                        colorScheme={
                          company.subscription?.plan === "enterprise"
                            ? "purple"
                            : company.subscription?.plan === "pro"
                            ? "blue"
                            : company.subscription?.plan === "basic"
                            ? "green"
                            : "gray"
                        }
                        textTransform="capitalize"
                      >
                        {company.subscription?.plan || "Free"}
                      </Badge>
                    </Td>
                    <Td borderColor="whiteAlpha.200">
                      <HStack spacing={2} wrap="wrap">
                        {company.accessSummary?.sections.length > 0 ? (
                          company.accessSummary.sections
                            .slice(0, 3)
                            .map((section, index) => (
                              <Badge key={index} colorScheme="cyan" size="sm">
                                {section}
                              </Badge>
                            ))
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            No special access
                          </Text>
                        )}
                        {company.accessSummary?.sections.length > 3 && (
                          <Badge colorScheme="gray">
                            +{company.accessSummary.sections.length - 3} more
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td borderColor="whiteAlpha.200">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          color="gray.400"
                          _hover={{ color: "white", bg: "whiteAlpha.100" }}
                        />
                        <MenuList bg="gray.800" borderColor="whiteAlpha.200">
                          <MenuItem
                            icon={<FiShield />}
                            onClick={() => handleManageAccess(company)}
                            bg="transparent"
                            color="white"
                            _hover={{ bg: "whiteAlpha.100" }}
                          >
                            Manage Access
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {memoizedCompanies.length === 0 && (
              <Box p={8} textAlign="center">
                <Text color="gray.400">No companies found</Text>
                <Text color="gray.500" fontSize="sm" mt={2}>
                  Make sure your backend is running and the database has company
                  data.
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Access Management Modal */}
      <Modal isOpen={isAccessModalOpen} onClose={onAccessModalClose} size="xl">
        <ModalOverlay />
        <ModalContent
          bg="gray.800"
          borderColor="whiteAlpha.200"
          border="1px solid"
        >
          <ModalHeader color="white">
            Manage Access - {selectedCompany?.name}
          </ModalHeader>
          <ModalCloseButton color="white" />

          <Box px={6} pt={2}>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">
                  Managing access for {selectedCompany?.name}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Grant or revoke access to sections and their permissions
                </Text>
              </VStack>
            </Alert>
          </Box>

          <ModalBody>
            <form
              id="accessForm"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!selectedCompany?.id) {
                  toast.error("No company selected");
                  return;
                }

                if (pendingChanges.length === 0) {
                  toast("No changes to save", {
                    icon: "ℹ️",
                  });
                  return;
                }

                try {
                  setLoading(true);
                  let successCount = 0;
                  let errorCount = 0;

                  const changesBySection = pendingChanges.reduce(
                    (acc, change) => {
                      const key = change.sectionId;
                      if (!acc[key]) {
                        acc[key] = [];
                      }
                      acc[key].push(change);
                      return acc;
                    },
                    {}
                  );

                  await Promise.all(
                    Object.entries(changesBySection).map(
                      async ([sectionId, changes]) => {
                        try {
                          const sectionChange = changes.find(
                            (c) => !c.permissionId
                          );
                          if (sectionChange) {
                            if (sectionChange.action === "grant") {
                              await handleGrantAccess(
                                selectedCompany.id,
                                sectionId,
                                null
                              );
                            } else {
                              await handleRevokeAccess(
                                selectedCompany.id,
                                sectionId,
                                null
                              );
                            }
                            successCount++;
                          }

                          const permissionChanges = changes.filter(
                            (c) => c.permissionId
                          );
                          await Promise.all(
                            permissionChanges.map(async (change) => {
                              try {
                                if (change.action === "grant") {
                                  await handleGrantAccess(
                                    selectedCompany.id,
                                    change.sectionId,
                                    change.permissionId
                                  );
                                } else {
                                  await handleRevokeAccess(
                                    selectedCompany.id,
                                    change.sectionId,
                                    change.permissionId
                                  );
                                }
                                successCount++;
                              } catch (error) {
                                console.error(
                                  "Error processing permission change:",
                                  change,
                                  error
                                );
                                errorCount++;
                              }
                            })
                          );
                        } catch (error) {
                          console.error(
                            "Error processing section changes:",
                            sectionId,
                            error
                          );
                          errorCount++;
                        }
                      }
                    )
                  );

                  await fetchCompanyAccessDetails(selectedCompany.id);

                  if (errorCount === 0) {
                    toast("All changes saved successfully", { icon: "✅" });
                  } else if (successCount > 0) {
                    toast(
                      `${successCount} changes saved, ${errorCount} failed`,
                      { icon: "⚠️" }
                    );
                  } else {
                    toast("Failed to save changes", { icon: "❌" });
                  }

                  setPendingChanges([]);
                  setTempAccess(new Map());
                } catch (error) {
                  console.error("Error updating access:", error);
                  toast("Failed to update access settings", { icon: "❌" });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading && (
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  py={8}
                >
                  <Spinner size="lg" color="blue.500" />
                  <Text ml={3} color="gray.400">
                    Loading sections and permissions...
                  </Text>
                </Box>
              )}

              {!loading && !Array.isArray(memoizedSections) && (
                <Box p={4} textAlign="center">
                  <Text color="gray.400">Error loading sections</Text>
                  <Text color="gray.500" fontSize="sm" mt={2}>
                    Please try refreshing the page or contact support if the
                    issue persists.
                  </Text>
                </Box>
              )}

              {!loading &&
                Array.isArray(memoizedSections) &&
                memoizedSections.length === 0 && (
                  <Box p={4} textAlign="center">
                    <Text color="gray.400">No sections available</Text>
                    <Text color="gray.500" fontSize="sm" mt={2}>
                      Please add sections and permissions in the Access
                      Management section first.
                    </Text>
                  </Box>
                )}

              {!loading &&
                Array.isArray(memoizedSections) &&
                memoizedSections.length > 0 && (
                  <VStack spacing={6} align="stretch">
                    {memoizedSections.map((section) => {
                      if (!section || !section.isActive) return null;
                      return (
                        <Card
                          key={section.id}
                          bg="whiteAlpha.50"
                          border="1px solid"
                          borderColor="whiteAlpha.200"
                        >
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
                              <HStack spacing={2}>
                                <Checkbox
                                  isChecked={isAccessGranted(section.id, null)}
                                  onChange={(e) =>
                                    handleSectionAccessChange(
                                      section.id,
                                      e.target.checked
                                    )
                                  }
                                  isDisabled={
                                    loading || isItemLoading(section.id, null)
                                  }
                                  colorScheme="blue"
                                >
                                  <Text color="white" fontSize="sm">
                                    Section Access
                                  </Text>
                                </Checkbox>
                                {isItemLoading(section.id, null) && (
                                  <Spinner size="xs" color="blue.500" />
                                )}
                              </HStack>
                            </HStack>
                          </CardHeader>
                          <CardBody pt={0}>
                            {section.permissions &&
                              section.permissions.length > 0 && (
                                <Stack spacing={2} pl={4}>
                                  <Text
                                    color="gray.300"
                                    fontSize="sm"
                                    fontWeight="semibold"
                                  >
                                    Permissions:
                                  </Text>
                                  {section.permissions.map((permission) => (
                                    <HStack
                                      key={permission.id}
                                      justify="space-between"
                                    >
                                      <VStack
                                        align="start"
                                        spacing={0}
                                        flex="1"
                                      >
                                        <Text color="white" fontSize="sm">
                                          {permission.name}
                                        </Text>
                                        {permission.description && (
                                          <Text color="gray.500" fontSize="xs">
                                            {permission.description}
                                          </Text>
                                        )}
                                      </VStack>
                                      <HStack spacing={2}>
                                        <Checkbox
                                          isChecked={isAccessGranted(
                                            section.id,
                                            permission.id
                                          )}
                                          onChange={(e) =>
                                            handlePermissionAccessChange(
                                              section.id,
                                              permission.id,
                                              e.target.checked
                                            )
                                          }
                                          colorScheme="green"
                                          size="sm"
                                          isDisabled={
                                            loading ||
                                            isItemLoading(
                                              section.id,
                                              permission.id
                                            )
                                          }
                                        />
                                        {isItemLoading(
                                          section.id,
                                          permission.id
                                        ) && (
                                          <Spinner size="xs" color="blue.500" />
                                        )}
                                      </HStack>
                                    </HStack>
                                  ))}
                                </Stack>
                              )}
                          </CardBody>
                        </Card>
                      );
                    })}
                  </VStack>
                )}
            </form>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                type="submit"
                form="accessForm"
                colorScheme="blue"
                isLoading={loading}
                loadingText="Updating..."
                isDisabled={pendingChanges.length === 0}
              >
                Update Access
              </Button>
              <Button variant="ghost" onClick={onAccessModalClose}>
                Cancel
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Section Management Modal */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={onSectionModalClose}
        size="md"
      >
        <ModalOverlay />
        <ModalContent
          bg="gray.800"
          borderColor="whiteAlpha.200"
          border="1px solid"
        >
          <ModalHeader color="white">Manage Sections & Permissions</ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Create Section */}
              <Card
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <CardHeader>
                  <Text color="white" fontWeight="semibold">
                    Create New Section
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Input
                      placeholder="Section name"
                      value={newSection.name}
                      onChange={(e) =>
                        setNewSection({ ...newSection, name: e.target.value })
                      }
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                    <Input
                      placeholder="Section description"
                      value={newSection.description}
                      onChange={(e) =>
                        setNewSection({
                          ...newSection,
                          description: e.target.value,
                        })
                      }
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                    <Button
                      colorScheme="blue"
                      onClick={handleCreateSection}
                      isDisabled={!newSection.name.trim()}
                      w="full"
                    >
                      Create Section
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Create Permission */}
              <Card
                bg="whiteAlpha.50"
                border="1px solid"
                borderColor="whiteAlpha.200"
              >
                <CardHeader>
                  <Text color="white" fontWeight="semibold">
                    Create New Permission
                  </Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <Select
                      placeholder="Select section"
                      value={newPermission.sectionId}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          sectionId: e.target.value,
                        })
                      }
                      bg="blackAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    >
                      {modalSections
                        .filter((section) => section && section.isActive)
                        .map((section) => (
                          <option
                            key={section.id}
                            value={section.id}
                            style={{ backgroundColor: "black" }}
                          >
                            {section.name}
                          </option>
                        ))}
                    </Select>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      Available sections:{" "}
                      {modalSections.filter((s) => s.isActive).length}
                    </Text>
                    <Input
                      placeholder="Permission name"
                      value={newPermission.name}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          name: e.target.value,
                        })
                      }
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                    <Input
                      placeholder="Permission description"
                      value={newPermission.description}
                      onChange={(e) =>
                        setNewPermission({
                          ...newPermission,
                          description: e.target.value,
                        })
                      }
                      bg="whiteAlpha.100"
                      border="1px solid"
                      borderColor="whiteAlpha.200"
                      color="white"
                    />
                    <Button
                      colorScheme="green"
                      onClick={handleCreatePermission}
                      isDisabled={
                        !newPermission.name.trim() || !newPermission.sectionId
                      }
                      w="full"
                    >
                      Create Permission
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSectionModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CompanyAccessManagement;
