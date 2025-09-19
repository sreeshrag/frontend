// Number formatting utilities
export const formatNumber = (number, precision = 1) => {
  if (number === null || number === undefined) return '0';
  
  const num = parseFloat(number);
  if (isNaN(num)) return '0';
  
  if (num === 0) return '0';
  if (num < 0.001) return '< 0.001';
  if (num < 1) return num.toFixed(3);
  if (num < 10) return num.toFixed(precision);
  
  return Math.round(num).toLocaleString();
};

// Currency formatting
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(num);
};

// Date formatting
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    return dateString;
  }
};

// Percentage formatting
export const formatPercentage = (value, precision = 1) => {
  if (value === null || value === undefined) return '0%';
  
  const num = parseFloat(value);
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(precision)}%`;
};

// Duration formatting (manhours to readable format)
export const formatDuration = (hours) => {
  if (!hours || hours === 0) return '0 hrs';
  
  const num = parseFloat(hours);
  if (isNaN(num)) return '0 hrs';
  
  if (num < 1) return `${(num * 60).toFixed(0)} min`;
  if (num < 24) return `${num.toFixed(1)} hrs`;
  
  const days = Math.floor(num / 24);
  const remainingHours = num % 24;
  
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  return `${days}d ${remainingHours.toFixed(1)}h`;
};

// Status color mapping
export const getStatusColor = (status) => {
  const colors = {
    planning: 'blue',
    active: 'green',
    on_hold: 'yellow',
    completed: 'purple',
    cancelled: 'red',
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  };
  
  return colors[status] || 'gray';
};

// Progress color based on percentage
export const getProgressColor = (percentage) => {
  const num = parseFloat(percentage);
  if (isNaN(num)) return 'gray';
  
  if (num >= 90) return 'green';
  if (num >= 70) return 'blue';
  if (num >= 50) return 'yellow';
  if (num >= 30) return 'orange';
  return 'red';
};

// Efficiency color based on ratio
export const getEfficiencyColor = (efficiency) => {
  const num = parseFloat(efficiency);
  if (isNaN(num)) return 'gray';
  
  if (num >= 100) return 'green';
  if (num >= 80) return 'blue';
  if (num >= 60) return 'yellow';
  return 'red';
};
