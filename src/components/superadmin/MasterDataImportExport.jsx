import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Progress,
  Badge,
  Divider,
  useToast,
  Box,
  Code,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import {
  FiUpload,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MasterDataImportExport = ({ onDataChange }) => {
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const sampleData = {
    categories: [
      {
        code: "HVAC",
        name: "HVAC Systems",
        description: "Heating, Ventilation, and Air Conditioning",
        order: 1,
        activities: [
          {
            code: "HVAC-HEX",
            name: "Heat Exchanger Installation",
            description: "Heat exchanger equipment installation",
            defaultUnit: "No",
            order: 1,
            subTasks: [
              {
                name: "Heat Exchanger Erection (up to 350 TR)",
                description: "Installation and setup of heat exchanger units",
                defaultProductivity: 64.0,
                unit: "No",
                order: 1
              },
              {
                name: "Valve Package Installation",
                description: "Installation of valve packages for heat exchanger",
                defaultProductivity: 252.0,
                unit: "Item",
                order: 2
              }
            ]
          }
        ]
      },
      {
        code: "PL",
        name: "Plumbing",
        description: "Water supply and drainage systems",
        order: 2,
        activities: [
          {
            code: "PL-PIPE",
            name: "Pipe Installation",
            description: "Various pipe installation works",
            defaultUnit: "m",
            order: 1,
            subTasks: [
              {
                name: "UPVC Pipe Installation (50-110mm)",
                description: "Above ground UPVC pipe installation",
                defaultProductivity: 0.45,
                unit: "m",
                order: 1
              }
            ]
          }
        ]
      }
    ]
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.error('Please provide import data');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (parseError) {
        toast.error('Invalid JSON format. Please check your data.');
        return;
      }

      // Validate data structure
      if (!parsedData.categories || !Array.isArray(parsedData.categories)) {
        toast.error('Data must contain a "categories" array');
        return;
      }

      const response = await fetch('/api/super-admin/master/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedData)
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResult(result.data);
        toast.success(result.message);
        setImportData('');
        onDataChange?.();
      } else {
        toast.error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/super-admin/master/export', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `master-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Master data exported successfully');
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const loadSampleData = () => {
    setImportData(JSON.stringify(sampleData, null, 2));
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardHeader>
          <VStack align="start" spacing={1}>
            <Heading size="md" color="white">
              Import & Export Master Data
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Bulk operations for managing construction categories, activities, and sub-tasks
            </Text>
          </VStack>
        </CardHeader>
      </Card>

      <HStack spacing={6} align="start">
        {/* Import Section */}
        <VStack spacing={4} align="stretch" flex="1">
          <Card bg="gray.800" borderColor="gray.700">
            <CardHeader>
              <HStack spacing={2}>
                <FiUpload />
                <Heading size="sm" color="white">Import Data</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">
                      Paste your master data in JSON format below. Existing items will be updated, 
                      new items will be created.
                    </Text>
                  </Box>
                </Alert>

                <FormControl>
                  <FormLabel color="gray.300">Master Data JSON</FormLabel>
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your JSON data here..."
                    rows={15}
                    bg="gray.700"
                    color="white"
                    borderColor="gray.600"
                    fontFamily="mono"
                    fontSize="sm"
                  />
                </FormControl>

                <HStack>
                  <Button
                    leftIcon={<FiUpload />}
                    colorScheme="blue"
                    onClick={handleImport}
                    isLoading={importing}
                    isDisabled={!importData.trim()}
                  >
                    Import Data
                  </Button>
                  <Button
                    leftIcon={<FiFileText />}
                    variant="outline"
                    onClick={loadSampleData}
                  >
                    Load Sample
                  </Button>
                </HStack>

                {importResult && (
                  <Alert status="success">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold" mb={2}>Import Completed!</Text>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Badge colorScheme="blue">{importResult.totalImported.categories}</Badge>
                          <Text fontSize="sm">Categories created/updated</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="green">{importResult.totalImported.activities}</Badge>
                          <Text fontSize="sm">Activities created/updated</Text>
                        </HStack>
                        <HStack>
                          <Badge colorScheme="orange">{importResult.totalImported.subTasks}</Badge>
                          <Text fontSize="sm">Sub-tasks created/updated</Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        {/* Export Section */}
        <VStack spacing={4} align="stretch" flex="1">
          <Card bg="gray.800" borderColor="gray.700">
            <CardHeader>
              <HStack spacing={2}>
                <FiDownload />
                <Heading size="sm" color="white">Export Data</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <Text fontSize="sm">
                      Export all master data including categories, activities, and sub-tasks 
                      in JSON format.
                    </Text>
                  </Box>
                </Alert>

                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="green"
                  onClick={handleExport}
                  isLoading={exporting}
                  size="lg"
                >
                  Export Master Data
                </Button>

                <Box>
                  <Text color="gray.300" fontSize="sm" fontWeight="bold" mb={2}>
                    Export includes:
                  </Text>
                  <List spacing={1}>
                    <ListItem color="gray.400" fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.400" />
                      All master categories with details
                    </ListItem>
                    <ListItem color="gray.400" fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.400" />
                      All activities within each category
                    </ListItem>
                    <ListItem color="gray.400" fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.400" />
                      All sub-tasks with productivity rates
                    </ListItem>
                    <ListItem color="gray.400" fontSize="sm">
                      <ListIcon as={FiCheckCircle} color="green.400" />
                      Hierarchical structure maintained
                    </ListItem>
                  </List>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* JSON Format Guide */}
          <Card bg="gray.800" borderColor="gray.700">
            <CardHeader>
              <HStack spacing={2}>
                <FiInfo />
                <Heading size="sm" color="white">JSON Format Guide</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text color="gray.300" fontSize="sm">
                  Required JSON structure:
                </Text>
                <Code colorScheme="blue" p={3} borderRadius="md" fontSize="xs">
                  {`{
  "categories": [
    {
      "code": "HVAC",
      "name": "HVAC Systems",
      "description": "Optional description",
      "order": 1,
      "activities": [
        {
          "code": "HVAC-001",
          "name": "Activity Name",
          "defaultUnit": "No",
          "order": 1,
          "subTasks": [
            {
              "name": "Task Name",
              "defaultProductivity": 64.0,
              "unit": "No",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}`}
                </Code>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </HStack>
    </VStack>
  );
};

export default MasterDataImportExport;
