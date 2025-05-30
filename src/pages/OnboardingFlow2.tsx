import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const OnboardingFlow2: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#fff',
      justifyContent: 'flex-end',
    }}>
      <Box sx={{
        width: '80%',
        height: '60%',
        alignSelf: 'center',
        marginBottom: -6.25,
        backgroundImage: `url('/assets/onboarding-bg.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />

      <Box sx={{
        width: '100%',
        height: '35%',
        backgroundColor: 'rgba(244, 167, 163, 0.9)',
        borderTopLeftRadius: '50px',
        borderTopRightRadius: '50px',
        padding: 2.5,
        alignItems: 'center',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="white" 
          textAlign="center" 
          sx={{ mb: 6.25 }}
        >
          We Have Modern Events Calendar Feature
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="white" 
          textAlign="center" 
          sx={{ mb: 2.5 }}
        >
          In publishing and graphic design, Lorem is a placeholder text commonly
        </Typography>

        <Box sx={{
          position: 'absolute',
          bottom: 6.25,
          width: '100%',
          paddingX: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Button 
            color="inherit" 
            sx={{ color: 'white', fontSize: '1.125rem' }}
            onClick={() => navigate('/login')}
          >
            Skip
          </Button>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'white', 
              mx: 0.5, 
              opacity: 0.5 
            }} />
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'white', 
              mx: 0.5, 
              opacity: 1  // This dot is active for onboarding 2
            }} />
            <Box sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              bgcolor: 'white', 
              mx: 0.5, 
              opacity: 0.5 
            }} />
          </Box>

          <Button 
            color="inherit" 
            sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}
            onClick={() => navigate('/onboarding-flow-3')}
          >
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default OnboardingFlow2;