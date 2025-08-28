import React from 'react';
import { 
  Card, 
  CardBody as CardContent, 
  Text as Typography, 
  Box, 
  Avatar 
} from '@chakra-ui/react';
import { 
  FiTrendingUp as TrendingUp, 
  FiTrendingDown as TrendingDown 
} from 'react-icons/fi';


const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
  const isPositiveTrend = trend === 'up';
  
  return (
    <Card className="card-hover" sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {trendValue && (
              <Box display="flex" alignItems="center" mt={1}>
                {isPositiveTrend ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={isPositiveTrend ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          {/* <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar> */}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
