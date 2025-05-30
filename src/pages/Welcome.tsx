import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      height: '100vh',
      bgcolor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      <Box sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Volunteer
          </Typography>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 'bold',
              pl: { xs: 6, md: 12.5 },
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Connect
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        width: '100%',
        pb: 11.25, // Equivalent to paddingBottom: 90 in React Native
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0
      }}>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{
            bgcolor: '#F4A7A3',
            borderRadius: '25px',
            py: 1.5,
            px: 2.5,
            width: '40%',
            maxWidth: '200px',
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#e79490'
            }
          }}
          endIcon={<ArrowForward />}
        >
          <Typography fontWeight="bold" fontSize="1rem">
            Next
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default Welcome;