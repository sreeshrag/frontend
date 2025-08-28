import { extendTheme } from '@chakra-ui/react';

// Custom color palette for premium look
const colors = {
  brand: {
    50: '#E6F3FF',
    100: '#B8D9FF',
    200: '#8AC0FF',
    300: '#5CA6FF',
    400: '#2E8CFF',
    500: '#0073FF', // Primary brand color
    600: '#005CE6',
    700: '#0044B3',
    800: '#002D80',
    900: '#001E4D',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: {
    50: '#F0FDF4',
    500: '#10B981',
    600: '#059669',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
};

// Premium typography
const fonts = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

// Component style overrides for premium look
const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'md',
      transition: 'all 0.2s',
      _focus: {
        boxShadow: '0 0 0 3px rgba(0, 115, 255, 0.1)',
      },
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: {
          bg: 'brand.600',
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 115, 255, 0.15)',
        },
        _active: {
          bg: 'brand.700',
          transform: 'translateY(0)',
        },
      },
      ghost: {
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-1px)',
        },
      },
      outline: {
        borderColor: 'brand.500',
        color: 'brand.500',
        _hover: {
          bg: 'brand.50',
          transform: 'translateY(-1px)',
        },
      },
    },
    sizes: {
      sm: {
        h: '8',
        minW: '8',
        fontSize: 'sm',
        px: '3',
      },
      md: {
        h: '10',
        minW: '10',
        fontSize: 'md',
        px: '4',
      },
      lg: {
        h: '12',
        minW: '12',
        fontSize: 'lg',
        px: '6',
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: 'gray.200',
        _dark: {
          borderColor: 'gray.700',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'gray.200',
          _dark: { borderColor: 'gray.700' },
          fontSize: 'sm',
          fontWeight: '600',
          textTransform: 'none',
          letterSpacing: 'normal',
        },
        td: {
          borderColor: 'gray.200',
          _dark: { borderColor: 'gray.700' },
        },
      },
    },
  },
  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          borderColor: 'gray.300',
          _hover: {
            borderColor: 'gray.400',
          },
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px #0073FF',
          },
        },
      },
    },
  },
};

// Global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
    },
  }),
};

// Theme configuration
const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  config,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
});

export default theme;
