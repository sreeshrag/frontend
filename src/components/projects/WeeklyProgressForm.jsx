import React, { useState, useEffect, useMemo, useCallback } from "react";
import { projectTaskAPI } from '../../services/api';
import {
  Box, Card, CardBody, CardHeader, Heading, VStack, HStack, FormControl,
  FormLabel, Textarea, Button, Table, Thead, Tbody, Tr, Th, Td, NumberInput,
  NumberInputField, Select, Alert, AlertIcon, AlertDescription, useToast,
  Badge, Stat, StatLabel, StatNumber, Progress, Text,
} from "@chakra-ui/react";

const WeeklyProgressForm = ({
  taskId,
  taskDetails,
  existingProgress,
  onSave,
  onCancel,
}) => {
  const toast = useToast();
  const currentDate = new Date();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Default weekly data structure
  const defaultWeeklyData = useMemo(() => [
    { week: 1, targetedQty: 0, achievedQty: 0, consumedManhours: 0 },
    { week: 2, targetedQty: 0, achievedQty: 0, consumedManhours: 0 },
    { week: 3, targetedQty: 0, achievedQty: 0, consumedManhours: 0 },
    { week: 4, targetedQty: 0, achievedQty: 0, consumedManhours: 0 },
  ], []);

  const [formData, setFormData] = useState(() => ({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    weeklyData: [...defaultWeeklyData],
    additionalLapsedManhours: 0,
    justification: "",
  }));

  // Initialize form data from existing progress - ENHANCED
  useEffect(() => {
    console.log("🔄 WeeklyProgressForm useEffect - existingProgress:", existingProgress);
    console.log("🔄 Initialized flag:", initialized);
    
    if (existingProgress && !initialized) {
      try {
        let weeklyData = [...defaultWeeklyData];
        
        if (existingProgress.weeklyBreakdown) {
          console.log("📊 Processing weeklyBreakdown:", existingProgress.weeklyBreakdown);
          
          let parsedData;
          try {
            // Handle double-encoded JSON strings
            let breakdown = existingProgress.weeklyBreakdown;
            if (typeof breakdown === 'string') {
              // First parse
              breakdown = JSON.parse(breakdown);
              // Check if it's still a string (double-encoded)
              if (typeof breakdown === 'string') {
                breakdown = JSON.parse(breakdown);
              }
            }
            parsedData = breakdown;
          } catch (parseError) {
            console.error("❌ JSON Parse Error:", parseError);
            parsedData = [];
          }

          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log("✅ Parsed weekly data:", parsedData);
            
            weeklyData = parsedData.map((week, index) => ({
              week: index + 1,
              targetedQty: Number(week.targetedQty) || 0,
              achievedQty: Number(week.achievedQty) || 0,
              consumedManhours: Number(week.consumedManhours) || 0
            }));

            // Ensure exactly 4 weeks
            while (weeklyData.length < 4) {
              weeklyData.push({
                week: weeklyData.length + 1,
                targetedQty: 0,
                achievedQty: 0,
                consumedManhours: 0
              });
            }
            weeklyData = weeklyData.slice(0, 4); // Limit to 4 weeks
          }
        }

        console.log("🎯 Setting form data with weeklyData:", weeklyData);

        setFormData({
          year: Number(existingProgress.year) || currentDate.getFullYear(),
          month: Number(existingProgress.month) || (currentDate.getMonth() + 1),
          weeklyData: weeklyData,
          additionalLapsedManhours: Number(existingProgress.additionalLapsedManhours) || 0,
          justification: existingProgress.justification || ""
        });

        setInitialized(true);
        console.log("✅ Form initialized successfully");

      } catch (error) {
        console.error('❌ Error processing existing progress:', error);
        toast({
          title: "Warning",
          description: "There was an issue loading the existing progress data",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (!existingProgress) {
      console.log("ℹ️ No existing progress - using defaults");
      setInitialized(true);
    }
  }, [existingProgress, initialized, defaultWeeklyData, currentDate, toast]);

  // Reset initialization when existingProgress changes
  useEffect(() => {
    setInitialized(false);
  }, [existingProgress]);

  // Safe calculation with array check
  const calculateTotals = useCallback(() => {
    const safeWeeklyData = Array.isArray(formData.weeklyData) ? formData.weeklyData : defaultWeeklyData;
    
    return safeWeeklyData.reduce(
      (acc, week) => ({
        totalTargeted: acc.totalTargeted + (Number(week.targetedQty) || 0),
        totalAchieved: acc.totalAchieved + (Number(week.achievedQty) || 0),
        totalConsumed: acc.totalConsumed + (Number(week.consumedManhours) || 0),
      }),
      { totalTargeted: 0, totalAchieved: 0, totalConsumed: 0 }
    );
  }, [formData.weeklyData, defaultWeeklyData]);

  // Calculate variances
  const calculateVariances = useCallback(() => {
    const totals = calculateTotals();
    const varianceQuantity = totals.totalAchieved - totals.totalTargeted;
    const expectedManhours = totals.totalAchieved * (taskDetails?.productivity || 0);
    const varianceManhours = totals.totalConsumed - expectedManhours;
    return { varianceQuantity, varianceManhours };
  }, [calculateTotals, taskDetails?.productivity]);

  const handleWeeklyDataChange = useCallback((weekIndex, field, value) => {
    const numValue = Number(value) || 0;
    console.log(`📊 Updating week ${weekIndex + 1}, field: ${field}, value: ${numValue}`);
    
    setFormData(prev => ({
      ...prev,
      weeklyData: prev.weeklyData.map((week, index) =>
        index === weekIndex
          ? { ...week, [field]: numValue }
          : week
      )
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("🚀 Submitting formData:", formData);
      
      const response = await projectTaskAPI.recordWeeklyProgress(taskId, formData);
      
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Weekly progress saved successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        onSave && onSave(response.data.data);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to save progress",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("❌ Error saving weekly progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress. Please check your connection.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = calculateTotals();
  const variances = calculateVariances();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Calculate efficiency with NaN protection
  const overallEfficiency = totals.totalTargeted > 0
    ? (totals.totalAchieved / totals.totalTargeted) * 100
    : 0;

  // Debug render
  console.log("🎨 Rendering form with weeklyData:", formData.weeklyData);

  return (
    <Card maxW="6xl" mx="auto" bg="gray.800" borderColor="gray.700">
      <CardHeader>
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="white">
            Weekly Progress Entry
          </Heading>
          <HStack>
            <Badge colorScheme="blue">{taskDetails?.category}</Badge>
            <Badge colorScheme="green">{taskDetails?.name}</Badge>
            <Badge colorScheme="purple">
              Productivity: {taskDetails?.productivity || 0}
            </Badge>
            {existingProgress && (
              <Badge colorScheme="yellow">
                Editing: {existingProgress.month}/{existingProgress.year}
              </Badge>
            )}
          </HStack>
        </VStack>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            
            {/* Period Selection */}
            <HStack spacing={4} bg="gray.700" p={4} borderRadius="md">
              <FormControl maxW="200px">
                <FormLabel color="gray.300">Year</FormLabel>
                <Select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value),
                    }))
                  }
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                >
                  {Array.from(
                    { length: 10 },
                    (_, i) => currentDate.getFullYear() - 2 + i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl maxW="200px">
                <FormLabel color="gray.300">Month</FormLabel>
                <Select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      month: parseInt(e.target.value),
                    }))
                  }
                  bg="gray.600"
                  color="white"
                  borderColor="gray.500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index + 1} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <Box flex="1">
                <Text color="gray.300" fontSize="sm">
                  Selected Period
                </Text>
                <Text color="white" fontSize="lg" fontWeight="bold">
                  {monthNames[formData.month - 1]} {formData.year}
                </Text>
              </Box>
            </HStack>

            {/* Weekly Data Table */}
            <Box>
              <Heading size="md" mb={4} color="white">
                Weekly Breakdown - {monthNames[formData.month - 1]} {formData.year}
              </Heading>
              <Box overflowX="auto">
                <Table variant="simple" size="sm" bg="gray.700" borderRadius="md">
                  <Thead>
                    <Tr bg="gray.600">
                      <Th color="gray.300">Week</Th>
                      <Th color="gray.300" isNumeric>Targeted Qty</Th>
                      <Th color="gray.300" isNumeric>Achieved Qty</Th>
                      <Th color="gray.300" isNumeric>Consumed Manhours</Th>
                      <Th color="gray.300" isNumeric>Efficiency %</Th>
                      <Th color="gray.300" isNumeric>Expected Manhours</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {formData.weeklyData.map((week, index) => {
                      const efficiency = week.targetedQty > 0
                        ? ((week.achievedQty / week.targetedQty) * 100).toFixed(1)
                        : 0;

                      const expectedManhours = (week.achievedQty || 0) * (taskDetails?.productivity || 0);
                      const manhourVariance = (week.consumedManhours || 0) - expectedManhours;

                      return (
                        <Tr key={`week-${index}`}>
                          <Td color="white" fontWeight="semibold">
                            Week {week.week}
                          </Td>
                          
                          <Td>
                            <NumberInput
                              key={`targeted-${index}-${week.targetedQty}`}
                              value={week.targetedQty}
                              onChange={(valueString, valueNumber) =>
                                handleWeeklyDataChange(index, "targetedQty", valueNumber)
                              }
                              min={0}
                              precision={3}
                              size="sm"
                            >
                              <NumberInputField
                                bg="gray.600"
                                color="white"
                                borderColor="gray.500"
                                placeholder="0.000"
                              />
                            </NumberInput>
                          </Td>
                          
                          <Td>
                            <NumberInput
                              key={`achieved-${index}-${week.achievedQty}`}
                              value={week.achievedQty}
                              onChange={(valueString, valueNumber) =>
                                handleWeeklyDataChange(index, "achievedQty", valueNumber)
                              }
                              min={0}
                              precision={3}
                              size="sm"
                            >
                              <NumberInputField
                                bg="gray.600"
                                color="white"
                                borderColor="gray.500"
                                placeholder="0.000"
                              />
                            </NumberInput>
                          </Td>
                          
                          <Td>
                            <NumberInput
                              key={`manhours-${index}-${week.consumedManhours}`}
                              value={week.consumedManhours}
                              onChange={(valueString, valueNumber) =>
                                handleWeeklyDataChange(index, "consumedManhours", valueNumber)
                              }
                              min={0}
                              precision={3}
                              size="sm"
                            >
                              <NumberInputField
                                bg="gray.600"
                                color="white"
                                borderColor="gray.500"
                                placeholder="0.000"
                              />
                            </NumberInput>
                          </Td>
                          
                          <Td>
                            <Badge
                              colorScheme={
                                efficiency >= 100
                                  ? "green"
                                  : efficiency >= 80
                                  ? "yellow"
                                  : "red"
                              }
                            >
                              {efficiency}%
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            <VStack spacing={1} align="end">
                              <Text color="gray.300" fontSize="sm">
                                {expectedManhours.toFixed(2)}
                              </Text>
                              {manhourVariance !== 0 && (
                                <Badge
                                  colorScheme={manhourVariance > 0 ? "red" : "green"}
                                  fontSize="xs"
                                >
                                  {manhourVariance > 0 ? "+" : ""}
                                  {manhourVariance.toFixed(2)}
                                </Badge>
                              )}
                            </VStack>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Monthly Totals & Variances */}
            <HStack spacing={6} justify="space-between" p={4} bg="gray.700" borderRadius="md">
              <VStack align="start" flex="1">
                <Heading size="sm" color="white">Monthly Totals</Heading>
                <HStack spacing={4}>
                  <Stat size="sm">
                    <StatLabel color="gray.300">Targeted</StatLabel>
                    <StatNumber color="white">{totals.totalTargeted.toFixed(3)}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel color="gray.300">Achieved</StatLabel>
                    <StatNumber color="white">{totals.totalAchieved.toFixed(3)}</StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel color="gray.300">Manhours</StatLabel>
                    <StatNumber color="white">{totals.totalConsumed.toFixed(3)}</StatNumber>
                  </Stat>
                </HStack>
              </VStack>

              <VStack align="start" flex="1">
                <Heading size="sm" color="white">Variances</Heading>
                <HStack spacing={4}>
                  <Stat size="sm">
                    <StatLabel color="gray.300">Quantity</StatLabel>
                    <StatNumber color={variances.varianceQuantity >= 0 ? "green.400" : "red.400"}>
                      {variances.varianceQuantity >= 0 ? "+" : ""}
                      {variances.varianceQuantity.toFixed(3)}
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel color="gray.300">Manhours</StatLabel>
                    <StatNumber color={variances.varianceManhours >= 0 ? "red.400" : "green.400"}>
                      {variances.varianceManhours >= 0 ? "+" : ""}
                      {variances.varianceManhours.toFixed(3)}
                    </StatNumber>
                  </Stat>
                </HStack>
              </VStack>

              <VStack align="end" flex="1">
                <Text color="gray.300" fontSize="sm">Overall Efficiency</Text>
                <Progress
                  value={isNaN(overallEfficiency) ? 0 : overallEfficiency}
                  colorScheme={
                    overallEfficiency >= 100
                      ? "green"
                      : overallEfficiency >= 80
                      ? "yellow"
                      : "red"
                  }
                  size="lg"
                  w="full"
                  bg="gray.600"
                />
                <Text color="white" fontWeight="bold">
                  {isNaN(overallEfficiency) ? "0.0" : overallEfficiency.toFixed(1)}%
                </Text>
              </VStack>
            </HStack>

            {/* Additional Fields */}
            <HStack spacing={4}>
              <FormControl>
                <FormLabel color="gray.300">Additional Lapsed Manhours</FormLabel>
                <NumberInput
                  value={formData.additionalLapsedManhours}
                  onChange={(_, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalLapsedManhours: value || 0,
                    }))
                  }
                  min={0}
                  precision={3}
                >
                  <NumberInputField
                    bg="gray.600"
                    color="white"
                    borderColor="gray.500"
                    placeholder="0.000"
                  />
                </NumberInput>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color="gray.300">Justification / Remarks</FormLabel>
              <Textarea
                value={formData.justification}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    justification: e.target.value,
                  }))
                }
                placeholder="Explain any variances, delays, or issues..."
                maxLength={1000}
                bg="gray.600"
                color="white"
                borderColor="gray.500"
                _placeholder={{ color: "gray.400" }}
                rows={4}
              />
              <Text color="gray.400" fontSize="xs" mt={1}>
                {formData.justification.length}/1000 characters
              </Text>
            </FormControl>

            {/* Validation Alert */}
            {totals.totalTargeted === 0 && (
              <Alert status="warning">
                <AlertIcon />
                <AlertDescription>
                  Please enter at least some targeted quantities to proceed.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <HStack spacing={4} justify="end" pt={4}>
              <Button variant="outline" onClick={onCancel} color="gray.300">
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Saving..."
                isDisabled={totals.totalTargeted === 0}
              >
                Save Weekly Progress
              </Button>
            </HStack>

          </VStack>
        </form>
      </CardBody>
    </Card>
  );
};

export default WeeklyProgressForm;
