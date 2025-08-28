import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { FiRefreshCw as Refresh } from 'react-icons/fi';


const ErrorState = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      gap={2}
    >
      <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
        <Typography variant="h6" gutterBottom>
          Error
        </Typography>
        <Typography variant="body2">
          {message}
        </Typography>
      </Alert>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
