import React from 'react';
import {
  Grid,
  GridItem,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  HStack,
  Badge
} from '@chakra-ui/react';
import {
  FiDollarSign,
  FiTarget,
  FiActivity,
  FiClock
} from 'react-icons/fi';

const BudgetSummary = ({ summary }) => {
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num || 0);
  };

  // ✅ UPDATED: Progress color based on quantity completion
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    return 'red';
  };

  // ✅ UPDATED: CPI-based status color
  const getCPIColor = (cpi) => {
    if (cpi >= 1.0) return 'green';
    if (cpi >= 0.9) return 'yellow';
    return 'red';
  };

  return (
    <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
      {/* ✅ UPDATED: Total Budgeted Manhours with quantity context */}
      {/* <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          <Stat>
            <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
              <FiClock /> Planned Manhours
            </StatLabel>
            <StatNumber color="white">
              {formatNumber(summary.totalBudgeted)} hrs
            </StatNumber>
            <StatHelpText color="gray.400">
              Total budgeted for all work
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card> */}

      {/* ✅ UPDATED: Quantity-based Progress */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          <Stat>
            <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
              <FiTarget /> Quantity Progress
            </StatLabel>
            <StatNumber color="white">
              {formatNumber(summary.progressPercentage)}%
            </StatNumber>
            <StatHelpText color="gray.400">
              <HStack spacing={2} mt={2}>
                <Progress
                  value={summary.progressPercentage}
                  colorScheme={getProgressColor(summary.progressPercentage)}
                  size="sm"
                  flex="1"
                  bg="gray.700"
                />
                <Badge variant="outline" fontSize="xs">
                  Installation Progress
                </Badge>
              </HStack>
              <Badge colorScheme="blue" variant="subtle" fontSize="xs" mt={1}>
                Based on completed quantities
              </Badge>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* ✅ UPDATED: CPI-based Efficiency */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          <Stat>
            <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
              <FiActivity /> Cost Performance Index
            </StatLabel>
            <StatNumber color="white">
              {formatNumber(summary.efficiencyPercentage || summary.cpi || 0)}
            </StatNumber>
            <StatHelpText color="gray.400">
              <Badge
                colorScheme={getCPIColor(summary.efficiencyPercentage / 100 || summary.cpi || 0)}
                variant="subtle"
              >
                {(summary.efficiencyPercentage || summary.cpi * 100 || 0) >= 100 ? "Under Budget" : 
                 (summary.efficiencyPercentage || summary.cpi * 100 || 0) >= 90 ? "Near Budget" : "Over Budget"}
              </Badge>
              <Badge colorScheme="gray" variant="outline" fontSize="xs" mt={1}>
                Quantity-based CPI
              </Badge>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* ✅ UPDATED: Quantity-based Task Completion */}
      <Card bg="gray.800" borderColor="gray.700">
        <CardBody>
          <Stat>
            <StatLabel color="gray.300" display="flex" alignItems="center" gap={2}>
              <FiTarget /> Task Installation
            </StatLabel>
            <StatNumber color="white">
              {summary.completedTasks} / {summary.totalTasks}
            </StatNumber>
            <StatHelpText color="gray.400">
              <Badge
                colorScheme={getProgressColor(summary.completionPercentage)}
                variant="subtle"
              >
                {formatNumber(summary.completionPercentage)}% Installed
              </Badge>
              <HStack spacing={2} mt={2}>
                <Badge colorScheme="green" variant="outline" fontSize="xs">
                  {summary.completedTasks || 0} Fully Installed
                </Badge>
                <Badge colorScheme="yellow" variant="outline" fontSize="xs">
                  {(summary.totalTasks - summary.completedTasks) || 0} Remaining
                </Badge>
              </HStack>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </Grid>
  );
};

export default BudgetSummary;
